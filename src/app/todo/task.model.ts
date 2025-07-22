export interface Task{
    id:string,
    completed:boolean,
    text:string,
    userId?:string,
}
export type NewTask = Omit<Task, 'id'>;