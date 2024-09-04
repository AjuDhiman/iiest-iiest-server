
export class UpdateGSTList {
    static readonly type = '[GstList] Update';
    constructor(public objId: string, public payload: any){}
}

export class GetGSTList {
    static readonly type = '[GSTList] Get';
}

export class SetGSTListLoadedFalse {
    static readonly type = '[GSTList] Get';
}

export class ClearGSTList {
    static readonly type = '[Bo] Delete';
}