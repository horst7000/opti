let graph = {};
let g = {};

function repulsiveForce() {
	const c0 = 7;
	const cBoundary = 100;
	
	let forceX = 0;
	let forceY = 0;
	let dist   = 0;

	g.nodes.forEach(nodeA => {
		forceX = 0;
		forceY = 0;
		let degA = nodeA.out.length;

		// calc forces from nodes
		g.nodes.forEach(nodeB => {
			if(nodeA.nr == nodeB.nr) return;

			let degB = nodeB.in.length;

			dist = nodeA.dist(nodeB.x,nodeB.y);
			forceX += c0*(degA+1)*(degB+1)/Math.pow(dist,2) * (nodeA.x-nodeB.x);
			forceY += c0*(degA+1)*(degB+1)/Math.pow(dist,2) * (nodeA.y-nodeB.y);			
		});
		// calc forces from edges
		g.edges.forEach(edge => {
			if(edge.nodraw) return;
			
			dist = nodeA.dist(edge.txtX,edge.txtY);
			forceX += c0/(2*Math.pow(dist,2)) * (nodeA.x-edge.txtX);
			forceY += c0/(2*Math.pow(dist,2)) * (nodeA.y-edge.txtY);
		});

		// force from svg boundary
		forceX += cBoundary/(Math.pow(nodeA.x,1));
		forceY += cBoundary/(Math.pow(nodeA.y,1));	
		forceX += -cBoundary/(Math.pow(svgWidth-nodeA.x,1));
		forceY += -cBoundary/(Math.pow(svgHeight-nodeA.y,1));

		// duration in ms
		nodeA.animate(forceX, forceY, 30, null, () => {
			nodeA.out.forEach(edge => {
				edge.draw();
			});
		});
	});
}

function springForce() {
	const c1 = 2*1E-4;
	// const defaultDist = 100; // < dependend on edge cost
	
	let forceX = [];
	let forceY = [];
	let dist   = 0;

	for(const nodeA of g.nodes) {
		forceX[nodeA.nr] = 0;
		forceY[nodeA.nr] = 0;

		// calc forces
		nodeA.out.forEach(edge => {
			let nodeB = edge.trg;
			let defaultDist = edge.cost;
			dist = Math.abs(nodeA.dist(nodeB.x,nodeB.y));
			forceX[nodeA.nr] += -c1*(dist-defaultDist) * (nodeA.x-nodeB.x);
			forceY[nodeA.nr] += -c1*(dist-defaultDist) * (nodeA.y-nodeB.y);
		});
	}
	for(const nodeA of g.nodes) {
		// animation duration in ms
		nodeA.animate(forceX[nodeA.nr], forceY[nodeA.nr], 30, null, () => {
			nodeA.out.forEach(edge => {
				edge.draw();
			});
		});
	}
}

async function applyForces() {
	for (let i = 0; i < 20; i++) {
		springForce();
		await time(100);
		repulsiveForce();
		await time(100);
	}
}

async function kruskal() {
	let f = new GraphSet("F","orange");
	let gminusf = new GraphSet("G\\F","grey",g.nodes, g.edges);

	while(f.edgeCount < g.nodeCount - 1) {
		let minEdge = await searchMinEdgeWithoutCircle(gminusf,f);
		f.addEdges(minEdge);
		f.addNodes(minEdge.src);		
		f.addNodes(minEdge.trg);

		gminusf.removeEdges(minEdge);

		(await time(3000));
	}

}

async function prim() {
	// init
	let f 		= new GraphSet("F","orange");
	let x 		= new GraphSet("X","green");
	let vminusx = new GraphSet("V\\X","grey",g.nodes);	// G=(V,E)
	x.addNodes(g.nodes[0]);
	vminusx.removeNodes(g.nodes[0]);
	
	while(x.nodeCount < g.nodeCount) {
		let minEdge = {cost: 9999};

		g.edges.forEach(edge => {
			if(edge.cost < minEdge.cost &&
				isEdgeInSets(edge,x,vminusx) )
				minEdge = edge;
		});

		f.addEdges(minEdge);
		if(x.hasNode(minEdge.src)) {
			x.addNodes(minEdge.trg);		
			vminusx.removeNodes(minEdge.trg);
		} else {
			x.addNodes(minEdge.src);		
			vminusx.removeNodes(minEdge.src);
		}

		(await time(1200));
	}
}

function isEdgeInSets(edge, srcSet, trgSet) {
	return  srcSet.hasNode(edge.src) &&
			trgSet.hasNode(edge.trg) ||
			(!graph.directed && // if undirected
				srcSet.hasNode(edge.trg) &&
				trgSet.hasNode(edge.src))
}

function bellmann() {

}

async function dijkstra() {
	let t = new GraphSet("T","orange",g.nodes);
	let s = new GraphSet("S","green");

	let prev = [];
	let d = Array(t.nodeCount+1).fill(9999);
	d[1] = 0;

	while(t.nodeCount > 0) {
		let minNode = {};
		let minCost = 9999;

		t.nodes.forEach(node => {
			if(d[node.nr] < minCost) {
				minNode = node;
				minCost = d[minNode.nr];
			}
		});

		if(minCost == 9999) {
			console.log("no more minimum");
			break;
		}

		t.removeNodes(minNode);
		s.addNodes(minNode);
		
		minNode.out.forEach(edge => {
			if(d[edge.src.nr] + edge.cost < d[edge.trg.nr]) {
				d[edge.trg.nr] 		= d[edge.src.nr] + edge.cost;
				edge.trg.cost		= d[edge.trg.nr];
				prev[edge.trg.nr] 	= edge.src.nr;
			}
		});
		
		(await time(1200));
	}
}

async function searchMinEdge(set) {
	let minEdge = set.edges[0];

	set.edges.forEach(edge => {
		if(edge.cost < minEdge.cost)
			minEdge = edge;
	});

	return minEdge;
}

// async function searchMinEdgeWithoutCircle(set,noCircleSet) {
// 	let minEdge = set.edges[0];
	
// 	set.edges.forEach(edge => {
// 		if(edge.cost < minEdge.cost &&
// 			(!noCircleSet.hasNode(edge.src) || // source or
// 			 !noCircleSet.hasNode(edge.trg)) ) // target must be old
// 			minEdge = edge;
// 	});
// 	return minEdge;
// }


function time(ms) {
	return new Promise(resolve => setTimeout(resolve, ms));
}

function newGraph() {
	let nodecount = document.getElementById("count").value;
	graph = new RandomGraph(nodecount, 11, 5, 0.18);
	g = new GraphSet("G","blue",graph.nodes,graph.edges);
}


document.getElementById("redraw").onclick = newGraph;

// Graph properties
document.getElementById("directed").onchange = newGraph;
// forces
document.getElementById("repulsive").onclick = repulsiveForce;
document.getElementById("spring").onclick = springForce;
document.getElementById("forces").onclick = applyForces;

// Algorithmns
// Baeume
document.getElementById("kruskal").onclick 	= kruskal;
document.getElementById("prim").onclick 	= prim;
// kuerzeste Wege
document.getElementById("bellmann").onclick = bellmann;
document.getElementById("dijkstra").onclick = dijkstra;

newGraph();