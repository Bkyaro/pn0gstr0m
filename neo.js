/* Copyright (C) 2011 raould@gmail.com License: GPLv2 / GNU General
 * Public License, version 2
 * https://www.gnu.org/licenses/old-licenses/gpl-2.0.en.html
 */

function Neo( props /*{x, normalX, lifespan, side}*/ ) {
    var self = this;

    self.Init = function() {
	self.id = gNextID++;
	self.x = props.x;
	self.y = 0;
	self.normalX = props.normalX;
	self.width = sx1(10);
	self.height = gh(1);
	self.lifespan0 = props.lifespan;
	self.lifespan = self.lifespan0;
	self.alive = self.lifespan > 0;
	self.side = props.side;
	self.locked = [];
    };

    self.Step = function(dt, gameState) {
	self.alive = self.lifespan > 0;
	if (!self.alive) {
	    gameState.AddAnimation(
		Make2PtLightningAnimation({
		    lifespan: 500,
		    x0: WX(self.x+self.width/2), y0: gYInset,
		    x1: WX(self.x+self.width/2), y1: gh(1)-gYInset,
		    range: self.width * 2,
		    steps: 20,
		})
	    );
	    self.locked.forEach(p => {
		p.isLocked = false;
		p.vx = Math.abs(p.vx) * self.normalX * RandomRange(1,1.5);
		// funny how sparks are global but animations aren't because history.
		AddSparks(p.x, p.y, p.vx, p.vy);
	    });
	}
	self.lifespan = Math.max(0, self.lifespan-dt);
	return self.alive ? self : undefined;
    };

    self.Draw = function( alpha, gameState ) {
	var t = T01(self.lifespan0-self.lifespan, self.lifespan0);
	var y0 = 0;
	var y1 = gh();

	Cxdo(() => { // background.
	    gCx.fillStyle = RandomCyan(0.2*t);
	    for (var i = 0; i < 4; ++i) {
		var hw = i * sx1(2);
		var x = self.x - hw;
		gCx.fillRect(
		    WX(x), y0,
		    self.width+2*hw, y1,
		);
	    }
	});

	var mx = self.x + self.width/2;
	var range = 5 + t * sx1(10);
	AddLightningPath({ // growing.
	    color: RandomColor(alpha),
	    x0: WX(mx), y0,
	    x1: WX(mx), y1,
	    range,
	    steps: 20
	});
	AddLightningPath({ // left edge.
	    color: RandomBlue(alpha),
	    x0: WX(self.x), y0,
	    x1: WX(self.x), y1,
	    range: sx1(2),
	    steps: 20
	});
	AddLightningPath({ // right edge.
	    color: RandomBlue(alpha),
	    x0: WX(self.x+self.width), y0,
	    x1: WX(self.x+self.width), y1,
	    range: sx1(2),
	    steps: 20
	});

	if (RandomBool(t)) { // streamers.
	    var x0 = mx;
	    var y0 = RandomCentered(gh(0.5), gh(0.2));
	    var x1 = ForSide(self.side,
			     RandomRange(self.x + self.width*4, gw(1)-gXInset),
			     RandomRange(self.x - self.width*3, gXInset));
	    var y1 = y0 < gh(0.5) ? gYInset : gh(1)-gYInset;
	    gameState.AddAnimation(
		MakeCrawlingLightningAnimation({
		    lifespan: ii(100 + 250 * t),
		    x0, y0, x1, y1,
		    range: 5,
		    steps: 50,
		    substeps: ii(5 + 5 * t),
		    color: "green",
		})
	    );
	}
    };

    self.CollisionTest = function( puck ) {
	var hit = puck.CollisionTest( self );
	if (hit) {
	    self.locked.push( puck );
	}
	return hit;
    };

    self.Init();
}
