"use strict";

function _slicedToArray(r, e) { return _arrayWithHoles(r) || _iterableToArrayLimit(r, e) || _unsupportedIterableToArray(r, e) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function _iterableToArrayLimit(r, l) { var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (null != t) { var e, n, i, u, a = [], f = !0, o = !1; try { if (i = (t = t.call(r)).next, 0 === l) { if (Object(t) !== t) return; f = !1; } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0); } catch (r) { o = !0, n = r; } finally { try { if (!f && null != t["return"] && (u = t["return"](), Object(u) !== u)) return; } finally { if (o) throw n; } } return a; } }
function _arrayWithHoles(r) { if (Array.isArray(r)) return r; }
/* Copyright (C) 2011 raould@gmail.com License: GPLv2 / GNU General
 * Public License, version 2
 * https://www.gnu.org/licenses/old-licenses/gpl-2.0.en.html
 */

// Welcome to The Land of Global Varibles, And Inconsistent Naming.
//
// sorry: velocities are kinda hacky guesstimates;
// the naming is horrible just about everywhere;
// this code is probably like 85.2% bugs or bad taste.
//
// note: my use of
// "left" is -x in canvas coordinates;
// "up" is -y in canvas coordinates;
// ideally (x,y) of objects consistenly means (left,top).
//
// note: the noyb2 font only has upper case letters,
// with a few icons in the lower case.

var gDebug = false;
var gShowToasts = gDebug;
var kCanvasName = "canvas"; // match: index.html
var gLifecycle;

// the game was designed based on this default aspect & resolution kindasorta.
var kAspectRatio = 16 / 9;
var kHtmlWidth = 512; // match: index.html
var kHtmlHeight = 288; // match: index.html
Assert(Math.abs(kHtmlWidth / kHtmlHeight - kAspectRatio) < 0.1, "unexpected html aspect ratio");
var gWidth = kHtmlWidth;
var gHeight = kHtmlHeight;
Assert(Math.abs(gWidth / gHeight - kAspectRatio) < 0.1, "unexpected g aspect ratio");
function getBorderFactor() {
  // giving portrait more buffer on left and right for thumbs also
  // because the overall playfield is visually smaller, has fewer pixels
  // than landscape does.
  return getWindowAspect() > 1 ? 0.8 : 0.7;
}
function getWindowAspect() {
  return window.innerWidth / window.innerHeight;
}

// ----------------------------------------

// slightly useful for testing collisions when enabled
// but carries some hacky tech debt
// and can mislead about regular behaviour?!
var kDrawAIPuckTarget = true;

// i.e. attract mode.
var gMonochrome;

// "fade" from all-green to specified colors. see: GameTime01 and color.js
var kGreenFadeInMsec = gDebug ? 1000 : 7000;
// "fade" in from 0 alpha to specified alphas. see: MakeGameStartAnimation.
var kAlphaFadeInMsec = 1000;
var kHighScoreKey = 'pn0g_high';
var gHighScore;

// note that all the timing and stepping stuff is maybe fragile vs. frame rate?!
// although i did try to compensate in the run loop.
var kFPS = 30;
var kTimeStep = 1000 / kFPS;
var kMaybeWasPausedInTheDangedDebuggerMsec = 1000 * 1; // whatevez!
var gStartTime = 0;
var gGameTime = 0;
var gLastFrameTime = gStartTime;
var gFrameCount = 0;
var kMoveStep = 1; // i don't really know what the units are here at all.
var kAIPeriod = 5;
var kAIMoveScale = 1.2;
var gDashedLineCount;
var gDashedLineWidth;
var gXInset;
var gYInset;
var gPaddleHeight;
var gPaddleWidth;
var gPaddleStepSize;
var gPuckHeight;
var gPuckWidth;
var gPauseCenterX;
var gPauseCenterY;
var gPauseRadius;
// this is the lower of 2 mute buttons.
var gUserMutedCenterX;
var gUserMutedCenterY;
var gUserMutedWidth;
var gUserMutedHeight;
var gSparkWidth;
var gSparkHeight;
var gBigFontSize;
var gRegularFontSize;
var gReducedFontSize;
var gSmallFontSize;
var gSmallestFontSize;
var gBigFontSizePt;
var gRegularFontSizePt;
var gReducedFontSizePt;
var gSmallFontSizePt;
var gSmallestFontSizePt;
var gMinVX;
var gMaxVX;
var gPillTextY;
var gPucksTextY;
function ii(v) {
  return Math.floor(0.5 + v);
}
// "absolute" casling helpers to scale values based on actual canvas resolution.
// arbiraryily trying to consistently use sx() for symmetrics e.g. lineWidth.
function sxi(x) {
  return ii(sx(x));
}
function syi(y) {
  return ii(sy(y));
}
function sx(x) {
  return x * gWidth / kHtmlWidth;
}
function sy(y) {
  return y * gHeight / kHtmlHeight;
}
// some scaled values have more change of ever becoming zero than others,
// so these helpers can be used to avoid that if needed e.g. pixel widths.
function sx1(x) {
  return Math.max(1, sxi(x));
}
function sy1(y) {
  return Math.max(1, syi(y));
}
// "percent" scaling helpers.
function gw() {
  var x = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 1;
  return ii(x * gWidth);
}
function gh() {
  var y = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 1;
  return ii(y * gHeight);
}
function RecalculateConstants() {
  gDashedLineCount = syi(8);
  gDashedLineWidth = sx1(2);
  gXInset = sxi(20);
  gYInset = sxi(20);
  gPaddleHeight = gh(0.11);
  gPaddleWidth = sxi(6);
  gPaddleStepSize = gPaddleHeight * 0.2;
  gPuckHeight = gPuckWidth = gh(0.012);
  gPauseCenterX = gw(0.54);
  gPauseCenterY = gh(0.1);
  gPauseRadius = sxi(10);
  gUserMutedCenterX = gw(0.87);
  gUserMutedCenterY = gh(0.85);
  gUserMutedWidth = sxi(40);
  gUserMutedHeight = syi(30);
  gSparkWidth = sxi(2);
  gSparkHeight = syi(2);
  gBigFontSize = NearestEven(gw(0.088));
  gRegularFontSize = NearestEven(gw(0.047));
  gReducedFontSize = NearestEven(gw(0.037));
  gSmallFontSize = NearestEven(gw(0.027));
  gSmallestFontSize = NearestEven(gw(0.018));
  gBigFontSizePt = gBigFontSize + "pt";
  gRegularFontSizePt = gRegularFontSize + "pt";
  gReducedFontSizePt = gReducedFontSize + "pt";
  gSmallFontSizePt = gSmallFontSize + "pt";
  gSmallestFontSizePt = gSmallestFontSize + "pt";
  gMinVX = Math.max(0.5, sxi(1));
  gMaxVX = sxi(14);
  gPillTextY = gh(0.9);
  gPucksTextY = gh(0.85);
}

// anything here below that ends up depending on
// gWidth or gHeight must got up into RecalculateConstants().

var kFontName = "noyb2Regular";
var kStartPuckCount = 1;
var kMaxSparkFrame = 10;
var kEjectCountThreshold = 100;
var kEjectSpeedCountThreshold = 90;
var kPuckArrayInitialSize = 300;
var kSparkArrayInitialSize = 200;
var kBarriersArrayInitialSize = 4;
var kOptionsArrayInitialSize = 6;

// prevent pills from showing up too fast,
// also prevent them from showing up too early.
var kPillSpawnCooldown = 1000 * (gDebug ? 3 : 10);
// this countdown is a block on both player & cpu ill spawning.
// first wait is longer before the very first pill.
// also see the 'must' check later on.
var gPillSpawnCountdown = 1000 * (gDebug ? 3 : 25);
var kSpawnPlayerPillFactor = gDebug ? 0.01 : 0.002;

// actually useful sometimes when debugging.
var gNextID = 0;

// gosh what if we had an actual button api?

// fyi pausing is a feature only of GameState, no other states.
var gDownKeys = {};
function clearKeysPressed() {
  gDownKeys = {};
}
// ok ok "any" is a misnomer in that it is only the valid game keys!
function anyKeyPressed() {
  var downs = Object.keys(gDownKeys);
  var any = downs.length > 0;
  return any;
}
var gDownButtons = {};

// these must match ResetInput.
var gPauseButtonEnabled = false; // really only for GameState.
var gPausePressed = false;
var gClearHighScorePressed = false;
var gUserMutedButtonEnabled = false;
var gUserMutedPressed = false;
var gUpPressed = false;
var gDownPressed = false;
var gStickUp = false;
var gStickDown = false;
var gButtonPressed = false;
var gAddPuckPressed = false;
var gGameOverPressed = false;
var gSpawnPillPressed = false;
var gStepPressed = false;
var gNextMusicPressed = false;
function ResetInput() {
  // abomination.
  gPausePressed = false;
  gUserMutedPressed = false;
  gUpPressed = false;
  gDownPressed = false;
  gStickUp = false;
  gStickDown = false;
  gMoveTargetY = undefined;
  gAddPuckPressed = false;
  gGameOverPressed = false;
  gSpawnPillPressed = false;
  gStepPressed = false;
  gNextMusicPressed = false;
}
var gPointerSide = undefined;
var gEventQueue = [];
var kEventKeyDown = "key_down";
var kEventKeyUp = "key_up";
var kEventTouchStart = "touch_start";
var kEventTouchMove = "touch_move";
var kEventTouchEnd = "touch_end";
var kEventMouseDown = "mouse_down";
var kEventMouseMove = "mouse_move";
var kEventMouseUp = "mouse_up";
var kEventStickUp = "stick_up";
var kEventStickDown = "stick_down";
var kEventButtonDown = "button_down";
var kEventButtonUp = "button_up";

// due to history
// "touch" also kinda
// subsumes mouse pointer.
var gPointerTapTimeout = 350;
var gPointerTimestamps = {
  start: undefined,
  end: undefined
};
var gPointerX = -1;
var gPointerY = -1;
var gPointerScaleX = 1;
var gPointerScaleY = 1;
var gMoveTargetY = undefined;
var gMoveTargetStepY = 0;
function isPointerEnabled() {
  var is = exists(gPointerTimestamps.start);
  return is;
}
function isPointerDown() {
  var is = isPointerEnabled() && isU(gPointerTimestamps.end);
  return is;
}
function cancelTouch() {
  gPointerTimestamps.end = gGameTime;
}
var kScoreIncrement = 1;
var gPlayerScore = 0;
var gCPUScore = 0;

// todo: move all these into GameState.
// todo: use typescript.
var gPucks; // { A:[], B:[] }
var gSparks; // { A:[], B:[] }

var kRoot = -1;
var kSplash = 0; // audio permission via user interaction effing eff.
var kMenu = 1;
var kGame = 2;
var kGameOver = 3;
var kDebug = 4;
var gCanvas;
var gCx;
var gToasts = [];
var gGamepad = undefined;
var kJoystickDeadZone = 0.5;
var gRandom = MakeRandom(0xDEADBEEF);

// ----------------------------------------

// note: not linear, aesthetically on purpose!
function GameTime01(period) {
  var start = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : gStartTime;
  var diff = gGameTime - start;
  period = Math.max(1, period);
  var t = T01nl(diff, period);
  return t;
}

// (all) this really needs to go into GameState???
function ForSide(src, left, right) {
  // due to history, undefined means right.
  if (src == "left") {
    return left;
  }
  return right;
}
function ForOtherSide(src, left, right) {
  return ForSide(src, right, left);
}
function SwapBuffers(buffers) {
  var tmp = buffers.A;
  buffers.A = buffers.B;
  buffers.B = tmp;
}
function Cxdo(fn) {
  // get it?
  gCx.save();
  fn();
  gCx.restore();
}

// canvas' line drawing api is... weird.
function O5(v) {
  return Math.floor(v) + 0.5;
}
function MoveTo(x, y) {
  gCx.moveTo(O5(x), O5(y));
}
function LineTo(x, y) {
  gCx.lineTo(O5(x), O5(y));
}

// as much as i'd like to draw exactly
// on pixels, that ends up making wiggles
// be too wild and ugly.
function WX(v) {
  return v + sx(RandomBool() ? 0 : RandomBool() ? 0.2 : -0.2);
}
function WY(v) {
  return v + sy(RandomBool() ? 0 : RandomBool() ? 0.2 : -0.2);
}
function DrawText(data, align, x, y, size, wiggle, font) {
  if (wiggle != false) {
    x = WX(x);
    y = WY(y);
  }
  gCx.font = size + " " + (font != null ? font : kFontName);
  gCx.textAlign = align;
  gCx.fillText(data.toString(), x, y);
}
function AddSparks(x, y, vx, vy) {
  for (var s = 0; s < 2; s++) {
    var svx = vx * RandomCentered(0, 0.5);
    var svy = vy * RandomCentered(0, 10);
    gSparks.A.push(new Spark(x, y, svx, svy));
  }
}
function StepToasts() {
  if (gToasts.length > 0) {
    var now = Date.now();
    gToasts = gToasts.filter(function (t) {
      return t.end > now;
    });
    if (gToasts.length > 0) {
      var y = gh(0.1);
      Cxdo(function () {
        gCx.fillStyle = "magenta";
        gToasts.forEach(function (t) {
          DrawText(t.msg, "center", gw(0.5), y, gSmallestFontSizePt, false, "monospace");
          y += gSmallestFontSize * 1.1;
          if (y > gh(0.8)) {
            y = gh(0.1);
          }
        });
      });
    }
  }
}
function PushToast(msg) {
  var lifespan = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1000;
  console.log("PushToast", msg);
  gToasts.push({
    msg: msg.toUpperCase(),
    end: Date.now() + lifespan
  });
}
function ClearScreen() {
  gCx.clearRect(0, 0, gWidth, gHeight);
}
function DrawResizing() {
  Cxdo(function () {
    gCx.fillStyle = RandomColor();
    DrawText("R E S I Z I N G", "center", gw(0.5), gh(0.3), gSmallestFontSizePt);
    DrawText("R E S I Z I N G", "center", gw(0.5), gh(0.7), gSmallestFontSizePt);
  });
}
var gDrawTitleLatch = RandomLatch(0.01, 250);
function DrawTitle() {
  var flicker = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : true;
  Cxdo(function () {
    gCx.fillStyle = flicker ? RandomForColor(cyanSpec, 0.8) : rgb255s(cyanDarkSpec.regular);
    DrawText("P N 0 G S T R 0 M", "center", gw(0.5), gh(0.4), gBigFontSizePt, flicker);
    var msg = "ETERNAL BETA";
    if (flicker && gDrawTitleLatch.MaybeLatch(gGameTime)) {
      msg = "ETERNAL BUGS";
    }
    DrawText(msg, "right", gw(0.876), gh(0.48), gRegularFontSizePt, flicker);
  });
}
function DrawBounds() {
  var alpha = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0.5;
  if (!gDebug) {
    return;
  }
  Cxdo(function () {
    gCx.beginPath();
    gCx.rect(gXInset, gYInset, gWidth - gXInset * 2, gHeight - gYInset * 2);
    gCx.lineWidth = 1;
    gCx.strokeStyle = "red";
    gCx.stroke();
  });
  Cxdo(function () {
    gCx.beginPath();
    gCx.moveTo(WX(0), WY(0));
    gCx.lineTo(WX(gWidth), WY(gHeight));
    gCx.moveTo(WX(gWidth), WY(0));
    gCx.lineTo(WX(0), WY(gHeight));
    gCx.strokeStyle = rgb255s(white, alpha / 2);
    gCx.lineWidth = 10;
    gCx.stroke();
    gCx.strokeRect(5, 5, gWidth - 10, gHeight - 10);
  });
  Cxdo(function () {
    gCx.beginPath();
    gCx.moveTo(WX(0), WY(0));
    gCx.lineTo(WX(gCanvas.width), WY(gCanvas.height));
    gCx.moveTo(WX(gCanvas.width), WY(0));
    gCx.lineTo(WX(0), WY(gCanvas.height));
    gCx.strokeStyle = rgb255s(magentaSpec.regular, alpha);
    gCx.lineWidth = 2;
    gCx.stroke();
    gCx.strokeRect(5, 5, gWidth - 10, gHeight - 10);
  });
}

//........................................

/*class*/
function Lifecycle(handlerMap) {
  var self = this;
  self.Init = function () {
    self.handlerMap = handlerMap;
    self.state = kRoot;
    self.handler = handlerMap[self.state]();
    self.paused = false;
    self.stop = false;
    self.transitioned = false;
    self.lastTime = Date.now();
  };
  self.Quit = function () {
    self.stop = true;
  };
  self.Pause = function (pause) {
    var _self$handler;
    self.paused = pause;
    if (exists((_self$handler = self.handler) == null ? void 0 : _self$handler.Pause)) {
      self.handler.Pause(pause);
    }
  };
  self.DrawCRTScanlines = function () {
    if (self.state != kRoot && self.state != kSplash) {
      gCx.beginPath();
      Cxdo(function () {
        var height = 2;
        var skip = 10;
        var step = ii(skip / height);
        var start = ii(gFrameCount / 4) % skip;
        for (var y = gHeight - start; y >= 0; y -= step) {
          gCx.rect(0, y, gWidth, height);
        }
      });
      gCx.fillStyle = scanlineColorStr;
      gCx.fill();
    }
  };
  self.RunLoop = function () {
    if (self.stop) {
      return;
    }
    // note: pausing game time is only handled/supported in GameState.
    var tt = kTimeStep;
    var now = Date.now();
    var clockDiff = now - self.lastTime;

    // oy veh oh brother sheesh barf, trying to not progress time
    // if we were stopped in the debugger.
    if (clockDiff >= kMaybeWasPausedInTheDangedDebuggerMsec) {
      self.lastTime = now;
    } else {
      self.lastTime = now;
      gGameTime += clockDiff;
      var dt = gGameTime - gLastFrameTime;
      if (dt < kTimeStep) {
        tt = kTimeStep - dt;
      } else {
        Assert(exists(self.handler), "RunLoop");
        if (self.transitioned) {
          self.handler = self.handlerMap[self.state]();
          self.transitioned = false;
        }

        // even when paused, must Step to handle input.
        // also call Draw to keep the screen in sync.
        var next = self.handler.Step(self.paused ? 0 : dt);
        self.handler.Draw();
        if (exists(next) && next !== self.state) {
          console.log("transitioned from ".concat(self.state, " to ").concat(next));
          self.transitioned = true;
          self.state = next;
          cancelTouch();
        }
        gLastFrameTime = gGameTime;
        ++gFrameCount;
        self.DrawCRTScanlines();
        if (gShowToasts) {
          StepToasts();
        }
        tt = kTimeStep - (dt - kTimeStep);
      }
    }
    setTimeout(self.RunLoop, Math.max(1, tt));
  };
  self.Init();
}

/*class*/
function GameState() {
  var isAttract = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;
  var self = this;
  self.Init = function () {
    self.isAttract = isAttract;

    // this reset business is kind of a mess...
    RecalculateConstants();
    ResetGlobalStorage();
    ResetInput();
    gPlayerScore = 0;
    gCPUScore = 0;
    gStateMuted = gMonochrome = self.isAttract;
    gPauseButtonEnabled = false;
    gStartTime = gGameTime;
    self.paused = false;
    self.animations = {};

    // warning: this setup is easily confusing wrt left vs. right.
    var lp = {
      x: gXInset,
      y: gh(0.5)
    };
    var rp = {
      x: gWidth - gXInset - gPaddleWidth,
      y: gh(0.5)
    };
    var p1label = self.isAttract ? undefined : "P1";
    var cpulabel = self.isAttract ? undefined : "GPT";
    ForSide(gPointerSide, function () {
      self.playerPaddle = new Paddle({
        isPlayer: !self.isAttract,
        side: "left",
        x: lp.x,
        y: lp.y,
        width: gPaddleWidth,
        height: gPaddleHeight,
        label: p1label,
        isSplitter: true
      });
      self.cpuPaddle = new Paddle({
        isPlayer: false,
        side: "right",
        x: rp.x,
        y: rp.y,
        width: gPaddleWidth,
        height: gPaddleHeight,
        label: cpulabel,
        isSplitter: true,
        isPillSeeker: true
      });
      ForCount(gDebug ? 20 : 1, function () {
        gPucks.A.push(self.CreateStartingPuck(1));
      });
    }, function () {
      self.playerPaddle = new Paddle({
        isPlayer: !self.isAttract,
        side: "right",
        x: rp.x,
        y: rp.y,
        width: gPaddleWidth,
        height: gPaddleHeight,
        label: p1label,
        isSplitter: true
      });
      self.cpuPaddle = new Paddle({
        isPlayer: false,
        side: "left",
        x: lp.x,
        y: lp.y,
        width: gPaddleWidth,
        height: gPaddleHeight,
        label: cpulabel,
        isSplitter: true,
        isPillSeeker: true
      });
      ForCount(gDebug ? 20 : 1, function () {
        gPucks.A.push(self.CreateStartingPuck(-1));
      });
    })();

    // make sure the cpu doesn't get one first, that looks too mean.
    // also make sure neither side gets too many pills before the other.
    self.isCpuPillAllowed = false;
    self.unfairPillCount = 0;
    if (!self.isAttract) {
      self.AddAnimation(MakeGameStartAnimation());
    }
    self.MakeLevels();
    self.level = self.levels[0]; // todo: progression.

    PlayStart();
  };
  self.MakeLevels = function () {
    // just a proof of ocncept under the covers,
    // not actually using the timeouts or count
    // since there is only one level at the moment.
    // bounty: somebody add (and playtest!) more levels.
    // also needs ui of course as levels end/start.
    self.levels = [new Level({
      maxVX: sxi(14),
      speedupFactor: 0.01,
      speedupTimeout: Number.MAX_SAFE_INTEGER,
      puckCount: Number.MAX_SAFE_INTEGER,
      pills: [MakeForcePushProps, MakeDecimateProps, MakeEngorgeProps, MakeSplitProps, MakeDefendProps, MakeOptionProps, MakeNeoProps, MakeChaosProps
      // MakeRadarProps -- todo: disabled due to safar alpha bug, see MakeRadarAnimation.
      ],
      playerPaddle: self.playerPaddle,
      cpuPaddle: self.cpuPaddle
    })];
  };
  self.Pause = function (pause) {
    self.paused = pause;
  };
  self.Step = function (dt) {
    var stepping = false;
    if (self.paused && gStepPressed) {
      stepping = true;
      dt = kTimeStep;
      gStepPressed = false;
    }
    self.level.Step(dt);
    gMaxVX = self.level.maxVX;
    self.MaybeSpawnPills(dt);
    self.ProcessAllInput();
    if (!self.paused || stepping) {
      self.playerPaddle.Step(dt, self);
      self.cpuPaddle.Step(dt, self);
      self.StepMoveables(dt);
      self.StepAnimations(dt);
    }
    if (self.paused && gGameOverPressed) {
      gGameOverPressed = false;
      return kGameOver;
    }
    if (self.paused && gSpawnPillPressed) {
      // todo: move more of the pill code to the Level.
      self.level.playerPill = self.level.playerPowerups.MakeRandomPill(self);
      self.level.cpuPill = self.level.cpuPowerups.MakeRandomPill(self);
      gSpawnPillPressed = false;
    }
    var nextState = self.CheckNoPucks();
    if (exists(nextState)) {
      gPauseButtonEnabled = false;
    }
    return nextState;
  };
  self.MaybeSpawnPills = function (dt) {
    gPillSpawnCountdown = gPillSpawnCountdown - dt;
    var kDiffMax = 2;
    if (isU(self.level.playerPill) && self.unfairPillCount < kDiffMax) {
      self.level.playerPill = self.MaybeSpawnPill(dt, self.level.playerPill, kSpawnPlayerPillFactor, self.level.playerPowerups);
      if (exists(self.level.playerPill)) {
        gPillSpawnCountdown = kPillSpawnCooldown;
        self.unfairPillCount++;
        self.isCpuPillAllowed = true;
      }
    }
    if (isU(self.level.cpuPill) && self.isCpuPillAllowed && self.unfairPillCount > -kDiffMax) {
      self.level.cpuPill = self.MaybeSpawnPill(dt, self.level.cpuPill, kSpawnPlayerPillFactor * 0.7, self.level.cpuPowerups);
      if (exists(self.level.cpuPill)) {
        self.unfairPillCount--;
      }
    }
    Assert(Math.abs(self.unfairPillCount) <= kDiffMax, "unfairPillCount");
  };
  self.MaybeSpawnPill = function (dt, prev, spawnFactor, maker) {
    var can_paused = !self.paused;
    var can_attract = !self.isAttract;
    var can_timer = gPillSpawnCountdown <= 0;
    if (can_paused && can_attract && can_timer) {
      var must = gPillSpawnCountdown < kPillSpawnCooldown * 2;
      var can_factor = RandomBool(gDebug ? 0.1 : spawnFactor);
      var can_empty = isU(prev);
      var can = can_factor && can_empty;
      if (must || can) {
        return maker.MakeRandomPill(self);
      }
    }
    return undefined;
  };
  self.CheckNoPucks = function () {
    var empty = gPucks.A.length == 0;
    if (!self.isAttract) {
      return empty ? kGameOver : undefined;
    } else {
      if (empty) {
        gPucks.A.push(self.CreateStartingPuck(RandomSign()));
      }
      return undefined;
    }
    Assert(false, "if/else fail");
  };
  self.StepAnimations = function (dt) {
    Object.entries(self.animations).forEach(function (_ref) {
      var _ref2 = _slicedToArray(_ref, 2),
        id = _ref2[0],
        anim = _ref2[1];
      var done = anim.Step(dt, self);
      if (done) {
        delete self.animations[id];
      }
    });
  };
  self.CreateStartingPuck = function (sign) {
    var p = new Puck({
      x: gw(RandomRange(0.45, 0.48)),
      y: self.isAttract ? gh(RandomRange(0.4, 0.6)) : gh(0.3),
      vx: sign * gMaxVX / 5,
      vy: self.isAttract ? RandomCentered(0, 2, 1) : 0.3,
      ur: true
    });
    return p;
  };
  self.CreateRandomPuck = function () {
    var p = new Puck({
      x: gw(RandomRange(1 / 8, 7 / 8)),
      y: gh(RandomRange(1 / 8, 7 / 8)),
      vx: RandomRange(gMaxVX * 0.3, gMaxVX * 0.5),
      vy: RandomCentered(1, 0.5),
      ur: true
    });
    return p;
  };
  self.ProcessAllInput = function () {
    if (!self.isAttract) {
      gEventQueue.forEach(function (event, i) {
        event.updateFn();
        self.ProcessOneInput();
      });
      gEventQueue = [];
    }
  };
  self.ProcessOneInput = function () {
    if (gClearHighScorePressed) {
      if (self.paused) {
        gHighScore = undefined;
        localStorage.removeItem(kHighScoreKey);
      }
      gClearHighScorePressed = false;
    }
    if (gButtonPressed) {
      gPausePressed = true;
    }
    if (gPauseButtonEnabled && isPointerDown()) {
      gPausePressed = Distance2(gPointerX, gPointerY, gPauseCenterX, gPauseCenterY) < Pow2(gPauseRadius * 2);
    }
    if (gPausePressed) {
      gLifecycle.Pause(!self.paused); // i apologize.
      gPausePressed = false;
    }
    if (self.paused && gAddPuckPressed) {
      ForCount(10, function () {
        gPucks.A.push(self.CreateRandomPuck());
      });
      gAddPuckPressed = false;
    }
    if (self.paused) {
      return;
    }
  };
  self.AddAnimation = function (a) {
    self.animations[gNextID++] = a;
  };
  self.StepMoveables = function (dt) {
    self.MovePucks(dt);
    self.MoveSparks(dt);
    self.MovePills(dt);
  };
  self.UpdateScore = function (p) {
    self.level.OnPuckLost();
    var wasLeft = p.x < gw(0.5);
    if (wasLeft) {
      ForSide(gPointerSide, function () {
        gCPUScore += kScoreIncrement;
      }, function () {
        gPlayerScore += kScoreIncrement;
      })();
    } else {
      ForSide(gPointerSide, function () {
        gPlayerScore += kScoreIncrement;
      }, function () {
        gCPUScore += kScoreIncrement;
      })();
    }
  };
  self.MovePucks = function (dt) {
    gPucks.B.clear();
    gPucks.A.forEach(function (p, i) {
      p.Step(dt);
      if (!self.isAttract && !p.alive) {
        self.UpdateScore(p);
      }
      if (p.alive) {
        // options, barriers, neos do not split pucks,
        // only the main player & cpu paddles.
        var splits = p.AllPaddlesCollision([self.playerPaddle, self.cpuPaddle]);
        p.WallsCollision();
        p.BarriersCollision(self.playerPaddle.barriers.A);
        p.BarriersCollision(self.cpuPaddle.barriers.A);
        p.OptionsCollision(self.playerPaddle.options.A);
        p.OptionsCollision(self.cpuPaddle.options.A);
        p.NeoCollision(self.playerPaddle.neo);
        p.NeoCollision(self.cpuPaddle.neo);
        gPucks.B.push(p);
        if (!self.isAttract) {
          gPucks.B.pushAll(splits);
        }
        self.playerPaddle.OnPuck(p, i);
        self.cpuPaddle.OnPuck(p, i);
      }
    });
    SwapBuffers(gPucks);
  };
  self.MoveSparks = function (dt) {
    gSparks.B.clear();
    gSparks.A.forEach(function (s) {
      s.Step(dt);
      s.alive && gSparks.B.push(s);
    });
    SwapBuffers(gSparks);
  };
  self.MovePills = function (dt) {
    self.MovePlayerPill(dt);
    self.MoveCPUPill(dt);
  };
  self.MovePlayerPill = function (dt) {
    if (exists(self.level.playerPill)) {
      self.level.playerPill = self.level.playerPill.Step(dt, self);
    }
    if (exists(self.level.playerPill)) {
      self.level.playerPill = self.level.playerPill.AllPaddlesCollision(self, [self.playerPaddle]);
    }
  };
  self.MoveCPUPill = function (dt) {
    if (exists(self.level.cpuPill)) {
      self.level.cpuPill = self.level.cpuPill.Step(dt, self);
    }
    if (exists(self.level.cpuPill)) {
      self.level.cpuPill = self.level.cpuPill.AllPaddlesCollision(self, [self.cpuPaddle]);
    }
  };
  self.Alpha = function (alpha) {
    if (alpha == undefined) {
      alpha = 1;
    }
    return alpha * (self.isAttract ? 0.3 : 1);
  };
  self.DrawMidLine = function () {
    if (!self.isAttract) {
      Cxdo(function () {
        gCx.beginPath();
        var dashStep = (gHeight - 2 * gYInset) / (gDashedLineCount * 2);
        var x = gw(0.5) - ii(gDashedLineWidth / 2);
        for (var y = gYInset + dashStep / 2; y < gHeight - gYInset; y += dashStep * 2) {
          var ox = RandomCentered(0, 0.5);
          gCx.rect(x + ox, y, gDashedLineWidth, dashStep);
        }
        gCx.fillStyle = RandomGreen(0.6);
        gCx.fill();
      });
    }
  };
  self.DrawCRTOutline = function () {
    if (!self.isAttract) {
      Cxdo(function () {
        CreateCRTOutlinePath();
        gCx.lineWidth = sx1(4);
        gCx.strokeStyle = crtOutlineColorStr;
        gCx.stroke();
      });
    }
  };
  self.DrawScoreHeader = function () {
    Cxdo(function () {
      var style = RandomGrey(self.Alpha(0.3));
      ForSide(self.isAttract ? "right" : gPointerSide, function () {
        gCx.fillStyle = style;
        if (exists(gHighScore)) {
          DrawText("HI: " + gHighScore, "left", gw(0.2), gh(0.12), gSmallFontSizePt);
        }
        if (!self.isAttract) {
          DrawText("GPT: " + gCPUScore, "right", gw(0.8), gh(0.22), gRegularFontSizePt);
          DrawText("P1: " + gPlayerScore, "left", gw(0.2), gh(0.22), gRegularFontSizePt);
        }
      }, function () {
        gCx.fillStyle = style;
        if (exists(gHighScore)) {
          DrawText("HI: " + gHighScore, "right", gw(0.8), gh(0.12), gSmallFontSizePt);
        }
        if (!self.isAttract) {
          DrawText("GPT: " + gCPUScore, "left", gw(0.2), gh(0.22), gRegularFontSizePt);
          DrawText("P1: " + gPlayerScore, "right", gw(0.8), gh(0.22), gRegularFontSizePt);
        }
      })();
    });
  };
  self.DrawTouchTarget = function () {
    // bug: yet another safari ios/ipados bug? the clipping doesn't
    // actually correctly work and so the butt end of the pointer
    // shows through a pixel or two, all very strange. so at least
    // making this pointer color == crt outline color to be less obvi.
    if (exists(gMoveTargetY) && !self.isAttract) {
      var xsize = syi(12);
      var ysize = syi(7);
      var xoff = xyNudge(gMoveTargetY, ysize, 12, gPointerSide);
      ForSide(gPointerSide, function () {
        var left = xoff;
        var right = left + xsize;
        var y = WY(gMoveTargetY);
        Cxdo(function () {
          gCx.beginPath();
          gCx.moveTo(left, y - ysize);
          gCx.lineTo(left, y + ysize);
          gCx.lineTo(right, y);
          gCx.fillStyle = crtOutlineColorStr;
          gCx.fill();
        });
      }, function () {
        var right = gw() + xoff;
        var left = right - xsize;
        var y = WY(gMoveTargetY);
        Cxdo(function () {
          gCx.beginPath();
          gCx.moveTo(right, y - ysize);
          gCx.lineTo(right, y + ysize);
          gCx.lineTo(left, y);
          gCx.fillStyle = crtOutlineColorStr;
          gCx.fill();
        });
      })();
    }
  };
  self.DrawPauseButton = function () {
    if (!self.isAttract && isPointerEnabled()) {
      gPauseButtonEnabled = true;
      var cx = WX(gPauseCenterX);
      var cy = WY(gPauseCenterY);
      if (!self.paused) {
        Cxdo(function () {
          gCx.beginPath();
          gCx.arc(cx, cy, gPauseRadius, 0, k2Pi, true);
          var o = gPauseRadius * 0.3;
          gCx.moveTo(cx - o, cy - o * 2);
          gCx.lineTo(cx - o, cy + o * 2);
          gCx.moveTo(cx + o, cy - o * 2);
          gCx.lineTo(cx + o, cy + o * 2);
          gCx.lineWidth = 2;
          gCx.strokeStyle = RandomGreen(0.25);
          gCx.stroke();
        });
      } else {
        Cxdo(function () {
          gCx.beginPath();
          gCx.arc(cx, cy, gPauseRadius, 0, k2Pi, true);
          var o = gPauseRadius * 0.4;
          gCx.moveTo(cx - o, cy - o);
          gCx.lineTo(cx + o, cy);
          gCx.lineTo(cx - o, cy + o);
          gCx.lineTo(cx - o, cy - o);
          gCx.strokeStyle = RandomGreenSolid();
          gCx.stroke();
        });
      }
    }
  };
  self.DrawAnimations = function () {
    Object.values(self.animations).forEach(function (a) {
      return a.Draw(self);
    });
  };
  self.Draw = function () {
    if (!self.isAttract) {
      ClearScreen();
    }
    if (!gResizing) {
      // painter's z-algorithm here below, keep important things last.

      self.DrawMidLine();
      self.DrawScoreHeader();
      gPucks.A.forEach(function (p) {
        // pucks going away from player.
        if (Sign(p.vx) == ForSide(gPointerSide, 1, -1)) {
          p.Draw(self.Alpha());
        }
      });
      gPucks.A.forEach(function (p) {
        // pucks attacking the player.
        if (Sign(p.vx) == ForSide(gPointerSide, -1, 1)) {
          p.Draw(self.Alpha());
        }
      });
      self.playerPaddle.Draw(self.Alpha(), self);
      self.cpuPaddle.Draw(self.Alpha(), self);
      self.level.Draw(self.Alpha());
      gSparks.A.forEach(function (s) {
        s.Draw(self.Alpha());
      });
      self.DrawPauseButton();
      self.DrawTouchTarget();
      self.DrawAnimations(); // late/high z order so the animations can clear the screen if desired.
      self.DrawCRTOutline();
      if (self.paused) {
        gCx.fillStyle = "darkblue";
        DrawText("P A U S E D", "center", WX(gw(0.5)), WY(gh(0.55)), gBigFontSizePt);
      }
    }
    self.DrawDebug();
  };
  self.DrawDebug = function () {
    if (!gDebug) {
      return;
    }
    DrawBounds(0.2);
    self.cpuPaddle.DrawDebug();
    Cxdo(function () {
      gCx.fillStyle = "magenta";
      DrawText("".concat(self.unfairPillCount, " ").concat(gPillSpawnCountdown), "left", gw(0.2), gh(0.4), gSmallestFontSizePt);
      gCx.fillStyle = RandomGrey();
      var mvx = gPucks.A.reduce(function (m, p) {
        return Math.max(m, Math.abs(p.vx));
      }, 0);
      DrawText(F(mvx.toString()), "left", gw(0.1), gh(0.1), gSmallFontSizePt);
      gCx.fillStyle = "red";
      DrawText(F(self.level.maxVX.toString()), "left", gw(0.1), gh(0.1) + gSmallFontSize, gSmallFontSizePt);
      gCx.beginPath();
      gCx.rect(gPointerX - 5, gPointerY - 5, 10, 10);
      gCx.fillStyle = RandomColor();
      gCx.fill();
      gCx.fillStyle = RandomBlue(0.5);
      DrawText(gPucks.A.length, "center", gw(0.6), gh(0.9), gRegularFontSizePt);
      DrawText(gFrameCount.toString(), "right", gw(0.9), gh(0.9), gSmallFontSizePt);
      gCx.fillStyle = RandomForColor(blueSpec, 0.3);
      DrawText("D E B U G", "center", gw(0.5), gh(0.8), gBigFontSizePt);
    });
  };
  self.Init();
}

/*class*/
function RootState(nextState) {
  var self = this;
  self.Init = function () {
    self.nextState = nextState;
  };
  self.Step = function () {
    return self.nextState;
  };
  self.Draw = function () {};
  self.Init();
}

/*class*/
function SplashState() {
  var self = this;
  self.Init = function () {
    ResetInput();
    LoadAudio();
  };
  self.Step = function () {
    var nextState = undefined;
    nextState = self.ProcessAllInput();
    return nextState;
  };
  self.Draw = function () {
    ClearScreen();
    if (gResizing) {
      DrawResizing();
    } else {
      DrawTitle(false);
      self.DrawWarning();
      if (getWindowAspect() <= 1) {
        var rots = ["|", "/", "--", "\\", "|", "/", "--", "\\"];
        var i = ii(gFrameCount / 10) % rots.length;
        Cxdo(function () {
          gCx.fillStyle = rgb255s(yellowSpec.strong);
          DrawText("".concat(rots[i], "  r   TRY LANDSCAPE   r  ").concat(rots[i]), "center", gw(0.5), gh(0.9), gRegularFontSizePt, false);
        });
      }
    }
  };
  self.DrawWarning = function () {
    gCx.fillStyle = warningColorStr;
    var lineFactor = 1.5;
    var y0 = gh(0.55);
    Cxdo(function () {
      gWarning.forEach(function (t, i) {
        DrawText(t, "center", gw(0.5), y0 + i * (gSmallestFontSize * lineFactor), gSmallestFontSizePt, false, "monospace");
      });
    });
  };
  self.ProcessAllInput = function () {
    var nextState = undefined;
    gEventQueue.forEach(function (event, i) {
      event.updateFn();
      if (isU(nextState)) {
        nextState = self.ProcessOneInput();
      }
    });
    gEventQueue = [];
    return nextState;
  };
  self.ProcessOneInput = function () {
    if (anyKeyPressed() || gStickUp || gStickDown || gButtonPressed || isPointerDown()) {
      return kMenu;
    }
    return undefined;
  };
  self.Init();
}

/*class*/
function MenuState() {
  var self = this;
  self.Init = function () {
    ResetInput();
    gUserMutedButtonEnabled = true;
    self.attract = new GameState(true);
    self.timeout = gDebug ? 1 : 1000 * 1.5;
    self.started = gGameTime;
    BeginMusic();
  };
  self.Step = function (dt) {
    var nextState = undefined;
    self.attract.Step(dt);
    nextState = self.ProcessAllInput();
    if (exists(nextState)) {
      StopAudio();
      gUserMutedButtonEnabled = false;
    }
    return nextState;
  };
  self.ProcessAllInput = function () {
    var nextState = undefined;
    var hasEvents = gEventQueue.length > 0;
    if (hasEvents) {
      gEventQueue.forEach(function (event, i) {
        event.updateFn();
        // use only the first event that changes the state.
        if (isU(nextState) && event.type != kEventTouchMove && event.type != kEventMouseMove) {
          nextState = self.ProcessOneInput();
        }
      });
      gEventQueue = [];
    }
    return nextState;
  };
  self.ProcessOneInput = function () {
    var nextState = undefined;
    if (gUserMutedButtonEnabled && isPointerDown() && Math.abs(gUserMutedCenterX - gPointerX) < gUserMutedWidth * 0.8 && Math.abs(gUserMutedCenterY - gPointerY) < gUserMutedHeight * 0.8) {
      gUserMutedPressed = true;
    }
    if (gUserMutedPressed) {
      gUserMuted = !gUserMuted;
      gUserMuted ? StopAudio() : BeginMusic();
      gUserMutedPressed = false;
    } else if (gNextMusicPressed) {
      BeginMusic();
    } else if (gGameTime - self.started > self.timeout && (
    // not allowing non-controlling keys to start the game,
    // on the other hand i think users would find it odd
    // not to ble able to press a controller button to start.
    gUpPressed || gDownPressed || gStickUp || gStickDown || gButtonPressed || isPointerDown())) {
      nextState = kGame;
    }
    return nextState;
  };
  self.Draw = function (advance) {
    ClearScreen();
    if (gResizing) {
      self.started = gGameTime;
      DrawResizing();
    } else {
      Cxdo(function () {
        self.attract.Draw();
        DrawTitle();
        self.DrawAudio();
        gCx.fillStyle = RandomGreen();
        var msg = "CONTROLS: TAP / W S / ARROWS / GAMEPAD";
        if (gGameTime - self.started <= self.timeout) {
          var msg = "LOADING...";
          // the "start game" tap decides left vs. right for P1.
          gPointerSide = undefined;
        }
        DrawText(msg, "center", gw(0.5), gh(0.5) + 80, gSmallFontSizePt);
      });
    }
  };
  self.DrawAudio = function () {
    self.DrawMusicName();
    self.DrawMuteMusicButton();
  };
  self.DrawMusicName = function () {
    if (!gUserMuted) {
      var msg = "fetching music";
      if (exists(gMusicID)) {
        var name = gAudio.id2name[gMusicID];
        var meta = gAudio.name2meta[name];
        if (exists(meta == null ? void 0 : meta.basename) && !!(meta != null && meta.loaded)) {
          var msg = "norcalledmvsic ".concat(meta.basename);
        }
      }
      Cxdo(function () {
        gCx.fillStyle = rgb255s(greySpec.strong, 0.5);
        DrawText(msg.toUpperCase(), "right", gw(0.91), gh(0.95), gSmallestFontSizePt, false);
      });
    }
  };
  self.DrawMuteMusicButton = function () {
    // todo: this is just about the absolute worst kid of button ux.
    var cx = gUserMutedCenterX;
    var cy = gUserMutedCenterY;
    var ox = gUserMutedWidth / 2;
    var oy = gUserMutedHeight / 2;
    var label = gUserMuted ? "m" : "m";
    Cxdo(function () {
      gCx.beginPath();
      gCx.roundRect(cx - ox, cy - oy, gUserMutedWidth, gUserMutedHeight, 10);
      gCx.fillStyle = backgroundColorStr;
      gCx.fill();
      gCx.roundRect(cx - ox, cy - oy, gUserMutedWidth, gUserMutedHeight, 10);
      if (gUserMuted) {
        gCx.moveTo(cx - ox + 2, cy - oy + 2);
        gCx.lineTo(cx + ox - 2, cy + oy - 2);
      }
      gCx.fillStyle = gCx.strokeStyle = RandomGreen(0.3);
      gCx.lineWidth = sx1(2);
      gCx.stroke();
      DrawText(label, "center", cx, cy + gUserMutedHeight * 0.32, gRegularFontSizePt);
    });
  };
  self.Init();
}

/*class*/
function GameOverState() {
  var self = this;
  self.Init = function () {
    ResetInput();
    self.timeoutMsg = 1000 * 2;
    self.timeoutEnd = 1000 * 10;
    self.started = gGameTime;
    self.finalScore = gPlayerScore - gCPUScore;
    PlayGameOver();
    // fugly i know.
    gPointerSide = undefined;
  };
  self.Step = function () {
    var nextState = undefined;
    self.gotoMenu = gGameTime - self.started > self.timeoutMsg;
    nextState = self.ProcessAllInput();
    return nextState;
  };
  self.ProcessAllInput = function () {
    var nextState = undefined;
    var hasEvents = gEventQueue.length > 0;
    if (hasEvents) {
      gEventQueue.forEach(function (event, i) {
        event.updateFn();
        nextState = self.ProcessOneInput();
      });
      gEventQueue = [];
    }
    if (exists(nextState)) {
      gHighScore = Math.max(self.finalScore, aorb(gHighScore, self.finalScore));
      localStorage.setItem(kHighScoreKey, gHighScore);
    }
    return nextState;
  };
  self.ProcessOneInput = function () {
    var nextState = undefined;
    if (self.gotoMenu && (anyKeyPressed() || gStickUp || gStickDown || gButtonPressed || isPointerDown())) {
      nextState = kMenu;
    } else if (isU(nextState) && gGameTime - self.started > self.timeoutMsg + self.timeoutEnd) {
      nextState = kMenu;
    }
    return nextState;
  };
  self.Draw = function () {
    ClearScreen();
    var x = gw(0.5);
    var y = gh(0.5) - 20;
    var nextState = undefined;
    Cxdo(function () {
      gCx.fillStyle = RandomMagentaSolid();
      if (isU(gHighScore) || self.finalScore > gHighScore) {
        DrawText("NEW HIGH SCORE!", "center", x, y - 80, gRegularFontSizePt);
      }
      var msg = "FINAL SCORE: ".concat(gPlayerScore, " - ").concat(gCPUScore, " = ").concat(self.finalScore);
      DrawText(msg, "center", x, y, gRegularFontSizePt);
      if (self.gotoMenu) {
        gCx.fillStyle = RandomYellowSolid();
        DrawText("GO TO MENU", "center", x, y + 120, gReducedFontSizePt);
      }
    });
    return nextState;
  };
  self.Init();
}

/*class*/
function DebugState() {
  var self = this;
  self.Init = function () {};
  self.Step = function () {};
  self.Draw = function () {
    ClearScreen();
  };
  self.Init();
}

//........................................

function GamepadJoystickMove(e) {
  if (Math.abs(e.verticalValue) <= kJoystickDeadZone) {
    gEventQueue.push({
      type: kEventStickUp,
      updateFn: function updateFn() {
        gStickUp = false;
        gStickDown = false;
        gMoveTargetY = undefined;
      }
    });
  }
  if (e.verticalValue < -kJoystickDeadZone) {
    gEventQueue.push({
      type: kEventStickUp,
      updateFn: function updateFn() {
        gStickUp = true;
        gStickDown = false;
        gMoveTargetY = undefined;
      }
    });
  }
  if (e.verticalValue > kJoystickDeadZone) {
    gEventQueue.push({
      type: kEventStickDown,
      updateFn: function updateFn() {
        gStickUp = false;
        gStickDown = true;
        gMoveTargetY = undefined;
      }
    });
  }
}
function GamepadButtonChange(e) {
  // dpad buttons up & down move player paddle.
  if (e.gamepad.gamepad.buttons[StandardMapping.Button.D_PAD_UP].pressed) {
    gEventQueue.push({
      type: kEventButtonDown,
      updateFn: function updateFn() {
        gDownButtons[StandardMapping.Button.D_PAD_UP] = true;
      }
    });
    return;
  } else {
    gEventQueue.push({
      type: kEventButtonUp,
      updateFn: function updateFn() {
        delete gDownButtons[StandardMapping.Button.D_PAD_UP];
      }
    });
  }
  if (e.gamepad.gamepad.buttons[StandardMapping.Button.D_PAD_BOTTOM].pressed) {
    gEventQueue.push({
      type: kEventButtonDown,
      updateFn: function updateFn() {
        gDownButtons[StandardMapping.Button.D_PAD_BOTTOM] = true;
      }
    });
    return;
  } else {
    gEventQueue.push({
      type: kEventButtonUp,
      updateFn: function updateFn() {
        delete gDownButtons[StandardMapping.Button.D_PAD_BOTTOM];
      }
    });
  }

  // do nothing for dpad left & right, to avoid confusion.
  if (e.gamepad.gamepad.buttons[StandardMapping.Button.D_PAD_LEFT].pressed) {
    return;
  }
  if (e.gamepad.gamepad.buttons[StandardMapping.Button.D_PAD_RIGHT].pressed) {
    return;
  }

  // all other buttons are really kinda just used for pause.
  // a quick and dirty hack, doesn't track each button individually.
  if (e.gamepad.gamepad.buttons.some(function (b) {
    return b.pressed || b.value > 0;
  })) {
    gEventQueue.push({
      type: kEventButtonDown,
      updateFn: function updateFn() {
        gButtonPressed = true;
      }
    });
  } else {
    gEventQueue.push({
      type: kEventButtonUp,
      updateFn: function updateFn() {
        gButtonPressed = false;
      }
    });
  }
}
function RegisterGamepad(e) {
  RemoveGamepad(e);
  e.gamepad.addEventListener("joystickmove", GamepadJoystickMove, StandardMapping.Axis.JOYSTICK_LEFT);
  e.gamepad.addEventListener("joystickmove", GamepadJoystickMove, StandardMapping.Axis.JOYSTICK_RIGHT);
  e.gamepad.addEventListener("buttonvaluechange", GamepadButtonChange);
  gGamepad = e.gamepad.gamepad;
}
function RemoveGamepad() {
  if (exists(gGamepad)) {
    gGamepad.removeEventListener("buttonvaluechange", GamepadButtonChange);
    gGamepad.removeEventListener("joystickmove", StandardMapping.Axis.JOYSTICK_RIGHT);
    gGamepad.removeEventListener("joystickmove", StandardMapping.Axis.JOYSTICK_LEFT);
    gGamepad = undefined;
  }
}
function PointerProcess(t, updateFn) {
  var cvrect = gCanvas.getBoundingClientRect();
  var cvx = cvrect.x + window.scrollX;
  var cvy = cvrect.y + window.scrollY;
  // "regular" non-game-transformed screen pixel coordinates.
  // todo: handle window.devicePixelRatio.
  var tx = t.clientX - cvx;
  var ty = t.clientY - cvy;
  Assert(exists(updateFn), "PointerProcess");
  updateFn(tx, ty);
}
function SetPointerTarget(tx, ty, type) {
  gEventQueue.push({
    type: type,
    updateFn: function updateFn() {
      gPointerX = tx;
      gPointerY = ty;
      gMoveTargetY = ty;
    }
  });
}
function TouchStart(e) {
  e.preventDefault();
  PointerProcess(e.touches[0], function (tx, ty) {
    if (isU(gPointerSide)) {
      gPointerSide = tx < gw(0.5) ? "left" : "right";
    }
    SetPointerTarget(tx, ty, kEventTouchStart);
    gPointerTimestamps = {
      start: gGameTime,
      end: undefined
    };
  });
}
function TouchMove(e) {
  e.preventDefault();
  if (isU(gPointerTimestamps.end)) {
    PointerProcess(e.touches[0], function (tx, ty) {
      SetPointerTarget(tx, ty, kEventTouchMove);
    });
  }
}
function TouchEnd(e) {
  e.preventDefault();
  var startTime = gPointerTimestamps.start;
  var endTime = gGameTime;
  gEventQueue.push({
    type: kEventTouchEnd,
    updateFn: function updateFn() {
      gMoveTargetStepY = 0;
      gPointerTimestamps.end = endTime;
    }
  });
}
function MouseDown(e) {
  e.preventDefault();
  PointerProcess(e, function (tx, ty) {
    if (isU(gPointerSide)) {
      gPointerSide = tx < gw(0.5) ? "left" : "right";
    }
    SetPointerTarget(tx, ty, kEventMouseDown);
    gPointerTimestamps = {
      start: gGameTime,
      end: undefined
    };
  });
}
function MouseMove(e) {
  if (isU(gPointerTimestamps.end)) {
    PointerProcess(e, function (tx, ty) {
      SetPointerTarget(tx, ty, kEventMouseMove);
    });
  }
}
function MouseUp(e) {
  e.preventDefault();
  var startTime = gPointerTimestamps.start;
  var endTime = gGameTime;
  gEventQueue.push({
    type: kEventMouseUp,
    updateFn: function updateFn() {
      gMoveTargetStepY = 0;
      gPointerTimestamps.end = endTime;
    }
  });
}
function ResetGlobalStorage() {
  gPucks = {
    A: new ReuseArray(kPuckArrayInitialSize),
    B: new ReuseArray(kPuckArrayInitialSize)
  };
  gSparks = {
    A: new ReuseArray(kSparkArrayInitialSize),
    B: new ReuseArray(kSparkArrayInitialSize)
  };
}
function OnOrientationChange() {
  OnResize();
}

// the web is a pi(l)e of feces.

var gResizing = false;
var gLastArea = 0;
var gMatchedAreaCount = 0;
var kMatchedAreaRequirement = 10;
function OnResize() {
  if (exists(gLifecycle)) {
    if (gLifecycle.state == kGame) {
      gLifecycle.Pause(true);
    } else if (!gResizing) {
      gResizing = true;
      gLastArea = 0;
      gMatchedAreaCount = 0;
      ResizePoll();
    }
  }
}
function ResizePoll() {
  if (gMatchedAreaCount < kMatchedAreaRequirement) {
    DoResize();
    CheckResizeMatch();
    setTimeout(ResizePoll, 100);
  }
}
function DoResize() {
  // todo: handle window.devicePixelRatio.
  var borderFactor = getBorderFactor();
  var w = window.innerWidth * borderFactor;
  var h = window.innerHeight * borderFactor;
  var wa = w / h;
  if (wa >= kAspectRatio) {
    w = h * kAspectRatio;
  } else {
    h = w * 1 / kAspectRatio;
  }
  gCanvas.width = gWidth = w;
  gCanvas.height = gHeight = h;
}
function CheckResizeMatch() {
  var area = gWidth * gHeight;
  if (area == gLastArea) {
    if (++gMatchedAreaCount == kMatchedAreaRequirement) {
      gResizing = false;
      Start(); // yes, just a full reboot. :-(
    }
  } else {
    gMatchedAreaCount = 0;
    gLastArea = area;
  }
}
function CreateCRTOutlinePath() {
  // beware: this is specifically not in Cxdo().
  var inset = ii(Math.min(gXInset, gYInset) * 0.8);
  gCx.beginPath();
  gCx.moveTo(inset, inset);
  gCx.bezierCurveTo(inset, 0, gw(1) - inset, 0, gw(1) - inset, inset);
  gCx.bezierCurveTo(gw(1), inset, gw(1), gh(1) - inset, gw(1) - inset, gh(1) - inset);
  gCx.moveTo(inset, inset);
  gCx.bezierCurveTo(0, inset, 0, gh(1) - inset, inset, gh(1) - inset);
  gCx.bezierCurveTo(inset, gh(1), gw(1) - inset, gh(1), gw(1) - inset, gh(1) - inset);
}
function ResetClipping() {
  gCx.clearRect(0, 0, gw(), gh());
  self.CreateCRTOutlinePath();
  gCx.clip();
}
function Start() {
  var hs = localStorage.getItem(kHighScoreKey);
  if (exists(hs)) {
    gHighScore = parseInt(hs);
  }
  gCanvas = document.getElementById(kCanvasName);
  gCx = gCanvas.getContext('2d');
  gCx.MoveTo = MoveTo;
  gCx.LineTo = LineTo;
  DoResize();
  RecalculateConstants();
  ResetClipping();
  var handlerMap = {};
  // ugh the splash is just so we can get
  // user input so we can actually play sounds.
  handlerMap[kRoot] = function () {
    return new RootState(kSplash);
  };
  handlerMap[kSplash] = function () {
    return new SplashState();
  };
  handlerMap[kMenu] = function () {
    return new MenuState();
  };
  handlerMap[kGame] = function () {
    return new GameState();
  };
  handlerMap[kGameOver] = function () {
    return new GameOverState();
  };
  if (exists(gLifecycle)) {
    gLifecycle.Quit();
  }
  gLifecycle = new Lifecycle(handlerMap);
  gLifecycle.RunLoop();
  StopAudio();
}

// er, i'm lazy and never un-register so be sure this only gets called once.
var initEventsRun = false;
function InitEvents() {
  Assert(!initEventsRun, "initEventsRun");
  initEventsRun = true;
  Gamepads.start();
  Gamepads.addEventListener('connect', RegisterGamepad);
  Gamepads.addEventListener('disconnect', RemoveGamepad);
  window.addEventListener('touchstart', TouchStart);
  window.addEventListener('touchmove', TouchMove);
  window.addEventListener('touchend', TouchEnd);
  window.addEventListener('mousedown', MouseDown);
  window.addEventListener('mousemove', MouseMove);
  window.addEventListener('mouseup', MouseUp);
  // trying to stop swipe/scrolling by fingers.
  document.addEventListener('touchstart', function (e) {
    e.preventDefault();
  });
  document.addEventListener('touchmove', function (e) {
    e.preventDefault();
  });
  document.addEventListener('touchend', function (e) {
    e.preventDefault();
  });
  window.addEventListener('keydown', function (e) {
    if (e.repeat) {
      return;
    }

    // keyCodes do not respect e.g. QWERTZ vs. QWERTY, they assume QWEbbRTY.
    // that sort of works for WASD pattern, but maybe not for all debug commands.
    if (e.keyCode == 38 || e.keyCode == 87) {
      // arrow up, w
      e.preventDefault();
      gEventQueue.push({
        type: kEventKeyDown,
        updateFn: function updateFn() {
          gUpPressed = true;
          gMoveTargetY = undefined;
          gDownKeys[e.keyCode] = true;
          // assuming w/s on left hand side of keyboard,
          // arrow up/down on right hand side.
          if (isU(gPointerSide)) {
            gPointerSide = e.keyCode == 38 ? "right" : "left";
          }
        }
      });
    }
    if (e.keyCode == 40 || e.keyCode == 83) {
      // arrow down, s
      e.preventDefault();
      gEventQueue.push({
        type: kEventKeyDown,
        updateFn: function updateFn() {
          gDownPressed = true;
          gMoveTargetY = undefined;
          gDownKeys[e.keyCode] = true;
          // assuming w/s on left hand side of keyboard,
          // arrow up/down on right hand side.
          if (isU(gPointerSide)) {
            gPointerSide = e.keyCode == 40 ? "right" : "left";
          }
        }
      });
    }
    if (e.keyCode == 80 || e.keyCode == 19) {
      // 'p', 'pause'
      gEventQueue.push({
        type: kEventKeyDown,
        updateFn: function updateFn() {
          gPausePressed = true;
          gDownKeys[e.keyCode] = true;
        }
      });
    }
    if (e.keyCode == 32) {
      // ' '
      gEventQueue.push({
        type: kEventKeyDown,
        updateFn: function updateFn() {
          gDownKeys[e.keyCode] = true;
        }
      });
    }
    if (e.keyCode == 65) {
      // 'a'
      gEventQueue.push({
        type: kEventKeyDown,
        updateFn: function updateFn() {
          if (gDebug) {
            gAddPuckPressed = true;
          }
        }
      });
    }
    if (e.keyCode == 81) {
      // 'q'
      gEventQueue.push({
        type: kEventKeyDown,
        updateFn: function updateFn() {
          if (gDebug) {
            gGameOverPressed = true;
          }
        }
      });
    }
    if (e.keyCode == 66) {
      // 'b'
      gEventQueue.push({
        type: kEventKeyDown,
        updateFn: function updateFn() {
          if (gDebug) {
            gSpawnPillPressed = true;
          }
        }
      });
    }
    if (e.keyCode == 49) {
      // '1'
      gEventQueue.push({
        type: kEventKeyDown,
        updateFn: function updateFn() {
          if (gDebug) {
            gStepPressed = true;
          }
        }
      });
    }
    if (e.keyCode == 69) {
      // 'e'
      gEventQueue.push({
        type: kEventKeyDown,
        updateFn: function updateFn() {
          if (gDebug) {
            gNextMusicPressed = true;
          }
        }
      });
    }
    if (e.keyCode == 46) {
      // delete.
      gEventQueue.push({
        type: kEventKeyDown,
        updateFn: function updateFn() {
          gClearHighScorePressed = true;
        }
      });
    }
  });
  window.addEventListener('keyup', function (e) {
    if (e.keyCode == 38 || e.keyCode == 87) {
      // arrow up, w
      e.preventDefault();
      gEventQueue.push({
        type: kEventKeyUp,
        updateFn: function updateFn() {
          gUpPressed = false;
          delete gDownKeys[e.keyCode];
        }
      });
    }
    if (e.keyCode == 40 || e.keyCode == 83) {
      // arrow down, s
      e.preventDefault();
      gEventQueue.push({
        type: kEventKeyUp,
        updateFn: function updateFn() {
          gDownPressed = false;
          delete gDownKeys[e.keyCode];
        }
      });
    }
    if (e.keyCode == 80 || e.keyCode == 19) {
      // 'p', 'pause'
      gEventQueue.push({
        type: kEventKeyUp,
        updateFn: function updateFn() {
          gPausePressed = false;
          delete gDownKeys[e.keyCode];
        }
      });
    }
    if (e.keyCode == 32) {
      // ' '
      gEventQueue.push({
        type: kEventKeyUp,
        updateFn: function updateFn() {
          delete gDownKeys[e.keyCode];
        }
      });
    }
    if (e.keyCode == 65) {
      // 'a'
      gEventQueue.push({
        type: kEventKeyUp,
        updateFn: function updateFn() {
          gAddPuckPressed = false;
        }
      });
    }
    if (e.keyCode == 81) {
      // 'q'
      gEventQueue.push({
        type: kEventKeyUp,
        updateFn: function updateFn() {
          gGameOverPressed = false;
        }
      });
    }
    if (e.keyCode == 66) {
      // 'b'
      gEventQueue.push({
        type: kEventKeyUp,
        updateFn: function updateFn() {
          gSpawnPillPressed = false;
        }
      });
    }
    if (e.keyCode == 49) {
      // '1'
      gEventQueue.push({
        type: kEventKeyUp,
        updateFn: function updateFn() {
          gStepPressed = false;
        }
      });
    }
    if (e.keyCode == 69) {
      // 'e'
      gEventQueue.push({
        type: kEventKeyUp,
        updateFn: function updateFn() {}
      });
    }
    if (e.keyCode == 46) {
      // delete.
      gEventQueue.push({
        type: kEventKeyUp,
        updateFn: function updateFn() {}
      });
    }
  });
  window.addEventListener('orientationChange', OnOrientationChange, false);
  window.addEventListener('resize', OnResize, false);
}
window.addEventListener('load', function () {
  Start();
  InitEvents();
}, false);