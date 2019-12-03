const s = Snap("#svg");

class Node {
	constructor(x,y,r,nr) {
		this._nr = nr;
		this._x = Math.floor(x);
		this._y = Math.floor(y);
		this._r = r;
		this._in = []; // incoming edges
		this._out = []; // outgoing edges
	}
	get x() { return this._x }
	get y() { return this._y }
	get nr() { return this._nr }
    get out() { return this._out }
    get in() { return this._in }
    
    set color(col) { this.circle.attr({fill: col}) }
    set textColor(col) { this.text.attr({fill: col}) }
    set cost(c) {
        if(!this._cost)
            this._cost = s.text(this._x, this._y+2*this._r, c)
                .attr({fontSize: 1.1*this._r, stroke: "red"});
        else
            this._cost.attr({text: c});

	}
		
	addIn(edge) {
		this._in.push(edge);
	}

	addOut(edge) {
		this._out.push(edge);
	}

	animate(dx, dy, duration, easing, callback) {
		dx = Math.floor(dx);
		dy = Math.floor(dy);
		this.circle.animate({cx:"+="+dx, cy:"+="+dy}, duration, easing, callback);
		this.text.animate({x:"+="+dx, y:"+="+dy}, duration, easing, callback);
		this._x += dx;
		this._y += dy;
	}

	dist(x,y) {
		return Math.sqrt(Math.pow(this.x-x,2) + Math.pow(this.y-y,2));
	}

	draw() {
		if(this.circle) this.circle.remove();
		if(this.text)  	this.text.remove();

		let x = this._x;
		let y = this._y;
		let r = this._r;

		this.circle = s.circle(x,y,r);
		this.circle.attr({
			fill: "#ccf",
			stroke: "#000",
			strokeWidth: r/6
		});
		this.text = s.text(x-3*r/4, y+r/2, this._nr);
		this.text.attr({
            fill: "#fff",
			fontSize: 1.5*r
		});
	}
}