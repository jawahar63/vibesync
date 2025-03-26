export interface Song{
    _id:string,
    title:string,
    artist:string,
    genre:String,
    album:string,
    imageUrl:string,
    audioUrl:string,
    isYt?:boolean
    trackId?:string,
    showOptions?:boolean,
    liked:boolean,
}