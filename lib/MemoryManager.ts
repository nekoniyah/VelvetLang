// Memory Manager for variable storage
export class MemoryManager {
    private memory: Map<string, { type: string; value: any }> = new Map();

    setVariable(name: string, type: string, value: any) {
        this.memory.set(name, { type, value });
    }

    getVariable(name: string) {
        return this.memory.get(name);
    }

    hasVariable(name: string) {
        return this.memory.has(name);
    }
}
