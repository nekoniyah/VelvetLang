export class MemoryManager {
    private memory: Map<string, { type: string; value: any }>;
    private functions: Map<string, { params: any[]; body: any[] }>;

    constructor() {
        this.memory = new Map();
        this.functions = new Map();
    }

    setVariable(name: string, type: string, value: any) {
        this.memory.set(name, { type, value });
    }

    getVariable(name: string) {
        return this.memory.get(name);
    }

    hasVariable(name: string) {
        return this.memory.has(name);
    }

    // Add function management methods
    setFunction(name: string, func: { params: any[]; body: any[] }) {
        this.functions.set(name, func);
    }

    getFunction(name: string) {
        return this.functions.get(name);
    }

    hasFunction(name: string) {
        return this.functions.has(name);
    }

    // Create a new scope for function calls
    createScope() {
        return new MemoryManager();
    }
}
