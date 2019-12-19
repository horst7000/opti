const svgWidth 	= 700;
const svgHeight = 500;


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
		// this.connectClosestNodes(maxDegree, prop);
		this.connectRandomNodes(maxDegree, prop);
		this.distributeRandomCosts();
		this.drawNodes(); // draw nodes at end so they are drawn on top
    }

    isDirected() { return document.getElementById("directed").checked; }

    isAcyclic() { return document.getElementById("acyclic").checked; }

	createNodes() {
		for (let i = 1; i <= this.nodeCount; i++) {
			let margin  = 2*this.r;
			let randomX = margin+Math.random()*(svgWidth-2*margin);
			let randomY = margin+Math.random()*(svgHeight-2*margin);
			
			let errorCnt = 0;
			while(this.closestNode(randomX,randomY).dist(randomX,randomY) < 3*this.r && errorCnt < 100) {
				randomX = margin+Math.random()*(svgWidth-2*margin);
				randomY = margin+Math.random()*(svgHeight-2*margin);
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
	
	connectRandomNodes(maxDegree, p = 1) {
		this.nodes.forEach(el => {
			let k = el.nr-1; // index in this.nodes[]
			let dist = 0;
			for (let i = 0; i < maxDegree; i++) {
				k = (k+1) % this.nodeCount;
				
				if(Math.random() < p || (el.out.length + el.in.length == 0)) { // connect at least 1 (i==0)
					dist = this.nodes[k].dist(el.x,el.y);
                    if(!(this.directed && this.acyclic) || !this.hasEdge(this.nodes[k],el))   // acyclic => not connected
					    this.connect(el, this.nodes[k]);
				}
			}
		});
	}

	connectClosestNodes(maxDegree, p = 1) { // p propability
		this.nodes.forEach(el => {
			let clNode = {};
			let dist = 0;
			for (let i = 0; i < maxDegree; i++) {
				if(Math.random() < p || i==0) { // connect at least 1 (i==0)
					clNode = this.closestNode(el.x,el.y,dist);
					if(!clNode.nr) continue;

					dist = clNode.dist(el.x,el.y);
                    if(!(this.directed && this.acyclic) || !this.hasEdge(clNode,el))   // acyclic => not connected
					    this.connect(el, clNode);
				}
			}
		});
	}

	connect(src, trg) {
		if(this.hasEdge(src,trg))
			return;

		let edge = {};
		
		edge = new Edge(src,trg,this.directed,this.r);
        this.edges.push(edge);
	}

	distributeRandomCosts() {
		this.edges.forEach(edge => {
			edge.cost = Math.floor(3+Math.random()*20);
		});
	}
    
    hasEdge(src,trg) {
        let hasEd = false;
        src.out.forEach(outedge => {
            if(outedge.trg === trg)
				hasEd = true;
			if(!this.directed && outedge.src === trg)
				hasEd = true;
		});
        return hasEd;
	}

	resetSvgAndTable() {
		s.children().forEach(el => {
			el.remove();
		});
		setTable.innerHTML = "";
	}

}
