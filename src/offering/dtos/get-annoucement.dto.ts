export class GetAnnouncementResponse {
    swimming:Announcement
    boarding:Announcement
}


export class Announcement {
    title: string
    intro: Array<string>
    highlights?:Array<string>
    pricingTitle?:string
    pricingNote?:string
    contents:Array<Content>
    conditionTitle:string
    conditions: Array<string>
}

export class Content {
    priceLabel : string
    description :string
    breeds : Array<string>
}



