/* Copyright (C) 2011 raould@gmail.com License: GPLv2 / GNU General
 * Public License, version 2
 * https://www.gnu.org/licenses/old-licenses/gpl-2.0.en.html
 */

function Barrier( spec ) {
    var self = this;

    self.Init = function() {
	self.id = gNextID++;
	self.x = spec.x;
	self.y = spec.y;
	self.prevX = self.x;
	self.prevY = self.y;

	self.height = spec.height;
	self.width = spec.width;

	self.hp0 = spec.hp;
	self.hp = self.hp0;
	self.alive = spec.hp > 0;
    };

    self.Step = function( dt ) {
	self.alive = self.hp > 0;
    };

    self.Draw = function( alpha ) {
	Cxdo(() => {
	    // front-side wedge cuts.
	    var edge = sx1(5);
	    // max() prevent getting too thin for wedge shape.
	    var hpw = Math.max(edge, ii(self.width * self.hp/self.hp0)+edge);
	    var r = WX(ForSide(self.x+hpw, self.x+self.width));
	    var l = WX(ForSide(self.x, r-hpw));
	    var t = WY(self.y+sy1(1));
	    var b = WY(self.y+self.height-sy1(1));
	    ForSide(
		() => {
		    gCx.beginPath();
		    gCx.moveTo(l, t);
		    gCx.lineTo(r-edge, t);
		    gCx.lineTo(r, t+edge);
		    gCx.lineTo(r, b-edge);
		    gCx.lineTo(r-edge, b);
		    gCx.lineTo(l, b);
		    gCx.closePath();
		},
		() => {
		    gCx.beginPath();
		    gCx.moveTo(r, t);
		    gCx.lineTo(l+edge, t);
		    gCx.lineTo(l, t+edge);
		    gCx.lineTo(l, b-edge);
		    gCx.lineTo(l+edge, b);
		    gCx.lineTo(r, b);
		    gCx.closePath();
		}
	    )();
	    gCx.fillStyle = RandomBlue( alpha * 0.5 );
	    gCx.fill();
	});
    };

    self.CollisionTest = function( puck ) {
	var hit = puck.CollisionTest( self, ForSide(-1,1) );
	if (hit) {
	    self.hp--;
	}
	return hit;
    };

    self.Init();
}