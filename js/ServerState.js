interface Project {
    name: string;
    id: number;
}

interface TimeRange {
    start: number;
    end: number;
}

class ServerState {
    private readonly activeProjects: Record<number, Partial<TimeRange>>;
    private readonly activeBreaks: Record<number, Partial<TimeRange>>;
    public projects: Array<Project>;
    public projectsDirty: boolean;
    constructor() {
        this.activeProjects = {};
        this.activeBreaks = {};
        this.projects = [];
        this.projectsDirty = true;
    }

    startActive(project_id){
        this.activeProjects[project_id] = {
            start: Date.now(),
            end: undefined
        }
    }
    endActive(project_id, callback){
        this.activeProjects[project_id].end = Date.now();
        let copy = this.activeProjects[project_id];
        delete this.activeProjects[project_id];

        if(callback) callback(copy);
    }
    startBreak(project_id){
        this.activeBreaks[project_id] = {
            start: Date.now(),
            end: undefined
        }
    }
    endBreak(project_id, callback){
        this.activeBreaks[project_id].end = Date.now();
        let copy = this.activeBreaks[project_id];
        delete this.activeBreaks[project_id];

        if(callback) callback(copy);
    }

    isActive(project_id){
        return this.activeProjects.hasOwnProperty(project_id);
    }
    isBreakActive(project_id){
        return this.activeBreaks.hasOwnProperty(project_id);
    }
}

module.exports = new ServerState();