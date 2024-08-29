
export class AddBo {
    static readonly type = '[Bo] Add';
    constructor(public payload:any){}
}

export class UpdateBos {
    static readonly type = '[Bo] Update';
    constructor(public objId: string, public payload: any){}
}

export class DeleteBo {
    static readonly type = '[Bo] Delete';
    constructor(public objId:string){}
}

export class GetBos {
    static readonly type = '[Bo] Get';
}

export class SetBosLoadedFalse {
    static readonly type = '[Bo] Get';
}