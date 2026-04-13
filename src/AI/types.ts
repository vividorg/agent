export interface MemoryInput {
    operation: "append" | "replace";
    content: string;
}

export interface Action {
    type: "text" | "skill" | "tool" | "memory";
    content: string | ToolInput | SkillInput | MemoryInput;
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