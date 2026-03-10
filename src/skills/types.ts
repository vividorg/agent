export interface SkillOperation {
    name: string,
    description: string,
    params?: Record<string, string>;
}

export interface Skill {
    name: string,
    description: string,
    operation: SkillOperation[],
    execute(operation: any, params: any): Promise<any>;
}