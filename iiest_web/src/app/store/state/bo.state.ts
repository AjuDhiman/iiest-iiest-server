import { Injectable } from "@angular/core";
import { Selector,Action, StateContext, State } from "@ngxs/store";
import { GetdataService } from "src/app/services/getdata.service";
import { tap } from "rxjs";
import { RegisterService } from "src/app/services/register.service";
import { DeleteBo, GetBos, SetBosLoadedFalse, UpdateBos } from "../actions/bo.action";

//State Model
export class BosStateModel {
    bos : any;
    bosLoaded : boolean;
}

//State
@State<BosStateModel>({
    name : 'bos',
    defaults :{
        bos:[],
        bosLoaded :false
    }
})

@Injectable()

export class BosState {
    constructor(private _getDataService: GetdataService,
                private _regitserService: RegisterService){}

    @Selector()
    static GetBosList(state:BosStateModel){
        return state.bos;
    }

    //Get Loaded sales Info
    @Selector()
    static bosLoaded(state:BosStateModel){
        return state.bosLoaded;
    }
    @Action(GetBos)
    GetBos({getState, setState}:StateContext<BosStateModel>){
         this._getDataService.getClientList().pipe(tap(res => {
            const state = getState();
            setState({
                ...state,
                bos:res.clientList,
                bosLoaded:true
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

    @Action(SetBosLoadedFalse)
    SetSalesLoadedFalse({getState, setState}:StateContext<BosStateModel>){
        
        const state = getState();

        setState({
            ...state,
            bosLoaded: false
        })
    }

    @Action(UpdateBos)
    updateBos({getState, setState}:StateContext<BosStateModel>, {objId, payload}: UpdateBos){
        
        const state = getState();
        const updatedBos = state.bos.map((bo: any)=>
            bo._id === objId ? {...payload} : bo
        )

        setState({
            ...state,
            bos: updatedBos
        })
    }

    @Action(DeleteBo)
    deleteBo({getState, setState}:StateContext<BosStateModel>, {objId}: DeleteBo){

        const state = getState();
        const updatedSalesList = state.bos.filter((sale: any) => sale._id !== objId);

        setState({
            ...state,
            bos: updatedSalesList
        })
    }
}