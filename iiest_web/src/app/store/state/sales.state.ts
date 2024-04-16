import { Injectable } from "@angular/core";
import { Selector,Action, StateContext, State } from "@ngxs/store";
import { GetdataService } from "src/app/services/getdata.service";
import { tap } from "rxjs";
import { RegisterService } from "src/app/services/register.service";
import { DeleteSales, GetSales, UpdateSales } from "src/app/store/actions/sales.action";

//State Model
export class SalesStateModel {
    sales : any;
    salesLoaded : boolean
}

//State
@State<SalesStateModel>({
    name : 'sales',
    defaults :{
        sales:[],
        salesLoaded :false
    }
})

@Injectable()

export class SalesState {
    constructor(private _getDataService: GetdataService,
                private _regitserService: RegisterService){}

    @Selector()
    static GetSalesList(state:SalesStateModel){
        return state.sales;
    }

    //Get Loaded sales Info
    @Selector()
    static salesLoaded(state:SalesStateModel){
        return state.salesLoaded;
    }
    @Action(GetSales)
    getSales({getState, setState}:StateContext<SalesStateModel>){
         this._getDataService.getSalesList().pipe(tap(res => {
            const state = getState();
            setState({
                ...state,
                sales:res.salesInfo,
                salesLoaded:true
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
    @Action(UpdateSales)
    updateSales({getState, setState}:StateContext<SalesStateModel>, {objId, payload}: UpdateSales){
        
        const state = getState();
        const updatedSales = state.sales.map((sale: any)=>
        sale._id === objId ? {...sale, ...payload} : sale
        )

        setState({
            ...state,
            sales: updatedSales
        })
    }

    @Action(DeleteSales)
    deleteSales({getState, setState}:StateContext<SalesStateModel>, {objId}: DeleteSales){

        const state = getState();
        const updatedSalesList = state.sales.filter((sale: any) => sale._id !== objId);

        setState({
            ...state,
            sales: updatedSalesList
        })
    }
}