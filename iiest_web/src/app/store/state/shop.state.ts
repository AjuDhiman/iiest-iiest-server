import { DeleteShop, GetShops, SetShopsLoadedFalse, UpdateShop } from 'src/app/store/actions/shop.action';
import { Injectable } from "@angular/core";
import { Selector,Action, StateContext, State } from "@ngxs/store";
import { GetdataService } from "src/app/services/getdata.service";
import { tap } from "rxjs";
import { RegisterService } from "src/app/services/register.service";

//State Model
export class ShopsStateModel {
    shops : any;
    shopsLoaded : boolean;
    pageNum: number;
}

//State
@State<ShopsStateModel>({
    name : 'shops',
    defaults :{
        shops:[],
        shopsLoaded :false,
        pageNum: 1
    }
})

@Injectable()

export class ShopState {
    constructor(private _getDataService: GetdataService,
                private _regitserService: RegisterService){}

    @Selector()
    static GetShopList(state:ShopsStateModel){
        return state.shops;
    }

    //Get Loaded sales Info
    @Selector()
    static shopsLoaded(state:ShopsStateModel){
        return state.shopsLoaded;
    }
    @Action(GetShops)
    getShops({getState, setState}:StateContext<ShopsStateModel>){
         this._getDataService.getCaseList().pipe(tap(res => {
            const state = getState();
            setState({
                ...state,
                shops:res.caseList,
                shopsLoaded:true,
                pageNum: state.pageNum++
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

    @Action(SetShopsLoadedFalse)
    SetSalesLoadedFalse({getState, setState}:StateContext<ShopsStateModel>){
        
        const state = getState();

        setState({
            ...state,
            shopsLoaded: false
        })
    }

    @Action(UpdateShop)
    updateShop({getState, setState}:StateContext<ShopsStateModel>, {objId, payload}: UpdateShop){
        
        const state = getState();
        const updatedShops = state.shops.map((shop: any)=>
            shop._id === objId ? {...payload} : shop
        )

        setState({
            ...state,
            shops: updatedShops
        })
    }

    @Action(DeleteShop)
    deleteShop({getState, setState}:StateContext<ShopsStateModel>, {objId}: DeleteShop){

        const state = getState();
        const updatedSalesList = state.shops.filter((sale: any) => sale._id !== objId);

        setState({
            ...state,
            shops: updatedSalesList
        })
    }
}