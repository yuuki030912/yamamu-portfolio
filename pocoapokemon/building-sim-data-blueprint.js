
// ===== ブループリント（設計図プリセット） =====
var BUILDING_SIM_BLUEPRINTS = (function() {
  function generateTower() {
    var b = [];
    function add(x,y,z,type,rot){b.push({x:x,y:y,z:z,type:type,rotation:rot||0});}
    var FR='wall-bronze',FRA='wall-bronze-stylish',FRG='wall-gold',FRGS='wall-gold-stylish';
    var SGL='window-stained-btm',SGM='window-stained-mid',SGH='window-stained-top';
    var PIL='deco-stone-pillar-mid',PILB='deco-stone-pillar-btm',PILT='deco-stone-pillar-top';
    var BW='wall-painted',BA='wall-plaster';
    var Lx=10,Rx=26,Cz=8,baseCx=18,baseCz=Cz;
    var Ystart=14,Yend=58,maxHW=7,innerHW=2;
    var angles8=[0,0.785,1.571,2.356,3.14,-2.356,-1.571,-0.785];

    // ===== MULTI-TIERED BASE (Y0-13) =====
    var i,bx,bz,by,dd,ang,rot;
    // Tier 1 (Y0-1): r=16
    for(bx=0;bx<36;bx++)for(bz=0;bz<16;bz++){
      dd=Math.sqrt((bx-baseCx)*(bx-baseCx)+(bz-baseCz)*(bz-baseCz));
      if(dd<=16)add(bx,0,bz,'floor-marble-light');
      if(dd<=16&&dd>=14.5)add(bx,1,bz,PILB);
    }
    // Tier 2 (Y2-4): r=14
    for(bx=0;bx<36;bx++)for(bz=0;bz<16;bz++){
      dd=Math.sqrt((bx-baseCx)*(bx-baseCx)+(bz-baseCz)*(bz-baseCz));
      if(dd<=14)add(bx,2,bz,'floor-marble');
      if(dd<=14&&dd>=12.5)for(by=2;by<=4;by++)add(bx,by,bz,by===2?PILB:by===4?PILT:BW);
    }
    // Petal buttresses
    for(i=0;i<8;i++){ang=angles8[i];
      for(var r=14;r<=17;r++){
        var px=Math.round(baseCx+Math.cos(ang)*r),pz=Math.round(baseCz+Math.sin(ang)*r);
        if(px>=0&&px<36&&pz>=0&&pz<16)for(by=1;by<=3;by++)add(px,by,pz,BW);
        var px2=Math.round(baseCx+Math.cos(ang+0.15)*r),pz2=Math.round(baseCz+Math.sin(ang+0.15)*r);
        if(px2>=0&&px2<36&&pz2>=0&&pz2<16)for(by=1;by<=3;by++)add(px2,by,pz2,BW);
        var px3=Math.round(baseCx+Math.cos(ang-0.15)*r),pz3=Math.round(baseCz+Math.sin(ang-0.15)*r);
        if(px3>=0&&px3<36&&pz3>=0&&pz3<16)for(by=1;by<=3;by++)add(px3,by,pz3,BW);
      }
      for(var r2=15;r2<=17;r2++){
        var spx=Math.round(baseCx+Math.cos(ang)*r2),spz=Math.round(baseCz+Math.sin(ang)*r2);
        if(spx>=0&&spx<36&&spz>=0&&spz<16){
          var sr=(Math.abs(Math.cos(ang))>Math.abs(Math.sin(ang)))?(Math.cos(ang)>0?1:3):(Math.sin(ang)>0?2:0);
          add(spx,4,spz,'roof-stone-slope',sr);
        }
      }
    }
    // Tier 3 (Y5-7): r=11
    for(bx=0;bx<36;bx++)for(bz=0;bz<16;bz++){
      dd=Math.sqrt((bx-baseCx)*(bx-baseCx)+(bz-baseCz)*(bz-baseCz));
      if(dd<=11)add(bx,5,bz,'floor-stone');
      if(dd<=11&&dd>=9.5)for(by=5;by<=7;by++)add(bx,by,bz,by===5?PILB:by===7?PILT:BA);
      if(dd<=14&&dd>=12){ang=Math.atan2(bz-baseCz,bx-baseCx);rot=(ang>=-0.785&&ang<0.785)?1:(ang>=0.785&&ang<2.356)?2:(ang>=-2.356&&ang<-0.785)?0:3;add(bx,5,bz,'roof-stone-slope',rot);}
    }
    // Tier 4 (Y8-10): r=8
    for(bx=0;bx<36;bx++)for(bz=0;bz<16;bz++){
      dd=Math.sqrt((bx-baseCx)*(bx-baseCx)+(bz-baseCz)*(bz-baseCz));
      if(dd<=8)add(bx,8,bz,'floor-stone');
      if(dd<=8&&dd>=6.5)for(by=8;by<=10;by++)add(bx,by,bz,by===8?PILB:by===10?PILT:BA);
      if(dd<=11&&dd>=9){ang=Math.atan2(bz-baseCz,bx-baseCx);rot=(ang>=-0.785&&ang<0.785)?1:(ang>=0.785&&ang<2.356)?2:(ang>=-2.356&&ang<-0.785)?0:3;add(bx,8,bz,'roof-stone-slope',rot);}
    }
    // Tier 5 (Y11-13): tower platform
    for(bx=0;bx<36;bx++)for(bz=0;bz<16;bz++){
      dd=Math.sqrt((bx-baseCx)*(bx-baseCx)+(bz-baseCz)*(bz-baseCz));
      if(dd<=5)add(bx,11,bz,'floor-stone');
      if(dd<=8&&dd>=6){ang=Math.atan2(bz-baseCz,bx-baseCx);rot=(ang>=-0.785&&ang<0.785)?1:(ang>=0.785&&ang<2.356)?2:(ang>=-2.356&&ang<-0.785)?0:3;add(bx,11,bz,'roof-stone-slope',rot);}
    }
    for(bx=Lx-3;bx<=Rx+3;bx++)for(bz=Cz-3;bz<=Cz+3;bz++){add(bx,12,bz,'floor-stone');add(bx,13,bz,'floor-stone');}

    // Corner spires
    var cps=[[baseCx-11,baseCz-6],[baseCx+11,baseCz-6],[baseCx-11,baseCz+6],[baseCx+11,baseCz+6]];
    for(i=0;i<cps.length;i++){
      var cpx=cps[i][0],cpz=cps[i][1];
      if(cpx<0||cpx>=36||cpz<0||cpz>=16)continue;
      for(by=2;by<=12;by++)add(cpx,by,cpz,by<=3?PILB:by>=11?PILT:BW);
      add(cpx,13,cpz,'roof-stone-slope',0);add(cpx,14,cpz,'roof-stone-slope',0);
    }
    // Colorful orbs
    var decos=['deco-sweets-top','deco-pop-btm','deco-sweets-mid','deco-pop-top'];
    for(i=0;i<8;i++){
      var dpx=Math.round(baseCx+Math.cos(angles8[i])*12),dpz=Math.round(baseCz+Math.sin(angles8[i])*12);
      if(dpx>=0&&dpx<36&&dpz>=0&&dpz<16)add(dpx,5,dpz,decos[i%4]);
    }

    // ===== TOWERS (Y14-58) =====
    var outerHW=[];
    for(var y=0;y<=62;y++){
      if(y<Ystart||y>Yend){outerHW[y]=0;continue;}
      var t=(y-Ystart)/(Yend-Ystart);
      outerHW[y]=Math.max(1,Math.round(maxHW*Math.sin(Math.PI*Math.pow(t,0.45))));
    }
    function zDepth(dx,w){if(w<=2)return 1;var r=Math.abs(dx)/w;return r<=0.3?3:r<=0.6?2:1;}

    function buildT(cx,isSpace,dir){
      for(var y=Ystart;y<=Yend;y++){
        var ow=outerHW[y];if(!ow)continue;
        var sg=(y<=24)?SGL:(y<=44)?SGM:SGH;
        var fr=(y<=30)?FR:(y<=50)?FRA:FRG;
        var iw=Math.min(innerHW,ow);
        var outerX=cx+(dir*ow),innerX=cx-(dir*iw);
        var xMin=Math.min(outerX,innerX),xMax=Math.max(outerX,innerX);
        for(var x=xMin;x<=xMax;x++){
          var zd=zDepth(Math.abs(x-cx),Math.max(ow,iw));
          var isOE=(x===outerX),isIE=(x===innerX);
          for(var dz=-zd;dz<=zd;dz++){
            var isEZ=(Math.abs(dz)===zd);
            if(isOE||isIE){
              if(isEZ&&zd>1){var sR;if(isOE)sR=(dir<0)?((dz<0)?0:1):((dz<0)?3:2);else sR=(dir>0)?((dz<0)?0:1):((dz<0)?3:2);add(x,y,Cz+dz,'roof-stone-slope',sR);}
              else add(x,y,Cz+dz,fr);
            }else if(isEZ){if((x-xMin)%3!==0)add(x,y,Cz+dz,sg);}
          }
        }
        var now=(y<Yend)?(outerHW[y+1]||0):0,pow2=(y>0)?(outerHW[y-1]||0):0;
        if(now<ow||pow2<ow||y===Ystart){for(var x2=xMin;x2<=xMax;x2++){var zd2=zDepth(Math.abs(x2-cx),Math.max(ow,iw));add(x2,y,Cz-zd2,fr);add(x2,y,Cz+zd2,fr);}}
        if(now<ow&&ow>1)add(outerX,y,Cz,'roof-stone-slope',dir<0?3:1);
        if(y%8===0&&(xMax-xMin)>2){for(var x3=xMin;x3<=xMax;x3++){var zd3=zDepth(Math.abs(x3-cx),Math.max(ow,iw));for(var dz3=-zd3;dz3<=zd3;dz3++)add(x3,y,Cz+dz3,FRA);}}
        if(y>=34&&y<=38&&ow>=4){var rr=(y===36)?3:(y===35||y===37)?2:1;var zf=zDepth(0,ow);var rwCx=Math.floor((xMin+xMax)/2);for(var dx=-rr;dx<=rr;dx++)if(rwCx+dx>=xMin&&rwCx+dx<=xMax)add(rwCx+dx,y,Cz-zf,isSpace?SGH:SGM);if(y===36)add(rwCx,y,Cz-zf-1,isSpace?'round-pillar':'extravagant-pillar');}
      }
      add(cx+(dir*1),Yend+1,Cz,FRG);add(cx+(dir*1),Yend+2,Cz,FRGS);
      add(cx+(dir*1),Yend+3,Cz,isSpace?'deco-sweets-top':'deco-pop-btm');
    }
    buildT(Lx,true,-1);buildT(Rx,false,+1);

    // SCROLLWORK + SPIRAL
    var midX=Math.floor((Lx+Rx)/2),innerL=Lx+innerHW,innerR=Rx-innerHW;
    for(var y=16;y<=54;y++)add(midX,y,Cz,PIL);
    for(var y=16;y<=50;y++){
      var lE=innerL+1,rE=innerR-1;if(lE>=rE)continue;var gap=rE-lE;
      if(y%10===0)for(var x=lE;x<=rE;x++)add(x,y,Cz,FR);
      var sP=Math.floor((y-16)/8)%2,sPr=(y-16)%8;
      if(sPr>=1&&sPr<=6){var sA=Math.floor(gap/3),sO=Math.round(Math.sin(sPr*0.524)*sA);
        if(sP===0){var sx=lE+Math.abs(sO);if(sx<midX)add(sx,y,Cz,'roof-stone-slope',sO>0?1:3);}
        else{var sx2=rE-Math.abs(sO);if(sx2>midX)add(sx2,y,Cz,'roof-stone-slope',sO>0?3:1);}
      }
    }
    add(midX,48,Cz,'misc-cubelight');add(midX,49,Cz,'misc-cubelight');
    for(var sy=16;sy<=54;sy++){var sd=sy%4,sdx=(sd===0)?1:(sd===2)?-1:0,sdz=(sd===1)?1:(sd===3)?-1:0;add(midX+sdx,sy,Cz+sdz,'roof-stone-slope',sd);}
    return b;
  }
  return [{id:'space-time-tower',name:'時空の塔（ディアルガVSパルキア）',desc:'映画の時空の塔。Minecraft準拠4段花弁型基部+バットレス+コーナー尖塔。外側曲線・内側直線の葉型タワー。全62層。',icon:'🏛️',baseW:36,baseD:16,blocks:generateTower()}];
})();
