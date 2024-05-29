/* Copyright (C) 2024 raould@gmail.com License: GPLv2 / GNU General
 * Public License, version 2
 * https://www.gnu.org/licenses/old-licenses/gpl-2.0.en.html
 */

function AddLightningPath(spec) {
    // spec = { color, x0, y0, x1, y1, range, steps=5 }
    var { color, x0, y0, x1, y1, range, steps=5 } = spec;
    var sx = (x1 - x0)/steps;
    var sy = (y1 - y0)/steps;
    var points = [];
    for (var t = 1; t <= steps-1; ++t) {
	var x = RandomCentered(x0 + (sx*t), range);
	var y = RandomCentered(y0 + (sy*t), range);
	points.push({x, y});
    }
    Cxdo(() => {
	gCx.beginPath();
	gCx.strokeStyle = color;

	gCx.moveTo(x0, y0);
	points.forEach(p => gCx.lineTo(p.x, p.y));
	gCx.lineTo(x1, y1);
	gCx.lineWidth = sx1(3);
	gCx.globalAlpha = 0.3;
	gCx.stroke();

	gCx.beginPath();
	gCx.moveTo(x0, y0);
	points.forEach(p => gCx.lineTo(p.x, p.y));
	gCx.lineTo(x1, y1);
	gCx.lineWidth = sx1(1);
	gCx.globalAlpha = 1;
	gCx.stroke();
    });
}

function MakePoofAnimation(x, y, radius) {
    var lifespan = 1000 * 1;
    var r = radius;
    return new Animation({
	name: "poof",
	lifespan,
	animFn: (anim, dt, gameState) => {
	    r += dt/kTimeStep*1.5;
	},
	drawFn: (anim) => {
	    var alpha = T01(anim.lifespan, anim.lifespan0);
	    Cxdo(() => {
		gCx.strokeStyle = RandomForColor(redSpec, alpha);
		gCx.lineWidth = sx1(1);
		gCx.beginPath();
		gCx.arc( WX(x), WY(y),
			 r * RandomRange(1,1.05),
			 0, k2Pi );
		gCx.stroke();
		gCx.beginPath();
		gCx.arc( WX(x), WY(y),
			 r/2 * RandomRange(1,1.05),
			 0, k2Pi );
		gCx.stroke();
		gCx.beginPath();
		gCx.lineWidth = sx1(2);
		gCx.arc( WX(x), WY(y),
			 r/4 * RandomRange(1,1.05),
			 0, k2Pi );
		gCx.stroke();
	    });
	}
    });
}

function Make2PtLightningAnimation(props) {
    var { lifespan, x0, y0, x1, y1, range, steps, endFn } = props;
    return new Animation({
	name: "2ptlightning",
	lifespan,
	drawFn: () => {
	    AddLightningPath({
		color: RandomColor(),
		x0, y0,
		x1, y1,
		range, steps
	    });
	},
	endFn
    });
}

function MakeTargetsLightningAnimation(props) {
    var { lifespan, targets, paddle, endFn } = props;
    return new Animation({
	name: "targetslightning",
	lifespan,
	drawFn: () => {
	    targets.forEach(xy => {
		AddLightningPath({
		    color: RandomColor(),
		    x0: paddle.GetMidX(),
		    y0: paddle.GetMidY(),
		    x1: xy.x,
		    y1: xy.y,
		    range: 20
		});
	    });
	},
	endFn
    });
}

function MakeSplitAnimation(props) {
    var { side, lifespan, targets, paddle, endFn } = props;
    // start chain at nearest puck, assumes rhs default.
    targets.sort((a,b) => b.x-a.x);
    ForSide(side, () => targets.reverse, () => {})();
    return new Animation({
	name: "split",
	lifespan,
	drawFn: () => {
	    var p0 = { x: paddle.GetMidX(),
		       y: paddle.GetMidY() };
	    targets.forEach((p1, i) => {
		AddLightningPath({
		    color: RandomColor(),
		    x0: p0.x, y0: p0.y,
		    x1: p1.x, y1: p1.y,
		    range: 10
		});
		p0 = p1;
	    });
	},
	endFn
    });
}

function MakeWaveAnimation(props) {
    var { side, lifespan, paddle, endFn } = props;
    var x0 = paddle.GetMidX();
    var y0 = paddle.GetMidY();
    var a0 = ForSide(side, -Math.PI*1/2, Math.PI*1/2);
    var a1 = a0 + Math.PI;
    var t = 0;
    return new Animation({
	name: "wave",
	lifespan,
	animFn: (anim, dt, gameState) => {
	    t = T10(anim.lifespan, anim.lifespan0);
	},
	drawFn: (anim) => {
	    Cxdo(() => {
		gCx.lineWidth = sx1(2);
		gCx.strokeStyle = "magenta";
		for (var ri = 1; ri <= 3; ++ri) {
		    gCx.beginPath();
		    gCx.arc( x0, y0,
			     gw(t) + sx(5*ri),
			     a0,
			     a1 );
		    gCx.stroke();
		}
	    });
	},
	endFn
    });
}

function MakeEngorgeAnimation(props) {
    var { lifespan, paddle, endFn } = props;
    var ph0 = paddle.height;
    var t10 = 1;
    return new Animation({
	name: "engorge",
	lifespan,
	animFn: (anim, dt, gameState) => {
	    t10 = T10(anim.lifespan0-anim.lifespan, anim.lifespan0);
	},
	drawFn: () => {
	    AddLightningPath({
		color: RandomColor(),
                x0: paddle.GetMidX(), y0: paddle.y,
                x1: paddle.GetMidX(), y1: paddle.y + paddle.height,
                range: Math.max(0.5, paddle.width * 2 * t10)
	    });
	},
	startFn: (gameState) => {
	    paddle.BeginEngorged();
	},
	endFn: (gameState) => {
	    paddle.EndEngorged();
	    if (exists(endFn)) { endFn(gameState); }
	}
    });
}

// bounty: somebody should make this actually
// line trace into the future so the graph
// is literally where you should be w/in the
// next few seconds accouting for all bounces.
function MakeDensityAnimation(props) {
    var { side, endFn } = props;
    // match: GameState paddle inset position at gh(0.5)
    // although this is hacked up more for aesthetics.
    var x = ForSide(side, 
		    gXInset/2 + gPaddleWidth/2,
		    gw(1) - gXInset/2 - gPaddleWidth/2);
    var w = gPaddleWidth;
    return new Animation({
	name: "density",
	lifespan: undefined,
	drawFn: () => {
	    Cxdo(() => {
		gCx.fillStyle = "rgba(200, 200, 0, 0.05)";
		gPucks.A.forEach(p => {
		    var y0 = Math.max(gYInset, p.y-p.height);
		    var y1 = Math.min(gh(1)-gYInset, p.y+p.height*2);
		    var h = y1 - y0;
		    if (Sign(p.vx) == ForSide(side, -1,1)) {
			gCx.fillRect(
			    x-w/2, y0,
			    w, h,
			);
		    }
		});
	    });
	},
	endFn
    });
}

function MakeChaosAnimation(props) {
    var { targets, endFn } = props;
    return new Animation({
	name: "chaos",
	lifespan: 250,
	drawFn: () => {
	    targets.forEach((p, i) => {
		if (p.alive && RandomBool(0.5)) {
		    AddLightningPath({
			color: RandomForColor(magentaSpec),
			x0: p.x,
			y0: Sign(p.vy)==1 ? gYInset : gh(1)-gYInset,
			x1: p.x,
			y1: p.y,
			range: 5,
			steps: 5,
		    });
		}
	    });
	},
	endFn
    });
}
