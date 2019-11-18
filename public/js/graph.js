const svgWidth 	= 600;
const svgHeight = 400;


class RandomGraph {
	constructor(nodeCount, nodeRadius, maxDegree = 3, prop = 0.5) {
		this.resetSvgAndTable();
		this.nodes 		= [];
		this.edges 		= [];
		this.nodeCount 	= nodeCount;
		this.r 			= nodeRadius;
		this.directed 	= document.getElementById("directed").checked;
		this.acyclic 	= document.getElementById("acyclic").checked;

		this.createNodes();
		this.connectClosestNodes(maxDegree, prop);
        this.drawNodes(); // draw nodes at end so they are drawn on top
    }

    isDirected() { return document.getElementById("directed").checked; }

    isAcyclic() { return document.getElementById("acyclic").checked; }

	createNodes() {
		for (let i = 1; i <= this.nodeCount; i++) {
			let randomX = 2*this.r+Math.random()*svgWidth;
			let randomY = 2*this.r+Math.random()*svgHeight;
			
			let errorCnt = 0;
			while(this.closestNode(randomX,randomY).dist(randomX,randomY) < 3*this.r && errorCnt < 100) {
				randomX = 2*this.r+Math.random()*400;
				randomY = 2*this.r+Math.random()*200;
				errorCnt++;
			}
			this.nodes.push(new Node(randomX,randomY,this.r,i));
		}
	}
	
	drawNodes() {
		this.nodes.forEach(node => {
			node.draw();
		});
	}

	closestNode(x,y,mindist = 0) { 
		let clNode = {dist: () => 9999};
		this.nodes.forEach(el => {
            if(
                el.dist(x,y) < clNode.dist(x,y) &&
                el.dist(x,y) > mindist
            )
				clNode = el;
		});
		return clNode;
    }
    
    hasEdge(src,trg) { // only for directed
        let hasEd = false;
        src.out.forEach(outedge => {
            if(outedge.trg === trg)
                hasEd = true;
        });
        return hasEd;
    }

	connectClosestNodes(amount = 1, p = 1) { // p propability
		this.nodes.forEach(el => {
			let clNode;
			let dist = 0;
			for (let i = 0; i < amount; i++) {
				if(Math.random() < p || i==0) { // connect at least 1 (i==0)
					clNode = this.closestNode(el.x,el.y,dist);
                    dist = clNode.dist(el.x,el.y);
                    if(!(this.directed && this.acyclic) || !this.hasEdge(clNode,el))   // acyclic => not connected
					    this.connect(el, clNode);
				}
			}
		});
	}

	connect(src, trg) {
        let edge = {};
        
        if(this.isDirected())
            edge = new Edge(src,trg,this.directed,this.r);
        else if(!this.hasEdge(src,trg)) {
            edge = new Edge(src,trg,this.directed,this.r);

            let edgeRet = new Edge(trg,src,this.directed,this.r,true);
            trg.addOut(edgeRet);
            src.addIn(edgeRet);
            this.edges.push(edgeRet);
        } else
            return;
        
		src.addOut(edge);
        trg.addIn(edge);
        this.edges.push(edge);
	}

	resetSvgAndTable() {
		s.children().forEach(el => {
			el.remove();
		});
		setTable.innerHTML = "";
	}

}
