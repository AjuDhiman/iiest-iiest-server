import { Injectable } from "@angular/core";
import { Selector,Action, StateContext, State } from "@ngxs/store";
import { GetdataService } from "src/app/services/getdata.service";
import { tap } from "rxjs";
import { RegisterService } from "src/app/services/register.service";
import { DeleteBo, GetBos, SetBosLoadedFalse, UpdateBos } from "../actions/bo.action";
import { GetGSTList, SetGSTListLoadedFalse } from "../actions/gstlist.action";

//State Model
export class GSTListStateModel {
    gstList : any;
    gstlistLoaded : boolean;
}

//State
@State<GSTListStateModel>({
    name : 'gstlist',
    defaults :{
        gstList:[],
        gstlistLoaded :false
    }
})

@Injectable()

export class GSTListState {
    constructor(private _getDataService: GetdataService,
                private _regitserService: RegisterService){}

    @Selector()
    static GetGSTList(state:GSTListStateModel){
        return state.gstList;
    }

    //Get Loaded sales Info
    @Selector()
    static GSTListLoaded(state:GSTListStateModel){
        return state.gstlistLoaded;
    }
    @Action(GetGSTList)
    GetBos({getState, setState}:StateContext<GSTListStateModel>){
         this._getDataService.getInvoiceList().pipe(tap(res => {
            const state = getState();
            setState({
                ...state,
                gstList:res.invoiceList,
                gstlistLoaded:true
            })
        })).subscribe({
            error: (err)=>{
                let errorObj = err.error
                if(errorObj.userError){
                    this._regitserService.signout();
                }
            }
        })
        
    }

    @Action(SetGSTListLoadedFalse)
    SetGSTListLoadedFalse({getState, setState}:StateContext<GSTListStateModel>){
        
        const state = getState();

        setState({
            ...state,
            gstlistLoaded: false
        })
    }

    @Action(UpdateBos)
    updateBos({getState, setState}:StateContext<GSTListStateModel>, {objId, payload}: UpdateBos){
        
        
    }
}