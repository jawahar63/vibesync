import { Song } from "./song.model";

class Node {
        prev: Node | null;
        next: Node | null;
        song:Song
        constructor(song:Song) {
            this.prev = null;
            this.next = null;
            this.song=song
        }
    }
export class Queue{
    head: Node | null;
    current: Node | null;
    tail: Node | null;
    private songSet: Set<string>;
    constructor() {
        this.head = null;
        this.tail = null;
        this.current = null;
        this.songSet = new Set();
    }

    private getSongId(song: Song): string {
        return `${song.title}-${song.artist}`; // Unique identifier
    }
    insert(songs: Song[] | Song) {
        if (!Array.isArray(songs)) {
            songs = [songs]; // Convert single song to an array for uniformity
        }

        for (const song of songs) {
            const songId = this.getSongId(song);
            if (this.songSet.has(songId)) continue; // Avoid duplicate songs

            const node = new Node(song);
            this.songSet.add(songId);

            if (this.head === null || this.tail === null) {
                // First node in the queue
                this.head = node;
                this.tail = node;
                this.current = node;
            } else {
                // Append node to the end of the queue
                this.tail.next = node;
                node.prev = this.tail;
                this.tail = node;
            }
        }
    }


    insertCurrent(song:Song) {
        const songId = this.getSongId(song);
        if (this.songSet.has(songId)) return;

        const node = new Node(song);
        this.songSet.add(songId);
        if (this.head === null) {
            this.head = node;
            this.tail = node;
            this.current = node;
        } else if (this.tail!=null && this.current === this.tail) {
            this.tail.next = node;
            node.prev = this.tail;
            this.tail = node;
            this.current = node;
        }else{
            if(this.current!=null&&this.current.next!=null){
                const temp = this.current.next;
                this.current.next = node;
                node.prev = this.current;
                node.next = temp;
                temp.prev = node;
                this.current=node;
                
                // this.current.next = node;
                // node.prev = this.current;
                // node.next = temp;
                // temp.prev = node;
                // this.current=node;
            }
        }

        // else if(tail==current){
        //     tail.next = add;
        //     add.prev = tail;
        //     tail = add;
        //     current=add;
        // }else{
        //     Node temp = current.next;
        //     current.next = add;
        //     add.prev = current;
        //     add.next = temp;
        //     temp.prev = add;
        //     current = add;
        // }
    }
    insertNextCurrent(song:Song) {
        const songId = this.getSongId(song);
        if (this.songSet.has(songId)) return;

        const node = new Node(song);
        this.songSet.add(songId);
        if (this.head === null) {
            this.head = node;
            this.tail = node;
            this.current = node;
        } else if (this.tail!=null && this.current === this.tail) {
            this.tail.next = node;
            node.prev = this.tail;
            this.tail = node;
            this.current.next = this.tail;
        }else{
            if(this.current!=null&&this.current.next!=null){
                const temp = this.current.next;
                this.current.next = node;
                node.prev = this.current;
                node.next = temp;
                temp.prev = node;
                
                // this.current.next = node;
                // node.prev = this.current;
                // node.next = temp;
                // temp.prev = node;
                // this.current=node;
            }
        }

        // else if(tail==current){
        //     tail.next = add;
        //     add.prev = tail;
        //     tail = add;
        //     current=add;
        // }else{
        //     Node temp = current.next;
        //     current.next = add;
        //     add.prev = current;
        //     add.next = temp;
        //     temp.prev = add;
        //     current = add;
        // }
    }
    
    searchSong(song:Song) {
        let current = this.head;
        while (current !== null) {
            if (current.song.title === song.title && current.song.artist === song.artist) {
                return current;
            }
            current = current.next;
        }
        return null;
    }
    deleteSong(song:Song) {
        let current = this.head;
        while (current !== null) {
            if (current.song.title === song.title && current.song.artist === song.artist) {
                if (current.prev === null) {
                    this.head = current.next;
                } else {
                    current.prev.next = current.next;
                }
                if (current.next === null) {
                    this.tail = current.prev;
                } else {
                    current.next.prev = current.prev;
                }
                return;
            }
            current = current.next;
        }
    }
    skipPrev(){
        if(this.current!=null&&this.current.prev!=null){
            this.current = this.current.prev;
        }
    }
    skipNext(){
        if(this.current!=null&&this.current.next!=null){
            this.current = this.current.next;
        }
    }

    moveTop(song: Song) {
        const node = this.searchSong(song);
        if (!node || node === this.head||node==this.current||(this.current && node==this.current.next)||node.prev==null||this.current==null) return;
        if(this.tail==node){
            this.tail=node.prev;
        }
        node.prev.next=node.next;
        if(node.next)node.next.prev=node.prev;
        node.next=this.current.next;
        if(node.next)node.next.prev=node;
        this.current.next=node;
        node.prev=this.current;

        // if (node.prev) {node.prev.next = node.next;}
        // if (node.next) {node.next.prev = node.prev;} else {this.tail = node.prev;}
        // node.prev = null;
        // node.next = this.head;
        // if (this.head) {this.head.prev = node;}
        // this.head = node;
        // if (this.current === node) {this.current = this.head;}

        // Node temp=search(data);
        // if(tail==temp){
        //     tail=temp.prev;
        // };
        // if(temp==null)return;
        // temp.prev.next=temp.next;
        // if(temp.next!=null)temp.next.prev=temp.prev;
        // temp.next=current.next;
        // temp.next.prev=temp;
        // current.next=temp;
        // temp.prev=current;
    }

    moveUp(song: Song) {
        const node = this.searchSong(song);

        // If node doesn't exist or is already at the head, no need to move up
        if (!node || !node.prev) return;

        const prevNode = node.prev;
        const prevPrevNode = prevNode.prev;

        // Adjust the connections to move 'node' one step up
        node.prev = prevPrevNode;
        prevNode.next = node.next;

        if (node.next) {
            node.next.prev = prevNode;
        } else {
            this.tail = prevNode; // Update tail if node is the last one
        }

        if (prevPrevNode) {
            prevPrevNode.next = node;
        } else {
            this.head = node; // Update head if node moves to the front
        }

        node.next = prevNode;
        prevNode.prev = node;

        // Adjust the current pointer if it moves up
        if (this.current === prevNode) {
            this.current = node;
        }
    }

    moveDown(song: Song) {
        const node = this.searchSong(song);

        // If node doesn't exist or is already at the tail, no need to move down
        if (!node || !node.next) return;

        const nextNode = node.next;
        const nextNextNode = nextNode.next;

        // Adjust the connections to move 'node' one step down
        nextNode.prev = node.prev;
        node.next = nextNextNode;

        if (nextNextNode) {
            nextNextNode.prev = node;
        } else {
            this.tail = node; // Update tail if node moves to the end
        }

        if (node.prev) {
            node.prev.next = nextNode;
        } else {
            this.head = nextNode; // Update head if node was the first
        }

        nextNode.next = node;
        node.prev = nextNode;

        // Adjust the current pointer if it moves down
        if (this.current === node) {
            this.current = nextNode;
        }
    }

    moveBottom(song: Song) {
        const node = this.searchSong(song);

        // If node is not found or already at the bottom, do nothing
        if (!node || node === this.tail) return;

        // Adjust previous node's next pointer
        if (node.prev) {
            node.prev.next = node.next;
        } else {
            // If it's the head, update the head pointer
            this.head = node.next;
        }

        // Adjust next node's prev pointer
        if (node.next) {
            node.next.prev = node.prev;
        }

        // Move node to the bottom (end of the list)
        node.prev = this.tail;
        node.next = null;

        if (this.tail) {
            this.tail.next = node;
        }

        // Update the tail pointer to the moved node
        this.tail = node;

        // If the moved node was the current, update the current to the new tail
        if (this.current === node) {
            this.current = this.tail;
        }
    }


    iterator():Song[] {
        let song:Song[]=[];
        let curr=this.current;
        while(curr!=null){
            song.push(curr.song);
            curr=curr.next;
        }
        return song;
    }
    historyIterator():Song[]{
        let song:Song[]=[];
        let curr=this.current;
        while(curr!=null){
            song.push(curr.song);
            curr=curr.prev;
        }
        return song;
    }

    fullIterator():Song[]{
        let song:Song[]=[];
        let curr=this.head;
        while(curr!=null){
            song.push(curr.song);
            curr=curr.next;
        }
        return song;
    }

    print(){
        let current = this.head;
        while (current !== null) {
            console.log(current.song.title);
            current = current.next;
        }
    }
    shuffleNext(){
        if(!this.current||!this.current.next) return;
        let Nodes:Node[]=[];
        let curr: Node | null=this.current.next;
        while(curr){
            Nodes.push(curr);
            curr=curr.next;
        }

        for(let i=Nodes.length-1;i>0;i--){
            const j = Math.floor(Math.random() * (i + 1));
            [Nodes[i],Nodes[j]]=[Nodes[j],Nodes[i]];
        }
        this.current.next=Nodes[0];
        Nodes[0].prev=this.current;
        curr=this.current.next;

        for(let i = 1; i < Nodes.length;i++ ){
            curr.next=Nodes[i];
            Nodes[i]=curr;
            curr=curr.next;
        }

        this.tail=curr;
        this.tail.next = null;
    }
    shuffle(): void {
        if (!this.head || !this.head.next) return; 

        let nodes: Node[] = [];
        let current: Node | null = this.head;
        while (current) {
            nodes.push(current);
            current = current.next;
        }

        for (let i = nodes.length - 1; i >= 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [nodes[i], nodes[j]] = [nodes[j], nodes[i]];
        }


        this.head = nodes[0];
        this.head.prev = null;
        this.current = this.head;
        current = this.head;

        for (let i = 1; i < nodes.length; i++) {
            current.next = nodes[i];
            nodes[i].prev = current;
            current = nodes[i];
        }

        this.tail = current;
        this.tail.next = null;
    }


}