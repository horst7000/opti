let graph = {};
let g = {};

function repulsiveForce() {
	const c0 = 2*1E4;
	
	let forceX = 0;
	let forceY = 0;
	let dist   = 0;

	g.nodes.forEach(nodeA => {
		forceX = 0;
		forceY = 0;

		// calc forces
		g.nodes.forEach(nodeB => {
			if(nodeA.nr == nodeB.nr) return;

			dist = nodeA.dist(nodeB.x,nodeB.y);
			forceX += c0/Math.pow(dist,3) * (nodeA.x-nodeB.x);
			forceY += c0/Math.pow(dist,3) * (nodeA.y-nodeB.y);			
		});

		// force from edge
		forceX += c0/(2*Math.pow(nodeA.x,2));
		forceY += c0/(2*Math.pow(nodeA.y,2));	

		// duration in ms
		nodeA.animate(forceX, forceY, 120, null, () => {
			nodeA.out.forEach(edge => {
				edge.draw();
			});
		});
	});
}

function springForce() {
	const c1 = 2*1E-5;
	const defaultDist = 60; // < dependend on edge cost
	
	let forceX = 0;
	let forceY = 0;
	let dist   = 0;

	g.nodes.forEach(nodeA => {
		forceX = 0;
		forceY = 0;

		// calc forces
		g.nodes.forEach(nodeB => {
			if(nodeA.nr == nodeB.nr) return;

			dist = Math.abs(nodeA.dist(nodeB.x,nodeB.y));
			forceX += -c1*(dist-defaultDist) * (nodeA.x-nodeB.x);
			forceY += -c1*(dist-defaultDist) * (nodeA.y-nodeB.y);
		});

		console.log("f "+forceX+" "+forceY);

		// duration in ms
		nodeA.animate(forceX, forceY, 120, null, () => {
			nodeA.out.forEach(edge => {
				edge.draw();
			});
		});
	});
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
	graph = new RandomGraph(nodecount, 11, 3, 0.5);
	g = new GraphSet("G","blue",graph.nodes,graph.edges);
}


document.getElementById("redraw").onclick = newGraph;
// Graph properties
document.getElementById("directed").onchange = newGraph;
document.getElementById("repulsive").onclick = repulsiveForce;
document.getElementById("spring").onclick = springForce;

// Algorithmns
// Baeume
document.getElementById("kruskal").onclick 	= kruskal;
document.getElementById("prim").onclick 	= prim;
// kuerzeste Wege
document.getElementById("bellmann").onclick = bellmann;
document.getElementById("dijkstra").onclick = dijkstra;

newGraph();