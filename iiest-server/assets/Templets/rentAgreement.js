const rentAgreementTemplet = (verifiedInfo, shopInfo) => {
    return `<!DOCTYPE html>
    <html lang="en">
    
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Rent Agreement</title>
        <style>
            h2 {
                text-align: center;
                width: 100%;
            }
            .content {
                margin: auto;
                height: 1120px;
                width: 800px;
                padding-left: 8%;
                padding-right: 8%;
                text-align: justify;
            }
            .and {
                text-align: center;
                font-size: 20px;
            }
            li{
                margin-top: 15px;
                margin-bottom: 15px;
            }
            .sign{
                height: 100px;
                display: flex;
                justify-content: space-between;
            }
            .sign p {
                vertical-align: bottom;
            }
        </style>
    </head>
    
    <body>
        <main class="content">
            <h2>Rent Agreement</h2>
            <p>
                This Rent Agreement is being executed at New Delhi on 20.11.2023 between Mr Ravinder R/O House No-54, Ghora
                Mohalla, Main Road , Aya Nagar , New Delhi-110047 do hereinafter call the first Party/Owner.
            </p>
            <div class="and"><strong>AND</strong></div>
            <p style="margin-bottom: 40px;">
                Mr Goklesh Kumar R/O Goad (146) , Mahendergarh , Haryana-123001 ,do hereinafter called the Tenant/Second
                Party The expression of the LANDLORD and the Tenant shall mean and include their legal heirs, Successors,
                Executors, administrator, representatives, assigns and nominee etc. Whereas the Land LORD is the absolute
                owner and sole owner of the said property. Whereas on the request of the Tenant the Landlord has agreed to
                let out the Property Shop No-1, Ground Floor, Ghora Mohalla , Main Road , Aya Nagar , New Delhi-110047
                WHEREAS on the request of the tenant the landlord has agreed to let out the said property and tenant has
                also agreed to take the same on monthly rent Rs.8500/- (Eight Thousand Five Hundred Only) Extra electricity
                charges, Water charges, sewerage charges, including maintenance charges, following terms and conditions of
                the agreement as under:-
            </p>
            <ol>
                <li>That the Tenant has taken the said premises only for lawful Commercial Purpose, and not for any other
                    purpose since.
                </li>
                <li>That the tenancy shall commence from 20.11.2023 for a period of 11 month only. However, the said tenancy
                    period can
                    be extended further with the mutual consent of both the parties by 10% increase in the said rent with a
                    Fresh/New Rent
                    Agreement.
                </li>
                <li>That the Landlord can inspect the said premises at any responsible time in the presence of the tenant
                    and the tenant
                    shall have no objection for the same in future.
                </li>
                <li>
                    That the tenant shall pay the said monthly rent in advance cash or through demand draft/RTGS/NEFT (PDC)
                    payable at
                    Delhi to the Landlord up to 1-10th day of each of English Calendar Month.
                </li>
                <li>
                    That the tenant shall not store or stock any objectionable items, hazardous, inflammable and offensive
                    articles etc.
                    in the said tenanted presumes.
                </li>
                <li>
                    That the tenant shall not sub-let the said premises or any portion thereof to anybody else.
                </li>
                <li>
                    That the tenant shall be responsible for minor repairs/maintenance work done by own cost in the tenancy
                    premises time
                    to time.
                </li>
                <li>
                    That the tenant shall not damage the said premises or any portion thereof and he She shall keep the said
                    premises
                    quite neat and clean in all respect.
                </li>
                <li>
                    That the tenant shall not make any additions in the said premises without written consent of the
                    landlord
                </li>
                <li>
                    That of the tenant wants to vacate the said premises before the expiry of tenancy period.
                </li>
                <li>
                    That the tenant shall abide by all the rules and regulations of DDA, MCD,BSFS RAJDHANI
                </li>
                <li>
                    That the minor repairs such as leakages to water taps, electricity fuses etc. shall be done by the
                    tenant/second
                    party
                </li>
                <li>
                    That the tenant/Second party has paid an interest free security amount of Nil, to the Owner/First Party
                    in respect
                    of the Said premises. that the above said security amount will be refunded at the time. when the
                    tenant/Second party
                </li>
                <li>
                    shall vacate the possession of the said premises, to owner/first party after clearing all dues of rent
                    amount
                    electricity and water charges etc.
    
                </li>
                <li>If The second party will vacate the tenancy premises before completion of six month, then the security
                    amount shall
                    be forfeited by the first party.</li>
                <li>
                    That in case, the first party sales the above said property, then the second party shall vacate and
                    release the
                    above said premises within the prior notice period as this agreement.
                </li>
                <li>All movables are given in working condition and shall be taken back in working condition else the repair
                    cost to be
                    borne by tenant.</li>
                <li>
                    Any repair of house electrical, electronic, furniture, to be borne by tenant.
                </li>
                <li>
                    That in case of the defaults for non-payment of the rent, the owner will be fully entitled to realize
                    the rent
                    through court of law under specific performances of contract at the cost, risk and responsibility of the
                    tenant.
                </li>
                <li>
                    That the First party will not responsible for any pending loan for the above-mentioned tenancy period in
                    future
                    time.
                </li>
                <li>
                    That both the parties shall abide by all the rules and regulations of the rent control act and terms and
                    conditions
                    of this agreement. that the both parties have signed on this agreement with their sound mind and good
                    health.
                </li>
                <li>
                    That the second arty shall handover the peaceful vacant physical possession of the said premises with
                    all items on
                    the same conditions after expiry of agreement period.
                </li>
            </ol>
            <p>IN WITNESSES WHEREOF, the landlord and the tenant executed this agreement, in the presence of the following witnesses:-</p>
           
            <div class="signatures">
                <p>
                    WITNESSES:-
                </p>
    
                <div class="sign">
                    <div style="align-self:flex-start;" class="">1.</div>
                    <div style="align-self:flex-end;" class="">
                        <p>FIRST PARTY/OWNER</p>
                    </div>
                </div>
                <div class="sign">
                    <div style="align-self:flex-start;" class="">2.</div>
                    <div style="align-self:flex-end;" class="">
                        <p>SECOND PARTY/TENANT</p>
                    </div>
                </div>
            </div>
        </main>
    
    </body>
    
    </html>
    `
}

module.exports = rentAgreementTemplet;