export interface Employee {
  employee_name: string;
  gender: string;
  dob: Date;
  username: string;
  email: string;
  password: string;
  company_name: string;
  employee_id: string;
  portal_type: string;
  project_name: string;
  doj: Date;
  post_type: string;
  department: string;
  designation: string;
  grade_pay: string
  salary: number;
  contact_no: number;
  alternate_contact: number;
  address: string;
  city: string;
  state: string;
  country: string;
  zip_code: number;
  acceptTerms: boolean;
  createdBy: string;
  empSignature: File;
  employeeImage: File;
}

export interface AddConsumer {
  name: string;
  job: string;
  id: string;
  createdAt: string;
}
export interface loginEmployee {
  username: string;
  password: string;
}

export interface forgotPassword {
  email: string;
}

export interface fbo {
  fbo_name: string;
  owner_name: string;
  owner_contact: number;
  email: string;
  state: string;
  district: string;
  address: string;
  product_name: string[];
  business_type: string[];
  gst_number: string;
  fostacInfo: object;
  foscosInfo: object;
  payment_mode : string;
  grand_total: number;
  createdBy: string;
  pincode: number; 
  village: string; 
  tehsil: string
  foscos_training: {
    foscos_service_name: string;
    license_category: string;
    license_duration: string;
    foscos_processing_amount: number;
    foscos_client_type: string;
    shops_no: number;
    water_test_fee: string;
    foscos_total: number
  },
  fostac_training: {
    fostac_service_name: string;
    fostac_processing_amount: string;
    fostac_client_type: string;
    recipient_no: number;
    fostac_total: number
  }
}

export interface fboRecipient {
  name: string;
  phoneNo: number;
  aadharNo: number;
}

export interface fboShop {
  operatorName :string;
  address : string;
  eBill: File;
}

export interface pincodeData {
  pincode:number;
  tehsil:string;
  state:string;
  district:string
}

export interface areaAllocation {
    state: string; 
    district: string; 
    pincodes: string[]
}

export interface reportingManager {
  reportingManager: string;
}