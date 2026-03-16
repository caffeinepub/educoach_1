import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export class ExternalBlob {
    getBytes(): Promise<Uint8Array<ArrayBuffer>>;
    getDirectURL(): string;
    static fromURL(url: string): ExternalBlob;
    static fromBytes(blob: Uint8Array<ArrayBuffer>): ExternalBlob;
    withUploadProgress(onProgress: (percentage: number) => void): ExternalBlob;
}
export interface UserProfile {
    username: string;
    role: AppRole;
    passwordHash: string;
}
export interface MCQQuestion {
    text: string;
    correctAnswer: bigint;
    options: Array<string>;
}
export interface Test {
    id: bigint;
    title: string;
    subject: string;
    teacher: string;
    questions: Array<MCQQuestion>;
    schoolClass: bigint;
}
export interface Schedule {
    day: string;
    subject: string;
    time: string;
    teacher: string;
    schoolClass: bigint;
}
export interface TestAttempt {
    id: bigint;
    answers: Array<bigint>;
    score: bigint;
    student: string;
    testId: bigint;
}
export interface LiveClass {
    id: bigint;
    title: string;
    subject: string;
    joinLink: string;
    date: string;
    time: string;
    teacher: string;
    schoolClass: bigint;
}
export interface Doubt {
    id: bigint;
    question: string;
    subject: string;
    teacher?: string;
    answer?: string;
    student: string;
    schoolClass: bigint;
}
export interface VideoLecture {
    id: bigint;
    url: string;
    title: string;
    subject: string;
    teacher: string;
    schoolClass: bigint;
}
export interface AttendanceRecord {
    status: string;
    studentId: string;
    subject: string;
    date: string;
    schoolClass: bigint;
}
export interface Note {
    id: bigint;
    title: string;
    subject: string;
    blob: ExternalBlob;
    teacher: string;
    schoolClass: bigint;
}
export enum AppRole {
    admin = "admin",
    teacher = "teacher",
    student = "student"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addLiveClass(title: string, subject: string, schoolClass: bigint, date: string, time: string, joinLink: string): Promise<void>;
    addNote(title: string, schoolClass: bigint, subject: string, blob: ExternalBlob): Promise<void>;
    addSchedule(schedule: Schedule): Promise<void>;
    addTest(title: string, schoolClass: bigint, subject: string, questions: Array<MCQQuestion>): Promise<void>;
    addVideo(title: string, url: string, schoolClass: bigint, subject: string): Promise<void>;
    answerDoubt(doubtId: bigint, answer: string): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createUser(username: string, password: string, role: AppRole): Promise<void>;
    deleteLiveClass(id: bigint): Promise<void>;
    deleteSchedule(index: bigint): Promise<void>;
    deleteUser(username: string): Promise<void>;
    getAttendanceByClass(schoolClass: bigint, date: string): Promise<Array<AttendanceRecord>>;
    getAttendanceByStudent(studentId: string, year: string, month: string): Promise<Array<AttendanceRecord>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getDoubts(): Promise<Array<Doubt>>;
    getLiveClasses(): Promise<Array<LiveClass>>;
    getLiveClassesByClass(schoolClass: bigint): Promise<Array<LiveClass>>;
    getMonthlyAttendanceByClass(schoolClass: bigint, year: string, month: string): Promise<Array<AttendanceRecord>>;
    getNotes(): Promise<Array<Note>>;
    getNotesByClass(schoolClass: bigint): Promise<Array<Note>>;
    getSchedules(): Promise<Array<Schedule>>;
    getStudentAttempts(student: string): Promise<Array<TestAttempt>>;
    getTests(): Promise<Array<Test>>;
    getTestsByClass(schoolClass: bigint): Promise<Array<Test>>;
    getUnansweredDoubts(): Promise<Array<Doubt>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    getVideos(): Promise<Array<VideoLecture>>;
    getVideosByClass(schoolClass: bigint): Promise<Array<VideoLecture>>;
    isCallerAdmin(): Promise<boolean>;
    listUsers(): Promise<Array<[string, AppRole]>>;
    login(username: string, password: string): Promise<boolean>;
    markAttendance(records: Array<AttendanceRecord>): Promise<void>;
    postDoubt(question: string, schoolClass: bigint, subject: string): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    submitAttempt(testId: bigint, answers: Array<bigint>, score: bigint): Promise<void>;
    updateSchedule(index: bigint, schedule: Schedule): Promise<void>;
    updateUser(username: string, password: string | null, role: AppRole | null): Promise<void>;
}
