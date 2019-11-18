const setTable 	= document.getElementById("setTable");

class GraphSet {
	constructor(name, color, nodeSet, edgeSet) { // colors: white,blue,grey,green,red,orange,cyan
        this.nodes = [];
        this.edges = [];
        
        this.createTableEntry(name, color, nodeSet, edgeSet);
    }

    get edgeCount() { return this.edges.length }
    get nodeCount() { return this.nodes.length }
    
    createTableEntry(name, color, nodeSet, edgeSet) {
        let tableRow = document.createElement("tr");
		tableRow.className = this.classByColor(color);

		let tableName = document.createElement("th");
		tableName.innerHTML = name;

		this.nodesCol = document.createElement("td");		
        this.addNodes(nodeSet);

		this.edgesCol = document.createElement("td");
        this.addEdges(edgeSet);

		tableRow.appendChild(tableName);
		tableRow.appendChild(this.nodesCol);
		tableRow.appendChild(this.edgesCol);
        setTable.appendChild(tableRow);
    }

    addNodes(nodeSet) {
        let nodesToAdd = [];

        if(!nodeSet) {}
        else if(nodeSet.constructor == Array)
            nodesToAdd = nodeSet;
        else
            nodesToAdd.push(nodeSet);

        nodesToAdd.forEach(node => {
            if(!this.hasNode(node)) {
                this.nodes.push(node);
                node.color = this.colorHex;
            }
        });
        
        this.updateNodesCol();
    }
    
    addEdges(edgeSet) {
        let edgesToAdd = [];

        if(!edgeSet) {}
        else if(edgeSet.constructor == Array)
            edgesToAdd = edgeSet;
        else
            edgesToAdd.push(edgeSet);

        edgesToAdd.forEach(edge => {
            if(!this.hasEdge(edge.src,edge.trg) && !edge.nodraw) {
                this.edges.push(edge);
                edge.color = this.colorHex;
            }
        });
        
        this.updateEdgesCol();
    }

    removeNodes(nodeSet) {
        let nodesToDel = [];

        if(!nodeSet) {}
        else if(nodeSet.constructor == Array)
            nodesToDel = nodeSet;
        else
            nodesToDel.push(nodeSet);

        nodesToDel.forEach(delNode => {
            this.nodes = this.nodes.filter(node => node.nr != delNode.nr)
        });
        
        this.updateNodesCol();
    }

    removeEdges(edgeSet) {
        let edgesToDel = [];

        if(!edgeSet) {}
        else if(edgeSet.constructor == Array)
            edgesToDel = edgeSet;
        else
            edgesToDel.push(edgeSet);

        edgesToDel.forEach(delEdge => {
            this.edges = this.edges.filter(edge =>
                edge.src.nr != delEdge.src.nr  || 
                edge.trg.nr != delEdge.trg.nr
            )
        });
        
        this.updateEdgesCol();
    }

    updateNodesCol() {
        let nodesTxt = "";
		this.nodes.forEach(el => {
			nodesTxt = nodesTxt + el.nr + ", ";
		});
        this.nodesCol.innerHTML = nodesTxt;
    }

    updateEdgesCol() {
        let edgesTxt = "";
		this.edges.forEach(el => {
			edgesTxt = edgesTxt + "("+el.src.nr+", "+el.trg.nr+")" + ", ";
		});
        this.edgesCol.innerHTML = edgesTxt;
    }

	classByColor(color) {
		switch (color) {
			case "blue":
                this.colorHex = "#2e72ea";
				return "table-primary";
				break;
			case "grey":
                this.colorHex = "#9fa8b2";
				return "table-secondary";
				break;
			case "green":
                this.colorHex = "#029f65";
				return "table-success";
				break;
			case "red":
                this.colorHex = "#d43f3a";
				return "table-danger";
				break;
			case "orange":
                this.colorHex = "#eea236";
				return "table-warning";
				break;
			case "cyan":
                this.colorHex = "#148ea1";
				return "table-info";
				break;
			default:
				break;
		}
    }
    
    hasNode(searchNode) {
        return this.nodes.find(node => node.nr == searchNode.nr)
    }
    
    hasEdge(src,trg) {
        return this.edges.find(edge =>
            edge.src.nr == src.nr &&
            edge.trg.nr == trg.nr ||
            (!graph.isDirected() && // if undirected
                edge.src.nr == trg.nr &&
                edge.trg.nr == src.nr)
        );
    }
}