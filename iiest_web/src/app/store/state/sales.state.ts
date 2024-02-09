import { Injectable } from "@angular/core";
import { Selector, Action, StateContext, State } from "@ngxs/store";
import { GetdataService } from "src/app/services/getdata.service";
import { tap } from "rxjs";
import { RegisterService } from "src/app/services/register.service";
import { sales } from "src/app/utils/registerinterface";
import { GetSales } from "../actions/sales.action";

//State Model
export class SalesStateModel {
    sales: sales[];
    salesLoaded: boolean
}

//State
@State<SalesStateModel>({
    name: 'sales',
    defaults: {
        sales: [],
        salesLoaded: false
    }
})

@Injectable()

export class SalesState {
    constructor(private _getDataService: GetdataService,
        private _regitserService: RegisterService) { }

    @Selector()
    static GetSalesList(state: SalesStateModel) {
        return state.sales;
    }

    //Get Loaded employee Info
    @Selector()
    static salesLoaded(state: SalesStateModel) {
        return state.salesLoaded;
    }

    @Action(GetSales)
    getsales({ getState, setState }: StateContext<SalesStateModel>) {
        return this._getDataService.getSalesList().pipe(tap(res => {
            const state = getState();
            console.log(res)
            setState({
                ...state,
                sales:res.salesData,
                salesLoaded:true
            })
        })).subscribe({
            error: (err)=>{
                let errorObj = err.error
                if(errorObj.userError){
                    this._regitserService.signout();
                }
            }
        });
    }
}
