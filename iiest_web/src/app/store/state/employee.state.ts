import { Injectable } from "@angular/core";
import { Selector,Action, StateContext, State } from "@ngxs/store";

import { Employee } from "src/app/utils/registerinterface";
import { DeleteEmployee, GetEmployee, UpdateEmployee } from "../actions/employee.action";
import { GetdataService } from "src/app/services/getdata.service";
import { tap } from "rxjs";

//State Model
export class EmployeeStateModel {
    employees : Employee[];
    employeeLoaded : boolean
}

//State
@State<EmployeeStateModel>({
    name : 'employee',
    defaults :{
        employees:[],
        employeeLoaded :false
    }
})

@Injectable()

export class EmployeeState {
    constructor(private _getDataService: GetdataService){}

    @Selector()
    static GetEmployeeList(state:EmployeeStateModel){
        return state.employees;
    }

    //Get Loaded employee Info
    @Selector()
    static employeeLoaded(state:EmployeeStateModel){
        return state.employeeLoaded;
    }
    @Action(GetEmployee)
    getEmployees({getState, setState}:StateContext<EmployeeStateModel>){
        console.log('State Action');
        return this._getDataService.getEmployeeData().pipe(tap(res => {
            const state = getState();
            setState({
                ...state,
                employees:res.employeesData,
                employeeLoaded:true
            })
        }))
        
       /*  this._getDataService.getGenericData().subscribe( {
            next: (res) => { 
              console.log(res)
            },
            error: (err) => {
              let errorObj = err.error
              this.error = true;
              this.errorMgs = errorObj.message
            },
            complete: () =>{ 
              //console.info('complete')
            } 
        }) */
    }
    @Action(UpdateEmployee)
    updateEmployee({getState, setState}:StateContext<EmployeeStateModel>, {payload}: UpdateEmployee){
        console.log('Update Employee Action')

        //const state = getState();
        //console.log(state);
        //const updatedEmployeeList = state.employees.filter((emp: any) => emp._id !== objId);

        /* setState({
            ...state,
            employees: updatedEmployeeList
        })
        console.log(getState()) */
    }

    @Action(DeleteEmployee)
    deleteEmployee({getState, setState}:StateContext<EmployeeStateModel>, {objId}: DeleteEmployee){
        console.log('Delete Employee Action')

        const state = getState();
        console.log(state);
        const updatedEmployeeList = state.employees.filter((emp: any) => emp._id !== objId);

        setState({
            ...state,
            employees: updatedEmployeeList
        })
        console.log(getState())
    }
}