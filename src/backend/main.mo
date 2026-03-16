import List "mo:core/List";
import Map "mo:core/Map";
import Text "mo:core/Text";
import Order "mo:core/Order";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import Nat "mo:core/Nat";
import Array "mo:core/Array";
import Iter "mo:core/Iter";

import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";
import MixinStorage "blob-storage/Mixin";
import Storage "blob-storage/Storage";



actor {
  include MixinStorage();

  // Preserved for upgrade compatibility - do not remove
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  public type AppRole = {
    #admin;
    #teacher;
    #student;
  };

  public type UserProfile = {
    username : Text;
    role : AppRole;
    passwordHash : Text;
  };

  public type Schedule = {
    teacher : Text;
    day : Text;
    time : Text;
    subject : Text;
    schoolClass : Nat;
  };

  public type VideoLecture = {
    id : Nat;
    title : Text;
    url : Text;
    schoolClass : Nat;
    subject : Text;
    teacher : Text;
  };

  public type Note = {
    id : Nat;
    title : Text;
    schoolClass : Nat;
    subject : Text;
    teacher : Text;
    blob : Storage.ExternalBlob;
  };

  public type MCQQuestion = {
    text : Text;
    options : [Text];
    correctAnswer : Nat;
  };

  public type Test = {
    id : Nat;
    title : Text;
    schoolClass : Nat;
    subject : Text;
    teacher : Text;
    questions : [MCQQuestion];
  };

  public type Doubt = {
    id : Nat;
    question : Text;
    schoolClass : Nat;
    subject : Text;
    student : Text;
    answer : ?Text;
    teacher : ?Text;
  };

  public type TestAttempt = {
    id : Nat;
    student : Text;
    testId : Nat;
    answers : [Nat];
    score : Nat;
  };

  public type LiveClass = {
    id : Nat;
    title : Text;
    subject : Text;
    schoolClass : Nat;
    teacher : Text;
    date : Text;
    time : Text;
    joinLink : Text;
  };

  public type AttendanceRecord = {
    studentId : Text;
    date : Text;
    status : Text;
    schoolClass : Nat;
    subject : Text;
  };

  module VideoLecture {
    public func compareByTitle(a : VideoLecture, b : VideoLecture) : Order.Order {
      Text.compare(a.title, b.title);
    };
  };

  let userProfiles = Map.empty<Principal, UserProfile>();
  let usernameToProfile = Map.empty<Text, UserProfile>();
  let usernameToPrincipal = Map.empty<Text, Principal>();

  let schedules = List.empty<Schedule>();
  let videoLectures = List.empty<VideoLecture>();
  let notes = List.empty<Note>();
  let tests = List.empty<Test>();
  let doubts = List.empty<Doubt>();
  let testAttempts = List.empty<TestAttempt>();
  let liveClasses = List.empty<LiveClass>();
  let attendance = List.empty<AttendanceRecord>();

  var nextVideoId : Nat = 0;
  var nextNoteId : Nat = 0;
  var nextTestId : Nat = 0;
  var nextDoubtId : Nat = 0;
  var nextAttemptId : Nat = 0;
  var nextLiveClassId : Nat = 0;

  func hashPassword(password : Text) : Text { password };

  func requireAdmin(caller : Principal) {
    switch (userProfiles.get(caller)) {
      case (?p) {
        if (p.role != #admin) { Runtime.trap("Unauthorized: Only admins can perform this action") };
      };
      case (null) { Runtime.trap("Unauthorized: Not logged in") };
    };
  };

  func requireTeacher(caller : Principal) : Text {
    switch (userProfiles.get(caller)) {
      case (?p) {
        if (p.role != #teacher) { Runtime.trap("Unauthorized: Only teachers can perform this action") };
        p.username;
      };
      case (null) { Runtime.trap("Unauthorized: Not logged in") };
    };
  };

  func requireStudent(caller : Principal) : Text {
    switch (userProfiles.get(caller)) {
      case (?p) {
        if (p.role != #student) { Runtime.trap("Unauthorized: Only students can perform this action") };
        p.username;
      };
      case (null) { Runtime.trap("Unauthorized: Not logged in") };
    };
  };

  func requireUser(caller : Principal) : (Text, AppRole) {
    switch (userProfiles.get(caller)) {
      case (?p) { (p.username, p.role) };
      case (null) { Runtime.trap("Unauthorized: Not logged in") };
    };
  };

  func requireTeacherOrAdmin(caller : Principal) : (Text, AppRole) {
    switch (userProfiles.get(caller)) {
      case (?p) {
        if (p.role != #teacher and p.role != #admin) {
          Runtime.trap("Unauthorized: Only teachers or admins can perform this action");
        };
        (p.username, p.role);
      };
      case (null) { Runtime.trap("Unauthorized: Not logged in") };
    };
  };

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    switch (userProfiles.get(caller)) {
      case (?p) {
        if (caller != user and p.role != #admin) {
          Runtime.trap("Unauthorized: Can only view your own profile");
        };
        userProfiles.get(user);
      };
      case (null) { null };
    };
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    switch (userProfiles.get(caller)) {
      case (?existing) {
        let updated = { username = existing.username; role = existing.role; passwordHash = profile.passwordHash };
        userProfiles.add(caller, updated);
      };
      case (null) { Runtime.trap("Profile does not exist") };
    };
  };

  public shared ({ caller }) func login(username : Text, password : Text) : async Bool {
    let passwordHash = hashPassword(password);

    if (username == "admin" and password == "1122") {
      let adminProfile : UserProfile = switch (usernameToProfile.get("admin")) {
        case (?existing) { existing };
        case (null) {
          let p = { username = "admin"; role = #admin : AppRole; passwordHash = hashPassword("1122") };
          usernameToProfile.add("admin", p);
          p;
        };
      };
      userProfiles.add(caller, adminProfile);
      usernameToPrincipal.add("admin", caller);
      return true;
    };

    switch (usernameToProfile.get(username)) {
      case (?profile) {
        if (profile.passwordHash == passwordHash) {
          userProfiles.add(caller, profile);
          usernameToPrincipal.add(username, caller);
          return true;
        };
        return false;
      };
      case (null) { return false };
    };
  };

  public shared ({ caller }) func createUser(username : Text, password : Text, role : AppRole) : async () {
    requireAdmin(caller);
    switch (usernameToProfile.get(username)) {
      case (?_) { Runtime.trap("Username already exists") };
      case (null) {};
    };
    let profile = { username; role; passwordHash = hashPassword(password) };
    usernameToProfile.add(username, profile);
  };

  public shared ({ caller }) func updateUser(username : Text, password : ?Text, role : ?AppRole) : async () {
    requireAdmin(caller);
    switch (usernameToProfile.get(username)) {
      case (?existing) {
        let updated = {
          username = existing.username;
          role = switch (role) { case (?r) { r }; case (null) { existing.role } };
          passwordHash = switch (password) { case (?p) { hashPassword(p) }; case (null) { existing.passwordHash } };
        };
        usernameToProfile.add(username, updated);
        switch (usernameToPrincipal.get(username)) {
          case (?principal) { userProfiles.add(principal, updated) };
          case (null) {};
        };
      };
      case (null) { Runtime.trap("User not found") };
    };
  };

  public shared ({ caller }) func deleteUser(username : Text) : async () {
    requireAdmin(caller);
    if (username == "admin") { Runtime.trap("Cannot delete admin user") };
    ignore usernameToProfile.remove(username);
    switch (usernameToPrincipal.get(username)) {
      case (?principal) {
        ignore userProfiles.remove(principal);
        ignore usernameToPrincipal.remove(username);
      };
      case (null) {};
    };
  };

  public query ({ caller }) func listUsers() : async [(Text, AppRole)] {
    requireAdmin(caller);
    usernameToProfile.entries().toArray().map<(Text, UserProfile), (Text, AppRole)>(
      func((username, profile)) { (username, profile.role) }
    );
  };

  public shared ({ caller }) func addSchedule(schedule : Schedule) : async () {
    requireAdmin(caller);
    schedules.add(schedule);
  };

  public shared ({ caller }) func updateSchedule(index : Nat, schedule : Schedule) : async () {
    requireAdmin(caller);
    if (index >= schedules.size()) { Runtime.trap("Invalid index") };
    let newSchedules = List.empty<Schedule>();
    var i = 0;
    for (s in schedules.values()) {
      if (i == index) { newSchedules.add(schedule) } else { newSchedules.add(s) };
      i += 1;
    };
    schedules.clear();
    schedules.addAll(newSchedules.values());
  };

  public shared ({ caller }) func deleteSchedule(index : Nat) : async () {
    requireAdmin(caller);
    if (index >= schedules.size()) { Runtime.trap("Invalid index") };
    let newSchedules = List.empty<Schedule>();
    var i = 0;
    for (s in schedules.values()) {
      if (i != index) { newSchedules.add(s) };
      i += 1;
    };
    schedules.clear();
    schedules.addAll(newSchedules.values());
  };

  public query ({ caller }) func getSchedules() : async [Schedule] {
    schedules.toArray();
  };

  public shared ({ caller }) func addVideo(title : Text, url : Text, schoolClass : Nat, subject : Text) : async () {
    let teacher = requireTeacher(caller);
    let videoLecture = { id = nextVideoId; title; url; schoolClass; subject; teacher };
    videoLectures.add(videoLecture);
    nextVideoId += 1;
  };

  public query ({ caller }) func getVideos() : async [VideoLecture] {
    let (_, _role) = requireUser(caller);
    videoLectures.toArray().sort(VideoLecture.compareByTitle);
  };

  public query ({ caller }) func getVideosByClass(schoolClass : Nat) : async [VideoLecture] {
    let (_, _role) = requireUser(caller);
    videoLectures.values().filter(func(v) { v.schoolClass == schoolClass }).toArray();
  };

  public shared ({ caller }) func addNote(title : Text, schoolClass : Nat, subject : Text, blob : Storage.ExternalBlob) : async () {
    let teacher = requireTeacher(caller);
    let note = { id = nextNoteId; title; schoolClass; subject; teacher; blob };
    notes.add(note);
    nextNoteId += 1;
  };

  public query ({ caller }) func getNotes() : async [Note] {
    let (_, _role) = requireUser(caller);
    notes.toArray();
  };

  public query ({ caller }) func getNotesByClass(schoolClass : Nat) : async [Note] {
    let (_, _role) = requireUser(caller);
    notes.values().filter(func(n) { n.schoolClass == schoolClass }).toArray();
  };

  public shared ({ caller }) func addTest(title : Text, schoolClass : Nat, subject : Text, questions : [MCQQuestion]) : async () {
    let teacher = requireTeacher(caller);
    let test = { id = nextTestId; title; schoolClass; subject; teacher; questions };
    tests.add(test);
    nextTestId += 1;
  };

  public query ({ caller }) func getTests() : async [Test] {
    let (_, _role) = requireUser(caller);
    tests.toArray();
  };

  public query ({ caller }) func getTestsByClass(schoolClass : Nat) : async [Test] {
    let (_, _role) = requireUser(caller);
    tests.values().filter(func(t) { t.schoolClass == schoolClass }).toArray();
  };

  public shared ({ caller }) func submitAttempt(testId : Nat, answers : [Nat], score : Nat) : async () {
    let student = requireStudent(caller);
    let attempt = { id = nextAttemptId; student; testId; answers; score };
    testAttempts.add(attempt);
    nextAttemptId += 1;
  };

  public query ({ caller }) func getStudentAttempts(student : Text) : async [TestAttempt] {
    let (username, role) = requireUser(caller);
    switch (role) {
      case (#student) {
        if (username != student) { Runtime.trap("Unauthorized: Can only view your own attempts") };
      };
      case (_) {};
    };
    testAttempts.values().filter(func(a) { a.student == student }).toArray();
  };

  public shared ({ caller }) func postDoubt(question : Text, schoolClass : Nat, subject : Text) : async () {
    let student = requireStudent(caller);
    let doubt = { id = nextDoubtId; question; schoolClass; subject; student; answer = null; teacher = null };
    doubts.add(doubt);
    nextDoubtId += 1;
  };

  public shared ({ caller }) func answerDoubt(doubtId : Nat, answer : Text) : async () {
    let teacher = requireTeacher(caller);
    let newDoubts = List.empty<Doubt>();
    var found = false;
    for (d in doubts.values()) {
      if (d.id == doubtId) {
        found := true;
        newDoubts.add({ id = d.id; question = d.question; schoolClass = d.schoolClass; subject = d.subject; student = d.student; answer = ?answer; teacher = ?teacher });
      } else {
        newDoubts.add(d);
      };
    };
    if (not found) { Runtime.trap("Doubt not found") };
    doubts.clear();
    doubts.addAll(newDoubts.values());
  };

  public query ({ caller }) func getDoubts() : async [Doubt] {
    let (username, role) = requireUser(caller);
    switch (role) {
      case (#student) { doubts.values().filter(func(d) { d.student == username }).toArray() };
      case (_) { doubts.toArray() };
    };
  };

  public query ({ caller }) func getUnansweredDoubts() : async [Doubt] {
    let _ = requireTeacher(caller);
    doubts.values().filter(func(d) { d.answer == null }).toArray();
  };

  public shared ({ caller }) func addLiveClass(title : Text, subject : Text, schoolClass : Nat, date : Text, time : Text, joinLink : Text) : async () {
    let teacher = requireTeacher(caller);
    let lc = { id = nextLiveClassId; title; subject; schoolClass; teacher; date; time; joinLink };
    liveClasses.add(lc);
    nextLiveClassId += 1;
  };

  public query ({ caller }) func getLiveClasses() : async [LiveClass] {
    let (_, _role) = requireUser(caller);
    liveClasses.toArray();
  };

  public query ({ caller }) func getLiveClassesByClass(schoolClass : Nat) : async [LiveClass] {
    let (_, _role) = requireUser(caller);
    liveClasses.values().filter(func(lc) { lc.schoolClass == schoolClass }).toArray();
  };

  public shared ({ caller }) func deleteLiveClass(id : Nat) : async () {
    let (_, role) = requireUser(caller);
    switch (role) {
      case (#admin) {};
      case (#teacher) {};
      case (_) { Runtime.trap("Unauthorized") };
    };
    let remaining = List.empty<LiveClass>();
    for (lc in liveClasses.values()) {
      if (lc.id != id) { remaining.add(lc) };
    };
    liveClasses.clear();
    liveClasses.addAll(remaining.values());
  };

  // New Attendance functions
  public shared ({ caller }) func markAttendance(records : [AttendanceRecord]) : async () {
    let _teacher = requireTeacher(caller);
    for (record in records.values()) { attendance.add(record) };
  };

  public query ({ caller }) func getAttendanceByStudent(studentId : Text, year : Text, month : Text) : async [AttendanceRecord] {
    let (username, role) = requireUser(caller);
    switch (role) {
      case (#student) {
        if (username != studentId) { Runtime.trap("Unauthorized: Can only view your own records") };
      };
      case (_) {};
    };
    attendance.values().filter(func(a) { a.studentId == studentId }).toArray();
  };

  public query ({ caller }) func getAttendanceByClass(schoolClass : Nat, date : Text) : async [AttendanceRecord] {
    let (_, _) = requireTeacherOrAdmin(caller);
    attendance.values().filter(func(a) { a.schoolClass == schoolClass and a.date == date }).toArray();
  };

  public query ({ caller }) func getMonthlyAttendanceByClass(schoolClass : Nat, year : Text, month : Text) : async [AttendanceRecord] {
    let (_, _) = requireTeacherOrAdmin(caller);
    attendance.values().filter(func(a) { a.schoolClass == schoolClass }).toArray();
  };
};
