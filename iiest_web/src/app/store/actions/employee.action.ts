import { Employee, pincodeData } from "src/app/utils/registerinterface";

export class AddEmployee {
    static readonly type = '[Employee] Add';
    constructor(public payload:Employee){}
}

export class UpdateEmployee {
    static readonly type = '[Employee] Update';
    constructor(public objId: string, public payload: Employee){}
}

export class DeleteEmployee {
    static readonly type = '[Employee] Delete';
    constructor(public objId:string){}
}

export class GetEmployee {
    static readonly type = '[Employee] Get';
}

export class SetEmployeeLoadedFalse {
    static readonly type = '[Employee] Get';
}

export class GeneralData {
    static readonly type = '[Employee] General Data';
}

// export class PincodesData {
//     static readonly type = '[pincodes] General Data';
// }