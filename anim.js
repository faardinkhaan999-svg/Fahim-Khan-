(function(){
"use strict";
var BASE=(document.currentScript&&document.currentScript.src||"").replace(/[^\/]*$/,"");
var DEF={shape:"cube",durationMs:850,easing:"cubic-bezier(.3,.7,.25,1)",perspective:1100,endRibbon:true,separator:true};
var TABS=["home","care","add","me"];

function start(cfg){
  var c={},k;
  for(k in DEF)c[k]=(cfg&&cfg[k]!==undefined)?cfg[k]:DEF[k];
  var sc=document.getElementById("scroll"),list=document.getElementById("list"),home=document.getElementById("v-home");
  var views=TABS.map(function(t){return document.getElementById("v-"+t)});
  if(!sc||!list||!home||views.indexOf(null)>-1)return;
  var root=document.documentElement;
  var dur=(window.matchMedia&&matchMedia("(prefers-reduced-motion: reduce)").matches)?0:c.durationMs;
  root.style.setProperty("--fx-persp",c.perspective+"px");
  root.setAttribute("data-ribbon",c.endRibbon?"on":"off");

  var wr=document.createElement("div");wr.id="wr";
  views.forEach(function(v){wr.appendChild(v)});
  sc.appendChild(wr);
  sc.scrollTo=function(){home.scrollTo.apply(home,arguments)};
  root.classList.add("fx");

  var ready=false;
  function cur(){for(var i=0;i<views.length;i++)if(views[i].classList.contains("on"))return i;return 0}
  function layout(anim){
    var w=sc.clientWidth;if(!w)return;
    var n=c.shape==="ring"?8:4,st=360/n,R=(w/2)/Math.tan(Math.PI/n);
    views.forEach(function(v,i){v.style.transform="rotateY("+i*st+"deg) translateZ("+R+"px)"});
    wr.style.transition=anim?"transform "+dur+"ms "+c.easing:"none";
    wr.style.transform="translateZ("+(-R)+"px) rotateY("+(-cur()*st)+"deg)";
    ready=true;
  }
  var tm=new MutationObserver(function(){layout(ready)});
  views.forEach(function(v){tm.observe(v,{attributes:true,attributeFilter:["class"]})});
  if(window.ResizeObserver)new ResizeObserver(function(){layout(false)}).observe(sc);
  else window.addEventListener("resize",function(){layout(false)});
  layout(false);

  var lm=new MutationObserver(decorate);
  function decorate(){
    lm.disconnect();
    var prev=false;
    [].slice.call(list.children).forEach(function(li){
      if(!li.classList.contains("card"))return;
      var ix=li.querySelector(".idx");
      if(ix)li.setAttribute("data-idx",ix.textContent.replace("#",""));
      if(c.separator&&prev){var s=document.createElement("li");s.className="sep";s.textContent="পরের নাম্বার";list.insertBefore(s,li)}
      prev=true;
    });
    lm.observe(list,{childList:true});
  }
  decorate();
}

function boot(cfg){
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",function(){start(cfg)});
  else start(cfg);
}
fetch(BASE+"anim.json",{cache:"no-cache"}).then(function(r){return r.json()}).catch(function(){return {}}).then(boot);
})();
