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
        let searchRegEx = new RegExp(/\((.*?)\)|\[(.*?)\]/g)
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

        }else{
            if (this.head.prev !== null){
                node = this.head.prev
            }
            
            node.next = newNode
            newNode.prev = node
            newNode.next = null
            this.head.prev = newNode
        }

    }

    closeLoop(){
        // this.head.prev.next = this.head
        this.head.prev = null
    }

    printList(){
        let node = this.head
        while (node != null){
            node = node.next
        }
    }

    getLength(){
        let node = this.head
        let length = 0
        while (node != null){
            length++
            node = node.next
        }
        return length
    }

    shuffleList(){
        let node = this.head
        let nodes = []
        while (node != null){
            nodes.push(node)
            node = node.next
            nodes[nodes.length - 1].next = null
            nodes[nodes.length - 1].prev = null 
        }


        let currentIndex = nodes.length, randomIndex;
        while (currentIndex !== 0){
            randomIndex = Math.floor(Math.random() * currentIndex)
            currentIndex--

            [nodes[currentIndex], nodes[randomIndex]] = [nodes[randomIndex], nodes[currentIndex]]
        }
        // return nodes
        this.head = null;
        nodes.forEach(node => {
            this.addNode(node)
        })

        this.closeLoop()
    }

    getNode(node){
        let currentNode = this.head
        while (currentNode != null){
            if (currentNode.songName === node.songName && currentNode.author === node.author){
                return currentNode
            }
            currentNode = currentNode.next
        }
        return null
    
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