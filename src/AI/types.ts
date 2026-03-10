export interface Action {
    type: "text" | "skill" | "tool" | "memory";
    content: string | ToolInput | SkillInput;
}

export interface ToolInput {
    tool: string;
    operation: string;
    params?: any; 
}

export interface SkillInput {
    skill: string;
    operation: string;
    params?: any;
}