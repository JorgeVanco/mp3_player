class Node {
    constructor(bucket, path, url) {
        this.bucket = bucket
        this.path = path
        // this.name = path.slice(0, path.length - 4)  // quita el .mp3
        this.url = url
        this.next = null
        this.prev = null
        this.formatName(path)
    }

    formatName(path){
        let name = path.slice(0, path.length - 4)   // quita el .mp3
        name = name.replaceAll("_", " ")
        let searchRegEx = new RegExp(/\((.*?)\)|\[(.*?)\]/)
        name = name.replace(searchRegEx, "")
        name = name.trim()
        this.name =  name
        let [author, songName] = name.split(" - ")
        this.author = author
        this.songName = songName
    }
}

const nodeConverter = {
    toFirestore: (node) => {
        return {
            name: node.name,
            path: node.path,
            url: node.url,
            bucket: node.bucket,
            author: node.author,
            songName: node.songName
            };
    },
    fromFirestore: (snapshot, options) => {
        const data = snapshot.data(options);
        return new Node(data.bucket, data.path, data.url);
    }
};

class LinkedList {
    constructor(head = null) {
        this.head = head
    }

    addNode(newNode){
        let node = this.head
        if (node == null){
            this.head = newNode
            return
        }
        while (node.next != null){
            node = node.next
        }
        node.next = newNode
        newNode.prev = node
    }

    printList(){
        let node = this.head
        while (node != null){
            node = node.next
        }
    }

    * recorrerLista(){
        let node = this.head
        while (node != null){
            yield node;
            node = node.next;
        }
    }
}


export {LinkedList, Node, nodeConverter}