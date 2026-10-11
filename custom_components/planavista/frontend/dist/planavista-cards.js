function e(e,t,i,s){var a,n=arguments.length,r=n<3?t:null===s?s=Object.getOwnPropertyDescriptor(t,i):s;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)r=Reflect.decorate(e,t,i,s);else for(var o=e.length-1;o>=0;o--)(a=e[o])&&(r=(n<3?a(r):n>3?a(t,i,r):a(t,i))||r);return n>3&&r&&Object.defineProperty(t,i,r),r}"function"==typeof SuppressedError&&SuppressedError;const t=globalThis,i=t.ShadowRoot&&(void 0===t.ShadyCSS||t.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,s=Symbol(),a=new WeakMap;let n=class{constructor(e,t,i){if(this._$cssResult$=!0,i!==s)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=e,this.t=t}get styleSheet(){let e=this.o;const t=this.t;if(i&&void 0===e){const i=void 0!==t&&1===t.length;i&&(e=a.get(t)),void 0===e&&((this.o=e=new CSSStyleSheet).replaceSync(this.cssText),i&&a.set(t,e))}return e}toString(){return this.cssText}};const r=(e,...t)=>{const i=1===e.length?e[0]:t.reduce((t,i,s)=>t+(e=>{if(!0===e._$cssResult$)return e.cssText;if("number"==typeof e)return e;throw Error("Value passed to 'css' function must be a 'css' function result: "+e+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(i)+e[s+1],e[0]);return new n(i,e,s)},o=i?e=>e:e=>e instanceof CSSStyleSheet?(e=>{let t="";for(const i of e.cssRules)t+=i.cssText;return(e=>new n("string"==typeof e?e:e+"",void 0,s))(t)})(e):e,{is:d,defineProperty:l,getOwnPropertyDescriptor:c,getOwnPropertyNames:p,getOwnPropertySymbols:h,getPrototypeOf:u}=Object,m=globalThis,v=m.trustedTypes,g=v?v.emptyScript:"",b=m.reactiveElementPolyfillSupport,y=(e,t)=>e,f={toAttribute(e,t){switch(t){case Boolean:e=e?g:null;break;case Object:case Array:e=null==e?e:JSON.stringify(e)}return e},fromAttribute(e,t){let i=e;switch(t){case Boolean:i=null!==e;break;case Number:i=null===e?null:Number(e);break;case Object:case Array:try{i=JSON.parse(e)}catch(e){i=null}}return i}},_=(e,t)=>!d(e,t),x={attribute:!0,type:String,converter:f,reflect:!1,useDefault:!1,hasChanged:_};Symbol.metadata??=Symbol("metadata"),m.litPropertyMetadata??=new WeakMap;let w=class extends HTMLElement{static addInitializer(e){this._$Ei(),(this.l??=[]).push(e)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(e,t=x){if(t.state&&(t.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(e)&&((t=Object.create(t)).wrapped=!0),this.elementProperties.set(e,t),!t.noAccessor){const i=Symbol(),s=this.getPropertyDescriptor(e,i,t);void 0!==s&&l(this.prototype,e,s)}}static getPropertyDescriptor(e,t,i){const{get:s,set:a}=c(this.prototype,e)??{get(){return this[t]},set(e){this[t]=e}};return{get:s,set(t){const n=s?.call(this);a?.call(this,t),this.requestUpdate(e,n,i)},configurable:!0,enumerable:!0}}static getPropertyOptions(e){return this.elementProperties.get(e)??x}static _$Ei(){if(this.hasOwnProperty(y("elementProperties")))return;const e=u(this);e.finalize(),void 0!==e.l&&(this.l=[...e.l]),this.elementProperties=new Map(e.elementProperties)}static finalize(){if(this.hasOwnProperty(y("finalized")))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(y("properties"))){const e=this.properties,t=[...p(e),...h(e)];for(const i of t)this.createProperty(i,e[i])}const e=this[Symbol.metadata];if(null!==e){const t=litPropertyMetadata.get(e);if(void 0!==t)for(const[e,i]of t)this.elementProperties.set(e,i)}this._$Eh=new Map;for(const[e,t]of this.elementProperties){const i=this._$Eu(e,t);void 0!==i&&this._$Eh.set(i,e)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(e){const t=[];if(Array.isArray(e)){const i=new Set(e.flat(1/0).reverse());for(const e of i)t.unshift(o(e))}else void 0!==e&&t.push(o(e));return t}static _$Eu(e,t){const i=t.attribute;return!1===i?void 0:"string"==typeof i?i:"string"==typeof e?e.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){this._$ES=new Promise(e=>this.enableUpdating=e),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach(e=>e(this))}addController(e){(this._$EO??=new Set).add(e),void 0!==this.renderRoot&&this.isConnected&&e.hostConnected?.()}removeController(e){this._$EO?.delete(e)}_$E_(){const e=new Map,t=this.constructor.elementProperties;for(const i of t.keys())this.hasOwnProperty(i)&&(e.set(i,this[i]),delete this[i]);e.size>0&&(this._$Ep=e)}createRenderRoot(){const e=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return((e,s)=>{if(i)e.adoptedStyleSheets=s.map(e=>e instanceof CSSStyleSheet?e:e.styleSheet);else for(const i of s){const s=document.createElement("style"),a=t.litNonce;void 0!==a&&s.setAttribute("nonce",a),s.textContent=i.cssText,e.appendChild(s)}})(e,this.constructor.elementStyles),e}connectedCallback(){this.renderRoot??=this.createRenderRoot(),this.enableUpdating(!0),this._$EO?.forEach(e=>e.hostConnected?.())}enableUpdating(e){}disconnectedCallback(){this._$EO?.forEach(e=>e.hostDisconnected?.())}attributeChangedCallback(e,t,i){this._$AK(e,i)}_$ET(e,t){const i=this.constructor.elementProperties.get(e),s=this.constructor._$Eu(e,i);if(void 0!==s&&!0===i.reflect){const a=(void 0!==i.converter?.toAttribute?i.converter:f).toAttribute(t,i.type);this._$Em=e,null==a?this.removeAttribute(s):this.setAttribute(s,a),this._$Em=null}}_$AK(e,t){const i=this.constructor,s=i._$Eh.get(e);if(void 0!==s&&this._$Em!==s){const e=i.getPropertyOptions(s),a="function"==typeof e.converter?{fromAttribute:e.converter}:void 0!==e.converter?.fromAttribute?e.converter:f;this._$Em=s;const n=a.fromAttribute(t,e.type);this[s]=n??this._$Ej?.get(s)??n,this._$Em=null}}requestUpdate(e,t,i,s=!1,a){if(void 0!==e){const n=this.constructor;if(!1===s&&(a=this[e]),i??=n.getPropertyOptions(e),!((i.hasChanged??_)(a,t)||i.useDefault&&i.reflect&&a===this._$Ej?.get(e)&&!this.hasAttribute(n._$Eu(e,i))))return;this.C(e,t,i)}!1===this.isUpdatePending&&(this._$ES=this._$EP())}C(e,t,{useDefault:i,reflect:s,wrapped:a},n){i&&!(this._$Ej??=new Map).has(e)&&(this._$Ej.set(e,n??t??this[e]),!0!==a||void 0!==n)||(this._$AL.has(e)||(this.hasUpdated||i||(t=void 0),this._$AL.set(e,t)),!0===s&&this._$Em!==e&&(this._$Eq??=new Set).add(e))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(e){Promise.reject(e)}const e=this.scheduleUpdate();return null!=e&&await e,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??=this.createRenderRoot(),this._$Ep){for(const[e,t]of this._$Ep)this[e]=t;this._$Ep=void 0}const e=this.constructor.elementProperties;if(e.size>0)for(const[t,i]of e){const{wrapped:e}=i,s=this[t];!0!==e||this._$AL.has(t)||void 0===s||this.C(t,void 0,i,s)}}let e=!1;const t=this._$AL;try{e=this.shouldUpdate(t),e?(this.willUpdate(t),this._$EO?.forEach(e=>e.hostUpdate?.()),this.update(t)):this._$EM()}catch(t){throw e=!1,this._$EM(),t}e&&this._$AE(t)}willUpdate(e){}_$AE(e){this._$EO?.forEach(e=>e.hostUpdated?.()),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(e)),this.updated(e)}_$EM(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(e){return!0}update(e){this._$Eq&&=this._$Eq.forEach(e=>this._$ET(e,this[e])),this._$EM()}updated(e){}firstUpdated(e){}};w.elementStyles=[],w.shadowRootOptions={mode:"open"},w[y("elementProperties")]=new Map,w[y("finalized")]=new Map,b?.({ReactiveElement:w}),(m.reactiveElementVersions??=[]).push("2.1.2");const $=globalThis,k=e=>e,F=$.trustedTypes,E=F?F.createPolicy("lit-html",{createHTML:e=>e}):void 0,C="$lit$",S=`lit$${Math.random().toFixed(9).slice(2)}$`,D="?"+S,A=`<${D}>`,z=document,M=()=>z.createComment(""),T=e=>null===e||"object"!=typeof e&&"function"!=typeof e,B=Array.isArray,P="[ \t\n\f\r]",O=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,R=/-->/g,I=/>/g,L=RegExp(`>|${P}(?:([^\\s"'>=/]+)(${P}*=${P}*(?:[^ \t\n\f\r"'\`<>=]|("|')|))|$)`,"g"),N=/'/g,H=/"/g,j=/^(?:script|style|textarea|title)$/i,q=e=>(t,...i)=>({_$litType$:e,strings:t,values:i}),U=q(1),V=q(2),W=Symbol.for("lit-noChange"),Y=Symbol.for("lit-nothing"),K=new WeakMap,X=z.createTreeWalker(z,129);function G(e,t){if(!B(e)||!e.hasOwnProperty("raw"))throw Error("invalid template strings array");return void 0!==E?E.createHTML(t):t}class J{constructor({strings:e,_$litType$:t},i){let s;this.parts=[];let a=0,n=0;const r=e.length-1,o=this.parts,[d,l]=((e,t)=>{const i=e.length-1,s=[];let a,n=2===t?"<svg>":3===t?"<math>":"",r=O;for(let t=0;t<i;t++){const i=e[t];let o,d,l=-1,c=0;for(;c<i.length&&(r.lastIndex=c,d=r.exec(i),null!==d);)c=r.lastIndex,r===O?"!--"===d[1]?r=R:void 0!==d[1]?r=I:void 0!==d[2]?(j.test(d[2])&&(a=RegExp("</"+d[2],"g")),r=L):void 0!==d[3]&&(r=L):r===L?">"===d[0]?(r=a??O,l=-1):void 0===d[1]?l=-2:(l=r.lastIndex-d[2].length,o=d[1],r=void 0===d[3]?L:'"'===d[3]?H:N):r===H||r===N?r=L:r===R||r===I?r=O:(r=L,a=void 0);const p=r===L&&e[t+1].startsWith("/>")?" ":"";n+=r===O?i+A:l>=0?(s.push(o),i.slice(0,l)+C+i.slice(l)+S+p):i+S+(-2===l?t:p)}return[G(e,n+(e[i]||"<?>")+(2===t?"</svg>":3===t?"</math>":"")),s]})(e,t);if(this.el=J.createElement(d,i),X.currentNode=this.el.content,2===t||3===t){const e=this.el.content.firstChild;e.replaceWith(...e.childNodes)}for(;null!==(s=X.nextNode())&&o.length<r;){if(1===s.nodeType){if(s.hasAttributes())for(const e of s.getAttributeNames())if(e.endsWith(C)){const t=l[n++],i=s.getAttribute(e).split(S),r=/([.?@])?(.*)/.exec(t);o.push({type:1,index:a,name:r[2],strings:i,ctor:"."===r[1]?ie:"?"===r[1]?se:"@"===r[1]?ae:te}),s.removeAttribute(e)}else e.startsWith(S)&&(o.push({type:6,index:a}),s.removeAttribute(e));if(j.test(s.tagName)){const e=s.textContent.split(S),t=e.length-1;if(t>0){s.textContent=F?F.emptyScript:"";for(let i=0;i<t;i++)s.append(e[i],M()),X.nextNode(),o.push({type:2,index:++a});s.append(e[t],M())}}}else if(8===s.nodeType)if(s.data===D)o.push({type:2,index:a});else{let e=-1;for(;-1!==(e=s.data.indexOf(S,e+1));)o.push({type:7,index:a}),e+=S.length-1}a++}}static createElement(e,t){const i=z.createElement("template");return i.innerHTML=e,i}}function Q(e,t,i=e,s){if(t===W)return t;let a=void 0!==s?i._$Co?.[s]:i._$Cl;const n=T(t)?void 0:t._$litDirective$;return a?.constructor!==n&&(a?._$AO?.(!1),void 0===n?a=void 0:(a=new n(e),a._$AT(e,i,s)),void 0!==s?(i._$Co??=[])[s]=a:i._$Cl=a),void 0!==a&&(t=Q(e,a._$AS(e,t.values),a,s)),t}let Z=class{constructor(e,t){this._$AV=[],this._$AN=void 0,this._$AD=e,this._$AM=t}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(e){const{el:{content:t},parts:i}=this._$AD,s=(e?.creationScope??z).importNode(t,!0);X.currentNode=s;let a=X.nextNode(),n=0,r=0,o=i[0];for(;void 0!==o;){if(n===o.index){let t;2===o.type?t=new ee(a,a.nextSibling,this,e):1===o.type?t=new o.ctor(a,o.name,o.strings,this,e):6===o.type&&(t=new ne(a,this,e)),this._$AV.push(t),o=i[++r]}n!==o?.index&&(a=X.nextNode(),n++)}return X.currentNode=z,s}p(e){let t=0;for(const i of this._$AV)void 0!==i&&(void 0!==i.strings?(i._$AI(e,i,t),t+=i.strings.length-2):i._$AI(e[t])),t++}};class ee{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(e,t,i,s){this.type=2,this._$AH=Y,this._$AN=void 0,this._$AA=e,this._$AB=t,this._$AM=i,this.options=s,this._$Cv=s?.isConnected??!0}get parentNode(){let e=this._$AA.parentNode;const t=this._$AM;return void 0!==t&&11===e?.nodeType&&(e=t.parentNode),e}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(e,t=this){e=Q(this,e,t),T(e)?e===Y||null==e||""===e?(this._$AH!==Y&&this._$AR(),this._$AH=Y):e!==this._$AH&&e!==W&&this._(e):void 0!==e._$litType$?this.$(e):void 0!==e.nodeType?this.T(e):(e=>B(e)||"function"==typeof e?.[Symbol.iterator])(e)?this.k(e):this._(e)}O(e){return this._$AA.parentNode.insertBefore(e,this._$AB)}T(e){this._$AH!==e&&(this._$AR(),this._$AH=this.O(e))}_(e){this._$AH!==Y&&T(this._$AH)?this._$AA.nextSibling.data=e:this.T(z.createTextNode(e)),this._$AH=e}$(e){const{values:t,_$litType$:i}=e,s="number"==typeof i?this._$AC(e):(void 0===i.el&&(i.el=J.createElement(G(i.h,i.h[0]),this.options)),i);if(this._$AH?._$AD===s)this._$AH.p(t);else{const e=new Z(s,this),i=e.u(this.options);e.p(t),this.T(i),this._$AH=e}}_$AC(e){let t=K.get(e.strings);return void 0===t&&K.set(e.strings,t=new J(e)),t}k(e){B(this._$AH)||(this._$AH=[],this._$AR());const t=this._$AH;let i,s=0;for(const a of e)s===t.length?t.push(i=new ee(this.O(M()),this.O(M()),this,this.options)):i=t[s],i._$AI(a),s++;s<t.length&&(this._$AR(i&&i._$AB.nextSibling,s),t.length=s)}_$AR(e=this._$AA.nextSibling,t){for(this._$AP?.(!1,!0,t);e!==this._$AB;){const t=k(e).nextSibling;k(e).remove(),e=t}}setConnected(e){void 0===this._$AM&&(this._$Cv=e,this._$AP?.(e))}}class te{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(e,t,i,s,a){this.type=1,this._$AH=Y,this._$AN=void 0,this.element=e,this.name=t,this._$AM=s,this.options=a,i.length>2||""!==i[0]||""!==i[1]?(this._$AH=Array(i.length-1).fill(new String),this.strings=i):this._$AH=Y}_$AI(e,t=this,i,s){const a=this.strings;let n=!1;if(void 0===a)e=Q(this,e,t,0),n=!T(e)||e!==this._$AH&&e!==W,n&&(this._$AH=e);else{const s=e;let r,o;for(e=a[0],r=0;r<a.length-1;r++)o=Q(this,s[i+r],t,r),o===W&&(o=this._$AH[r]),n||=!T(o)||o!==this._$AH[r],o===Y?e=Y:e!==Y&&(e+=(o??"")+a[r+1]),this._$AH[r]=o}n&&!s&&this.j(e)}j(e){e===Y?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,e??"")}}class ie extends te{constructor(){super(...arguments),this.type=3}j(e){this.element[this.name]=e===Y?void 0:e}}class se extends te{constructor(){super(...arguments),this.type=4}j(e){this.element.toggleAttribute(this.name,!!e&&e!==Y)}}class ae extends te{constructor(e,t,i,s,a){super(e,t,i,s,a),this.type=5}_$AI(e,t=this){if((e=Q(this,e,t,0)??Y)===W)return;const i=this._$AH,s=e===Y&&i!==Y||e.capture!==i.capture||e.once!==i.once||e.passive!==i.passive,a=e!==Y&&(i===Y||s);s&&this.element.removeEventListener(this.name,this,i),a&&this.element.addEventListener(this.name,this,e),this._$AH=e}handleEvent(e){"function"==typeof this._$AH?this._$AH.call(this.options?.host??this.element,e):this._$AH.handleEvent(e)}}class ne{constructor(e,t,i){this.element=e,this.type=6,this._$AN=void 0,this._$AM=t,this.options=i}get _$AU(){return this._$AM._$AU}_$AI(e){Q(this,e)}}const re={I:ee},oe=$.litHtmlPolyfillSupport;oe?.(J,ee),($.litHtmlVersions??=[]).push("3.3.2");const de=globalThis;let le=class extends w{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){const e=super.createRenderRoot();return this.renderOptions.renderBefore??=e.firstChild,e}update(e){const t=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(e),this._$Do=((e,t,i)=>{const s=i?.renderBefore??t;let a=s._$litPart$;if(void 0===a){const e=i?.renderBefore??null;s._$litPart$=a=new ee(t.insertBefore(M(),e),e,void 0,i??{})}return a._$AI(e),a})(t,this.renderRoot,this.renderOptions)}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(!0)}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(!1)}render(){return W}};le._$litElement$=!0,le.finalized=!0,de.litElementHydrateSupport?.({LitElement:le});const ce=de.litElementPolyfillSupport;ce?.({LitElement:le}),(de.litElementVersions??=[]).push("4.2.2");const pe={attribute:!0,type:String,converter:f,reflect:!1,hasChanged:_},he=(e=pe,t,i)=>{const{kind:s,metadata:a}=i;let n=globalThis.litPropertyMetadata.get(a);if(void 0===n&&globalThis.litPropertyMetadata.set(a,n=new Map),"setter"===s&&((e=Object.create(e)).wrapped=!0),n.set(i.name,e),"accessor"===s){const{name:s}=i;return{set(i){const a=t.get.call(this);t.set.call(this,i),this.requestUpdate(s,a,e,!0,i)},init(t){return void 0!==t&&this.C(s,void 0,e,t),t}}}if("setter"===s){const{name:s}=i;return function(i){const a=this[s];t.call(this,i),this.requestUpdate(s,a,e,!0,i)}}throw Error("Unsupported decorator location: "+s)};function ue(e){return(t,i)=>"object"==typeof i?he(e,t,i):((e,t,i)=>{const s=t.hasOwnProperty(i);return t.constructor.createProperty(i,e),s?Object.getOwnPropertyDescriptor(t,i):void 0})(e,t,i)}function me(e){return ue({...e,state:!0,attribute:!1})}function ve(e,t){return(t,i,s)=>((e,t,i)=>(i.configurable=!0,i.enumerable=!0,Reflect.decorate&&"object"!=typeof t&&Object.defineProperty(e,t,i),i))(t,i,{get(){return(t=>t.renderRoot?.querySelector(e)??null)(this)}})}function ge(e,t){return be(()=>ye(e,t))}function be(e){return"undefined"==typeof document||null===document.querySelector("home-assistant")||customElements.get("home-assistant")?e():(customElements.whenDefined("home-assistant").then(e),!1)}function ye(e,t){return!customElements.get(e)&&(customElements.define(e,t),!0)}const fe=/^\d{4}-\d{2}-\d{2}$/;function _e(e){return fe.test(e)}function xe(e){if(_e(e)){const[t,i,s]=e.split("-").map(Number);return new Date(t,i-1,s)}return new Date(e)}function we(e,t="12h"){const i=xe(e);return"24h"===t?i.toLocaleTimeString("en-US",{hour:"2-digit",minute:"2-digit",hour12:!1}):i.toLocaleTimeString("en-US",{hour:"numeric",minute:"2-digit",hour12:!0})}function $e(e,t="medium"){switch(t){case"long":return e.toLocaleDateString("en-US",{weekday:"long",year:"numeric",month:"long",day:"numeric"});case"medium":return e.toLocaleDateString("en-US",{weekday:"short",month:"short",day:"numeric"});case"short":return e.toLocaleDateString("en-US",{month:"numeric",day:"numeric"});case"weekday":return e.toLocaleDateString("en-US",{weekday:"long"})}}function ke(e){const t=new Date;return e.getFullYear()===t.getFullYear()&&e.getMonth()===t.getMonth()&&e.getDate()===t.getDate()}function Fe(e,t="sunday"){const i=new Date(e),s=i.getDay(),a="monday"===t?0===s?-6:1-s:-s;return i.setDate(i.getDate()+a),i.setHours(0,0,0,0),i}function Ee(e){return`${e.getFullYear()}-${String(e.getMonth()+1).padStart(2,"0")}-${String(e.getDate()).padStart(2,"0")}`}function Ce(e,t){const i=Date.UTC(e.getFullYear(),e.getMonth(),e.getDate()),s=Date.UTC(t.getFullYear(),t.getMonth(),t.getDate());return Math.round((s-i)/864e5)}function Se(e,t){const i=new Map(t.map(e=>[e.entity_id,e])),s=new Map;for(const t of e){const e=`${t.summary}|${t.start}|${t.end}`;if(s.has(e)){const a=s.get(e),n=i.get(t.calendar_entity_id);n&&a.shared_calendars.push({entity_id:n.entity_id,color:n.color,color_light:n.color_light,person_entity:n.person_entity,display_name:n.display_name})}else{const a=i.get(t.calendar_entity_id);s.set(e,{...t,shared_calendars:a?[{entity_id:a.entity_id,color:a.color,color_light:a.color_light,person_entity:a.person_entity,display_name:a.display_name}]:[]})}}return Array.from(s.values())}function De(e){return xe(e.end)<new Date}function Ae(e){if(_e(e.start))return!0;const t=xe(e.start),i=xe(e.end);return 0===t.getHours()&&0===t.getMinutes()&&0===i.getHours()&&0===i.getMinutes()&&Ee(t)!==Ee(i)}function ze(e,t){return new Date(Math.max(xe(e.end).getTime()-1,t.getTime()))}function Me(e,t){const i=Ae(e);return i!==Ae(t)?i?-1:1:xe(e.start).getTime()-xe(t.start).getTime()}function Te(e){const t=new Map;for(const i of e){const e=xe(i.start),s=Ee(ze(i,e)),a=new Date(e.getFullYear(),e.getMonth(),e.getDate());for(let e=0;e<1e3;e++){const e=Ee(a);if(t.has(e)||t.set(e,[]),t.get(e).push(i),e===s)break;a.setDate(a.getDate()+1)}}for(const[,e]of t)e.sort(Me);return t}function Be(e,t,i){return e.filter(e=>{const s=xe(e.start),a=xe(e.end);return s<i&&a>t})}function Pe(e,t){return e.filter(e=>!t.has(e.calendar_entity_id))}const Oe="#FFFFFF",Re="#1A1B1E";function Ie(e){const t=/^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(e.trim());if(!t)return null;const i=3===t[1].length?t[1].split("").map(e=>e+e).join(""):t[1];return[0,2,4].map(e=>parseInt(i.slice(e,e+2),16))}function Le(e,t,i){const s=e=>Math.round(Math.min(255,Math.max(0,e))).toString(16).padStart(2,"0");return`#${s(e)}${s(t)}${s(i)}`.toUpperCase()}function Ne(e){const t=e/255;return t<=.04045?t/12.92:((t+.055)/1.055)**2.4}function He(e){const t=Ie(e);if(!t)return 0;const[i,s,a]=t.map(Ne);return.2126*i+.7152*s+.0722*a}function je(e,t){const i=He(e),s=He(t);return(Math.max(i,s)+.05)/(Math.min(i,s)+.05)}function qe(e){return je(e,Oe)>=je(e,Re)?Oe:Re}function Ue(e){const[t,i,s]=(Ie(e)??[0,0,0]).map(Ne),a=Math.cbrt(.4122214708*t+.5363325363*i+.0514459929*s),n=Math.cbrt(.2119034982*t+.6806995451*i+.1073969566*s),r=Math.cbrt(.0883024619*t+.2817188376*i+.6299787005*s),o=.2104542553*a+.793617785*n-.0040720468*r,d=1.9779984951*a-2.428592205*n+.4505937099*r,l=.0259040371*a+.7827717662*n-.808675766*r,c=Math.hypot(d,l);return{l:o,c:c,h:c<1e-6?0:(180*Math.atan2(l,d)/Math.PI+360)%360}}function Ve({l:e,c:t,h:i}){const s=t*Math.cos(i*Math.PI/180),a=t*Math.sin(i*Math.PI/180),n=(e+.3963377774*s+.2158037573*a)**3,r=(e-.1055613458*s-.0638541728*a)**3,o=(e-.0894841775*s-1.291485548*a)**3;return[4.0767416621*n-3.3077115913*r+.2309699292*o,-1.2684380046*n+2.6097574011*r-.3413193965*o,-.0041960863*n-.7034186147*r+1.707614701*o]}function We(e){return e.every(e=>e>=-1e-4&&e<=1.0001)}function Ye(e){const t=Math.min(1,Math.max(0,e.l));let i=Math.max(0,e.c);if(!We(Ve({l:t,c:i,h:e.h}))){let s=0,a=i;for(let i=0;i<24;i++){const i=(s+a)/2;We(Ve({l:t,c:i,h:e.h}))?s=i:a=i}i=s}const[s,a,n]=Ve({l:t,c:i,h:e.h}).map(e=>function(e){return 255*(e<=.0031308?12.92*e:1.055*e**(1/2.4)-.055)}(Math.min(1,Math.max(0,e))));return Le(s,a,n)}function Ke(e){const{l:t,c:i,h:s}=Ue(e);return Ye({l:Math.min(.9,Math.max(t+.07,.69)),c:i,h:s})}function Xe(e){const{c:t,h:i}=Ue(e);return Ye({l:.255,c:Math.min(t,.037),h:i})}function Ge(e,t){const i=Ue(e);return Ye({...i,l:i.l+t})}function Je(e,t,i,s){const a=Ie(e);if(!a)return null;if(je(e,t)>=i)return Le(...a);const n=Ue(e),r=s?"lighter"===s?1:0:Ue(t).l<.5?1:0,o=e=>Ye({...n,l:n.l+(r-n.l)*e});if(je(o(1),t)<i)return null;let d=0,l=1;for(let e=0;e<24;e++){const e=(d+l)/2;je(o(e),t)>=i?l=e:d=e}return o(l)}async function Qe(e,t){const i={summary:t.summary};t.start_date_time&&(i.start_date_time=t.start_date_time),t.end_date_time&&(i.end_date_time=t.end_date_time),t.start_date&&(i.start_date=t.start_date),t.end_date&&(i.end_date=t.end_date),t.description&&(i.description=t.description),t.location&&(i.location=t.location),await e.callService("calendar","create_event",i,{entity_id:t.entity_id})}async function Ze(e,t){const i={entity_id:t.entity_id,summary:t.summary};t.start_date_time&&(i.start_date_time=t.start_date_time),t.end_date_time&&(i.end_date_time=t.end_date_time),t.start_date&&(i.start_date=t.start_date),t.end_date&&(i.end_date=t.end_date),t.description&&(i.description=t.description),t.location&&(i.location=t.location),t.attendee_entity_ids?.length&&(i.attendee_entity_ids=t.attendee_entity_ids),await e.callService("planavista","create_event_with_attendees",i)}async function et(e,t){const i={entity_id:t.entity_id,uid:t.uid};t.recurrence_id&&(i.recurrence_id=t.recurrence_id),await e.callService("planavista","delete_event",i)}async function tt(e,t="sensor.planavista_config"){await e.callService("homeassistant","update_entity",{entity_id:t})}async function it(e,t,i){try{const s=await e.callWS({type:"planavista/get_event_organizer",entity_id:t,uid:i});return s?.organizer_entity_id??null}catch{return null}}function st(e,t){if(!t)return null;const i=e.states[t];return i?.attributes?.entity_picture||null}function at(e,t){if(!t)return"";const i=e.states[t];return i?.attributes?.friendly_name||t.replace("person.","")}const nt=r`
  :host {
    display: block;
    font-family: var(--pv-font-family, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, system-ui, sans-serif);
    color: var(--pv-text, #1A1B1E);
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  ha-card {
    background: var(--pv-card-bg, #FFFFFF);
    border-radius: var(--pv-radius, 12px);
    box-shadow: var(--pv-shadow);
    overflow: hidden;
    transition: box-shadow var(--pv-transition, 200ms ease);
    border: none;
  }

  ha-card:hover {
    box-shadow: var(--pv-shadow-lg);
  }
`,rt=r`
  .pv-display {
    font-family: var(--pv-font-heading, ui-rounded, 'SF Pro Rounded', 'PlanaVista Rounded', system-ui, sans-serif);
    font-variant-numeric: tabular-nums;
    font-size: 3.5rem;
    font-weight: 300;
    line-height: 1.1;
    letter-spacing: -0.02em;
  }

  .pv-heading-1 {
    font-family: var(--pv-font-heading, ui-rounded, 'SF Pro Rounded', 'PlanaVista Rounded', system-ui, sans-serif);
    font-size: 1.5rem;
    font-weight: 600;
    line-height: 1.3;
    letter-spacing: -0.01em;
  }

  .pv-heading-2 {
    font-family: var(--pv-font-heading, ui-rounded, 'SF Pro Rounded', 'PlanaVista Rounded', system-ui, sans-serif);
    font-size: 1.125rem;
    font-weight: 600;
    line-height: 1.4;
  }

  .pv-body {
    font-size: 0.9375rem;
    font-weight: 400;
    line-height: 1.5;
  }

  .pv-caption {
    font-size: 0.8125rem;
    font-weight: 400;
    line-height: 1.4;
    color: var(--pv-text-secondary);
  }

  .pv-overline {
    font-size: 0.6875rem;
    font-weight: 600;
    letter-spacing: 0.05em;
    text-transform: uppercase;
    color: var(--pv-text-muted);
  }
`,ot=r`
  .pv-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    padding: 0.625rem 1.25rem;
    border: none;
    border-radius: var(--pv-radius-sm, 8px);
    font-family: inherit;
    font-size: 0.875rem;
    font-weight: 500;
    cursor: pointer;
    transition: all var(--pv-transition, 200ms ease);
    min-height: 48px;
    min-width: 48px;
    -webkit-tap-highlight-color: transparent;
    user-select: none;
  }

  .pv-btn-primary {
    background: var(--pv-accent);
    color: var(--pv-accent-text);
  }

  .pv-btn-primary:hover {
    opacity: 0.9;
    transform: translateY(-1px);
    box-shadow: var(--pv-shadow);
  }

  .pv-btn-primary:active {
    transform: translateY(0);
  }

  .pv-btn-secondary {
    background: transparent;
    color: var(--pv-text);
    border: 1px solid var(--pv-border);
  }

  .pv-btn-secondary:hover {
    background: var(--pv-event-hover);
  }

  .pv-btn-ghost {
    background: transparent;
    color: var(--pv-text-secondary);
    padding: 0.5rem;
  }

  .pv-btn-ghost:hover {
    background: var(--pv-event-hover);
    color: var(--pv-text);
  }

  .pv-btn-icon {
    background: transparent;
    color: var(--pv-text-secondary);
    padding: 0.5rem;
    border-radius: 50%;
    min-height: 48px;
    min-width: 48px;
  }

  .pv-btn-icon:hover {
    background: var(--pv-event-hover);
    color: var(--pv-text);
  }

  .pv-btn-pill {
    border-radius: 9999px;
    padding: 0.5rem 1rem;
  }
`,dt=r`
  .pv-event {
    position: relative;
    padding: 0.375rem 0.5rem 0.375rem 0.75rem;
    border-radius: var(--pv-radius-sm, 4px);
    border-left: 3px solid var(--event-color, var(--pv-accent));
    background: var(--event-color-light, color-mix(in srgb, var(--event-color, var(--pv-accent)) 12%, white));
    cursor: pointer;
    transition: all var(--pv-transition, 200ms ease);
    min-height: 28px;
    overflow: hidden;
  }

  .pv-event:hover {
    background: color-mix(in srgb, var(--event-color, var(--pv-accent)) 16%, white);
    transform: translateY(-1px);
  }

  .pv-event:active {
    transform: scale(0.98);
  }

  .pv-event-title {
    font-size: 0.8125rem;
    font-weight: 500;
    line-height: 1.3;
    color: var(--event-text, var(--pv-text));
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .pv-event-time {
    font-size: 0.6875rem;
    color: var(--event-text, var(--pv-text-secondary));
    margin-top: 1px;
  }

  .pv-event-pill {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 0.125rem 0.5rem;
    border-radius: var(--pv-radius-sm, 4px);
    border-left: 2px solid var(--event-color, var(--pv-accent));
    background: var(--event-color-light, color-mix(in srgb, var(--event-color, var(--pv-accent)) 12%, white));
    color: var(--event-text, var(--pv-text));
    font-size: 0.6875rem;
    font-weight: 500;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 100%;
  }
`,lt=r`
  .pv-overlay {
    position: fixed;
    inset: 0;
    background: var(--pv-backdrop, rgba(0, 0, 0, 0.3));
    backdrop-filter: blur(4px);
    -webkit-backdrop-filter: blur(4px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 999;
    animation: pv-fadeIn var(--pv-transition, 200ms ease) forwards;
  }

  .pv-dialog {
    background: var(--pv-card-bg-elevated, #FFFFFF);
    border-radius: var(--pv-radius-lg, 16px);
    box-shadow: var(--pv-shadow-xl);
    max-width: 480px;
    width: calc(100% - 2rem);
    max-height: 85vh;
    overflow-y: auto;
    animation: pv-scaleIn var(--pv-transition, 200ms ease) forwards;
  }

  .pv-dialog-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1.25rem 1.5rem;
    border-bottom: 1px solid var(--pv-border-subtle);
  }

  .pv-dialog-body {
    padding: 1.5rem;
  }

  .pv-dialog-footer {
    display: flex;
    justify-content: flex-end;
    gap: 0.75rem;
    padding: 1rem 1.5rem;
    border-top: 1px solid var(--pv-border-subtle);
  }

  .pv-popup {
    background: var(--pv-card-bg-elevated, #FFFFFF);
    border-radius: var(--pv-radius-lg, 16px);
    box-shadow: var(--pv-shadow-xl);
    max-width: 360px;
    width: calc(100% - 2rem);
    animation: pv-scaleIn var(--pv-transition, 200ms ease) forwards;
  }
`,ct=r`
  .pv-input {
    width: 100%;
    padding: 0.75rem 1rem;
    border: 1px solid var(--pv-border);
    border-radius: var(--pv-radius-sm, 8px);
    background: var(--pv-card-bg);
    color: var(--pv-text);
    font-family: inherit;
    font-size: 0.9375rem;
    transition: border-color var(--pv-transition, 200ms ease);
    box-sizing: border-box;
    min-height: 48px;
  }

  .pv-input:focus {
    outline: none;
    border-color: var(--pv-accent);
    box-shadow: 0 0 0 3px color-mix(in srgb, var(--pv-accent) 15%, transparent);
  }

  .pv-input::placeholder {
    color: var(--pv-text-muted);
  }

  .pv-label {
    display: block;
    font-size: 0.8125rem;
    font-weight: 500;
    color: var(--pv-text-secondary);
    margin-bottom: 0.375rem;
  }

  .pv-select {
    appearance: none;
    background-image: url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%236B7280' d='M6 8L1 3h10z'/%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 0.75rem center;
    padding-right: 2.5rem;
  }

  .pv-toggle {
    position: relative;
    width: 44px;
    height: 24px;
    background: var(--pv-border);
    border-radius: var(--pv-radius, 12px);
    cursor: pointer;
    transition: background var(--pv-transition, 200ms ease);
  }

  .pv-toggle.active {
    background: var(--pv-accent);
  }

  .pv-toggle::after {
    content: '';
    position: absolute;
    top: 2px;
    left: 2px;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: white;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
    transition: transform var(--pv-transition, 200ms ease);
  }

  .pv-toggle.active::after {
    transform: translateX(20px);
  }
`,pt=r`
  .pv-now-line {
    position: absolute;
    left: 0;
    right: 0;
    height: 2px;
    background: var(--pv-now-color, #EF4444);
    z-index: 10;
    pointer-events: none;
  }

  .pv-now-line::before {
    content: '';
    position: absolute;
    left: -4px;
    top: -4px;
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: var(--pv-now-color, #EF4444);
  }

  @keyframes pv-nowPulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.6; }
  }

  .pv-now-line {
    animation: pv-nowPulse 3s ease-in-out infinite;
  }
`,ht=r`
  @keyframes pv-fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  @keyframes pv-fadeOut {
    from { opacity: 1; }
    to { opacity: 0; }
  }

  @keyframes pv-slideUp {
    from { transform: translateY(16px); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
  }

  @keyframes pv-slideDown {
    from { transform: translateY(-16px); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
  }

  @keyframes pv-scaleIn {
    from { transform: scale(0.95); opacity: 0; }
    to { transform: scale(1); opacity: 1; }
  }

  @keyframes pv-slideLeft {
    from { transform: translateX(24px); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }

  @keyframes pv-slideRight {
    from { transform: translateX(-24px); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }
`;r`
  ::-webkit-scrollbar {
    width: 6px;
    height: 6px;
  }

  ::-webkit-scrollbar-track {
    background: transparent;
  }

  ::-webkit-scrollbar-thumb {
    background: var(--pv-border);
    border-radius: 3px;
  }

  ::-webkit-scrollbar-thumb:hover {
    background: var(--pv-text-muted);
  }
`;class ut extends le{constructor(){super(...arguments),this.calendars=[],this.timeFormat="12h",this.compact=!1,this.showStripes=!0,this.tick=0}render(){const e=this.event;if(!e)return Y;const t=e.shared_calendars||[],i=t.length>1,s=function(e,t){if(e.organizer){const t=e.shared_calendars.find(t=>t.display_name?.toLowerCase()===e.organizer?.toLowerCase()||t.entity_id===e.organizer);if(t)return t}for(const i of t){const t=e.shared_calendars.find(e=>e.entity_id===i.entity_id);if(t)return t}return e.shared_calendars[0]}(e,this.calendars),a=s?.color||e.calendar_color||"var(--pv-accent)";let n;n=this.showStripes&&i?`background: ${function(e){const t=e.length;if(t<=1)return"";const i=2===t?60:Math.min(50,Math.round(100/t*1.5)),s=(100-i)/(t-1),a=[];let n=0;return e.forEach((e,t)=>{const r=e.color_light||e.color,o=0===t?i:s;a.push(`${r} ${n}%`),n+=o,a.push(`${r} ${n}%`)}),`linear-gradient(135deg, ${a.join(", ")})`}(t)}`:this.showStripes?`background: ${t[0]?.color_light||e.calendar_color_light||e.calendar_color}`:"background: var(--pv-card-bg, #FFFFFF)";const r=this.showStripes?t[0]?.color_light||e.calendar_color_light||e.calendar_color:"#FFFFFF",o=this.showStripes?qe(r):"var(--pv-text)",d=De(e)?" past":"",l=(this.compact?"chip chip--compact":"chip")+d,c=Ae(e);return U`
      <div
        class="${l}"
        style="${n}; --chip-border-color: ${a}; --chip-text: ${o}"
        @click=${this._onClick}
      >
        <div class="chip-body">
          <div class="${"chip-title chip-title--nowrap"}">${e.summary}</div>
          ${this.compact?Y:U`
            <div class="chip-time">
              ${c?"All day":`${we(e.start,this.timeFormat)} – ${we(e.end,this.timeFormat)}`}
            </div>
          `}
        </div>
        ${!this.compact&&t.length>0?this._renderAvatars(t):Y}
      </div>
    `}_renderAvatars(e){const t=e.slice(0,4),i=e.length-4;return U`
      <div class="chip-avatars">
        ${t.map(e=>{const t=e.person_entity?st(this.hass,e.person_entity):null,i=e.person_entity?at(this.hass,e.person_entity):e.display_name||"?";return t?U`<img class="chip-avatar" src="${t}" alt="${i}" />`:U`<div class="chip-initial" style="background: ${e.color}; color: ${qe(e.color)}">${i[0]?.toUpperCase()||"?"}</div>`})}
        ${i>0?U`<div class="chip-overflow">+${i}</div>`:Y}
      </div>
    `}_onClick(){this.dispatchEvent(new CustomEvent("event-click",{detail:{event:this.event},bubbles:!0,composed:!0}))}}function mt(e,t){return Math.abs(e)<=50||Math.abs(e)<=2*Math.abs(t)?null:e>0?"prev":"next"}function vt(e){let t,i=null;return(...s)=>(i&&i.length===s.length&&s.every((e,t)=>e===i[t])||(t=e(...s),i=s),t)}ut.styles=[nt,r`
      :host { display: block; }

      .chip {
        display: flex;
        align-items: flex-start;
        gap: 0.5rem;
        padding: 0.5rem 0.625rem;
        border-radius: var(--pv-radius-sm, 6px);
        border-left: 3px solid var(--chip-border-color);
        cursor: pointer;
        transition: transform 120ms ease, box-shadow 120ms ease;
        min-height: 0;
        overflow: hidden;
      }

      .chip.past { opacity: 0.45; }

      .chip:hover {
        transform: translateY(-1px);
        box-shadow: 0 2px 8px rgba(0,0,0,0.08);
      }

      .chip:active {
        transform: scale(0.98);
      }

      .chip-body {
        flex: 1;
        min-width: 0;
      }

      .chip-title {
        font-weight: 600;
        font-size: 0.875rem;
        line-height: 1.3;
        color: var(--chip-text);
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .chip-title--nowrap {
        white-space: nowrap;
      }

      .chip-time {
        font-size: 0.75rem;
        font-weight: 500;
        color: var(--chip-text);
        opacity: 0.8;
        margin-top: 2px;
      }

      .chip-avatars {
        display: flex;
        align-items: center;
        flex-shrink: 0;
        gap: 0;
        margin-left: auto;
        padding-top: 2px;
      }

      .chip-avatar {
        width: 24px;
        height: 24px;
        border-radius: 50%;
        border: 2px solid rgba(255,255,255,0.8);
        margin-left: -6px;
        object-fit: cover;
        flex-shrink: 0;
      }

      .chip-avatar:first-child {
        margin-left: 0;
      }

      .chip-initial {
        width: 24px;
        height: 24px;
        border-radius: 50%;
        border: 2px solid rgba(255,255,255,0.8);
        margin-left: -6px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 0.625rem;
        font-weight: 700;
        color: white;
        flex-shrink: 0;
      }

      .chip-initial:first-child {
        margin-left: 0;
      }

      .chip-overflow {
        width: 24px;
        height: 24px;
        border-radius: 50%;
        border: 2px solid rgba(255,255,255,0.8);
        margin-left: -6px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 0.5rem;
        font-weight: 700;
        color: var(--pv-text-secondary);
        background: var(--pv-card-bg, #f0f0f0);
        flex-shrink: 0;
      }

      /* Compact mode (month view); .chip.chip--compact outranks the wider screens' .chip padding */
      .chip.chip--compact {
        padding: 0.25rem 0.5rem;
        border-left-width: 2px;
        border-radius: var(--pv-radius-sm, 4px);
      }

      .chip--compact .chip-title {
        font-size: 0.6875rem;
        font-weight: 500;
      }

      /* Responsive: small screens */
      @media (max-width: 479px) {
        .chip { padding: 0.375rem 0.5rem; }
        .chip-title { font-size: 0.8125rem; }
        .chip-time { font-size: 0.6875rem; }
        .chip-avatar, .chip-initial, .chip-overflow { width: 20px; height: 20px; font-size: 0.5rem; }
      }

      /* Large screens */
      @media (min-width: 1024px) {
        .chip { padding: 0.625rem 0.75rem; }
        .chip-title { font-size: 0.9375rem; }
        .chip-time { font-size: 0.8125rem; }
        .chip-avatar, .chip-initial, .chip-overflow { width: 28px; height: 28px; }
      }

      /* XL screens: ~50% larger for wall displays */
      @media (min-width: 1440px) {
        .chip { padding: 1rem 1.25rem; gap: 0.75rem; border-left-width: 4px; }
        .chip-title { font-size: 1.375rem; }
        .chip-time { font-size: 1.125rem; }
        .chip-avatar, .chip-initial, .chip-overflow { width: 40px; height: 40px; font-size: 0.8125rem; }
        .chip.chip--compact { padding: 0.375rem 0.75rem; border-left-width: 3px; }
        .chip--compact .chip-title { font-size: 1rem; }
      }
    `],e([ue({attribute:!1})],ut.prototype,"hass",void 0),e([ue({attribute:!1})],ut.prototype,"event",void 0),e([ue({attribute:!1})],ut.prototype,"calendars",void 0),e([ue({attribute:!1})],ut.prototype,"timeFormat",void 0),e([ue({type:Boolean})],ut.prototype,"compact",void 0),e([ue({type:Boolean})],ut.prototype,"showStripes",void 0),e([ue({type:Number})],ut.prototype,"tick",void 0),ge("pv-event-chip",ut);const gt=/^\d{2}:\d{2}$/;function bt(e){return String(e).padStart(2,"0")}function yt(e){return`${bt(e.getHours())}:${bt(e.getMinutes())}`}function ft(e){const t=-e.getTimezoneOffset(),i=t>=0?"+":"-",s=Math.abs(t);return`${Ee(e)}T${bt(e.getHours())}:${bt(e.getMinutes())}:${bt(e.getSeconds())}${i}${bt(Math.floor(s/60))}:${bt(s%60)}`}function _t(e,t){const[i,s,a]=e.split("-").map(Number);return Ee(new Date(i,s-1,a+t))}function xt(e,t){const[i,s,a]=e.split("-").map(Number),[n,r]=t.split(":").map(Number);return new Date(i,s-1,a,n,r,0,0)}function wt(e){return e.allDay?{start_date:e.date,end_date:_t(e.date,Math.max(1,Math.round(e.spanDays)))}:{start_date_time:ft(xt(e.date,e.startTime)),end_date_time:ft(xt(_t(e.date,e.endDayOffset),e.endTime))}}function $t(e,t=e.calendar_entity_id){if(!e.uid)throw new Error("This event has no unique ID, so it can only be changed in its calendar app.");const i={entity_id:t,uid:e.uid};return e.recurrence_id&&(i.recurrence_id=e.recurrence_id),i}function kt(e,t=e.calendar_entity_id){const i=_e(e.start)?{entity_id:t,summary:e.summary,start_date:e.start,end_date:e.end}:{entity_id:t,summary:e.summary,start_date_time:e.start,end_date_time:e.end};return e.description&&(i.description=e.description),e.location&&(i.location=e.location),i}function Ft(e,t,i){return{deleteData:$t(e,t),createData:{...i,entity_id:t},restoreData:kt(e,t)}}class Et extends Error{constructor(e,t){super(e),this.restored=t,this.name="EditRestoreError"}}function Ct(e){return e instanceof Error?e.message:String(e&&"object"==typeof e&&"message"in e?e.message:e)}async function St(e){await e.remove();try{await e.create()}catch(t){const i=Ct(t);try{await e.restore()}catch(e){throw new Et(`Your changes couldn't be saved (${i}), and the original event couldn't be put back (${Ct(e)}). Please re-create it in your calendar app.`,!1)}throw new Et(`Your changes couldn't be saved (${i}). The original event was restored.`,!0)}}class Dt{constructor(){this.hiddenCalendars=new Set,this.currentView="day",this.currentDate=new Date,this.selectedEvent=null,this.dialogOpen=null,this.createPrefill=null,this.isLoading=!1,this._hosts=new Set,this._autoAdvanceTimer=null,this._todayKey=Ee(new Date),this._onVisibilityChange=()=>{"visible"===document.visibilityState&&this.checkRollover()}}subscribe(e){this._hosts.add(e)}unsubscribe(e){this._hosts.delete(e)}_notify(){for(const e of this._hosts)e.requestUpdate()}toggleCalendar(e){const t=new Set(this.hiddenCalendars);t.has(e)?t.delete(e):t.add(e),this.hiddenCalendars=t,this._notify()}setView(e){this.currentView!==e&&(this.currentView=e,this._notify())}navigateDate(e){this.currentDate="today"===e?new Date:function(e,t,i){const s=new Date(e),a="next"===i?1:-1;switch(t){case"day":s.setDate(s.getDate()+a);break;case"week":case"agenda":s.setDate(s.getDate()+7*a);break;case"month":s.setMonth(s.getMonth()+a)}return s}(this.currentDate,this.currentView,e),this._notify()}setDate(e){this.currentDate=new Date(e),this._notify()}selectEvent(e){this.selectedEvent=e,this._notify()}openCreateDialog(e){this.dialogOpen="create",this.createPrefill=e||null,this._notify()}openEditDialog(e,t){this.dialogOpen="edit",this.selectedEvent=e;const i={...e};t?.removeGuests&&(i._removeGuestsHint=!0),this.createPrefill=i,this._notify()}closeDialog(){this.dialogOpen=null,this.createPrefill=null,this._notify()}async doCreateEvent(e,t){this.isLoading=!0,this._notify();try{await Qe(e,t),await tt(e),this.closeDialog()}catch(e){throw console.error("PlanaVista: Failed to create event",e),e}finally{this.isLoading=!1,this._notify()}}async doDeleteEvent(e,t){this.isLoading=!0,this._notify();try{await et(e,t),await tt(e),this.selectedEvent=null,this.closeDialog()}catch(e){throw console.error("PlanaVista: Failed to delete event",e),e}finally{this.isLoading=!1,this._notify()}}async doEditEvent(e,t,i,s){this.isLoading=!0,this._notify();try{await St({remove:()=>et(e,t),create:()=>Qe(e,i),restore:()=>Qe(e,s)}),await tt(e),this.selectedEvent=null,this.closeDialog()}catch(t){throw console.error("PlanaVista: Failed to edit event",t),await tt(e).catch(()=>{}),t}finally{this.isLoading=!1,this._notify()}}checkRollover(e=new Date){const t=function(e,t,i){return Ee(i)===t?null:Ee(e)===t?new Date(i):null}(this.currentDate,this._todayKey,e);this._todayKey=Ee(e),t&&(this.currentDate=t,this._notify())}get autoAdvancing(){return null!==this._autoAdvanceTimer}startAutoAdvance(){this._autoAdvanceTimer||(this.checkRollover(),this._autoAdvanceTimer=setInterval(()=>this.checkRollover(),6e4),"undefined"!=typeof document&&document.addEventListener("visibilitychange",this._onVisibilityChange))}stopAutoAdvance(){this._autoAdvanceTimer&&(clearInterval(this._autoAdvanceTimer),this._autoAdvanceTimer=null),"undefined"!=typeof document&&document.removeEventListener("visibilitychange",this._onVisibilityChange)}}class At{constructor(e){this.host=e,this.store=new Dt,e.addController(this)}hostConnected(){this.store.subscribe(this.host),this.store.startAutoAdvance()}hostDisconnected(){this.store.unsubscribe(this.host),this.store.stopAutoAdvance()}}class zt{constructor(e,t){this.host=e,this.getStore=t,e.addController(this)}hostConnected(){this._sync()}hostUpdate(){this._sync()}hostDisconnected(){this._store?.unsubscribe(this.host),this._store=void 0}_sync(){const e=this.getStore();e!==this._store&&(this._store?.unsubscribe(this.host),e?.subscribe(this.host),this._store=e)}}function Mt(e,t){const i=(e?.calendars||[]).filter(e=>!1!==e.visible),s=t?.calendars;return Array.isArray(s)&&s.length>0?i.filter(e=>s.includes(e.entity_id)):i}const Tt="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, system-ui, sans-serif",Bt="ui-rounded, 'SF Pro Rounded', 'PlanaVista Rounded', "+Tt,Pt={sharp:{radius:"4px",radiusLg:"6px",radiusSm:"2px"},rounded:{radius:"12px",radiusLg:"16px",radiusSm:"8px"},pill:{radius:"20px",radiusLg:"24px",radiusSm:"14px"}},Ot={none:{shadow:"none",shadowLg:"none",shadowXl:"none"},subtle:{shadow:"0 1px 3px rgba(0, 0, 0, 0.08), 0 1px 2px rgba(0, 0, 0, 0.04)",shadowLg:"0 10px 25px rgba(0, 0, 0, 0.08), 0 4px 10px rgba(0, 0, 0, 0.04)",shadowXl:"0 20px 40px rgba(0, 0, 0, 0.12)"},bold:{shadow:"0 2px 8px rgba(0, 0, 0, 0.15), 0 1px 3px rgba(0, 0, 0, 0.1)",shadowLg:"0 12px 32px rgba(0, 0, 0, 0.18), 0 6px 14px rgba(0, 0, 0, 0.1)",shadowXl:"0 24px 48px rgba(0, 0, 0, 0.24)"}},Rt={gradient_purple:{light:"linear-gradient(135deg, #667eea 0%, #764ba2 100%)",dark:"linear-gradient(135deg, #3730A3 0%, #581C87 100%)"},gradient_teal:{light:"linear-gradient(135deg, #0D9488 0%, #2563EB 100%)",dark:"linear-gradient(135deg, #115E59 0%, #1E3A8A 100%)"},gradient_sunset:{light:"linear-gradient(135deg, #F59E0B 0%, #EF4444 100%)",dark:"linear-gradient(135deg, #92400E 0%, #991B1B 100%)"},solid_accent:{light:"",dark:""},solid_dark:{light:"#1A1B1E",dark:"#0B0C0D"}},It={"color-scheme":"light","--pv-bg":"#F8F8F6","--pv-card-bg":"#FFFFFF","--pv-card-bg-elevated":"#FFFFFF","--pv-text":"#1A1B1E","--pv-text-secondary":"#5F6670","--pv-text-muted":"#8E949C","--pv-border":"#E7E7E3","--pv-border-subtle":"#F1F1EE","--pv-track":"#ECECE8","--pv-chip":"#F1F1EE","--pv-seg":"#ECECE8","--pv-seg-on":"#FFFFFF","--pv-accent":"#5B5BD6","--pv-accent-text":"#FFFFFF","--pv-accent-ink":"#5B5BD6","--pv-accent-tint":"#EEEEFC","--pv-accent-tint-ink":"#3B3BB0","--pv-warn-bg":"#FDF1DC","--pv-warn-ink":"#8A5A00","--pv-bad-bg":"#FBE4E4","--pv-bad-ink":"#A12828","--pv-star":"#8A6A00","--pv-danger":"#C62828","--pv-today-bg":"rgba(91, 91, 214, 0.06)","--pv-now-color":"#E5484D","--pv-event-hover":"rgba(0, 0, 0, 0.03)","--pv-shadow":Ot.subtle.shadow,"--pv-shadow-lg":Ot.subtle.shadowLg,"--pv-shadow-xl":Ot.subtle.shadowXl,"--pv-radius":"12px","--pv-radius-lg":"16px","--pv-radius-sm":"8px","--pv-transition":"200ms cubic-bezier(0.4, 0, 0.2, 1)","--pv-font-family":Tt,"--pv-font-heading":Bt,"--pv-header-gradient":"#FFFFFF","--pv-header-text":"#1A1B1E","--pv-header-muted":"#5F6670","--pv-backdrop":"rgba(0, 0, 0, 0.3)"},Lt={...It,"color-scheme":"dark","--pv-bg":"#111214","--pv-card-bg":"#1B1C1F","--pv-card-bg-elevated":"#25272B","--pv-text":"#E9E9E6","--pv-text-secondary":"#A3A7AE","--pv-text-muted":"#6F747C","--pv-border":"#2B2D31","--pv-border-subtle":"#232528","--pv-track":"#2C2E32","--pv-chip":"#25272B","--pv-seg":"#25272B","--pv-seg-on":"#3A3C42","--pv-accent":"#6262DE","--pv-accent-text":"#FFFFFF","--pv-accent-ink":"#8E8EF2","--pv-accent-tint":"#25254A","--pv-accent-tint-ink":"#C5C5FF","--pv-warn-bg":"#382A0F","--pv-warn-ink":"#F0C066","--pv-bad-bg":"#3B1C1F","--pv-bad-ink":"#F3A5A5","--pv-star":"#EFC75E","--pv-danger":"#B93838","--pv-today-bg":"rgba(142, 142, 242, 0.08)","--pv-now-color":"#FE6062","--pv-event-hover":"rgba(255, 255, 255, 0.04)","--pv-shadow":"none","--pv-shadow-lg":"none","--pv-shadow-xl":"none","--pv-header-gradient":"#1B1C1F","--pv-header-text":"#E9E9E6","--pv-header-muted":"#A3A7AE","--pv-backdrop":"rgba(0, 0, 0, 0.6)"},Nt={planavista:{light:It,dark:Lt},minimal:{light:{...It,"--pv-bg":"#FFFFFF","--pv-border":"#ECEEF1","--pv-border-subtle":"#F5F6F8","--pv-track":"#F1F2F4","--pv-chip":"#F3F4F6","--pv-seg":"#F1F2F4","--pv-accent":"#111827","--pv-accent-ink":"#111827","--pv-accent-tint":"#F3F4F6","--pv-accent-tint-ink":"#111827","--pv-today-bg":"rgba(17, 24, 39, 0.03)","--pv-shadow":"0 0 0 1px rgba(0, 0, 0, 0.05)","--pv-shadow-lg":"0 4px 12px rgba(0, 0, 0, 0.05)","--pv-shadow-xl":"0 8px 24px rgba(0, 0, 0, 0.08)","--pv-radius":"8px","--pv-radius-lg":"12px","--pv-radius-sm":"6px","--pv-transition":"150ms ease"},dark:{...Lt,"--pv-bg":"#000000","--pv-card-bg":"#0E0E10","--pv-card-bg-elevated":"#18181B","--pv-text":"#EDEDED","--pv-text-secondary":"#A1A1AA","--pv-text-muted":"#71717A","--pv-border":"#1F2023","--pv-border-subtle":"#161618","--pv-track":"#1F2023","--pv-chip":"#18181B","--pv-seg":"#18181B","--pv-seg-on":"#2A2A2E","--pv-accent":"#EDEDED","--pv-accent-text":"#111214","--pv-accent-ink":"#EDEDED","--pv-accent-tint":"#1F1F23","--pv-accent-tint-ink":"#EDEDED","--pv-today-bg":"rgba(237, 237, 237, 0.05)","--pv-radius":"8px","--pv-radius-lg":"12px","--pv-radius-sm":"6px","--pv-transition":"150ms ease","--pv-header-gradient":"#0E0E10","--pv-header-text":"#EDEDED","--pv-header-muted":"#A1A1AA"}},vibrant:{light:{...It,"--pv-bg":"#FAF8FF","--pv-border":"#ECE6FB","--pv-border-subtle":"#F4F0FD","--pv-accent":"#7C3AED","--pv-accent-ink":"#7C3AED","--pv-accent-tint":"#F1EAFE","--pv-accent-tint-ink":"#5B21B6","--pv-today-bg":"rgba(124, 58, 237, 0.06)","--pv-now-color":"#F43F5E","--pv-shadow":"0 1px 3px rgba(124, 58, 237, 0.1), 0 1px 2px rgba(0, 0, 0, 0.04)","--pv-shadow-lg":"0 10px 25px rgba(124, 58, 237, 0.15), 0 4px 10px rgba(0, 0, 0, 0.04)","--pv-shadow-xl":"0 20px 40px rgba(124, 58, 237, 0.2)","--pv-radius":"14px","--pv-radius-lg":"20px","--pv-radius-sm":"10px","--pv-transition":"250ms cubic-bezier(0.34, 1.56, 0.64, 1)","--pv-header-gradient":"linear-gradient(135deg, #7C3AED 0%, #EC4899 100%)","--pv-header-text":"#FFFFFF","--pv-header-muted":"rgba(255, 255, 255, 0.85)","--pv-backdrop":"rgba(124, 58, 237, 0.2)"},dark:{...Lt,"--pv-bg":"#150E22","--pv-card-bg":"#20172F","--pv-card-bg-elevated":"#2A1F3D","--pv-border":"#2E2442","--pv-border-subtle":"#251B36","--pv-track":"#2E2442","--pv-chip":"#2A1F3D","--pv-seg":"#2A1F3D","--pv-seg-on":"#3A2D52","--pv-accent":"#7C4DEB","--pv-accent-ink":"#B79BFA","--pv-accent-tint":"#2E2050","--pv-accent-tint-ink":"#D9C9FF","--pv-today-bg":"rgba(183, 155, 250, 0.08)","--pv-radius":"14px","--pv-radius-lg":"20px","--pv-radius-sm":"10px","--pv-transition":"250ms cubic-bezier(0.34, 1.56, 0.64, 1)","--pv-header-gradient":"linear-gradient(135deg, #4C1D95 0%, #831843 100%)","--pv-header-text":"#FFFFFF","--pv-header-muted":"rgba(255, 255, 255, 0.85)"}}};function Ht(e,t){const[i,s,a]=Ie(e)??[0,0,0];return`rgba(${i}, ${s}, ${a}, ${t})`}function jt(e){const{c:t,h:i}=Ue(e);return Ye({l:.955,c:Math.min(t,.02),h:i})}function qt(e,t){const{c:i,h:s}=Ue(e);return Ye("light"===t?{l:.43,c:i,h:s}:{l:.84,c:Math.min(i,.09),h:s})}function Ut(e,t,i,s,a){const n=Je(i,e,4.5,a)??t;return{"--pv-text-secondary":n,"--pv-text-muted":Je(s,e,3,a)??n}}function Vt(e,t,i){if("plain"===e)return{"--pv-header-gradient":t["--pv-card-bg"],"--pv-header-text":t["--pv-text"],"--pv-header-muted":t["--pv-text-secondary"]};const s=Rt[e],a="solid_accent"===e?t["--pv-accent"]:s?s[i]:e,n=s&&"solid_accent"!==e?"#FFFFFF":qe(a);return{"--pv-header-gradient":a,"--pv-header-text":n,"--pv-header-muted":"#FFFFFF"===n?"rgba(255, 255, 255, 0.85)":"rgba(26, 27, 30, 0.7)"}}function Wt(e,t){const i={...(Nt[e.pair]??Nt.planavista)[t]},s="light"===t?e.light:e.dark,a=e.light,n=s.background??("dark"===t&&a.background?function(e){const{c:t,h:i}=Ue(e);return Ye({l:.19,c:Math.min(t,.02),h:i})}(a.background):void 0);n&&Ie(n)&&Object.assign(i,function(e){if(Ue(e).l>=.6){const t=Ue(e).l>=.9?"#FFFFFF":Ge(e,.04);return{"color-scheme":"light","--pv-bg":e,"--pv-card-bg":t,"--pv-card-bg-elevated":t,"--pv-text":"#1A1B1E",...Ut(t,"#1A1B1E","#5F6670","#8E949C","darker"),"--pv-border":Ge(e,-.07),"--pv-border-subtle":Ge(e,-.035),"--pv-track":Ge(e,-.06),"--pv-chip":Ge(e,-.04),"--pv-seg":Ge(e,-.06),"--pv-seg-on":t,"--pv-event-hover":"rgba(0, 0, 0, 0.03)","--pv-backdrop":"rgba(0, 0, 0, 0.3)"}}const t=Ge(e,.045);return{"color-scheme":"dark","--pv-bg":e,"--pv-card-bg":t,"--pv-card-bg-elevated":Ge(e,.075),"--pv-text":"#E9E9E6",...Ut(t,"#E9E9E6","#A3A7AE","#6F747C","lighter"),"--pv-border":Ge(e,.115),"--pv-border-subtle":Ge(e,.07),"--pv-track":Ge(e,.12),"--pv-chip":Ge(e,.075),"--pv-seg":Ge(e,.075),"--pv-seg-on":Ge(e,.16),"--pv-event-hover":"rgba(255, 255, 255, 0.04)","--pv-backdrop":"rgba(0, 0, 0, 0.6)"}}(n));const r=s.accent??("dark"===t&&a.accent?Ke(a.accent):void 0);r&&Ie(r)&&Object.assign(i,function(e,t,i){return{"--pv-accent":e,"--pv-accent-text":qe(e),"--pv-accent-ink":Je(e,t,4.5)??qe(t),"--pv-accent-tint":"light"===i?jt(e):Xe(e),"--pv-accent-tint-ink":qt(e,i),"--pv-today-bg":Ht(e,"light"===i?.06:.1)}}(r,i["--pv-card-bg"],t));const o=s.header??("dark"===t&&a.header?a.header.startsWith("#")?function(e){const{l:t,c:i,h:s}=Ue(e);return Ye({l:Math.min(t,.4),c:.8*i,h:s})}(a.header):a.header:void 0);o?Object.assign(i,Vt(o,i,t)):n&&i["--pv-header-gradient"]===Nt[e.pair]?.[t]["--pv-card-bg"]&&Object.assign(i,Vt("plain",i,t));const d=s.now_color??("dark"===t&&a.now_color?Ke(a.now_color):void 0);d&&Ie(d)&&(i["--pv-now-color"]=d);const l=Pt[e.shape.corner_style??""];l&&(i["--pv-radius"]=l.radius,i["--pv-radius-lg"]=l.radiusLg,i["--pv-radius-sm"]=l.radiusSm);const c=Ot[e.shape.shadow_depth??""];c&&(i["--pv-shadow"]=c.shadow,i["--pv-shadow-lg"]=c.shadowLg,i["--pv-shadow-xl"]=c.shadowXl);const p=e.shape.avatar_border;return"white"===p||"light"===p?i["--pv-avatar-border"]="#FFFFFF":p&&Ie(p)&&(i["--pv-avatar-border"]=p),i}function Yt(e,t,i){return"light"!==i&&Ie(e)?{color:Ke(e),colorLight:Xe(e)}:{color:e,colorLight:t||e}}const Kt=new WeakMap;function Xt(e,t){if(!e||"light"===t)return e;const i=new Map,s=(e,s)=>{const a=`${e}|${s??""}`;let n=i.get(a);return n||(n=Yt(e,s,t),i.set(a,n)),n};return{...e,calendars:(e.calendars||[]).map(e=>{const{color:t,colorLight:i}=s(e.color,e.color_light);return{...e,color:t,color_light:i}}),events:(e.events||[]).map(e=>{const{color:t,colorLight:i}=s(e.calendar_color,e.calendar_color_light);return{...e,calendar_color:t,calendar_color_light:i}})}}const Gt={number:28,row:21,more:14};class Jt extends le{constructor(){super(...arguments),this.events=[],this.calendars=[],this.currentDate=new Date,this.hiddenCalendars=new Set,this.timeFormat="12h",this.hideColumnHeaders=!1,this.avatarBorderMode="primary",this.sharedEventMap=new Map,this.tick=0,this.layout="landscape",this.progress=null,this.revision=0,this._hourPx=80,this._measured=null}connectedCallback(){super.connectedCallback(),this.hasUpdated&&this._watchHours()}_openDay(e){this.dispatchEvent(new CustomEvent("pv-open",{detail:{module:"chores",view:"my_day",member:e},bubbles:!0,composed:!0}))}disconnectedCallback(){super.disconnectedCallback(),this._hoursObserver?.disconnect(),this._measured=null}firstUpdated(){this._watchHours(),this._fitHours(),this._scrollToNow()}updated(e){super.updated(e),e.has("currentDate")&&this._scrollToNow(),this._watchHours(),e.has("layout")&&this._fitHours()}_watchHours(){const e=this.shadowRoot?.querySelector(".time-grid-wrapper")??null;e!==this._measured&&(this._hoursObserver?.disconnect(),this._measured=e,e&&"undefined"!=typeof ResizeObserver&&(this._hoursObserver??=new ResizeObserver(()=>this._fitHours()),this._hoursObserver.observe(e)))}_fitHours(){const e=this._measured;if(!e)return;const t=(i=this.layout,s=e.clientHeight,"portrait"===i&&s>0?Math.max(48,Math.min(80,Math.floor(s/14))):80);var i,s;if(t===this._hourPx)return;const a=(n=e.scrollTop,o=t,(r=this._hourPx)>0?Math.round(n*o/r):n);var n,r,o;this._hourPx=t,this.updateComplete.then(()=>{e.scrollTop=a})}_scrollToNow(){requestAnimationFrame(()=>{const e=this.shadowRoot?.querySelector(".time-grid-wrapper");if(!e)return;this._scrollContainer=e;const t=new Date,i=60*(t.getHours()-0)+t.getMinutes();if(i>0&&i<1440){const t=i/1440*e.scrollHeight-e.clientHeight/3;e.scrollTo({top:Math.max(0,t),behavior:"smooth"})}})}render(){const e=Pe(this.events,this.hiddenCalendars),t=new Date(this.currentDate);t.setHours(0,0,0,0);const i=new Date(this.currentDate);i.setHours(23,59,59,999);const s=Be(e,t,i),a=s.filter(e=>Ae(e)),n=s.filter(e=>!Ae(e)),r=this.calendars.filter(e=>!1!==e.visible&&!this.hiddenCalendars.has(e.entity_id)),o=function(e,t){const i=new Map,s=new Map(t.map(e=>[e.entity_id,e]));for(const e of t)if(!1!==e.visible){const t=e.person_entity||e.entity_id;i.has(t)||i.set(t,[])}for(const t of e){const e=s.get(t.calendar_entity_id),a=e?.person_entity||t.calendar_entity_id;i.has(a)||i.set(a,[]),i.get(a).push(t)}return i}(n,r),d=Array.from(o.keys()),l=new Date,c=l.toDateString()===this.currentDate.toDateString(),p=60*(l.getHours()-0)+l.getMinutes(),h=c?p/1440*100:-1;return 0===r.length?U`
        <div class="empty-state">
          <ha-icon icon="mdi:calendar-blank"></ha-icon>
          <p>No calendars visible</p>
        </div>
      `:U`
      <div class="day-container" style="--pv-hour-px: ${this._hourPx}px">
        ${a.length>0?U`
          <div class="all-day-section">
            <div class="all-day-gutter">All Day</div>
            <div class="all-day-events">
              ${a.map(e=>U`
                <div
                  class="all-day-chip${De(e)?" past":""}"
                  style="background: ${e.calendar_color}; color: ${qe(e.calendar_color)}"
                  @click=${()=>this._onEventClick(e)}
                >${e.summary}</div>
              `)}
            </div>
          </div>
        `:Y}

        ${this.hideColumnHeaders?Y:U`
          <div class="column-headers">
            <div class="header-gutter"></div>
            ${d.map(e=>{const t=r.find(t=>(t.person_entity||t.entity_id)===e),i=t?.person_entity?st(this.hass,t.person_entity):null,s=t?.person_entity?at(this.hass,t.person_entity):t?.display_name||e,a=t?.color||"#6366F1",n=t?.color_light||a,o="light"===this.avatarBorderMode?n:"primary"===this.avatarBorderMode?a:this.avatarBorderMode,d=i?U`<img class="person-avatar" src="${i}" alt="${s}"
                    style="${o?`--pv-avatar-border: ${o}`:""}" />`:U`<div class="person-initial" style="background: ${a}; color: ${qe(a)}">${s[0]?.toUpperCase()||"?"}</div>`,l=c&&t?.member_id&&this.progress?function(e,t){if(!t||t.due<=0)return null;const i=Math.min(t.due,t.done+t.pending),s=i>=t.due;return{fraction:i/t.due,closed:s,label:s?`${e}, ring closed for today. Open ${e}'s day`:`${e}, ${i} of ${t.due} done today. Open ${e}'s day`}}(s,this.progress(t.member_id)):null;return U`
                <div class="person-header">
                  ${l?U`
                    <button class="ring-wrap" type="button" aria-label=${l.label}
                      @click=${()=>this._openDay(t.member_id)}>
                      ${d}
                      <svg viewBox="0 0 100 100" aria-hidden="true">
                        <circle class="track" cx="50" cy="50" r="46" fill="none" stroke-width="6"></circle>
                        <circle class="done" cx="50" cy="50" r="46" fill="none" stroke=${a} stroke-width="6" stroke-linecap="round"
                          stroke-dasharray=${2*Math.PI*46} stroke-dashoffset=${2*Math.PI*46*(1-l.fraction)}></circle>
                      </svg>
                    </button>
                  `:d}
                  <span class="person-name">${s}</span>
                </div>
              `})}
          </div>
        `}

        ${c?Y:U`
          <div class="date-banner">
            <ha-icon icon="mdi:calendar-today"></ha-icon>
            ${this.currentDate.toLocaleDateString("en-US",{weekday:"long",month:"long",day:"numeric",year:"numeric"})}
          </div>
        `}

        <div class="time-grid-wrapper">
          <div class="time-grid">
            <div class="time-gutter">
              ${this._renderTimeLabels()}
            </div>
            <div class="columns-area">
              ${this._renderHourLines()}
              ${h>=0&&h<=100?U`
                <div class="pv-now-line" style="top: ${h}%"></div>
              `:Y}
              ${d.map(e=>this._renderColumn(e,o.get(e)||[]))}
            </div>
          </div>
          ${this._renderNextDayFooter()}
        </div>
      </div>
    `}_renderTimeLabels(){const e=[];for(let t=0;t<=24;t++){const i=(t-0)/24*100;let s;if("24h"===this.timeFormat)s=`${String(t%24).padStart(2,"0")}:00`;else{const e=t%24;s=`${e%12||12} ${e>=12?"PM":"AM"}`}e.push(U`
        <div class="time-label" style="top: ${i}%">${s}</div>
      `)}return e}_renderHourLines(){const e=[],t=1/24*100;for(let i=0;i<24;i++){const s=(i-0)/24*100;i%2==1&&e.push(U`
          <div class="hour-band-odd" style="top: ${s}%; height: ${t}%"></div>
        `)}return e}_renderNextDayFooter(){const e=new Date(this.currentDate);e.setDate(e.getDate()+1);const t=e.toLocaleDateString("en-US",{weekday:"long",month:"long",day:"numeric"});return U`
      <div class="next-day-footer" @click=${this._goToNextDay}>
        ${t}
        <ha-icon icon="mdi:arrow-down"></ha-icon>
      </div>
    `}_goToToday(){this.dispatchEvent(new CustomEvent("day-click",{detail:{date:new Date},bubbles:!0,composed:!0}))}_goToNextDay(){const e=new Date(this.currentDate);e.setDate(e.getDate()+1),this.dispatchEvent(new CustomEvent("day-click",{detail:{date:e},bubbles:!0,composed:!0}))}_renderColumn(e,t){const i=function(e){const t=e.filter(e=>!Ae(e)).sort((e,t)=>xe(e.start).getTime()-xe(t.start).getTime());if(0===t.length)return[];const i=t.map(e=>({event:e,start:xe(e.start).getTime(),end:xe(e.end).getTime(),column:0,cluster:0}));let s=0,a=0;for(let e=0;e<i.length;e++){let t=!1;for(let s=a;s<e;s++)if(i[e].start<i[s].end){t=!0;break}if(!t&&e>a){const t=e;let n=0;for(let e=a;e<t;e++)n=Math.max(n,i[e].column+1);for(let e=a;e<t;e++)i[e].cluster=s;s++,a=e}const n=new Set;for(let t=a;t<e;t++)i[e].start<i[t].end&&n.add(i[t].column);let r=0;for(;n.has(r);)r++;i[e].column=r}i.forEach((e,t)=>{t>=a&&(e.cluster=s)});const n=new Map;for(const e of i){const t=n.get(e.cluster)||0;n.set(e.cluster,Math.max(t,e.column+1))}return i.map(e=>({...e.event,column:e.column,totalColumns:n.get(e.cluster)||1}))}(t);return U`
      <div class="person-column">
        ${i.map(e=>{const t=function(e,t=0,i=24,s){const a=xe(e.start),n=xe(e.end),r=60*(i-t),o=s??a,d=new Date(o.getFullYear(),o.getMonth(),o.getDate(),t),l=new Date(o.getFullYear(),o.getMonth(),o.getDate(),i),c=e=>e<=d?0:e>=l?r:60*(e.getHours()-t)+e.getMinutes(),p=c(a),h=c(n),u=Math.max(h-p,15);return{top:p/r*100,height:u/r*100}}(e,0,24,this.currentDate),i=e.totalColumns>1?`calc(${100/e.totalColumns}% - 6px)`:"calc(100% - 6px)",s=e.totalColumns>1?`calc(${e.column/e.totalColumns*100}% + 3px)`:"3px",a=e.uid?this.sharedEventMap.get(e.uid):void 0,n=a&&a.length>1;return U`
            <div
              class="positioned-event${De(e)?" past":""}"
              style="
                top: ${t.top}%;
                height: ${t.height}%;
                width: ${i};
                left: ${s};
                --event-color: ${e.calendar_color};
                --event-color-light: ${e.calendar_color_light||""};
                --event-text: ${qe(e.calendar_color_light||e.calendar_color)};
              "
              @click=${()=>this._onEventClick(e)}
            >
              <div class="event-title">${e.summary}</div>
              <div class="event-time">${we(e.start,this.timeFormat)}</div>
              ${n?U`
                <div class="event-participants">
                  ${a.map(e=>{const t=e.person_entity?st(this.hass,e.person_entity):null,i=e.person_entity?at(this.hass,e.person_entity):e.calendar_name;return t?U`<img class="event-participant-avatar"
                          src="${t}" alt="${i}"
                          style="--participant-color: ${e.calendar_color}" />`:U`<div class="event-participant-initial"
                          style="background: ${e.calendar_color}; --participant-color: ${e.calendar_color}; color: ${qe(e.calendar_color)}"
                        >${i[0]?.toUpperCase()||"?"}</div>`})}
                </div>
              `:Y}
            </div>
          `})}
      </div>
    `}_onEventClick(e){this.dispatchEvent(new CustomEvent("event-click",{detail:{event:e},bubbles:!0,composed:!0}))}}function Qt(e,t=48){return(Zt[e]||Zt.cloudy)(t)}Jt.styles=[nt,dt,pt,ht,r`
      :host { display: block; height: 100%; overflow: hidden; }

      .day-container {
        display: flex;
        flex-direction: column;
        height: 100%;
        overflow: hidden;
      }

      /* All-day section */
      .all-day-section {
        display: flex;
        border-bottom: 1px solid var(--pv-border);
        padding: 0.5rem 0;
        min-height: 40px;
        flex-shrink: 0;
      }

      .all-day-gutter {
        width: 60px;
        flex-shrink: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 0.6875rem;
        color: var(--pv-text-muted);
        text-transform: uppercase;
        font-weight: 500;
        letter-spacing: 0.04em;
      }

      .all-day-events {
        flex: 1;
        display: flex;
        gap: 0.375rem;
        flex-wrap: wrap;
        padding: 0 0.5rem;
      }

      .all-day-chip {
        display: inline-flex;
        align-items: center;
        padding: 6px 14px;
        border-radius: 9999px;
        font-size: 0.8125rem;
        font-weight: 600;
        color: white;
        cursor: pointer;
        transition: all 200ms ease;
        max-width: 200px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        box-shadow: 0 1px 4px rgba(0, 0, 0, 0.12);
      }

      .all-day-chip.past { opacity: 0.45; }

      .all-day-chip:hover {
        transform: scale(1.03);
        box-shadow: 0 3px 10px rgba(0, 0, 0, 0.2);
        filter: brightness(1.05);
      }

      /* Column headers */
      .column-headers {
        display: flex;
        border-bottom: 1px solid var(--pv-border);
        flex-shrink: 0;
      }

      .header-gutter {
        width: 60px;
        flex-shrink: 0;
      }

      .person-header {
        flex: 1;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 6px;
        padding: 0.75rem 0.5rem;
        min-width: 0;
      }

      .ring-wrap {
        position: relative;
        display: inline-flex;
        padding: 0;
        border: none;
        background: transparent;
        border-radius: 50%;
        cursor: pointer;
        -webkit-tap-highlight-color: transparent;
      }

      .ring-wrap:focus-visible {
        outline: 2px solid var(--pv-accent-ink, #5B5BD6);
        outline-offset: 8px;
      }

      .ring-wrap svg {
        position: absolute;
        inset: -7px;
        width: calc(100% + 14px);
        height: calc(100% + 14px);
        transform: rotate(-90deg);
        pointer-events: none;
        overflow: visible;
      }

      .ring-wrap .track {
        stroke: var(--pv-track, #ECECE8);
      }

      .ring-wrap .done {
        transition: stroke-dashoffset 600ms ease;
      }

      .person-avatar {
        width: 64px;
        height: 64px;
        border-radius: 50%;
        object-fit: cover;
        flex-shrink: 0;
        border: 3px solid var(--pv-avatar-border, var(--pv-border-subtle));
      }

      .person-initial {
        width: 64px;
        height: 64px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.375rem;
        font-weight: 700;
        color: white;
        flex-shrink: 0;
      }

      .person-name {
        font-size: 0.875rem;
        font-weight: 600;
        color: var(--pv-text);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        max-width: 100%;
        text-align: center;
      }

      /* Time grid */
      .time-grid-wrapper {
        flex: 1;
        overflow-y: auto;
        overflow-x: hidden;
        position: relative;
        /* Hide scrollbar but keep scroll functionality */
        scrollbar-width: none; /* Firefox */
        -ms-overflow-style: none; /* IE/Edge */
      }

      .time-grid-wrapper::-webkit-scrollbar {
        display: none; /* Chrome/Safari */
      }

      .time-grid {
        display: flex;
        position: relative;
        height: calc(${24} * var(--pv-hour-px, ${80}px));
        flex-shrink: 0;
      }

      .time-gutter {
        width: 60px;
        flex-shrink: 0;
        position: relative;
      }

      .time-label {
        position: absolute;
        right: 0.5rem;
        font-size: 0.6875rem;
        color: var(--pv-text-muted);
        transform: translateY(-50%);
        font-variant-numeric: tabular-nums;
      }

      .columns-area {
        flex: 1;
        display: flex;
        position: relative;
      }

      .person-column {
        flex: 1;
        position: relative;
        margin-left: 4px;
        min-width: 0;
        overflow: hidden;
      }

      .person-column:first-child {
        margin-left: 0;
      }

      /* Hour lines: transparent, replaced by alternating bands */
      .hour-line {
        position: absolute;
        left: 0;
        right: 0;
        height: 1px;
        background: transparent;
        pointer-events: none;
      }

      .hour-band-odd {
        position: absolute;
        left: 0;
        right: 0;
        background: rgba(0, 0, 0, 0.015);
        pointer-events: none;
      }

      /* Positioned events: light background, accent border */
      .positioned-event {
        position: absolute;
        left: 3px;
        right: 3px;
        padding: 6px 10px;
        border-radius: var(--pv-radius-sm, 4px);
        border-left: 3px solid var(--event-color);
        background: var(--event-color-light, color-mix(in srgb, var(--event-color) 12%, white));
        cursor: pointer;
        overflow: hidden;
        transition: all 200ms ease;
        z-index: 1;
        min-height: 26px;
      }

      .positioned-event.past { opacity: 0.45; }

      .positioned-event:hover {
        z-index: 5;
        background: color-mix(in srgb, var(--event-color) 16%, white);
        transform: translateY(-1px);
      }

      .positioned-event .event-title {
        font-size: 0.9375rem;
        font-weight: 600;
        line-height: 1.25;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        color: var(--event-text, var(--pv-text));
      }

      .positioned-event .event-time {
        font-size: 0.8125rem;
        color: var(--event-text, var(--pv-text-secondary));
        margin-top: 2px;
        font-weight: 500;
      }

      .event-participants {
        display: flex;
        margin-top: 2px;
      }

      .event-participant-avatar {
        width: 18px;
        height: 18px;
        border-radius: 50%;
        border: 1.5px solid var(--participant-color, var(--event-color));
        margin-left: -4px;
        object-fit: cover;
        flex-shrink: 0;
      }

      .event-participant-avatar:first-child {
        margin-left: 0;
      }

      .event-participant-initial {
        width: 18px;
        height: 18px;
        border-radius: 50%;
        border: 1.5px solid var(--participant-color, var(--event-color));
        margin-left: -4px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 0.5rem;
        font-weight: 700;
        color: white;
        flex-shrink: 0;
      }

      .event-participant-initial:first-child {
        margin-left: 0;
      }

      /* Click target for empty slots */
      .slot-click-area {
        position: absolute;
        left: 0;
        right: 0;
        cursor: pointer;
      }

      .slot-click-area:hover {
        background: var(--pv-today-bg);
      }

      /* Date banner (shown when viewing a day other than today) */
      .date-banner {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        padding: 12px 16px;
        color: var(--pv-accent-ink, var(--pv-accent, #6366F1));
        font-size: 0.9375rem;
        font-weight: 600;
        background: var(--pv-border-subtle, rgba(0, 0, 0, 0.03));
        border-bottom: 1px solid var(--pv-border);
        flex-shrink: 0;
        animation: pv-banner-slide-in 350ms cubic-bezier(0.4, 0, 0.2, 1);
        overflow: hidden;
      }

      .date-banner ha-icon {
        --mdc-icon-size: 18px;
      }

      @keyframes pv-banner-slide-in {
        from {
          max-height: 0;
          padding-top: 0;
          padding-bottom: 0;
          opacity: 0;
        }
        to {
          max-height: 60px;
          padding-top: 12px;
          padding-bottom: 12px;
          opacity: 1;
        }
      }

      /* Next day footer */
      .next-day-footer {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        padding: 16px;
        cursor: pointer;
        color: var(--pv-accent-ink, var(--pv-accent, #6366F1));
        font-size: 0.9375rem;
        font-weight: 600;
        background: var(--pv-border-subtle, rgba(0, 0, 0, 0.03));
        border-top: 1px solid var(--pv-border);
        transition: background 200ms ease;
        flex-shrink: 0;
        -webkit-tap-highlight-color: transparent;
      }

      .next-day-footer:hover {
        background: color-mix(in srgb, var(--pv-accent, #6366F1) 8%, transparent);
      }

      .next-day-footer ha-icon {
        --mdc-icon-size: 20px;
      }

      /* Empty state */
      .empty-state {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 3rem;
        color: var(--pv-text-muted);
        text-align: center;
      }

      .empty-state ha-icon {
        --mdc-icon-size: 48px;
        opacity: 0.3;
        margin-bottom: 1rem;
      }

      /* ═══════════ RESPONSIVE BREAKPOINTS ═══════════ */

      /* xs: phones, hide column headers, compact events */
      @media (max-width: 479px) {
        .column-headers { display: none; }
        .time-gutter { width: 40px; }
        .all-day-gutter { width: 40px; font-size: 0.5625rem; }
        .time-label { font-size: 0.5625rem; }
        .positioned-event { padding: 3px 6px; }
        .event-title { font-size: 0.75rem; }
        .event-time { display: none; }
        .next-day-footer { padding: 10px; font-size: 0.8125rem; }
      }

      /* sm: large phones, hide column headers, narrower gutter */
      @media (min-width: 480px) and (max-width: 767px) {
        .column-headers { display: none; }
        .time-gutter { width: 48px; }
        .all-day-gutter { width: 48px; }
        .positioned-event { padding: 4px 8px; }
        .event-title { font-size: 0.875rem; }
      }

      /* md: tablets, smaller avatars */
      @media (min-width: 768px) and (max-width: 1023px) {
        .person-avatar, .person-initial { width: 48px; height: 48px; font-size: 1.125rem; }
        .person-name { font-size: 0.8125rem; }
      }

      /* short height: compact avatars */
      @media (max-height: 500px) {
        .person-avatar, .person-initial { width: 32px; height: 32px; font-size: 0.875rem; }
        .person-header { padding: 0.375rem 0.25rem; gap: 3px; }
        .person-name { font-size: 0.75rem; }
      }

      /* tall height: larger avatars */
      @media (min-height: 901px) {
        .person-avatar, .person-initial { width: 64px; height: 64px; }
      }

      /* lg: large screens (1024–1439px), scale up ~20% */
      @media (min-width: 1024px) {
        .time-gutter { width: 72px; }
        .time-label { font-size: 0.8125rem; }
        .all-day-gutter { width: 72px; font-size: 0.8125rem; }
        .header-gutter { width: 72px; }
        .all-day-chip { font-size: 0.9375rem; min-height: 30px; }
        .positioned-event { min-height: 30px; }
        .event-title { font-size: 1.0625rem; }
        .event-time { font-size: 0.9375rem; }
        .person-name { font-size: 1rem; }
        .next-day-footer { font-size: 1.0625rem; }
      }

      /* xl: wall displays (1440px+), scale up ~40% */
      @media (min-width: 1440px) {
        .time-gutter { width: 84px; }
        .time-label { font-size: 0.9375rem; }
        .all-day-gutter { width: 84px; font-size: 0.9375rem; }
        .header-gutter { width: 84px; }
        .all-day-chip { font-size: 1.0625rem; min-height: 34px; padding: 6px 14px; }
        .positioned-event { min-height: 34px; padding: 8px 12px; }
        .event-title { font-size: 1.1875rem; }
        .event-time { font-size: 1.0625rem; }
        .person-avatar, .person-initial { width: 72px; height: 72px; font-size: 1.5rem; }
        .person-name { font-size: 1.125rem; }
        .next-day-footer { font-size: 1.1875rem; padding: 18px; }
      }
    `],e([ue({attribute:!1})],Jt.prototype,"hass",void 0),e([ue({type:Array})],Jt.prototype,"events",void 0),e([ue({type:Array})],Jt.prototype,"calendars",void 0),e([ue({type:Object})],Jt.prototype,"currentDate",void 0),e([ue({type:Object})],Jt.prototype,"hiddenCalendars",void 0),e([ue({attribute:!1})],Jt.prototype,"timeFormat",void 0),e([ue({type:Boolean})],Jt.prototype,"hideColumnHeaders",void 0),e([ue({attribute:!1})],Jt.prototype,"avatarBorderMode",void 0),e([ue({attribute:!1})],Jt.prototype,"sharedEventMap",void 0),e([ue({type:Number})],Jt.prototype,"tick",void 0),e([ue({type:String,reflect:!0})],Jt.prototype,"layout",void 0),e([ue({attribute:!1})],Jt.prototype,"progress",void 0),e([ue({attribute:!1})],Jt.prototype,"revision",void 0),e([me()],Jt.prototype,"_hourPx",void 0),ge("pv-view-day",Jt);const Zt={sunny:e=>U`
    <svg width="${e}" height="${e}" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="32" cy="32" r="12" fill="#FBBF24" />
      <g stroke="#FBBF24" stroke-width="3" stroke-linecap="round">
        <line x1="32" y1="6" x2="32" y2="14" class="pv-sun-ray" />
        <line x1="32" y1="50" x2="32" y2="58" class="pv-sun-ray" />
        <line x1="6" y1="32" x2="14" y2="32" class="pv-sun-ray" />
        <line x1="50" y1="32" x2="58" y2="32" class="pv-sun-ray" />
        <line x1="13.6" y1="13.6" x2="19.3" y2="19.3" class="pv-sun-ray" />
        <line x1="44.7" y1="44.7" x2="50.4" y2="50.4" class="pv-sun-ray" />
        <line x1="13.6" y1="50.4" x2="19.3" y2="44.7" class="pv-sun-ray" />
        <line x1="44.7" y1="19.3" x2="50.4" y2="13.6" class="pv-sun-ray" />
      </g>
    </svg>`,"clear-night":e=>U`
    <svg width="${e}" height="${e}" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M38 14C30 14 23 20 21 28C20 31 20 35 21 38C23 44 28 49 35 50C38 51 41 51 44 50C36 52 27 48 23 40C19 32 21 22 28 16C31 14 34 13 38 14Z" fill="#94A3B8" />
      <circle cx="44" cy="16" r="1.5" fill="#94A3B8" opacity="0.6" />
      <circle cx="50" cy="24" r="1" fill="#94A3B8" opacity="0.4" />
      <circle cx="46" cy="32" r="1.2" fill="#94A3B8" opacity="0.5" />
    </svg>`,cloudy:e=>U`
    <svg width="${e}" height="${e}" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M48 40H18C13.6 40 10 36.4 10 32C10 27.6 13.6 24 18 24C18.2 24 18.5 24 18.7 24C20.2 18.6 25.2 15 31 15C37.9 15 43.5 19.9 44.2 26.5C44.8 26.3 45.4 26.2 46 26.2C49.3 26.2 52 28.9 52 32.2C52 32.2 52 32.2 52 32.3" fill="#CBD5E1" />
      <path d="M48 40H18C13.6 40 10 36.4 10 32C10 27.6 13.6 24 18 24C18.2 24 18.5 24 18.7 24C20.2 18.6 25.2 15 31 15C37.9 15 43.5 19.9 44.2 26.5C44.8 26.3 45.4 26.2 46 26.2C49.3 26.2 52 28.9 52 32.2V40C52 40 50 40 48 40Z" fill="#94A3B8" />
    </svg>`,partlycloudy:e=>U`
    <svg width="${e}" height="${e}" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="26" cy="22" r="10" fill="#FBBF24" />
      <g stroke="#FBBF24" stroke-width="2.5" stroke-linecap="round">
        <line x1="26" y1="6" x2="26" y2="10" />
        <line x1="26" y1="34" x2="26" y2="38" />
        <line x1="10" y1="22" x2="14" y2="22" />
        <line x1="38" y1="22" x2="42" y2="22" />
        <line x1="14.7" y1="10.7" x2="17.5" y2="13.5" />
        <line x1="34.5" y1="30.5" x2="37.3" y2="33.3" />
        <line x1="14.7" y1="33.3" x2="17.5" y2="30.5" />
        <line x1="34.5" y1="13.5" x2="37.3" y2="10.7" />
      </g>
      <path d="M50 46H22C17.6 46 14 42.4 14 38C14 33.6 17.6 30 22 30C22.3 30 22.5 30 22.8 30C24.3 25.4 28.8 22 34 22C40.3 22 45.5 26.5 46.2 32.5C46.8 32.3 47.4 32.2 48 32.2C51 32.2 53.5 34.7 53.5 37.7V46H50Z" fill="#CBD5E1" />
    </svg>`,rainy:e=>U`
    <svg width="${e}" height="${e}" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M48 34H18C13.6 34 10 30.4 10 26C10 21.6 13.6 18 18 18C18.2 18 18.5 18 18.7 18C20.2 12.6 25.2 9 31 9C37.9 9 43.5 13.9 44.2 20.5C44.8 20.3 45.4 20.2 46 20.2C49.3 20.2 52 22.9 52 26.2V34H48Z" fill="#94A3B8" />
      <g stroke="#60A5FA" stroke-width="2.5" stroke-linecap="round">
        <line x1="22" y1="40" x2="20" y2="48" class="pv-rain-drop" />
        <line x1="32" y1="40" x2="30" y2="48" class="pv-rain-drop" style="animation-delay: 0.3s" />
        <line x1="42" y1="40" x2="40" y2="48" class="pv-rain-drop" style="animation-delay: 0.6s" />
        <line x1="27" y1="48" x2="25" y2="56" class="pv-rain-drop" style="animation-delay: 0.15s" />
        <line x1="37" y1="48" x2="35" y2="56" class="pv-rain-drop" style="animation-delay: 0.45s" />
      </g>
    </svg>`,pouring:e=>U`
    <svg width="${e}" height="${e}" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M48 30H18C13.6 30 10 26.4 10 22C10 17.6 13.6 14 18 14C18.2 14 18.5 14 18.7 14C20.2 8.6 25.2 5 31 5C37.9 5 43.5 9.9 44.2 16.5C44.8 16.3 45.4 16.2 46 16.2C49.3 16.2 52 18.9 52 22.2V30H48Z" fill="#64748B" />
      <g stroke="#3B82F6" stroke-width="3" stroke-linecap="round">
        <line x1="18" y1="36" x2="15" y2="48" class="pv-rain-drop" />
        <line x1="26" y1="36" x2="23" y2="48" class="pv-rain-drop" style="animation-delay: 0.2s" />
        <line x1="34" y1="36" x2="31" y2="48" class="pv-rain-drop" style="animation-delay: 0.4s" />
        <line x1="42" y1="36" x2="39" y2="48" class="pv-rain-drop" style="animation-delay: 0.1s" />
        <line x1="50" y1="36" x2="47" y2="48" class="pv-rain-drop" style="animation-delay: 0.5s" />
        <line x1="22" y1="48" x2="19" y2="58" class="pv-rain-drop" style="animation-delay: 0.3s" />
        <line x1="30" y1="48" x2="27" y2="58" class="pv-rain-drop" style="animation-delay: 0.15s" />
        <line x1="38" y1="48" x2="35" y2="58" class="pv-rain-drop" style="animation-delay: 0.45s" />
        <line x1="46" y1="48" x2="43" y2="58" class="pv-rain-drop" style="animation-delay: 0.6s" />
      </g>
    </svg>`,snowy:e=>U`
    <svg width="${e}" height="${e}" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M48 32H18C13.6 32 10 28.4 10 24C10 19.6 13.6 16 18 16C18.2 16 18.5 16 18.7 16C20.2 10.6 25.2 7 31 7C37.9 7 43.5 11.9 44.2 18.5C44.8 18.3 45.4 18.2 46 18.2C49.3 18.2 52 20.9 52 24.2V32H48Z" fill="#94A3B8" />
      <circle cx="20" cy="42" r="2.5" fill="#BFDBFE" class="pv-snow-flake" />
      <circle cx="32" cy="40" r="2.5" fill="#BFDBFE" class="pv-snow-flake" style="animation-delay: 0.3s" />
      <circle cx="44" cy="43" r="2.5" fill="#BFDBFE" class="pv-snow-flake" style="animation-delay: 0.6s" />
      <circle cx="25" cy="52" r="2" fill="#BFDBFE" class="pv-snow-flake" style="animation-delay: 0.15s" />
      <circle cx="38" cy="51" r="2" fill="#BFDBFE" class="pv-snow-flake" style="animation-delay: 0.45s" />
    </svg>`,"snowy-rainy":e=>U`
    <svg width="${e}" height="${e}" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M48 32H18C13.6 32 10 28.4 10 24C10 19.6 13.6 16 18 16C18.2 16 18.5 16 18.7 16C20.2 10.6 25.2 7 31 7C37.9 7 43.5 11.9 44.2 18.5C44.8 18.3 45.4 18.2 46 18.2C49.3 18.2 52 20.9 52 24.2V32H48Z" fill="#94A3B8" />
      <g stroke="#60A5FA" stroke-width="2" stroke-linecap="round">
        <line x1="22" y1="38" x2="20" y2="46" class="pv-rain-drop" />
        <line x1="42" y1="38" x2="40" y2="46" class="pv-rain-drop" style="animation-delay: 0.3s" />
      </g>
      <circle cx="32" cy="42" r="2.5" fill="#BFDBFE" class="pv-snow-flake" style="animation-delay: 0.15s" />
      <circle cx="27" cy="52" r="2" fill="#BFDBFE" class="pv-snow-flake" style="animation-delay: 0.45s" />
      <circle cx="37" cy="50" r="2" fill="#BFDBFE" class="pv-snow-flake" style="animation-delay: 0.6s" />
    </svg>`,fog:e=>U`
    <svg width="${e}" height="${e}" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <g stroke="#94A3B8" stroke-width="3" stroke-linecap="round">
        <line x1="12" y1="24" x2="52" y2="24" opacity="0.4" />
        <line x1="16" y1="32" x2="48" y2="32" opacity="0.6" />
        <line x1="12" y1="40" x2="52" y2="40" opacity="0.8" />
        <line x1="18" y1="48" x2="46" y2="48" opacity="0.5" />
      </g>
    </svg>`,hail:e=>U`
    <svg width="${e}" height="${e}" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M48 30H18C13.6 30 10 26.4 10 22C10 17.6 13.6 14 18 14C18.2 14 18.5 14 18.7 14C20.2 8.6 25.2 5 31 5C37.9 5 43.5 9.9 44.2 16.5C44.8 16.3 45.4 16.2 46 16.2C49.3 16.2 52 18.9 52 22.2V30H48Z" fill="#94A3B8" />
      <circle cx="20" cy="40" r="3" fill="#93C5FD" stroke="#60A5FA" stroke-width="1" />
      <circle cx="32" cy="44" r="3" fill="#93C5FD" stroke="#60A5FA" stroke-width="1" />
      <circle cx="44" cy="38" r="3" fill="#93C5FD" stroke="#60A5FA" stroke-width="1" />
      <circle cx="26" cy="52" r="2.5" fill="#93C5FD" stroke="#60A5FA" stroke-width="1" />
      <circle cx="38" cy="54" r="2.5" fill="#93C5FD" stroke="#60A5FA" stroke-width="1" />
    </svg>`,lightning:e=>U`
    <svg width="${e}" height="${e}" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M48 30H18C13.6 30 10 26.4 10 22C10 17.6 13.6 14 18 14C18.2 14 18.5 14 18.7 14C20.2 8.6 25.2 5 31 5C37.9 5 43.5 9.9 44.2 16.5C44.8 16.3 45.4 16.2 46 16.2C49.3 16.2 52 18.9 52 22.2V30H48Z" fill="#64748B" />
      <path d="M34 30L28 42H34L30 56L42 40H36L40 30H34Z" fill="#FBBF24" stroke="#F59E0B" stroke-width="0.5" />
    </svg>`,"lightning-rainy":e=>U`
    <svg width="${e}" height="${e}" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M48 28H18C13.6 28 10 24.4 10 20C10 15.6 13.6 12 18 12C18.2 12 18.5 12 18.7 12C20.2 6.6 25.2 3 31 3C37.9 3 43.5 7.9 44.2 14.5C44.8 14.3 45.4 14.2 46 14.2C49.3 14.2 52 16.9 52 20.2V28H48Z" fill="#64748B" />
      <path d="M34 28L28 40H34L30 52L42 38H36L40 28H34Z" fill="#FBBF24" />
      <g stroke="#60A5FA" stroke-width="2" stroke-linecap="round">
        <line x1="18" y1="36" x2="16" y2="44" class="pv-rain-drop" style="animation-delay: 0.2s" />
        <line x1="48" y1="34" x2="46" y2="42" class="pv-rain-drop" style="animation-delay: 0.5s" />
        <line x1="22" y1="48" x2="20" y2="56" class="pv-rain-drop" style="animation-delay: 0.1s" />
        <line x1="44" y1="46" x2="42" y2="54" class="pv-rain-drop" style="animation-delay: 0.4s" />
      </g>
    </svg>`,windy:e=>U`
    <svg width="${e}" height="${e}" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <g stroke="#94A3B8" stroke-width="3" stroke-linecap="round">
        <path d="M10 24 Q30 24 38 20 Q46 16 48 20 Q50 24 46 24" fill="none" />
        <path d="M8 34 Q28 34 40 30 Q48 28 50 32 Q52 36 48 36" fill="none" />
        <path d="M14 44 Q30 44 36 40 Q42 36 44 40 Q46 44 42 44" fill="none" />
      </g>
    </svg>`,"windy-variant":e=>U`
    <svg width="${e}" height="${e}" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M48 28H22C17.6 28 14 24.4 14 20C14 15.6 17.6 12 22 12C22.2 12 22.5 12 22.7 12C24.2 7 28.8 4 34 4C40.3 4 45.5 8.5 46.2 14.5C46.8 14.3 47.4 14.2 48 14.2C51 14.2 53.5 16.7 53.5 19.7V28H48Z" fill="#CBD5E1" />
      <g stroke="#94A3B8" stroke-width="2.5" stroke-linecap="round">
        <path d="M8 36 Q28 36 36 33 Q44 30 46 34 Q48 38 44 38" fill="none" />
        <path d="M12 46 Q28 46 34 43 Q40 40 42 44 Q44 48 40 48" fill="none" />
      </g>
    </svg>`,exceptional:e=>U`
    <svg width="${e}" height="${e}" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="32" cy="32" r="20" stroke="#F59E0B" stroke-width="3" fill="none" />
      <line x1="32" y1="18" x2="32" y2="34" stroke="#F59E0B" stroke-width="3" stroke-linecap="round" />
      <circle cx="32" cy="42" r="2" fill="#F59E0B" />
    </svg>`};function ei(e){try{const t=e();t&&"function"==typeof t.catch&&t.catch(()=>{})}catch{}}function ti(e){return Math.min(3e4,1e3*2**e)}class ii{constructor(e){this._onForecast=e,this._entityId="",this._unsub=null,this._generation=0,this._attempt=0,this._hadForecast=!1,this._onReady=()=>{this._connection&&this._entityId&&(this._generation++,this._unsub=null,this._cancelRetry(),this._subscribe())}}update(e,t,i){if(this._legacy=i,!t||!e){const e=""!==this._entityId;return this.stop(),void(e&&this._onForecast([]))}t===this._entityId&&e===this._connection||(this.stop(),this._entityId=t,this._connection=e,e.addEventListener?.("ready",this._onReady),this._subscribe())}stop(){if(this._generation++,this._cancelRetry(),this._connection?.removeEventListener?.("ready",this._onReady),this._connection=void 0,this._entityId="",this._hadForecast=!1,this._unsub){const e=this._unsub;this._unsub=null,ei(e)}}_subscribe(){const e=this._connection;if(!e)return;const t=this._generation;e.subscribeMessage(e=>{t===this._generation&&(this._hadForecast=!0,this._onForecast(e?.forecast||[]))},{type:"weather/subscribe_forecast",forecast_type:"daily",entity_id:this._entityId},{resubscribe:!1}).then(e=>{t===this._generation?(this._unsub=e,this._attempt=0):ei(e)}).catch(()=>{if(t!==this._generation)return;const e=this._attempt>=6;!e&&this._hadForecast||this._onForecast(this._legacy||[]),e||(this._retry=setTimeout(()=>{this._retry=void 0,t===this._generation&&this._subscribe()},ti(this._attempt++)))})}_cancelRetry(){void 0!==this._retry&&clearTimeout(this._retry),this._retry=void 0,this._attempt=0}}function si(e){const t=new Map;for(const i of e)i.datetime&&t.set(Ee(xe(i.datetime)),{condition:i.condition||"",tempHigh:i.temperature??0,tempLow:i.templow??i.temperature??0});return t}const ai=["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];class ni extends le{constructor(){super(...arguments),this.events=[],this.calendars=[],this.currentDate=new Date,this.hiddenCalendars=new Set,this.timeFormat="12h",this.firstDay="sunday",this.forecast=[],this.showStripes=!0,this.tick=0,this.layout="landscape"}_getWeekDays(){const e=Fe(this.currentDate,this.firstDay);return Array.from({length:7},(t,i)=>{const s=new Date(e);return s.setDate(s.getDate()+i),s})}_getWeekLabel(e){const t=e[0],i=e[6],s={month:"long",day:"numeric"};return t.getMonth()===i.getMonth()?`${t.toLocaleDateString("en-US",{month:"long"})} ${t.getDate()} – ${i.getDate()}`:`${t.toLocaleDateString("en-US",s)} – ${i.toLocaleDateString("en-US",s)}`}render(){const e=Pe(this.events,this.hiddenCalendars),t=this._getWeekDays(),i=new Date(t[0]);i.setHours(0,0,0,0);const s=new Date(t[6]);s.setHours(23,59,59,999);const a=Se(Be(e,i,s),this.calendars),n=si(this.forecast);return U`
      <div class="week-container">
        <div class="week-label">${this._getWeekLabel(t)}</div>
        <div class="day-grid">
          ${t.map(e=>this._renderDayCard(e,a,n))}
        </div>
      </div>
    `}_renderDayCard(e,t,i){const s=ke(e),a=Ee(e),n=new Date(e);n.setHours(0,0,0,0);const r=new Date(e);r.setHours(23,59,59,999);const o=Be(t,n,r).sort(Me),d=i.get(a),l=`${ai[e.getDay()]} ${e.getDate()}`,c=o.length;return U`
      <div class="day-card ${s?"day-card--today":""}">
        <div class="day-card-header">
          <div class="day-card-header-left">
            <div class="day-name">${l}</div>
            <div class="day-meta">
              <span>${c} event${1!==c?"s":""}</span>
              <button class="add-event-link" @click=${()=>this._addEvent(e)}>+ Add</button>
            </div>
          </div>
          ${d?U`
            <div class="day-weather">
              ${Qt(d.condition)}
              <span class="day-weather-temp">${Math.round(d.tempHigh)}°/${Math.round(d.tempLow)}°</span>
            </div>
          `:Y}
        </div>
        ${o.length>0?U`
          <div class="day-card-events">
            ${o.map(e=>U`
              <pv-event-chip
                .hass=${this.hass}
                .event=${e}
                .calendars=${this.calendars}
                .timeFormat=${this.timeFormat}
                .showStripes=${this.showStripes}
                .tick=${this.tick}
                @event-click=${e=>this._onEventClick(e.detail.event)}
              ></pv-event-chip>
            `)}
          </div>
        `:U`
          <div class="day-card-empty">No events</div>
        `}
      </div>
    `}_addEvent(e){this.dispatchEvent(new CustomEvent("create-event",{detail:{date:e},bubbles:!0,composed:!0}))}_onEventClick(e){this.dispatchEvent(new CustomEvent("event-click",{detail:{event:e},bubbles:!0,composed:!0}))}}ni.styles=[nt,ht,r`
      :host { display: block; height: 100%; overflow: hidden; }

      .week-container {
        display: flex;
        flex-direction: column;
        height: 100%;
        overflow: auto;
      }

      .week-label {
        font-size: 1rem;
        font-weight: 600;
        color: var(--pv-text);
        padding: 0.75rem 1rem 0.5rem;
        flex-shrink: 0;
      }

      /* Days across follow the card's own shape, not the window's (spec 12.1). */
      :host([layout='landscape']) .day-grid { grid-template-columns: repeat(4, 1fr); }
      :host([layout='portrait']) .day-grid { grid-template-columns: repeat(2, 1fr); }
      :host([layout='phone']) .day-grid { grid-template-columns: 1fr; }

      .day-grid {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 0.5rem;
        padding: 0 0.75rem 0.75rem;
        flex: 1;
      }

      /* ── Day Card ── */
      .day-card {
        background: var(--pv-card-bg, #fff);
        border: 1px solid var(--pv-border-subtle);
        border-radius: var(--pv-radius, 12px);
        overflow: hidden;
        display: flex;
        flex-direction: column;
        min-height: 120px;
      }

      .day-card--today {
        border-color: var(--pv-accent);
        box-shadow: 0 0 0 1px var(--pv-accent);
      }

      .day-card-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0.625rem 0.75rem 0.375rem;
        border-bottom: 1px solid var(--pv-border-subtle);
      }

      .day-card-header-left {
        display: flex;
        flex-direction: column;
        gap: 2px;
      }

      .day-name {
        font-size: 0.9375rem;
        font-weight: 600;
        color: var(--pv-text);
      }

      .day-card--today .day-name {
        color: var(--pv-accent-ink, var(--pv-accent));
      }

      .day-meta {
        font-size: 0.6875rem;
        color: var(--pv-text-muted);
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }

      .add-event-link {
        font-size: 0.6875rem;
        color: var(--pv-accent-ink, var(--pv-accent));
        cursor: pointer;
        font-weight: 500;
        background: none;
        border: none;
        padding: 0;
        font-family: inherit;
      }

      .add-event-link:hover {
        text-decoration: underline;
      }

      .day-weather {
        display: flex;
        align-items: center;
        gap: 0.25rem;
        flex-shrink: 0;
      }

      .day-weather svg {
        width: 22px;
        height: 22px;
      }

      .day-weather-temp {
        font-size: 0.6875rem;
        font-weight: 500;
        color: var(--pv-text-secondary);
        white-space: nowrap;
      }

      .day-card-events {
        flex: 1;
        padding: 0.375rem;
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
        overflow: hidden;
      }

      .day-card-empty {
        flex: 1;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 0.75rem;
        color: var(--pv-text-muted);
        font-size: 0.75rem;
        font-style: italic;
      }

      /* ═══════════ RESPONSIVE ═══════════ */

      /* SM/XS: small screens, tighter cards */
      @media (max-width: 767px) {
        .day-grid {
          gap: 0.375rem;
          padding: 0 0.5rem 0.5rem;
        }
        .week-label { font-size: 0.875rem; padding: 0.5rem 0.75rem 0.375rem; }
        .day-card { min-height: 80px; }
        .day-card-header { padding: 0.5rem 0.625rem 0.25rem; }
        .day-name { font-size: 0.8125rem; }
      }

      /* LG: large screens */
      @media (min-width: 1024px) {
        .week-label { font-size: 1.0625rem; }
        .day-name { font-size: 1rem; }
        .day-card { min-height: 140px; }
      }

      /* XL: wall displays, ~50% larger */
      @media (min-width: 1440px) {
        .week-label { font-size: 1.5rem; }
        .day-name { font-size: 1.375rem; }
        .day-meta { font-size: 0.9375rem; }
        .add-event-link { font-size: 0.9375rem; }
        .day-weather svg { width: 36px; height: 36px; }
        .day-weather-temp { font-size: 0.9375rem; }
        .day-card { min-height: 180px; }
        .day-card-header { padding: 1rem 1.25rem 0.625rem; }
        .day-card-events { padding: 0.75rem; gap: 0.5rem; }
      }
    `],e([ue({attribute:!1})],ni.prototype,"hass",void 0),e([ue({type:Array})],ni.prototype,"events",void 0),e([ue({type:Array})],ni.prototype,"calendars",void 0),e([ue({type:Object})],ni.prototype,"currentDate",void 0),e([ue({type:Object})],ni.prototype,"hiddenCalendars",void 0),e([ue({attribute:!1})],ni.prototype,"timeFormat",void 0),e([ue({attribute:!1})],ni.prototype,"firstDay",void 0),e([ue({attribute:!1})],ni.prototype,"forecast",void 0),e([ue({type:Boolean})],ni.prototype,"showStripes",void 0),e([ue({type:Number})],ni.prototype,"tick",void 0),e([ue({type:String,reflect:!0})],ni.prototype,"layout",void 0),ge("pv-view-week",ni);const ri=["Sun","Mon","Tue","Wed","Thu","Fri","Sat"],oi=["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];class di extends le{constructor(){super(...arguments),this.events=[],this.calendars=[],this.currentDate=new Date,this.hiddenCalendars=new Set,this.firstDay="sunday",this.timeFormat="12h",this.showStripes=!0,this.tick=0,this.layout="landscape",this._fit={cell:0,normal:Gt,today:Gt}}connectedCallback(){super.connectedCallback(),this.hasUpdated&&this._observeGrid()}disconnectedCallback(){super.disconnectedCallback(),this._gridObserver?.disconnect()}firstUpdated(){this._observeGrid()}updated(){this._measure()}_observeGrid(){const e=this.shadowRoot?.querySelector(".month-grid");e&&"undefined"!=typeof ResizeObserver&&(this._gridObserver??=new ResizeObserver(()=>this._measure()),this._gridObserver.disconnect(),this._gridObserver.observe(e))}_measure(){const e=this.shadowRoot?.querySelector(".month-grid");if(!e||0===e.clientHeight)return;const t=e.querySelector(".day-events"),i=t&&parseFloat(getComputedStyle(t).rowGap)||0,s=e.querySelector("pv-event-chip"),a=e.querySelector(".more-events"),n=s?Math.ceil(s.getBoundingClientRect().height+i):Gt.row,r=a?Math.ceil(a.getBoundingClientRect().height+i):Gt.more,o=e=>{const t=e?.querySelector(".day-events");if(!e||!t)return Gt.number;const i=parseFloat(getComputedStyle(e).borderBottomWidth)||0;return Math.ceil(t.getBoundingClientRect().top-e.getBoundingClientRect().top+i)},d={number:o(e.querySelector(".day-cell:not(.today)")),row:n,more:r},l=e.querySelector(".day-cell.today"),c={cell:Math.floor(e.clientHeight/6),normal:d,today:l?{...d,number:o(l)}:d};JSON.stringify(c)!==JSON.stringify(this._fit)&&(this._fit=c)}render(){const e=Se(Pe(this.events,this.hiddenCalendars),this.calendars),t=function(e,t="sunday"){const i=Fe(new Date(e.getFullYear(),e.getMonth(),1),t),s=[];for(let e=0;e<42;e++){const t=new Date(i);t.setDate(i.getDate()+e),s.push(t)}return s}(this.currentDate,this.firstDay),i=Te(e),s=this.currentDate.getMonth(),a="monday"===this.firstDay?oi:ri,n=this.currentDate.toLocaleDateString("en-US",{month:"long",year:"numeric"});return U`
      <div class="month-container">
        <div class="month-name">${n}</div>
        <div class="weekday-header">
          ${a.map(e=>U`<div class="weekday-name">${e}</div>`)}
        </div>
        <div class="month-grid">
          ${t.map(e=>this._renderDayCell(e,s,i))}
        </div>
      </div>
    `}_renderDayCell(e,t,i){const s=Ee(e),a=i.get(s)||[],n=e.getMonth()!==t,r=ke(e),{shown:o,more:d}=function(e,t,i=Gt){if(!(t>0)){const t=Math.min(e,3);return{shown:t,more:e-t}}const s=t-i.number;if(e<=Math.floor(s/i.row))return{shown:e,more:0};const a=Math.min(e,Math.max(1,Math.floor((s-i.more)/i.row)));return{shown:a,more:e-a}}(a.length,this._fit.cell,r?this._fit.today:this._fit.normal),l=a.slice(0,o);return U`
      <div
        class="day-cell ${n?"other-month":""} ${r?"today":""}"
        @click=${()=>this._onDayClick(e)}
      >
        <div class="day-number">${e.getDate()}</div>
        <div class="day-events">
          ${l.map(e=>U`
            <pv-event-chip
              .hass=${this.hass}
              .event=${e}
              .calendars=${this.calendars}
              .timeFormat=${this.timeFormat}
              .compact=${!0}
              .showStripes=${this.showStripes}
              .tick=${this.tick}
              @event-click=${e=>{e.stopPropagation(),this._onEventClick(e.detail.event)}}
              @click=${e=>e.stopPropagation()}
            ></pv-event-chip>
          `)}
          ${d>0?U`
            <div class="more-events" @click=${t=>{t.stopPropagation(),this._onDayClick(e)}}>
              +${d} more
            </div>
          `:Y}
        </div>
      </div>
    `}_onDayClick(e){this.dispatchEvent(new CustomEvent("day-click",{detail:{date:e},bubbles:!0,composed:!0}))}_onEventClick(e){this.dispatchEvent(new CustomEvent("event-click",{detail:{event:e},bubbles:!0,composed:!0}))}}di.styles=[nt,r`
      :host { display: block; height: 100%; overflow: hidden; }

      .month-container {
        display: flex;
        flex-direction: column;
        height: 100%;
      }

      .month-name {
        font-size: 1.125rem;
        font-weight: 700;
        color: var(--pv-text);
        padding: 0.5rem 0.75rem;
        text-align: center;
        flex-shrink: 0;
      }

      .weekday-header {
        display: grid;
        grid-template-columns: repeat(7, 1fr);
        border-bottom: 1px solid var(--pv-border);
        flex-shrink: 0;
      }

      .weekday-name {
        text-align: center;
        padding: 0.5rem 0;
        font-size: 0.6875rem;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.04em;
        color: var(--pv-text-muted);
      }

      .month-grid {
        display: grid;
        grid-template-columns: repeat(7, 1fr);
        grid-template-rows: repeat(6, 1fr);
        flex: 1;
        min-height: 0;
      }

      .day-cell {
        border-right: 1px solid var(--pv-border-subtle);
        border-bottom: 1px solid var(--pv-border-subtle);
        padding: 0.25rem;
        min-height: 0;
        overflow: hidden;
        cursor: pointer;
        transition: background 150ms ease;
      }

      .day-cell:hover {
        background: var(--pv-event-hover);
      }

      .day-cell:nth-child(7n) {
        border-right: none;
      }

      .day-cell.other-month {
        opacity: 0.35;
      }

      .day-cell.today {
        background: var(--pv-today-bg);
      }

      .day-number {
        font-size: 0.8125rem;
        font-weight: 400;
        color: var(--pv-text);
        margin-bottom: 0.125rem;
        padding: 0.125rem 0.25rem;
        /* Its own row: today's circle no longer sits on a text line that adds space below it. */
        display: flex;
        align-items: center;
        width: fit-content;
      }

      .day-cell.today .day-number {
        background: var(--pv-accent);
        color: var(--pv-accent-text);
        border-radius: var(--pv-radius-sm, 50%);
        width: 24px;
        height: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 600;
      }

      .day-events {
        display: flex;
        flex-direction: column;
        gap: 1px;
      }

      .more-events {
        line-height: 1.2;
        font-size: 0.625rem;
        color: var(--pv-text-secondary);
        padding: 0 0.375rem;
        cursor: pointer;
        font-weight: 500;
      }

      .more-events:hover {
        color: var(--pv-accent-ink, var(--pv-accent));
      }

      /* ═══════════ RESPONSIVE BREAKPOINTS ═══════════ */

      /* xs: phones, compact day cells */
      @media (max-width: 479px) {
        .month-name { font-size: 0.9375rem; padding: 0.375rem 0.5rem; }
        .weekday-name { font-size: 0.5625rem; padding: 0.25rem 0; letter-spacing: 0.02em; }
        .day-number { font-size: 0.6875rem; padding: 0.0625rem 0.125rem; }
        .day-cell { padding: 0.125rem; }
        .day-cell.today .day-number { width: 20px; height: 20px; font-size: 0.625rem; }
        .more-events { font-size: 0.5rem; }
      }

      /* sm: large phones */
      @media (min-width: 480px) and (max-width: 767px) {
        .weekday-name { font-size: 0.625rem; }
        .day-number { font-size: 0.75rem; }
      }

      /* short height: tighter cells */
      @media (max-height: 500px) {
        .day-cell { padding: 0.125rem; }
        .day-number { font-size: 0.6875rem; }
      }

      /* lg: large screens (1024–1439px) */
      @media (min-width: 1024px) {
        .month-name { font-size: 1.25rem; }
        .weekday-name { font-size: 0.8125rem; padding: 0.625rem 0; }
        .day-number { font-size: 0.9375rem; padding: 0.25rem 0.375rem; }
        .day-cell.today .day-number { width: 30px; height: 30px; font-size: 0.875rem; }
        .more-events { font-size: 0.75rem; }
      }

      /* xl: wall displays (1440px+) */
      @media (min-width: 1440px) {
        .month-name { font-size: 1.375rem; }
        .weekday-name { font-size: 0.9375rem; padding: 0.75rem 0; }
        .day-number { font-size: 1.0625rem; padding: 0.375rem 0.5rem; }
        .day-cell.today .day-number { width: 36px; height: 36px; font-size: 1rem; }
        .day-cell { padding: 0.375rem; }
        .day-events { gap: 2px; }
        .more-events { font-size: 0.875rem; }
      }
    `],e([ue({attribute:!1})],di.prototype,"hass",void 0),e([ue({type:Array})],di.prototype,"events",void 0),e([ue({type:Array})],di.prototype,"calendars",void 0),e([ue({type:Object})],di.prototype,"currentDate",void 0),e([ue({type:Object})],di.prototype,"hiddenCalendars",void 0),e([ue({attribute:!1})],di.prototype,"firstDay",void 0),e([ue({attribute:!1})],di.prototype,"timeFormat",void 0),e([ue({type:Boolean})],di.prototype,"showStripes",void 0),e([ue({type:Number})],di.prototype,"tick",void 0),e([ue({type:String,reflect:!0})],di.prototype,"layout",void 0),e([me()],di.prototype,"_fit",void 0),ge("pv-view-month",di);const li=["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];class ci extends le{constructor(){super(...arguments),this.events=[],this.calendars=[],this.currentDate=new Date,this.hiddenCalendars=new Set,this.timeFormat="12h",this.forecast=[],this.showStripes=!0,this.tick=0,this.layout="landscape",this._daysLoaded=14}render(){const e=new Date;e.setHours(0,0,0,0);const t=[];for(let i=0;i<this._daysLoaded;i++){const s=new Date(e);s.setDate(s.getDate()+i),t.push(s)}const i=Te(Se(Pe(this.events,this.hiddenCalendars),this.calendars)),s=si(this.forecast);return U`
      <div class="agenda-container">
        ${t.map(e=>this._renderDayCard(e,i,s))}
        <div class="load-more" @click=${this._loadMore}>
          Load more days
        </div>
      </div>
    `}_renderDayCard(e,t,i){const s=Ee(e),a=t.get(s)||[],n=ke(e),r=i.get(s),o=function(e){if(ke(e))return"Today";if(function(e){const t=new Date;return t.setDate(t.getDate()+1),e.getFullYear()===t.getFullYear()&&e.getMonth()===t.getMonth()&&e.getDate()===t.getDate()}(e))return"Tomorrow";const t=new Date,i=Math.floor((e.getTime()-t.getTime())/864e5);return i<7&&i>=0?e.toLocaleDateString("en-US",{weekday:"long"}):$e(e,"medium")}(e),d=$e(e,"long"),l=[...a].sort(Me);return U`
      <div class="day-card ${n?"day-card--today":""}">
        <div class="day-card-header">
          <div class="day-card-header-left">
            <span class="day-name ${n?"day-name--today":""}">
              ${li[e.getDay()]} ${e.getDate()}
            </span>
            ${o?U`<span class="day-relative">${o}</span>`:U`<span class="day-relative">${d}</span>`}
          </div>
          ${r?U`
            <div class="day-weather">
              ${Qt(r.condition,20)}
              <span class="day-weather-temps">${Math.round(r.tempHigh)}°/${Math.round(r.tempLow)}°</span>
            </div>
          `:Y}
        </div>
        <div class="day-subheader">
          <span>${l.length} event${1!==l.length?"s":""}</span>
          <button class="add-event-link" @click=${()=>this._addEvent(e)}>+ Add event</button>
        </div>
        <div class="day-events">
          ${l.length>0?l.map(e=>U`
                <pv-event-chip
                  .hass=${this.hass}
                  .event=${e}
                  .calendars=${this.calendars}
                  .timeFormat=${this.timeFormat}
                  .showStripes=${this.showStripes}
                  .tick=${this.tick}
                  @event-click=${e=>this._onEventClick(e.detail.event)}
                ></pv-event-chip>
              `):U`<div class="empty-day">No events</div>`}
        </div>
      </div>
    `}_loadMore(){this._daysLoaded+=14}_addEvent(e){this.dispatchEvent(new CustomEvent("create-event",{detail:{date:e},bubbles:!0,composed:!0}))}_onEventClick(e){this.dispatchEvent(new CustomEvent("event-click",{detail:{event:e},bubbles:!0,composed:!0}))}}ci.styles=[nt,ht,r`
      :host { display: block; height: 100%; overflow: hidden; }

      .agenda-container {
        display: flex;
        flex-direction: column;
        height: 100%;
        overflow-y: auto;
        scroll-behavior: smooth;
        scrollbar-width: none;
      }

      .agenda-container::-webkit-scrollbar {
        display: none;
      }

      .day-card {
        display: flex;
        flex-direction: column;
        flex-shrink: 0;
        margin: 0 0.75rem 0.75rem;
        background: var(--pv-card-bg, #fff);
        border-radius: var(--pv-radius-md, 12px);
        border: 1px solid var(--pv-border-subtle);
        overflow: hidden;
      }

      .day-card--today {
        border-color: var(--pv-accent);
        box-shadow: 0 0 0 1px var(--pv-accent);
      }

      .day-card-header {
        display: flex;
        align-items: baseline;
        justify-content: space-between;
        padding: 0.625rem 0.75rem 0.375rem;
        border-bottom: 1px solid var(--pv-border-subtle);
        position: sticky;
        top: 0;
        background: var(--pv-card-bg, #fff);
        z-index: 2;
      }

      .day-card-header-left {
        display: flex;
        align-items: baseline;
        gap: 0.5rem;
      }

      .day-name {
        font-size: 1.0625rem;
        font-weight: 700;
        color: var(--pv-text);
      }

      .day-name--today {
        color: var(--pv-accent-ink, var(--pv-accent));
      }

      .day-relative {
        font-size: 0.75rem;
        color: var(--pv-text-muted);
        font-weight: 400;
      }

      .day-weather {
        display: flex;
        align-items: center;
        gap: 0.25rem;
        font-size: 0.6875rem;
        color: var(--pv-text-secondary);
      }

      .day-weather svg {
        width: 20px;
        height: 20px;
      }

      .day-weather-temps {
        font-weight: 500;
      }

      .day-subheader {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0.25rem 0.75rem 0.375rem;
        font-size: 0.6875rem;
        color: var(--pv-text-muted);
      }

      .add-event-link {
        color: var(--pv-accent-ink, var(--pv-accent));
        cursor: pointer;
        font-weight: 500;
        font-size: 0.6875rem;
        background: none;
        border: none;
        padding: 0;
        font-family: inherit;
      }

      .add-event-link:hover {
        text-decoration: underline;
      }

      .day-events {
        display: flex;
        flex-direction: column;
        gap: 0.375rem;
        padding: 0.375rem 0.5rem 0.5rem;
      }

      .empty-day {
        color: var(--pv-text-muted);
        font-size: 0.75rem;
        padding: 0.75rem;
        text-align: center;
        font-style: italic;
      }

      .load-more {
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        gap: 0.5rem;
        padding: 1rem;
        margin: 0 0.75rem 0.75rem;
        background: var(--pv-card-bg, #fff);
        border-radius: var(--pv-radius-md, 12px);
        border: 1px dashed var(--pv-border);
        color: var(--pv-accent-ink, var(--pv-accent));
        cursor: pointer;
        font-weight: 600;
        font-size: 0.875rem;
        transition: background 150ms ease;
      }

      .load-more:hover {
        background: var(--pv-today-bg, rgba(99, 102, 241, 0.06));
      }

      /* ═══════════ RESPONSIVE ═══════════ */

      /* SM/XS: phones */
      @media (max-width: 479px) {
        .day-card { margin: 0 0.5rem 0.5rem; }
        .day-name { font-size: 0.9375rem; }
        .day-card-header { padding: 0.5rem 0.625rem 0.25rem; }
        .day-subheader { padding: 0.125rem 0.625rem 0.25rem; }
      }

      /* MD+: constrain width */
      @media (min-width: 768px) {
        .agenda-container { max-width: 800px; margin: 0 auto; width: 100%; }
      }

      /* LG: large screens */
      @media (min-width: 1024px) {
        .day-name { font-size: 1.125rem; }
        .day-card-header { padding: 0.75rem 1rem 0.5rem; }
        .day-events { padding: 0.5rem 0.625rem 0.625rem; gap: 0.5rem; }
      }

      /* XL: wall displays, ~50% larger */
      @media (min-width: 1440px) {
        .agenda-container { max-width: 960px; }
        .day-name { font-size: 1.5rem; }
        .day-relative { font-size: 1rem; }
        .day-weather svg { width: 32px; height: 32px; }
        .day-weather-temps { font-size: 0.9375rem; }
        .day-subheader { font-size: 0.9375rem; }
        .add-event-link { font-size: 0.9375rem; }
        .day-card-header { padding: 0.875rem 1.125rem 0.5rem; }
        .day-events { padding: 0.75rem 1rem 1rem; gap: 0.625rem; }
        .load-more { font-size: 1.125rem; padding: 1.25rem; }
      }
    `],e([ue({attribute:!1})],ci.prototype,"hass",void 0),e([ue({type:Array})],ci.prototype,"events",void 0),e([ue({type:Array})],ci.prototype,"calendars",void 0),e([ue({type:Object})],ci.prototype,"currentDate",void 0),e([ue({type:Object})],ci.prototype,"hiddenCalendars",void 0),e([ue({attribute:!1})],ci.prototype,"timeFormat",void 0),e([ue({attribute:!1})],ci.prototype,"forecast",void 0),e([ue({type:Boolean})],ci.prototype,"showStripes",void 0),e([ue({type:Number})],ci.prototype,"tick",void 0),e([ue({type:String,reflect:!0})],ci.prototype,"layout",void 0),e([me()],ci.prototype,"_daysLoaded",void 0),ge("pv-view-agenda",ci);class pi extends le{constructor(){super(...arguments),this.event=null,this.timeFormat="12h",this._confirmDelete=!1,this._deleteMode=null,this._deleting=!1,this._deleteError="",this._organizerEntityId=null,this._storeSubscription=new zt(this,()=>this.store),this._lastOrganizerUid=""}updated(e){if(super.updated(e),e.has("event")&&this.event){const e=this.event.shared_calendars,t=this.event.uid||"";e&&e.length>1&&t&&t!==this._lastOrganizerUid?(this._lastOrganizerUid=t,this._organizerEntityId=null,this._fetchOrganizer(this.event.calendar_entity_id,t)):(!e||e.length<=1)&&(this._organizerEntityId=null,this._lastOrganizerUid="")}}async _fetchOrganizer(e,t){this._organizerEntityId=await it(this.hass,e,t)}render(){if(!this.event)return Y;const e=this.event,t=Ae(e),i=xe(e.start),s=e.shared_calendars,a=s&&s.length>1;return U`
      <div class="pv-overlay" @click=${this._close}>
        <div class="pv-popup" @click=${e=>e.stopPropagation()} style="position: relative;">
          <button class="pv-btn-icon close-btn" @click=${this._close}>
            <ha-icon icon="mdi:close"></ha-icon>
          </button>

          <div class="popup-header">
            <h3 class="popup-title">${e.summary}</h3>
            ${a?U`
              <div class="participants-row">
                ${s.map(e=>U`
                  <span class="participant-chip" style="background: ${e.calendar_color}; color: ${qe(e.calendar_color)}">
                    ${e.calendar_name}
                    ${e.entity_id===this._organizerEntityId?U`<span class="organizer-tag">organizer</span>`:Y}
                  </span>
                `)}
              </div>
            `:U`
              <div class="popup-calendar">
                <span class="calendar-indicator" style="background: ${e.calendar_color}"></span>
                ${e.calendar_name}
              </div>
            `}
          </div>

          <div class="popup-body">
            <div class="detail-row">
              <ha-icon icon="mdi:clock-outline"></ha-icon>
              <div class="detail-text">
                <div>${$e(i,"long")}</div>
                ${t?U`
                  <div style="color: var(--pv-text-secondary); font-size: 0.875rem">All Day</div>
                `:U`
                  <div style="color: var(--pv-text-secondary); font-size: 0.875rem">
                    ${we(e.start,this.timeFormat)} – ${we(e.end,this.timeFormat)}
                  </div>
                `}
              </div>
            </div>

            ${e.location?U`
              <div class="detail-row">
                <ha-icon icon="mdi:map-marker-outline"></ha-icon>
                <div class="detail-text">${e.location}</div>
              </div>
            `:Y}

            ${e.description?U`
              <div class="detail-row">
                <ha-icon icon="mdi:text"></ha-icon>
                <div class="detail-text" style="white-space: pre-wrap;">${e.description}</div>
              </div>
            `:Y}
          </div>

          ${this._confirmDelete?U`
            <div class="delete-confirm">
              ${this._deleteError?U`
                <div style="color: #EF4444; font-size: 0.8125rem; margin-bottom: 0.75rem;">${this._deleteError}</div>
              `:Y}

              ${a&&!this._deleteMode?U`
                <div class="delete-confirm-text">
                  This event is shared across ${s.length} calendars.
                </div>
                <div style="display: flex; flex-direction: column; gap: 0.5rem;">
                  <button class="delete-option" @click=${()=>{this._deleteMode="all"}}>
                    <ha-icon icon="mdi:delete-outline"></ha-icon>
                    <div class="delete-option-text">
                      <div class="delete-option-label">Delete for everyone</div>
                      <div class="delete-option-desc">Removes the event from all ${s.length} calendars</div>
                    </div>
                  </button>
                  <button class="delete-option" @click=${this._openRemoveGuests}>
                    <ha-icon icon="mdi:account-minus-outline"></ha-icon>
                    <div class="delete-option-text">
                      <div class="delete-option-label">Remove guests</div>
                      <div class="delete-option-desc">Edit the event to add or remove participants</div>
                    </div>
                  </button>
                  <button class="pv-btn pv-btn-secondary" style="margin-top: 0.25rem;"
                    @click=${()=>{this._confirmDelete=!1,this._deleteError="",this._deleteMode=null}}>
                    Cancel
                  </button>
                </div>
              `:U`
                <div class="delete-confirm-text">
                  ${"all"===this._deleteMode&&a?`Delete "${e.summary}" from all ${s.length} calendars?`:"remove-me"===this._deleteMode&&a?`Remove "${e.summary}" from ${e.calendar_name}'s calendar only?`:`Delete "${e.summary}"?`}
                </div>
                <div class="delete-confirm-actions">
                  <button class="pv-btn pv-btn-secondary" @click=${()=>{this._confirmDelete=!1,this._deleteError="",this._deleteMode=null}}>
                    Cancel
                  </button>
                  <button class="pv-btn btn-delete" ?disabled=${this._deleting} @click=${this._delete}>
                    ${this._deleting?"Deleting...":"Delete"}
                  </button>
                </div>
              `}
            </div>
          `:U`
            <div class="popup-actions">
              <button class="pv-btn pv-btn-secondary" @click=${this._edit}>
                <ha-icon icon="mdi:pencil-outline"></ha-icon>
                Edit
              </button>
              <button class="pv-btn pv-btn-secondary" style="color: #EF4444; border-color: #FCA5A5;"
                @click=${()=>this._confirmDelete=!0}>
                <ha-icon icon="mdi:delete-outline"></ha-icon>
                Delete
              </button>
            </div>
          `}
        </div>
      </div>
    `}_close(){this._confirmDelete=!1,this._deleteMode=null,this._deleting=!1,this._deleteError="",this.store.selectEvent(null)}_edit(){this.event&&this.store.openEditDialog(this.event)}_openRemoveGuests(){this.event&&(this._confirmDelete=!1,this._deleteMode=null,this.store.openEditDialog(this.event,{removeGuests:!0}))}async _delete(){if(!this.event?.uid)return void(this._deleteError="Cannot delete this event: it has no unique ID. Delete it from your calendar app directly.");const e=this.event.shared_calendars,t=e&&e.length>1;this._deleting=!0,this._deleteError="";try{if(t&&"all"===this._deleteMode){for(const t of e)try{await et(this.hass,{entity_id:t.entity_id,uid:this.event.uid,recurrence_id:this.event.recurrence_id})}catch(e){console.warn(`[PlanaVista] Failed to delete from ${t.entity_id}:`,e)}await tt(this.hass),this.store.selectEvent(null)}else if(t&&"remove-me"===this._deleteMode){const e=this.event.calendar_entity_id;await et(this.hass,{entity_id:e,uid:this.event.uid,recurrence_id:this.event.recurrence_id}),await tt(this.hass),this.store.selectEvent(null)}else{const e={entity_id:this.event.calendar_entity_id,uid:this.event.uid,recurrence_id:this.event.recurrence_id};await this.store.doDeleteEvent(this.hass,e)}}catch(e){console.error("PlanaVista: Delete failed",e),this._deleteError="Failed to delete event. Please try again.",this._deleting=!1}}}function hi(e){const t=[e.housenumber,e.street].filter(Boolean).join(" "),i=[];for(const s of[e.name,t,e.city,e.state,e.postcode,e.country]){const e=(s||"").trim();e&&!i.some(t=>t.toLowerCase()===e.toLowerCase())&&i.push(e)}return i.join(", ")}pi.styles=[nt,ot,lt,ht,r`
      :host { display: block; }

      .popup-header {
        padding: 1.25rem 1.5rem;
        border-bottom: 1px solid var(--pv-border-subtle);
      }

      .popup-title {
        font-size: 1.125rem;
        font-weight: 600;
        line-height: 1.3;
        color: var(--pv-text);
        margin: 0;
      }

      .popup-calendar {
        display: flex;
        align-items: center;
        gap: 0.375rem;
        margin-top: 0.375rem;
        font-size: 0.8125rem;
        color: var(--pv-text-secondary);
      }

      .calendar-indicator {
        width: 10px;
        height: 10px;
        border-radius: 50%;
        flex-shrink: 0;
      }

      .popup-body {
        padding: 1rem 1.5rem;
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
      }

      .detail-row {
        display: flex;
        align-items: flex-start;
        gap: 0.75rem;
        font-size: 0.9375rem;
        color: var(--pv-text);
      }

      .detail-row ha-icon {
        --mdc-icon-size: 20px;
        color: var(--pv-text-secondary);
        flex-shrink: 0;
        margin-top: 1px;
      }

      .detail-text {
        flex: 1;
        min-width: 0;
        line-height: 1.4;
      }

      .detail-label {
        font-size: 0.75rem;
        color: var(--pv-text-muted);
        font-weight: 500;
        text-transform: uppercase;
        letter-spacing: 0.04em;
        margin-bottom: 0.125rem;
      }

      .popup-actions {
        display: flex;
        gap: 0.75rem;
        padding: 1rem 1.5rem;
        border-top: 1px solid var(--pv-border-subtle);
      }

      .popup-actions .pv-btn {
        flex: 1;
      }

      .delete-confirm {
        padding: 0.75rem 1.5rem;
        background: color-mix(in srgb, #EF4444 6%, transparent);
        border-top: 1px solid color-mix(in srgb, #EF4444 15%, transparent);
      }

      .delete-confirm-text {
        font-size: 0.875rem;
        color: #B91C1C;
        margin-bottom: 0.75rem;
        font-weight: 500;
      }

      .delete-confirm-actions {
        display: flex;
        gap: 0.75rem;
      }

      .btn-delete {
        background: #EF4444;
        color: white;
      }

      .btn-delete:hover {
        background: #DC2626;
      }

      .close-btn {
        position: absolute;
        top: 0.75rem;
        right: 0.75rem;
      }

      .participants-row {
        display: flex;
        flex-wrap: wrap;
        gap: 0.375rem;
        margin-top: 0.25rem;
      }

      .participant-chip {
        display: inline-flex;
        align-items: center;
        gap: 0.3rem;
        padding: 0.25rem 0.625rem;
        border-radius: 9999px;
        font-size: 0.75rem;
        font-weight: 500;
        color: white;
      }

      .participant-chip .organizer-tag {
        font-size: 0.5625rem;
        opacity: 0.85;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.03em;
      }

      .participant-dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: currentColor;
        opacity: 0.6;
      }

      .delete-option {
        display: flex;
        align-items: center;
        gap: 0.625rem;
        padding: 0.625rem 0.75rem;
        border: 1px solid color-mix(in srgb, #EF4444 20%, var(--pv-border));
        border-radius: var(--pv-radius-sm, 8px);
        background: transparent;
        cursor: pointer;
        font-family: inherit;
        font-size: 0.8125rem;
        color: var(--pv-text);
        width: 100%;
        text-align: left;
        transition: background 150ms;
      }

      .delete-option:hover {
        background: color-mix(in srgb, #EF4444 6%, transparent);
      }

      .delete-option ha-icon {
        --mdc-icon-size: 20px;
        color: #EF4444;
        flex-shrink: 0;
      }

      .delete-option-text {
        flex: 1;
      }

      .delete-option-label {
        font-weight: 600;
        color: #B91C1C;
      }

      .delete-option-desc {
        font-size: 0.75rem;
        color: var(--pv-text-secondary);
        margin-top: 0.125rem;
      }
    `],e([ue({attribute:!1})],pi.prototype,"hass",void 0),e([ue({type:Object})],pi.prototype,"event",void 0),e([ue({attribute:!1})],pi.prototype,"timeFormat",void 0),e([me()],pi.prototype,"_confirmDelete",void 0),e([me()],pi.prototype,"_deleteMode",void 0),e([me()],pi.prototype,"_deleting",void 0),e([me()],pi.prototype,"_deleteError",void 0),e([me()],pi.prototype,"_organizerEntityId",void 0),e([ue({attribute:!1})],pi.prototype,"store",void 0),ge("pv-event-popup",pi);class ui{constructor(e){this._opts=e,this._timer=null,this._abort=null,this._seq=0,this._fetch=e.fetchFn??((e,t)=>fetch(e,t))}input(e,t){this.cancel();const i=e.trim();if(!t||i.length<3)return this._opts.onResults([]),void this._opts.onLoading(!1);this._opts.onLoading(!0);const s=this._seq;this._timer=setTimeout(()=>{this._timer=null,this._run(i,s)},350)}cancel(){this._seq++,this._timer&&(clearTimeout(this._timer),this._timer=null),this._abort&&(this._abort.abort(),this._abort=null)}async _run(e,t){const i=new AbortController;this._abort=i;try{const a=await this._fetch((s=e,`https://photon.komoot.io/api/?q=${encodeURIComponent(s)}&limit=5&lang=en`),{signal:i.signal,credentials:"omit",referrerPolicy:"no-referrer"});if(!a.ok)throw new Error(`Photon HTTP ${a.status}`);const n=await a.json();t===this._seq&&this._opts.onResults(function(e){const t=e?.features;if(!Array.isArray(t))return[];const i=[];for(const e of t){const t=hi(e?.properties||{});if(t&&!i.includes(t)&&i.push(t),5===i.length)break}return i}(n))}catch{t===this._seq&&this._opts.onResults([])}finally{t===this._seq&&(this._abort=null,this._opts.onLoading(!1))}var s}}const mi=["Su","Mo","Tu","We","Th","Fr","Sa"];class vi extends le{constructor(){super(...arguments),this.calendars=[],this.open=!1,this.mode="create",this.prefill=null,this.timeFormat="12h",this.locationAutocomplete=!1,this._title="",this._selectedCalendars=new Set,this._originalCalendars=new Set,this._organizerEntityId="",this._date="",this._startTime="",this._endTime="",this._allDay=!1,this._spanDays=1,this._endDayOffset=0,this._description="",this._location="",this._showMore=!1,this._saving=!1,this._error="",this._removeGuestsHint=!1,this._datePickerOpen=!1,this._pickerMonth=0,this._pickerYear=0,this._activeTimePicker=null,this._locationSuggestions=[],this._locationLoading=!1,this._locationFocused=!1,this._locationSearch=new ui({onResults:e=>{this._locationSuggestions=e},onLoading:e=>{this._locationLoading=e}}),this._storeSubscription=new zt(this,()=>this.store)}disconnectedCallback(){super.disconnectedCallback(),this._locationSearch.cancel()}updated(e){super.updated(e),e.has("locationAutocomplete")&&!this.locationAutocomplete&&this._resetLocationSearch(),e.has("open")&&this.open&&(this._initForm(),this._datePickerOpen=!1,requestAnimationFrame(()=>{this._titleInput?.focus()}))}_initForm(){if(this._error="",this._saving=!1,this._showMore=!1,this._resetLocationSearch(),this._locationFocused=!1,this._removeGuestsHint=!!this.prefill?._removeGuestsHint,this.prefill){this._title=this.prefill.summary||"",this._description=this.prefill.description||"",this._location=this.prefill.location||"";const e=this.prefill.shared_calendars;e&&e.length>0?this._selectedCalendars=new Set(e.map(e=>e.entity_id)):this.prefill.calendar_entity_id?this._selectedCalendars=new Set([this.prefill.calendar_entity_id]):this._selectedCalendars=new Set([this.calendars[0]?.entity_id].filter(Boolean)),this._originalCalendars=new Set(this._selectedCalendars),e&&e.length>1&&this.prefill.uid?(this._organizerEntityId="",this._fetchOrganizer(this.prefill.calendar_entity_id||"",this.prefill.uid)):this._organizerEntityId=this.prefill.calendar_entity_id||"",this.prefill.start?this._applyDates(function(e,t){const i=xe(e);if(_e(e)){const e=t?xe(t):i;return{date:Ee(i),allDay:!0,startTime:"09:00",endTime:"10:00",spanDays:Math.max(1,Ce(i,e)),endDayOffset:0}}const s=t?xe(t):new Date(i.getTime()+36e5);return{date:Ee(i),allDay:!1,startTime:yt(i),endTime:yt(s),spanDays:1,endDayOffset:Math.max(0,Ce(i,s))}}(this.prefill.start,this.prefill.end)):this._setDefaults(),(this._description||this._location)&&(this._showMore=!0)}else this._setDefaults()}async _fetchOrganizer(e,t){const i=await it(this.hass,e,t);i&&(this._organizerEntityId=i)}_setDefaults(){this._title="",this._selectedCalendars=new Set,this._originalCalendars=new Set,this._organizerEntityId="",this._applyDates(function(e){const t=new Date(e);t.setMinutes(15*Math.ceil(t.getMinutes()/15),0,0);const i=new Date(t.getTime()+36e5);return{date:Ee(t),allDay:!1,startTime:yt(t),endTime:yt(i),spanDays:1,endDayOffset:Ce(t,i)}}(new Date)),this._description="",this._location=""}get _formDates(){return{date:this._date,allDay:this._allDay,startTime:this._startTime,endTime:this._endTime,spanDays:this._spanDays,endDayOffset:this._endDayOffset}}_applyDates(e){this._date=e.date,this._allDay=e.allDay,this._startTime=e.startTime,this._endTime=e.endTime,this._spanDays=e.spanDays,this._endDayOffset=e.endDayOffset;const[t,i]=e.date.split("-").map(Number);this._pickerYear=t,this._pickerMonth=i-1}_toDateStr(e){return`${e.getFullYear()}-${String(e.getMonth()+1).padStart(2,"0")}-${String(e.getDate()).padStart(2,"0")}`}_renderEndsHint(){const e=this._formDates;if(!(e.allDay?e.spanDays>1:e.endDayOffset>0))return Y;const[t,i,s]=function(e){return e.allDay?_t(e.date,Math.max(1,e.spanDays)-1):_t(e.date,e.endDayOffset)}(e).split("-").map(Number),a=new Date(t,i-1,s).toLocaleDateString("en-US",{weekday:"short",month:"short",day:"numeric"});return U`<div class="ends-hint">${e.allDay?`Through ${a} (${e.spanDays} days)`:`Ends ${a}`}</div>`}_formatDateDisplay(){if(!this._date)return"Select a date";const[e,t,i]=this._date.split("-").map(Number);return new Date(e,t-1,i).toLocaleDateString("en-US",{weekday:"short",month:"long",day:"numeric",year:"numeric"})}render(){if(!this.open)return Y;const e=this.calendars.filter(e=>!1!==e.visible),t="edit"===this.mode,i=t?"Edit Event":"New Event";return U`
      <div class="pv-overlay" @click=${this._onOverlayClick}>
        <div class="pv-dialog" @click=${e=>e.stopPropagation()}>
          <div class="pv-dialog-header">
            <span class="pv-heading-2">${i}</span>
            <button class="pv-btn-icon" @click=${this._close}>
              <ha-icon icon="mdi:close"></ha-icon>
            </button>
          </div>

          <div class="pv-dialog-body">
            <div class="form-grid">
              ${this._error?U`<div class="error-msg">${this._error}</div>`:Y}

              <div class="form-field">
                <input
                  id="title-input"
                  class="pv-input"
                  type="text"
                  placeholder="Event title"
                  .value=${this._title}
                  @input=${e=>this._title=e.target.value}
                />
              </div>

              <div class="form-field">
                <label class="pv-label">${t?"Participants":"Calendars"}</label>
                ${this._removeGuestsHint?U`
                  <div style="
                    display: flex; align-items: center; gap: 0.5rem;
                    padding: 0.5rem 0.75rem; margin-bottom: 0.5rem;
                    background: color-mix(in srgb, var(--pv-accent, #6366F1) 8%, transparent);
                    border: 1px solid color-mix(in srgb, var(--pv-accent, #6366F1) 20%, transparent);
                    border-radius: var(--pv-radius-sm, 8px);
                    font-size: 0.8125rem; color: var(--pv-text-secondary);
                  ">
                    <ha-icon icon="mdi:information-outline" style="--mdc-icon-size: 16px; color: var(--pv-accent-ink, var(--pv-accent, #6366F1)); flex-shrink: 0;"></ha-icon>
                    Tap a guest to remove them from this event
                  </div>
                `:Y}
                <div class="calendar-select">
                  ${e.map(e=>{const i=this._selectedCalendars.has(e.entity_id),s=e.entity_id===this._organizerEntityId,a=t&&s;return U`
                      <div class="cal-option-wrap">
                        ${s&&i?U`<span class="organizer-badge">Organizer</span>`:Y}
                        <button
                          class="cal-option ${i?"selected":""} ${a?"locked":""}"
                          style="${i?`background: ${e.color}; --cal-bg: ${e.color}; color: ${qe(e.color)}`:`--cal-bg: ${e.color}`}"
                          @click=${()=>this._toggleCalendar(e.entity_id)}
                        >
                          <span class="cal-dot" style="background: ${e.color}"></span>
                          ${e.display_name}
                          ${a?U`<ha-icon class="lock-icon" icon="mdi:lock-outline"></ha-icon>`:Y}
                        </button>
                      </div>
                    `})}
                </div>
              </div>

              <div class="form-field">
                <label class="pv-label">Date</label>
                ${this._renderDatePicker()}
                ${this._renderEndsHint()}
              </div>

              <div class="all-day-row">
                <span class="all-day-label">All Day</span>
                <div
                  class="pv-toggle ${this._allDay?"active":""}"
                  role="switch"
                  tabindex="0"
                  aria-checked="${this._allDay}"
                  @click=${()=>this._allDay=!this._allDay}
                  @keydown=${e=>{"Enter"!==e.key&&" "!==e.key||(e.preventDefault(),this._allDay=!this._allDay)}}
                ></div>
              </div>

              ${this._allDay?Y:U`
                <div class="form-row">
                  <div class="form-field">
                    <label class="pv-label">Start Time</label>
                    <div class="time-display start-time-display" @click=${()=>this._openTimePicker("start")}>
                      <ha-icon icon="mdi:clock-outline"></ha-icon>
                      ${this._formatTimeForDisplay(this._startTime)}
                    </div>
                  </div>
                  <div class="form-field">
                    <label class="pv-label">End Time</label>
                    <div class="time-display end-time-display" @click=${()=>this._openTimePicker("end")}>
                      <ha-icon icon="mdi:clock-outline"></ha-icon>
                      ${this._formatTimeForDisplay(this._endTime)}
                    </div>
                  </div>
                </div>
              `}

              ${this._showMore?U`
                <div class="form-field">
                  <label class="pv-label">Description</label>
                  <textarea
                    class="pv-input"
                    rows="3"
                    placeholder="Add a description..."
                    .value=${this._description}
                    @input=${e=>this._description=e.target.value}
                    style="resize: vertical; min-height: 80px;"
                  ></textarea>
                </div>
                <div class="form-field">
                  <label class="pv-label">Location</label>
                  ${this._renderLocationField()}
                </div>
              `:U`
                <button class="show-more-btn" @click=${()=>this._showMore=!0}>
                  + Add description, location
                </button>
              `}
            </div>
          </div>

          <div class="pv-dialog-footer">
            <button class="pv-btn pv-btn-secondary" @click=${this._close}>
              Cancel
            </button>
            <button
              class="pv-btn pv-btn-primary"
              ?disabled=${this._saving}
              @click=${this._save}
            >
              ${this._saving?"Saving...":t?"Save Changes":"Create Event"}
            </button>
          </div>
        </div>
      </div>

      ${this._renderLocationDropdown()}
      ${this._renderDatePickerDropdown()}
      ${this._renderTimePickerDropdown()}
    `}_renderDatePicker(){return U`
      <div class="date-picker-wrap">
        <div class="date-display" @click=${this._toggleDatePicker}>
          <ha-icon icon="mdi:calendar"></ha-icon>
          ${this._formatDateDisplay()}
        </div>
      </div>
    `}_renderDatePickerDropdown(){if(!this._datePickerOpen)return Y;const e=this._dateDisplay;if(!e)return Y;const t=e.getBoundingClientRect(),i=window.innerHeight-t.bottom-8<330&&t.top>330?t.top-330-4:t.bottom+4;return U`
      <div
        class="date-picker-dropdown"
        style="top: ${i}px; left: ${t.left}px;"
      >
        <div class="picker-header">
          <span class="picker-month-label">
            ${new Date(this._pickerYear,this._pickerMonth).toLocaleDateString("en-US",{month:"long",year:"numeric"})}
          </span>
          <div class="picker-nav">
            <button class="picker-nav-btn" @click=${this._pickerPrevMonth}>
              <ha-icon icon="mdi:chevron-left"></ha-icon>
            </button>
            <button class="picker-nav-btn" @click=${this._pickerNextMonth}>
              <ha-icon icon="mdi:chevron-right"></ha-icon>
            </button>
          </div>
        </div>
        <div class="picker-weekdays">
          ${mi.map(e=>U`<span class="picker-weekday">${e}</span>`)}
        </div>
        <div class="picker-days">
          ${this._getPickerDays().map(e=>{const t=e.getMonth()!==this._pickerMonth,i=this._toDateStr(e)===this._toDateStr(new Date),s=this._toDateStr(e)===this._date;return U`
              <button
                class="picker-day ${t?"other-month":""} ${i?"today":""} ${s?"selected":""}"
                @click=${()=>this._selectPickerDay(e)}
              >${e.getDate()}</button>
            `})}
        </div>
      </div>
    `}_toggleDatePicker(){if(this._activeTimePicker=null,this._datePickerOpen=!this._datePickerOpen,this._datePickerOpen&&this._date){const[e,t]=this._date.split("-").map(Number);this._pickerYear=e,this._pickerMonth=t-1}}_pickerPrevMonth(){this._pickerMonth--,this._pickerMonth<0&&(this._pickerMonth=11,this._pickerYear--)}_pickerNextMonth(){this._pickerMonth++,this._pickerMonth>11&&(this._pickerMonth=0,this._pickerYear++)}_getPickerDays(){const e=new Date(this._pickerYear,this._pickerMonth,1),t=e.getDay(),i=new Date(e);i.setDate(i.getDate()-t);const s=[];for(let e=0;e<42;e++){const t=new Date(i);t.setDate(t.getDate()+e),s.push(t)}return s}_selectPickerDay(e){this._date=this._toDateStr(e),this._datePickerOpen=!1}_formatTimeForDisplay(e){if(!e)return"Select time";const[t,i]=e.split(":").map(Number);if("24h"===this.timeFormat)return`${String(t).padStart(2,"0")}:${String(i).padStart(2,"0")}`;const s=t>=12?"PM":"AM";return`${t%12||12}:${String(i).padStart(2,"0")} ${s}`}_getTimeSlots(){const e=[];for(let t=0;t<24;t++)for(let i=0;i<60;i+=15)e.push(`${String(t).padStart(2,"0")}:${String(i).padStart(2,"0")}`);return e}_openTimePicker(e){this._datePickerOpen=!1,this._activeTimePicker=this._activeTimePicker===e?null:e,this._activeTimePicker&&this.updateComplete.then(()=>{const e=this.renderRoot.querySelector(".time-picker-dropdown"),t=e?.querySelector(".time-slot.selected");t&&e&&(e.scrollTop=t.offsetTop-e.clientHeight/2+t.clientHeight/2)})}_selectTime(e){if("start"===this._activeTimePicker){const t=function(e,t){const i={...e,startTime:t};if(0===e.endDayOffset&&e.endTime<=t){const[e,s]=t.split(":").map(Number);i.endTime=`${bt((e+1)%24)}:${bt(s)}`,i.endDayOffset=e+1>=24?1:0}else 1===i.endDayOffset&&i.endTime>t&&(i.endDayOffset=0);return i}(this._formDates,e);this._startTime=t.startTime,this._endTime=t.endTime,this._endDayOffset=t.endDayOffset}else{const t=function(e,t){const i={...e,endTime:t};return 1===e.endDayOffset&&t>e.startTime&&(i.endDayOffset=0),i}(this._formDates,e);this._endTime=t.endTime,this._endDayOffset=t.endDayOffset}this._activeTimePicker=null}_renderTimePickerDropdown(){if(!this._activeTimePicker)return Y;const e="start"===this._activeTimePicker?this._startTimeEl:this._endTimeEl;if(!e)return Y;const t=e.getBoundingClientRect(),i="start"===this._activeTimePicker?this._startTime:this._endTime,s=this._getTimeSlots(),a=window.innerHeight-t.bottom-8<280&&t.top>280?t.top-280-4:t.bottom+4;return U`
      <div
        class="time-picker-dropdown"
        style="top: ${a}px; left: ${t.left}px; width: ${t.width}px;"
      >
        ${s.map(e=>U`
          <div
            class="time-slot ${e===i?"selected":""}"
            @click=${()=>this._selectTime(e)}
          >${this._formatTimeForDisplay(e)}</div>
        `)}
      </div>
    `}_resetLocationSearch(){this._locationSearch.cancel(),this._locationSuggestions=[],this._locationLoading=!1}_renderLocationField(){return U`
      <div class="location-wrap">
        <input
          class="pv-input location-input"
          type="text"
          placeholder=${this.locationAutocomplete?"Search for a place or address...":"Add a location"}
          .value=${this._location}
          @input=${this._onLocationInput}
          @focus=${()=>this._locationFocused=!0}
          @blur=${()=>{setTimeout(()=>{this._locationFocused=!1},250)}}
        />
      </div>
    `}_renderLocationDropdown(){if(!this.locationAutocomplete||!this._locationFocused||!this._locationSuggestions.length&&!this._locationLoading)return Y;const e=this._locationInput;if(!e)return Y;const t=e.getBoundingClientRect();return U`
      <div
        class="location-suggestions-fixed"
        style="top: ${t.bottom}px; left: ${t.left}px; width: ${t.width}px;"
      >
        ${this._locationLoading?U`
          <div class="location-loading">Searching...</div>
        `:Y}
        ${this._locationSuggestions.map(e=>U`
          <div class="location-suggestion" @mousedown=${()=>this._selectLocation(e)}>
            <ha-icon icon="mdi:map-marker"></ha-icon>
            <span>${e}</span>
          </div>
        `)}
        ${this._locationSuggestions.length>0?U`
          <div class="location-powered">Suggestions by Photon &middot; &copy; OpenStreetMap contributors</div>
        `:Y}
      </div>
    `}_onLocationInput(e){const t=e.target.value;this._location=t,this._locationSearch.input(t,this.locationAutocomplete)}_selectLocation(e){this._resetLocationSearch(),this._location=e,this._locationFocused=!1}_toggleCalendar(e){if("edit"===this.mode&&e===this._organizerEntityId)return;const t=new Set(this._selectedCalendars);t.has(e)?(t.delete(e),e===this._organizerEntityId&&(this._organizerEntityId=t.size>0?[...t][0]:"")):(t.add(e),this._organizerEntityId||(this._organizerEntityId=e)),this._selectedCalendars=t,this._removeGuestsHint=!1}_onOverlayClick(){this._close()}_close(){this._datePickerOpen=!1,this._activeTimePicker=null,this._resetLocationSearch(),this.store.closeDialog()}async _editFallback(e,t,i){const s=this.prefill?.uid,a=this.prefill?.recurrence_id,n=this.prefill?.calendar_entity_id,r=[...t].filter(e=>!i.has(e)),o=[...i].filter(e=>!t.has(e)),d=[...t].filter(e=>i.has(e));if(n&&d.includes(n)&&s){const t=Ft(this.prefill,n,e);await this.store.doEditEvent(this.hass,t.deleteData,t.createData,t.restoreData)}else n&&o.includes(n)&&s&&await et(this.hass,{entity_id:n,uid:s,recurrence_id:a});for(const t of d)if(t!==n){if(s)try{await et(this.hass,{entity_id:t,uid:s,recurrence_id:a})}catch{}await Qe(this.hass,{...e,entity_id:t})}for(const t of r)await Qe(this.hass,{...e,entity_id:t});for(const e of o)if(e!==n&&s)try{await et(this.hass,{entity_id:e,uid:s,recurrence_id:a})}catch{}await tt(this.hass),this.store.selectedEvent=null,this.store.closeDialog()}async _save(){if(!this._title.trim())return void(this._error="Please enter an event title");if(0===this._selectedCalendars.size)return void(this._error="Please select at least one calendar");const e=function(e){if(!_e(e.date))return"Please pick a date";if(e.allDay)return null;if(!gt.test(e.startTime)||!gt.test(e.endTime))return"Please pick a start and end time";const t=xt(e.date,e.startTime);return xt(_t(e.date,e.endDayOffset),e.endTime)>t?null:"End time must be after start time"}(this._formDates);if(e)this._error=e;else{this._error="",this._saving=!0;try{const e=function(e,t){const i={summary:t.summary.trim(),...wt(e)},s=t.description?.trim(),a=t.location?.trim();return s&&(i.description=s),a&&(i.location=a),i}(this._formDates,{summary:this._title,description:this._description,location:this._location}),t=this._selectedCalendars,i=this._originalCalendars;if("edit"===this.mode){const s=this.prefill?.uid,a=i.size>1,n=this._organizerEntityId||this.prefill?.calendar_entity_id||"";if(a&&s&&n){const a=[...t];try{await async function(e,t){const i={type:"planavista/update_event",entity_id:t.entity_id,uid:t.uid};return void 0!==t.summary&&(i.summary=t.summary),void 0!==t.description&&(i.description=t.description),void 0!==t.location&&(i.location=t.location),t.start_date_time&&(i.start_date_time=t.start_date_time),t.end_date_time&&(i.end_date_time=t.end_date_time),t.start_date&&(i.start_date=t.start_date),t.end_date&&(i.end_date=t.end_date),t.attendee_entity_ids&&(i.attendee_entity_ids=t.attendee_entity_ids),e.callWS(i)}(this.hass,{entity_id:n,uid:s,summary:e.summary,description:e.description||"",location:e.location||"",start_date_time:e.start_date_time,end_date_time:e.end_date_time,start_date:e.start_date,end_date:e.end_date,attendee_entity_ids:a})}catch(s){console.warn("[PlanaVista] update_event WS failed, falling back to delete+recreate:",s),await this._editFallback(e,t,i)}const r=[...t,...i],o=this.hass;this.store.selectedEvent=null,this.store.closeDialog(),setTimeout(async()=>{try{const e=[...new Set(r)];for(const t of e)await o.callService("homeassistant","update_entity",{entity_id:t});await tt(o)}catch{}},3e3)}else if(t.size>1&&s){const i=this.prefill,s=i.calendar_entity_id,a=n||[...t][0],r=[...t].filter(e=>e!==a);try{await St({remove:()=>et(this.hass,$t(i,s)),create:()=>Ze(this.hass,{...e,entity_id:a,attendee_entity_ids:r}),restore:()=>Qe(this.hass,kt(i,s))})}catch(e){throw await tt(this.hass).catch(()=>{}),e}const o=[...t],d=this.hass;this.store.selectedEvent=null,this.store.closeDialog(),setTimeout(async()=>{try{for(const e of o)await d.callService("homeassistant","update_entity",{entity_id:e});await tt(d)}catch{}},3e3)}else{const t=this.prefill?.calendar_entity_id||"",i=Ft(this.prefill,t,e);await this.store.doEditEvent(this.hass,i.deleteData,i.createData,i.restoreData)}}else{const i=[...t];if(i.length>1){const s=this._organizerEntityId||i[0],a=i.filter(e=>e!==s);await Ze(this.hass,{...e,entity_id:s,attendee_entity_ids:a}),this.store.closeDialog();const n=[...t],r=this.hass;setTimeout(async()=>{try{for(const e of n)await r.callService("homeassistant","update_entity",{entity_id:e});await tt(r)}catch{}},3e3)}else{const t={...e,entity_id:i[0]};await this.store.doCreateEvent(this.hass,t)}}}catch(e){this._error=e instanceof Et?e.message:`Failed to save event: ${e?.message||"Unknown error"}`,this._saving=!1}}}}vi.styles=[nt,ot,ct,lt,ht,r`
      :host { display: block; }

      .form-grid {
        display: flex;
        flex-direction: column;
        gap: 1rem;
      }

      .form-row {
        display: flex;
        gap: 0.75rem;
        align-items: flex-end;
      }

      .form-row > * {
        flex: 1;
      }

      .form-field {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
      }

      .all-day-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0.5rem 0;
      }

      .all-day-label {
        font-size: 0.9375rem;
        font-weight: 500;
        color: var(--pv-text);
      }

      .calendar-select {
        display: flex;
        flex-wrap: wrap;
        gap: 0.375rem;
        padding-top: 12px;
      }

      .cal-option {
        display: inline-flex;
        align-items: center;
        gap: 0.375rem;
        padding: 0.375rem 0.75rem;
        border: 2px solid transparent;
        border-radius: 9999px;
        cursor: pointer;
        transition: all var(--pv-transition);
        font-size: 0.8125rem;
        font-weight: 500;
        background: transparent;
        font-family: inherit;
        min-height: 40px;
      }

      .cal-option.selected {
        color: white;
        box-shadow: 0 2px 6px color-mix(in srgb, var(--cal-bg) 30%, transparent);
      }

      .cal-option:not(.selected) {
        border-color: var(--pv-border);
        color: var(--pv-text-secondary);
      }

      .cal-option:hover:not(.selected) {
        border-color: var(--pv-text-muted);
      }

      .cal-option-wrap {
        position: relative;
        display: inline-flex;
      }

      .organizer-badge {
        position: absolute;
        top: -10px;
        left: 50%;
        transform: translateX(-50%);
        font-size: 0.5rem;
        font-weight: 700;
        color: var(--pv-accent-ink, var(--pv-accent));
        text-transform: uppercase;
        letter-spacing: 0.3px;
        line-height: 1;
        white-space: nowrap;
        pointer-events: none;
      }

      .cal-option.locked {
        cursor: default;
        opacity: 0.9;
      }

      .cal-option .lock-icon {
        --mdc-icon-size: 12px;
        margin-left: 2px;
        opacity: 0.7;
      }

      .cal-dot {
        width: 10px;
        height: 10px;
        border-radius: 50%;
      }

      .show-more-btn {
        background: none;
        border: none;
        color: var(--pv-text-secondary);
        font-size: 0.8125rem;
        cursor: pointer;
        padding: 0.5rem 0;
        font-family: inherit;
        text-align: left;
      }

      .show-more-btn:hover {
        color: var(--pv-accent-ink, var(--pv-accent));
      }

      .ends-hint {
        font-size: 0.8125rem;
        color: var(--pv-text-secondary);
        padding-top: 0.25rem;
      }

      .error-msg {
        color: #EF4444;
        font-size: 0.8125rem;
        padding: 0.5rem;
        background: color-mix(in srgb, #EF4444 8%, transparent);
        border-radius: var(--pv-radius-sm);
      }

      /* ============================================
         CUSTOM DATE PICKER
         ============================================ */
      .date-picker-wrap {
        position: relative;
      }

      .date-display {
        display: flex;
        align-items: center;
        gap: 8px;
        width: 100%;
        padding: 0.75rem 1rem;
        border: 1px solid var(--pv-border);
        border-radius: var(--pv-radius-sm, 8px);
        background: var(--pv-card-bg);
        color: var(--pv-text);
        font-size: 0.9375rem;
        font-family: inherit;
        cursor: pointer;
        min-height: 48px;
        box-sizing: border-box;
        transition: border-color 200ms ease;
      }

      .date-display:hover {
        border-color: var(--pv-text-muted);
      }

      .date-display ha-icon {
        --mdc-icon-size: 20px;
        color: var(--pv-text-muted);
      }

      .date-picker-dropdown {
        position: fixed;
        z-index: 9999;
        background: var(--pv-card-bg, #fff);
        border: 1px solid var(--pv-border);
        border-radius: var(--pv-radius-md, 12px);
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.18);
        padding: 12px;
        width: 280px;
        animation: pv-fadeIn 150ms ease;
      }

      .picker-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 8px;
      }

      .picker-month-label {
        font-size: 0.9375rem;
        font-weight: 600;
        color: var(--pv-text);
      }

      .picker-nav {
        display: flex;
        gap: 2px;
      }

      .picker-nav-btn {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 30px;
        height: 30px;
        border: none;
        border-radius: 50%;
        background: transparent;
        color: var(--pv-text-secondary);
        cursor: pointer;
        font-family: inherit;
        transition: background 150ms;
      }

      .picker-nav-btn:hover {
        background: var(--pv-event-hover, rgba(0,0,0,0.05));
      }

      .picker-nav-btn ha-icon {
        --mdc-icon-size: 18px;
      }

      .picker-weekdays {
        display: grid;
        grid-template-columns: repeat(7, 1fr);
        text-align: center;
        margin-bottom: 4px;
      }

      .picker-weekday {
        font-size: 0.6875rem;
        font-weight: 600;
        color: var(--pv-text-muted);
        padding: 4px 0;
        text-transform: uppercase;
      }

      .picker-days {
        display: grid;
        grid-template-columns: repeat(7, 1fr);
        gap: 2px;
      }

      .picker-day {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 36px;
        height: 36px;
        border: none;
        border-radius: 50%;
        background: transparent;
        color: var(--pv-text);
        font-size: 0.8125rem;
        font-family: inherit;
        cursor: pointer;
        transition: all 150ms;
        margin: 0 auto;
      }

      .picker-day:hover {
        background: var(--pv-event-hover, rgba(0,0,0,0.05));
      }

      .picker-day.other-month {
        color: var(--pv-text-muted);
        opacity: 0.4;
      }

      .picker-day.today {
        border: 2px solid var(--pv-accent);
        font-weight: 600;
      }

      .picker-day.selected {
        background: var(--pv-accent);
        color: var(--pv-accent-text, #fff);
        font-weight: 600;
      }

      .picker-day.selected:hover {
        filter: brightness(1.1);
      }

      /* ============================================
         CUSTOM TIME PICKER
         ============================================ */
      .time-display {
        display: flex;
        align-items: center;
        gap: 8px;
        width: 100%;
        padding: 0.75rem 1rem;
        border: 1px solid var(--pv-border);
        border-radius: var(--pv-radius-sm, 8px);
        background: var(--pv-card-bg);
        color: var(--pv-text);
        font-size: 0.9375rem;
        font-family: inherit;
        cursor: pointer;
        min-height: 48px;
        box-sizing: border-box;
        transition: border-color 200ms ease;
      }

      .time-display:hover {
        border-color: var(--pv-text-muted);
      }

      .time-display ha-icon {
        --mdc-icon-size: 20px;
        color: var(--pv-text-muted);
      }

      .time-picker-dropdown {
        position: fixed;
        z-index: 9999;
        background: var(--pv-card-bg, #fff);
        border: 1px solid var(--pv-border);
        border-radius: var(--pv-radius-md, 12px);
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.18);
        max-height: 280px;
        overflow-y: auto;
        animation: pv-fadeIn 150ms ease;
        scrollbar-width: thin;
      }

      .time-picker-dropdown::-webkit-scrollbar {
        width: 4px;
      }

      .time-picker-dropdown::-webkit-scrollbar-thumb {
        background: var(--pv-border);
        border-radius: 4px;
      }

      .time-slot {
        padding: 10px 16px;
        cursor: pointer;
        font-size: 0.9375rem;
        color: var(--pv-text);
        transition: background 120ms ease;
      }

      .time-slot:hover {
        background: var(--pv-event-hover, rgba(0, 0, 0, 0.04));
      }

      .time-slot.selected {
        background: var(--pv-accent);
        color: var(--pv-accent-text, #fff);
        font-weight: 600;
      }

      /* ============================================
         LOCATION AUTOCOMPLETE (fixed position)
         ============================================ */
      .location-wrap {
        position: relative;
      }

      .location-suggestions-fixed {
        position: fixed;
        z-index: 9999;
        background: var(--pv-card-bg, #fff);
        border: 1px solid var(--pv-border);
        border-radius: 0 0 var(--pv-radius-sm, 8px) var(--pv-radius-sm, 8px);
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.18);
        max-height: 220px;
        overflow-y: auto;
      }

      .location-suggestion {
        display: flex;
        align-items: flex-start;
        gap: 8px;
        padding: 10px 12px;
        cursor: pointer;
        font-size: 0.8125rem;
        color: var(--pv-text);
        line-height: 1.35;
        transition: background 120ms ease;
        border-bottom: 1px solid var(--pv-border-subtle, rgba(0,0,0,0.04));
      }

      .location-suggestion:last-child {
        border-bottom: none;
      }

      .location-suggestion:hover {
        background: var(--pv-event-hover, rgba(0, 0, 0, 0.04));
      }

      .location-suggestion ha-icon {
        --mdc-icon-size: 16px;
        color: var(--pv-text-muted);
        flex-shrink: 0;
        margin-top: 2px;
      }

      .location-loading {
        padding: 12px;
        text-align: center;
        font-size: 0.8125rem;
        color: var(--pv-text-muted);
      }

      .location-powered {
        padding: 4px 12px 6px;
        text-align: right;
        font-size: 0.625rem;
        color: var(--pv-text-muted);
        opacity: 0.6;
      }

      /* ═══════════ RESPONSIVE BREAKPOINTS ═══════════ */

      /* xs: phones, bottom-sheet dialog */
      @media (max-width: 479px) {
        .pv-overlay {
          align-items: flex-end;
        }

        .pv-dialog {
          max-width: 100%;
          width: 100%;
          max-height: 90vh;
          border-radius: 16px 16px 0 0;
          animation: pv-slideUp 250ms ease;
        }

        .pv-dialog-header { padding: 1rem; }
        .pv-dialog-body { padding: 1rem; }
        .pv-dialog-footer { padding: 0.75rem 1rem; }

        .form-row { flex-direction: column; gap: 0.5rem; align-items: stretch; }

        .cal-option { padding: 0.25rem 0.5rem; font-size: 0.75rem; min-height: 36px; }
      }

      /* sm: large phones, slightly wider dialog */
      @media (min-width: 480px) and (max-width: 767px) {
        .pv-dialog { max-width: calc(100% - 1rem); }
        .pv-dialog-header { padding: 1rem 1.25rem; }
        .pv-dialog-body { padding: 1.25rem; }
      }

      @keyframes pv-slideUp {
        from { transform: translateY(100%); }
        to { transform: translateY(0); }
      }
    `],e([ue({attribute:!1})],vi.prototype,"hass",void 0),e([ue({type:Array})],vi.prototype,"calendars",void 0),e([ue({type:Boolean})],vi.prototype,"open",void 0),e([ue({type:String})],vi.prototype,"mode",void 0),e([ue({type:Object})],vi.prototype,"prefill",void 0),e([ue({attribute:!1})],vi.prototype,"timeFormat",void 0),e([ue({attribute:!1})],vi.prototype,"locationAutocomplete",void 0),e([me()],vi.prototype,"_title",void 0),e([me()],vi.prototype,"_selectedCalendars",void 0),e([me()],vi.prototype,"_originalCalendars",void 0),e([me()],vi.prototype,"_organizerEntityId",void 0),e([me()],vi.prototype,"_date",void 0),e([me()],vi.prototype,"_startTime",void 0),e([me()],vi.prototype,"_endTime",void 0),e([me()],vi.prototype,"_allDay",void 0),e([me()],vi.prototype,"_spanDays",void 0),e([me()],vi.prototype,"_endDayOffset",void 0),e([me()],vi.prototype,"_description",void 0),e([me()],vi.prototype,"_location",void 0),e([me()],vi.prototype,"_showMore",void 0),e([me()],vi.prototype,"_saving",void 0),e([me()],vi.prototype,"_error",void 0),e([me()],vi.prototype,"_removeGuestsHint",void 0),e([me()],vi.prototype,"_datePickerOpen",void 0),e([me()],vi.prototype,"_pickerMonth",void 0),e([me()],vi.prototype,"_pickerYear",void 0),e([me()],vi.prototype,"_activeTimePicker",void 0),e([me()],vi.prototype,"_locationSuggestions",void 0),e([me()],vi.prototype,"_locationLoading",void 0),e([me()],vi.prototype,"_locationFocused",void 0),e([ue({attribute:!1})],vi.prototype,"store",void 0),e([ve("#title-input")],vi.prototype,"_titleInput",void 0),e([ve(".location-input")],vi.prototype,"_locationInput",void 0),e([ve(".date-display")],vi.prototype,"_dateDisplay",void 0),e([ve(".start-time-display")],vi.prototype,"_startTimeEl",void 0),e([ve(".end-time-display")],vi.prototype,"_endTimeEl",void 0),ge("pv-event-create-dialog",vi);class gi extends le{constructor(){super(...arguments),this.data=null,this.mode="light",this.shape={},this.forecast=[],this.layout="landscape",this.services={},this.revision=0,this._tick=Math.floor(Date.now()/6e4),this._filterOpen=!1,this._refreshing=!1,this._pv=new At(this),this._progressOf=e=>this.services?.chores?.memberProgress?.(e)??null,this._overlayOpen=!1,this._tickTimer=null,this._touchStart=null,this._filterCloseHandler=e=>this._onFilterClickOutside(e),this._derive=vt((e,t,i,s)=>function(e,t,i){const s=Mt(e,t),a=e?.events||[],n=new Map;for(const e of a){const t=e.uid;if(!t)continue;n.has(t)||n.set(t,[]);const i=n.get(t),a=e.calendar_entity_id;if(!i.some(e=>e.entity_id===a)){const t=s.find(e=>e.entity_id===a);i.push({entity_id:a,calendar_name:e.calendar_name||t?.display_name||"",calendar_color:e.calendar_color||t?.color||"",person_entity:t?.person_entity||""})}}return{calendars:s,visibleEvents:Pe(a,i),sharedEventMap:n}}(Xt(e,s),t,i))}connectedCallback(){super.connectedCallback(),this._tick=Math.floor(Date.now()/6e4),this._scheduleTick()}disconnectedCallback(){super.disconnectedCallback(),this._tickTimer&&(clearTimeout(this._tickTimer),this._tickTimer=null),document.removeEventListener("click",this._filterCloseHandler),this._overlayOpen&&(this._overlayOpen=!1,this._fireOverlay(!1))}updated(e){super.updated(e);const t=this._pv.store,i=!(!t.selectedEvent&&!t.dialogOpen);i!==this._overlayOpen&&(this._overlayOpen=i,this._fireOverlay(i))}_fireOverlay(e){this.dispatchEvent(new CustomEvent("pv-overlay-change",{detail:{open:e},bubbles:!0,composed:!0}))}_scheduleTick(){this._tickTimer&&clearTimeout(this._tickTimer),this._tickTimer=setTimeout(()=>{this._tick=Math.floor(Date.now()/6e4),this._scheduleTick()},6e4-Date.now()%6e4+50)}willUpdate(e){e.has("view")&&this.view&&this._pv.store.setView(this.view)}_derived(){return this._derive(this.data,this.cardConfig,this._pv.store.hiddenCalendars,this.mode)}render(){if(!this.hass||!this.display)return Y;const{calendars:e,visibleEvents:t}=this._derived(),i=this._pv.store,s=this.display;return U`
      ${this._renderToolbar(e)}
      <div class="pvc-body"
        @touchstart=${this._onTouchStart}
        @touchend=${this._onTouchEnd}
        @touchcancel=${this._onTouchCancel}
        @event-click=${this._onEventClick}
        @day-click=${this._onDayClick}
        @create-event=${this._onCreateEvent}
      >
        ${this._renderView(i.currentView,t,e,s)}
      </div>

      ${i.selectedEvent?U`
        <pv-event-popup
          .store=${i}
          .hass=${this.hass}
          .event=${i.selectedEvent}
          .timeFormat=${s?.time_format||"12h"}
        ></pv-event-popup>
      `:Y}

      ${i.dialogOpen?U`
        <pv-event-create-dialog
          .store=${i}
          .hass=${this.hass}
          .calendars=${e}
          .open=${!0}
          .mode=${i.dialogOpen}
          .prefill=${i.createPrefill}
          .timeFormat=${s?.time_format||"12h"}
          .locationAutocomplete=${!0===s.location_autocomplete}
        ></pv-event-create-dialog>
      `:Y}
    `}_renderToolbar(e){const t=e.filter(e=>this._pv.store.hiddenCalendars.has(e.entity_id)).length;return U`
      <div class="pvc-toolbar">
        <div class="pvc-filter-wrap">
          <button
            class="pvc-filter-btn ${t>0?"has-hidden":""}"
            @click=${this._toggleFilterDropdown}
          >
            <ha-icon icon="mdi:filter-variant" style="--mdc-icon-size: 20px"></ha-icon>
            Calendars
            ${t>0?U`<span class="pvc-filter-badge">${e.length-t}/${e.length}</span>`:Y}
          </button>

          ${this._filterOpen?U`
            <div class="pvc-filter-panel">
              ${e.map(e=>{const t=!this._pv.store.hiddenCalendars.has(e.entity_id),i=e.person_entity?st(this.hass,e.person_entity):null,s=e.display_name||(e.person_entity?at(this.hass,e.person_entity):e.entity_id),a=(s||"?")[0].toUpperCase();return U`
                  <div
                    class="pvc-filter-item ${t?"active":""}"
                    style="--item-color: ${e.color}; --item-ink: ${qe(e.color)}"
                    @click=${()=>this._pv.store.toggleCalendar(e.entity_id)}
                  >
                    <div class="pvc-filter-check">
                      ${t?U`<span class="pvc-filter-check-icon">✓</span>`:Y}
                    </div>
                    <div
                      class="pvc-filter-avatar"
                      style="${i?`background-image: url(${i}); background-color: ${e.color}`:`background: ${e.color}`}"
                    >${i?"":a}</div>
                    <span class="pvc-filter-name">${s}</span>
                  </div>
                `})}
            </div>
          `:Y}
        </div>

        <!-- Mobile inline calendar chips (shown on xs/sm via CSS) -->
        <div class="pvc-cal-strip">
          ${e.map(e=>{const t=!this._pv.store.hiddenCalendars.has(e.entity_id),i=e.person_entity?st(this.hass,e.person_entity):null,s=e.display_name||(e.person_entity?at(this.hass,e.person_entity):e.entity_id),a=(s||"?")[0].toUpperCase();return U`
              <button
                class="pvc-cal-chip ${t?"active":""}"
                style="--chip-color: ${e.color}; --chip-ink: ${qe(e.color)}"
                @click=${()=>this._pv.store.toggleCalendar(e.entity_id)}
              >
                <div
                  class="pvc-cal-chip-avatar"
                  style="${i?`background-image: url(${i}); background-color: ${e.color}`:`background: ${e.color}`}"
                >${i?"":a}</div>
                <span class="pvc-cal-chip-name">${s}</span>
              </button>
            `})}
        </div>

        <div class="pvc-controls">
          <button class="pvc-new-btn" @click=${()=>this._pv.store.openCreateDialog()}>
            + New
          </button>

          <div class="pvc-nav">
            <button class="pvc-nav-btn" @click=${()=>this._pv.store.navigateDate("prev")}>
              <ha-icon icon="mdi:chevron-left"></ha-icon>
            </button>
            <button class="pvc-today-btn" @click=${()=>this._pv.store.navigateDate("today")}>
              Today
            </button>
            <button class="pvc-nav-btn" @click=${()=>this._pv.store.navigateDate("next")}>
              <ha-icon icon="mdi:chevron-right"></ha-icon>
            </button>
          </div>

          <button class="pvc-refresh-btn ${this._refreshing?"spinning":""}"
            @click=${this._refreshCalendars}
            title="Refresh calendars" aria-label="Refresh calendars"
            ?disabled=${this._refreshing}>
            <ha-icon icon="mdi:autorenew"></ha-icon>
          </button>
        </div>
      </div>
    `}_toggleFilterDropdown(e){e.stopPropagation(),this._filterOpen=!this._filterOpen,this._filterOpen?requestAnimationFrame(()=>{document.addEventListener("click",this._filterCloseHandler)}):document.removeEventListener("click",this._filterCloseHandler)}_onFilterClickOutside(e){const t=e.composedPath(),i=this.shadowRoot?.querySelector(".pvc-filter-panel"),s=this.shadowRoot?.querySelector(".pvc-filter-btn");i&&!t.includes(i)&&s&&!t.includes(s)&&(this._filterOpen=!1,document.removeEventListener("click",this._filterCloseHandler))}_renderView(e,t,i,s){const a=s?.time_format||"12h",n=s?.first_day||"sunday",r=this._pv.store.currentDate,o=this._pv.store.hiddenCalendars,d=this.shape.avatar_border||"primary",l="stripes"===(this.shape.event_style||"stripes");switch(e){case"day":{const{sharedEventMap:e}=this._derived(),s=this._tick;return U`<pv-view-day
          layout=${this.layout}
          .hass=${this.hass}
          .events=${t}
          .calendars=${i}
          .currentDate=${r}
          .hiddenCalendars=${o}
          .timeFormat=${a}
          .hideColumnHeaders=${!1}
          .avatarBorderMode=${d}
          .sharedEventMap=${e}
          .tick=${s}
          .progress=${this.services?.chores?.memberProgress?this._progressOf:null}
          .revision=${this.revision}
        ></pv-view-day>`}case"week":{const e=this._tick;return U`<pv-view-week
          layout=${this.layout}
          .hass=${this.hass}
          .events=${t}
          .calendars=${i}
          .currentDate=${r}
          .hiddenCalendars=${o}
          .timeFormat=${a}
          .firstDay=${n}
          .forecast=${this.forecast}
          .showStripes=${l}
          .tick=${e}
        ></pv-view-week>`}case"month":{const e=this._tick;return U`<pv-view-month
          layout=${this.layout}
          .hass=${this.hass}
          .events=${t}
          .calendars=${i}
          .currentDate=${r}
          .hiddenCalendars=${o}
          .firstDay=${n}
          .timeFormat=${a}
          .showStripes=${l}
          .tick=${e}
        ></pv-view-month>`}case"agenda":{const e=this._tick;return U`<pv-view-agenda
          layout=${this.layout}
          .hass=${this.hass}
          .events=${t}
          .calendars=${i}
          .currentDate=${r}
          .hiddenCalendars=${o}
          .timeFormat=${a}
          .forecast=${this.forecast}
          .showStripes=${l}
          .tick=${e}
        ></pv-view-agenda>`}default:return Y}}_onEventClick(e){const t=e.detail.event;if(t.uid){const e=(Xt(this.data,this.mode)?.events||[]).filter(e=>e.uid===t.uid&&""!==e.uid),i=new Set,s=e.filter(e=>!i.has(e.calendar_entity_id)&&(i.add(e.calendar_entity_id),!0));if(s.length>1){const e={...t,shared_calendars:s.map(e=>({entity_id:e.calendar_entity_id,calendar_name:e.calendar_name,calendar_color:e.calendar_color}))};return void this._pv.store.selectEvent(e)}}this._pv.store.selectEvent(t)}_onCreateEvent(e){const t=e.detail?.date,i={};if(t){const e=t.getFullYear(),s=String(t.getMonth()+1).padStart(2,"0"),a=String(t.getDate()).padStart(2,"0");i.start=`${e}-${s}-${a}T09:00:00`,i.end=`${e}-${s}-${a}T10:00:00`}this._pv.store.openCreateDialog(i)}_onDayClick(e){this._pv.store.setDate(e.detail.date),this.dispatchEvent(new CustomEvent("pv-view-change",{detail:{view:"day"},bubbles:!0,composed:!0}))}_onTouchStart(e){this._touchStart=1===e.touches.length?{x:e.touches[0].clientX,y:e.touches[0].clientY}:null}_onTouchEnd(e){const t=this._touchStart;if(this._touchStart=null,!t||e.touches.length>0||1!==e.changedTouches.length)return;const i=e.changedTouches[0],s=mt(i.clientX-t.x,i.clientY-t.y);s&&this._pv.store.navigateDate(s)}_onTouchCancel(){this._touchStart=null}async _refreshCalendars(){if(!this._refreshing){this._refreshing=!0;try{for(const e of this.data?.calendars||[])e.entity_id&&await this.hass.callService("homeassistant","update_entity",{entity_id:e.entity_id});await this.hass.callService("homeassistant","update_entity",{entity_id:this.cardConfig?.entity||"sensor.planavista_config"})}catch{}setTimeout(()=>{this._refreshing=!1},800)}}}gi.styles=[nt,ot,rt,ht,r`
      :host {
        display: flex;
        flex-direction: column;
        flex: 1 1 auto;
        min-height: 0;
      }

/* ================================================================
         TOOLBAR: avatars left, controls right
         ================================================================ */

      .pvc-toolbar {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 12px 16px;
        border-bottom: 1px solid var(--pv-border);
        gap: 8px;
        flex-shrink: 0;
      }

/* -- Filter dropdown -- */

      .pvc-filter-wrap {
        position: relative;
      }

      .pvc-filter-btn {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 8px 16px;
        border-radius: var(--pv-radius, 12px);
        border: 1px solid var(--pv-border);
        background: transparent;
        color: var(--pv-text-secondary);
        font-size: 0.875rem;
        font-weight: 600;
        cursor: pointer;
        transition: all 200ms ease;
        font-family: inherit;
        min-height: 40px;
        -webkit-tap-highlight-color: transparent;
      }

      .pvc-filter-btn:hover {
        background: var(--pv-event-hover);
        color: var(--pv-text);
      }

      .pvc-filter-btn.has-hidden {
        border-color: var(--pv-accent);
        color: var(--pv-accent-ink, var(--pv-accent));
      }

      .pvc-filter-badge {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        min-width: 20px;
        height: 20px;
        padding: 0 5px;
        border-radius: 10px;
        background: var(--pv-accent);
        color: var(--pv-accent-text);
        font-size: 0.6875rem;
        font-weight: 700;
      }

      .pvc-filter-panel {
        position: absolute;
        top: calc(100% + 6px);
        left: 0;
        min-width: 240px;
        background: var(--pv-card-bg, #fff);
        border: 1px solid var(--pv-border);
        border-radius: var(--pv-radius, 12px);
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.18);
        z-index: 100;
        padding: 6px 0;
        animation: pvc-dropdown-in 150ms ease;
      }

      @keyframes pvc-dropdown-in {
        from { opacity: 0; transform: translateY(-6px); }
        to { opacity: 1; transform: translateY(0); }
      }

      .pvc-filter-item {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 8px 14px;
        cursor: pointer;
        transition: background 120ms ease;
        -webkit-tap-highlight-color: transparent;
      }

      .pvc-filter-item:hover {
        background: var(--pv-event-hover, rgba(0, 0, 0, 0.04));
      }

      .pvc-filter-check {
        width: 22px;
        height: 22px;
        border-radius: var(--pv-radius-sm, 6px);
        border: 2px solid var(--pv-border);
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        transition: all 150ms ease;
      }

      .pvc-filter-item.active .pvc-filter-check {
        background: var(--item-color);
        border-color: var(--item-color);
      }

      .pvc-filter-check-icon {
        color: var(--item-ink, white);
        font-size: 14px;
        line-height: 1;
      }

      .pvc-filter-avatar {
        width: 32px;
        height: 32px;
        border-radius: 50%;
        flex-shrink: 0;
        overflow: hidden;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 700;
        font-size: 0.8125rem;
        color: var(--item-ink, white);
        background-size: cover;
        background-position: center;
      }

      .pvc-filter-name {
        font-size: 0.875rem;
        font-weight: 500;
        color: var(--pv-text);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .pvc-filter-item:not(.active) .pvc-filter-name {
        opacity: 0.5;
      }

/* -- Controls (right side) -- */

      .pvc-controls {
        display: flex;
        align-items: center;
        gap: 6px;
        flex-shrink: 0;
      }

      .pvc-new-btn {
        display: inline-flex;
        align-items: center;
        gap: 5px;
        padding: 9px 18px;
        border-radius: var(--pv-radius, 12px);
        background: var(--pv-accent);
        color: var(--pv-accent-text);
        border: none;
        cursor: pointer;
        font-size: 0.9375rem;
        font-weight: 600;
        font-family: inherit;
        transition: all 200ms ease;
        white-space: nowrap;
        -webkit-tap-highlight-color: transparent;
        min-height: 40px;
      }

      .pvc-new-btn:hover {
        filter: brightness(1.1);
        transform: translateY(-1px);
      }

      .pvc-new-btn:active {
        transform: translateY(0);
      }

/* Nav buttons */

      .pvc-nav {
        display: flex;
        align-items: center;
        gap: 2px;
      }

      .pvc-nav-btn {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 40px;
        height: 40px;
        border: none;
        border-radius: 50%;
        background: transparent;
        color: var(--pv-text-secondary);
        cursor: pointer;
        transition: all 200ms ease;
        font-family: inherit;
        -webkit-tap-highlight-color: transparent;
        --mdc-icon-size: 24px;
      }

      .pvc-nav-btn:hover {
        background: var(--pv-event-hover);
        color: var(--pv-text);
      }

      .pvc-today-btn {
        padding: 6px 16px;
        border: 1px solid var(--pv-border);
        border-radius: var(--pv-radius, 12px);
        background: transparent;
        color: var(--pv-text-secondary);
        font-size: 0.875rem;
        font-weight: 600;
        cursor: pointer;
        transition: all 200ms ease;
        font-family: inherit;
        min-height: 38px;
        -webkit-tap-highlight-color: transparent;
      }

      .pvc-today-btn:hover {
        background: var(--pv-accent);
        color: var(--pv-accent-text);
        border-color: var(--pv-accent);
      }

/* ================================================================
         CALENDAR VIEW BODY
         ================================================================ */

      .pvc-body {
        flex: 1;
        overflow: hidden;
        position: relative;
        min-height: 0;
      }

      .pvc-body > * {
        height: 100%;
      }

/* Refresh + Gear buttons */

      .pvc-refresh-btn {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 40px;
        height: 40px;
        border: none;
        border-radius: 50%;
        background: transparent;
        color: var(--pv-text-secondary);
        cursor: pointer;
        transition: all 200ms ease;
        font-family: inherit;
        -webkit-tap-highlight-color: transparent;
        --mdc-icon-size: 22px;
      }

      .pvc-refresh-btn:hover {
        background: var(--pv-event-hover);
        color: var(--pv-text);
      }

      .pvc-refresh-btn.spinning ha-icon {
        animation: pvc-spin 0.8s ease;
      }

      @keyframes pvc-spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
      }

/* ═══════════════════════════════════════════════
         RESPONSIVE BREAKPOINTS
         ═══════════════════════════════════════════════ */

/* --- Mobile calendar avatar strip (inline in toolbar) --- */

      .pvc-cal-strip {
        display: none; /* hidden on desktop: filter dropdown used instead */
      }

/* Phone: the person chips replace the Calendars dropdown (spec 12.1: the card's own size). */

      :host([layout='phone']) .pvc-toolbar {
        flex-wrap: wrap;
        justify-content: center;
        padding: 8px 10px;
        gap: 6px;
      }

      :host([layout='phone']) .pvc-filter-wrap {
        display: none;
      }

      :host([layout='phone']) .pvc-cal-strip {
        display: flex;
        align-items: center;
        gap: 6px;
        width: 100%;
        overflow-x: auto;
        -webkit-overflow-scrolling: touch;
        scrollbar-width: none;
        padding-bottom: 2px;
      }

      :host([layout='phone']) .pvc-cal-strip::-webkit-scrollbar {
        display: none;
      }

      :host([layout='phone']) .pvc-controls {
        width: 100%;
        justify-content: center;
        flex-wrap: wrap;
        gap: 4px;
      }

/* Calendar strip chips */

      .pvc-cal-chip {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        padding: 4px 10px 4px 4px;
        border-radius: 9999px;
        border: 1.5px solid var(--chip-color, var(--pv-border));
        background: transparent;
        cursor: pointer;
        transition: all 150ms ease;
        flex-shrink: 0;
        font-family: inherit;
        -webkit-tap-highlight-color: transparent;
      }

      .pvc-cal-chip.active {
        background: color-mix(in srgb, var(--chip-color) 12%, transparent);
      }

      .pvc-cal-chip:not(.active) {
        opacity: 0.4;
        border-color: var(--pv-border);
      }

      .pvc-cal-chip-avatar {
        width: 24px;
        height: 24px;
        border-radius: 50%;
        flex-shrink: 0;
        overflow: hidden;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 700;
        font-size: 0.625rem;
        color: var(--chip-ink, white);
        background-size: cover;
        background-position: center;
      }

      .pvc-cal-chip-name {
        font-size: 0.6875rem;
        font-weight: 600;
        color: var(--pv-text);
        white-space: nowrap;
        max-width: 60px;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .pvc-cal-chip:not(.active) .pvc-cal-chip-name {
        color: var(--pv-text-muted);
      }

/* lg: large desktops / small wall displays (1024–1439px), scale up ~20% */

      @media (min-width: 1024px){
        .pvc-toolbar { padding: 14px 20px; gap: 10px; }
        .pvc-filter-btn { padding: 10px 20px; font-size: 1rem; min-height: 48px; }
        .pvc-new-btn { padding: 11px 22px; font-size: 1.0625rem; min-height: 48px; }
        .pvc-today-btn { padding: 8px 18px; font-size: 1rem; min-height: 44px; }
        .pvc-nav-btn { width: 48px; height: 48px; --mdc-icon-size: 24px; }
      }

/* xl: wall-mounted touch displays (1440px+, 27"+), scale up ~40% */

      @media (min-width: 1440px){
        .pvc-toolbar { padding: 16px 24px; gap: 12px; }
        .pvc-filter-btn { padding: 12px 24px; font-size: 1.125rem; min-height: 56px; }
        .pvc-filter-badge { min-width: 24px; height: 24px; font-size: 0.8125rem; }
        .pvc-filter-avatar { width: 40px; height: 40px; font-size: 1rem; }
        .pvc-filter-name { font-size: 1.0625rem; }
        .pvc-new-btn { padding: 14px 28px; font-size: 1.1875rem; min-height: 56px; }
        .pvc-today-btn { padding: 10px 22px; font-size: 1.125rem; min-height: 52px; }
        .pvc-nav-btn { width: 56px; height: 56px; --mdc-icon-size: 28px; }
      }
    `],e([ue({attribute:!1})],gi.prototype,"hass",void 0),e([ue({attribute:!1})],gi.prototype,"cardConfig",void 0),e([ue({attribute:!1})],gi.prototype,"data",void 0),e([ue({attribute:!1})],gi.prototype,"display",void 0),e([ue({attribute:!1})],gi.prototype,"mode",void 0),e([ue({attribute:!1})],gi.prototype,"shape",void 0),e([ue({attribute:!1})],gi.prototype,"forecast",void 0),e([ue({attribute:!1})],gi.prototype,"view",void 0),e([ue({type:String,reflect:!0})],gi.prototype,"layout",void 0),e([ue({attribute:!1})],gi.prototype,"services",void 0),e([ue({attribute:!1})],gi.prototype,"revision",void 0),e([me()],gi.prototype,"_tick",void 0),e([me()],gi.prototype,"_filterOpen",void 0),e([me()],gi.prototype,"_refreshing",void 0),ge("pv-calendar-module",gi);const bi=r`
.page-content {
        max-width: 560px;
        margin: 0 auto;
        animation: pv-slideLeft 250ms ease forwards;
      }
.page-title {
        font-family: var(--pv-font-heading, ui-rounded, 'SF Pro Rounded', 'PlanaVista Rounded', system-ui, sans-serif);
        font-size: 1.375rem;
        font-weight: 800;
        color: var(--pv-text, #1A1B1E);
        margin: 0 0 0.25rem;
        letter-spacing: -0.02em;
      }
.page-subtitle {
        font-size: 0.9375rem;
        color: var(--pv-text-secondary, #6B7280);
        margin: 0 0 1.75rem;
        line-height: 1.5;
      }
/* ── Pill group (time format / first day) ───────────────── */
.pill-group {
        display: flex;
        gap: 8px;
        flex-wrap: wrap;
      }
.pill-btn {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        padding: 0.5rem 1.25rem;
        min-height: 44px;
        border-radius: 9999px;
        border: 1.5px solid var(--pv-border-subtle, #E5E7EB);
        background: transparent;
        color: var(--pv-text-secondary, #6B7280);
        font-family: inherit;
        font-size: 0.9375rem;
        font-weight: 500;
        cursor: pointer;
        transition: all var(--pv-transition, 200ms ease);
        -webkit-tap-highlight-color: transparent;
        user-select: none;
      }
.pill-btn:hover {
        border-color: var(--pv-accent, #6366F1);
        color: var(--pv-accent-ink, var(--pv-accent, #6366F1));
        background: color-mix(in srgb, var(--pv-accent, #6366F1) 5%, transparent);
      }
.pill-btn--active {
        border-color: var(--pv-accent, #6366F1);
        background: var(--pv-accent, #6366F1);
        color: var(--pv-accent-text, #FFFFFF);
      }
.pill-btn--active:hover {
        opacity: 0.9;
        color: var(--pv-accent-text, #FFFFFF);
        background: var(--pv-accent, #6366F1);
      }
@media (max-width: 479px) {
.page-title { font-size: 1.125rem; }
.page-subtitle { font-size: 0.8125rem; margin-bottom: 1.25rem; }
.pill-btn { padding: 0.375rem 0.875rem; min-height: 38px; font-size: 0.8125rem; }
}
@media (min-width: 480px) and (max-width: 767px) {
.page-title { font-size: 1.25rem; }
}
`;class yi{constructor(e,t,i){this._message=e,this._onEvent=t,this._onStatus=i,this.status="idle",this._unsub=null,this._generation=0,this._attempt=0,this._hadEvent=!1,this._onReady=()=>{this._connection&&(this._generation++,this._unsub=null,this._cancelRetry(),this._subscribe())},this._onDisconnected=()=>{this._connection&&this._setStatus("offline")}}update(e){e!==this._connection&&(this.stop(),this._connection=e,e&&(e.addEventListener("ready",this._onReady),e.addEventListener("disconnected",this._onDisconnected),this._subscribe()))}stop(){if(this._generation++,this._cancelRetry(),this._connection?.removeEventListener("ready",this._onReady),this._connection?.removeEventListener("disconnected",this._onDisconnected),this._connection=void 0,this._hadEvent=!1,this._unsub){const e=this._unsub;this._unsub=null,ei(e)}this._setStatus("idle")}retry(){this._connection&&"live"!==this.status&&"connecting"!==this.status&&(this._generation++,this._cancelRetry(),this._subscribe())}_subscribe(){const e=this._connection;if(!e)return;const t=this._generation;"offline"!==this.status&&this._setStatus("connecting"),e.subscribeMessage(e=>{t===this._generation&&(this._hadEvent=!0,this._onEvent(e))},this._message,{resubscribe:!1}).then(e=>{t===this._generation?(this._unsub=e,this._attempt=0,this._setStatus("live")):ei(e)}).catch(()=>{t===this._generation&&(this._hadEvent||this._onEvent(null),this._setStatus("offline"),this._retry=setTimeout(()=>{this._retry=void 0,t===this._generation&&this._subscribe()},ti(this._attempt++)))})}_setStatus(e){e!==this.status&&(this.status=e,this._onStatus?.(e))}_cancelRetry(){void 0!==this._retry&&clearTimeout(this._retry),this._retry=void 0,this._attempt=0}}function fi(e){return e&&"object"==typeof e&&"string"==typeof e.code?e.code:"unknown"}function _i(e){return e&&"object"==typeof e&&"string"==typeof e.message?e.message:null}const xi=new Set(["parent_mode_required","pin_required"]);class wi{constructor(e,t,i){this._ws=e,this._session=t,this._onSessionEnded=i}call(e,t,i=!0){const s={type:e,...t},a=i?this._session():null;return a?(s.session=a,this._ws.callWS(s).catch(e=>{throw xi.has(fi(e))&&this._onSessionEnded?.(a),e})):this._ws.callWS(s)}}class $i extends yi{constructor(e){super({type:"planavista/household/subscribe"},e)}}class ki extends wi{saveMember(e,t){const i={member:e};return t&&Object.assign(i,{member_id:t.id,rev:t.rev}),this.call("planavista/household/member/save",i)}deleteMember(e){return this.call("planavista/household/member/delete",{member_id:e})}reorder(e){return this.call("planavista/household/member/reorder",{order:e})}setSharedScreen(e){return this.call("planavista/household/shared_screen",{shared:e})}saveSecurity(e){return this.call("planavista/household/settings/save",e)}saveSetup(e){return this.call("planavista/household/setup/save",e)}saveConfig(e){return this.call("planavista/config/save",e)}unlock(e,t){return this.call("planavista/pin/unlock",{member_id:e,pin:t},!1)}setPin(e,t){return this.call("planavista/pin/set",{member_id:e,pin:t})}clearPin(e){return this.call("planavista/pin/clear",{member_id:e})}clearPause(e){return this.call("planavista/pin/clear_lockout",{member_id:e})}lock(e){return this.call("planavista/pin/lock",{session:e},!1)}touch(e){return this.call("planavista/pin/touch",{session:e},!1)}}const Fi="pv-push-page",Ei="pv-pop-page",Ci="pv-page-error";function Si(e){switch(e){case"parent_mode_required":return"Parent mode ended. Enter a parent's PIN to keep changing settings.";case"not_allowed":return"Only a parent can change this.";case"unavailable":return"Update PlanaVista to change people and PINs.";default:return"Couldn't save. Check the connection and try again."}}class Di extends le{constructor(){super(...arguments),this.household=null,this.layout="landscape",this.mode="settings",this._loaded=!1}willUpdate(){!this._loaded&&this.data?.display&&(this._draft={...this.data.display},this._loaded=!0)}_apply(e){this._draft={...this._draft,...e},this.api.saveConfig({display:e}).catch(e=>this._error(e))}_error(e){this.dispatchEvent(new CustomEvent(Ci,{detail:{message:Si(fi(e))},bubbles:!0,composed:!0}))}get _weatherEntities(){return this.hass?Object.keys(this.hass.states).filter(e=>e.startsWith("weather.")).sort():[]}_entityLabel(e){return this.hass?.states[e]?.attributes?.friendly_name||e}_toggleLocationAutocomplete(){this._apply({location_autocomplete:!this._draft.location_autocomplete})}_renderPreferences(){return U`
      <div class="page-content">
        <!-- Time Format -->
        <div class="field-group">
          <label class="pv-label">Time Format</label>
          <div class="pill-group" role="group" aria-label="Time format">
            <button
              class="pill-btn ${"12h"===this._draft.time_format?"pill-btn--active":""}"
              type="button"
              @click=${()=>{this._apply({time_format:"12h"})}}
            >12h</button>
            <button
              class="pill-btn ${"24h"===this._draft.time_format?"pill-btn--active":""}"
              type="button"
              @click=${()=>{this._apply({time_format:"24h"})}}
            >24h</button>
          </div>
        </div>

        <!-- First Day of Week -->
        <div class="field-group">
          <label class="pv-label">First Day of Week</label>
          <div class="pill-group" role="group" aria-label="First day of week">
            <button
              class="pill-btn ${"sunday"===this._draft.first_day?"pill-btn--active":""}"
              type="button"
              @click=${()=>{this._apply({first_day:"sunday"})}}
            >Sunday</button>
            <button
              class="pill-btn ${"monday"===this._draft.first_day?"pill-btn--active":""}"
              type="button"
              @click=${()=>{this._apply({first_day:"monday"})}}
            >Monday</button>
          </div>
        </div>

        <!-- Weather Entity -->
        <div class="field-group">
          <label class="pv-label" for="weather-select">Weather Entity</label>
          <select
            id="weather-select"
            class="pv-input pv-select"
            .value=${this._draft.weather_entity}
            @change=${e=>{this._apply({weather_entity:e.target.value})}}
          >
            <option value="">(None)</option>
            ${this._weatherEntities.map(e=>U`
              <option value="${e}" ?selected=${this._draft.weather_entity===e}>${this._entityLabel(e)}</option>
            `)}
          </select>
        </div>

        <!-- Default View -->
        <div class="field-group">
          <label class="pv-label">Default View</label>
          <div class="view-grid" role="group" aria-label="Default calendar view">
            ${[{key:"day",label:"Day",icon:"M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V9h14v11zm-7-7c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"},{key:"week",label:"Week",icon:"M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zM7 12h2v6H7zm4 0h2v6h-2zm4 0h2v6h-2z"},{key:"month",label:"Month",icon:"M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zM9 14H7v-2h2v2zm4 0h-2v-2h2v2zm4 0h-2v-2h2v2zm-8 4H7v-2h2v2zm4 0h-2v-2h2v2zm4 0h-2v-2h2v2z"},{key:"agenda",label:"Agenda",icon:"M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zM7 7v2h14V7H7z"}].map(e=>U`
              <button
                class="view-card ${this._draft.default_view===e.key?"view-card--active":""}"
                type="button"
                aria-pressed="${this._draft.default_view===e.key}"
                @click=${()=>{this._apply({default_view:e.key})}}
              >
                <svg class="view-icon" viewBox="0 0 24 24" width="24" height="24">
                  <path d="${e.icon}" />
                </svg>
                <span class="view-label">${e.label}</span>
              </button>
            `)}
          </div>
        </div>

        <!-- Address suggestions (location autocomplete) -->
        <div class="field-group">
          <div class="toggle-row">
            <span class="pv-label" id="address-suggestions-label">Address suggestions</span>
            <div
              class="pv-toggle ${!0===this._draft.location_autocomplete?"active":""}"
              role="switch"
              tabindex="0"
              aria-checked="${!0===this._draft.location_autocomplete}"
              aria-labelledby="address-suggestions-label"
              @click=${this._toggleLocationAutocomplete}
              @keydown=${e=>{"Enter"!==e.key&&" "!==e.key||(e.preventDefault(),this._toggleLocationAutocomplete())}}
            ></div>
          </div>
          <p class="field-hint">
            <strong>Off (recommended):</strong> address lookup stays 100% local. Locations are plain
            text and nothing is sent anywhere.
          </p>
          <p class="field-hint">
            <strong>On:</strong> as you type a location, the text you've typed is sent to Photon
            (photon.komoot.io), a free OpenStreetMap-based service, to suggest addresses. Nothing
            else is sent: not your home location or any calendar details.
          </p>
        </div>
      </div>
    `}render(){return this._loaded?this._renderPreferences():Y}}Di.styles=[nt,ot,ct,ht,bi,r`
/* ── Field groups ───────────────────────────────────────── */
.field-group {
        margin-bottom: 1.5rem;
      }
.toggle-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 1rem;
        margin-bottom: 0.5rem;
      }
.toggle-row .pv-label {
        margin-bottom: 0;
      }
.toggle-row .pv-toggle {
        flex-shrink: 0;
      }
.field-hint {
        font-size: 0.8125rem;
        line-height: 1.5;
        color: var(--pv-text-secondary, #6B7280);
        margin: 0 0 0.375rem;
        max-width: 60ch;
      }
.field-hint strong {
        color: var(--pv-text, #1A1B1E);
        font-weight: 600;
      }
/* ── View grid (default view selection) ────────────────── */
.view-grid {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 8px;
      }
@media (max-width: 400px) {
.view-grid {
          grid-template-columns: repeat(2, 1fr);
        }
}
.view-card {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 0.375rem;
        padding: 0.875rem 0.5rem;
        border: 1.5px solid var(--pv-border-subtle, #E5E7EB);
        border-radius: var(--pv-radius, 12px);
        background: transparent;
        cursor: pointer;
        font-family: inherit;
        transition: all var(--pv-transition, 200ms ease);
        -webkit-tap-highlight-color: transparent;
        user-select: none;
      }
.view-card:hover {
        border-color: var(--pv-accent, #6366F1);
        background: color-mix(in srgb, var(--pv-accent, #6366F1) 5%, transparent);
      }
.view-card--active {
        border-color: var(--pv-accent, #6366F1);
        background: color-mix(in srgb, var(--pv-accent, #6366F1) 10%, transparent);
        box-shadow: 0 0 0 3px color-mix(in srgb, var(--pv-accent, #6366F1) 20%, transparent);
      }
.view-icon {
        fill: var(--pv-text-secondary, #6B7280);
        transition: fill var(--pv-transition, 200ms ease);
      }
.view-card--active .view-icon,
      .view-card:hover .view-icon {
        fill: var(--pv-accent, #6366F1);
      }
.view-label {
        font-size: 0.8125rem;
        font-weight: 500;
        color: var(--pv-text-secondary, #6B7280);
        transition: color var(--pv-transition, 200ms ease);
      }
.view-card--active .view-label,
      .view-card:hover .view-label {
        color: var(--pv-accent-ink, var(--pv-accent, #6366F1));
      }
@media (max-width: 479px) {
.field-group { margin-bottom: 1rem; }
.view-grid { grid-template-columns: repeat(2, 1fr); }
}
    `],e([ue({attribute:!1})],Di.prototype,"hass",void 0),e([ue({attribute:!1})],Di.prototype,"data",void 0),e([ue({attribute:!1})],Di.prototype,"household",void 0),e([ue({attribute:!1})],Di.prototype,"api",void 0),e([ue({attribute:!1})],Di.prototype,"layout",void 0),e([ue({type:String})],Di.prototype,"mode",void 0),e([me()],Di.prototype,"_draft",void 0),ge("pv-calendar-options-page",Di);const Ai={young_child:"Young child",older_child:"Older child",teen:"Teen",adult:"Adult"},zi=[{id:"young_child",label:"Young child",hint:"About 4 to 8"},{id:"older_child",label:"Older child",hint:"About 9 to 12"},{id:"teen",label:"Teen",hint:""},{id:"adult",label:"Adult",hint:""}],Mi=[{id:"parent",label:"Parent"},{id:"adult",label:"Adult"},{id:"teen",label:"Teen"},{id:"older_child",label:"Older child"},{id:"young_child",label:"Young child"}];function Ti(e){return e.parent?"parent":e.age_group}function Bi(e){return"parent"===e?{age_group:"adult",parent:!0}:{age_group:e,parent:!1}}function Pi(e){return[...e].sort((e,t)=>e.order-t.order||e.id.localeCompare(t.id))}function Oi(e){const t=[...e.trim()][0];return t?t.toLocaleUpperCase():"?"}function Ri(e){return Pi(e).filter(e=>e.parent&&e.has_pin)}function Ii(e,t){return t.filter(t=>t.member_id===e)}function Li(e,t){const i=new Map;for(const s of e)s.id!==t&&i.set(s.color.toUpperCase(),s);return i}function Ni(e,t){return"light"===t?e.color:e.color_dark||Ke(e.color)}class Hi extends le{constructor(){super(...arguments),this.value="",this.valueLight="",this._isCustom=!1}updated(e){if(super.updated(e),e.has("value")&&this.value){const e=Hi.PRESETS.some(e=>e.color.toLowerCase()===this.value.toLowerCase());this._isCustom=!e}}_selectPreset(e){this._isCustom=!1,this._emit(e.color,e.light)}_openCustomPicker(){this._colorInput?.click()}_onCustomColorChange(e){const t=e.target.value,i=function(e){let t=e.replace("#","");if(3===t.length&&(t=t.split("").map(e=>e+e).join("")),6!==t.length)return e;const i=parseInt(t.substring(0,2),16),s=parseInt(t.substring(2,4),16),a=parseInt(t.substring(4,6),16);if(isNaN(i)||isNaN(s)||isNaN(a))return e;const n=Math.round(i+.65*(255-i)),r=Math.round(s+.65*(255-s)),o=Math.round(a+.65*(255-a)),d=e=>e.toString(16).padStart(2,"0");return`#${d(n)}${d(r)}${d(o)}`}(t);this._isCustom=!0,this._emit(t,i)}_emit(e,t){this.value=e,this.valueLight=t,this.dispatchEvent(new CustomEvent("color-change",{detail:{color:e,colorLight:t},bubbles:!0,composed:!0}))}_isSelected(e){return this.value.toLowerCase()===e.toLowerCase()}render(){const e=Hi.PRESETS,t=this._isCustom?this.value:"",i=this._isCustom&&!!this.value;return U`
      <div class="swatch-grid" role="group" aria-label="Color presets">
        ${e.map(e=>{const t=this._isSelected(e.color);return U`
            <button
              class="swatch-btn"
              type="button"
              title="${e.name}"
              aria-label="${e.name}${t?" (selected)":""}"
              aria-pressed="${t}"
              style="--swatch-color: ${e.color}"
              @click=${()=>this._selectPreset(e)}
            >
              <div
                class="swatch-circle"
                style="background-color: ${e.color}"
              ></div>
            </button>
          `})}

        <!-- Custom color button -->
        <button
          class="swatch-btn custom-btn"
          type="button"
          title="Custom color…"
          aria-label="Custom color${i?" (selected)":""}"
          aria-pressed="${i}"
          style="--swatch-color: ${t||"var(--pv-accent, #6366F1)"}"
          @click=${this._openCustomPicker}
        >
          <div
            class="custom-circle ${t?"has-color":""}"
            style="${t?`background-color: ${t}`:""}"
          >
            ${t?"":U`<span aria-hidden="true">+</span>`}
          </div>
        </button>

        <!-- Hidden native color input -->
        <input
          id="custom-color-input"
          type="color"
          .value=${t||"#4A90D9"}
          tabindex="-1"
          aria-hidden="true"
          @change=${this._onCustomColorChange}
          @input=${this._onCustomColorChange}
        />
      </div>
    `}}Hi.PRESETS=[{name:"Ink Black",color:"#001219",light:"#A6ACAF"},{name:"Dark Teal",color:"#005F73",light:"#A6C7CE"},{name:"Dark Cyan",color:"#0A9396",light:"#A9D9DA"},{name:"Pearl Aqua",color:"#94D2BD",light:"#DAEFE8"},{name:"Wheat",color:"#E9D8A6",light:"#F7F1E0"},{name:"Golden Orange",color:"#EE9B00",light:"#F9DCA6"},{name:"Burnt Caramel",color:"#CA6702",light:"#ECCAA6"},{name:"Rusty Spice",color:"#BB3E03",light:"#E7BBA7"},{name:"Oxidized Iron",color:"#AE2012",light:"#E3B1AC"},{name:"Brown Red",color:"#9B2226",light:"#DCB2B3"},{name:"Strawberry Red",color:"#F94144",light:"#FDBDBE"},{name:"Pumpkin Spice",color:"#F3722C",light:"#FBCEB5"},{name:"Carrot Orange",color:"#F8961E",light:"#FDDAB0"},{name:"Atomic Tangerine",color:"#F9844A",light:"#FDD4C0"},{name:"Tuscan Sun",color:"#F9C74F",light:"#FDEBC1"},{name:"Willow Green",color:"#90BE6D",light:"#D8E8CC"},{name:"Seaweed",color:"#43AA8B",light:"#BDE1D6"},{name:"Ocean Cyan",color:"#4D908E",light:"#C1D8D7"},{name:"Blue Slate",color:"#577590",light:"#C4CFD8"},{name:"Cerulean",color:"#277DA1",light:"#B3D2DE"}],Hi.styles=[nt,r`
      :host {
        display: block;
      }

      .swatch-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(40px, 1fr));
        gap: 4px;
      }

      /* Each cell is a 44×44 touch target */
      .swatch-btn {
        width: 44px;
        height: 44px;
        padding: 6px;
        background: transparent;
        border: none;
        border-radius: 50%;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        position: relative;
        -webkit-tap-highlight-color: transparent;
        transition: transform var(--pv-transition, 200ms ease);
        box-sizing: border-box;
      }

      .swatch-btn:hover {
        transform: scale(1.1);
      }

      .swatch-btn:focus-visible {
        outline: 2px solid var(--pv-accent, #6366F1);
        outline-offset: 2px;
        border-radius: 50%;
      }

      .swatch-btn:focus:not(:focus-visible) {
        outline: none;
      }

      /* The actual 32×32 colored circle */
      .swatch-circle {
        width: 32px;
        height: 32px;
        border-radius: 50%;
        position: relative;
        flex-shrink: 0;
        transition: box-shadow var(--pv-transition, 200ms ease);
      }

      /* Selected ring: 3px ring in swatch color */
      .swatch-btn[aria-pressed='true'] .swatch-circle {
        box-shadow:
          0 0 0 2px var(--pv-card-bg, #FFFFFF),
          0 0 0 5px var(--swatch-color);
      }

      /* White checkmark center dot when selected */
      .swatch-btn[aria-pressed='true'] .swatch-circle::after {
        content: '';
        position: absolute;
        inset: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        background-image: url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='3' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='20 6 9 17 4 12'/%3E%3C/svg%3E");
        background-repeat: no-repeat;
        background-position: center;
        background-size: 16px 16px;
        border-radius: 50%;
      }

      /* Custom swatch button: same sizing */
      .swatch-btn.custom-btn {
        border-radius: 8px;
      }

      .swatch-btn.custom-btn:focus-visible {
        border-radius: 8px;
      }

      .custom-circle {
        width: 32px;
        height: 32px;
        border-radius: 6px;
        border: 1.5px dashed var(--pv-border-subtle, #E5E7EB);
        background: var(--pv-card-bg, #FFFFFF);
        display: flex;
        align-items: center;
        justify-content: center;
        color: var(--pv-text-muted, #9CA3AF);
        font-size: 10px;
        font-weight: 600;
        line-height: 1;
        transition: border-color var(--pv-transition, 200ms ease),
                    color var(--pv-transition, 200ms ease);
        flex-shrink: 0;
        overflow: hidden;
      }

      .swatch-btn.custom-btn:hover .custom-circle {
        border-color: var(--pv-accent, #6366F1);
        color: var(--pv-accent-ink, var(--pv-accent, #6366F1));
      }

      /* When custom color is active, show the color instead of the placeholder */
      .custom-circle.has-color {
        border-style: solid;
        border-color: transparent;
      }

      /* Selected custom swatch ring */
      .swatch-btn.custom-btn[aria-pressed='true'] .custom-circle {
        box-shadow:
          0 0 0 2px var(--pv-card-bg, #FFFFFF),
          0 0 0 5px var(--swatch-color, var(--pv-accent, #6366F1));
      }

      /* Checkmark overlay for selected custom swatch */
      .swatch-btn.custom-btn[aria-pressed='true'] .custom-circle::after {
        content: '';
        position: absolute;
        inset: 0;
        background-image: url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='3' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='20 6 9 17 4 12'/%3E%3C/svg%3E");
        background-repeat: no-repeat;
        background-position: center;
        background-size: 16px 16px;
        border-radius: 6px;
      }

      .custom-circle.has-color {
        position: relative;
      }

      /* The hidden native color input */
      #custom-color-input {
        position: absolute;
        width: 0;
        height: 0;
        opacity: 0;
        pointer-events: none;
        border: none;
        padding: 0;
      }
    `],e([ue({type:String})],Hi.prototype,"value",void 0),e([ue({type:String})],Hi.prototype,"valueLight",void 0),e([me()],Hi.prototype,"_isCustom",void 0),e([ve("#custom-color-input")],Hi.prototype,"_colorInput",void 0),ge("pv-color-swatch-picker",Hi);const ji=new Set(["state","attributes"]);class qi extends le{constructor(){super(...arguments),this.household=null,this.layout="landscape",this.mode="settings",this._rows=[],this._dragIdx=null,this._dragOverIdx=null,this._built=!1}willUpdate(){if(!this._built&&this.hass&&this.data){const e=Object.keys(this.hass.states).filter(e=>e.startsWith("calendar."));this._rows=function(e,t,i,s){const a=[],n=new Set;for(const t of e){const e=s[a.length%s.length];n.add(t.entity_id),a.push({saved:Object.fromEntries(Object.entries(t).filter(([e])=>!ji.has(e))),entity_id:t.entity_id,display_name:t.display_name||t.entity_id,color:t.color||e.color,color_light:t.color_light||e.light,person_entity:t.person_entity||"",member_id:t.member_id??null,include:!0})}for(const e of t.filter(e=>!n.has(e)).sort()){const t=s[a.length%s.length];a.push({saved:null,entity_id:e,display_name:i(e)||e,color:t.color,color_light:t.light,person_entity:"",member_id:null,include:!1})}return a}(this.data.calendars,e,e=>this.hass.states[e]?.attributes?.friendly_name,Hi.PRESETS),this._built=!0}}_save(){var e;this.api.saveConfig({calendars:(e=this._rows,e.filter(e=>e.include).map(e=>({icon:"mdi:calendar",visible:!0,...e.saved??{},entity_id:e.entity_id,display_name:e.display_name,color:e.color,color_light:e.color_light,person_entity:e.person_entity,member_id:e.member_id})))}).catch(e=>this._error(e))}_error(e){this.dispatchEvent(new CustomEvent(Ci,{detail:{message:Si(fi(e))},bubbles:!0,composed:!0}))}get _personEntities(){return this.hass?Object.keys(this.hass.states).filter(e=>e.startsWith("person.")).sort():[]}_personLabel(e){return this._entityLabel(e)}_entityLabel(e){return this.hass?.states[e]?.attributes?.friendly_name||e}_updateCalendar(e,t,i=!0){const s=[...this._rows];s[e]={...s[e],...t},this._rows=s,i&&this._save()}_onCalendarColorChange(e,t){t.stopPropagation(),this._updateCalendar(e,{color:t.detail.color,color_light:t.detail.colorLight})}_renderCalendars(){return 0===this._rows.length?U`
        <div class="page-content">
          <p class="page-subtitle">No calendar entities found in Home Assistant.</p>
          <p class="empty-hint">Add calendar integrations (Google Calendar, CalDAV, etc.) and re-run setup.</p>
        </div>
      `:U`
      <div class="page-content">
        <div class="calendar-list">
          ${this._rows.map((e,t)=>this._renderCalendarRow(e,t))}
        </div>
      </div>
    `}_onDragStart(e,t){this._dragIdx=e,t.dataTransfer&&(t.dataTransfer.effectAllowed="move",t.dataTransfer.setData("text/plain",String(e)))}_onDragOver(e,t){t.preventDefault(),t.dataTransfer&&(t.dataTransfer.dropEffect="move"),this._dragOverIdx=e}_onDragLeave(){this._dragOverIdx=null}_onDrop(e,t){if(t.preventDefault(),null!==this._dragIdx&&this._dragIdx!==e){const t=[...this._rows],[i]=t.splice(this._dragIdx,1);t.splice(e,0,i),this._rows=t,this._save()}this._dragIdx=null,this._dragOverIdx=null}_onDragEnd(){this._dragIdx=null,this._dragOverIdx=null}_renderCalendarRow(e,t){const i=this._dragIdx===t,s=this._dragOverIdx===t&&this._dragIdx!==t;return U`
      <div class="cal-row ${i?"cal-row--dragging":""} ${s?"cal-row--dragover":""}"
        draggable="true"
        @dragstart=${e=>this._onDragStart(t,e)}
        @dragover=${e=>this._onDragOver(t,e)}
        @dragleave=${this._onDragLeave}
        @drop=${e=>this._onDrop(t,e)}
        @dragend=${this._onDragEnd}
      >
        <!-- Always-visible header: checkbox + calendar name -->
        <div class="cal-header">
          <div class="cal-drag-handle" aria-label="Drag to reorder">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
              <path d="M11 18c0 1.1-.9 2-2 2s-2-.9-2-2 .9-2 2-2 2 .9 2 2zm-2-8c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0-6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm6 4c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
            </svg>
          </div>
          <label class="cal-checkbox-wrap" title="${e.include?"Exclude this calendar":"Include this calendar"}">
            <input
              type="checkbox"
              class="cal-checkbox"
              .checked=${e.include}
              @change=${e=>this._updateCalendar(t,{include:e.target.checked})}
            />
            <span class="cal-checkbox-visual" aria-hidden="true">
              ${e.include?U`
                <svg viewBox="0 0 24 24" width="14" height="14">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" fill="currentColor"/>
                </svg>
              `:""}
            </span>
          </label>
          <div class="cal-header-info">
            <span class="cal-friendly-name">${e.display_name||e.entity_id}</span>
            <span class="cal-entity-id">${e.entity_id}</span>
          </div>
        </div>

        <!-- Expandable details: only shown when included -->
        ${e.include?U`
          <div class="cal-details">
            <!-- Display name input -->
            <div class="cal-field">
              <label class="pv-label" for="cal-name-${t}">Display Name</label>
              <input
                id="cal-name-${t}"
                type="text"
                class="pv-input cal-name-input"
                .value=${e.display_name}
                placeholder="Calendar name"
                @input=${e=>this._updateCalendar(t,{display_name:e.target.value},!1)}
                @change=${()=>this._save()}
              />
            </div>

            <!-- Color picker -->
            <div class="cal-field">
              <label class="pv-label">Color</label>
              <pv-color-swatch-picker
                .value=${e.color}
                .valueLight=${e.color_light}
                @color-change=${e=>this._onCalendarColorChange(t,e)}
              ></pv-color-swatch-picker>
            </div>

            <!-- Person entity link -->
            <div class="cal-field">
              <label class="pv-label" for="cal-person-${t}">Link to Person</label>
              <select
                id="cal-person-${t}"
                class="pv-input pv-select cal-person-select"
                .value=${e.person_entity}
                @change=${e=>this._updateCalendar(t,{person_entity:e.target.value})}
              >
                <option value="">(None)</option>
                ${this._personEntities.map(t=>U`
                  <option value="${t}" ?selected=${e.person_entity===t}>${this._personLabel(t)}</option>
                `)}
              </select>
            </div>

            ${this._renderBelongsTo(e,t)}
          </div>
        `:""}
      </div>
    `}_renderBelongsTo(e,t){if(!this.household?.available)return Y;const i=Pi(this.household.members),s=function(e,t){if(e.person_entity){const i=t.find(t=>t.person===e.person_entity);if(i)return{memberId:i.id,viaPerson:!0}}const i=t.some(t=>t.id===e.member_id)?e.member_id:null;return{memberId:i,viaPerson:!1}}(e,i);return U`
      <div class="cal-field">
        <label class="pv-label" for="cal-owner-${t}">Belongs to</label>
        <select
          id="cal-owner-${t}"
          class="pv-input pv-select cal-person-select"
          .value=${s.memberId??""}
          ?disabled=${s.viaPerson}
          @change=${e=>this._updateCalendar(t,{member_id:e.target.value||null})}
        >
          <option value="">Nobody</option>
          ${i.map(e=>U`
            <option value="${e.id}" ?selected=${s.memberId===e.id}>${e.name}</option>
          `)}
        </select>
        ${s.viaPerson?U`
          <p class="cal-owner-hint">Through ${this._personLabel(e.person_entity)}'s Home Assistant person.</p>
        `:Y}
      </div>
    `}render(){return this._built?this._renderCalendars():Y}}function Ui(e,t){const i=e.initialView?.(t);return e.views.some(e=>e.id===i)?i:e.views[0]?.id??""}function Vi(e,t){return e.order-t.order||e.id.localeCompare(t.id)}qi.styles=[nt,ot,ct,ht,bi,r`
.empty-hint {
        font-size: 0.875rem;
        color: var(--pv-text-muted, #9CA3AF);
        margin: 0.5rem 0 0;
      }
/* ── Calendar list (page 1) ─────────────────────────────── */
.calendar-list {
        display: flex;
        flex-direction: column;
        gap: 0.625rem;
      }
.cal-row {
        display: flex;
        flex-direction: column;
        padding: 0.875rem 1rem;
        border: 1px solid var(--pv-border-subtle, #E5E7EB);
        border-radius: var(--pv-radius, 12px);
        background: var(--pv-card-bg, #FFFFFF);
        transition: border-color var(--pv-transition, 200ms ease), box-shadow var(--pv-transition, 200ms ease), opacity var(--pv-transition, 200ms ease);
      }
.cal-row:has(.cal-checkbox:checked) {
        border-color: var(--pv-accent, #6366F1);
      }
/* Always-visible header row */
.cal-header {
        display: flex;
        align-items: center;
        gap: 0.75rem;
      }
.cal-drag-handle {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 24px;
        height: 24px;
        flex-shrink: 0;
        cursor: grab;
        color: var(--pv-text-muted, #9CA3AF);
        border-radius: 4px;
        transition: color var(--pv-transition, 200ms ease);
      }
.cal-drag-handle:hover {
        color: var(--pv-text-secondary, #6B7280);
      }
.cal-drag-handle:active {
        cursor: grabbing;
      }
.cal-row--dragging {
        opacity: 0.4;
      }
.cal-row--dragover {
        border-color: var(--pv-accent, #6366F1);
        box-shadow: 0 0 0 2px color-mix(in srgb, var(--pv-accent, #6366F1) 20%, transparent);
      }
.cal-header-info {
        display: flex;
        flex-direction: column;
        gap: 1px;
        min-width: 0;
        flex: 1;
      }
.cal-friendly-name {
        font-size: 0.9375rem;
        font-weight: 500;
        color: var(--pv-text, #1A1B1E);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
.cal-entity-id {
        font-size: 0.6875rem;
        color: var(--pv-text-muted, #9CA3AF);
        font-family: monospace;
        letter-spacing: 0.01em;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
/* Custom checkbox */
.cal-checkbox-wrap {
        display: flex;
        align-items: center;
        cursor: pointer;
        flex-shrink: 0;
      }
.cal-checkbox {
        position: absolute;
        opacity: 0;
        width: 0;
        height: 0;
        pointer-events: none;
      }
.cal-checkbox-visual {
        width: 20px;
        height: 20px;
        border-radius: 4px;
        border: 2px solid var(--pv-border-subtle, #E5E7EB);
        background: var(--pv-card-bg, #FFFFFF);
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        transition: all var(--pv-transition, 200ms ease);
        color: var(--pv-accent-text, #FFFFFF);
      }
.cal-checkbox:checked + .cal-checkbox-visual {
        background: var(--pv-accent, #6366F1);
        border-color: var(--pv-accent, #6366F1);
      }
.cal-checkbox-wrap:hover .cal-checkbox-visual {
        border-color: var(--pv-accent, #6366F1);
      }
/* Expanded details (only shown when included) */
.cal-details {
        display: flex;
        flex-direction: column;
        gap: 0.875rem;
        margin-top: 0.875rem;
        padding-top: 0.875rem;
        border-top: 1px solid var(--pv-border-subtle, #E5E7EB);
        animation: pv-fadeIn 200ms ease forwards;
      }
.cal-field {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
      }
.cal-name-input {
        font-size: 0.9375rem;
      }
.cal-person-select {
        font-size: 0.875rem;
      }
.cal-owner-hint {
        margin: 0.375rem 0 0;
        font-size: 0.8125rem;
        color: var(--pv-text-secondary, #6B7280);
      }
    `],e([ue({attribute:!1})],qi.prototype,"hass",void 0),e([ue({attribute:!1})],qi.prototype,"data",void 0),e([ue({attribute:!1})],qi.prototype,"household",void 0),e([ue({attribute:!1})],qi.prototype,"api",void 0),e([ue({attribute:!1})],qi.prototype,"layout",void 0),e([ue({type:String})],qi.prototype,"mode",void 0),e([me()],qi.prototype,"_rows",void 0),e([me()],qi.prototype,"_dragIdx",void 0),e([me()],qi.prototype,"_dragOverIdx",void 0),ge("pv-calendar-calendars-page",qi);const Wi=new class{constructor(){this._modules=new Map}register(e){this._modules.set(e.id,e)}get(e){return this._modules.get(e)}list(){return[...this._modules.values()].sort(Vi)}};class Yi{constructor(){this._pages=new Map}register(e){this._pages.set(e.id,e)}pages(e){return[...this._pages.values()].filter(t=>!t.applies||t.applies(e)).sort((e,t)=>e.order-t.order||e.id.localeCompare(t.id))}}const Ki=[{id:"people",label:null,order:100},{id:"chores",label:"Chores",order:200},{id:"calendar",label:"Calendar",order:300},{id:"appearance",label:null,order:400},{id:"security",label:null,order:500},{id:"data",label:null,order:600},{id:"about",label:null,order:900}],Xi=new Yi,Gi=new Yi,Ji={id:"calendar",label:"Calendar",icon:"mdi:calendar-month",tag:"pv-calendar-module",order:10,views:[{id:"day",label:"Day"},{id:"week",label:"Week"},{id:"month",label:"Month"},{id:"agenda",label:"Agenda"}],initialView:({config:e,data:t})=>function(e,t){return e?.view||e?.default_view||t?.display?.default_view||void 0}(e,t),watchedEntities:({config:e,data:t})=>Mt(t,e).map(e=>e.person_entity).filter(e=>!!e)},Qi={day:"Day",week:"Week",month:"Month",agenda:"Agenda"},Zi=[{id:"calendars",label:"Calendars",group:"calendar",order:300,tag:"pv-calendar-calendars-page",summary:({data:e})=>{const t=e.calendars?.length??0;return 0===t?"None yet":`${t} ${1===t?"calendar":"calendars"}`}},{id:"calendar-options",label:"Calendar options",group:"calendar",order:310,tag:"pv-calendar-options-page",summary:({data:e})=>`${Qi[e.display?.default_view??"week"]??"Week"} · ${"24h"===e.display?.time_format?"24-hour":"12-hour"}`}],es=[{id:"calendars",label:"Calendars",order:200,tag:"pv-calendar-calendars-page",heading:"Calendars",lead:"Choose the calendars to show, and who each one belongs to."}];function ts(e){return"shared"===e.account.kind||"other"===e.account.kind}function is(e,t,i){if(!e||!e.available)return"no";const s=e.account;if(s.parent_level)return"yes";if("member"===s.kind)return s.member_id===i?"yes":"no";if(!ts(e))return"no";if(t&&(t.parent||t.memberId===i))return"yes";const a=e.members.find(e=>e.id===i);return a?a.has_pin?"pin":"yes":"no"}function ss(e,t){return e&&e.available?e.account.parent_level?"yes":ts(e)?t?.parent?"yes":Ri(e.members).length>0?"pin":"no_pin":"no":"no"}!function(e=Wi){e.register(Ji)}(),function(e=Xi,t=Gi){for(const t of Zi)e.register(t);for(const e of es)t.register(e)}();const as=r`
  :host {
    --pv-chores-gap: 12px;
    font-family: var(--pv-font-family, system-ui, sans-serif);
    color: var(--pv-text, #1A1B1E);
  }

  .heading {
    font-family: var(--pv-font-heading, ui-rounded, 'SF Pro Rounded', 'PlanaVista Rounded', system-ui, sans-serif);
    font-weight: 800;
    letter-spacing: 0.1px;
  }

  .num {
    font-family: var(--pv-font-heading, ui-rounded, 'SF Pro Rounded', 'PlanaVista Rounded', system-ui, sans-serif);
    font-variant-numeric: tabular-nums;
  }

  /* Status badges: words always, color confirms (spec 11.3). */
  .badge {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    flex-shrink: 0;
    max-width: 100%;
    padding: 3px 8px;
    border-radius: 8px;
    font-size: 0.8125rem;
    font-weight: 700;
    line-height: 1.2;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    background: var(--pv-chip, #F1F1EE);
    color: var(--pv-text-secondary, #5F6670);
  }

  .badge.act {
    background: var(--pv-accent-tint, #EEEEFC);
    color: var(--pv-accent-tint-ink, #3B3BB0);
  }

  .badge.time {
    background: var(--pv-warn-bg, #FDF1DC);
    color: var(--pv-warn-ink, #8A5A00);
  }

  .badge.bad {
    background: var(--pv-bad-bg, #FBE4E4);
    color: var(--pv-bad-ink, #A12828);
  }

  .badge.muted {
    background: transparent;
    color: var(--pv-text-muted, #8E949C);
    padding-left: 0;
    padding-right: 0;
  }

  .section-head {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 8px;
    margin: 14px 4px 6px;
    font-size: 0.8125rem;
    font-weight: 700;
    color: var(--pv-text-muted, #8E949C);
  }

  .section-head .right {
    font-weight: 700;
  }

  .meta {
    color: var(--pv-text-secondary, #5F6670);
    font-size: 0.875rem;
    font-variant-numeric: tabular-nums;
    white-space: nowrap;
  }

  /* Designed states (spec 13.1). */
  .state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 8px;
    min-height: 260px;
    padding: 32px 24px;
    text-align: center;
  }

  .state .art {
    font-size: 40px;
    line-height: 1;
  }

  .state h2 {
    margin: 6px 0 0;
    font-family: var(--pv-font-heading, ui-rounded, 'SF Pro Rounded', 'PlanaVista Rounded', system-ui, sans-serif);
    font-size: 1.25rem;
    font-weight: 800;
  }

  .state p {
    margin: 0;
    max-width: 420px;
    color: var(--pv-text-secondary, #5F6670);
    line-height: 1.5;
  }

  .state .buttons {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
    justify-content: center;
    margin-top: 10px;
  }

  .banner {
    display: flex;
    align-items: center;
    gap: 10px;
    margin: 10px 12px 0;
    padding: 8px 8px 8px 14px;
    border-radius: 12px;
    background: var(--pv-warn-bg, #FDF1DC);
    color: var(--pv-warn-ink, #8A5A00);
    font-size: 0.9375rem;
  }

  .banner.info {
    background: var(--pv-accent-tint, #EEEEFC);
    color: var(--pv-accent-tint-ink, #3B3BB0);
  }

  .banner .text {
    flex: 1 1 auto;
  }

  .banner button {
    min-height: 40px;
  }

  /* Skeletons stay neutral: a tint of the text color, never a brand fill (spec 11.6). */
  .bone {
    background: color-mix(in srgb, var(--pv-text, #1A1B1E) 7%, transparent);
    border-radius: 8px;
  }

  .bone.round {
    border-radius: 50%;
  }

  @media (prefers-reduced-motion: no-preference) {
    .bone {
      animation: pv-bone 1.6s ease-in-out infinite;
    }
  }

  @keyframes pv-bone {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.55; }
  }

  .sr {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip: rect(0 0 0 0);
    white-space: nowrap;
  }
`,ns=["Sun","Mon","Tue","Wed","Thu","Fri","Sat"],rs=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];function os(e){const[t,i,s]=e.split("-").map(Number);return new Date(t,i-1,s,12)}function ds(e,t){return Math.round((os(t).getTime()-os(e).getTime())/864e5)}function ls(e,t){const i=os(e);return Math.abs(ds(t,e))<=6?ns[i.getDay()]:`${rs[i.getMonth()]} ${i.getDate()}`}function cs(e,t){switch(e.status){case"done":return null;case"pending":return{words:"Waiting for OK",tone:"act",glyph:"⏳"};case"sent_back":return{words:e.note?`Sent back: ${e.note}`:"Sent back",tone:"bad",glyph:"↩"};case"excused":return{words:"Excused",tone:"muted"};case"away":return{words:"Away",tone:"neutral",glyph:"🧳"}}if(e.overdue_since)return{words:`Overdue since ${ls(e.overdue_since,t.today)}`,tone:"bad",glyph:"•"};if(e.from)return{words:`From ${ls(e.from,t.today)}`,tone:"neutral"};if(e.dated&&e.due_day)return e.due_day===t.today?{words:"Due today",tone:"time"}:{words:`Due ${ls(e.due_day,t.today)}`,tone:"neutral"};if("week"===e.section&&"week"===e.window&&t.remaining>0){if(t.daysLeft<=1)return{words:"Last day",tone:"bad",glyph:"•"};if(t.remaining>=t.daysLeft)return{words:`${t.daysLeft} days left`,tone:"time",glyph:"•"}}return null}function ps(e,t){switch(e){case"done":return{words:"Done",tone:"neutral",glyph:"✓"};case"pending":return{words:"Waiting for OK",tone:"act",glyph:"⏳"};case"missed":return{words:"Missed",tone:"bad",glyph:"×"};case"carried":return{words:"Carried over",tone:"time",glyph:"•"};case"excused":return{words:t?`Excused: ${t}`:"Excused",tone:"muted"};default:return{words:e,tone:"neutral"}}}function hs(e){const t=Math.round(e);if(t<60)return`${Math.max(1,t)} min`;const i=t/60;return Number.isInteger(i)?`${i} h`:Number.isInteger(2*i)?`${i.toFixed(1)} h`:`${Math.floor(i)} h ${t%60} min`}function us(e,t,i){return 0===i?`${e}, nothing due today`:t>=i?`${e}, ring closed for today`:`${e}, ${t} of ${i} done today`}function ms(e,t="12h",i=!1){const s=String(e.getMinutes()).padStart(2,"0");if("24h"===t)return`${e.getHours()}:${s}`;const a=e.getHours()%12||12;return i?`${a}:${s} ${e.getHours()>=12?"PM":"AM"}`:`${a}:${s}`}function vs(e,t,i){if(!e)return[];const s=new Map((e.calendars??[]).map(e=>[e.entity_id,e.member_id??null])),a=[];for(const n of e.events??[]){if(!n.start||_e(n.start))continue;const e=xe(n.start),r=n.end?xe(n.end):e;r<=t||e>=i||a.push({title:n.summary||"Busy",start:e,end:r,calendar:n.calendar_entity_id,member:s.get(n.calendar_entity_id)??null})}return a.sort((e,t)=>e.start.getTime()-t.start.getTime())}const gs=["morning","afternoon","evening"],bs={morning:"Morning",afternoon:"Afternoon",evening:"Evening"},ys=new Set(["open","sent_back"]);function fs(e,t){const i=e.completion?.at;if(!i)return!1;const s=new Date(i).getTime();return s>=new Date(t.day.start).getTime()&&s<new Date(t.day.end).getTime()}function _s(e,t){return e.band??t}function xs(e,t){const i=gs.indexOf(e),s=gs.indexOf(t);return i<s?"past":i===s?"now":"later"}function ws(e,t,i,s,a={}){const n=t.activities.get(e.chore),r=a.group?a.group.total-a.group.done:1,o={today:t.today,daysLeft:i.week.days_left,remaining:r};let d,l;if(e.completion&&("done"===e.status||"pending"===e.status)){d=ms(new Date(e.completion.at),t.timeFormat);const i=e.completion.done_by;l=i&&i!==e.member?t.members.find(e=>e.id===i)?.name??i:null}const c="month"===e.window?"this month":function(e,t){const i=hs(e.credit_minutes);return t&&e.stars>0?`${i} · ★ ${e.stars}`:i}(e,s);return{key:e.key,item:e,name:e.name,icon:e.icon,label:n?.label??null,badge:cs(e,o),meta:c,state:e.status,doneAt:d,doneBy:l,...a}}function $s(e){return"overdue"===e.section?null:function(e){return"week"===e.section&&"week"===e.window&&!e.planned&&!e.from&&!e.dated}(e)||"once"===e.window&&"once"===e.period?`${e.section}|${e.chore}|${e.period}`:null}function ks(e,t){return t.members.filter(t=>e.members[t.id]).map(i=>function(e,t,i,s){const a=i.band,n=!!e.stars,r=[],o=t.items,d=[],l={morning:[],afternoon:[],evening:[]},c={morning:0,afternoon:0,evening:0},p=[],h=[],u=new Map,m=[];for(const e of o){const t=$s(e);if(t)u.set(t,[...u.get(t)??[],e]);else if("overdue"!==e.section){if("today"===e.section){const t=_s(e,a);if("done"===e.status){"past"===xs(t,a)?(c[t]+=1,m.push(ws(e,s,i,n))):d.push(ws(e,s,i,n));continue}if("excused"===e.status||"away"===e.status)continue;l[t].push(ws(e,s,i,n));continue}"done"!==e.status?"excused"!==e.status&&"away"!==e.status&&h.push(ws(e,s,i,n)):fs(e,i)&&d.push(ws(e,s,i,n))}else ys.has(e.status)||"pending"===e.status?p.push(ws(e,s,i,n)):"done"===e.status&&fs(e,i)&&d.push(ws(e,s,i,n))}for(const[,e]of u){const t=e.filter(e=>"excused"!==e.status&&"away"!==e.status),r=t.length,o=t.filter(e=>"done"===e.status||"pending"===e.status).length,p="today"===e[0].section;for(const e of t){if("done"!==e.status||!fs(e,i))continue;const t=_s(e,a);p&&"past"===xs(t,a)?(c[t]+=1,m.push(ws(e,s,i,n))):d.push(ws(e,s,i,n))}const u=t.find(e=>ys.has(e.status))??t.find(e=>"pending"===e.status);if(!u)continue;const v={done:o,total:r},g=hs(t.reduce((e,t)=>e+t.credit_minutes,0)),b=ws(u,s,i,n,{group:v});b.meta=r>1||"week"===u.window?`${g} · ${o} of ${r}`:b.meta,p?l[_s(u,a)].push(b):h.push(b)}if(p.length){r.push({kind:"head",key:"head:overdue",text:"Overdue",tone:"plain"});for(const e of p)r.push({kind:"row",key:e.key,row:e,zone:"overdue"})}const v=[];for(const e of gs){const t=xs(e,a),i=l[e];if("past"===t){if(0===i.length){c[e]>0&&v.push({kind:"credit",key:`credit:${e}`,text:`${bs[e]} · ${c[e]} done`});continue}const t=i.filter(e=>ys.has(e.state)).length,s=i.length-t,a=[t?`${t} left`:"",s?`${s} waiting for OK`:"",c[e]?`${c[e]} done`:""].filter(Boolean);r.push({kind:"head",key:`head:${e}`,tone:"past",text:`${bs[e]} · ${a.join(", ")}`})}else{if(0===i.length)continue;r.push({kind:"head",key:`head:${e}`,tone:t,text:`${"now"===t?"Now":"Later"} · ${bs[e].toLowerCase()}`})}for(const e of i)r.push({kind:"row",key:e.key,row:e,zone:t})}if(h.length){const e=i.week.days_left;r.push({kind:"head",key:"head:week",text:"This week",right:1===e?"Last day":`${e} days left`,tone:"plain"});for(const e of h)r.push({kind:"row",key:e.key,row:e,zone:"week"})}if(d.length){r.push({kind:"head",key:"head:done",text:"Done today",tone:"plain"});for(const e of d)r.push({kind:"row",key:e.key,row:e,zone:"done"})}r.push(...v);const{due:g,done:b,pending:y}=t.today,f=b+y,_=g>0&&f>=g,x=[{kind:"count",text:g>0?`${Math.min(f,g)} of ${g} today`:"Nothing due today"}];n&&x.push({kind:"stars",text:`★ ${t.stars}`}),t.streak>=2&&x.push({kind:"streak",text:`🔥 ${t.streak} days`});const w=function(e,t,i){const s=function(e,t){return e.filter(e=>e.member===t)}(e,t),a=s.find(e=>e.start>i);return a?{event:a,freeUntil:!s.some(e=>e.start<=i&&e.end>i)&&a.start.getTime()-i.getTime()>=36e5}:null}(s.events,e.id,s.now),$=w?`Next on calendar: ${w.event.title} at ${ms(w.event.start,s.timeFormat)}${w.freeUntil?" · free until then":""}`:null,k=o.filter(e=>e.counted&&ys.has(e.status)&&"week"!==e.section).length;return{member:e,entry:t,ring:{progress:g>0?Math.min(1,f/g):0,closed:_,label:us(e.name,Math.min(f,g),g)},line:x.map(e=>e.text).join(" · "),parts:x,next:$,away:t.away?{note:t.away.note??null}:null,pictures:"young_child"===e.age_group,entries:r,doneToday:[...m,...d].sort((e,t)=>(e.item.completion?.at??"").localeCompare(t.item.completion?.at??"")),left:k,empty:0===o.length}}(i,e.members[i.id],e,t))}function Fs(e,t,i){const s=t.settings.evening_check;if(!s)return null;const[a,n]=s.split(":").map(Number),r=new Date(t.day.start),o=new Date(r.getFullYear(),r.getMonth(),r.getDate(),a,n);if(o<r&&o.setDate(o.getDate()+1),i<o||i>=new Date(t.day.end))return null;const d=e.filter(e=>e.left>0&&!e.away);if(0===d.length)return null;const l=d.map((e,t)=>0===t?`${e.member.name} has ${e.left} ${1===e.left?"chore":"chores"} left`:`${e.member.name} has ${e.left}`);return{text:`Evening check: ${1===l.length?l[0]:`${l.slice(0,-1).join(", ")} and ${l[l.length-1]}`}`,members:d.map(e=>e.member.id)}}const Es=[[/\b(trash|garbage|bins?|recycling)\b/i,"🗑️"],[/\b(dish(es)?|dishwasher)\b/i,"🍽️"],[/\b(laundry|clothes|fold)\b/i,"🧺"],[/\bbeds?\b/i,"🛏️"],[/\btoys?\b/i,"🧸"],[/\bfish\b/i,"🐠"],[/\bcats?\b/i,"🐱"],[/\b(dogs?|walk the dog)\b/i,"🐕"],[/\b(pets?|feed)\b/i,"🐾"],[/\btable\b/i,"🍴"],[/\b(vacuum|sweep|mop|floors?)\b/i,"🧹"],[/\b(bath(room)?|toilet|shower|tub)\b/i,"🛁"],[/\b(leaf|leaves|rake)\b/i,"🍂"],[/\b(yard|garden|lawn|weeds?|mow)\b/i,"🌿"],[/\b(grocer(y|ies)|shopping|shop)\b/i,"🛒"],[/\b(plants?|flowers?)\b/i,"🪴"],[/\bcar\b/i,"🚗"],[/\b(garage|boxes|closet|attic|basement)\b/i,"📦"],[/\b(cook|dinner|lunch|breakfast|meal)\b/i,"🍳"],[/\b(homework|study|reading|read)\b/i,"📚"],[/\b(teeth|toothbrush)\b/i,"🪥"],[/\b(fix|repair|latch)\b/i,"🔨"],[/\bfilters?\b/i,"🔧"],[/\b(budget|bills?|finance|money)\b/i,"💵"],[/\b(windows?|dust|tidy|clean)\b/i,"✨"],[/\b(swim(ming)?|pool)\b/i,"🏊"],[/\b(soccer|football)\b/i,"⚽"],[/\bbasketball\b/i,"🏀"],[/\bbaseball\b/i,"⚾"],[/\b(school|class)\b/i,"🏫"],[/\bdentist\b/i,"🦷"],[/\b(doctor|checkup)\b/i,"🩺"],[/\b(piano|music|guitar|violin|band)\b/i,"🎹"],[/\b(dance|ballet)\b/i,"🩰"],[/\b(birthday|party)\b/i,"🎉"],[/\bpizza\b/i,"🍕"],[/\bmovies?\b/i,"🎬"],[/\b(practice|game|match|training)\b/i,"🏅"],[/\b(meeting|work|standup)\b/i,"💼"],[/\b(trip|travel|flight)\b/i,"🧳"],[/\b(bus)\b/i,"🚌"],[/\b(drop-off|pick-?up)\b/i,"🚗"],[/\b(church|temple|mosque)\b/i,"⛪"],[/\b(study group|tutor)\b/i,"📚"]];function Cs(e,t="⭐"){for(const[t,i]of Es)if(t.test(e))return i;return t}const Ss={morning:0,afternoon:12,evening:17};function Ds(e){const t=e.getHours();return t<12?"morning":t<17?"afternoon":"evening"}function As(e,t){return`${ms(e.start,t,"12h"===t)} to ${ms(e.end,t,"12h"===t)}`}function zs(e,t){const i=[];let s=0;for(const a of t){if("open"!==a.state&&"sent_back"!==a.state)continue;const t=a.item.credit_minutes;if(!(null!==e&&s+t>e)&&(s+=t,i.push(a.name),3===i.length))break}return i}function Ms(e,t,i){const s="string"==typeof e.goal?e.goal:null,a=s?i.find(e=>e.id===s):void 0;if(!a)return null;const n=t.stars;return{reward:a,have:n,need:Math.max(0,a.cost-n),progress:a.cost>0?Math.min(1,n/a.cost):1}}const Ts=["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"],Bs=["Sun","Mon","Tue","Wed","Thu","Fri","Sat"],Ps=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"],Os=["sun","mon","tue","wed","thu","fri","sat"];function Rs(e,t){const i=os(e);i.setDate(i.getDate()+t);const s=e=>String(e).padStart(2,"0");return`${i.getFullYear()}-${s(i.getMonth()+1)}-${s(i.getDate())}`}function Is(e,t){const i=ds(t,e),s=os(e);return 0===i?"Today":1===i?"Tomorrow":i>1&&i<=6?Bs[s.getDay()]:i>=7&&i<=13?`Next ${Bs[s.getDay()]}`:`${Ps[s.getMonth()]} ${s.getDate()}`}function Ls(e,t){const i=ds(t,e),s=os(e);return 0===i?"today":1===i?"tomorrow":Math.abs(i)<=6?Ts[s.getDay()]:`${["January","February","March","April","May","June","July","August","September","October","November","December"][s.getMonth()]} ${s.getDate()}`}function Ns(e){const t=e.map(e=>Bs[Os.indexOf(e)]??e);return t.length<=1?t.join(""):`${t.slice(0,-1).join(", ")} and ${t[t.length-1]}`}function Hs(e,t,i){if(!e)return"";if("plan"===e.schedule){const t=e.days??[];return"day"===e.minimum?.per?t.length?Ns(t):"Every day":t.length?Ns(t):"Every week"}if("once"===e.schedule){const s=e.once;return s?.on?`Once · on ${Ls(s.on,i)}`:t.dated&&t.due_day?`Once · by ${Ls(t.due_day,i)}`:"Once · any time"}const s=e.repeats?.rrule??"";return s.includes("FREQ=DAILY")?"Repeats daily":s.includes("FREQ=MONTHLY")?"Repeats monthly":"Repeats weekly"}function js(e,t){const i=e.due_day&&ds(t,e.due_day)>=0?e.due_day:t;return(e.due_day?[Rs(i,1),Rs(i,7)]:[Rs(t,1),Rs(t,7)]).map(e=>({day:e,label:Is(e,t)}))}function qs(e,t){const i=e.due_day&&ds(t,e.due_day)>=0?e.due_day:t;return[Rs(i,1),Rs(i,2),Rs(i,7)].map(e=>({day:e,label:Is(e,t)}))}function Us(e){const t=e.map(e=>e.name);return t.length<=1?t.join(""):`${t.slice(0,-1).join(", ")} and ${t[t.length-1]}`}function Vs(e,t,i){const s=e?.created;if(!s?.at)return null;const a=t.find(e=>e.id===s.by)?.name??("automation"===s.by?"an automation":"admin"===s.by?"an admin":null),n=s.at.slice(0,10),r=0===ds(n,i)?"today":`on ${Ls(n,i)}`;return a?`Added by ${a} ${r}`:`Added ${r}`}function Ws(e){const{item:t,activity:i,owner:s,members:a,today:n}=e,r=a.filter(e=>e.parent&&e.id!==s.id),o=s.parent,d="pin"===e.member?`🔒 ${s.name}'s PIN`:void 0,l="pin"===e.parent?"🔒 parent":"no_pin"===e.parent?"needs a parent's PIN":void 0,c=t.status,p="open"===c||"sent_back"===c,h=[],u=[],m=t.due_day,v="no"!==e.member;if(p&&v){const e=function(e,t){if(!e.due_day||"day"===e.window)return[];const i=Math.min(ds(t,e.due_day),6),s=[];for(let e=1;e<=i;e++){const i=Rs(t,e);s.push({day:i,label:Is(i,t)})}return s}(t,n);e.length&&h.push({id:"plan_day",label:"Plan it for a day",tag:d,chips:e,hint:m?`Shows on that day, and it's still due ${Ls(m,n)}.`:"Shows on that day."}),o||!m||t.request||(h.push({id:"more_time",label:"Ask for more time",tag:"needs OK",chips:qs(t,n),pick:{min:Rs(m,1),max:Rs(n,60)},hint:r.length?`Sends a request to ${Us(r)}.`:"Sends a request to the parents."}),h.push({id:"skip",label:"Ask to skip this week",tag:"needs OK",hint:"Sick, away, rained out…"})),h.push({id:"done_by",label:"Done by someone else…",tag:d,hint:"They get the credit."})}"done"!==c&&"pending"!==c||!v||(h.push({id:"undo",label:"Uncheck it",tag:d,hint:"It goes back on the list."}),"done"===c&&h.push({id:"done_by",label:"Done by someone else…",tag:d,hint:"Change who gets the credit."})),h.push({id:"history",label:"History",hint:"The streak, recent check-offs, and when it usually gets done."}),"no"!==e.parent&&("pending"===c&&(u.push({id:"approve",label:"Looks good",tag:l,hint:"Approves it, and the stars are earned."}),u.push({id:"send_back",label:"Send back",tag:l,hint:"It goes back on the list with a note."})),p&&(u.push({id:"change_due",label:"Change the due date",tag:l,chips:js(t,n),pick:{min:n},hint:m?`Due ${Ls(m,n)} now.`:"It has no due date now."}),u.push({id:"hand_off",label:"Hand it to someone else",tag:l,hint:"Just this time."}),u.push({id:"excuse",label:"Excuse it",tag:l,hint:"A sick day: nothing is missed, and the streak holds."})),u.push({id:"delete",label:"Delete the chore",tag:l,destructive:!0,hint:"It leaves the board for everyone."}));const g="once"===t.window&&i?.once?i.once.estimate_minutes:t.credit_minutes,b=[s.name,Hs(i,t,n),hs(g)];s.stars&&t.stars>0&&b.push(`★ ${t.stars}`);const y=t.request?"more_time"===t.request.kind&&t.request.until?`Waiting for a parent: more time, until ${Ls(t.request.until,n)}.`:"Waiting for a parent: skip this week.":null;return{title:t.name,meta:b.filter(Boolean).join(" · "),added:Vs(i,a,n),note:"sent_back"===c?t.note?`Sent back: ${t.note}`:"Sent back":y,member:h,parent:u}}const Ys={morning:"in the morning",afternoon:"in the afternoon",evening:"in the evening"},Ks={mon:"Mondays",tue:"Tuesdays",wed:"Wednesdays",thu:"Thursdays",fri:"Fridays",sat:"Saturdays",sun:"Sundays"};function Xs(e,t,i,s){const a=[];e.streak.days&&a.push(`🔥 ${e.streak.days} ${1===e.streak.days?"day":"days"} in a row`),e.streak.weeks&&a.push(`🔥 ${e.streak.weeks} ${1===e.streak.weeks?"week":"weeks"} in a row`),e.weeks.of>0&&void 0===e.streak.days&&a.push(`Done ${e.weeks.done} of the last ${e.weeks.of} ${1===e.weeks.of?"week":"weeks"}`);const n=e.recent[0];if(n){const r=new Date(n.at),o=n.at.slice(0,10),d="24h"===s?`${r.getHours()}:${String(r.getMinutes()).padStart(2,"0")}`:`${r.getHours()%12||12}:${String(r.getMinutes()).padStart(2,"0")} ${r.getHours()>=12?"PM":"AM"}`,l=n.done_by!==e.member?i.find(e=>e.id===n.done_by)?.name:null;a.push(`Last done ${Ls(o,t)} at ${d}${l?` by ${l}`:""}`)}else a.push("Not done yet");const{band:r,day:o}=e.usual;return o&&r?a.push(`Usually ${Ks[o]} ${Ys[r]}`):r&&a.push(`Usually ${Ys[r]}`),a}const Gs=["Sun","Mon","Tue","Wed","Thu","Fri","Sat"],Js=["January","February","March","April","May","June","July","August","September","October","November","December"];function Qs(e){const t=os(e.week.start);return`Week of ${Js[t.getMonth()]} ${t.getDate()}`}function Zs(e){const t={date:e.date,kind:e.kind,away:e.away,dashed:"future"===e.kind};if(e.away)return{...t,label:"Away",tone:"muted",progress:0,closed:!1,empty:!1};const i=e.due??0,s=(e.done??0)+(e.pending??0);return"future"===e.kind?{...t,label:i?`${i} due`:"",tone:"muted",progress:0,closed:!1,empty:!i}:null===e.due?{...t,label:"",tone:"muted",progress:0,closed:!1,empty:!0}:0===i?{...t,label:"Nothing due",tone:"muted",progress:0,closed:!1,empty:!0}:"past"===e.kind&&e.missed>0?{...t,label:`${e.missed} missed`,tone:"bad",progress:Math.min(1,s/i),closed:!1,empty:!1}:{...t,label:`${Math.min(s,i)} of ${i}`,tone:"plain",progress:Math.min(1,s/i),closed:!!e.closed||s>=i,empty:!1}}function ea(e,t,i){if(0===e.length)return null;const s=e.reduce((e,t)=>e+t.total,0),a=e.reduce((e,t)=>e+t.done,0),n=e.reduce((e,t)=>e+t.pending,0),r=e.filter(e=>e.from&&e.from<i).sort((e,t)=>(e.from??"").localeCompare(t.from??""))[0];let o=null,d="neutral";return r?.from?(o=`${r.name} from ${Gs[os(r.from).getDay()]}`,d="time"):n?(o=`⏳ ${n} waiting`,d="act"):a+n<s&&(o=1===t?"Last day":`${t} days left`),{text:`${a+n} of ${s}`,badge:o,badgeTone:d,progress:s?(a+n)/s:0}}const ta=["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];function ia(e){const t=e.map(e=>ta[os(e).getDay()]);return t.length<=1?t.join(""):`${t.slice(0,-1).join(", ")} and ${t[t.length-1]}`}function sa(e,t){return e.rewards.map(i=>{const s=new Set(e.requests.filter(e=>"redemption"===e.kind&&e.reward===i.id).map(e=>e.member)),a=function(e,t){const i=t.filter(e=>e.stars);return e.who.length?i.filter(t=>e.who.includes(t.id)):i}(i,t).map(t=>{const a=e.members[t.id]?.stars??0;return{member:t,afford:a>=i.cost,more:Math.max(0,i.cost-a),asked:s.has(t.id)}});return{reward:i,people:a,goals:t.filter(e=>e.goal===i.id),asked:t.filter(e=>s.has(e.id)),canRedeem:a.some(e=>e.afford&&!e.asked)}})}function aa(e){return e?{name:e.name,icon:e.icon??"🎁",cost:e.cost,needsOk:e.needs_ok,who:[...e.who]}:{name:"",icon:"🎁",cost:20,needsOk:!0,who:[]}}function na(e){return e.name.trim()?!Number.isInteger(e.cost)||e.cost<1||e.cost>1e4?"A reward costs from 1 to 10,000 stars.":null:"Add a name."}const ra=["🎁","🎬","🎮","🍦","🍕","📱","🌙","💵","🧸","🎨","⚽","🏊","🎟️","🍪"],oa=new Set(["open","sent_back"]),da=new Set(["done","pending"]);function la(e){const t={due:0,done:0,pending:0,minutes_due:0,minutes_done:0,minutes_pending:0};for(const i of e)i.counted&&"away"!==i.status&&"excused"!==i.status&&(t.due+=1,t.minutes_due+=i.credit_minutes,"done"===i.status?(t.done+=1,t.minutes_done+=i.credit_minutes):"pending"===i.status&&(t.pending+=1,t.minutes_pending+=i.credit_minutes));return t}function ca(e){const t=new Date(e),i=e=>String(Math.abs(e)).padStart(2,"0"),s=-t.getTimezoneOffset(),a=s>=0?"+":"-";return`${t.getFullYear()}-${i(t.getMonth()+1)}-${i(t.getDate())}T${i(t.getHours())}:${i(t.getMinutes())}:${i(t.getSeconds())}${a}${i(Math.trunc(s/60))}:${i(s%60)}`}function pa(e,t){if("complete"===t.op&&oa.has(e.status)){const i=t.shows??"done";return{...e,status:i,note:null,completion:{id:`queued:${t.id}`,done_by:t.doneBy??e.member,by:"",at:ca(t.at),source:"tablet",state:i,review:null,stars:e.stars}}}return"undo"===t.op&&da.has(e.status)?{...e,status:"open",completion:null}:e}function ha(e,t,i){const s=new Date(e),a=e=>String(e).padStart(2,"0"),n=`${s.getFullYear()}-${a(s.getMonth()+1)}-${a(s.getDate())}`,r=ms(s,i,"12h"===i),o=ds(n,t);if(0===o)return`Today at ${r}`;if(1===o)return`Yesterday at ${r}`;const d=Ls(n,t);return`${d[0].toUpperCase()}${d.slice(1)} at ${r}`}function ua(e,t,i){return"completion"===e.kind?t?`${e.what}: looks good.`:`${e.what} went back${i?`: ${i}`:""}.`:"redemption"===e.kind?t?`${e.what} is ${e.member?.name??"theirs"}'s.`:`${e.what}: declined.`:t?`Allowed: ${e.what}.`:`Not this time: ${e.what}.`}const ma=[5,15,30,60,120];function va(e,t){return e.some(e=>"young_child"===t.find(t=>t.id===e)?.age_group)}function ga(e){const t=[Rs(e,1)];for(const i of[6,0]){const s=os(e).getDay(),a=Rs(e,(i-s+7)%7||7);t.includes(a)||t.push(a)}return t.map(t=>{const i=os(t).getDay(),s=Is(t,e);return{day:t,label:"Tomorrow"===s?s:6===i?"Saturday":0===i?"Sunday":s}})}const ba=["SU","MO","TU","WE","TH","FR","SA"],ya=["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];function fa(e){const t=e%100;return t>=11&&t<=13?`${e}th`:`${e}${["th","st","nd","rd"][e%10]??"th"}`}function _a(e,t){return e.name.trim()?0===e.who.length?"Pick who does it.":"by"===e.when&&(!e.by||e.by<t)?"Pick a day to finish by.":!Number.isFinite(e.minutes)||e.minutes<1||e.minutes>1440?"About how long is from 1 minute to 24 hours.":null:"Add what needs doing."}function xa(e,t,i=50){const s=Math.min(.999,Math.max(.05,t)),a=2*Math.PI/e,n=a*Math.sqrt(1-s*s),r=Math.log(1e3)/(s*a),o=[];for(let e=0;e<i;e++){const t=r*e/i,d=1-Math.exp(-s*a*t)*(Math.cos(n*t)+s*a/n*Math.sin(n*t));o.push(d.toFixed(4))}return o.push("1"),{easing:`linear(${o.join(", ")})`,duration:Math.round(1e3*r)}}const wa=xa(.5,.86),$a=xa(.45,.55),ka=xa(.6,.9);function Fa(e,t=function(){return"undefined"!=typeof CSS&&"function"==typeof CSS.supports&&CSS.supports("animation-timing-function","linear(0, 1)")}()){return t?e:{easing:"cubic-bezier(0.2, 0.8, 0.2, 1)",duration:e.duration}}function Ea(e){const t=getComputedStyle(e).getPropertyValue("--pv-motion").trim();return"reduced"===t||"full"===t?t:"function"==typeof matchMedia&&matchMedia("(prefers-reduced-motion: reduce)").matches?"reduced":"full"}function Ca(e){try{navigator.vibrate?.("tick"===e?12:[18,40,28])}catch{}}let Sa=null;function Da(e=!1){try{const t=window.AudioContext??window.webkitAudioContext;if(!t)return;Sa??=new t;const i=Sa.currentTime;(e?[659.25,783.99,1046.5]:[783.99,1046.5]).forEach((e,t)=>{const s=Sa.createOscillator(),a=Sa.createGain();s.type="sine",s.frequency.value=e;const n=i+.09*t;a.gain.setValueAtTime(0,n),a.gain.linearRampToValueAtTime(.12,n+.02),a.gain.exponentialRampToValueAtTime(1e-4,n+.35),s.connect(a).connect(Sa.destination),s.start(n),s.stop(n+.4)})}catch{}}class Aa extends le{constructor(){super(...arguments),this.toast=null}disconnectedCallback(){super.disconnectedCallback(),clearTimeout(this._timer)}updated(e){const t=e.get("toast");if(!e.has("toast")||t?.id===this.toast?.id)return;clearTimeout(this._timer);const i=this.toast;if(!i)return;const s=this.renderRoot.querySelector(".toast");if(s)if("reduced"===Ea(this))s.animate({opacity:[0,1]},{duration:150});else{const e=Fa(wa);s.animate({transform:["translateY(16px)","translateY(0)"],opacity:[0,1]},{duration:e.duration,easing:e.easing})}this._timer=setTimeout(()=>this._gone(i),i.ms??5e3)}render(){const e=this.toast;return e?U`
      <div class="toast ${"bad"===e.tone?"bad":""}" role="status" aria-live="polite">
        <span class="text">${e.text}</span>
        ${(e.actions??[]).map(t=>U`
          <button type="button" @click=${()=>this._act(e,t)}>${t.label}</button>
        `)}
      </div>
    `:Y}_act(e,t){clearTimeout(this._timer),this.dispatchEvent(new CustomEvent("pv-toast-action",{detail:{toast:e,action:t.id},bubbles:!0,composed:!0}))}_gone(e){this.dispatchEvent(new CustomEvent("pv-toast-gone",{detail:{toast:e},bubbles:!0,composed:!0}))}}Aa.styles=r`
    :host {
      position: absolute;
      left: 0;
      right: 0;
      bottom: 12px;
      display: flex;
      justify-content: center;
      pointer-events: none;
      z-index: 40;
    }

    .toast {
      pointer-events: auto;
      display: flex;
      align-items: center;
      gap: 6px;
      max-width: min(560px, calc(100% - 24px));
      min-height: 48px;
      box-sizing: border-box;
      padding: 6px 8px 6px 16px;
      border-radius: 14px;
      background: #1F2023;
      color: #F4F4F2;
      box-shadow: 0 8px 28px rgba(0, 0, 0, 0.28);
      font-size: 0.9375rem;
      line-height: 1.3;
    }

    .toast.bad .text::before {
      content: '';
      display: inline-block;
      width: 8px;
      height: 8px;
      margin-right: 8px;
      border-radius: 50%;
      background: #F3A5A5;
      vertical-align: 1px;
    }

    .text {
      flex: 1 1 auto;
      min-width: 0;
      padding: 6px 4px 6px 0;
    }

    button {
      flex-shrink: 0;
      min-height: 40px;
      min-width: 48px;
      padding: 0 10px;
      border: none;
      border-radius: 10px;
      background: transparent;
      color: #A9A9FF;
      font: inherit;
      font-weight: 700;
      cursor: pointer;
      -webkit-tap-highlight-color: transparent;
    }

    button:hover,
    button:focus-visible {
      background: rgba(255, 255, 255, 0.1);
      outline: none;
    }
  `,e([ue({attribute:!1})],Aa.prototype,"toast",void 0),ge("pv-toast",Aa);const za=r`
  :host {
    position: fixed;
    inset: 0;
    z-index: 100;
    display: flex;
    align-items: flex-end;
    justify-content: center;
    font-family: var(--pv-font-family, -apple-system, system-ui, sans-serif);
  }

  :host([layout='landscape']) {
    align-items: center;
  }

  .backdrop {
    position: absolute;
    inset: 0;
    background: rgba(0, 0, 0, 0.4);
  }

  .panel {
    position: relative;
    box-sizing: border-box;
    width: 100%;
    max-height: 92vh;
    overflow: auto;
    background: var(--pv-card-bg, #FFFFFF);
    color: var(--pv-text, #1A1B1E);
    border-radius: 20px 20px 0 0;
    padding: 20px 20px calc(20px + env(safe-area-inset-bottom, 0px));
    box-shadow: 0 -8px 32px rgba(0, 0, 0, 0.18);
  }

  :host([layout='landscape']) .panel {
    width: min(400px, calc(100vw - 32px));
    border-radius: 20px;
    padding: 24px;
    box-shadow: 0 16px 48px rgba(0, 0, 0, 0.24);
  }

  .heading {
    font-family: var(--pv-font-heading, ui-rounded, 'SF Pro Rounded', 'PlanaVista Rounded', system-ui, sans-serif);
    margin: 0 0 6px;
    font-size: 1.25rem;
    font-weight: 700;
    text-align: center;
  }

  .body {
    margin: 0 0 16px;
    color: var(--pv-text-secondary, #6B7280);
    line-height: 1.5;
    text-align: center;
  }

  .actions {
    display: flex;
    flex-direction: column;
    gap: 10px;
    margin-top: 12px;
  }

  .actions button {
    min-height: 48px;
    width: 100%;
  }

  .sr {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip: rect(0 0 0 0);
    white-space: nowrap;
  }

  /* The band a finger drags down to close the sheet (portrait and phone). */
  .grab-zone {
    display: none;
    margin: -12px -20px 4px;
    padding: 10px 0 14px;
    touch-action: none;
    cursor: grab;
  }

  :host(:not([layout='landscape'])) .grab-zone {
    display: block;
  }

  .grab {
    width: 36px;
    height: 5px;
    margin: 0 auto;
    border-radius: 3px;
    background: var(--pv-border, #E7E7E3);
  }

  .panel {
    will-change: transform;
  }
`;function Ma(e,t){if("Tab"!==t.key)return;const i=[...e.querySelectorAll('button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])')],s=function(e,t,i){return 0===t?-1:e<0?i?t-1:0:i?(e-1+t)%t:(e+1)%t}(i.indexOf(e.activeElement),i.length,t.shiftKey);s>=0&&(t.preventDefault(),i[s].focus())}function Ta(e){return Math.max(0,e)}class Ba{constructor(e){this._host=e}get _rises(){return"landscape"!==this._host.layout}open(e,t){if(t.animate({opacity:[0,1]},{duration:200,easing:"ease-out"}),"reduced"===Ea(this._host))return void e.animate({opacity:[0,1]},{duration:150,easing:"ease-out"});const i=Fa(wa);e.animate(this._rises?{transform:["translateY(105%)","translateY(0)"]}:{transform:["scale(0.96)","scale(1)"],opacity:[0,1]},{duration:i.duration,easing:i.easing})}async close(e,t){const i="reduced"===Ea(this._host),s=getComputedStyle(e).transform,a=s&&"none"!==s?s:"translateY(0)",n=i?e.animate({opacity:[1,0]},{duration:150,easing:"ease-in",fill:"forwards"}):e.animate(this._rises?{transform:[a,"translateY(105%)"]}:{transform:["scale(1)","scale(0.96)"],opacity:[1,0]},{duration:this._rises?240:160,easing:"cubic-bezier(.4,0,1,1)",fill:"forwards"});t.animate({opacity:[1,0]},{duration:i?150:200,easing:"ease-in",fill:"forwards"}),await n.finished.catch(()=>{})}attachDrag(e,t,i){let s=null,a=0;const n=t=>{if(this._rises){s={y:t.clientY,t:performance.now()},a=0;try{e.setPointerCapture(t.pointerId)}catch{}}},r=e=>{s&&(a=Ta(e.clientY-s.y),t.style.transform=`translateY(${a}px)`)},o=()=>{if(!s)return;const e=function(e,t){const i=Ta(e);return i>90||i/Math.max(1,t)>.6?"close":"settle"}(a,performance.now()-s.t);if(s=null,"close"===e)return void i();const n="reduced"===Ea(this._host)?{duration:120,easing:"ease-out"}:Fa($a);t.style.transform="",t.animate({transform:[`translateY(${a}px)`,"translateY(0)"]},{duration:n.duration,easing:n.easing})};return e.addEventListener("pointerdown",n),e.addEventListener("pointermove",r),e.addEventListener("pointerup",o),e.addEventListener("pointercancel",o),()=>{e.removeEventListener("pointerdown",n),e.removeEventListener("pointermove",r),e.removeEventListener("pointerup",o),e.removeEventListener("pointercancel",o)}}}class Pa extends le{constructor(){super(...arguments),this.heading="",this.body="",this.actions=[],this.layout="landscape",this._sheetMotion=new Ba(this),this._detachDrag=null,this._closing=!1}firstUpdated(){this.renderRoot.querySelector(".actions button")?.focus();const{panel:e,backdrop:t,zone:i}=this._parts();this._sheetMotion.open(e,t),this._detachDrag=this._sheetMotion.attachDrag(i,e,()=>this._choose("cancel"))}disconnectedCallback(){super.disconnectedCallback(),this._detachDrag?.(),this._detachDrag=null}_parts(){const e=this.renderRoot;return{panel:e.querySelector(".panel"),backdrop:e.querySelector(".backdrop"),zone:e.querySelector(".grab-zone")}}render(){return U`
      <div class="backdrop" @click=${()=>this._choose("cancel")}></div>
      <div class="panel" role="dialog" aria-modal="true" aria-labelledby="notice-heading" @keydown=${this._onKey}>
        <div class="grab-zone" aria-hidden="true"><div class="grab"></div></div>
        <h2 class="heading" id="notice-heading">${this.heading}</h2>
        ${this.body?U`<p class="body">${this.body}</p>`:Y}
        <div class="actions">
          ${this.actions.map(e=>U`
            <button
              type="button"
              class="pv-btn ${"secondary"===e.kind?"pv-btn-secondary":"pv-btn-primary"} ${"destructive"===e.kind?"destructive":""}"
              @click=${()=>this._choose(e.id)}
            >${e.label}</button>
          `)}
        </div>
      </div>
    `}_onKey(e){if("Escape"===e.key)return e.preventDefault(),void this._choose("cancel");Ma(this.shadowRoot,e)}_choose(e){this._leave(()=>{this.dispatchEvent(new CustomEvent("pv-sheet-action",{detail:{id:e},bubbles:!0,composed:!0}))})}async _leave(e){if(this._closing)return;this._closing=!0;const{panel:t,backdrop:i}=this._parts();await this._sheetMotion.close(t,i),e(),requestAnimationFrame(()=>{if(this.isConnected){for(const e of[t,i])e.getAnimations().forEach(e=>e.cancel());t.style.transform="",this._closing=!1}})}}Pa.styles=[ot,za,r`
      .destructive {
        background: var(--pv-danger, #DC2626);
        border-color: transparent;
        color: #FFFFFF;
      }
    `],e([ue({type:String})],Pa.prototype,"heading",void 0),e([ue({type:String})],Pa.prototype,"body",void 0),e([ue({attribute:!1})],Pa.prototype,"actions",void 0),e([ue({type:String,reflect:!0})],Pa.prototype,"layout",void 0),ge("pv-notice-sheet",Pa);const Oa=e=>(...t)=>({_$litDirective$:e,values:t});let Ra=class{constructor(e){}get _$AU(){return this._$AM._$AU}_$AT(e,t,i){this._$Ct=e,this._$AM=t,this._$Ci=i}_$AS(e,t){return this.update(e,t)}update(e,t){return this.render(...t)}};const{I:Ia}=re,La=e=>e,Na=()=>document.createComment(""),Ha=(e,t,i)=>{const s=e._$AA.parentNode,a=void 0===t?e._$AB:t._$AA;if(void 0===i){const t=s.insertBefore(Na(),a),n=s.insertBefore(Na(),a);i=new Ia(t,n,e,e.options)}else{const t=i._$AB.nextSibling,n=i._$AM,r=n!==e;if(r){let t;i._$AQ?.(e),i._$AM=e,void 0!==i._$AP&&(t=e._$AU)!==n._$AU&&i._$AP(t)}if(t!==a||r){let e=i._$AA;for(;e!==t;){const t=La(e).nextSibling;La(s).insertBefore(e,a),e=t}}}return i},ja=(e,t,i=e)=>(e._$AI(t,i),e),qa={},Ua=(e,t=qa)=>e._$AH=t,Va=e=>{e._$AR(),e._$AA.remove()},Wa=(e,t,i)=>{const s=new Map;for(let a=t;a<=i;a++)s.set(e[a],a);return s},Ya=Oa(class extends Ra{constructor(e){if(super(e),2!==e.type)throw Error("repeat() can only be used in text expressions")}dt(e,t,i){let s;void 0===i?i=t:void 0!==t&&(s=t);const a=[],n=[];let r=0;for(const t of e)a[r]=s?s(t,r):r,n[r]=i(t,r),r++;return{values:n,keys:a}}render(e,t,i){return this.dt(e,t,i).values}update(e,[t,i,s]){const a=(e=>e._$AH)(e),{values:n,keys:r}=this.dt(t,i,s);if(!Array.isArray(a))return this.ut=r,n;const o=this.ut??=[],d=[];let l,c,p=0,h=a.length-1,u=0,m=n.length-1;for(;p<=h&&u<=m;)if(null===a[p])p++;else if(null===a[h])h--;else if(o[p]===r[u])d[u]=ja(a[p],n[u]),p++,u++;else if(o[h]===r[m])d[m]=ja(a[h],n[m]),h--,m--;else if(o[p]===r[m])d[m]=ja(a[p],n[m]),Ha(e,d[m+1],a[p]),p++,m--;else if(o[h]===r[u])d[u]=ja(a[h],n[u]),Ha(e,a[p],a[h]),h--,u++;else if(void 0===l&&(l=Wa(r,u,m),c=Wa(o,p,h)),l.has(o[p]))if(l.has(o[h])){const t=c.get(r[u]),i=void 0!==t?a[t]:null;if(null===i){const t=Ha(e,a[p]);ja(t,n[u]),d[u]=t}else d[u]=ja(i,n[u]),Ha(e,a[p],i),a[t]=null;u++}else Va(a[h]),h--;else Va(a[p]),p++;for(;u<=m;){const t=Ha(e,d[m+1]);ja(t,n[u]),d[u++]=t}for(;p<=h;){const e=a[p++];null!==e&&Va(e)}return this.ut=r,Ua(e,d),W}});class Ka extends le{constructor(){super(...arguments),this.size=58,this.progress=0,this.color="currentColor",this.closed=!1,this.dashed=!1,this.label="",this.celebrate=0}get _stroke(){return this.size>=100?8:this.size>=50?4:3}firstUpdated(){this._setEasing()}updated(e){e.has("celebrate")&&this.celebrate&&void 0!==e.get("celebrate")&&this._play()}_setEasing(){if("reduced"===Ea(this))return this.style.setProperty("--pv-ring-ms","180ms"),void this.style.setProperty("--pv-ring-ease","linear");const e=Fa(ka);this.style.setProperty("--pv-ring-ms",`${e.duration}ms`),this.style.setProperty("--pv-ring-ease",e.easing)}_play(){const e=this.renderRoot.querySelector(".glow");if(!e)return;if("reduced"===Ea(this))return void e.animate({opacity:[0,.5,0]},{duration:500,easing:"ease-out"});e.animate({opacity:[0,.7,0],transform:["scale(0.9)","scale(1.15)","scale(1.25)"]},{duration:900,easing:"ease-out"});const t=Fa($a);this.animate({transform:["scale(1)","scale(1.08)","scale(1)"]},{duration:t.duration,easing:t.easing});const i=[...this.renderRoot.querySelectorAll(".spark")],s=.75*this.size;i.forEach((e,t)=>{const a=t/i.length*Math.PI*2-Math.PI/2,n=Math.cos(a)*s,r=Math.sin(a)*s;e.animate({opacity:[0,1,0],transform:["translate(0, 0) scale(0.6)",`translate(${.7*n}px, ${.7*r}px) scale(1)`,`translate(${n}px, ${r}px) scale(0.4)`]},{duration:800,delay:18*t,easing:"cubic-bezier(0.2, 0.8, 0.2, 1)"})})}render(){const e=this.size,t=this._stroke,i=e/2,s=(e-t)/2,a=2*Math.PI*s,n=this.closed?1:Math.min(1,Math.max(0,this.progress)),r=e-2*t-2*Math.max(2,Math.round(.06*e)),o=Math.max(14,Math.round(.32*e));return U`
      <div style="width:${e}px;height:${e}px;position:relative;display:flex;align-items:center;justify-content:center"
        role=${this.label?"img":Y} aria-label=${this.label||Y}>
        <div class="glow" style="box-shadow: 0 0 0 4px ${this.color}, 0 0 24px 6px ${this.color}"></div>
        ${[0,1,2,3,4,5,6,7].map(()=>U`<span class="spark" style="background:${this.color}"></span>`)}
        <svg class="ring" width=${e} height=${e} viewBox="0 0 ${e} ${e}" aria-hidden="true">
          ${V`
            <circle class="track" cx=${i} cy=${i} r=${s} fill="none" stroke-width=${t}></circle>
            <circle class="fill" cx=${i} cy=${i} r=${s} fill="none" stroke=${this.color}
              stroke-width=${t} stroke-linecap="round" stroke-dasharray=${a}
              stroke-dashoffset=${a*(1-n)} opacity=${n>0?1:0}></circle>
          `}
        </svg>
        <div class="inside" style="width:${r}px;height:${r}px"><slot></slot></div>
        ${this.closed?U`
          <span class="badge" aria-hidden="true"
            style="width:${o}px;height:${o}px;background:${this.color};color:${qe(this.color)}">
            <svg width=${Math.round(.6*o)} height=${Math.round(.6*o)} viewBox="0 0 24 24" fill="none"
              stroke="currentColor" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M5 12.5l4.5 4.5L19 7.5"></path>
            </svg>
          </span>
        `:Y}
      </div>
    `}}Ka.styles=r`
    :host {
      position: relative;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      line-height: 0;
    }

    svg.ring {
      position: absolute;
      inset: 0;
      transform: rotate(-90deg);
      overflow: visible;
    }

    .track {
      stroke: var(--pv-ring-track, var(--pv-track, #ECECE8));
    }

    :host([dashed]) .track {
      stroke-dasharray: 3 4;
    }

    .fill {
      transition: stroke-dashoffset var(--pv-ring-ms, 700ms) var(--pv-ring-ease, cubic-bezier(0.2, 0.8, 0.2, 1));
    }

    .inside {
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      overflow: hidden;
    }

    .badge {
      position: absolute;
      right: -1px;
      bottom: -1px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      border: 2px solid var(--pv-card-bg, #FFFFFF);
      box-sizing: border-box;
    }

    .glow {
      position: absolute;
      inset: -6px;
      border-radius: 50%;
      pointer-events: none;
      opacity: 0;
    }

    .spark {
      position: absolute;
      left: 50%;
      top: 50%;
      width: 6px;
      height: 6px;
      margin: -3px 0 0 -3px;
      border-radius: 50%;
      pointer-events: none;
      opacity: 0;
    }
  `,e([ue({type:Number})],Ka.prototype,"size",void 0),e([ue({type:Number})],Ka.prototype,"progress",void 0),e([ue({type:String})],Ka.prototype,"color",void 0),e([ue({type:Boolean,reflect:!0})],Ka.prototype,"closed",void 0),e([ue({type:Boolean,reflect:!0})],Ka.prototype,"dashed",void 0),e([ue({type:String})],Ka.prototype,"label",void 0),e([ue({type:Number})],Ka.prototype,"celebrate",void 0),ge("pv-ring",Ka);class Xa extends le{constructor(){super(...arguments),this.size=40}render(){const e=this.member;if(!e)return Y;const t=function(e,t){const i=e.picture;if(i&&"string"==typeof i.emoji&&i.emoji)return{kind:"emoji",text:i.emoji};if(i&&!0===i.person&&e.person){const i=t(e.person);if(i)return{kind:"photo",url:i}}return{kind:"initial",text:Oi(e.name)}}(e,e=>this.hass?.states?.[e]?.attributes?.entity_picture??null),i=Math.round(this.size*("emoji"===t.kind?.55:.42)),s=`width:${this.size}px;height:${this.size}px;font-size:${i}px;background:${e.color};color:${qe(e.color)}`;return U`
      <div class="avatar" role="img" aria-label=${e.name} style=${s}>
        ${"photo"===t.kind?U`<img src=${t.url} alt="" />`:t.text}
      </div>
    `}}Xa.styles=r`
    :host {
      display: inline-block;
      flex-shrink: 0;
      line-height: 0;
    }

    .avatar {
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      overflow: hidden;
      font-weight: 700;
      line-height: 1;
      user-select: none;
    }

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  `,e([ue({attribute:!1})],Xa.prototype,"member",void 0),e([ue({attribute:!1})],Xa.prototype,"hass",void 0),e([ue({type:Number})],Xa.prototype,"size",void 0),ge("pv-member-avatar",Xa);class Ga{constructor(e,t=550){this._callbacks=e,this._holdMs=t,this._start=null,this._fill=0}get holding(){return null!==this._start}down(e,t,i){this._start={x:e,y:t,t:i},this._fill=0,this._callbacks.progress(0)}frame(e){this._start&&(this._fill=Math.min(1,Math.max(0,(e-this._start.t)/this._holdMs)),this._callbacks.progress(this._fill),this._fill>=1&&(this._start=null,this._callbacks.complete()))}move(e,t){this._start&&Math.hypot(e-this._start.x,t-this._start.y)>12&&this._stop(!1)}up(e){this._start&&this._stop(e-this._start.t<200)}cancel(){this._start&&this._stop(!1)}key(e){return(" "===e||"Enter"===e)&&(this._start=null,this._fill=1,this._callbacks.progress(1),this._callbacks.complete(),!0)}_stop(e){this._start=null,this._callbacks.rewind(this._fill),e&&this._callbacks.tap()}}const Ja=11.5,Qa=2*Math.PI*Ja;class Za extends le{constructor(){super(...arguments),this.color="#5B5BD6",this.highlight=!1,this.narrow=!1,this.locked=!1,this.dim=!1,this._fill=0,this._held=!1,this._frame=0,this._gesture=new Ga({progress:e=>{this._fill=e},complete:()=>this._finish(),rewind:e=>this._rewind(e),tap:()=>this._fire("pv-hint",{row:this.row})}),this._celebrate=!1,this._down=e=>{if(!this._holdable||this._held||e.button>0)return;const t=e.currentTarget;try{t.setPointerCapture(e.pointerId)}catch{}this._gesture.down(e.clientX,e.clientY,performance.now());const i=e=>{this._gesture.frame(e),this._gesture.holding&&(this._frame=requestAnimationFrame(i))};this._frame=requestAnimationFrame(i)},this._move=e=>{this._gesture.move(e.clientX,e.clientY)},this._up=()=>{cancelAnimationFrame(this._frame),this._gesture.up(performance.now())},this._cancel=()=>{cancelAnimationFrame(this._frame),this._gesture.cancel()},this._key=e=>{" "!==e.key&&"Enter"!==e.key||(e.preventDefault(),this._holdable&&!this._held?this._gesture.key(e.key):this._fire("pv-hint",{row:this.row}))},this._options=()=>{this._fire("pv-row-options",{row:this.row})},this._context=e=>{e.preventDefault(),this._options()}}willUpdate(e){if(e.has("row")){const t=e.get("row");this.dataset.state=this.row.state,t&&t.state!==this.row.state&&(this._held=!1,this._fill=0,"done"!==this.row.state&&"pending"!==this.row.state||(this._celebrate=!0))}}updated(){if(!this._celebrate)return;this._celebrate=!1;const e="reduced"===Ea(this),t=this.renderRoot.querySelector(".check"),i=this.renderRoot.querySelector(".mark"),s=this.renderRoot.querySelector(".strike");if(e)return void t?.animate({opacity:[0,1]},{duration:150});const a=Fa($a);t?.animate({transform:["scale(0.55)","scale(1)"]},{duration:a.duration,easing:a.easing}),i?.animate({strokeDashoffset:[24,0]},{duration:320,delay:60,easing:"cubic-bezier(0.3, 0.7, 0.2, 1)",fill:"backwards"}),s?.animate({transform:["scaleX(0)","scaleX(1)"]},{duration:300,delay:120,easing:"ease-out",fill:"backwards"}),this.renderRoot.querySelector(".sparkles")?.animate({opacity:[0,1,0],transform:["translateY(4px)","translateY(-6px)"]},{duration:700,easing:"ease-out"})}disconnectedCallback(){super.disconnectedCallback(),cancelAnimationFrame(this._frame)}get _done(){return"done"===this.row.state}get _holdable(){return!this.locked&&("open"===this.row.state||"sent_back"===this.row.state||"done"===this.row.state)}_finish(){this._held=!0,this._fill=1;const e=this.renderRoot.querySelector(".circle")?.getBoundingClientRect()??new DOMRect,t={row:this.row,from:e,settle:e=>{e||this._rewind(1)}};this._fire(this._done?"pv-hold-undo":"pv-hold-done",t)}_rewind(e){if(this._held=!1,e<=0||"reduced"===Ea(this))return void(this._fill=0);const t=performance.now(),i=220*e,s=a=>{const n=Math.min(1,(a-t)/i);this._fill=e*(1-n),n<1&&!this._gesture.holding&&(this._frame=requestAnimationFrame(s))};this._frame=requestAnimationFrame(s)}_fire(e,t){this.dispatchEvent(new CustomEvent(e,{detail:t,bubbles:!0,composed:!0}))}render(){const e=this.row;if(!e)return Y;const t=this.color,i=e.state,s="done"===i,a="pending"===i,n=this._held?1:this._fill,r=s?`Hold to uncheck ${e.name}`:`Hold to complete ${e.name}`,o=U`
      ${e.badge?U`
        <span class="badge ${e.badge.tone}">${e.badge.glyph?U`<span aria-hidden="true">${e.badge.glyph}</span>`:Y}${e.badge.words}</span>
      `:Y}
      ${e.badge||!e.meta||s?Y:U`<span class="meta">${e.meta}</span>`}
      ${s&&e.doneAt?U`<span class="meta">${e.doneBy?`${e.doneBy} · `:""}${e.doneAt}</span>`:Y}
    `;return U`
      <div class="row" style="--member:${t}">
        <div class="sweep" style="transform: scaleX(${s?0:n})"></div>
        <button class="circle" type="button" aria-label=${r} aria-disabled=${this.locked?"true":"false"}
          @pointerdown=${this._down} @pointermove=${this._move} @pointerup=${this._up}
          @pointercancel=${this._cancel} @lostpointercapture=${this._up} @keydown=${this._key}
          @contextmenu=${e=>e.preventDefault()}>
          <svg width=${26} height=${26} viewBox="0 0 26 26" aria-hidden="true">
            ${s?V`
              <g class="check" style="transform-origin: 13px 13px">
                <circle cx="13" cy="13" r="12.5" fill=${t}></circle>
                <path class="mark" d="M7.5 13.4l3.6 3.6 7.4-7.6" fill="none" stroke=${qe(t)} stroke-width="2.6"
                  stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="24"></path>
              </g>
              <circle cx="13" cy="13" r="15.5" fill="none" stroke=${t} stroke-width="2.4" stroke-linecap="round"
                stroke-dasharray=${2*Math.PI*15.5} stroke-dashoffset=${2*Math.PI*15.5*(1-n)}
                transform="rotate(-90 13 13)" opacity=${n>0?.55:0}></circle>
            `:V`
              <circle cx="13" cy="13" r=${Ja} fill="none" stroke=${t} stroke-width="2.4"
                stroke-dasharray=${a?"3.2 3.2":"none"} opacity=${a?.9:1}></circle>
              ${a?V`<text x="13" y="17.2" text-anchor="middle" font-size="11">⏳</text>`:Y}
              <circle cx="13" cy="13" r=${Ja} fill="none" stroke=${t} stroke-width="3.4" stroke-linecap="round"
                stroke-dasharray=${Qa} stroke-dashoffset=${Qa*(1-n)}
                transform="rotate(-90 13 13)" opacity=${n>0?1:0}></circle>
            `}
          </svg>
        </button>
        <button class="about" type="button" @click=${this._options} @contextmenu=${this._context}
          aria-label=${`${e.name}${e.badge?`, ${e.badge.words}`:""}. Options`}>
          <span class="name"><span class="text">${e.name}<span class="strike"></span></span>${e.label?U`<span class="label">${e.label}</span>`:Y}</span>
          <span class="end">${o}</span>
        </button>
        <span class="sparkles" aria-hidden="true">✦ ✧ ✦</span>
      </div>
    `}}function en(e){return e&&!e.startsWith("mdi:")?e:"⭐"}Za.styles=[as,r`
      :host {
        display: block;
        --tint: color-mix(in srgb, var(--member) 14%, var(--pv-card-bg, #FFFFFF));
      }

      .row {
        position: relative;
        display: flex;
        align-items: center;
        gap: 2px;
        min-height: 52px;
        padding-right: 10px;
        border-radius: 12px;
        overflow: hidden;
      }

      :host([highlight]) .row {
        background: var(--tint);
      }

      .sweep {
        position: absolute;
        inset: 0;
        background: color-mix(in srgb, var(--member) 22%, transparent);
        transform-origin: left center;
        pointer-events: none;
      }

      .circle {
        position: relative;
        flex-shrink: 0;
        width: 48px;
        height: 52px;
        display: flex;
        align-items: center;
        justify-content: center;
        border: none;
        background: transparent;
        padding: 0;
        cursor: pointer;
        touch-action: none;
        -webkit-tap-highlight-color: transparent;
        -webkit-user-select: none;
        user-select: none;
      }

      .circle[aria-disabled='true'] {
        cursor: default;
        opacity: 0.5;
      }

      :host([dim]) .name,
      :host([dim]) .end {
        opacity: 0.72;
      }

      .circle:focus-visible {
        outline: none;
      }

      .circle:focus-visible svg {
        outline: 2px solid var(--pv-accent-ink, #5B5BD6);
        outline-offset: 3px;
        border-radius: 50%;
      }

      .circle svg {
        overflow: visible;
      }

      .about {
        position: relative;
        flex: 1 1 auto;
        min-width: 0;
        display: flex;
        align-items: center;
        gap: 8px;
        min-height: 52px;
        padding: 6px 0;
        border: none;
        background: transparent;
        color: inherit;
        font: inherit;
        text-align: left;
        cursor: pointer;
        -webkit-tap-highlight-color: transparent;
      }

      :host([narrow]) .about {
        flex-direction: column;
        align-items: flex-start;
        justify-content: center;
        gap: 3px;
      }

      .about:focus-visible {
        outline: 2px solid var(--pv-accent-ink, #5B5BD6);
        outline-offset: -2px;
        border-radius: 10px;
      }

      .name {
        position: relative;
        flex: 1 1 auto;
        min-width: 0;
        font-size: 1rem;
        line-height: 1.3;
      }

      :host([narrow]) .name {
        flex: none;
      }

      .name .text {
        position: relative;
      }

      .label {
        color: var(--pv-text-muted, #8E949C);
        font-size: 0.875rem;
        margin-left: 4px;
      }

      .strike {
        position: absolute;
        left: 0;
        right: 0;
        top: 50%;
        height: 1.5px;
        background: currentColor;
        transform-origin: left center;
        transform: scaleX(0);
      }

      :host([data-state='done']) .name {
        color: var(--pv-text-muted, #8E949C);
      }

      :host([data-state='done']) .strike {
        transform: scaleX(1);
      }

      .end {
        flex-shrink: 0;
        display: flex;
        align-items: center;
        gap: 6px;
      }

      .who {
        color: var(--pv-text-muted, #8E949C);
        font-size: 0.8125rem;
      }

      .sparkles {
        position: absolute;
        left: 60px;
        top: 4px;
        pointer-events: none;
        color: var(--member);
        font-size: 11px;
        letter-spacing: 4px;
        opacity: 0;
      }
    `],e([ue({attribute:!1})],Za.prototype,"row",void 0),e([ue({type:String})],Za.prototype,"color",void 0),e([ue({type:Boolean,reflect:!0})],Za.prototype,"highlight",void 0),e([ue({type:Boolean,reflect:!0})],Za.prototype,"narrow",void 0),e([ue({type:Boolean})],Za.prototype,"locked",void 0),e([ue({type:Boolean,reflect:!0})],Za.prototype,"dim",void 0),e([me()],Za.prototype,"_fill",void 0),e([me()],Za.prototype,"_held",void 0),ge("pv-chore-item",Za);class tn extends le{constructor(){super(...arguments),this.color="#5B5BD6",this.now=!1,this.large=!1,this.locked=!1,this.stars=0,this._fill=0,this._held=!1,this._frame=0,this._celebrate=!1,this._gesture=new Ga({progress:e=>{this._fill=e},complete:()=>this._finish(),rewind:()=>{this._held=!1,this._fill=0},tap:()=>this._fire("pv-hint",{row:this.row})}),this._down=e=>{if(!this._holdable||this._held||e.button>0)return;try{e.currentTarget.setPointerCapture(e.pointerId)}catch{}this._gesture.down(e.clientX,e.clientY,performance.now());const t=e=>{this._gesture.frame(e),this._gesture.holding&&(this._frame=requestAnimationFrame(t))};this._frame=requestAnimationFrame(t)},this._up=()=>{cancelAnimationFrame(this._frame),this._gesture.up(performance.now())},this._key=e=>{" "!==e.key&&"Enter"!==e.key||(e.preventDefault(),this._holdable&&!this._held&&this._gesture.key(e.key))}}willUpdate(e){if(e.has("row")){const t=e.get("row");t&&t.state!==this.row.state&&(this._held=!1,this._fill=0,"done"!==this.row.state&&"pending"!==this.row.state||(this._celebrate=!0))}}updated(){if(!this._celebrate)return;this._celebrate=!1;const e=this.renderRoot.querySelector(".tile");if("reduced"===Ea(this))return void e?.animate({opacity:[.5,1]},{duration:160});const t=Fa($a);e?.animate({transform:["scale(0.94)","scale(1)"]},{duration:t.duration,easing:t.easing})}disconnectedCallback(){super.disconnectedCallback(),cancelAnimationFrame(this._frame)}get _holdable(){const e=this.row.state;return!this.locked&&("open"===e||"sent_back"===e||"done"===e)}_finish(){this._held=!0,this._fill=1;const e=this.renderRoot.querySelector(".picture")?.getBoundingClientRect()??new DOMRect,t={row:this.row,from:e,settle:e=>{e||(this._held=!1,this._fill=0)}};this._fire("done"===this.row.state?"pv-hold-undo":"pv-hold-done",t)}_fire(e,t){this.dispatchEvent(new CustomEvent(e,{detail:t,bubbles:!0,composed:!0}))}render(){const e=this.row;if(!e)return Y;const t=e.state,i="done"===t,s="pending"===t,a=this._held?1:this._fill,n=this.large?132:84;return U`
      <div class="tile ${s?"pending":""} ${i?"done":""}" style="--member:${this.color}">
        <div class="hold" role="button" tabindex=${this.locked?-1:0} aria-disabled=${this.locked?"true":"false"}
          aria-label=${i?`${e.name}, done. Hold to uncheck`:s?`${e.name}, waiting for OK`:`Hold to complete ${e.name}`}
          @pointerdown=${this._down} @pointermove=${e=>this._gesture.move(e.clientX,e.clientY)}
          @pointerup=${this._up} @pointercancel=${()=>this._gesture.cancel()} @keydown=${this._key}
          @contextmenu=${e=>e.preventDefault()}>
        ${i?U`
          <span class="tick" style="background:${this.color};color:${qe(this.color)}" aria-hidden="true">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5"></path></svg>
          </span>
        `:Y}
        <pv-ring size=${n} .progress=${a} color=${this.color}>
          <span class="picture" aria-hidden="true">${en(e.icon)}</span>
        </pv-ring>
        <span class="name">${e.name}</span>
        ${s?U`<span class="waiting">⏳ Waiting for OK</span>`:U`<span class="hint">${a>0&&!i?U`Keep holding… ${this.stars>0?`⭐ +${this.stars}`:""}`:this.large&&!i?"Hold me":""}</span>`}
        </div>
        <button class="more" type="button" aria-label=${`Options for ${e.name}`}
          @click=${()=>this._fire("pv-row-options",{row:e})}>
          <span aria-hidden="true">⋯</span>
        </button>
      </div>
    `}}tn.styles=r`
    :host {
      display: block;
      --tint: color-mix(in srgb, var(--member) 12%, var(--pv-card-bg, #FFFFFF));
    }

    .tile {
      position: relative;
      box-sizing: border-box;
      width: 100%;
      border-radius: 18px;
      border: 2px solid transparent;
      background: var(--tint);
      color: var(--pv-text, #1A1B1E);
    }

    .hold {
      box-sizing: border-box;
      width: 100%;
      min-height: 132px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 6px;
      padding: 14px 8px 12px;
      border-radius: 16px;
      cursor: pointer;
      touch-action: none;
      -webkit-tap-highlight-color: transparent;
      -webkit-user-select: none;
      user-select: none;
    }

    :host([large]) .hold {
      min-height: 300px;
      gap: 10px;
    }

    .hold:focus-visible {
      outline: 3px solid var(--pv-accent-ink, #5B5BD6);
      outline-offset: 2px;
    }

    .hold[aria-disabled='true'] {
      cursor: default;
    }

    :host([now]) .tile {
      border-color: var(--member);
    }

    .tile.pending {
      border: 2px dashed var(--member);
      background: var(--pv-card-bg, #FFFFFF);
    }

    .tile.done {
      opacity: 0.72;
    }

    .picture {
      font-size: 44px;
      line-height: 1;
    }

    :host([large]) .picture {
      font-size: 84px;
    }

    .name {
      font-family: var(--pv-font-heading, ui-rounded, 'SF Pro Rounded', 'PlanaVista Rounded', system-ui, sans-serif);
      font-weight: 800;
      font-size: 1.0625rem;
      line-height: 1.2;
      text-align: center;
    }

    :host([large]) .name {
      font-size: 1.75rem;
    }

    .hint {
      font-size: 0.8125rem;
      color: var(--pv-text-secondary, #5F6670);
      min-height: 1.2em;
    }

    .waiting {
      font-size: 0.8125rem;
      font-weight: 700;
      color: var(--pv-accent-tint-ink, #3B3BB0);
    }

    .more {
      position: absolute;
      top: 2px;
      right: 2px;
      width: 48px;
      height: 48px;
      display: flex;
      align-items: center;
      justify-content: center;
      border: none;
      background: transparent;
      padding: 0;
      cursor: pointer;
      -webkit-tap-highlight-color: transparent;
    }

    .more span {
      width: 30px;
      height: 30px;
      border-radius: 50%;
      background: var(--pv-card-bg, #FFFFFF);
      color: var(--pv-text-secondary, #5F6670);
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 800;
      letter-spacing: 1px;
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.12);
    }

    .more:focus-visible span {
      outline: 2px solid var(--pv-accent-ink, #5B5BD6);
    }

    .tick {
      position: absolute;
      top: 10px;
      left: 10px;
      width: 28px;
      height: 28px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
    }
  `,e([ue({attribute:!1})],tn.prototype,"row",void 0),e([ue({type:String})],tn.prototype,"color",void 0),e([ue({type:Boolean,reflect:!0})],tn.prototype,"now",void 0),e([ue({type:Boolean,reflect:!0})],tn.prototype,"large",void 0),e([ue({type:Boolean})],tn.prototype,"locked",void 0),e([ue({type:Number})],tn.prototype,"stars",void 0),e([me()],tn.prototype,"_fill",void 0),e([me()],tn.prototype,"_held",void 0),ge("pv-chore-tile",tn);class sn extends le{constructor(){super(...arguments),this.color="#5B5BD6",this.narrow=!1,this.locked=!1,this.celebrate=0,this.pulse=0,this.member="",this._before=null}willUpdate(e){e.has("color")&&this.style.setProperty("--member",this.color),e.has("model")&&e.get("model")&&(this._before=function(e){const t=new Map;for(const i of e){const e=i.dataset.key;e&&t.set(e,i.getBoundingClientRect())}return t}(this.renderRoot.querySelectorAll("[data-key]")))}updated(e){this._before&&(function(e,t,i){const s="reduced"===Ea(i),a=Fa(wa);for(const i of e){const e=i.dataset.key,n=e?t.get(e):void 0;if(!n)continue;const r=i.getBoundingClientRect(),o=n.left-r.left,d=n.top-r.top;Math.abs(o)<1&&Math.abs(d)<1||(s?i.animate({opacity:[.4,1]},{duration:160,easing:"ease-out"}):i.animate({transform:[`translate(${o}px, ${d}px)`,"translate(0, 0)"]},{duration:a.duration,easing:a.easing}))}}(this.renderRoot.querySelectorAll("[data-key]"),this._before,this),this._before=null),e.has("pulse")&&this.pulse&&void 0!==e.get("pulse")&&this._pulse()}_pulse(){"reduced"!==Ea(this)&&this.animate({boxShadow:["0 0 0 0 transparent",`0 0 0 6px color-mix(in srgb, ${this.color} 35%, transparent)`,"0 0 0 0 transparent"]},{duration:1400,easing:"ease-in-out"})}flyStars(e,t){const i=this.renderRoot.querySelector(".layer"),s=this.renderRoot.querySelector(".stars");i&&(function(e,t,i,s,a){if(a<=0)return;const n=t.getBoundingClientRect(),r=document.createElement("span");r.textContent=`+${a} ★`,r.setAttribute("aria-hidden","true"),Object.assign(r.style,{position:"absolute",left:i.left-n.left+i.width/2+"px",top:i.top-n.top+"px",transform:"translate(-50%, 0)",font:"800 15px var(--pv-font-heading, ui-rounded, system-ui, sans-serif)",color:"var(--pv-star, #8A6A00)",pointerEvents:"none",zIndex:"30",whiteSpace:"nowrap"}),t.appendChild(r);const o=()=>r.remove();if("reduced"===Ea(e)||!s)return void r.animate({opacity:[0,1,0]},{duration:700,easing:"ease-out"}).finished.then(o,o);const d=s.left+s.width/2-(i.left+i.width/2),l=s.top-i.top,c=Fa(wa);r.animate([{transform:"translate(-50%, 0) scale(0.8)",opacity:0},{transform:"translate(-50%, -14px) scale(1.1)",opacity:1,offset:.25},{transform:`translate(calc(-50% + ${d}px), ${l}px) scale(0.7)`,opacity:.2}],{duration:Math.max(650,c.duration),easing:"cubic-bezier(0.3, 0.7, 0.2, 1)"}).finished.then(o,o)}(this,i,e,s?.getBoundingClientRect()??null,t),window.setTimeout(()=>function(e,t){if(!e||"reduced"===Ea(t))return;const i=Fa($a);e.animate({transform:["scale(1)","scale(1.18)","scale(1)"]},{duration:i.duration,easing:i.easing})}(this.renderRoot.querySelector(".stars"),this),600))}_open(){this.dispatchEvent(new CustomEvent("pv-member-open",{detail:{member:this.model.member.id},bubbles:!0,composed:!0}))}render(){const e=this.model;if(!e)return Y;const t=e.member;return U`
      <button class="head" type="button" aria-label=${`${e.ring.label}. Open ${t.name}'s day`} @click=${this._open}>
        <pv-ring size="58" .progress=${e.ring.progress} ?closed=${e.ring.closed} color=${this.color}
          .celebrate=${this.celebrate}>
          <pv-member-avatar .member=${{...t,color:this.color}} .hass=${this.hass} size="44"></pv-member-avatar>
        </pv-ring>
        <span class="who">
          <span class="name">${t.name}</span>
          <span class="line">${e.parts.map((e,t)=>U`${t?" · ":""}<span class=${e.kind}>${e.text}</span>`)}</span>
        </span>
      </button>
      ${e.next?U`<div class="next">${this._next(e.next)}</div>`:Y}
      <div class="body">
        ${e.away?U`<div class="away">🧳 Away${e.away.note?` · ${e.away.note}`:""}. Nothing is due, and the streak keeps.</div>`:Y}
        ${e.ring.closed&&!e.entries.some(e=>"row"===e.kind&&("now"===e.zone||"later"===e.zone||"overdue"===e.zone))?U`<div class="closed"><strong>Ring closed for today</strong><span>Everything due today is done. Nice work.</span></div>`:Y}
        ${e.pictures?this._tiles(e):this._list(e)}
        ${e.empty&&!e.away?U`<div class="quiet">Nothing on the board today.</div>`:Y}
        <div class="layer"></div>
      </div>
    `}_next(e){const t=/^Next on calendar: (.*?)( · free until then)?$/.exec(e);return t?U`Next on calendar: <strong>${t[1]}</strong>${t[2]??""}`:e}_list(e){return Ya(e.entries,e=>e.key,e=>this._entry(e))}_entry(e){return"head"===e.kind?U`
        <div class="head-row ${e.tone}" data-key=${e.key}>
          <span class="text">${e.text}</span>${e.right?U`<span>${e.right}</span>`:Y}
        </div>
      `:"credit"===e.kind?U`<div class="credit" data-key=${e.key}>${e.text}</div>`:U`
      <pv-chore-item data-key=${e.key} .row=${e.row} color=${this.color} ?narrow=${this.narrow}
        ?highlight=${"now"===e.zone} ?dim=${"later"===e.zone} ?locked=${this.locked}></pv-chore-item>
    `}_tiles(e){const t=[];let i=!0;for(const s of e.entries)"row"===s.kind&&"done"!==s.zone&&(t.push({row:s.row,now:i&&"pending"!==s.row.state}),"pending"!==s.row.state&&(i=!1));const s=e.entries.flatMap(e=>"row"===e.kind&&"done"===e.zone?[e.row]:[]),a=e.entry.week_stars;return U`
      <div class="tiles">
        ${Ya(t,e=>e.row.key,t=>U`
          <pv-chore-tile .row=${t.row} color=${this.color} ?now=${t.now} ?locked=${this.locked}
            .stars=${e.member.stars?t.row.item.stars:0}></pv-chore-tile>
        `)}
        ${Ya(s,e=>e.key,e=>U`<pv-chore-tile .row=${e} color=${this.color} ?locked=${this.locked}></pv-chore-tile>`)}
      </div>
      ${e.member.stars?U`
        <div class="stickers">
          This week:
          <div class="row" role="img" aria-label=${`${a} ${1===a?"star":"stars"} this week`}>
            ${Array.from({length:Math.min(20,a)},()=>U`<span aria-hidden="true">⭐</span>`)}
            ${a>20?U`<span class="meta">+${a-20}</span>`:Y}
            ${0===a?U`<span class="meta">Stars show up here.</span>`:Y}
          </div>
        </div>
      `:Y}
    `}}sn.styles=[as,r`
      :host {
        display: flex;
        flex-direction: column;
        min-width: 0;
        min-height: 0;
        box-sizing: border-box;
        border-radius: var(--pv-radius-lg, 16px);
        background: var(--pv-card-bg, #FFFFFF);
        border: 1px solid var(--pv-border, #E7E7E3);
        border-top: 3px solid var(--member);
        overflow: hidden;
      }

      .head {
        display: flex;
        align-items: center;
        gap: 12px;
        width: 100%;
        padding: 14px 14px 8px;
        border: none;
        background: transparent;
        color: inherit;
        font: inherit;
        text-align: left;
        cursor: pointer;
        -webkit-tap-highlight-color: transparent;
      }

      .head:focus-visible {
        outline: 2px solid var(--pv-accent-ink, #5B5BD6);
        outline-offset: -2px;
        border-radius: 12px;
      }

      .who {
        min-width: 0;
        display: flex;
        flex-direction: column;
        gap: 2px;
      }

      .name {
        font-family: var(--pv-font-heading, ui-rounded, 'SF Pro Rounded', 'PlanaVista Rounded', system-ui, sans-serif);
        font-size: 1.3125rem;
        font-weight: 800;
        line-height: 1.15;
      }

      .line {
        color: var(--pv-text-secondary, #5F6670);
        font-size: 0.875rem;
        font-variant-numeric: tabular-nums;
      }

      .stars {
        display: inline-block;
      }

      .next {
        padding: 0 14px 8px;
        color: var(--pv-text-secondary, #5F6670);
        font-size: 0.8125rem;
        line-height: 1.35;
      }

      .next strong {
        color: var(--pv-text, #1A1B1E);
        font-weight: 650;
      }

      .body {
        position: relative;
        flex: 1 1 auto;
        min-height: 0;
        overflow-y: auto;
        overscroll-behavior: contain;
        padding: 0 8px 12px;
      }

      .head-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
        margin: 12px 6px 4px;
        font-size: 0.8125rem;
        font-weight: 750;
        color: var(--pv-text-muted, #8E949C);
      }

      .head-row.now {
        color: var(--pv-text, #1A1B1E);
      }

      .head-row.now::before {
        content: '';
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: var(--member);
        flex-shrink: 0;
      }

      .head-row.now .text {
        flex: 1;
      }

      .credit {
        margin: 10px 6px 0;
        font-size: 0.8125rem;
        font-weight: 750;
        color: var(--pv-text-muted, #8E949C);
      }

      .closed {
        margin: 6px 4px 4px;
        padding: 12px 14px;
        border-radius: 12px;
        background: var(--pv-accent-tint, #EEEEFC);
        color: var(--pv-text, #1A1B1E);
      }

      .closed strong {
        display: block;
        font-family: var(--pv-font-heading, ui-rounded, 'SF Pro Rounded', 'PlanaVista Rounded', system-ui, sans-serif);
        font-size: 1.0625rem;
        margin-bottom: 2px;
      }

      .closed span {
        color: var(--pv-text-secondary, #5F6670);
        font-size: 0.9375rem;
      }

      .away {
        margin: 6px 4px;
        padding: 12px 14px;
        border-radius: 12px;
        background: var(--pv-chip, #F1F1EE);
        color: var(--pv-text-secondary, #5F6670);
      }

      .quiet {
        margin: 10px 6px;
        color: var(--pv-text-muted, #8E949C);
        font-size: 0.9375rem;
      }

      .tiles {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(118px, 1fr));
        gap: 10px;
        padding: 4px 4px 0;
      }

      .stickers {
        margin: 14px 6px 0;
        font-size: 0.8125rem;
        color: var(--pv-text-secondary, #5F6670);
      }

      .stickers .row {
        display: flex;
        flex-wrap: wrap;
        gap: 2px;
        margin-top: 4px;
        font-size: 20px;
        line-height: 1.1;
      }

      .layer {
        position: absolute;
        inset: 0;
        pointer-events: none;
        overflow: visible;
      }
    `],e([ue({attribute:!1})],sn.prototype,"model",void 0),e([ue({attribute:!1})],sn.prototype,"hass",void 0),e([ue({type:String})],sn.prototype,"color",void 0),e([ue({type:Boolean,reflect:!0})],sn.prototype,"narrow",void 0),e([ue({type:Boolean})],sn.prototype,"locked",void 0),e([ue({type:Number})],sn.prototype,"celebrate",void 0),e([ue({type:Number})],sn.prototype,"pulse",void 0),e([ue({type:String,reflect:!0})],sn.prototype,"member",void 0),ge("pv-chores-column",sn);const an=12;class nn extends le{constructor(){super(...arguments),this.household=null,this.session=null,this.data=null,this.timeFormat="12h",this.mode="light",this.layout="landscape",this.minute=0,this._width=0,this._phoneIndex=0,this._celebrate={},this._pulse={},this._family=!1,this._closed=new Map,this._evening=!1,this._familyShown=!1,this._touch=null,this._columnsFor=vt((e,t,i,s,a)=>{const n=t?Pi(t.members):[],r=new Date;return ks(e,{today:e.today,now:r,events:vs(i,new Date(e.day.start),new Date(e.day.end)),timeFormat:s,activities:new Map(e.chores.map(e=>[e.id,e])),members:n})}),this._touchStart=e=>{this._touch=1===e.touches.length?{x:e.touches[0].clientX,y:e.touches[0].clientY}:null}}connectedCallback(){super.connectedCallback(),this._observer=new ResizeObserver(e=>{const t=Math.round(e[0]?.contentRect.width??0);Math.abs(t-this._width)>=1&&(this._width=t)}),this._observer.observe(this)}disconnectedCallback(){super.disconnectedCallback(),this._observer?.disconnect()}_columns(){return this._columnsFor(this.board,this.household,this.data,this.timeFormat,this.minute)}willUpdate(e){if(!e.has("board")&&!e.has("minute"))return;const t=this._columns(),i=void 0!==e.get("board")||this._closed.size>0,s={...this._celebrate};let a=!1;for(const e of t){const t=this._closed.get(e.member.id);i&&!1===t&&e.ring.closed&&(s[e.member.id]=(s[e.member.id]??0)+1,a=!0),this._closed.set(e.member.id,e.ring.closed)}const n=function(e){const t=e.filter(e=>e.entry.today.due>0);return t.length>0&&t.every(e=>e.ring.closed)}(t);if(n&&i&&!this._familyShown&&a){this._familyShown=!0,this._family=!0;for(const e of t)e.entry.today.due>0&&(s[e.member.id]=(s[e.member.id]??0)+1);window.setTimeout(()=>{this._family=!1},6e3)}n||(this._familyShown=!1),a&&(this._celebrate=s,Ca("ring"),this.board.settings.sound&&Da(!0));const r=Fs(t,this.board,new Date);if(r&&!this._evening&&this._closed.size>0){const e={...this._pulse};for(const t of r.members)e[t]=(e[t]??0)+1;this._pulse=e}this._evening=!!r}flyStars(e,t,i){const s=this.renderRoot.querySelector(`pv-chores-column[member="${e}"]`);s?.flyStars(t,i)}render(){if(!this.board)return Y;const e=this._columns(),t=Fs(e,this.board,new Date),i=U`
      ${this._family?U`<div class="celebrate" role="status">🎉 Everyone closed their ring today. What a team.</div>`:Y}
      ${t?U`<div class="banner info" role="status"><span class="text">${t.text}</span></div>`:Y}
    `;if("phone"===this.layout)return U`${i}${this._phone(e)}`;const s=Math.max(0,this._width-24),a=function(e,t,i=12,s=240){if(e<=0)return[];const a=Math.max(1,Math.floor((t+i)/(s+i)));if(e<=a)return[e];const n=Math.ceil(e/a),r=Math.ceil(e/n),o=[];let d=e;for(;d>0;)o.push(Math.min(r,d)),d-=r;return o}(e.length,s||1200,an),n=Math.max(...a,1),r=s>0&&(s-an*(n-1))/n<300;let o=0;return U`
      ${i}
      <div class="rows">
        ${a.map(t=>{const i=e.slice(o,o+t);return o+=t,U`<div class="row">${Ya(i,e=>e.member.id,e=>this._column(e,r))}</div>`})}
      </div>
    `}_column(e,t){const i=e.member.id;return U`
      <pv-chores-column member=${i} .model=${e} .hass=${this.hass} color=${Ni(e.member,this.mode)}
        ?narrow=${t} ?locked=${"no"===is(this.household,this.session,i)}
        .celebrate=${this._celebrate[i]??0} .pulse=${this._pulse[i]??0}></pv-chores-column>
    `}_phone(e){if(0===e.length)return Y;const t=Math.min(this._phoneIndex,e.length-1),i=e[t];return U`
      <div class="people" role="tablist" aria-label="Whose chores">
        ${e.map((e,i)=>U`
          <button type="button" class="person ${i===t?"on":""}" role="tab" aria-selected=${i===t?"true":"false"}
            @click=${()=>this._show(i)}>
            <pv-ring size="40" .progress=${e.ring.progress} ?closed=${e.ring.closed} color=${Ni(e.member,this.mode)}>
              <pv-member-avatar .member=${{...e.member,color:Ni(e.member,this.mode)}} .hass=${this.hass} size="28"></pv-member-avatar>
            </pv-ring>
            ${e.member.name}
          </button>
        `)}
      </div>
      <div class="phone" @touchstart=${this._touchStart} @touchend=${t=>this._touchEnd(t,e.length)}>
        ${this._column(i,!0)}
      </div>
    `}_show(e){const t=this._phoneIndex;this._phoneIndex=e,t!==e&&"reduced"!==Ea(this)&&this.updateComplete.then(()=>{const i=this.renderRoot.querySelector(".phone pv-chores-column");i?.animate({transform:[`translateX(${e>t?24:-24}px)`,"translateX(0)"],opacity:[.4,1]},{duration:220,easing:"ease-out"})})}_touchEnd(e,t){const i=this._touch;this._touch=null;const s=e.changedTouches[0];if(!i||!s)return;const a=mt(s.clientX-i.x,s.clientY-i.y);"next"===a&&this._phoneIndex<t-1&&this._show(this._phoneIndex+1),"prev"===a&&this._phoneIndex>0&&this._show(this._phoneIndex-1)}}nn.styles=[as,r`
      :host {
        display: flex;
        flex-direction: column;
        flex: 1 1 auto;
        min-height: 0;
      }

      .rows {
        flex: 1 1 auto;
        min-height: 0;
        display: flex;
        flex-direction: column;
        gap: ${an}px;
        padding: ${an}px;
      }

      .row {
        flex: 1 1 0;
        min-height: 0;
        display: flex;
        gap: ${an}px;
      }

      pv-chores-column {
        flex: 1 1 0;
      }

      .people {
        display: flex;
        gap: 6px;
        padding: 10px 12px 0;
        overflow-x: auto;
        scrollbar-width: none;
      }

      .person {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 2px;
        min-width: 56px;
        min-height: 48px;
        padding: 2px 4px;
        border: none;
        border-radius: 12px;
        background: transparent;
        color: var(--pv-text-secondary, #5F6670);
        font: inherit;
        font-size: 0.75rem;
        font-weight: 700;
        cursor: pointer;
      }

      .person.on {
        color: var(--pv-text, #1A1B1E);
        background: var(--pv-card-bg, #FFFFFF);
      }

      .phone {
        flex: 1 1 auto;
        min-height: 0;
        display: flex;
        padding: ${an}px;
      }

      .phone pv-chores-column {
        flex: 1 1 auto;
      }

      .celebrate {
        margin: 10px 12px 0;
        padding: 10px 14px;
        border-radius: 12px;
        background: var(--pv-accent-tint, #EEEEFC);
        color: var(--pv-accent-tint-ink, #3B3BB0);
        font-weight: 750;
        text-align: center;
      }
    `],e([ue({attribute:!1})],nn.prototype,"board",void 0),e([ue({attribute:!1})],nn.prototype,"household",void 0),e([ue({attribute:!1})],nn.prototype,"session",void 0),e([ue({attribute:!1})],nn.prototype,"data",void 0),e([ue({attribute:!1})],nn.prototype,"hass",void 0),e([ue({attribute:!1})],nn.prototype,"timeFormat",void 0),e([ue({attribute:!1})],nn.prototype,"mode",void 0),e([ue({type:String,reflect:!0})],nn.prototype,"layout",void 0),e([ue({attribute:!1})],nn.prototype,"minute",void 0),e([me()],nn.prototype,"_width",void 0),e([me()],nn.prototype,"_phoneIndex",void 0),e([me()],nn.prototype,"_celebrate",void 0),e([me()],nn.prototype,"_pulse",void 0),e([me()],nn.prototype,"_family",void 0),ge("pv-chores-board",nn);class rn extends le{constructor(){super(...arguments),this.layout="landscape",this.heading="",this.body="",this.people=[],this.colorOf=e=>e.color,this._motion=new Ba(this),this._detach=null,this._closing=!1,this._key=e=>{if("Escape"===e.key)return e.preventDefault(),void this._pick(null);Ma(this.shadowRoot,e)}}firstUpdated(){const e=this.renderRoot.querySelector(".panel"),t=this.renderRoot.querySelector(".backdrop");this._motion.open(e,t),this._detach=this._motion.attachDrag(this.renderRoot.querySelector(".grab-zone"),e,()=>this._pick(null)),this.renderRoot.querySelector(".face")?.focus()}disconnectedCallback(){super.disconnectedCallback(),this._detach?.()}render(){return U`
      <div class="backdrop" @click=${()=>this._pick(null)}></div>
      <div class="panel" role="dialog" aria-modal="true" aria-labelledby="people-heading" @keydown=${this._key}>
        <div class="grab-zone" aria-hidden="true"><div class="grab"></div></div>
        <h2 class="heading" id="people-heading">${this.heading}</h2>
        ${this.body?U`<p class="body">${this.body}</p>`:Y}
        <div class="faces">
          ${this.people.map(e=>U`
            <button class="face" type="button" @click=${()=>this._pick(e)}>
              <pv-member-avatar .member=${{...e,color:this.colorOf(e)}} .hass=${this.hass} size="56"></pv-member-avatar>
              ${e.name}
            </button>
          `)}
        </div>
        <div class="actions">
          <button class="pv-btn pv-btn-secondary" type="button" @click=${()=>this._pick(null)}>Cancel</button>
        </div>
      </div>
    `}async _pick(e){if(this._closing)return;this._closing=!0;const t=this.renderRoot.querySelector(".panel"),i=this.renderRoot.querySelector(".backdrop");await this._motion.close(t,i),this.dispatchEvent(new CustomEvent("pv-person-pick",{detail:{member:e},bubbles:!0,composed:!0}))}}rn.styles=[ot,za,r`
      .faces {
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
        gap: 14px;
        margin: 14px 0 6px;
      }

      .face {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 6px;
        min-width: 72px;
        min-height: 48px;
        padding: 6px;
        border: none;
        border-radius: 14px;
        background: transparent;
        color: inherit;
        font: inherit;
        font-weight: 700;
        cursor: pointer;
      }

      .face:hover,
      .face:focus-visible {
        background: var(--pv-chip, #F1F1EE);
        outline: none;
      }
    `],e([ue({type:String,reflect:!0})],rn.prototype,"layout",void 0),e([ue({type:String})],rn.prototype,"heading",void 0),e([ue({type:String})],rn.prototype,"body",void 0),e([ue({attribute:!1})],rn.prototype,"people",void 0),e([ue({attribute:!1})],rn.prototype,"hass",void 0),e([ue({attribute:!1})],rn.prototype,"colorOf",void 0),ge("pv-chores-people-sheet",rn);const on={plan_day:"📅",more_time:"⏰",skip:"🛌",done_by:"🙋",history:"📜",undo:"↩️",change_due:"🗓️",hand_off:"🔁",excuse:"🤒",delete:"🗑️",approve:"✅",send_back:"↩️"},dn=["Not finished","Missed a spot","Do it again"];class ln extends le{constructor(){super(...arguments),this.layout="landscape",this.color="#5B5BD6",this.history=null,this.busy=!1,this._open=null,this._note="",this._motion=new Ba(this),this._detach=null,this._closing=!1,this._key=e=>{if("Escape"===e.key)return e.preventDefault(),void this.close();Ma(this.shadowRoot,e)}}firstUpdated(){this.style.setProperty("--member",this.color);const e=this.renderRoot.querySelector(".panel"),t=this.renderRoot.querySelector(".backdrop");this._motion.open(e,t),this._detach=this._motion.attachDrag(this.renderRoot.querySelector(".grab-zone"),e,()=>{this.close()}),this.renderRoot.querySelector(".option > button")?.focus()}disconnectedCallback(){super.disconnectedCallback(),this._detach?.()}async close(){if(this._closing)return;this._closing=!0;const e=this.renderRoot.querySelector(".panel"),t=this.renderRoot.querySelector(".backdrop");await this._motion.close(e,t),this.dispatchEvent(new CustomEvent("pv-sheet-close",{bubbles:!0,composed:!0}))}render(){const e=this.model;return e?U`
      <div class="backdrop" @click=${()=>{this.close()}}></div>
      <div class="panel" role="dialog" aria-modal="true" aria-labelledby="options-title" @keydown=${this._key}
        aria-busy=${this.busy?"true":"false"}>
        <div class="grab-zone" aria-hidden="true"><div class="grab"></div></div>
        <div class="top">
          <h2 id="options-title">${e.title}</h2>
          <div class="meta-line">${e.meta}</div>
          ${e.added?U`<div class="added">${e.added}</div>`:Y}
          ${e.note?U`<div class="note"><span class="badge ${e.note.startsWith("Sent back")?"bad":"act"}">${e.note}</span></div>`:Y}
        </div>
        ${e.member.map(e=>this._option(e))}
        ${e.parent.length?U`<div class="group">For parents</div>${e.parent.map(e=>this._option(e))}`:Y}
        <div class="actions">
          <button class="pv-btn pv-btn-secondary" type="button" @click=${()=>{this.close()}}>Done</button>
        </div>
      </div>
    `:Y}_option(e){const t=this._open===e.id,i=!!e.chips?.length||!!e.pick||"history"===e.id||"send_back"===e.id;return U`
      <div class="option ${e.destructive?"destructive":""}">
        <button type="button" ?disabled=${e.disabled||this.busy} aria-expanded=${i?t?"true":"false":Y}
          @click=${()=>this._tap(e,i)}>
          <span class="icon" aria-hidden="true">${on[e.id]}</span>
          <span class="words">
            <span class="label">${e.label}</span>
            ${e.hint?U`<span class="hint">${e.hint}</span>`:Y}
          </span>
          ${e.tag?U`<span class="tag ${"needs OK"===e.tag?"ask":""}">${e.tag}</span>`:Y}
        </button>
        ${t?this._more(e):Y}
      </div>
    `}_more(e){return"history"===e.id?this.history?U`<ul class="history">${this.history.map(e=>U`<li>${e}</li>`)}</ul>`:U`<ul class="history" aria-busy="true"><li class="bone loading"></li><li class="bone loading"></li></ul>`:"send_back"===e.id?U`
        <div class="chips">
          ${dn.map(t=>U`
            <button class="chip" type="button" @click=${()=>this._choose(e.id,t)}>${t}</button>
          `)}
          <input type="text" maxlength="60" placeholder="Write a note…" aria-label="Write a note" .value=${this._note}
            @input=${e=>{this._note=e.target.value}}
            @keydown=${t=>{"Enter"===t.key&&this._note.trim()&&this._choose(e.id,this._note.trim())}} />
          ${this._note.trim()?U`<button class="chip" type="button" @click=${()=>this._choose(e.id,this._note.trim())}>Send back</button>`:Y}
        </div>
      `:U`
      <div class="chips">
        ${(e.chips??[]).map(t=>U`
          <button class="chip" type="button" @click=${()=>this._choose(e.id,t.day)}>${t.label}</button>
        `)}
        ${e.pick?U`
          <input type="date" aria-label="Pick a date" min=${e.pick.min} max=${e.pick.max??Y}
            @change=${t=>{const i=t.target.value;i&&this._choose(e.id,i)}} />
        `:Y}
      </div>
    `}_tap(e,t){if(t)return this._open=this._open===e.id?null:e.id,void("history"===e.id&&"history"===this._open&&this._choose("history"));this._choose(e.id)}_choose(e,t){this.dispatchEvent(new CustomEvent("pv-option",{detail:{id:e,value:t},bubbles:!0,composed:!0}))}}ln.styles=[ot,za,as,r`
      .panel {
        padding-top: 0;
        border-top: 4px solid var(--member);
      }

      :host([layout='landscape']) .panel {
        width: min(460px, calc(100vw - 32px));
        padding-top: 0;
      }

      .top {
        padding: 18px 2px 12px;
        border-bottom: 1px solid var(--pv-border, #E7E7E3);
      }

      h2 {
        margin: 0;
        font-family: var(--pv-font-heading, ui-rounded, 'SF Pro Rounded', 'PlanaVista Rounded', system-ui, sans-serif);
        font-size: 1.25rem;
        font-weight: 800;
      }

      .meta-line {
        margin-top: 4px;
        color: var(--pv-text-secondary, #5F6670);
        font-size: 0.9375rem;
      }

      .added {
        margin-top: 2px;
        color: var(--pv-text-muted, #8E949C);
        font-size: 0.875rem;
      }

      .note {
        margin-top: 8px;
      }

      .group {
        margin: 14px 2px 2px;
        font-size: 0.75rem;
        font-weight: 750;
        text-transform: uppercase;
        letter-spacing: 0.04em;
        color: var(--pv-text-muted, #8E949C);
      }

      .option {
        border-bottom: 1px solid var(--pv-border-subtle, #F1F1EE);
      }

      .option > button {
        display: flex;
        align-items: center;
        gap: 12px;
        width: 100%;
        min-height: 56px;
        padding: 8px 2px;
        border: none;
        background: transparent;
        color: inherit;
        font: inherit;
        text-align: left;
        cursor: pointer;
      }

      .option > button:focus-visible {
        outline: 2px solid var(--pv-accent-ink, #5B5BD6);
        outline-offset: -2px;
        border-radius: 10px;
      }

      .option > button[disabled] {
        opacity: 0.5;
        cursor: default;
      }

      .icon {
        width: 28px;
        flex-shrink: 0;
        text-align: center;
        font-size: 1.125rem;
      }

      .words {
        flex: 1 1 auto;
        min-width: 0;
        display: flex;
        flex-direction: column;
        gap: 2px;
      }

      .label {
        font-size: 1rem;
      }

      .option.destructive .label {
        color: var(--pv-danger, #C62828);
      }

      .hint {
        color: var(--pv-text-secondary, #5F6670);
        font-size: 0.8125rem;
        line-height: 1.35;
      }

      .tag {
        flex-shrink: 0;
        padding: 3px 8px;
        border-radius: 8px;
        background: var(--pv-chip, #F1F1EE);
        color: var(--pv-text-secondary, #5F6670);
        font-size: 0.75rem;
        font-weight: 700;
        white-space: nowrap;
      }

      .tag.ask {
        background: var(--pv-warn-bg, #FDF1DC);
        color: var(--pv-warn-ink, #8A5A00);
      }

      .chips {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        padding: 0 2px 14px 42px;
      }

      .chip {
        min-height: 40px;
        padding: 0 14px;
        border-radius: 999px;
        border: 1px solid var(--pv-border, #E7E7E3);
        background: var(--pv-card-bg, #FFFFFF);
        color: var(--pv-text, #1A1B1E);
        font: inherit;
        font-weight: 650;
        cursor: pointer;
      }

      .chip:hover,
      .chip:focus-visible {
        border-color: var(--pv-accent, #5B5BD6);
        outline: none;
      }

      input[type='date'],
      input[type='text'] {
        min-height: 40px;
        padding: 0 12px;
        border-radius: 12px;
        border: 1px solid var(--pv-border, #E7E7E3);
        background: var(--pv-card-bg, #FFFFFF);
        color: var(--pv-text, #1A1B1E);
        font: inherit;
      }

      .history {
        margin: 0;
        padding: 0 2px 14px 42px;
        list-style: none;
        display: flex;
        flex-direction: column;
        gap: 4px;
        color: var(--pv-text-secondary, #5F6670);
      }

      .loading {
        width: 60%;
        height: 14px;
      }

      .actions {
        margin-top: 14px;
      }
    `],e([ue({type:String,reflect:!0})],ln.prototype,"layout",void 0),e([ue({attribute:!1})],ln.prototype,"model",void 0),e([ue({type:String})],ln.prototype,"color",void 0),e([ue({attribute:!1})],ln.prototype,"history",void 0),e([ue({type:Boolean})],ln.prototype,"busy",void 0),e([me()],ln.prototype,"_open",void 0),e([me()],ln.prototype,"_note",void 0),ge("pv-chore-options",ln);class cn extends le{constructor(){super(...arguments),this.layout="landscape",this.colorOf=e=>e.color,this.busy=new Set,this._sendingBack=null,this._note="",this._motion=new Ba(this),this._detach=null,this._closing=!1,this._key=e=>{if("Escape"===e.key)return e.preventDefault(),void this.close();"landscape"!==this.layout&&Ma(this.shadowRoot,e)}}firstUpdated(){const e=this.renderRoot.querySelector(".panel"),t=this.renderRoot.querySelector(".backdrop");if("landscape"===this.layout)if("reduced"===Ea(this))e.animate({opacity:[0,1]},{duration:150});else{const t=Fa(wa);e.animate({transform:["translateX(100%)","translateX(0)"]},{duration:t.duration,easing:t.easing})}else this._motion.open(e,t),this._detach=this._motion.attachDrag(this.renderRoot.querySelector(".grab-zone"),e,()=>{this.close()});this.renderRoot.querySelector(".answers button, .done")?.focus()}updated(e){e.has("groups")&&this._sendingBack&&!this._all().some(e=>e.id===this._sendingBack)&&(this._sendingBack=null)}disconnectedCallback(){super.disconnectedCallback(),this._detach?.()}async close(){if(this._closing)return;this._closing=!0;const e=this.renderRoot.querySelector(".panel"),t=this.renderRoot.querySelector(".backdrop");if("landscape"===this.layout){const t="reduced"===Ea(this)?e.animate({opacity:[1,0]},{duration:120,fill:"forwards"}):e.animate({transform:["translateX(0)","translateX(100%)"]},{duration:220,easing:"cubic-bezier(.4,0,1,1)",fill:"forwards"});await t.finished.catch(()=>{})}else await this._motion.close(e,t);this.dispatchEvent(new CustomEvent("pv-sheet-close",{bubbles:!0,composed:!0}))}_all(){const e=this.groups;return e?[...e.chores,...e.requests,...e.rewards]:[]}render(){const e=this.groups;return e?U`
      <div class="backdrop" @click=${()=>{this.close()}}></div>
      <div class="panel" role="dialog" aria-modal=${"landscape"===this.layout?"false":"true"} aria-labelledby="inbox-title"
        @keydown=${this._key}>
        <div class="grab-zone" aria-hidden="true"><div class="grab"></div></div>
        <div class="top">
          <h2 id="inbox-title">Waiting for OK${e.count?` · ${e.count}`:""}</h2>
          <button class="pv-btn pv-btn-ghost done" type="button" @click=${()=>{this.close()}}>Done</button>
        </div>
        ${0===e.count?U`
          <div class="empty"><div class="art" aria-hidden="true">✅</div>Nothing is waiting. Check-offs that need a parent's OK, requests, and rewards land here.</div>
        `:Y}
        ${e.chores.length?U`
          <div class="group"><span>Chores to check</span>
            <button class="link" type="button" ?disabled=${this.busy.size>0}
              @click=${()=>this.dispatchEvent(new CustomEvent("pv-approve-all",{bubbles:!0,composed:!0}))}>Approve all (${e.chores.length})</button>
          </div>
          ${e.chores.map(e=>this._row(e))}
        `:Y}
        ${e.requests.length?U`<div class="group"><span>Requests</span></div>${e.requests.map(e=>this._row(e))}`:Y}
        ${e.rewards.length?U`<div class="group"><span>Rewards</span></div>${e.rewards.map(e=>this._row(e))}`:Y}
      </div>
    `:Y}_row(e){const t=this.busy.has(e.id),i=e.member;return U`
      <div class="row" aria-busy=${t?"true":"false"}>
        ${i?U`<pv-member-avatar .member=${{...i,color:this.colorOf(i)}} .hass=${this.hass} size="32"></pv-member-avatar>`:Y}
        <div class="words">
          <div class="what">${e.lead} <strong>${e.what}</strong>${e.tail}</div>
          <div class="detail">${e.detail}</div>
        </div>
        <div class="answers">
          <button class="pv-btn pv-btn-secondary" type="button" ?disabled=${t}
            @click=${()=>this._decline(e)}>${e.decline}</button>
          <button class="pv-btn pv-btn-primary" type="button" ?disabled=${t||e.blocked}
            @click=${()=>this._review(e,!0)}>${t?"Saving…":e.allow}</button>
        </div>
      </div>
      ${this._sendingBack===e.id?U`
        <div class="reasons">
          <span class="lead">Sending back: what should change?</span>
          ${dn.map(t=>U`<button class="chip" type="button" @click=${()=>this._review(e,!1,t)}>${t}</button>`)}
          <input type="text" maxlength="60" placeholder="Write a note…" aria-label="Write a note" .value=${this._note}
            @input=${e=>{this._note=e.target.value}}
            @keydown=${t=>{"Enter"===t.key&&this._review(e,!1,this._note.trim()||null)}} />
          <button class="chip" type="button" @click=${()=>this._review(e,!1,this._note.trim()||null)}>Send back</button>
        </div>
      `:Y}
    `}_decline(e){if("completion"===e.kind)return this._sendingBack=this._sendingBack===e.id?null:e.id,void(this._note="");this._review(e,!1)}_review(e,t,i){this._sendingBack=null,this.dispatchEvent(new CustomEvent("pv-review",{detail:{row:e,allow:t,note:i},bubbles:!0,composed:!0}))}}cn.styles=[ot,za,r`
      :host([layout='landscape']) {
        position: absolute;
        inset: 0 0 0 auto;
        width: min(400px, 100%);
        z-index: 30;
        display: block;
      }

      :host([layout='landscape']) .backdrop {
        display: none;
      }

      :host([layout='landscape']) .panel {
        position: absolute;
        inset: 0;
        width: auto;
        max-height: none;
        border-radius: 0;
        border-left: 1px solid var(--pv-border, #E7E7E3);
        box-shadow: -12px 0 32px rgba(0, 0, 0, 0.12);
        padding: 0 0 20px;
        overflow-y: auto;
      }

      .top {
        position: sticky;
        top: 0;
        z-index: 1;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        padding: 14px 16px 12px;
        background: var(--pv-card-bg, #FFFFFF);
        border-bottom: 1px solid var(--pv-border, #E7E7E3);
      }

      h2 {
        margin: 0;
        font-family: var(--pv-font-heading, ui-rounded, 'SF Pro Rounded', 'PlanaVista Rounded', system-ui, sans-serif);
        font-size: 1.25rem;
        font-weight: 800;
      }

      .done {
        min-height: 44px;
        font-weight: 750;
      }

      .group {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin: 16px 16px 4px;
        font-size: 0.8125rem;
        font-weight: 750;
        color: var(--pv-text-muted, #8E949C);
      }

      .link {
        min-height: 40px;
        padding: 0 4px;
        border: none;
        background: transparent;
        color: var(--pv-accent-ink, #5B5BD6);
        font: inherit;
        font-weight: 750;
        cursor: pointer;
      }

      .row {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 10px 16px;
        border-bottom: 1px solid var(--pv-border-subtle, #F1F1EE);
      }

      .words {
        flex: 1 1 auto;
        min-width: 0;
      }

      .what {
        line-height: 1.35;
      }

      .detail {
        margin-top: 2px;
        color: var(--pv-text-secondary, #5F6670);
        font-size: 0.8125rem;
      }

      .answers {
        display: flex;
        gap: 8px;
        flex-shrink: 0;
      }

      .answers button {
        min-height: 44px;
        padding: 0 14px;
      }

      :host([layout='phone']) .row {
        flex-wrap: wrap;
      }

      :host([layout='phone']) .answers {
        width: 100%;
        justify-content: flex-end;
      }

      .reasons {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        padding: 0 16px 12px 60px;
      }

      .reasons .lead {
        width: 100%;
        color: var(--pv-text-secondary, #5F6670);
        font-size: 0.8125rem;
      }

      .chip {
        min-height: 40px;
        padding: 0 14px;
        border-radius: 999px;
        border: 1px solid var(--pv-border, #E7E7E3);
        background: var(--pv-card-bg, #FFFFFF);
        color: var(--pv-text, #1A1B1E);
        font: inherit;
        font-weight: 650;
        cursor: pointer;
      }

      input {
        min-height: 40px;
        padding: 0 12px;
        border-radius: 12px;
        border: 1px solid var(--pv-border, #E7E7E3);
        background: var(--pv-card-bg, #FFFFFF);
        color: var(--pv-text, #1A1B1E);
        font: inherit;
      }

      .empty {
        padding: 32px 24px;
        text-align: center;
        color: var(--pv-text-secondary, #5F6670);
        line-height: 1.5;
      }

      .empty .art {
        font-size: 32px;
      }
    `],e([ue({type:String,reflect:!0})],cn.prototype,"layout",void 0),e([ue({attribute:!1})],cn.prototype,"groups",void 0),e([ue({attribute:!1})],cn.prototype,"hass",void 0),e([ue({attribute:!1})],cn.prototype,"colorOf",void 0),e([ue({attribute:!1})],cn.prototype,"busy",void 0),e([me()],cn.prototype,"_sendingBack",void 0),e([me()],cn.prototype,"_note",void 0),ge("pv-chores-inbox",cn);class pn extends le{constructor(){super(...arguments),this.layout="landscape",this.people=[],this.colorOf=e=>e.color,this.today="",this.minutesPerStar=15,this.busy=!1,this._draft={name:"",who:[],when:"today",by:null,every:"weekly",minutes:15,needsOk:!1,needsOkSet:!1,stars:null},this._problem=null,this._other=!1,this._changeStars=!1,this._motion=new Ba(this),this._detach=null,this._closing=!1,this._add=()=>{const e=_a(this._draft,this.today);this._problem=e,e||this.dispatchEvent(new CustomEvent("pv-quick-add",{detail:{draft:this._draft},bubbles:!0,composed:!0}))},this._key=e=>{if("Escape"===e.key)return e.preventDefault(),void this.close();Ma(this.shadowRoot,e)}}firstUpdated(){const e=this.renderRoot.querySelector(".panel"),t=this.renderRoot.querySelector(".backdrop");this._motion.open(e,t),this._detach=this._motion.attachDrag(this.renderRoot.querySelector(".grab-zone"),e,()=>{this.close()}),this.renderRoot.querySelector("#name")?.focus()}disconnectedCallback(){super.disconnectedCallback(),this._detach?.()}async close(){if(this._closing)return;this._closing=!0;const e=this.renderRoot.querySelector(".panel"),t=this.renderRoot.querySelector(".backdrop");await this._motion.close(e,t),this.dispatchEvent(new CustomEvent("pv-sheet-close",{bubbles:!0,composed:!0}))}_set(e){this._draft={...this._draft,...e},this._problem&&(this._problem=_a(this._draft,this.today))}_toggle(e){const t=this._draft.who.includes(e.id)?this._draft.who.filter(t=>t!==e.id):[...this._draft.who,e.id];this._draft=function(e,t,i){return{...e,who:t,needsOk:e.needsOkSet?e.needsOk:va(t,i)}}(this._draft,t,this.people),this._problem&&(this._problem=_a(this._draft,this.today))}render(){const e=this._draft;return U`
      <div class="backdrop" @click=${()=>{this.close()}}></div>
      <div class="panel" role="dialog" aria-modal="true" aria-labelledby="add-title" @keydown=${this._key}>
        <div class="grab-zone" aria-hidden="true"><div class="grab"></div></div>
        <div class="bar">
          <button class="text" type="button" @click=${()=>{this.close()}}>Cancel</button>
          <h2 id="add-title">New chore</h2>
          <button class="text add" type="button" ?disabled=${this.busy} @click=${this._add}>${this.busy?"Adding…":"Add"}</button>
        </div>
        <section>
          <label class="title" for="name">What needs doing?</label>
          <input id="name" type="text" maxlength="60" placeholder="Clean out the garage" autocomplete="off" .value=${e.name}
            @input=${e=>this._set({name:e.target.value})}
            @keydown=${e=>{"Enter"===e.key&&this._add()}} />
        </section>
        <section>
          <span class="title" id="who-title">Who</span>
          <div class="faces" role="group" aria-labelledby="who-title">
            ${this.people.map(t=>U`
              <button class="face" type="button" aria-pressed=${e.who.includes(t.id)?"true":"false"}
                style="--face:${this.colorOf(t)}" @click=${()=>this._toggle(t)}>
                <pv-member-avatar .member=${{...t,color:this.colorOf(t)}} .hass=${this.hass} size="40"></pv-member-avatar>
                ${t.name}
              </button>
            `)}
          </div>
        </section>
        <section>
          <span class="title">When</span>
          <div class="seg" role="group" aria-label="When">
            ${[{id:"today",label:"Today"},{id:"by",label:"By a date"},{id:"repeats",label:"Repeats"}].map(t=>U`<button type="button" aria-pressed=${e.when===t.id?"true":"false"} @click=${()=>this._set({when:t.id})}>${t.label}</button>`)}
          </div>
          ${"by"===e.when?U`
            <div class="chips">
              ${ga(this.today).map(t=>U`
                <button class="chip" type="button" aria-pressed=${e.by===t.day?"true":"false"} @click=${()=>this._set({by:t.day})}>${t.label}</button>
              `)}
              <input type="date" aria-label="Pick a date" min=${this.today} .value=${e.by&&!ga(this.today).some(t=>t.day===e.by)?e.by:""}
                @change=${e=>this._set({by:e.target.value||null})} />
            </div>
          `:Y}
          ${"repeats"===e.when?U`
            <div class="chips">
              ${function(e){const t=os(e);return[{id:"daily",label:"Every day"},{id:"weekly",label:`Every ${ya[t.getDay()]}`},{id:"monthly",label:`Every month on the ${fa(Math.min(28,t.getDate()))}`}]}(this.today).map(t=>U`
                <button class="chip" type="button" aria-pressed=${e.every===t.id?"true":"false"} @click=${()=>this._set({every:t.id})}>${t.label}</button>
              `)}
            </div>
          `:Y}
        </section>
        <section>
          <span class="title">About how long?</span>
          <div class="chips">
            ${ma.map(t=>U`
              <button class="chip" type="button" aria-pressed=${this._other||e.minutes!==t?"false":"true"}
                @click=${()=>{this._other=!1,this._set({minutes:t})}}>${hs(t)}</button>
            `)}
            <button class="chip" type="button" aria-pressed=${this._other?"true":"false"} @click=${()=>{this._other=!0}}>Other</button>
            ${this._other?U`
              <input type="number" min="1" max="1440" inputmode="numeric" aria-label="Minutes" .value=${String(e.minutes)}
                @input=${e=>this._set({minutes:Number(e.target.value)})} /> min
            `:Y}
          </div>
        </section>
        <section>
          <div class="switch-row">
            <div>
              <div>Needs a parent's OK</div>
              <div class="caption">On for young children automatically</div>
            </div>
            <button class="switch" type="button" role="switch" aria-checked=${e.needsOk?"true":"false"} aria-label="Needs a parent's OK"
              @click=${()=>this._set({needsOk:!e.needsOk,needsOkSet:!0})}></button>
          </div>
        </section>
        <section>
          <span class="worth">${function(e,t){const i=function(e,t,i){return null!=i?Math.trunc(i):Math.max(1,Math.floor(e/t+.5+1e-9))}(e.minutes,t,e.stars);return null!==e.stars?`Earns ★ ${i} each time`:`Earns ★ ${i} (${function(e){return 1===e?"1 per minute":`1 per ${e} minutes`}(t)})`}(e,this.minutesPerStar)}</span>
          <button class="text" type="button" @click=${()=>{this._changeStars=!this._changeStars}}>Change</button>
          ${this._changeStars?U`
            <div class="stepper">
              <button class="pv-btn pv-btn-secondary" type="button" aria-label="Fewer stars"
                @click=${()=>this._set({stars:Math.max(0,(e.stars??1)-1)})}>−</button>
              <button class="pv-btn pv-btn-secondary" type="button" aria-label="More stars"
                @click=${()=>this._set({stars:Math.min(100,(e.stars??0)+1)})}>+</button>
              <button class="text" type="button" ?disabled=${null===e.stars} @click=${()=>this._set({stars:null})}>Automatic</button>
            </div>
          `:Y}
          ${this._problem?U`<div class="problem" role="alert">${this._problem}</div>`:Y}
        </section>
      </div>
    `}}pn.styles=[ot,za,r`
      :host([layout='landscape']) .panel {
        width: min(480px, calc(100vw - 32px));
      }

      .bar {
        display: grid;
        grid-template-columns: 1fr auto 1fr;
        align-items: center;
        margin: -4px -6px 10px;
      }

      .bar h2 {
        margin: 0;
        font-family: var(--pv-font-heading, ui-rounded, 'SF Pro Rounded', 'PlanaVista Rounded', system-ui, sans-serif);
        font-size: 1.125rem;
        font-weight: 800;
      }

      .bar .add {
        justify-self: end;
        font-weight: 800;
      }

      .text {
        min-height: 44px;
        padding: 0 8px;
        border: none;
        background: transparent;
        color: var(--pv-accent-ink, #5B5BD6);
        font: inherit;
        font-weight: 650;
        cursor: pointer;
      }

      .text[disabled] {
        opacity: 0.5;
      }

      section {
        padding: 12px 0;
        border-top: 1px solid var(--pv-border-subtle, #F1F1EE);
      }

      label.title,
      .title {
        display: block;
        margin-bottom: 8px;
        font-size: 0.8125rem;
        font-weight: 750;
        color: var(--pv-text-secondary, #5F6670);
      }

      input[type='text'],
      input[type='number'],
      input[type='date'] {
        box-sizing: border-box;
        min-height: 48px;
        padding: 0 14px;
        border-radius: 12px;
        border: 1px solid var(--pv-border, #E7E7E3);
        background: var(--pv-card-bg, #FFFFFF);
        color: var(--pv-text, #1A1B1E);
        font: inherit;
      }

      input[type='text'] {
        width: 100%;
        font-size: 1.0625rem;
      }

      input:focus-visible {
        outline: 2px solid var(--pv-accent, #5B5BD6);
        outline-offset: 1px;
      }

      .faces {
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
      }

      .face {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 4px;
        min-width: 56px;
        min-height: 48px;
        padding: 4px;
        border: none;
        border-radius: 14px;
        background: transparent;
        color: var(--pv-text-secondary, #5F6670);
        font: inherit;
        font-size: 0.8125rem;
        font-weight: 700;
        cursor: pointer;
        opacity: 0.55;
      }

      .face[aria-pressed='true'] {
        opacity: 1;
        color: var(--pv-text, #1A1B1E);
      }

      .face[aria-pressed='true'] pv-member-avatar {
        outline: 3px solid var(--face);
        outline-offset: 2px;
        border-radius: 50%;
      }

      .seg {
        display: inline-flex;
        padding: 3px;
        border-radius: 10px;
        background: var(--pv-seg, #ECECE8);
        margin-bottom: 10px;
      }

      .seg button {
        min-height: 40px;
        padding: 0 14px;
        border: none;
        border-radius: 8px;
        background: transparent;
        color: var(--pv-text-secondary, #5F6670);
        font: inherit;
        font-weight: 650;
        cursor: pointer;
      }

      .seg button[aria-pressed='true'] {
        background: var(--pv-seg-on, #FFFFFF);
        color: var(--pv-text, #1A1B1E);
        box-shadow: 0 1px 2px rgba(0, 0, 0, 0.12);
      }

      .chips {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        align-items: center;
      }

      .chip {
        min-height: 40px;
        padding: 0 14px;
        border-radius: 999px;
        border: 1px solid var(--pv-border, #E7E7E3);
        background: var(--pv-card-bg, #FFFFFF);
        color: var(--pv-text, #1A1B1E);
        font: inherit;
        font-weight: 650;
        cursor: pointer;
      }

      .chip[aria-pressed='true'] {
        border-color: var(--pv-accent, #5B5BD6);
        background: var(--pv-accent-tint, #EEEEFC);
        color: var(--pv-accent-tint-ink, #3B3BB0);
      }

      .switch-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
      }

      .switch-row .caption {
        color: var(--pv-text-muted, #8E949C);
        font-size: 0.8125rem;
      }

      .switch {
        position: relative;
        width: 52px;
        height: 32px;
        flex-shrink: 0;
        border: none;
        border-radius: 999px;
        background: var(--pv-track, #ECECE8);
        cursor: pointer;
      }

      .switch::after {
        content: '';
        position: absolute;
        top: 3px;
        left: 3px;
        width: 26px;
        height: 26px;
        border-radius: 50%;
        background: #FFFFFF;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.25);
        transition: transform 180ms ease;
      }

      .switch[aria-checked='true'] {
        background: var(--pv-accent, #5B5BD6);
      }

      .switch[aria-checked='true']::after {
        transform: translateX(20px);
      }

      .worth {
        color: var(--pv-text-secondary, #5F6670);
        font-size: 0.9375rem;
      }

      .stepper {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        margin-top: 8px;
      }

      .stepper button {
        min-width: 44px;
        min-height: 44px;
      }

      .problem {
        margin-top: 8px;
        color: var(--pv-bad-ink, #A12828);
        font-weight: 650;
      }
    `],e([ue({type:String,reflect:!0})],pn.prototype,"layout",void 0),e([ue({attribute:!1})],pn.prototype,"people",void 0),e([ue({attribute:!1})],pn.prototype,"hass",void 0),e([ue({attribute:!1})],pn.prototype,"colorOf",void 0),e([ue({type:String})],pn.prototype,"today",void 0),e([ue({type:Number})],pn.prototype,"minutesPerStar",void 0),e([ue({type:Boolean})],pn.prototype,"busy",void 0),e([me()],pn.prototype,"_draft",void 0),e([me()],pn.prototype,"_problem",void 0),e([me()],pn.prototype,"_other",void 0),e([me()],pn.prototype,"_changeStars",void 0),ge("pv-chores-quick-add",pn);const hn=[{id:"timeline",label:"Timeline"},{id:"list",label:"List"},{id:"pictures",label:"Pictures"}];class un extends le{constructor(){super(...arguments),this.columns=[],this.events=[],this.colorOf=e=>e.color,this.goal=null,this.shares=[],this.bedtime=null,this.timeFormat="12h",this.layout="landscape",this.locked=!1,this.minute=0}willUpdate(){this.column&&this.style.setProperty("--member",this.colorOf(this.column.member))}_style(){const e=this.column.member.my_day;return"list"===e||"pictures"===e?e:"timeline"}render(){const e=this.column;if(!e)return Y;const t=e.member,i=this._style();return U`
      ${this.columns.length>1?U`
        <div class="picker" role="group" aria-label="Whose day">
          ${this.columns.map(e=>U`
            <button class="face" type="button" aria-pressed=${e.member.id===t.id?"true":"false"}
              @click=${()=>this._fire("pv-my-day-member",{member:e.member.id})}>
              <pv-ring size="44" .progress=${e.ring.progress} ?closed=${e.ring.closed} color=${this.colorOf(e.member)}>
                <pv-member-avatar .member=${{...e.member,color:this.colorOf(e.member)}} .hass=${this.hass} size="32"></pv-member-avatar>
              </pv-ring>
              ${e.member.name}
            </button>
          `)}
        </div>
      `:Y}
      <div class="layout">
        <div class="card main">
          <div class="head">
            <pv-ring size="64" .progress=${e.ring.progress} ?closed=${e.ring.closed} color=${this.colorOf(t)} label=${e.ring.label}>
              <pv-member-avatar .member=${{...t,color:this.colorOf(t)}} .hass=${this.hass} size="48"></pv-member-avatar>
            </pv-ring>
            <div class="who">
              <div class="name">${t.name}</div>
              <div class="line">${e.line}</div>
            </div>
            <div class="seg" role="group" aria-label="My day style">
              ${hn.map(e=>U`
                <button type="button" aria-pressed=${e.id===i?"true":"false"}
                  @click=${()=>this._fire("pv-my-day-style",{member:t.id,style:e.id})}>${e.label}</button>
              `)}
            </div>
          </div>
          ${this.goal&&"landscape"!==this.layout?this._goal(this.goal):Y}
          ${"timeline"===i?this._timeline():"list"===i?this._list():this._pictures()}
        </div>
        ${this._side()}
      </div>
    `}_goal(e){return U`
      <div class="goal">
        <div class="text">
          <span>Goal: ${en(e.reward.icon)} ${e.reward.name}</span>
          <span class="num">${e.need>0?`${e.have} of ${e.reward.cost} ★ · ${e.need} more`:"Enough stars!"}</span>
        </div>
        <div class="bar" role="progressbar" aria-valuemin="0" aria-valuemax=${e.reward.cost} aria-valuenow=${e.have}
          aria-label=${`${e.reward.name}: ${e.have} of ${e.reward.cost} stars`}><span style="width:${Math.round(100*e.progress)}%"></span></div>
      </div>
    `}_row(e,t="now"){return U`<pv-chore-item .row=${e} color=${this.colorOf(this.column.member)} ?highlight=${"now"===t} ?locked=${this.locked}></pv-chore-item>`}_timeline(){const e=function(e,t){const i=t.now,s=Ds(i),a=e.entries.flatMap(e=>"row"===e.kind?[{row:e.row,zone:e.zone}]:[]),n=a.filter(e=>"overdue"===e.zone||"past"===e.zone).map(e=>e.row),r=a.filter(e=>"now"===e.zone||"later"===e.zone).map(e=>e.row),o=e.doneToday,d=a.filter(e=>"week"===e.zone).map(e=>e.row),l=t.events.filter(t=>t.member===e.member.id),c=[],p=t.bedtime;for(const e of gs){const a=xs(e,s),h=l.filter(t=>Ds(t.start)===e&&(!p||t.start<p)),u="past"===a?[]:[..."now"===a?n:[],...r.filter(t=>(t.item.band??s)===e)],m=o.filter(t=>t.item.completion&&Ds(new Date(t.item.completion.at))===e),v=[];for(const e of h)v.push({at:e.start.getTime(),entry:{kind:"event",key:`event:${e.calendar}:${e.start.getTime()}:${e.title}`,time:ms(e.start,t.timeFormat),title:e.title,range:As(e,t.timeFormat),past:e.end<=i,picture:Cs(e.title,"📅")}});for(const e of m){const i=new Date(e.item.completion.at);v.push({at:i.getTime(),entry:{kind:"chore",key:e.key,time:ms(i,t.timeFormat),row:e}})}if("now"===a){const e=i.getTime(),s=l.find(e=>e.start>i),a=s?Math.round((s.start.getTime()-e)/6e4):p?Math.round((p.getTime()-e)/6e4):null;v.push({at:e,entry:{kind:"now",key:"now",time:ms(i,t.timeFormat)}});const o=l.some(e=>e.start<=i&&e.end>i);!o&&(null===a||a>=15)&&v.push({at:e+1,entry:{kind:"free",key:"free",until:s?ms(s.start,t.timeFormat):null,span:null!==a?hs(a):null,fits:zs(a,[...n,...r,...d])}}),u.forEach((t,i)=>v.push({at:e+2+i,entry:{kind:"chore",key:t.key,time:null,row:t}}))}else if("later"===a){const t=h.reduce((e,t)=>Math.max(e,t.end.getTime()),0),s=Math.max(t,new Date(i.getFullYear(),i.getMonth(),i.getDate(),Ss[e]).getTime());u.forEach((e,t)=>v.push({at:s+t,entry:{kind:"chore",key:e.key,time:null,row:e}}))}0!==v.length&&(c.push({kind:"band",key:`band:${e}`,band:e,label:bs[e]}),c.push(...v.sort((e,t)=>e.at-t.at).map(e=>e.entry)))}return p&&p>i&&c.push({kind:"bedtime",key:"bedtime",time:ms(p,t.timeFormat,"12h"===t.timeFormat)}),c}(this.column,{now:new Date,events:this.events,timeFormat:this.timeFormat,bedtime:this.bedtime});return 0===e.length?U`<p class="meta" style="margin-top:12px">Nothing on today's timeline.</p>`:U`<div class="tl">${Ya(e,e=>e.key,e=>this._entry(e))}</div>${this._weekRows()}`}_entry(e){switch(e.kind){case"band":return U`<div class="tl-band">${e.label}</div>`;case"event":return U`
          <div class="tl-row"><span class="tl-time">${e.time}</span>
            <div class="event ${e.past?"past":""}"><span aria-hidden="true">${e.picture}</span>
              <div><div class="title">${e.title}</div><div class="range">${e.range}</div></div>
            </div>
          </div>
        `;case"chore":return U`<div class="tl-row"><span class="tl-time">${e.time??""}</span>${this._row(e.row,"done"===e.row.state?"done":"later")}</div>`;case"now":return U`<div class="tl-row"><span class="tl-time now-time">${e.time}</span><div class="now-line" aria-label="Now"></div></div>`;case"free":return U`
          <div class="tl-row"><span class="tl-time"></span>
            <div class="free">
              ${e.until?U`Free until <strong>${e.until}</strong>${e.span?U` · <strong>${e.span}</strong>`:Y}`:U`Free for the rest of the day`}
              ${e.fits.length?U`<div class="fits">Fits now: ${e.fits.join(" · ")}</div>`:Y}
            </div>
          </div>
        `;case"bedtime":return U`<div class="tl-row"><span class="tl-time"></span><span class="bed">🌙 Bedtime ${e.time}</span></div>`}}_weekRows(){if("landscape"===this.layout)return Y;const e=this.column.entries.flatMap(e=>"row"===e.kind&&"week"===e.zone?[e.row]:[]);return 0===e.length?Y:U`
      <div class="section-head"><span>This week</span><span class="right">${this.board.week.days_left} days left</span></div>
      ${e.map(e=>this._row(e,"week"))}
    `}_list(){const e=this.column,t=e.entries.flatMap(e=>"row"===e.kind&&"week"!==e.zone&&"done"!==e.zone?[e.row]:[]),i=e.entries.flatMap(e=>"row"===e.kind&&"week"===e.zone?[e.row]:[]),s=function(e,t,i,s){const a=e.filter(e=>e.member===t&&e.start>i);if(0===a.length)return null;const[n,...r]=a,o=ms(n.start,s,"12h"===s);return 0===r.length?`Next: ${n.title} at ${o} · then nothing until tomorrow`:`Next: ${n.title} at ${o}`}(this.events,e.member.id,new Date,this.timeFormat);return U`
      ${s?U`<div class="next">📅 ${s}</div>`:Y}
      <div class="section-head"><span>Today</span></div>
      ${t.length||e.doneToday.length?Y:U`<p class="meta">Nothing due today.</p>`}
      ${Ya(t,e=>e.key,e=>this._row(e))}
      ${Ya(e.doneToday,e=>e.key,e=>this._row(e,"done"))}
      ${i.length&&"landscape"!==this.layout?U`
        <div class="section-head"><span>This week</span><span class="right">${this.board.week.days_left} days left</span></div>
        ${Ya(i,e=>e.key,e=>this._row(e,"week"))}
      `:Y}
      ${this._fair()}
    `}_fair(){return 0===this.shares.length||"young_child"===this.column.member.age_group?Y:U`
      <div class="fair">
        <div class="section-head" style="margin-left:0"><span>Shared chores this week, by time done</span></div>
        <div class="bar" role="img" aria-label=${this.shares.map(e=>`${e.member.name} ${e.percent}%`).join(", ")}>
          ${this.shares.map(e=>U`<span style="width:${e.percent}%;background:${this.colorOf(e.member)}"></span>`)}
        </div>
        <div class="legend">${this.shares.map(e=>U`<span><i style="background:${this.colorOf(e.member)}"></i>${e.member.name} ${e.percent}%</span>`)}</div>
      </div>
    `}_pictures(){const e=function(e,t,i,s){const a=e.entries.flatMap(e=>"row"===e.kind?[{row:e.row,zone:e.zone}]:[]),n=a.filter(e=>"done"!==e.zone&&("open"===e.row.state||"sent_back"===e.row.state)),r=["overdue","now","past","later","week"];n.sort((e,t)=>r.indexOf(e.zone)-r.indexOf(t.zone));const[o,...d]=n.map(e=>e.row),l=[],c=t.find(t=>t.member===e.member.id&&t.start>i);return c&&l.push({kind:"event",picture:Cs(c.title,"📅"),text:`${c.title} at ${ms(c.start,s)}`}),d[0]&&l.push({kind:"chore",row:d[0]}),{now:o??null,next:l,waiting:a.filter(e=>"pending"===e.row.state).map(e=>e.row),done:e.doneToday,later:d.slice(1)}}(this.column,this.events,new Date,this.timeFormat),t=this.column.member.stars?this.column.entry.week_stars:0,i=this.colorOf(this.column.member);return U`
      ${e.now?U`
        <div class="now-tile">
          <div class="label" style="text-align:center;margin-top:0;color:${i}">NOW</div>
          <pv-chore-tile large now .row=${e.now} color=${i} ?locked=${this.locked}
            .stars=${this.column.member.stars?e.now.item.stars:0}></pv-chore-tile>
        </div>
      `:U`<div class="label" style="text-align:center">All done for now 🎉</div>`}
      ${e.next.length?U`
        <div class="pictures-next">
        <div class="label">Next</div>
        <div class="steps">
          ${e.next.map(e=>"event"===e.kind?U`<div class="step"><span class="picture" aria-hidden="true">${e.picture}</span>${e.text}</div>`:U`<pv-chore-tile .row=${e.row} color=${i} ?locked=${this.locked}></pv-chore-tile>`)}
        </div>
        </div>
      `:Y}
      ${e.waiting.length||e.later.length||e.done.length?U`
        <div class="label">Later, waiting, and done</div>
        <div class="tiles">
          ${Ya([...e.later,...e.waiting,...e.done],e=>e.key,e=>U`
            <pv-chore-tile .row=${e} color=${i} ?locked=${this.locked}></pv-chore-tile>
          `)}
        </div>
      `:Y}
      ${this.column.member.stars?U`
        <div class="label">Stickers this week${this.goal?U` → ${en(this.goal.reward.icon)} ${this.goal.reward.name} at ${this.goal.reward.cost}`:Y}</div>
        <div class="stickers" role="img" aria-label=${`${t} stars this week`}>
          ${Array.from({length:Math.min(30,t)},()=>U`<span aria-hidden="true">⭐</span>`)}
          ${0===t?U`<span class="meta">Stars show up here.</span>`:Y}
        </div>
      `:Y}
    `}_side(){const e=this.column,t=e.entries.flatMap(e=>"row"===e.kind&&"week"===e.zone?[e.row]:[]);return"landscape"!==this.layout?Y:U`
      <aside class="card side">
        ${e.member.stars?U`
          <div class="section">
            <h3>Stars</h3>
            <div class="stars-big num">★ ${e.entry.stars}</div>
            ${this.goal?this._goal(this.goal):Y}
          </div>
        `:Y}
        <div class="section">
          <h3>This week</h3>
          ${t.length?Ya(t,e=>e.key,e=>this._row(e,"week")):U`<p class="meta">Nothing more this week.</p>`}
        </div>
      </aside>
    `}_fire(e,t){this.dispatchEvent(new CustomEvent(e,{detail:t,bubbles:!0,composed:!0}))}}un.styles=[as,r`
      :host {
        display: flex;
        flex-direction: column;
        flex: 1 1 auto;
        min-height: 0;
        overflow-y: auto;
        overscroll-behavior: contain;
      }

      .picker {
        display: flex;
        justify-content: center;
        gap: 10px;
        padding: 12px 12px 4px;
        flex-wrap: wrap;
      }

      .face {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 2px;
        min-width: 56px;
        min-height: 48px;
        padding: 2px 4px;
        border: none;
        border-radius: 12px;
        background: transparent;
        color: var(--pv-text-secondary, #5F6670);
        font: inherit;
        font-size: 0.75rem;
        font-weight: 700;
        cursor: pointer;
        opacity: 0.6;
      }

      .face[aria-pressed='true'] {
        opacity: 1;
        color: var(--pv-text, #1A1B1E);
      }

      .layout {
        display: grid;
        grid-template-columns: minmax(0, 1fr) minmax(260px, 340px);
        gap: 12px;
        padding: 8px 12px 16px;
        max-width: 1100px;
        width: 100%;
        box-sizing: border-box;
        margin: 0 auto;
      }

      :host(:not([layout='landscape'])) .layout {
        grid-template-columns: minmax(0, 1fr);
      }

      .card {
        background: var(--pv-card-bg, #FFFFFF);
        border: 1px solid var(--pv-border, #E7E7E3);
        border-radius: var(--pv-radius-lg, 16px);
        padding: 14px;
        min-width: 0;
      }

      .main {
        border-top: 3px solid var(--member);
      }

      .head {
        display: flex;
        align-items: center;
        gap: 12px;
        flex-wrap: wrap;
      }

      .who {
        flex: 1 1 auto;
        min-width: 0;
      }

      .name {
        font-family: var(--pv-font-heading, ui-rounded, 'SF Pro Rounded', 'PlanaVista Rounded', system-ui, sans-serif);
        font-size: 1.5rem;
        font-weight: 800;
      }

      .line {
        color: var(--pv-text-secondary, #5F6670);
        font-size: 0.9375rem;
      }

      .seg {
        display: inline-flex;
        padding: 3px;
        border-radius: 10px;
        background: var(--pv-seg, #ECECE8);
      }

      .seg button {
        min-height: 40px;
        padding: 0 12px;
        border: none;
        border-radius: 8px;
        background: transparent;
        color: var(--pv-text-secondary, #5F6670);
        font: inherit;
        font-size: 0.875rem;
        font-weight: 650;
        cursor: pointer;
      }

      .seg button[aria-pressed='true'] {
        background: var(--pv-seg-on, #FFFFFF);
        color: var(--pv-text, #1A1B1E);
        box-shadow: 0 1px 2px rgba(0, 0, 0, 0.12);
      }

      .goal {
        margin-top: 12px;
      }

      .goal .text {
        display: flex;
        justify-content: space-between;
        gap: 8px;
        font-size: 0.875rem;
        color: var(--pv-text-secondary, #5F6670);
      }

      .bar {
        height: 10px;
        margin-top: 6px;
        border-radius: 999px;
        background: var(--pv-track, #ECECE8);
        overflow: hidden;
      }

      .bar span {
        display: block;
        height: 100%;
        border-radius: 999px;
        background: var(--member);
        transition: width 600ms ease;
      }

      /* Timeline */
      .tl {
        margin-top: 10px;
      }

      .tl-row {
        display: grid;
        grid-template-columns: 56px minmax(0, 1fr);
        gap: 8px;
        align-items: center;
        min-height: 40px;
      }

      .tl-time {
        justify-self: end;
        color: var(--pv-text-muted, #8E949C);
        font-size: 0.8125rem;
        font-variant-numeric: tabular-nums;
      }

      .tl-band {
        margin: 14px 0 4px 64px;
        font-size: 0.75rem;
        font-weight: 750;
        letter-spacing: 0.06em;
        text-transform: uppercase;
        color: var(--pv-text-muted, #8E949C);
      }

      .event {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 10px 12px;
        border-radius: 12px;
        border-left: 4px solid var(--member);
        background: color-mix(in srgb, var(--member) 14%, var(--pv-card-bg, #FFFFFF));
      }

      .event.past {
        opacity: 0.55;
      }

      .event .title {
        font-weight: 650;
      }

      .event .range {
        color: var(--pv-text-secondary, #5F6670);
        font-size: 0.8125rem;
      }

      .now-time {
        color: var(--pv-now-color, #E5484D);
        font-weight: 800;
      }

      .now-line {
        height: 2px;
        background: var(--pv-now-color, #E5484D);
        border-radius: 2px;
      }

      .free {
        padding: 10px 12px;
        border-radius: 12px;
        border: 1.5px dashed color-mix(in srgb, var(--member) 60%, transparent);
        background: color-mix(in srgb, var(--member) 7%, var(--pv-card-bg, #FFFFFF));
        font-size: 0.9375rem;
      }

      .free .fits {
        margin-top: 2px;
        color: var(--pv-text-secondary, #5F6670);
        font-size: 0.875rem;
      }

      .bed {
        color: var(--pv-text-muted, #8E949C);
        font-size: 0.875rem;
      }

      /* List */
      .next {
        margin-top: 10px;
        padding: 8px 12px;
        border-radius: 12px;
        background: var(--pv-chip, #F1F1EE);
        font-size: 0.875rem;
      }

      .fair {
        margin-top: 12px;
      }

      .fair .bar {
        display: flex;
        height: 12px;
        gap: 2px;
        background: transparent;
      }

      .fair .bar span {
        border-radius: 3px;
      }

      .legend {
        display: flex;
        flex-wrap: wrap;
        gap: 4px 12px;
        margin-top: 6px;
        font-size: 0.8125rem;
        color: var(--pv-text-secondary, #5F6670);
      }

      .legend i {
        display: inline-block;
        width: 10px;
        height: 10px;
        border-radius: 3px;
        margin-right: 4px;
        vertical-align: -1px;
      }

      /* Pictures */
      .now-tile,
      .pictures-next {
        max-width: 520px;
        margin: 12px auto 0;
      }

      .label {
        margin: 14px 2px 6px;
        font-size: 0.8125rem;
        font-weight: 750;
        color: var(--pv-text-muted, #8E949C);
      }

      .steps {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
        gap: 10px;
        align-items: stretch;
      }

      .step {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 6px;
        min-height: 120px;
        border-radius: 18px;
        background: var(--pv-chip, #F1F1EE);
        font-family: var(--pv-font-heading, ui-rounded, 'SF Pro Rounded', 'PlanaVista Rounded', system-ui, sans-serif);
        font-weight: 800;
        text-align: center;
        padding: 10px;
      }

      .step .picture {
        font-size: 44px;
      }

      .tiles {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
        gap: 10px;
      }

      :host([layout='landscape']) .tiles {
        grid-template-columns: repeat(4, minmax(0, 1fr));
      }

      .stickers {
        display: flex;
        flex-wrap: wrap;
        gap: 2px;
        font-size: 22px;
      }

      .side h3 {
        margin: 0 0 8px;
        font-family: var(--pv-font-heading, ui-rounded, 'SF Pro Rounded', 'PlanaVista Rounded', system-ui, sans-serif);
        font-size: 1.0625rem;
        font-weight: 800;
      }

      .side .section + .section {
        margin-top: 16px;
      }

      .stars-big {
        font-family: var(--pv-font-heading, ui-rounded, 'SF Pro Rounded', 'PlanaVista Rounded', system-ui, sans-serif);
        font-size: 2rem;
        font-weight: 800;
        color: var(--pv-star, #8A6A00);
      }
    `],e([ue({attribute:!1})],un.prototype,"column",void 0),e([ue({attribute:!1})],un.prototype,"columns",void 0),e([ue({attribute:!1})],un.prototype,"board",void 0),e([ue({attribute:!1})],un.prototype,"events",void 0),e([ue({attribute:!1})],un.prototype,"hass",void 0),e([ue({attribute:!1})],un.prototype,"colorOf",void 0),e([ue({attribute:!1})],un.prototype,"goal",void 0),e([ue({attribute:!1})],un.prototype,"shares",void 0),e([ue({attribute:!1})],un.prototype,"bedtime",void 0),e([ue({attribute:!1})],un.prototype,"timeFormat",void 0),e([ue({type:String,reflect:!0})],un.prototype,"layout",void 0),e([ue({type:Boolean})],un.prototype,"locked",void 0),e([ue({attribute:!1})],un.prototype,"minute",void 0),ge("pv-chores-my-day",un);class mn extends le{constructor(){super(...arguments),this.view=null,this.rows=[],this.highlights=[],this.shares=[],this.colorOf=e=>e.color,this.layout="landscape",this.canExcuse=!1,this.current=!0,this.failed=!1,this._touch=null,this._touchStart=e=>{this._touch=1===e.touches.length?{x:e.touches[0].clientX,y:e.touches[0].clientY}:null},this._touchEnd=e=>{const t=this._touch;this._touch=null;const i=e.changedTouches[0];if(!t||!i)return;const s=mt(i.clientX-t.x,i.clientY-t.y);s&&this._nav("next"===s?1:-1)}}render(){const e=this.view,t="landscape"===this.layout?"landscape":"phone"===this.layout?"phone":"portrait";return U`
      <div class="wrap" @touchstart=${this._touchStart} @touchend=${this._touchEnd}>
        <div class="top">
          <button class="nav" type="button" aria-label="Last week" @click=${()=>this._nav(-1)}>‹</button>
          <h2>${e?Qs(e):"This week"}</h2>
          <button class="nav" type="button" aria-label="Next week" @click=${()=>this._nav(1)}>›</button>
          ${this.current?Y:U`<button class="pv-btn pv-btn-secondary this-week" type="button" @click=${()=>this._nav(0)}>This week</button>`}
        </div>
        ${this.failed?U`
          <div class="state"><div class="art" aria-hidden="true">📡</div><h2>Couldn't load this week</h2>
            <p>Home Assistant didn't answer. Try again in a moment.</p>
            <div class="buttons"><button class="pv-btn pv-btn-secondary" type="button" @click=${()=>this._nav(0)}>Try again</button></div></div>
        `:e?this._grid(e,t):this._skeleton(t)}
      </div>
    `}_skeleton(e){return U`
      <div class="card" aria-busy="true" aria-label="Loading the week">
        <div class="grid ${e}">
          ${Array.from({length:4*("landscape"===e?9:8)},()=>U`<div class="bone" style="height:72px"></div>`)}
        </div>
      </div>
    `}_grid(e,t){const i=function(e){const t=[];for(let i=0;i<7;i++){const s=Rs(e.week.start,i);if(s>=e.week.end)break;t.push({date:s,label:Gs[os(s).getDay()],today:s===e.today})}return t}(e);return U`
      <div class="card">
        <div class="grid ${t}" role="grid" aria-label=${Qs(e)}>
          <div></div>
          ${i.map(e=>U`<div class="dayhead ${e.today?"today":""}">${e.label}${e.today?U`<span class="sub">Today</span>`:Y}</div>`)}
          ${"landscape"===t?U`<div class="dayhead">Weekly chores</div>`:Y}
          ${this.rows.map(e=>this._row(e,t))}
        </div>
      </div>
      ${"landscape"!==t?this._weeklySection():Y}
      <div class="lower">
        ${this.shares.length?U`
          <div class="card fair">
            <h3>Shared chores this week, by time done</h3>
            <div class="stack" role="img" aria-label=${this.shares.map(e=>e.text).join(", ")}>
              ${this.shares.map(e=>U`<span style="width:${e.percent}%;background:${this.colorOf(e.member)}"></span>`)}
            </div>
            <div class="legend">${this.shares.map(e=>U`<span><i style="background:${this.colorOf(e.member)}"></i>${e.text}</span>`)}</div>
          </div>
        `:Y}
        ${this.highlights.length?U`
          <div class="card highlights">
            ${this.highlights.map(e=>U`
              <p><strong>${e.member.name}</strong>${e.text.slice(e.member.name.length)}
                ${e.excuse&&this.canExcuse?U`<button class="link" type="button"
                  @click=${()=>this._fire("pv-week-excuse",{occurrence:e.excuse.occurrence,name:e.excuse.name,member:e.member.id})}>Excuse it</button>`:Y}
              </p>
            `)}
          </div>
        `:Y}
      </div>
    `}_row(e,t){const i=e.member,s=this.colorOf(i);return U`
      <div class="who">
        <pv-member-avatar .member=${{...i,color:s}} .hass=${this.hass} size="28"></pv-member-avatar>
        <span class="name">${i.name}</span>
      </div>
      ${e.cells.map(e=>this._cell(i,e,s))}
      ${"landscape"===t?this._weekly(e,s):Y}
    `}_cell(e,t,i){const s=`${e.name}, ${t.date}: ${t.label||"nothing known"}`;return U`
      <button class="cell ${t.kind} ${t.away?"away":""}" type="button" aria-label=${s}
        @click=${()=>this._fire("pv-week-day",{member:e.id,date:t.date})}>
        ${t.away?U`<span aria-hidden="true">🧳</span>`:t.empty?Y:U`
          <pv-ring size="34" .progress=${t.progress} ?closed=${t.closed} ?dashed=${t.dashed} color=${i}></pv-ring>
        `}
        <span class=${"bad"===t.tone?"bad":""}>${t.label}</span>
      </button>
    `}_weekly(e,t){const i=e.weekly;return i?U`
      <div class="weekly">
        <div class="line"><strong class="num">${i.text}</strong>
          ${i.badge?U`<span class="badge ${i.badgeTone}">${i.badge}</span>`:Y}
        </div>
        <div class="bar"><span style="width:${Math.round(100*i.progress)}%;background:${t}"></span></div>
      </div>
    `:U`<div class="weekly"><span class="meta">No weekly chores</span></div>`}_weeklySection(){const e=this.rows;return e.some(e=>e.weekly)?U`
      <div class="section-head" style="margin:14px 2px 0"><span>Weekly chores</span></div>
      <div class="weekly-section">
        ${e.map(e=>U`
          <div class="weekly" style="--c:${this.colorOf(e.member)}">
            <div class="line"><strong>${e.member.name}</strong>
              ${e.weekly?U`<span class="num">${e.weekly.text}</span>${e.weekly.badge?U`<span class="badge ${e.weekly.badgeTone}">${e.weekly.badge}</span>`:Y}`:U`<span class="meta">No weekly chores</span>`}
            </div>
            ${e.weekly?U`<div class="bar"><span style="width:${Math.round(100*e.weekly.progress)}%;background:${this.colorOf(e.member)}"></span></div>`:Y}
          </div>
        `)}
      </div>
    `:Y}_nav(e){this._fire("pv-week-nav",{offset:e})}_fire(e,t){this.dispatchEvent(new CustomEvent(e,{detail:t,bubbles:!0,composed:!0}))}}mn.styles=[ot,as,r`
      :host {
        display: block;
        flex: 1 1 auto;
        min-height: 0;
        overflow-y: auto;
        padding: 12px;
        box-sizing: border-box;
      }

      .wrap {
        max-width: 1200px;
        margin: 0 auto;
      }

      .top {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 10px;
      }

      .top h2 {
        margin: 0 6px;
        font-family: var(--pv-font-heading, ui-rounded, 'SF Pro Rounded', 'PlanaVista Rounded', system-ui, sans-serif);
        font-size: 1.375rem;
        font-weight: 800;
      }

      .nav {
        width: 44px;
        height: 44px;
        border-radius: 12px;
        border: 1px solid var(--pv-border, #E7E7E3);
        background: var(--pv-card-bg, #FFFFFF);
        color: var(--pv-text, #1A1B1E);
        font-size: 1.25rem;
        cursor: pointer;
      }

      .this-week {
        margin-left: auto;
      }

      .card {
        background: var(--pv-card-bg, #FFFFFF);
        border: 1px solid var(--pv-border, #E7E7E3);
        border-radius: var(--pv-radius-lg, 16px);
        padding: 12px;
      }

      .grid {
        display: grid;
        gap: 8px;
        align-items: stretch;
      }

      .grid.landscape {
        grid-template-columns: 120px repeat(7, minmax(0, 1fr)) minmax(160px, 220px);
      }

      .grid.portrait {
        grid-template-columns: 96px repeat(7, minmax(0, 1fr));
      }

      .grid.phone {
        grid-template-columns: 52px repeat(7, minmax(0, 1fr));
        gap: 4px;
      }

      .dayhead {
        text-align: center;
        font-size: 0.8125rem;
        font-weight: 700;
        color: var(--pv-text-muted, #8E949C);
        line-height: 1.2;
      }

      .dayhead.today {
        color: var(--pv-accent-ink, #5B5BD6);
      }

      .dayhead .sub {
        display: block;
        font-size: 0.6875rem;
      }

      .who {
        display: flex;
        align-items: center;
        gap: 8px;
        font-weight: 700;
        min-width: 0;
      }

      .grid.phone .who span.name {
        display: none;
      }

      .who .streak {
        display: block;
        font-weight: 600;
        font-size: 0.75rem;
        color: var(--pv-text-secondary, #5F6670);
      }

      .cell {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 4px;
        min-height: 72px;
        padding: 6px 2px;
        border-radius: 12px;
        border: 1px solid var(--pv-border-subtle, #F1F1EE);
        background: var(--pv-card-bg, #FFFFFF);
        color: inherit;
        font: inherit;
        font-size: 0.75rem;
        cursor: pointer;
      }

      .cell.today {
        border: 1.5px solid var(--pv-accent, #5B5BD6);
        background: var(--pv-today-bg, rgba(91, 91, 214, 0.06));
      }

      .cell.future {
        border-style: dashed;
        color: var(--pv-text-muted, #8E949C);
      }

      .cell.away {
        background: var(--pv-chip, #F1F1EE);
      }

      .cell .bad {
        padding: 1px 6px;
        border-radius: 6px;
        background: var(--pv-bad-bg, #FBE4E4);
        color: var(--pv-bad-ink, #A12828);
        font-weight: 700;
      }

      .weekly {
        display: flex;
        flex-direction: column;
        justify-content: center;
        gap: 6px;
        padding: 8px 10px;
        border-radius: 12px;
        border: 1px solid var(--pv-border-subtle, #F1F1EE);
        font-size: 0.8125rem;
      }

      .weekly .line {
        display: flex;
        align-items: center;
        gap: 6px;
        flex-wrap: wrap;
      }

      .bar {
        height: 6px;
        border-radius: 999px;
        background: var(--pv-track, #ECECE8);
        overflow: hidden;
      }

      .bar span {
        display: block;
        height: 100%;
        border-radius: 999px;
      }

      .weekly-section {
        margin-top: 12px;
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 8px;
      }

      :host([layout='phone']) .weekly-section {
        grid-template-columns: minmax(0, 1fr);
      }

      .weekly-section .weekly {
        border-left: 3px solid var(--c);
      }

      .lower {
        display: grid;
        grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
        gap: 12px;
        margin-top: 12px;
      }

      :host(:not([layout='landscape'])) .lower {
        grid-template-columns: minmax(0, 1fr);
      }

      .fair .stack {
        display: flex;
        height: 12px;
        gap: 2px;
        margin: 8px 0 6px;
      }

      .fair .stack span {
        border-radius: 3px;
      }

      .legend {
        display: flex;
        flex-wrap: wrap;
        gap: 4px 12px;
        font-size: 0.8125rem;
        color: var(--pv-text-secondary, #5F6670);
      }

      .legend i {
        display: inline-block;
        width: 10px;
        height: 10px;
        border-radius: 3px;
        margin-right: 4px;
        vertical-align: -1px;
      }

      .highlights p {
        margin: 0 0 6px;
        line-height: 1.5;
      }

      .highlights .link {
        min-height: 40px;
        border: none;
        background: transparent;
        color: var(--pv-accent-ink, #5B5BD6);
        font: inherit;
        font-weight: 750;
        cursor: pointer;
        padding: 0 4px;
      }

      h3 {
        margin: 0;
        font-family: var(--pv-font-heading, ui-rounded, 'SF Pro Rounded', 'PlanaVista Rounded', system-ui, sans-serif);
        font-size: 1rem;
        font-weight: 800;
      }
    `],e([ue({attribute:!1})],mn.prototype,"view",void 0),e([ue({attribute:!1})],mn.prototype,"rows",void 0),e([ue({attribute:!1})],mn.prototype,"highlights",void 0),e([ue({attribute:!1})],mn.prototype,"shares",void 0),e([ue({attribute:!1})],mn.prototype,"hass",void 0),e([ue({attribute:!1})],mn.prototype,"colorOf",void 0),e([ue({type:String,reflect:!0})],mn.prototype,"layout",void 0),e([ue({type:Boolean})],mn.prototype,"canExcuse",void 0),e([ue({type:Boolean})],mn.prototype,"current",void 0),e([ue({type:Boolean})],mn.prototype,"failed",void 0),ge("pv-chores-week",mn);const vn=["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"],gn=["January","February","March","April","May","June","July","August","September","October","November","December"];function bn(e){return!("section"in e)}class yn extends le{constructor(){super(...arguments),this.layout="landscape",this.date="",this.today="",this.day=null,this.failed=!1,this.canExcuse=!1,this.names=e=>e,this._motion=new Ba(this),this._detach=null,this._closing=!1,this._key=e=>{if("Escape"===e.key)return e.preventDefault(),void this.close();Ma(this.shadowRoot,e)}}firstUpdated(){const e=this.renderRoot.querySelector(".panel"),t=this.renderRoot.querySelector(".backdrop");this._motion.open(e,t),this._detach=this._motion.attachDrag(this.renderRoot.querySelector(".grab-zone"),e,()=>{this.close()}),this.renderRoot.querySelector(".actions button")?.focus()}disconnectedCallback(){super.disconnectedCallback(),this._detach?.()}async close(){if(this._closing)return;this._closing=!0;const e=this.renderRoot.querySelector(".panel"),t=this.renderRoot.querySelector(".backdrop");await this._motion.close(e,t),this.dispatchEvent(new CustomEvent("pv-sheet-close",{bubbles:!0,composed:!0}))}_badge(e){if(bn(e)){const t=ps(e.status);return"done"===e.status&&e.done_by&&e.done_by!==this.member.id?{...t,words:`Done by ${this.names(e.done_by)}`}:t}return cs(e,{today:this.today,daysLeft:7,remaining:0})??("done"===e.status?ps("done"):null)}render(){const e=this.day?.members[this.member?.id??""],t=e?.summary,i=this.day?e?.away?"Away: nothing was due, and the streak keeps.":t?t.closed?`Ring closed: ${t.done+t.pending} of ${t.due} done.`:`${t.done+t.pending} of ${t.due} done.`:"future"===this.day.kind?"Still to come.":"":"";return U`
      <div class="backdrop" @click=${()=>{this.close()}}></div>
      <div class="panel" role="dialog" aria-modal="true" aria-labelledby="day-title" @keydown=${this._key}>
        <div class="grab-zone" aria-hidden="true"><div class="grab"></div></div>
        <h2 class="heading" id="day-title">${this.member?.name} · ${function(e){const[t,i,s]=e.split("-").map(Number),a=new Date(t,i-1,s,12);return`${vn[a.getDay()]}, ${gn[a.getMonth()]} ${a.getDate()}`}(this.date)}</h2>
        ${i?U`<p class="sub">${i}</p>`:Y}
        ${this.failed?U`<p class="sub">Couldn't load this day. Try again in a moment.</p>`:this.day?e&&e.items.length?U`
          <ul>
            ${e.items.map(e=>{const t=this._badge(e);return U`
                <li>
                  <span class="pic" aria-hidden="true">${en(e.icon)}</span>
                  <span class="name">${e.name}</span>
                  ${t?U`<span class="badge ${t.tone}">${t.glyph?`${t.glyph} `:""}${t.words}</span>`:Y}
                  ${bn(e)&&"missed"===e.status&&this.canExcuse?U`
                    <button class="link" type="button" @click=${()=>this._excuse(e)}>Excuse it</button>
                  `:Y}
                </li>
              `})}
          </ul>
        `:U`<p class="sub">Nothing was on the board.</p>`:U`
          <div aria-busy="true"><div class="bone" style="height:44px;margin-bottom:8px"></div><div class="bone" style="height:44px"></div></div>
        `}
        <div class="actions"><button class="pv-btn pv-btn-secondary" type="button" @click=${()=>{this.close()}}>Done</button></div>
      </div>
    `}_excuse(e){this.dispatchEvent(new CustomEvent("pv-day-excuse",{detail:{occurrence:e.key,name:e.name},bubbles:!0,composed:!0}))}}yn.styles=[ot,za,as,r`
      .heading {
        text-align: left;
      }

      .sub {
        margin: 0 0 12px;
        color: var(--pv-text-secondary, #5F6670);
      }

      ul {
        list-style: none;
        margin: 0;
        padding: 0;
      }

      li {
        display: flex;
        align-items: center;
        gap: 10px;
        min-height: 48px;
        border-bottom: 1px solid var(--pv-border-subtle, #F1F1EE);
      }

      li .name {
        flex: 1 1 auto;
        min-width: 0;
      }

      li .pic {
        width: 28px;
        text-align: center;
      }

      .link {
        min-height: 40px;
        border: none;
        background: transparent;
        color: var(--pv-accent-ink, #5B5BD6);
        font: inherit;
        font-weight: 750;
        cursor: pointer;
      }
    `],e([ue({type:String,reflect:!0})],yn.prototype,"layout",void 0),e([ue({attribute:!1})],yn.prototype,"member",void 0),e([ue({type:String})],yn.prototype,"date",void 0),e([ue({type:String})],yn.prototype,"today",void 0),e([ue({attribute:!1})],yn.prototype,"day",void 0),e([ue({type:Boolean})],yn.prototype,"failed",void 0),e([ue({type:Boolean})],yn.prototype,"canExcuse",void 0),e([ue({attribute:!1})],yn.prototype,"names",void 0),ge("pv-chores-day-sheet",yn);class fn extends le{constructor(){super(...arguments),this.balances=[],this.cards=[],this.recent=null,this.colorOf=e=>e.color,this.layout="landscape",this.canEdit=!1}render(){return U`
      <div class="wrap">
        ${this.balances.length?U`
          <div class="balances">
            ${this.balances.map(e=>U`
              <div class="balance" style="--c:${this.colorOf(e.member)}">
                <pv-member-avatar .member=${{...e.member,color:this.colorOf(e.member)}} .hass=${this.hass} size="40"></pv-member-avatar>
                <span class="stars num" aria-label=${`${e.member.name}: ${e.stars} stars`}>★ ${e.stars}</span>
                <div class="goal">
                  ${e.goal?U`
                    Goal: ${en(e.goal.reward.icon)} ${e.goal.reward.name} · ${e.goal.need>0?`${e.goal.need} more`:"enough stars!"}
                    <div class="bar"><span style="width:${Math.round(100*e.goal.progress)}%"></span></div>
                  `:U`No goal yet`}
                </div>
              </div>
            `)}
          </div>
        `:Y}
        ${0!==this.cards.length||this.canEdit?U`
          <div class="catalog">
            ${this.cards.map(e=>this._card(e))}
            ${this.canEdit?U`
              <button class="card add" type="button" @click=${()=>this._fire("pv-reward-open",{reward:null})}>+ Add a reward<span class="meta">parents</span></button>
            `:Y}
          </div>
        `:U`
          <div class="state"><div class="art" aria-hidden="true">🎁</div><h2>No rewards yet</h2><p>A parent can add rewards to save stars up for.</p></div>
        `}
        ${this.recent?U`<p class="recent">${this.recent}</p>`:Y}
      </div>
    `}_card(e){const t=e.reward,i=e.asked.length;return U`
      <div class="card">
        ${e.goals.length?U`<span class="tag goal-tag">${e.goals.map(e=>`${e.name}'s goal`).join(", ")}</span>`:Y}
        <button class="open" type="button" @click=${()=>this._fire("pv-reward-open",{reward:t.id})}>
          <span class="icon" aria-hidden="true">${en(t.icon)}</span>
          <span class="name">${t.name}</span>
          <span class="cost num">★ ${t.cost}</span>
        </button>
        <div class="tags">
          ${e.people.map(e=>U`<span class="tag ${e.afford?"ok":""}">${e.member.name}${e.afford?" ✓":`: ${e.more} more`}</span>`)}
          ${i?U`<span class="badge act">⏳ ${e.asked.map(e=>e.name).join(", ")} · Waiting for OK</span>`:Y}
        </div>
        ${e.canRedeem?U`<button class="pv-btn pv-btn-primary action" type="button" @click=${()=>this._fire("pv-reward-redeem",{reward:t.id})}>Redeem</button>`:U`<button class="pv-btn pv-btn-secondary action" type="button" disabled>${i?"Requested":"Not enough stars yet"}</button>`}
      </div>
    `}_fire(e,t){this.dispatchEvent(new CustomEvent(e,{detail:t,bubbles:!0,composed:!0}))}}fn.styles=[ot,as,r`
      :host {
        display: block;
        flex: 1 1 auto;
        min-height: 0;
        overflow-y: auto;
        padding: 12px;
        box-sizing: border-box;
      }

      .wrap {
        max-width: 1200px;
        margin: 0 auto;
      }

      .balances {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
        gap: 12px;
        margin-bottom: 14px;
      }

      .balance {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 12px 14px;
        border-radius: var(--pv-radius-lg, 16px);
        background: var(--pv-card-bg, #FFFFFF);
        border: 1px solid var(--pv-border, #E7E7E3);
        border-top: 3px solid var(--c);
      }

      .balance .stars {
        font-family: var(--pv-font-heading, ui-rounded, 'SF Pro Rounded', 'PlanaVista Rounded', system-ui, sans-serif);
        font-size: 1.75rem;
        font-weight: 800;
        white-space: nowrap;
      }

      .balance .goal {
        flex: 1 1 auto;
        min-width: 0;
        font-size: 0.8125rem;
        color: var(--pv-text-secondary, #5F6670);
      }

      .bar {
        height: 8px;
        margin-top: 6px;
        border-radius: 999px;
        background: var(--pv-track, #ECECE8);
        overflow: hidden;
      }

      .bar span {
        display: block;
        height: 100%;
        border-radius: 999px;
        background: var(--c);
      }

      .catalog {
        display: grid;
        grid-template-columns: repeat(4, minmax(0, 1fr));
        gap: 12px;
      }

      :host([layout='portrait']) .catalog {
        grid-template-columns: repeat(3, minmax(0, 1fr));
      }

      :host([layout='phone']) .catalog {
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }

      .card {
        position: relative;
        display: flex;
        flex-direction: column;
        gap: 6px;
        padding: 12px;
        border-radius: var(--pv-radius-lg, 16px);
        background: var(--pv-card-bg, #FFFFFF);
        border: 1px solid var(--pv-border, #E7E7E3);
        min-width: 0;
      }

      .open {
        display: flex;
        flex-direction: column;
        gap: 4px;
        border: none;
        background: transparent;
        color: inherit;
        font: inherit;
        text-align: left;
        padding: 0;
        cursor: pointer;
      }

      .open:focus-visible {
        outline: 2px solid var(--pv-accent-ink, #5B5BD6);
        outline-offset: 2px;
        border-radius: 10px;
      }

      .icon {
        font-size: 30px;
        line-height: 1.1;
      }

      .name {
        font-weight: 750;
        line-height: 1.25;
      }

      .cost {
        color: var(--pv-star, #8A6A00);
        font-weight: 800;
      }

      .tags {
        display: flex;
        flex-wrap: wrap;
        gap: 4px;
      }

      .tag {
        padding: 2px 6px;
        border-radius: 6px;
        background: var(--pv-chip, #F1F1EE);
        color: var(--pv-text-secondary, #5F6670);
        font-size: 0.75rem;
        font-weight: 700;
      }

      .tag.ok {
        color: var(--pv-text, #1A1B1E);
      }

      .goal-tag {
        position: absolute;
        top: 10px;
        right: 10px;
      }

      .card .action {
        margin-top: auto;
        min-height: 44px;
        width: 100%;
      }

      .add {
        align-items: center;
        justify-content: center;
        min-height: 160px;
        border-style: dashed;
        color: var(--pv-accent-ink, #5B5BD6);
        font-weight: 750;
        cursor: pointer;
        font: inherit;
        background: transparent;
      }

      .recent {
        margin: 14px 4px 0;
        color: var(--pv-text-secondary, #5F6670);
        font-size: 0.875rem;
      }
    `],e([ue({attribute:!1})],fn.prototype,"balances",void 0),e([ue({attribute:!1})],fn.prototype,"cards",void 0),e([ue({attribute:!1})],fn.prototype,"recent",void 0),e([ue({attribute:!1})],fn.prototype,"hass",void 0),e([ue({attribute:!1})],fn.prototype,"colorOf",void 0),e([ue({type:String,reflect:!0})],fn.prototype,"layout",void 0),e([ue({type:Boolean})],fn.prototype,"canEdit",void 0),ge("pv-chores-rewards",fn);class _n extends le{constructor(){super(...arguments),this.layout="landscape",this.card=null,this.people=[],this.colorOf=e=>e.color,this.canEdit=!1,this.busy=!1,this._editing=!1,this._draft=aa(),this._problem=null,this._motion=new Ba(this),this._detach=null,this._closing=!1,this._started=!1,this._save=()=>{this._problem=na(this._draft),this._problem||this._fire("pv-reward-save",{draft:this._draft})},this._key=e=>{if("Escape"===e.key)return e.preventDefault(),void this.close();Ma(this.shadowRoot,e)}}willUpdate(){this._started||(this._started=!0,this._editing=!this.card,this._draft=aa(this.card?.reward))}firstUpdated(){const e=this.renderRoot.querySelector(".panel"),t=this.renderRoot.querySelector(".backdrop");this._motion.open(e,t),this._detach=this._motion.attachDrag(this.renderRoot.querySelector(".grab-zone"),e,()=>{this.close()}),this.renderRoot.querySelector("input, button")?.focus()}disconnectedCallback(){super.disconnectedCallback(),this._detach?.()}async close(){if(this._closing)return;this._closing=!0;const e=this.renderRoot.querySelector(".panel"),t=this.renderRoot.querySelector(".backdrop");await this._motion.close(e,t),this.dispatchEvent(new CustomEvent("pv-sheet-close",{bubbles:!0,composed:!0}))}render(){return U`
      <div class="backdrop" @click=${()=>{this.close()}}></div>
      <div class="panel" role="dialog" aria-modal="true" aria-labelledby="reward-title" @keydown=${this._key}>
        <div class="grab-zone" aria-hidden="true"><div class="grab"></div></div>
        ${this._editing?this._form():this._view()}
      </div>
    `}_view(){const e=this.card;if(!e)return Y;const t=e.reward;return U`
      <div class="icon" aria-hidden="true">${en(t.icon)}</div>
      <h2 class="heading" id="reward-title">${t.name}</h2>
      <div class="cost">★ ${t.cost}${t.needs_ok?" · needs a parent's OK":""}</div>
      ${e.people.map(e=>U`
        <div class="person">
          <pv-member-avatar .member=${{...e.member,color:this.colorOf(e.member)}} .hass=${this.hass} size="36"></pv-member-avatar>
          <div class="words">
            <div>${e.member.name}</div>
            <div class="meta">${e.asked?"Waiting for OK":e.afford?"Has enough stars":`${e.more} more to go`}</div>
          </div>
          <button class="toggle" type="button" aria-pressed=${e.member.goal===t.id?"true":"false"}
            @click=${()=>this._fire("pv-reward-goal",{member:e.member.id,reward:e.member.goal===t.id?null:t.id})}>
            ${e.member.goal===t.id?"Saving up for this":"Save up for this"}
          </button>
        </div>
      `)}
      ${0===e.people.length?U`<p class="body">Nobody who earns stars can get this one yet.</p>`:Y}
      <div class="actions">
        ${this.canEdit?U`<button class="pv-btn pv-btn-secondary" type="button" @click=${()=>{this._editing=!0}}>Edit reward</button>`:Y}
        <button class="pv-btn pv-btn-ghost" type="button" @click=${()=>{this.close()}}>Done</button>
      </div>
    `}_set(e){this._draft={...this._draft,...e},this._problem&&(this._problem=na(this._draft))}_form(){const e=this._draft,t=!!this.card;return U`
      <h2 class="heading" id="reward-title">${t?"Edit reward":"Add a reward"}</h2>
      <span class="title">Picture</span>
      <div class="pictures">
        ${ra.map(t=>U`<button type="button" aria-pressed=${e.icon===t?"true":"false"} aria-label=${t} @click=${()=>this._set({icon:t})}>${t}</button>`)}
      </div>
      <label class="title" for="reward-name">Name</label>
      <input id="reward-name" type="text" maxlength="60" placeholder="Movie night pick" .value=${e.name}
        @input=${e=>this._set({name:e.target.value})} />
      <label class="title" for="reward-cost">Cost in stars</label>
      <input id="reward-cost" type="number" min="1" max="10000" inputmode="numeric" .value=${String(e.cost)}
        @input=${e=>this._set({cost:Math.round(Number(e.target.value))})} />
      <div class="row">
        <span>Needs a parent's OK</span>
        <button class="switch" type="button" role="switch" aria-checked=${e.needsOk?"true":"false"} aria-label="Needs a parent's OK"
          @click=${()=>this._set({needsOk:!e.needsOk})}></button>
      </div>
      <span class="title">Who can get it (nobody picked means everyone who earns stars)</span>
      <div class="faces">
        ${this.people.filter(e=>e.stars).map(t=>U`
          <button class="face" type="button" aria-pressed=${e.who.includes(t.id)?"true":"false"}
            @click=${()=>this._set({who:e.who.includes(t.id)?e.who.filter(e=>e!==t.id):[...e.who,t.id]})}>
            <pv-member-avatar .member=${{...t,color:this.colorOf(t)}} .hass=${this.hass} size="36"></pv-member-avatar>
            ${t.name}
          </button>
        `)}
      </div>
      ${this._problem?U`<div class="problem" role="alert">${this._problem}</div>`:Y}
      <div class="actions">
        <button class="pv-btn pv-btn-primary" type="button" ?disabled=${this.busy} @click=${this._save}>${this.busy?"Saving…":t?"Save":"Add"}</button>
        <button class="pv-btn pv-btn-secondary" type="button" @click=${()=>t?this._editing=!1:void this.close()}>Cancel</button>
        ${t?U`<button class="pv-btn pv-btn-ghost danger" type="button" @click=${()=>this._fire("pv-reward-delete",{})}>Delete reward</button>`:Y}
      </div>
    `}_fire(e,t){this.dispatchEvent(new CustomEvent(e,{detail:t,bubbles:!0,composed:!0}))}}_n.styles=[ot,za,r`
      .icon {
        font-size: 44px;
        text-align: center;
      }

      .heading {
        margin-top: 4px;
      }

      .cost {
        text-align: center;
        color: var(--pv-star, #8A6A00);
        font-weight: 800;
        margin-bottom: 10px;
      }

      .person {
        display: flex;
        align-items: center;
        gap: 10px;
        min-height: 52px;
        border-bottom: 1px solid var(--pv-border-subtle, #F1F1EE);
      }

      .person .words {
        flex: 1 1 auto;
      }

      .person .meta {
        color: var(--pv-text-secondary, #5F6670);
        font-size: 0.8125rem;
      }

      .toggle {
        min-height: 40px;
        padding: 0 12px;
        border-radius: 999px;
        border: 1px solid var(--pv-border, #E7E7E3);
        background: var(--pv-card-bg, #FFFFFF);
        color: var(--pv-text, #1A1B1E);
        font: inherit;
        font-weight: 650;
        cursor: pointer;
      }

      .toggle[aria-pressed='true'] {
        border-color: var(--pv-accent, #5B5BD6);
        background: var(--pv-accent-tint, #EEEEFC);
        color: var(--pv-accent-tint-ink, #3B3BB0);
      }

      label.title,
      .title {
        display: block;
        margin: 12px 0 6px;
        font-size: 0.8125rem;
        font-weight: 750;
        color: var(--pv-text-secondary, #5F6670);
      }

      input[type='text'],
      input[type='number'] {
        box-sizing: border-box;
        width: 100%;
        min-height: 48px;
        padding: 0 14px;
        border-radius: 12px;
        border: 1px solid var(--pv-border, #E7E7E3);
        background: var(--pv-card-bg, #FFFFFF);
        color: var(--pv-text, #1A1B1E);
        font: inherit;
      }

      .pictures {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
      }

      .pictures button {
        width: 44px;
        height: 44px;
        border-radius: 12px;
        border: 1px solid var(--pv-border, #E7E7E3);
        background: var(--pv-card-bg, #FFFFFF);
        font-size: 22px;
        cursor: pointer;
      }

      .pictures button[aria-pressed='true'] {
        border: 2px solid var(--pv-accent, #5B5BD6);
      }

      .faces {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
      }

      .face {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 4px;
        min-height: 48px;
        padding: 4px;
        border: none;
        background: transparent;
        font: inherit;
        font-size: 0.8125rem;
        font-weight: 700;
        color: var(--pv-text-secondary, #5F6670);
        cursor: pointer;
        opacity: 0.55;
      }

      .face[aria-pressed='true'] {
        opacity: 1;
        color: var(--pv-text, #1A1B1E);
      }

      .row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        margin-top: 12px;
      }

      .switch {
        position: relative;
        width: 52px;
        height: 32px;
        flex-shrink: 0;
        border: none;
        border-radius: 999px;
        background: var(--pv-track, #ECECE8);
        cursor: pointer;
      }

      .switch::after {
        content: '';
        position: absolute;
        top: 3px;
        left: 3px;
        width: 26px;
        height: 26px;
        border-radius: 50%;
        background: #FFFFFF;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.25);
        transition: transform 180ms ease;
      }

      .switch[aria-checked='true'] {
        background: var(--pv-accent, #5B5BD6);
      }

      .switch[aria-checked='true']::after {
        transform: translateX(20px);
      }

      .problem {
        margin-top: 8px;
        color: var(--pv-bad-ink, #A12828);
        font-weight: 650;
      }

      .danger {
        color: var(--pv-danger, #C62828);
      }
    `],e([ue({type:String,reflect:!0})],_n.prototype,"layout",void 0),e([ue({attribute:!1})],_n.prototype,"card",void 0),e([ue({attribute:!1})],_n.prototype,"people",void 0),e([ue({attribute:!1})],_n.prototype,"hass",void 0),e([ue({attribute:!1})],_n.prototype,"colorOf",void 0),e([ue({type:Boolean})],_n.prototype,"canEdit",void 0),e([ue({type:Boolean})],_n.prototype,"busy",void 0),e([me()],_n.prototype,"_editing",void 0),e([me()],_n.prototype,"_draft",void 0),e([me()],_n.prototype,"_problem",void 0),ge("pv-chores-reward-sheet",_n);class xn extends le{constructor(){super(...arguments),this.data=null,this.mode="light",this.layout="landscape",this.household=null,this.session=null,this.services={},this.revision=0,this.openTarget=null,this._sheet=null,this._toast=null,this._minute=Math.floor(Date.now()/6e4),this._weekOffset=0,this._week=null,this._weekFailed=!1,this._weekAsked=null,this._weekRevision=-1,this._myDayMember=null,this._reviewing=new Set,this._overlayOpen=!1,this._opener=null,this._last=null,this._columnsFor=vt((e,t,i,s,a)=>ks(e,{today:e.today,now:new Date,events:vs(i,new Date(e.day.start),new Date(e.day.end)),timeFormat:s,activities:new Map(e.chores.map(e=>[e.id,e])),members:t?Pi(t.members):[]})),this._colorOf=e=>Ni(e,this.mode),this._askStartOver=async()=>{await this.asParent("Who's starting over?")&&(this._sheet={kind:"start_over"})},this._onToastAction=e=>{this._toast=null,this.onToastAction(e.detail.toast,e.detail.action)}}get service(){return this.services?.chores}moduleAction(e){"inbox"===e&&this._openInbox(),"add"===e&&this._openQuickAdd()}async _openInbox(){await this.asParent("Who's approving?")&&(this._sheet={kind:"inbox"})}async _openQuickAdd(){await this.asParent("Who's adding a chore?")&&(this._sheet={kind:"quick_add",busy:!1})}async _review(e){const{row:t,allow:i,note:s}=e,a=this.service?.api;if(!a||!await this.asParent("Who's approving?"))return!1;this._reviewing=new Set([...this._reviewing,t.id]);try{return await a.review(t.id,i?"allow":"decline",s??null),this.showToast({id:`review-${t.id}`,text:ua(t,i,s)}),!0}catch(e){return this.showToast({id:`review-${t.id}-${Date.now()}`,text:_i(e)??"That didn't save. Try again.",tone:"bad"}),!1}finally{const e=new Set(this._reviewing);e.delete(t.id),this._reviewing=e}}async _approveAll(e){let t=0;for(const i of e){if(!await this._review({row:i,allow:!0}))break;t+=1}t>1&&this.showToast({id:`approved-${Date.now()}`,text:`Approved ${t} chores.`})}async _quickAdd(e){const t=this.service?.board(),i=this.service?.api;if(t&&i&&"quick_add"===this._sheet?.kind&&await this.asParent("Who's adding a chore?")){this._sheet={kind:"quick_add",busy:!0};try{await i.saveActivity(function(e,t){const i=e.name.trim(),s={name:i,icon:Cs(i),category:"other",assignees:[...e.who],on_board:!0,needs_ok:e.needsOk,stars:e.stars},a=Math.round(e.minutes);if("repeats"===e.when){const i=os(t),n="daily"===e.every?"FREQ=DAILY":"weekly"===e.every?`FREQ=WEEKLY;BYDAY=${ba[i.getDay()]}`:`FREQ=MONTHLY;BYMONTHDAY=${Math.min(28,i.getDate())}`;return{...s,schedule:"repeats",repeats:{rrule:n,start:t,window:"day",estimate_minutes:a}}}return{...s,schedule:"once",once:{on:"today"===e.when?t:null,by:"by"===e.when?e.by:null,by_time:null,sessions:1,estimate_minutes:a}}}(e,t.today)),this._sheet=null,this.showToast({id:`added-${Date.now()}`,text:`Added ${e.name.trim()}.`})}catch(e){this._sheet={kind:"quick_add",busy:!1},this.showToast({id:`add-${Date.now()}`,text:_i(e)??"That didn't save. Try again.",tone:"bad"})}}}willUpdate(e){super.willUpdate(e),e.has("_sheet")&&!e.get("_sheet")&&this._sheet&&(this._opener=function(){let e=document.activeElement;for(;e?.shadowRoot?.activeElement;)e=e.shadowRoot.activeElement;return e instanceof HTMLElement?e:null}()),e.has("openTarget")&&this.openTarget?.member&&(this._myDayMember=this.openTarget.member);const t=this.service?.takeNotices()??[],i=t[t.length-1];i&&(this._toast={id:i.id,text:i.text,tone:"bad",ms:7e3})}updated(e){if(super.updated(e),"week"===this.view&&this._loadWeek(),e.has("_sheet")&&e.get("_sheet")&&!this._sheet){const e=this._opener;this._opener=null,e?.isConnected&&e.focus()}const t=null!==this._sheet;t!==this._overlayOpen&&(this._overlayOpen=t,this.dispatchEvent(new CustomEvent("pv-overlay-change",{detail:{open:t},bubbles:!0,composed:!0})))}connectedCallback(){super.connectedCallback(),this._clock=setInterval(()=>{const e=Math.floor(Date.now()/6e4);e!==this._minute&&(this._minute=e)},5e3)}disconnectedCallback(){super.disconnectedCallback(),clearInterval(this._clock),this._overlayOpen&&(this._overlayOpen=!1,this.dispatchEvent(new CustomEvent("pv-overlay-change",{detail:{open:!1},bubbles:!0,composed:!0})))}render(){const e=this.service;return e?U`
      ${this._renderContent(e)}
      <pv-toast .toast=${this._toast} @pv-toast-gone=${()=>{this._toast=null}}
        @pv-toast-action=${this._onToastAction}></pv-toast>
      ${this._renderSheet()}
    `:Y}_renderContent(e){const t=e.feed;return t?"needs_a_look"===t.state?this._needsALook():"newer"===t.state?U`
        <div class="state">
          <div class="art" aria-hidden="true">⬆️</div>
          <h2>Update PlanaVista to use chores</h2>
          <p>These chores were saved by a newer PlanaVista. Update it in HACS to use them on this screen.</p>
        </div>
      `:"off"!==t.state&&t.board?U`
      ${"offline"===e.status?U`
        <div class="banner" role="status">
          <span class="text"><strong>Can't reach Home Assistant.</strong> Your check-offs aren't lost. We'll keep trying.</span>
          <button class="pv-btn pv-btn-secondary" type="button" @click=${()=>e.retry()}>Try again</button>
        </div>
      `:Y}
      ${t.save_failed?U`
        <div class="banner" role="status">
          <span class="text"><strong>Couldn't save.</strong> Home Assistant will keep trying. If this stays, check its storage in Settings, System, Repairs.</span>
        </div>
      `:Y}
      <div class="view">${this.renderView()}</div>
    `:U`
        <div class="state">
          <div class="art" aria-hidden="true">🧺</div>
          <h2>Chores are off</h2>
          <p>A parent can turn them on in Settings.</p>
        </div>
      `:"offline"===e.status?this._unreachable(e):this._skeleton()}_myDayColumn(e){const t=this._myDayMember??this.household?.account.member_id??null;return e.find(e=>e.member.id===t)??e[0]}_openMyDay(e){this._myDayMember=e,this.dispatchEvent(new CustomEvent("pv-view-change",{detail:{view:"my_day"},bubbles:!0,composed:!0}))}async _setStyle(e,t){const i=this.service?.api;if(i&&await this.asMember(e,"Whose day is this?"))try{await i.savePrefs(e,{my_day:t})}catch(e){this.showToast({id:`style-${Date.now()}`,text:_i(e)??"That didn't save. Try again.",tone:"bad"})}}_renderMyDay(e){const t=this.display?.time_format??"12h",i=this._columnsFor(e,this.household,this.data,t,this._minute),s=this._myDayColumn(i);if(!s)return Y;const a=s.member;return U`
      <pv-chores-my-day .column=${s} .columns=${i} .board=${e} .hass=${this.hass} layout=${this.layout}
        .events=${vs(this.data,new Date(e.day.start),new Date(e.day.end))}
        .colorOf=${this._colorOf} .timeFormat=${t} .minute=${this._minute}
        .goal=${Ms(a,s.entry,e.rewards)} .shares=${function(e,t){const i=t.map(t=>({member:t,minutes:e.members[t.id]?.contribution.shared_minutes??0})),s=i.reduce((e,t)=>e+t.minutes,0);return s<=0?[]:i.filter(e=>e.minutes>0).map(e=>({...e,percent:Math.round(100*e.minutes/s)}))}(e,Pi(this.household?.members??[]))}
        .bedtime=${function(e,t){const i=e.bedtime,s=(5===t.getDay()||6===t.getDay()?i?.weekend:i?.weeknight)??i?.weeknight;if(!s||!/^\d{1,2}:\d{2}$/.test(s))return null;const[a,n]=s.split(":").map(Number);return new Date(t.getFullYear(),t.getMonth(),t.getDate(),a,n)}(a,new Date)}
        ?locked=${"no"===is(this.household,this.session,a.id)}
        @pv-my-day-member=${e=>{this._myDayMember=e.detail.member}}
        @pv-my-day-style=${e=>{this._setStyle(e.detail.member,e.detail.style)}}
        @pv-hold-done=${e=>this._complete(e.detail)}
        @pv-hold-undo=${e=>this._uncheck(e.detail)}
        @pv-hint=${e=>this._hint(e.detail.row)}
        @pv-row-options=${e=>this._openOptions(e.detail.row)}></pv-chores-my-day>
    `}_loadWeek(e=!1){const t=this.service?.board(),i=this.service?.api;if(!t||!i)return;const s=0===this._weekOffset?t.week.start:Rs(t.week.start,7*this._weekOffset),a=0===this._weekOffset&&this._weekRevision!==this.revision;(e||this._weekAsked!==s||a)&&(this._weekAsked=s,this._weekRevision=this.revision,this._week?.week.start!==s&&(this._week=null),this._weekFailed=!1,i.week(s).then(e=>{this._weekAsked===s&&(this._week=e)},()=>{this._weekAsked===s&&(this._weekFailed=!0)}))}_renderWeek(e){const t=Pi(this.household?.members??[]),i=this._week;return U`
      <pv-chores-week .view=${i} .rows=${i?function(e,t,i){return t.filter(t=>e.members[t.id]).map(t=>{const s=e.members[t.id];return{member:t,cells:s.days.map(Zs),weekly:ea(s.weekly,i,e.today)}})}(i,t,e.week.days_left):[]}
        .highlights=${i?function(e,t,i=3){const s=[];for(const i of t){const t=e.members[i.id];if(!t)continue;const a=t.days.filter(e=>"future"!==e.kind&&!e.away&&(e.due??0)>0);a.length>=2&&a.some(e=>"past"===e.kind)&&a.every(e=>Zs(e).closed)&&s.push({key:`closed:${i.id}`,member:i,text:`${i.name} has closed every ring this week.`})}for(const i of t){const t=e.members[i.id];if(t)for(const a of t.days)for(const t of a.missed_items??[])s.push({key:`missed:${t.key}`,member:i,text:`${i.name} missed ${t.name} on ${Ls(a.date,e.today)}.`,excuse:{occurrence:t.key,name:t.name,day:a.date}})}for(const i of t){const t=e.members[i.id],a=t?.days.filter(e=>e.away).map(e=>e.date)??[];a.length&&s.push({key:`away:${i.id}`,member:i,text:`${i.name} is away ${ia(a)}.`})}return s.slice(0,i)}(i,t):[]} .shares=${i?function(e,t){const i=t.filter(t=>e.members[t.id]).map(t=>({member:t,minutes:e.members[t.id].contribution.shared_minutes})),s=i.reduce((e,t)=>e+t.minutes,0);return s<=0?[]:i.filter(e=>e.minutes>0).map(e=>({...e,text:`${e.member.name} ${hs(e.minutes)}`,percent:100*e.minutes/s}))}(i,t):[]}
        .hass=${this.hass} .colorOf=${this._colorOf} layout=${this.layout} ?current=${0===this._weekOffset}
        ?failed=${this._weekFailed} ?canExcuse=${"no"!==ss(this.household,this.session)}
        @pv-week-nav=${e=>this._navWeek(e.detail.offset)}
        @pv-week-day=${e=>this._openDay(e.detail.member,e.detail.date)}
        @pv-week-excuse=${e=>{this._excuseMissed(e.detail.occurrence,e.detail.name,e.detail.member)}}>
      </pv-chores-week>
    `}_navWeek(e){this._weekOffset=0===e?0:this._weekOffset+e,this._loadWeek(0===e&&this._weekFailed)}_openDay(e,t){const i=this.service?.api;if(!i)return;const s={kind:"day",member:e,date:t,day:null,failed:!1};this._sheet=s,i.day(t).then(e=>{"day"===this._sheet?.kind&&this._sheet.date===t&&(this._sheet={...this._sheet,day:e})},()=>{"day"===this._sheet?.kind&&this._sheet.date===t&&(this._sheet={...this._sheet,failed:!0})})}async _excuseMissed(e,t,i){const s=this.service?.api;if(s&&await this.asParent(`Who's excusing ${t}?`))try{await s.excuseMissed(e);const a=this._member(i)?.name;this.showToast({id:`excused-${e}`,text:`Excused ${t}.${a?` ${a}'s streak holds.`:""}`}),this._loadWeek(!0),"day"===this._sheet?.kind&&this._openDay(this._sheet.member,this._sheet.date)}catch(e){this.showToast({id:`excuse-${Date.now()}`,text:_i(e)??"That didn't save. Try again.",tone:"bad"})}}_renderRewards(e){const t=Pi(this.household?.members??[]);return U`
      <pv-chores-rewards .balances=${function(e,t){return t.filter(t=>t.stars&&e.members[t.id]).map(t=>({member:t,stars:e.members[t.id].stars,goal:Ms(t,e.members[t.id],e.rewards)}))}(e,t)} .cards=${sa(e,t)}
        .recent=${function(e,t){const i=e.recent_redemptions[0];if(!i)return null;const s=e=>e?t.find(t=>t.id===e)?.name??null:null,a=s(i.member)??i.member,n="auto"===i.by?null:s(i.by);return`Recently: ${a} redeemed ${i.name} ${"today"===Ls(i.at.slice(0,10),e.today)?"today":`on ${Ls(i.at.slice(0,10),e.today)}`}${n?`, approved by ${n}`:""}.`}(e,t)} .hass=${this.hass} .colorOf=${this._colorOf} layout=${this.layout}
        ?canEdit=${"no"!==ss(this.household,this.session)}
        @pv-reward-redeem=${e=>this._redeem(e.detail.reward)}
        @pv-reward-open=${e=>{this._openReward(e.detail.reward)}}></pv-chores-rewards>
    `}_redeem(e){const t=this.service?.board();if(!t)return;const i=sa(t,Pi(this.household?.members??[])).find(t=>t.reward.id===e);if(!i)return;const s=i.people.filter(e=>e.afford&&!e.asked).map(e=>e.member),a=async t=>{const s=this.service?.api;if(s&&await this.asMember(t.id,`Who's getting ${i.reward.name}?`))try{const a=await s.redeem(t.id,e);this.showToast({id:`redeem-${Date.now()}`,text:"given"===a.result?`${i.reward.name} is ${t.name}'s!`:`Asked for ${i.reward.name}. A parent will answer.`})}catch(e){this.showToast({id:`redeem-${Date.now()}`,text:_i(e)??"That didn't save. Try again.",tone:"bad"})}};1!==s.length?this._sheet={kind:"people",heading:`Who's getting ${i.reward.name}?`,people:s,body:`It costs ★ ${i.reward.cost}.`,pick:e=>{e&&a(e)}}:a(s[0])}async _openReward(e){(null!==e||await this.asParent("Who's adding a reward?"))&&(this._sheet={kind:"reward",id:e,busy:!1})}async _saveReward(e,t){const i=this.service?.api;if(i&&await this.asParent(e?"Who's changing this reward?":"Who's adding a reward?")){this._sheet={kind:"reward",id:e,busy:!0};try{await i.saveReward(function(e){return{name:e.name.trim(),icon:e.icon.trim()||null,cost:e.cost,needs_ok:e.needsOk,who:[...e.who]}}(t),e??void 0),this._sheet=null,this.showToast({id:`reward-${Date.now()}`,text:e?`Saved ${t.name.trim()}.`:`Added ${t.name.trim()}.`})}catch(t){this._sheet={kind:"reward",id:e,busy:!1},this.showToast({id:`reward-${Date.now()}`,text:_i(t)??"That didn't save. Try again.",tone:"bad"})}}}async _setGoal(e,t){const i=this.service?.api,s=this._member(e);if(!i||!s||!await this.asMember(e,"Whose goal is this?"))return;const a=this.service?.board()?.rewards.find(e=>e.id===t);try{await i.savePrefs(e,{goal:t}),this.showToast({id:`goal-${Date.now()}`,text:a?`${s.name} is saving up for ${a.name}.`:`${s.name} has no goal now.`})}catch(e){this.showToast({id:`goal-${Date.now()}`,text:_i(e)??"That didn't save. Try again.",tone:"bad"})}}renderView(){const e=this.service?.board();return e?0===e.chores.length?this._empty():"my_day"===this.view?this._renderMyDay(e):"week"===this.view?this._renderWeek(e):"rewards"===this.view?this._renderRewards(e):U`
      <pv-chores-board .board=${e} .household=${this.household} .session=${this.session} .data=${this.data}
        .hass=${this.hass} .timeFormat=${this.display?.time_format??"12h"} .mode=${this.mode} layout=${this.layout}
        .minute=${this._minute}
        @pv-hold-done=${e=>this._complete(e.detail)}
        @pv-hold-undo=${e=>this._uncheck(e.detail)}
        @pv-hint=${e=>this._hint(e.detail.row)}
        @pv-row-options=${e=>this._openOptions(e.detail.row)}
        @pv-member-open=${e=>this._openMyDay(e.detail.member)}></pv-chores-board>
    `:Y}_empty(){const e=ss(this.household,this.session);return U`
      <div class="state">
        <div class="art" aria-hidden="true">🧺</div>
        <h2>No chores yet</h2>
        <p>Add your family's chores, and they'll show up here for everyone.</p>
        ${"no"!==e?U`
          <div class="buttons">
            <button class="pv-btn pv-btn-primary" type="button" @click=${()=>this.moduleAction("add")}>Add chores</button>
          </div>
        `:Y}
      </div>
    `}_member(e){return this.household?.members.find(t=>t.id===e)}async asMember(e,t){const i=is(this.household,this.session,e);return"yes"===i||!("no"===i||!this.pinGate)&&this.pinGate.ask(function(e,t){if(!e)return[];const i=e.members.find(e=>e.id===t),s=Ri(e.members).filter(e=>e.id!==t);return i?.has_pin?[i,...s]:s}(this.household,e),t)}async _complete(e){const{row:t}=e,i=this.service,s=i?.board();if(!i||!s)return void e.settle(!1);const a=t.item.member;await this.asMember(a,`Who's checking off ${t.name}?`)?(this._checkOff(t,a,s,void 0,e.from),e.settle(!0)):e.settle(!1)}_checkOff(e,t,i,s,a){const n=this.service,r=this._member(s??t),o=i.chores.find(t=>t.id===e.item.chore),d=function(e,t){if(!e||e.parent)return!1;if(t?.needs_ok_always)return!0;const i=e.needs_ok_for??"none";return"all"===i||"marked"===i&&!!t?.needs_ok}(r,o);n.enqueue({op:"complete",occurrence:e.key,member:t,name:e.name,doneBy:s,shows:d?"pending":"done"}),Ca("tick"),i.settings.sound&&Da();const l=`done-${e.key}-${Date.now()}`;this._last={row:e,member:t,toast:l};const c=s&&s!==t?this._member(s)?.name:null;this.showToast({id:l,text:d?`${e.name}: waiting for OK`:c?`Done by ${c}`:"Done",actions:[{id:"undo",label:"Undo"},...s?[]:[{id:"someone",label:"Someone else did it?"}]],ms:6e3});const p=this._member(s??t);a&&p?.stars&&!d&&this.updateComplete.then(()=>{this.renderRoot.querySelector("pv-chores-board")?.flyStars(t,a,e.item.stars)})}async _uncheck(e){const{row:t}=e,i=t.item.member;this.service&&await this.asMember(i,`Who's unchecking ${t.name}?`)?(this.service.enqueue({op:"undo",occurrence:t.key,member:i,name:t.name}),e.settle(!0),this.showToast({id:`undo-${t.key}-${Date.now()}`,text:`${t.name} is open again.`})):e.settle(!1)}_hint(e){const t="no"===is(this.household,this.session,e.item.member),i=this._member(e.item.member)?.name??"its owner",s=t?`Only ${i} or a parent can check this off here.`:"done"===e.state?"Hold the check to uncheck it.":"pending"===e.state?"This is waiting for a parent's OK.":"Hold the circle to finish a chore. Let go early and nothing happens.";this.showToast({id:`hint-${Date.now()}`,text:s,ms:3500})}_itemRow(e){const t=this.service?.board();if(!t)return null;for(const i of Object.values(t.members)){const t=i.items.find(t=>t.key===e);if(t)return{key:e,item:t,name:t.name,icon:t.icon,label:null,badge:null,meta:"",state:t.status}}return null}_openOptions(e){this._sheet={kind:"options",key:e.key,history:null,busy:!1}}_optionsModel(e){const t=this.service?.board(),i=this._itemRow(e),s=i?this._member(i.item.member):void 0;return t&&i&&s?{row:i,owner:s,model:Ws({item:i.item,activity:t.chores.find(e=>e.id===i.item.chore),owner:s,members:Pi(this.household?.members??[]),today:t.today,member:is(this.household,this.session,s.id),parent:ss(this.household,this.session)})}:null}async _run(e,t){try{return await e(),this._sheet=null,this.showToast({id:`ok-${Date.now()}`,text:t}),!0}catch(e){return this.showToast({id:`err-${Date.now()}`,text:_i(e)??"That didn't save. Try again.",tone:"bad",ms:6e3}),"options"===this._sheet?.kind&&(this._sheet={...this._sheet,busy:!1}),!1}}async _option(e,t){const i=this.service,s=this._optionsModel(e),a=i?.board();if(!i||!s||!a)return;const{row:n,owner:r}=s,o=n.item,d=i.api,l=a.today,c=n.name;switch(t.id){case"history":try{const t=await d.history(o.chore,o.member);"options"===this._sheet?.kind&&this._sheet.key===e&&(this._sheet={...this._sheet,history:Xs(t,l,this.household?.members??[],this.display?.time_format??"12h")})}catch{"options"===this._sheet?.kind&&(this._sheet={...this._sheet,history:["History isn't available right now."]})}return;case"plan_day":{if(!t.value||!await this.asMember(r.id,`Who's planning ${c}?`))return;const i=o.due_day?` It's still due ${Ls(o.due_day,l)}.`:"";return void await this._run(()=>d.override(e,{planned_day:t.value}),`${c} shows on ${Ls(t.value,l)}.${i}`)}case"more_time":if(!t.value||!await this.asMember(r.id,"Who's asking for more time?"))return;return void await this._run(()=>d.request("more_time",e,t.value),"Asked for more time. A parent will answer.");case"skip":if(!await this.asMember(r.id,`Who's asking to skip ${c}?`))return;return void await this._run(()=>d.request("skip",e),"Asked to skip this week. A parent will answer.");case"undo":if(!await this.asMember(r.id,`Who's unchecking ${c}?`))return;return i.enqueue({op:"undo",occurrence:e,member:r.id,name:c}),this._sheet=null,void this.showToast({id:`undo-${e}-${Date.now()}`,text:`${c} is open again.`});case"done_by":{const t=Pi(this.household?.members??[]).filter(e=>e.id!==r.id);return void(this._sheet={kind:"people",heading:"Who did it?",people:t,body:`They get the credit for ${c}.`,pick:async t=>{if(!t||!await this.asMember(r.id,`Who's checking off ${c}?`))return;const s=this.service?.board();s&&("done"!==o.status&&"pending"!==o.status||i.enqueue({op:"undo",occurrence:e,member:r.id,name:c}),this._checkOff(n,r.id,s,t.id))}})}case"change_due":if(!t.value||!await this.asParent(`Who's changing ${c}?`))return;return void await this._run(()=>d.override(e,{due:t.value}),`${c} is due ${Ls(t.value,l)} now.`);case"hand_off":{const t=Pi(this.household?.members??[]).filter(e=>e.id!==r.id);return void(this._sheet={kind:"people",heading:`Who's doing ${c}?`,people:t,body:"Just this time. It comes back next time.",pick:async t=>{t&&await this.asParent(`Who's handing ${c} over?`)&&await this._run(()=>d.override(e,{assignee:t.id}),`${c} is ${t.name}'s this time.`)}})}case"excuse":if(!await this.asParent(`Who's excusing ${c}?`))return;return void await this._run(()=>d.override(e,{excused:!0}),`${c} is excused. Nothing is missed.`);case"approve":case"send_back":{const e=o.completion?.id;if(!e||!await this.asParent("approve"===t.id?"Who's approving?":"Who's sending it back?"))return;const i="approve"===t.id;return void await this._run(()=>d.review(e,i?"allow":"decline",i?null:t.value??null),i?`${c}: looks good.`:`${c} went back${t.value?`: ${t.value}`:""}.`)}case"delete":if(!await this.asParent(`Who's deleting ${c}?`))return;return void(this._sheet={kind:"delete",row:n})}}_someoneElse(e){const t=Pi(this.household?.members??[]).filter(t=>t.id!==e.member);this._sheet={kind:"people",heading:"Who did it?",body:`They get the credit${t.some(e=>e.stars)?" and the stars":""} for ${e.row.name}.`,people:t,pick:t=>{const i=this.service?.board();t&&i&&this.service&&(this.service.enqueue({op:"undo",occurrence:e.row.key,member:e.member,name:e.row.name}),this._checkOff(e.row,e.member,i,t.id))}}}_skeleton(){const e=Math.max(1,Math.min(4,this.household?.members.length??3));return U`
      <div class="skeleton" aria-busy="true" aria-label="Loading chores">
        ${Array.from({length:e},()=>U`
          <div class="col">
            <div class="who"><div class="bone round" style="width:58px;height:58px"></div>
              <div style="flex:1;display:flex;flex-direction:column;gap:8px">
                <div class="bone" style="width:60%;height:16px"></div><div class="bone" style="width:80%;height:12px"></div>
              </div>
            </div>
            <div class="bone" style="height:44px"></div>
            <div class="bone" style="height:44px"></div>
            <div class="bone" style="height:44px;width:85%"></div>
          </div>
        `)}
      </div>
    `}_unreachable(e){return U`
      <div class="state" role="alert">
        <div class="art" aria-hidden="true">📡</div>
        <h2>Can't reach Home Assistant</h2>
        <p>Your check-offs aren't lost. We'll keep trying.</p>
        <div class="buttons">
          <button class="pv-btn pv-btn-secondary" type="button" @click=${()=>e.retry()}>Try again</button>
        </div>
      </div>
    `}_needsALook(){const e=ss(this.household,this.session);return U`
      <div class="state" role="alert">
        <div class="art" aria-hidden="true">🧰</div>
        <h2>Chores need a look</h2>
        <p>Some chores data couldn't be read, so nothing is shown or saved until a parent decides. To get it back,
          restore a Home Assistant backup from before it went missing (Settings, System, Backups). Or start over
          with no chores.</p>
        ${"no"!==e?U`
          <div class="buttons">
            <button class="pv-btn pv-btn-secondary" type="button" @click=${this._askStartOver}>Start over</button>
          </div>
        `:Y}
      </div>
    `}async asParent(e){const t=ss(this.household,this.session);if("yes"===t)return!0;if("no_pin"===t)return this._sheet={kind:"no_pin",heading:"This needs a parent's PIN"},!1;if("no"===t||!this.pinGate||!this.household)return!1;const i=this.household.members.filter(e=>e.parent&&e.has_pin);return this.pinGate.ask(i,e)}showToast(e){this._toast=e}onToastAction(e,t){const i=this._last;i&&i.toast===e.id&&this.service&&("undo"===t?(this.service.enqueue({op:"undo",occurrence:i.row.key,member:i.member,name:i.row.name}),this._last=null):"someone"===t&&this._someoneElse(i))}renderSheet(){return Y}_renderSheet(){const e=this._sheet;if(!e)return this.renderSheet();if("day"===e.kind){const t=this._member(e.member),i=this.service?.board();return t&&i?U`
        <pv-chores-day-sheet .layout=${this.layout} .member=${t} date=${e.date} today=${i.today}
          .day=${e.day} ?failed=${e.failed} ?canExcuse=${"no"!==ss(this.household,this.session)}
          .names=${e=>this._member(e)?.name??e}
          @pv-day-excuse=${t=>{this._excuseMissed(t.detail.occurrence,t.detail.name,e.member)}}
          @pv-sheet-close=${()=>{"day"===this._sheet?.kind&&(this._sheet=null)}}></pv-chores-day-sheet>
      `:Y}if("reward"===e.kind){const t=this.service?.board();if(!t)return Y;const i=Pi(this.household?.members??[]),s=e.id?sa(t,i).find(t=>t.reward.id===e.id)??null:null;return e.id&&!s?(queueMicrotask(()=>{this._sheet===e&&(this._sheet=null)}),Y):U`
        <pv-chores-reward-sheet .layout=${this.layout} .card=${s} .people=${i} .hass=${this.hass} .colorOf=${this._colorOf}
          ?canEdit=${"no"!==ss(this.household,this.session)} ?busy=${e.busy}
          @pv-reward-goal=${e=>{this._setGoal(e.detail.member,e.detail.reward)}}
          @pv-reward-save=${t=>{this._saveReward(e.id,t.detail.draft)}}
          @pv-reward-delete=${()=>{s&&(this._sheet={kind:"delete_reward",id:s.reward.id,name:s.reward.name})}}
          @pv-sheet-close=${()=>{"reward"===this._sheet?.kind&&(this._sheet=null)}}></pv-chores-reward-sheet>
      `}if("delete_reward"===e.kind)return U`
        <pv-notice-sheet .layout=${this.layout} heading=${`Delete ${e.name}?`}
          body="It leaves the catalog. Rewards already given stay in history, and nobody loses stars."
          .actions=${[{id:"delete",label:`Delete ${e.name}`,kind:"destructive"},{id:"cancel",label:"Cancel",kind:"secondary"}]}
          @pv-sheet-action=${t=>{this._confirmDeleteReward(e.id,e.name,t.detail.id)}}></pv-notice-sheet>
      `;if("inbox"===e.kind){const t=this.service?.board();if(!t)return Y;const i=function(e,t,i,s){const a=new Map(t.map(e=>[e.id,e])),n={chores:[],requests:[],rewards:[],count:e.length};for(const t of e){const e=a.get(t.member)??null,r=e?.name??t.member;if("completion"===t.kind){const o=t.done_by&&t.done_by!==t.member?a.get(t.done_by)?.name??t.done_by:null,d=t.stars?` · ★ ${t.stars}`:"";n.chores.push({id:t.id,kind:t.kind,member:e,lead:o?`${o} finished`:`${r} finished`,what:t.name,tail:o?` for ${r}`:"",detail:`${ha(t.at,i,s)}${d}`,allow:"Looks good",decline:"Send back",blocked:!1})}else if("more_time"===t.kind||"skip"===t.kind){const s="more_time"===t.kind;n.requests.push({id:t.id,kind:t.kind,member:e,lead:s?`${r} asks for more time on`:`${r} asks to skip`,what:t.name,tail:s?"":" this week",detail:s&&t.until?`Move the due date to ${Ls(t.until,i)}`:"It would be excused, so nothing is missed.",allow:"Allow",decline:"Not this time",blocked:!1})}else{const i=t.cost??0,s=t.balance??0;n.rewards.push({id:t.id,kind:t.kind,member:e,lead:`${r} wants`,what:t.name,tail:"",detail:s>=i?`★ ${i} of ${s}`:`★ ${i}, and ${r} has ${s}: not enough stars yet`,allow:"Approve",decline:"Decline",blocked:s<i})}}return n}(t.requests,Pi(this.household?.members??[]),t.today,this.display?.time_format??"12h");return U`
        <pv-chores-inbox .layout=${this.layout} .groups=${i} .hass=${this.hass} .colorOf=${this._colorOf} .busy=${this._reviewing}
          @pv-review=${e=>{this._review(e.detail)}}
          @pv-approve-all=${()=>{this._approveAll(i.chores)}}
          @pv-sheet-close=${()=>{this._sheet===e&&(this._sheet=null)}}></pv-chores-inbox>
      `}if("quick_add"===e.kind){const t=this.service?.board();return t?U`
        <pv-chores-quick-add .layout=${this.layout} .people=${Pi(this.household?.members??[])} .hass=${this.hass}
          .colorOf=${this._colorOf} today=${t.today} .minutesPerStar=${t.settings.minutes_per_star} ?busy=${e.busy}
          @pv-quick-add=${e=>{this._quickAdd(e.detail.draft)}}
          @pv-sheet-close=${()=>{"quick_add"===this._sheet?.kind&&(this._sheet=null)}}></pv-chores-quick-add>
      `:Y}if("options"===e.kind){const t=this._optionsModel(e.key);return t?U`
        <pv-chore-options .layout=${this.layout} .model=${t.model} color=${Ni(t.owner,this.mode)}
          .history=${e.history} ?busy=${e.busy}
          @pv-option=${t=>{this._option(e.key,t.detail)}}
          @pv-sheet-close=${()=>{this._sheet===e&&(this._sheet=null)}}></pv-chore-options>
      `:(queueMicrotask(()=>{this._sheet===e&&(this._sheet=null)}),Y)}if("delete"===e.kind){const t=e.row.name;return U`
        <pv-notice-sheet .layout=${this.layout} heading=${`Delete ${t}?`}
          body="It leaves the board for everyone now. Past weeks still show what was done, and stars stay earned."
          .actions=${[{id:"delete",label:`Delete ${t}`,kind:"destructive"},{id:"cancel",label:"Cancel",kind:"secondary"}]}
          @pv-sheet-action=${t=>{this._confirmDelete(e.row,t.detail.id)}}></pv-notice-sheet>
      `}return"people"===e.kind?U`
        <pv-chores-people-sheet .layout=${this.layout} heading=${e.heading} body=${e.body??""}
          .people=${e.people} .hass=${this.hass} .colorOf=${this._colorOf}
          @pv-person-pick=${t=>{this._sheet=null,e.pick(t.detail.member)}}>
        </pv-chores-people-sheet>
      `:"no_pin"===e.kind?U`
        <pv-notice-sheet .layout=${this.layout} heading=${e.heading}
          body="On a shared screen, a parent's PIN allows this, and no parent has one yet. A parent can set one in Settings, PINs and parent mode, from their own Home Assistant login."
          .actions=${[{id:"ok",label:"OK",kind:"primary"}]}
          @pv-sheet-action=${()=>{this._sheet=null}}></pv-notice-sheet>
      `:U`
      <pv-notice-sheet .layout=${this.layout} heading="Start over with no chores?"
        body="Chores, rewards, stars, and their history are emptied. People, PINs, and calendars stay as they are."
        .actions=${[{id:"start_over",label:"Start over",kind:"destructive"},{id:"cancel",label:"Cancel",kind:"secondary"}]}
        @pv-sheet-action=${e=>this._onStartOver(e.detail.id)}></pv-notice-sheet>
    `}async _confirmDelete(e,t){this._sheet=null,"delete"===t&&this.service&&await this._run(()=>this.service.api.deleteActivity(e.item.chore),`Deleted ${e.name}.`)}async _confirmDeleteReward(e,t,i){this._sheet=null,"delete"===i&&this.service&&await this.asParent(`Who's deleting ${t}?`)&&await this._run(()=>this.service.api.deleteReward(e),`Deleted ${t}.`)}async _onStartOver(e){if(this._sheet=null,"start_over"===e)try{await(this.service?.api.startOver()),this.showToast({id:`start-over-${Date.now()}`,text:"Chores started over."})}catch{this.showToast({id:`start-over-${Date.now()}`,text:"Couldn't start over. Try again.",tone:"bad"})}}}xn.styles=[ot,as,r`
      :host {
        position: relative;
        display: flex;
        flex-direction: column;
        flex: 1 1 auto;
        min-height: 0;
        background: var(--pv-bg, #F8F8F6);
      }

      .view {
        position: relative;
        flex: 1 1 auto;
        min-height: 0;
        display: flex;
        flex-direction: column;
      }

      .skeleton {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
        gap: 12px;
        padding: 12px;
      }

      .skeleton .col {
        display: flex;
        flex-direction: column;
        gap: 12px;
        padding: 16px;
        border-radius: var(--pv-radius-lg, 16px);
        background: var(--pv-card-bg, #FFFFFF);
        border: 1px solid var(--pv-border, #E7E7E3);
      }

      .skeleton .who {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-bottom: 8px;
      }
    `],e([ue({attribute:!1})],xn.prototype,"hass",void 0),e([ue({attribute:!1})],xn.prototype,"data",void 0),e([ue({attribute:!1})],xn.prototype,"display",void 0),e([ue({attribute:!1})],xn.prototype,"mode",void 0),e([ue({attribute:!1})],xn.prototype,"view",void 0),e([ue({type:String,reflect:!0})],xn.prototype,"layout",void 0),e([ue({attribute:!1})],xn.prototype,"household",void 0),e([ue({attribute:!1})],xn.prototype,"session",void 0),e([ue({attribute:!1})],xn.prototype,"services",void 0),e([ue({attribute:!1})],xn.prototype,"revision",void 0),e([ue({attribute:!1})],xn.prototype,"pinGate",void 0),e([ue({attribute:!1})],xn.prototype,"openTarget",void 0),e([me()],xn.prototype,"_sheet",void 0),e([me()],xn.prototype,"_toast",void 0),e([me()],xn.prototype,"_minute",void 0),e([me()],xn.prototype,"_weekOffset",void 0),e([me()],xn.prototype,"_week",void 0),e([me()],xn.prototype,"_weekFailed",void 0),e([me()],xn.prototype,"_myDayMember",void 0),e([me()],xn.prototype,"_reviewing",void 0),ge("pv-chores-module",xn);class wn extends yi{constructor(e,t){super({type:"planavista/chores/subscribe"},e,t)}}class $n extends wi{complete(e,t){return this.call("planavista/chores/complete",t?{occurrence:e,done_by:t}:{occurrence:e})}undo(e){return this.call("planavista/chores/undo",{occurrence:e})}request(e,t,i){return this.call("planavista/chores/request",i?{kind:e,occurrence:t,until:i}:{kind:e,occurrence:t})}review(e,t,i){return this.call("planavista/chores/review",i?{request:e,decision:t,note:i}:{request:e,decision:t})}override(e,t){return this.call("planavista/chores/override",{occurrence:e,...t})}excuseMissed(e,t){return this.call("planavista/chores/excuse_missed",t?{occurrence:e,note:t}:{occurrence:e})}saveActivity(e,t){const i={activity:e};return t&&(i.activity_id=t.id,void 0!==t.rev&&(i.rev=t.rev)),this.call("planavista/chores/activity/save",i)}deleteActivity(e){return this.call("planavista/chores/activity/delete",{activity_id:e})}saveReward(e,t){return this.call("planavista/rewards/save",t?{reward:e,reward_id:t}:{reward:e})}deleteReward(e){return this.call("planavista/rewards/delete",{reward_id:e})}redeem(e,t){return this.call("planavista/rewards/redeem",{member:e,reward:t})}awardStars(e,t,i){return this.call("planavista/stars/award",{member:e,stars:t,reason:i})}week(e){return this.call("planavista/chores/week",e?{date:e}:{},!1)}day(e){return this.call("planavista/chores/day",{date:e},!1)}history(e,t){return this.call("planavista/chores/history",{chore:e,member:t},!1)}savePrefs(e,t){return this.call("planavista/household/member/prefs",{member_id:e,...t})}startOver(){return this.call("planavista/chores/start_over",{})}}function kn(e,t=null){const i=fi(e);return"unknown"===i?{kind:"wait"}:{kind:"refused",code:i,message:t}}let Fn=0;function En(e=Date.now()){return Fn=(Fn+1)%1e6,`${e.toString(36)}-${Fn.toString(36)}-${Math.floor(1e6*Math.random()).toString(36)}`}class Cn{constructor(e,t,i){this._storage=e,this._send=t,this._listener=i,this._flushing=!1,this._again=!1,this._sending=null,this._entries=e.load()}get entries(){return this._entries}get waiting(){return this._entries.length>0}latestFor(e){for(let t=this._entries.length-1;t>=0;t--)if(this._entries[t].occurrence===e)return this._entries[t]}add(e){const t=this.latestFor(e.occurrence);if("undo"===e.op&&"complete"===t?.op&&!this._isSending(t))return this._entries=this._entries.filter(e=>e!==t),this._persist(),null;const i={...e,id:e.id??En(),at:e.at??Date.now()};return this._entries=[...this._entries,i],this._persist(),i}async flush(){if(this._flushing)this._again=!0;else{this._flushing=!0;try{do{for(this._again=!1;this._entries.length>0;){const e=this._entries[0];let t;this._sending=e;try{t=await this._send(e)}catch(e){t=kn(e)}if(this._sending=null,"wait"===t.kind)return;this._entries=this._entries.filter(t=>t!==e),this._persist(),"refused"===t.kind&&this._listener.refused(e,t.code,t.message)}}while(this._again)}finally{this._sending=null,this._flushing=!1}}}_isSending(e){return this._sending===e}_persist(){this._storage.save(this._entries),this._listener.changed()}}const Sn="planavista.checkoffs";function Dn(e){return e?[{id:"next",text:`Next: ${e.title} at ${e.time}${e.who?` · ${e.who}`:""}`,open:{module:"calendar"}}]:[]}function An(e){const t=e.household?.modules;return!!e.household?.available&&!0===t?.chores?.enabled}function zn(e,t){return"period_closed"===t?`Couldn't save "${e.name}": the day had ended.`:"pin_required"===t||"parent_mode_required"===t?`Couldn't save "${e.name}". The PIN timed out, so hold it again.`:`Couldn't save "${e.name}". Try again.`}const Mn=new Set;let Tn=null,Bn=0;class Pn{constructor(e){this._host=e,this.id="card"+ ++Bn,this.feed=null,this.status="idle",this.notices=[],this._following=!1,this._boardFor={feed:null,entries:[],board:null},this.api=new $n({callWS:e=>this._host.hass.callWS(e)},()=>this._host.pinSession?.token??null,e=>this._host.sessionEnded(e)),this.queue=(Tn||(Tn=new Cn(function(e=Date.now){return{load(){try{const t=globalThis.localStorage?.getItem(Sn),i=t?JSON.parse(t):[];return Array.isArray(i)?i.filter(t=>!!t&&"object"==typeof t&&"string"==typeof t.occurrence&&("complete"===t.op||"undo"===t.op)&&"number"==typeof t.at&&e()-t.at<1728e5):[]}catch{return[]}},save(e){try{0===e.length?globalThis.localStorage?.removeItem(Sn):globalThis.localStorage?.setItem(Sn,JSON.stringify(e))}catch{}}}}(),e=>{const t=[...Mn].find(t=>t.id===e.card)??[...Mn].find(e=>e.connected);return t?t.send(e):Promise.resolve({kind:"wait"})},{changed:()=>Mn.forEach(e=>e.requestUpdate()),refused:(e,t)=>{const i=[...Mn].find(t=>t.id===e.card)??[...Mn][0];i?.notify({id:e.id,text:zn(e,t),entry:e})}})),Tn),this._subscription=new wn(e=>{this.feed=e,this.requestUpdate()},e=>{this.status=e,"live"===e&&this.queue.flush(),this.requestUpdate()}),e.addController(this)}get connected(){return"live"===this.status}hostConnected(){Mn.add(this),this._follow(),this._resend=setInterval(()=>{this.queue.waiting&&this.connected&&this.queue.flush()},15e3)}hostUpdate(){this._follow()}hostDisconnected(){Mn.delete(this),clearInterval(this._resend),this._resend=void 0,this._subscription.stop(),this._following=!1,this.feed=null}requestUpdate(){this._host.serviceChanged()}_follow(){An({household:this._host.householdView})?(this._following=!0,this._subscription.update(this._host.hass?.connection)):this._following&&(this._subscription.stop(),this._following=!1,this.feed=null)}retry(){this._subscription.retry(),this.queue.flush()}board(){const e=this.feed,t=this.queue.entries;if(this._boardFor.feed===e&&this._boardFor.entries===t)return this._boardFor.board;const i="ok"===e?.state&&e.board?function(e,t){if(0===t.length)return e;const i={...e.members},s=new Set;for(const e of t){const t=i[e.member];if(!t)continue;const a=t.items.findIndex(t=>t.key===e.occurrence);if(a<0)continue;const n=pa(t.items[a],e);if(n===t.items[a])continue;const r=[...t.items];r[a]=n,i[e.member]={...t,items:r},s.add(e.member)}if(0===s.size)return e;const a={due:0,done:0,pending:0};for(const[e,t]of Object.entries(i)){const n=s.has(e)?la(t.items):t.today;s.has(e)&&(i[e]={...t,today:n}),a.due+=n.due,a.done+=n.done,a.pending+=n.pending}return{...e,members:i,household:a}}(e.board,t):null;return this._boardFor={feed:e,entries:t,board:i},i}enqueue(e){const t=this.queue.add({...e,card:this.id});return this.connected&&this.queue.flush(),t}async send(e){if(!this.connected)return{kind:"wait"};try{return"complete"===e.op?await this.api.complete(e.occurrence,e.doneBy):await this.api.undo(e.occurrence),{kind:"sent"}}catch(e){return kn(e,_i(e))}}notify(e){this.notices=[...this.notices,e],this.requestUpdate()}takeNotices(){const e=this.notices;return e.length&&(this.notices=[]),e}glance(e){if(!An(e))return[];const t=this.board(),i=function(e){if(!e)return[];const{due:t,done:i,pending:s}=e.household;if(0===t)return[];const a=Math.min(t,i+s);return[{id:"chores",text:a>=t?`All ${t} chores done today`:`${a} of ${t} chores done today`,progress:a/t,primary:!0,open:{module:"chores",view:"board"}}]}(t);if(!t)return i;const s=this._host.planavistaData,a=new Date,n=function(e,t,i,a){const n=e.find(e=>e.start>i);if(!n)return null;const r=n.member?t.find(e=>e.id===n.member)?.name??null:null;return{title:n.title,time:ms(n.start,a),who:r??(o=n.calendar,function(e,t){return e?.calendars?.find(e=>e.entity_id===t)?.display_name??null}(s,o))};var o}(vs(s,new Date(t.day.start),new Date(t.day.end)),e.household?.members??[],a,s?.display?.time_format??"12h");return[...i,...Dn(n)]}barActions(e){return function(e,t,i){if(!e)return[];const s=[],a=e.requests.length;return a>0&&function(e){return"no"!==ss(e,null)}(t)&&s.push({id:"inbox",label:`${a} waiting for OK`,short:String(a),glyph:"⏳",tone:"act"}),"no"===ss(t,i)||i?.parent||s.push({id:"add",label:"Add chore",short:"",glyph:"+"}),s}(this.board(),e.household??null,this._host.pinSession)}stripActions(){return this.board()?[{id:"add",label:"Add chore",glyph:"+"}]:[]}memberProgress(e){const t=this.board()?.members[e];return t?{done:t.today.done,pending:t.today.pending,due:t.today.due}:null}}const On={id:"chores",label:"Chores",icon:"mdi:checkbox-marked-circle-outline",tag:"pv-chores-module",order:20,views:[{id:"board",label:"Board"},{id:"week",label:"Week"},{id:"my_day",label:"My day"},{id:"rewards",label:"Rewards"}],watchedEntities:()=>[],enabled:e=>An(e),service:e=>new Pn(e)};!function(e=Wi){e.register(On)}();const Rn=Symbol.for(""),In=e=>{if(e?.r===Rn)return e?._$litStatic$},Ln=e=>({_$litStatic$:e,r:Rn}),Nn=new Map,Hn=(e=>(t,...i)=>{const s=i.length;let a,n;const r=[],o=[];let d,l=0,c=!1;for(;l<s;){for(d=t[l];l<s&&void 0!==(n=i[l],a=In(n));)d+=a+t[++l],c=!0;l!==s&&o.push(n),r.push(d),l++}if(l===s&&r.push(t[s]),c){const e=r.join("$$lit$$");void 0===(t=Nn.get(e))&&(r.raw=r,Nn.set(e,t=r)),i=o}return e(t,...i)})(U);function jn(e,t){if(e===t)return!0;if(!e||!t||"object"!=typeof e||"object"!=typeof t)return!1;const i=Object.keys(e),s=Object.keys(t);return i.length===s.length&&i.every(i=>jn(e[i],t[i]))}class qn{constructor(e=()=>{}){this._changed=e,this._pending={},this._unsent={},this._send=null,this._onError=null,this._tap=null,this._listeners=new Set}subscribe(e){return this._listeners.add(e),()=>{this._listeners.delete(e)}}_notify(){this._changed();for(const e of this._listeners)e()}current(e){return{...e,...this._pending}}reconcile(e){for(const t of Object.keys(this._pending))!(t in this._unsent)&&jn(e[t],this._pending[t])&&delete this._pending[t]}set(e,t,i,s){Object.assign(this._pending,e),Object.assign(this._unsent,e),this._send=t,this._onError=i,s&&(this._tap={...s,at:Date.now()}),clearTimeout(this._timer),this._timer=setTimeout(()=>this.flush(),400),this._notify()}takeTap(e=Date.now()){const t=this._tap;return this._tap=null,t&&e-t.at<=3e3?{x:t.x,y:t.y}:null}flush(){clearTimeout(this._timer),this._timer=void 0;const e=this._unsent,t=this._send;if(!t||0===Object.keys(e).length)return;this._unsent={};const i=this._onError,s=()=>{for(const t of Object.keys(e))!(t in this._unsent)&&jn(this._pending[t],e[t])&&delete this._pending[t];this._notify()};t(e).then(()=>setTimeout(s,5e3),e=>{s(),i?.(e)})}}function Un(e){const t=e?.["sun.sun"];if(!t)return null;const i=e=>{const i=t.attributes?.[e];return"string"==typeof i?i:void 0};return{state:t.state,next_rising:i("next_rising"),next_setting:i("next_setting")}}function Vn(e){const t="automatic"===e.appearance;return{entities:t&&"sun"===e.appearance_switch?["sun.sun"]:[],haDarkMode:t&&"home_assistant"===e.appearance_switch}}const Wn=["light","dark","automatic"],Yn=["sun","schedule","home_assistant"],Kn=["planavista","minimal","vibrant"],Xn=["device","full","reduced"],Gn={light:"Light",dark:"Dark",automatic:"Automatic"},Jn={planavista:"PlanaVista",minimal:"Minimal",vibrant:"Vibrant"},Qn={sun:"At sunset and sunrise",schedule:"On a schedule",home_assistant:"Match Home Assistant"},Zn={device:"Follow the device",full:"Full",reduced:"Reduced"},er=/^([01]\d|2[0-3]):([0-5]\d)$/,tr={planavista:["planavista","light"],light:["planavista","light"],dark:["planavista","dark"],minimal:["minimal","light"],modern:["vibrant","light"],vibrant:["vibrant","light"]};function ir(e,t,i){return t.includes(e)?e:i}function sr(e,t){return"string"==typeof e&&er.test(e)?e:t}function ar(e){return e&&"object"==typeof e&&!Array.isArray(e)?{...e}:null}function nr(e){const t={};for(const i of["corner_style","shadow_depth","event_style","avatar_border"])e[i]&&(t[i]=e[i]);return"light"===t.avatar_border&&(t.avatar_border="white"),t}function rr(e){const t=e??{},i="string"==typeof t.theme&&t.theme?t.theme:"planavista",[s,a]=tr[i]??tr.planavista,n=ar(t.theme_overrides)??{},r=function(e){const t={};for(const i of["accent","background","now_color"])e[i]&&(t[i]=e[i]);const i=e.header_style;return"custom"===i?e.header_custom&&(t.header=e.header_custom):i&&(t.header=i),t}(n),o=ar(t.colors_light),d=ar(t.colors_dark),l=ar(t.shape);return{appearance:ir(t.appearance,Wn,a),appearance_switch:ir(t.appearance_switch,Yn,"sun"),light_from:sr(t.light_from,"07:00"),dark_from:sr(t.dark_from,"21:00"),theme_pair:ir(t.theme_pair,Kn,s),colors_light:o??("dark"===i?{}:r),colors_dark:d??("dark"===i?r:{}),shape:l??nr(n),motion:ir(t.motion,Xn,"device")}}function or(e){return{pair:e.theme_pair,light:e.colors_light,dark:e.colors_dark,shape:e.shape}}function dr(e){const t=er.exec(e);return t?60*Number(t[1])+Number(t[2]):0}function lr(e,t){const i=new Date(e);return i.setHours(Math.floor(t/60),t%60,0,0),i.getTime()<=e.getTime()&&(i.setDate(i.getDate()+1),i.setHours(Math.floor(t/60),t%60,0,0)),i}function cr(e,t){const i=dr(e.light_from),s=dr(e.dark_from);if(i===s)return{mode:"light",next:null};const a=60*t.getHours()+t.getMinutes(),n=i<s?a>=i&&a<s:a>=i||a<s;return{mode:n?"light":"dark",next:lr(t,n?s:i)}}function pr(e,t){const i=e?new Date(e):null;return i&&!Number.isNaN(i.getTime())&&i.getTime()>t.getTime()?i:null}function hr(e){const t=e?new Date(e).getTime():Number.NaN;return Number.isNaN(t)?null:t}function ur(e,t){const i="above_horizon"===e.state,s=t.getTime(),a=hr(i?e.next_setting:e.next_rising),n=hr(i?e.next_rising:e.next_setting),[r,o]=i?["light","dark"]:["dark","light"];return null===a||a>s?{mode:r,next:null===a?null:new Date(a)}:null===n||n>s?{mode:o,next:null===n?null:new Date(n)}:{mode:r,next:null}}function mr(e,t){const i=String(e.getMinutes()).padStart(2,"0");return"24h"===t?`${String(e.getHours()).padStart(2,"0")}:${i}`:`${e.getHours()%12||12}:${i} ${e.getHours()>=12?"PM":"AM"}`}const vr="planavista-page-styles",gr="planavista-transition-styles";function br(e,t=document){let i=t.getElementById(gr);e?(i||(i=t.createElement("style"),i.id=gr,t.head.appendChild(i)),i.textContent=e):i?.remove()}let yr=null,fr=!1;const _r="root";function xr(e=document){return"function"==typeof e.startViewTransition}const wr=["pointerdown","keydown","wheel"],$r={capture:!0,passive:!0};class kr{constructor(e,t,i,s){this._host=e,this._edits=t,this._source=i,this._settled=s,this.mode="light",this.motion="full",this.settings=rr(void 0),this.look=or(this.settings),this.sunMissing=!1,this._shown=null,this._lastInteraction=0,this._quietUntil=Number.POSITIVE_INFINITY,this._changing=!1,this._wakeUntil=0,this._onInteraction=()=>{this._lastInteraction=Date.now()},this._onVisibility=()=>{"visible"===document.visibilityState&&(this._wakeUntil=Date.now()+15e3,this._host.requestUpdate())},this._onReducedChange=()=>{this._host.requestUpdate()},e.addController(this)}hostConnected(){for(const e of wr)document.addEventListener(e,this._onInteraction,$r);document.addEventListener("visibilitychange",this._onVisibility),this._reduced="function"==typeof matchMedia?matchMedia("(prefers-reduced-motion: reduce)"):void 0,this._reduced?.addEventListener("change",this._onReducedChange)}hostDisconnected(){for(const e of wr)document.removeEventListener(e,this._onInteraction,$r);document.removeEventListener("visibilitychange",this._onVisibility),this._reduced?.removeEventListener("change",this._onReducedChange),clearTimeout(this._timer),this._shown=null}hostUpdate(){const e=this._source();e.display&&(this._display=e.display);const t=rr(this._display);this._edits.reconcile(t);const i=function(e,t){switch(t){case"light":case"dark":return{...e,theme_pair:"planavista",appearance:t};case"planavista":case"minimal":return{...e,theme_pair:t};case"vibrant":case"modern":return{...e,theme_pair:"vibrant"};default:return e}}(this._edits.current(t),e.cardTheme),s=function(e,t){if("automatic"!==e.appearance)return{mode:e.appearance,next:null,sunMissing:!1};if("home_assistant"===e.appearance_switch)return{mode:t.haDark?"dark":"light",next:null,sunMissing:!1};if("sun"===e.appearance_switch){const i=t.sun;return!i||"above_horizon"!==i.state&&"below_horizon"!==i.state?{...cr(e,t.now),sunMissing:!0}:{...ur(i,t.now),sunMissing:!1}}return{...cr(e,t.now),sunMissing:!1}}(i,{now:new Date,sun:e.sun,haDark:e.haDark});var a,n;this.settings=i,this.look=or(i),this.sunMissing=s.sunMissing,this.motion=(a=i.motion,n=!!this._reduced?.matches,"full"===a||"reduced"===a?a:n?"reduced":"full"),this._show(s.mode,e.overlayOpen),this._display||(this._shown=null),this._schedule(s.next)}_show(e,t){if(this._quietUntil=Number.POSITIVE_INFINITY,this._changing)return;if(null===this._shown||e===this._shown)return void this._paint(e);const i=this._edits.takeTap(),s="hidden"===document.visibilityState,a=!i&&Date.now()<this._wakeUntil;if(!(i||s||a||function(e,t,i){return!i&&e-t>=1e4}(Date.now(),this._lastInteraction,t)))return this._quietUntil=t?Number.POSITIVE_INFINITY:this._lastInteraction+1e4,void this._paint(this._shown);const n=a?"none":function(e){return null===e.from||e.from===e.to||e.hidden||!e.supported?"none":e.reducedMotion?"fade":e.byHand?"reveal":"dark"===e.to?"dusk":"dawn"}({from:this._shown,to:e,byHand:null!==i,hidden:s,reducedMotion:"reduced"===this.motion,supported:xr()});this._changing=!0,function(e,t,i,s){return"none"===e||fr||!xr()?i():new Promise((a,n)=>{const r={element:t,apply:()=>i().then(a,n),point:s};yr&&yr.kind===e?yr.changes.push(r):yr?r.apply():(yr={kind:e,changes:[r]},setTimeout(()=>{!async function(){const e=yr;if(yr=null,!e)return;fr=!0;const t=document.documentElement;br(function(e,t){if(0===e.length||"none"===t)return"";const i=t=>e.map(e=>`html[data-pv-vt]::view-transition-${t}(${e})`).join(","),s=["html[data-pv-vt]::view-transition-old(root),html[data-pv-vt]::view-transition-new(root){animation:none}",`${i("group")}{animation:none}`,`${i("old")},${i("new")}{animation:none;mix-blend-mode:normal}`];if("dusk"===t||"dawn"===t){const e=`linear-gradient(to ${"dusk"===t?"bottom":"top"},transparent 0%,transparent 47.6%,#000 52.4%,#000 100%)`,a="dusk"===t?"0% 100%":"0% 0%";s.push(`${i("old")}{z-index:2;-webkit-mask-image:${e};mask-image:${e};-webkit-mask-size:100% 210%;mask-size:100% 210%;-webkit-mask-repeat:no-repeat;mask-repeat:no-repeat;-webkit-mask-position:${a};mask-position:${a}}`)}return"reveal"===t&&s.push(`${i("new")}{z-index:2}`),s.join("\n")}([_r],e.kind)),t.dataset.pvVt=e.kind;let i=[];const s=()=>Promise.all(e.changes.map(e=>e.apply())).then(()=>{});try{const t=document.startViewTransition.bind(document);let a;try{a=t(s)}catch{return void await s()}try{await a.ready,i=function(e,t){const i=document.documentElement,s=`::view-transition-old(${_r})`,a=`::view-transition-new(${_r})`;if("dusk"===e||"dawn"===e){const[t,a]="dusk"===e?["0% 100%","0% 0%"]:["0% 0%","0% 100%"];return[i.animate({maskPosition:[t,a],webkitMaskPosition:[t,a]},{duration:2e3,easing:"cubic-bezier(.45,0,.25,1)",fill:"both",pseudoElement:s})]}if("reveal"===e){const e=t.find(e=>e.point)??t[0],s=e.element.getBoundingClientRect(),n=function(e,t,i){return{x:e.x,y:e.y,radius:Math.hypot(Math.max(e.x,t-e.x),Math.max(e.y,i-e.y))}}(e.point??{x:s.left+s.width/2,y:s.top+s.height/2},window.innerWidth,window.innerHeight),r=Fa(wa);return[i.animate({clipPath:[`circle(0px at ${n.x}px ${n.y}px)`,`circle(${n.radius}px at ${n.x}px ${n.y}px)`]},{duration:r.duration,easing:r.easing,fill:"both",pseudoElement:a})]}return[i.animate({opacity:[1,0]},{duration:250,easing:"ease",fill:"both",pseudoElement:s}),i.animate({opacity:[0,1]},{duration:250,easing:"ease",fill:"both",pseudoElement:a})]}(e.kind,e.changes)}catch{}await a.finished.catch(()=>{})}finally{for(const e of i)e.cancel();delete t.dataset.pvVt,br(""),fr=!1}}()},0))})}(n,this._host,async()=>{this._paint(e),this._host.requestUpdate(),await this._settled()},i??void 0).finally(()=>{this._changing=!1,this._host.requestUpdate()})}_paint(e){this.mode=e,this._shown=e,function(e,t){const i=JSON.stringify(t),s=Kt.get(e);if(s?.key!==i){for(const i of s?.names??[])i in t||e.style.removeProperty(i);for(const[i,s]of Object.entries(t))e.style.setProperty(i,s);Kt.set(e,{key:i,names:Object.keys(t)})}}(this._host,{...Wt(this.look,e),"--pv-motion":this.motion}),this._host.setAttribute("appearance",e),this._host.setAttribute("motion",this.motion)}_schedule(e){clearTimeout(this._timer);const t=Date.now();this._timer=setTimeout(()=>this._host.requestUpdate(),function(e,t,i){const s=[e+6e4,t?t.getTime()+1e3:Number.NaN,i+50];return Math.min(...s.filter(t=>t>e))}(t,e,this._quietUntil)-t)}}var Fr="1.2.0";function Er(e,t,i){return`${e} ${1===e?t:i}`}const Cr=[{id:"people",label:"People",group:"people",order:100,tag:"pv-settings-people",applies:({household:e})=>null!==e,summary:({household:e})=>{const t=e?.members.length??0;return 0===t?"No one yet":Er(t,"person","people")}},{id:"appearance",label:"Appearance",group:"appearance",order:400,tag:"pv-settings-appearance",summary:({data:e})=>{return t=rr(e.display),`${Gn[t.appearance]} · ${Jn[t.theme_pair]}`;var t}},{id:"pins",label:"PINs and parent mode",group:"security",order:500,tag:"pv-settings-pins",applies:({household:e})=>null!==e,summary:({household:e})=>{const t=e?.members.filter(e=>e.has_pin).length??0,i=e?.account.shared?"Shared screen":"Not a shared screen";return t>0?`${i} · ${Er(t,"PIN","PINs")}`:i}},{id:"about",label:"About PlanaVista",group:"about",order:900,tag:"pv-settings-about",summary:()=>`Version ${Fr}`}],Sr=[{id:"welcome",label:"Welcome",order:0,tag:"pv-setup-welcome",heading:"Welcome to PlanaVista",lead:"About 5 minutes. Everything can change later in Settings.",primary:"Set up"},{id:"people",label:"Who lives here?",order:100,tag:"pv-setup-people",heading:"Who lives here?",lead:"Choose everyone in your home and what they are. People without Home Assistant can be added too."},{id:"look",label:"Look",order:900,tag:"pv-setup-look",heading:"Pick a look",lead:"You can change it any time in Settings."},{id:"done",label:"Done",order:1e3,tag:"pv-setup-done",heading:"You're all set",primary:"Open the calendar"}];class Dr{constructor(e){this._host=e,this.view=null,this.ready=!1,this._subscription=new $i(e=>{this.view=e,this.ready=!0,this._host.requestUpdate()}),e.addController(this)}hostConnected(){this._follow()}hostUpdate(){this._follow()}hostDisconnected(){this._subscription.stop(),this.view=null,this.ready=!1}_follow(){this._subscription.update(this._host.hass?.connection)}}class Ar{constructor(e,t){this._host=e,this._entity=t,this.forecast=[],this._subscription=new ii(e=>{this.forecast=e,this._host.requestUpdate()}),e.addController(this)}hostConnected(){this._follow()}hostUpdate(){this._follow()}hostDisconnected(){this._subscription.stop(),this.forecast=[]}_follow(){const e=this._entity(),t=this._host.hass;this._subscription.update(t?.connection,e,t?.states?.[e]?.attributes?.forecast)}}class zr{constructor(){this.layout=null,this._box=null,this._beforeKeyboard=null,this._textFocused=!1}focus(e){this._textFocused=e,e&&!this._beforeKeyboard&&(this._beforeKeyboard=this._box)}blur(){this._textFocused=!1}measure(e){const t=this._beforeKeyboard;return this.layout=function(e,t,i,s){if(t&&i&&s&&e.width===i.width&&e.height<i.height)return t;if(e.width<600)return"phone";const a=e.height>0?e.width/e.height:Number.POSITIVE_INFINITY;return a>=.95&&a<=1.05?"portrait"===t||"landscape"===t?t:"landscape":a>1?"landscape":"portrait"}(e,this.layout,t,this._textFocused),t&&(e.width!==t.width||!this._textFocused&&e.height>=t.height)&&(this._beforeKeyboard=null),this._box=e,this.layout}}const Mr=new Set(["INPUT","TEXTAREA","SELECT"]);class Tr{constructor(e){this._host=e,this.layout="landscape",this._tracker=new zr,this._onFocusIn=e=>{const t=e.composedPath()[0];this._tracker.focus(!!t&&Mr.has(t.tagName))},this._onFocusOut=()=>{this._tracker.blur()},e.addController(this)}hostConnected(){this._host.addEventListener("focusin",this._onFocusIn),this._host.addEventListener("focusout",this._onFocusOut),this._observer=new ResizeObserver(e=>{const t=e[e.length-1]?.contentRect;t&&this._measure({width:t.width,height:t.height})}),this._observer.observe(this._host);const e=this._host.getBoundingClientRect();this._measure({width:e.width,height:e.height})}hostDisconnected(){this._observer?.disconnect(),this._observer=void 0,this._host.removeEventListener("focusin",this._onFocusIn),this._host.removeEventListener("focusout",this._onFocusOut)}_measure(e){if(0===e.width&&0===e.height)return;const t=this._tracker.measure(e);t===this.layout&&this._host.getAttribute("layout")===t||(this.layout=t,this._host.setAttribute("layout",t),this._host.requestUpdate())}}class Br{constructor(e){this._onDrop=e,this._handle=()=>{this._onDrop()}}follow(e){e!==this._connection&&(this.stop(),this._connection=e,e?.addEventListener("disconnected",this._handle),e?.addEventListener("ready",this._handle))}stop(){this._connection?.removeEventListener("disconnected",this._handle),this._connection?.removeEventListener("ready",this._handle),this._connection=void 0}}const Pr=12e4;class Or{constructor(e,t){this._host=e,this._api=t,this.session=null,this._connection=new Br(()=>this._forget()),this._check=()=>{var e,t;this.session&&(e=this.session,t=Date.now(),0===function(e,t){return Math.max(0,e.lastTouch+Pr-t)}(e,t))&&this.lock()},this._onActivity=()=>{if(!this.session)return;const{session:e,touch:t}=function(e,t){return t-e.lastTouch<3e4?{session:e,touch:!1}:{session:{...e,lastTouch:t},touch:!0}}(this.session,Date.now());if(!t)return;this.session=e;const i=e.token;this._api().touch(i).catch(()=>{this.session?.token===i&&this._forget()}),this._host.requestUpdate()},this._onVisibility=()=>{"hidden"===document.visibilityState&&this.lock()},e.addController(this)}get token(){return this.session?.token??null}get endsAt(){return this.session?this.session.lastTouch+Pr:null}hostConnected(){this._host.addEventListener("pointerdown",this._onActivity,!0),this._host.addEventListener("keydown",this._onActivity,!0),document.addEventListener("visibilitychange",this._onVisibility),this._followConnection()}hostUpdate(){this._followConnection()}hostDisconnected(){this._host.removeEventListener("pointerdown",this._onActivity,!0),this._host.removeEventListener("keydown",this._onActivity,!0),document.removeEventListener("visibilitychange",this._onVisibility),this._connection.stop(),this.lock()}ended(e){this.session?.token===e&&this._forget()}_followConnection(){this._connection.follow(this._host.hass?.connection)}unlocked(e){e.ok&&e.session&&e.member_id&&(this._forget(),this.session=function(e,t){return{token:e.session,memberId:e.member_id,parent:e.parent,lastTouch:t}}({session:e.session,member_id:e.member_id,parent:!!e.parent},Date.now()),this._timer=window.setInterval(this._check,1e3),this._host.requestUpdate())}lock(){const e=this.token;this._forget(),e&&this._api().lock(e).catch(()=>{})}_forget(){window.clearInterval(this._timer),this._timer=void 0,this.session&&(this.session=null,this._host.requestUpdate())}}class Rr extends le{constructor(){super(...arguments),this._config={}}setConfig(e){this._config=e}render(){return U`
      <div class="editor-wrap">
        <div class="editor-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="48" height="48" fill="currentColor">
            <path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V9h14v11zM9 14H7v-2h2v2zm4 0h-2v-2h2v2zm4 0h-2v-2h2v2zm-8 4H7v-2h2v2zm4 0h-2v-2h2v2zm4 0h-2v-2h2v2z"/>
          </svg>
        </div>
        <p class="editor-title">PlanaVista</p>
        <p class="editor-body">
          Click <strong>Save</strong> to add the card to your dashboard.
          The first time you open the card, a setup wizard will walk you
          through choosing your calendars, colors, and theme.
        </p>
      </div>
    `}}Rr.styles=r`
    :host {
      display: block;
    }

    .editor-wrap {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 32px 24px;
      text-align: center;
    }

    .editor-icon {
      color: #6366F1;
      margin-bottom: 16px;
      opacity: 0.9;
    }

    .editor-title {
      font-size: 1.125rem;
      font-weight: 700;
      margin: 0 0 12px;
      color: var(--primary-text-color);
    }

    .editor-body {
      font-size: 0.9375rem;
      line-height: 1.6;
      color: var(--secondary-text-color);
      max-width: 320px;
      margin: 0;
    }
  `,e([ue({attribute:!1})],Rr.prototype,"hass",void 0),ge("planavista-calendar-card-editor",Rr);class Ir extends le{constructor(){super(...arguments),this.layout="landscape",this.timeFormat="12h",this.weather=null,this.weatherEntity="",this.today=null,this.chips=[],this._minute=Math.floor(Date.now()/6e4),this._timer=null}connectedCallback(){super.connectedCallback(),this._minute=Math.floor(Date.now()/6e4),this._timer=setInterval(()=>{const e=Math.floor(Date.now()/6e4);e!==this._minute&&(this._minute=e)},1e3)}disconnectedCallback(){super.disconnectedCallback(),this._timer&&clearInterval(this._timer),this._timer=null}render(){const e=new Date,{time:t,ampm:i,date:s}=function(e,t){const i=String(e.getMinutes()).padStart(2,"0"),s=e.toLocaleDateString("en-US",{weekday:"long",month:"long",day:"numeric"});return"24h"===t?{time:`${e.getHours()}:${i}`,ampm:"",date:s}:{time:`${e.getHours()%12||12}:${i}`,ampm:e.getHours()>=12?"PM":"AM",date:s}}(e,this.timeFormat),a=U`<span class="time">${t}${i?U`<span class="ampm muted">${i}</span>`:Y}</span>`,n=this.chips.filter(e=>e.primary);if("portrait"===this.layout)return U`
        <div class="row">
          <div class="clock">${a}<div class="date">${s}</div></div>
          ${this._weather(40,"highlow")}
        </div>
        ${this._chips(this.chips)}
      `;if("phone"===this.layout){const t=e.toLocaleDateString("en-US",{weekday:"short",month:"short",day:"numeric"});return U`
        <div class="row">
          <div class="clock">${a}<span class="date muted">${t}</span></div>
          ${this._weather(24,"none")}
        </div>
        ${this._chips(n)}
      `}return U`
      <div class="row">
        <div class="left">${this._weather(32,"condition")}${this._chips(n)}</div>
        <div class="date">${s}</div>
        ${a}
      </div>
    `}_chips(e){return 0===e.length?Y:U`
      <div class="chips">
        ${e.map(e=>U`
          <button type="button" class="chip" @click=${()=>this._openChip(e)}>
            <span class="pill ${void 0===e.progress?"plain":""}">
              ${void 0!==e.progress?U`
                <pv-ring size="18" .progress=${e.progress} color="var(--pv-accent, #5B5BD6)" ?closed=${e.progress>=1}></pv-ring>
              `:Y}
              ${e.text}
            </span>
          </button>
        `)}
      </div>
    `}_openChip(e){e.open&&this.dispatchEvent(new CustomEvent("pv-open",{detail:e.open,bubbles:!0,composed:!0}))}_weather(e,t){const i=this.weather;if(!i)return U`<span></span>`;const s=Math.round(Number(i.attributes?.temperature??0)),a=this.today;return U`
      <button class="weather" type="button" aria-label="Weather details" @click=${this._details}>
        ${Qt(i.state||"cloudy",e)}
        <span class="weather-text">
          <span class="temp">${s}°</span>
          ${"condition"===t?U`<span class="condition muted">${(i.state||"").replace(/-/g," ")}</span>`:Y}
          ${"highlow"===t&&a?U`<span class="highlow muted">High ${a.high}°${null!==a.low?` · Low ${a.low}°`:""}</span>`:Y}
        </span>
      </button>
    `}_details(){this.weatherEntity&&this.dispatchEvent(new CustomEvent("hass-more-info",{detail:{entityId:this.weatherEntity},bubbles:!0,composed:!0}))}}Ir.styles=r`
    :host {
      display: block;
      background: var(--pv-header-gradient, var(--pv-card-bg, #FFFFFF));
      color: var(--pv-header-text, var(--pv-text, #1A1B1E));
      border-bottom: 1px solid color-mix(in srgb, var(--pv-header-text, #1A1B1E) 10%, transparent);
      font-family: var(--pv-font-family, system-ui, sans-serif);
    }

    .time,
    .date,
    .temp {
      font-family: var(--pv-font-heading, ui-rounded, 'SF Pro Rounded', 'PlanaVista Rounded', system-ui, sans-serif);
      font-variant-numeric: tabular-nums;
      white-space: nowrap;
    }

    .muted {
      color: var(--pv-header-muted, currentColor);
    }

    /* Landscape: weather, date, and time in one row. */
    .row {
      display: grid;
      grid-template-columns: 1fr auto 1fr;
      align-items: center;
      gap: 12px;
      padding: 12px 20px;
    }

    .date {
      font-weight: 800;
      font-size: clamp(18px, 1.6cqi, 26px);
      letter-spacing: 0.2px;
    }

    .time {
      justify-self: end;
      font-weight: 600;
      font-size: clamp(24px, 2.2cqi, 40px);
      line-height: 1.1;
    }

    .ampm {
      font-size: 0.55em;
      font-weight: 700;
      margin-left: 3px;
    }

    .weather {
      justify-self: start;
      display: inline-flex;
      align-items: center;
      gap: 10px;
      min-height: 48px;
      padding: 0 8px;
      margin-left: -8px;
      border: none;
      border-radius: var(--pv-radius-sm, 8px);
      background: transparent;
      color: inherit;
      font: inherit;
      text-align: left;
      cursor: pointer;
      -webkit-tap-highlight-color: transparent;
    }

    .weather:focus-visible {
      outline: 2px solid var(--pv-accent-ink, var(--pv-accent, #5B5BD6));
      outline-offset: 2px;
    }

    .weather-text {
      display: flex;
      flex-direction: column;
    }

    .temp {
      font-weight: 700;
      font-size: clamp(18px, 1.6cqi, 26px);
      line-height: 1.1;
    }

    .condition {
      font-size: 13px;
      text-transform: capitalize;
    }

    .highlow {
      font-size: 12px;
      margin-top: 3px;
      white-space: nowrap;
    }

    /* Portrait: a lock-screen clock at the left, the weather at the right. */
    :host([layout='portrait']) .row {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      padding: 16px 20px 12px;
    }

    :host([layout='portrait']) .time {
      font-weight: 700;
      font-size: clamp(40px, 6cqi, 60px);
      line-height: 1;
      letter-spacing: -0.5px;
    }

    :host([layout='portrait']) .ampm {
      font-size: 0.4em;
      letter-spacing: 0;
    }

    :host([layout='portrait']) .date {
      font-size: clamp(16px, 2.2cqi, 22px);
      margin-top: 6px;
    }

    :host([layout='portrait']) .temp {
      font-weight: 800;
      font-size: clamp(24px, 3.5cqi, 34px);
      line-height: 1;
    }

    .chips {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }

    .left {
      justify-self: start;
      display: flex;
      align-items: center;
      gap: 12px;
      min-width: 0;
    }

    :host([layout='portrait']) .chips {
      padding: 0 20px 14px;
    }

    :host([layout='phone']) .chips {
      padding: 0 14px 8px;
    }

    .chip {
      display: inline-flex;
      align-items: center;
      min-height: 48px;
      padding: 0;
      border: none;
      background: transparent;
      color: inherit;
      font: inherit;
      cursor: pointer;
      -webkit-tap-highlight-color: transparent;
    }

    .chip span.pill {
      display: inline-flex;
      align-items: center;
      gap: 7px;
      height: 32px;
      padding: 0 12px 0 8px;
      border-radius: 99px;
      background: color-mix(in srgb, var(--pv-header-text, #1A1B1E) 7%, transparent);
      font-size: 0.8125rem;
      font-weight: 700;
      white-space: nowrap;
    }

    .chip span.pill.plain {
      padding-left: 12px;
    }

    .chip:focus-visible {
      outline: none;
    }

    .chip:focus-visible span.pill {
      outline: 2px solid var(--pv-accent-ink, var(--pv-accent, #5B5BD6));
      outline-offset: 2px;
    }

    /* Phone: one compact row. */
    :host([layout='phone']) .row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 14px;
    }

    :host([layout='phone']) .clock {
      display: flex;
      align-items: baseline;
      gap: 8px;
    }

    :host([layout='phone']) .time {
      font-weight: 700;
      font-size: 22px;
    }

    :host([layout='phone']) .date {
      font-weight: 700;
      font-size: 14px;
    }

    :host([layout='phone']) .temp {
      font-size: 18px;
    }
  `,e([ue({type:String,reflect:!0})],Ir.prototype,"layout",void 0),e([ue({attribute:!1})],Ir.prototype,"timeFormat",void 0),e([ue({attribute:!1})],Ir.prototype,"weather",void 0),e([ue({attribute:!1})],Ir.prototype,"weatherEntity",void 0),e([ue({attribute:!1})],Ir.prototype,"today",void 0),e([ue({attribute:!1})],Ir.prototype,"chips",void 0),e([me()],Ir.prototype,"_minute",void 0),ge("pv-glance-header",Ir);class Lr extends le{constructor(){super(...arguments),this.layout="landscape",this.modules=[],this.activeModule="",this.views=[],this.activeView="",this.canOpenSettings=!1,this.actions=[]}render(){return U`
      <nav aria-label="PlanaVista">
        ${this.modules.length>1?U`
          <div class="seg" role="group" aria-label="Modules">
            <div class="seg-inner">
              ${this.modules.map(e=>U`
                <button type="button" class="seg-btn ${e.id===this.activeModule?"on":""}"
                  aria-pressed=${e.id===this.activeModule?"true":"false"}
                  @click=${()=>this._fire("pv-module-select",{id:e.id})}>
                  <span>${e.label}</span>
                </button>
              `)}
            </div>
          </div>
        `:Y}
        <div class="views" role="group" aria-label="Views">
          ${this.views.map(e=>U`
            <button type="button" class="view ${e.id===this.activeView?"on":""}"
              aria-pressed=${e.id===this.activeView?"true":"false"}
              @click=${()=>this._fire("pv-view-select",{id:e.id})}>
              <span>${e.label}</span>
            </button>
          `)}
        </div>
        ${this.actions.length?U`
          <div class="actions">
            ${this.actions.map(e=>{const t="phone"===this.layout&&void 0!==e.short?e.short:e.label;return U`
                <button type="button" class="action ${"act"===e.tone?"act":""}" aria-label=${e.label}
                  @click=${()=>this._fire("pv-module-action",{id:e.id})}>
                  <span>${e.glyph?U`<span class="glyph" aria-hidden="true">${e.glyph}</span>`:Y}${t}</span>
                </button>
              `})}
          </div>
        `:Y}
        ${this.canOpenSettings?U`
          <button type="button" class="gear" aria-label="Settings" title="Settings"
            @click=${this._openSettings}>
            <span><ha-icon icon="mdi:cog"></ha-icon></span>
          </button>
        `:Y}
      </nav>
    `}_openSettings(e){e.currentTarget.dispatchEvent(new CustomEvent("pv-open-settings",{bubbles:!0,composed:!0}))}_fire(e,t){this.dispatchEvent(new CustomEvent(e,{detail:t,bubbles:!0,composed:!0}))}}Lr.styles=r`
    :host {
      display: block;
      background: var(--pv-card-bg, #FFFFFF);
      font-family: var(--pv-font-family, system-ui, sans-serif);
      border-bottom: 1px solid var(--pv-border, #E7E7E3);
    }

    :host(:not([layout='landscape'])) {
      border-bottom: none;
      border-top: 1px solid var(--pv-border, #E7E7E3);
    }

    nav {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 0 20px;
    }

    :host(:not([layout='landscape'])) nav {
      padding: 0 12px env(safe-area-inset-bottom, 0px);
    }

    button {
      font: inherit;
      color: inherit;
      border: none;
      background: transparent;
      padding: 0;
      cursor: pointer;
      -webkit-tap-highlight-color: transparent;
    }

    button:focus-visible {
      outline: 2px solid var(--pv-accent-ink, var(--pv-accent, #5B5BD6));
      outline-offset: -2px;
      border-radius: 10px;
    }

    /* Every control is at least 48 px to the touch; the pill inside is drawn smaller. */
    .seg,
    .views {
      display: flex;
      align-items: center;
      min-height: 56px;
    }

    .seg-inner {
      display: flex;
      background: var(--pv-seg, #ECECE8);
      border-radius: 10px;
      padding: 3px;
    }

    .seg-btn {
      min-height: 48px;
    }

    .seg-btn span {
      display: inline-flex;
      align-items: center;
      height: 34px;
      padding: 0 14px;
      border-radius: 8px;
      font-size: 0.875rem;
      font-weight: 650;
      color: var(--pv-text-secondary, #5F6670);
    }

    .seg-btn.on span {
      background: var(--pv-seg-on, #FFFFFF);
      color: var(--pv-text, #1A1B1E);
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.12);
    }

    .views {
      gap: 2px;
      margin-left: auto;
    }

    :host(:not([layout='landscape'])) .views {
      margin-left: 0;
      flex: 1 1 auto;
      min-width: 0;
      overflow-x: auto;
      scrollbar-width: none;
    }

    :host(:not([layout='landscape'])) .views::-webkit-scrollbar {
      display: none;
    }

    .view {
      min-height: 48px;
      flex-shrink: 0;
    }

    .view span {
      display: inline-flex;
      align-items: center;
      height: 36px;
      padding: 0 14px;
      border-radius: 9px;
      font-size: 0.9375rem;
      font-weight: 650;
      color: var(--pv-text-secondary, #5F6670);
    }

    .view.on span {
      background: var(--pv-accent, #5B5BD6);
      color: var(--pv-accent-text, #FFFFFF);
    }

    .view:not(.on):hover span {
      color: var(--pv-text, #1A1B1E);
    }

    .actions {
      display: flex;
      align-items: center;
      gap: 6px;
      flex-shrink: 0;
    }

    .action {
      min-height: 48px;
      flex-shrink: 0;
    }

    .action > span {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      height: 36px;
      padding: 0 12px;
      border-radius: 9px;
      border: 1px solid var(--pv-border, #E7E7E3);
      font-size: 0.875rem;
      font-weight: 650;
      color: var(--pv-text, #1A1B1E);
      white-space: nowrap;
    }

    .action.act > span {
      border-color: transparent;
      background: var(--pv-accent-tint, #EEEEFC);
      color: var(--pv-accent-tint-ink, #3B3BB0);
    }

    .glyph {
      font-size: 1rem;
      line-height: 1;
    }

    .gear {
      width: 48px;
      height: 48px;
      flex-shrink: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-left: auto;
    }

    :host([layout='landscape']) .gear {
      margin-left: 0;
    }

    .gear span {
      width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 1px solid var(--pv-border, #E7E7E3);
      border-radius: 10px;
      color: var(--pv-text-secondary, #5F6670);
      --mdc-icon-size: 22px;
    }
  `,e([ue({type:String,reflect:!0})],Lr.prototype,"layout",void 0),e([ue({attribute:!1})],Lr.prototype,"modules",void 0),e([ue({attribute:!1})],Lr.prototype,"activeModule",void 0),e([ue({attribute:!1})],Lr.prototype,"views",void 0),e([ue({attribute:!1})],Lr.prototype,"activeView",void 0),e([ue({type:Boolean})],Lr.prototype,"canOpenSettings",void 0),e([ue({attribute:!1})],Lr.prototype,"actions",void 0),ge("pv-nav-bar",Lr);class Nr extends le{constructor(){super(...arguments),this.endsAt=0,this.color="currentColor",this.size=28,this._now=Date.now()}connectedCallback(){super.connectedCallback(),this._timer=window.setInterval(()=>{this._now=Date.now()},1e3)}disconnectedCallback(){super.disconnectedCallback(),window.clearInterval(this._timer)}render(){const e=Math.max(0,this.endsAt-this._now),t=Math.min(1,e/Pr),i=this.size/2,s=(this.size-3)/2,a=2*Math.PI*s,n=10*Math.ceil(Math.ceil(e/1e3)/10),r=`Parent mode ends in ${Math.floor(n/60)} min ${n%60} s`;return U`
      <svg width=${this.size} height=${this.size} viewBox="0 0 ${this.size} ${this.size}" role="img" aria-label=${r}>
        ${V`
          <circle class="track" cx=${i} cy=${i} r=${s} fill="none"
            stroke=${this.color} stroke-width=${3}></circle>
          <circle cx=${i} cy=${i} r=${s} fill="none" stroke=${this.color}
            stroke-width=${3} stroke-linecap="round"
            stroke-dasharray=${a} stroke-dashoffset=${a*(1-t)}></circle>
        `}
      </svg>
    `}}Nr.styles=r`
    :host {
      display: inline-flex;
    }

    svg {
      display: block;
      transform: rotate(-90deg);
    }

    .track {
      opacity: 0.25;
    }
  `,e([ue({type:Number})],Nr.prototype,"endsAt",void 0),e([ue({type:String})],Nr.prototype,"color",void 0),e([ue({type:Number})],Nr.prototype,"size",void 0),e([me()],Nr.prototype,"_now",void 0),ge("pv-session-ring",Nr);class Hr extends le{constructor(){super(...arguments),this.endsAt=0,this.actions=[]}render(){const e=this.member;return e?U`
      <div class="strip" style="--strip-color: ${e.color}">
        <pv-member-avatar .member=${e} .hass=${this.hass} size="28"></pv-member-avatar>
        <span class="who">${e.name} <span class="mode">· parent mode</span></span>
        <pv-session-ring .endsAt=${this.endsAt} color=${e.color}></pv-session-ring>
        ${this.actions.map(e=>U`
          <button class="pv-btn pv-btn-primary action" type="button" @click=${()=>this._action(e.id)}>
            ${e.glyph?`${e.glyph} `:""}${e.label}
          </button>
        `)}
        <button class="pv-btn pv-btn-ghost lock" type="button" @click=${this._lock}>Lock</button>
      </div>
    `:Y}_action(e){this.dispatchEvent(new CustomEvent("pv-strip-action",{detail:{id:e},bubbles:!0,composed:!0}))}_lock(){this.dispatchEvent(new CustomEvent("pv-lock",{bubbles:!0,composed:!0}))}}Hr.styles=[ot,r`
      :host {
        display: block;
        flex-shrink: 0;
      }

      .strip {
        display: flex;
        align-items: center;
        gap: 10px;
        min-height: 48px;
        padding: 0 6px 0 14px;
        border-bottom: 3px solid var(--strip-color);
        background: color-mix(in srgb, var(--strip-color) 16%, var(--pv-card-bg, #FFFFFF));
        color: var(--pv-text, #1A1B1E);
      }

      .who {
        flex: 1;
        min-width: 0;
        font-weight: 600;
        font-size: 0.9375rem;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .mode {
        font-weight: 400;
        color: var(--pv-text-secondary, #6B7280);
      }

      .lock,
      .action {
        min-width: 48px;
        min-height: 48px;
      }

      .action {
        font-weight: 650;
      }
    `],e([ue({attribute:!1})],Hr.prototype,"member",void 0),e([ue({attribute:!1})],Hr.prototype,"hass",void 0),e([ue({type:Number})],Hr.prototype,"endsAt",void 0),e([ue({attribute:!1})],Hr.prototype,"actions",void 0),ge("pv-parent-strip",Hr);const jr=["1","2","3","4","5","6","7","8","9","0"];function qr(e,t=Math.random){const i=[...jr];if(!e)return i;for(let e=i.length-1;e>0;e--){const s=Math.floor(t()*(e+1));[i[e],i[s]]=[i[s],i[e]]}return i}function Ur(e){return{digits:"",length:e??6}}function Vr(e){return e.digits.length===e.length}function Wr(e){return e.digits.length>=4}class Yr extends le{constructor(){super(...arguments),this.layout="landscape",this.mode="unlock",this.members=[],this.heading="",this.shuffle=!1,this._step="pick",this._entry=Ur(null),this._first="",this._message="",this._pausedUntil=0,this._now=Date.now(),this._busy=!1,this._shake=!1,this._digits=qr(!1),this._started=!1,this._sheetMotion=new Ba(this),this._detachDrag=null,this._closing=!1,this._cancel=()=>{this._leave("pv-sheet-close",{})},this._onKey=e=>{"Escape"===e.key?(e.preventDefault(),this._cancel()):/^[0-9]$/.test(e.key)&&"pick"!==this._step?(e.preventDefault(),this._press(e.key)):"Backspace"===e.key&&"pick"!==this._step?(e.preventDefault(),this._delete()):"Enter"===e.key&&"choose"===this._step?(e.preventDefault(),this._next()):Ma(this.shadowRoot,e)}}connectedCallback(){super.connectedCallback(),this.addEventListener("keydown",this._onKey),this.toggleAttribute("reduced","reduced"===Ea(this))}disconnectedCallback(){super.disconnectedCallback(),this.removeEventListener("keydown",this._onKey),window.clearInterval(this._ticker),this._detachDrag?.(),this._detachDrag=null}willUpdate(e){this._started||(this._started=!0,this._digits=qr(this.shuffle),"choose"===this.mode?(this._step="choose",this._entry=Ur(null)):1===this.members.length&&this._enterFor(this.members[0]))}firstUpdated(){this.renderRoot.querySelector(".person, .key")?.focus();const{panel:e,backdrop:t,zone:i}=this._parts();this._sheetMotion.open(e,t),this._detachDrag=this._sheetMotion.attachDrag(i,e,this._cancel)}_parts(){const e=this.renderRoot;return{panel:e.querySelector(".panel"),backdrop:e.querySelector(".backdrop"),zone:e.querySelector(".grab-zone")}}async _leave(e,t){if(this._closing)return;this._closing=!0;const{panel:i,backdrop:s}=this._parts();await this._sheetMotion.close(i,s),this._fire(e,t),requestAnimationFrame(()=>{if(this.isConnected){for(const e of[i,s])e.getAnimations().forEach(e=>e.cancel());i.style.transform="",this._closing=!1}})}render(){return U`
      <div class="backdrop" @click=${this._cancel}></div>
      <div class="panel" role="dialog" aria-modal="true" aria-labelledby="pin-heading">
        <div class="grab-zone" aria-hidden="true"><div class="grab"></div></div>
        ${"pick"===this._step?this._renderPicker():this._renderPad()}
      </div>
    `}_renderPicker(){return U`
      <h2 class="heading" id="pin-heading">${this.heading}</h2>
      <div class="people">
        ${this.members.map(e=>U`
          <button class="person" type="button" @click=${()=>this._enterFor(e)}>
            <pv-member-avatar .member=${e} .hass=${this.hass} size="64"></pv-member-avatar>
            <span>${e.name}</span>
          </button>
        `)}
      </div>
      <div class="actions">
        <button class="pv-btn pv-btn-secondary" type="button" @click=${this._cancel}>Cancel</button>
      </div>
    `}_renderPad(){const e=this._paused(),t="enter"===this._step?`${this._who?.name??""}, enter your PIN`:"choose"===this._step?`Choose a PIN for ${this.target?.name??""}`:"Enter it again",i=e?`Too many tries. Try again in ${function(e){const t=Math.max(0,Math.ceil(e/1e3));return`${Math.floor(t/60)}:${String(t%60).padStart(2,"0")}`}(this._pausedUntil-this._now)}.`:this._message;return U`
      ${"enter"===this._step&&this.members.length>1?U`<button class="back" type="button" @click=${this._backToPicker}>‹ Someone else</button>`:Y}
      <h2 class="heading" id="pin-heading">${t}</h2>
      ${"choose"===this._step?U`<p class="hint">4 to 6 digits.</p>`:Y}
      <div class="boxes ${this._shake?"shake":""}" aria-hidden="true">
        ${Array.from({length:this._entry.length},(e,t)=>U`
          <span class="box ${t<this._entry.digits.length?"filled":""}"></span>
        `)}
      </div>
      <p class="sr" aria-live="polite">${this._entry.digits.length} of ${this._entry.length} digits entered</p>
      <p class="message" role="alert">${i}</p>
      <div class="keypad">
        ${this._digits.slice(0,9).map(t=>this._renderKey(t,e))}
        <button class="key text" type="button" @click=${this._cancel}>Cancel</button>
        ${this._renderKey(this._digits[9],e)}
        <button class="key text" type="button" aria-label="Delete last digit" ?disabled=${e} @click=${this._delete}>⌫</button>
      </div>
      ${"choose"===this._step?U`
          <button class="pv-btn pv-btn-primary next" type="button"
            ?disabled=${!Wr(this._entry)||this._busy}
            @click=${this._next}>Next</button>
        `:Y}
    `}_renderKey(e,t){return U`
      <button class="key" type="button" ?disabled=${t||this._busy} @click=${()=>this._press(e)}>${e}</button>
    `}_enterFor(e){this._who=e,this._step="enter",this._message="",this._entry=Ur(e.pin_length);const t=e.locked_until?Date.parse(e.locked_until):0;t>Date.now()&&this._pause(t)}_backToPicker(){this._step="pick",this._who=void 0,this._message=""}_paused(){return this._pausedUntil>this._now}_pause(e){this._pausedUntil=e,this._now=Date.now(),window.clearInterval(this._ticker),this._ticker=window.setInterval(()=>{this._now=Date.now(),this._paused()||window.clearInterval(this._ticker)},1e3)}_press(e){this._busy||this._paused()||(this._message="",this._entry=function(e,t){return!/^[0-9]$/.test(t)||e.digits.length>=e.length?e:{...e,digits:e.digits+t}}(this._entry,e),"enter"===this._step&&Vr(this._entry)?this._check():("choose"===this._step&&6===this._entry.digits.length||"confirm"===this._step&&Vr(this._entry))&&this._next())}_delete(){var e;this._entry=(e=this._entry,{...e,digits:e.digits.slice(0,-1)})}_next(){if("choose"===this._step){if(!Wr(this._entry))return;return this._first=this._entry.digits,this._entry=Ur(this._first.length),void(this._step="confirm")}"confirm"===this._step&&Vr(this._entry)&&(this._entry.digits===this._first?this._save(this._first):this._restartChoosing("Those didn't match. Try again."))}_restartChoosing(e){this._message=e,this._first="",this._entry=Ur(null),this._step="choose",this._shakeBoxes()}async _check(){const e=this._who;if(e){this._busy=!0;try{const t=await this.api.unlock(e.id,this._entry.digits);if(t.ok)return void this._leave("pv-unlocked",{result:t});if(this._entry=Ur(e.pin_length),"paused"===t.reason)this._pause(Date.now()+1e3*(t.retry_after??30));else if("wrong_pin"===t.reason){const i=t.tries_left??0;this._message=`That's not ${e.name}'s PIN. ${1===i?"1 more try":`${i} more tries`} before a short pause.`}else this._message=`${e.name} has no PIN yet.`;this._shakeBoxes()}catch{this._entry=Ur(e.pin_length),this._message="Couldn't check the PIN. Check the connection and try again."}finally{this._busy=!1}}}async _save(e){const t=this.target;if(t){this._busy=!0;try{await this.api.setPin(t.id,e),this._leave("pv-pin-set",{memberId:t.id})}catch(e){this._restartChoosing(Si(fi(e)))}finally{this._busy=!1}}}_shakeBoxes(){this._shake=!0,window.setTimeout(()=>{this._shake=!1},320)}_fire(e,t){this.dispatchEvent(new CustomEvent(e,{detail:t,bubbles:!0,composed:!0}))}}Yr.styles=[ot,za,r`
      .people {
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
        gap: 12px;
        margin: 16px 0 8px;
      }

      .person {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 8px;
        min-width: 96px;
        min-height: 48px;
        padding: 10px;
        border: none;
        border-radius: 16px;
        background: transparent;
        color: inherit;
        font: inherit;
        font-weight: 600;
        cursor: pointer;
      }

      .person:hover,
      .person:focus-visible {
        background: color-mix(in srgb, var(--pv-text, #1A1B1E) 6%, transparent);
      }

      .back {
        display: inline-flex;
        align-items: center;
        min-height: 48px;
        padding: 0 8px;
        border: none;
        background: transparent;
        color: var(--pv-accent-ink, var(--pv-accent, #6366F1));
        font: inherit;
        cursor: pointer;
      }

      .hint {
        margin: 0;
        text-align: center;
        color: var(--pv-text-secondary, #6B7280);
      }

      .boxes {
        display: flex;
        justify-content: center;
        gap: 12px;
        margin: 18px 0 6px;
      }

      .box {
        width: 16px;
        height: 16px;
        border-radius: 50%;
        border: 2px solid var(--pv-text-secondary, #6B7280);
      }

      .box.filled {
        background: var(--pv-text, #1A1B1E);
        border-color: var(--pv-text, #1A1B1E);
      }

      .message {
        min-height: 1.5em;
        margin: 8px 0;
        text-align: center;
        color: var(--pv-danger, #DC2626);
        font-size: 0.9375rem;
      }

      .keypad {
        display: grid;
        grid-template-columns: repeat(3, 72px);
        justify-content: center;
        gap: 14px 22px;
        margin: 8px 0 4px;
      }

      .key {
        width: 72px;
        height: 72px;
        border-radius: 50%;
        border: none;
        background: color-mix(in srgb, var(--pv-text, #1A1B1E) 8%, transparent);
        color: var(--pv-text, #1A1B1E);
        font: inherit;
        font-size: 1.75rem;
        font-weight: 500;
        cursor: pointer;
        -webkit-tap-highlight-color: transparent;
        user-select: none;
      }

      .key:active {
        background: color-mix(in srgb, var(--pv-text, #1A1B1E) 18%, transparent);
      }

      .key:disabled {
        opacity: 0.4;
        cursor: default;
      }

      .key.text {
        background: transparent;
        font-size: 1rem;
      }

      .next {
        display: block;
        width: 100%;
        min-height: 48px;
        margin-top: 12px;
      }

      :host([reduced]) .boxes.shake {
        animation: pv-fade 300ms ease-in-out;
      }

      :host(:not([reduced])) .boxes.shake {
        animation: pv-shake 300ms ease-in-out;
      }

      @keyframes pv-shake {
        20%, 60% { transform: translateX(-8px); }
        40%, 80% { transform: translateX(8px); }
      }

      @keyframes pv-fade {
        50% { opacity: 0.3; }
      }
    `],e([ue({attribute:!1})],Yr.prototype,"hass",void 0),e([ue({attribute:!1})],Yr.prototype,"api",void 0),e([ue({type:String,reflect:!0})],Yr.prototype,"layout",void 0),e([ue({type:String})],Yr.prototype,"mode",void 0),e([ue({attribute:!1})],Yr.prototype,"members",void 0),e([ue({type:String})],Yr.prototype,"heading",void 0),e([ue({attribute:!1})],Yr.prototype,"target",void 0),e([ue({type:Boolean})],Yr.prototype,"shuffle",void 0),e([me()],Yr.prototype,"_step",void 0),e([me()],Yr.prototype,"_who",void 0),e([me()],Yr.prototype,"_entry",void 0),e([me()],Yr.prototype,"_first",void 0),e([me()],Yr.prototype,"_message",void 0),e([me()],Yr.prototype,"_pausedUntil",void 0),e([me()],Yr.prototype,"_now",void 0),e([me()],Yr.prototype,"_busy",void 0),e([me()],Yr.prototype,"_shake",void 0),ge("pv-pin-sheet",Yr);const Kr=Oa(class extends Ra{constructor(){super(...arguments),this.key=Y}render(e,t){return this.key=e,t}update(e,[t,i]){return t!==this.key&&(Ua(e),this.key=t),i}});function Xr(e,t,i){const s=[...e];if(t<0||t>=s.length||i<0||i>=s.length||t===i)return s;const[a]=s.splice(t,1);return s.splice(i,0,a),s}class Gr extends le{constructor(){super(...arguments),this.household=null,this.layout="landscape",this.mode="settings",this._order=null,this._dragging=null,this._dragMove=e=>{if(!this._dragging||!this._order)return;const t=[...this.renderRoot.querySelectorAll("li")].map(e=>{const t=e.getBoundingClientRect();return{top:t.top,height:t.height}}),i=function(e,t){if(0===t.length)return-1;const i=t.findIndex(t=>e<t.top+t.height/2);return i>=0?i:t.length-1}(e.clientY,t),s=this._order.indexOf(this._dragging);i>=0&&i!==s&&(this._order=Xr(this._order,s,i))},this._dragEnd=()=>{if(!this._dragging||!this._order)return;const e=this._order;this._dragging=null,this._saveOrder(e)}}_members(){const e=Pi(this.household?.members??[]);if(!this._order)return e;const t=new Map(e.map(e=>[e.id,e]));return this._order.map(e=>t.get(e)).filter(e=>!!e)}render(){const e=this._members(),t=!!this.household?.available;return U`
      <div class="head">
        <p class="lead">This is the order people appear in. Drag ≡ to change it.</p>
        ${t?U`<button class="pv-btn pv-btn-secondary add" type="button" @click=${this._add}>+ Add someone</button>`:Y}
      </div>
      ${0===e.length?U`<p class="empty">No one here yet.</p>`:Y}
      <ul>
        ${e.map((e,i)=>U`
          <li class=${this._dragging===e.id?"dragging":""}>
            ${t?U`
              <button class="handle" type="button" aria-label="Move ${e.name}"
                @pointerdown=${t=>this._dragStart(t,e.id)}
                @pointermove=${this._dragMove}
                @pointerup=${this._dragEnd}
                @pointercancel=${this._dragEnd}
                @keydown=${e=>this._keyMove(e,i)}>≡</button>
            `:Y}
            <button class="open" type="button" @click=${()=>this._open(e)}>
              <pv-member-avatar .member=${e} .hass=${this.hass} size="40"></pv-member-avatar>
              <span class="text">
                <span class="name">${e.name}</span>
                <span class="summary">${function(e,t){const i=[e.parent?"Parent":Ai[e.age_group]];e.has_pin&&i.push("PIN on");const s=Ii(e.id,t);return 0===s.length?i.push("no calendar"):1===s.length?i.push(`${e.name}'s calendar`):i.push(`${s.length} calendars`),i.join(" · ")}(e,this.data?.calendars??[])}</span>
              </span>
              <span class="chevron" aria-hidden="true">›</span>
            </button>
          </li>
        `)}
      </ul>
      ${t&&e.length>0?U`<button class="pv-btn pv-btn-secondary add" type="button" @click=${this._add}>+ Add someone</button>`:Y}
    `}_push(e){this.dispatchEvent(new CustomEvent(Fi,{detail:e,bubbles:!0,composed:!0}))}_open(e){this._push({tag:"pv-settings-person",title:e.name,back:"People",props:{memberId:e.id}})}_add(){this._push({tag:"pv-settings-person",title:"New person",back:"People",props:{memberId:null}})}_dragStart(e,t){e.currentTarget.setPointerCapture(e.pointerId),this._order=this._members().map(e=>e.id),this._dragging=t}_keyMove(e,t){if("ArrowUp"!==e.key&&"ArrowDown"!==e.key)return;e.preventDefault();const i=this._members().map(e=>e.id),s="ArrowUp"===e.key?t-1:t+1;s<0||s>=i.length||(this._order=Xr(i,t,s),this._saveOrder(this._order).then(()=>{this.renderRoot.querySelectorAll(".handle")[s]?.focus()}))}async _saveOrder(e){const t=Pi(this.household?.members??[]).map(e=>e.id);if(e.join()!==t.join())try{await this.api.reorder(e)}catch(e){this.dispatchEvent(new CustomEvent(Ci,{detail:{message:Si(fi(e))},bubbles:!0,composed:!0}))}this._order=null}}Gr.styles=[nt,ot,r`
      :host {
        display: block;
        max-width: 640px;
      }

      .head {
        display: flex;
        align-items: flex-start;
        gap: 12px;
        margin-bottom: 12px;
      }

      .lead {
        flex: 1;
        margin: 0;
        color: var(--pv-text-secondary, #6B7280);
        line-height: 1.5;
      }

      .add {
        min-height: 48px;
        white-space: nowrap;
      }

      ul {
        list-style: none;
        margin: 0 0 16px;
        padding: 0;
      }

      li {
        display: flex;
        align-items: center;
        gap: 4px;
        border-bottom: 1px solid var(--pv-border-subtle, #E5E7EB);
        background: var(--pv-card-bg, #FFFFFF);
      }

      li.dragging {
        box-shadow: 0 6px 18px rgba(0, 0, 0, 0.16);
        position: relative;
        z-index: 1;
      }

      .handle {
        width: 48px;
        height: 56px;
        border: none;
        background: transparent;
        color: var(--pv-text-secondary, #6B7280);
        font-size: 1.25rem;
        cursor: grab;
        touch-action: none;
      }

      .open {
        flex: 1;
        min-width: 0;
        display: flex;
        align-items: center;
        gap: 12px;
        min-height: 64px;
        padding: 8px 8px 8px 0;
        border: none;
        background: transparent;
        color: inherit;
        font: inherit;
        text-align: left;
        cursor: pointer;
      }

      .text {
        flex: 1;
        min-width: 0;
        display: flex;
        flex-direction: column;
        gap: 2px;
      }

      .name {
        font-weight: 600;
      }

      .summary {
        font-size: 0.875rem;
        color: var(--pv-text-secondary, #6B7280);
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .chevron {
        color: var(--pv-text-secondary, #6B7280);
        font-size: 1.25rem;
      }

      .empty {
        margin: 24px 0;
        color: var(--pv-text-secondary, #6B7280);
      }
    `],e([ue({attribute:!1})],Gr.prototype,"hass",void 0),e([ue({attribute:!1})],Gr.prototype,"data",void 0),e([ue({attribute:!1})],Gr.prototype,"household",void 0),e([ue({attribute:!1})],Gr.prototype,"api",void 0),e([ue({type:String})],Gr.prototype,"layout",void 0),e([ue({type:String})],Gr.prototype,"mode",void 0),e([me()],Gr.prototype,"_order",void 0),e([me()],Gr.prototype,"_dragging",void 0),ge("pv-settings-people",Gr);const Jr=["name","color","picture","age_group","parent","person"];function Qr(e,t){return JSON.stringify(e)===JSON.stringify(t)}function Zr(e,t,i){if(e)return{name:e.name,color:e.color,picture:e.picture,age_group:e.age_group,parent:e.parent,person:e.person};const s=Li(t),a=i.find(e=>!s.has(e.toUpperCase()))??i[0];return{name:"",color:a,picture:{initial:!0},age_group:"adult",parent:!1,person:null}}function eo(e,t,i){const s=Zr(e,t,i);return{draft:s,start:s,rev:e?e.rev:null}}function to(e,t){return!Qr(e,t)}class io extends le{constructor(){super(...arguments),this.layout="landscape",this.shuffle=!1,this.sharedScreens=!1,this._choosing=!1,this._confirmingRemove=!1,this._message="",this._busy=!1}_paused(){return(this.member.locked_until?Date.parse(this.member.locked_until):0)>Date.now()}_status(){return this._paused()?{text:"Paused after too many tries",needs:!1}:this.member.has_pin?{text:"PIN set",needs:!1}:this.member.parent&&this.sharedScreens?{text:"Needs a PIN on a shared screen",needs:!0}:{text:"No PIN",needs:!1}}render(){const e=this._status();return U`
      <div class="row">
        <span class="status ${e.needs?"needs":""}">${e.text}</span>
        <span class="buttons">
          <button class="pv-btn pv-btn-secondary" type="button" ?disabled=${this._busy}
            @click=${()=>{this._message="",this._choosing=!0}}>
            ${this.member.has_pin?"Change PIN":"Set PIN"}
          </button>
          ${this.member.has_pin?U`
            <button class="pv-btn pv-btn-secondary" type="button" ?disabled=${this._busy}
              @click=${()=>{this._message="",this._confirmingRemove=!0}}>Remove PIN</button>
          `:Y}
          ${this._paused()?U`
            <button class="pv-btn pv-btn-secondary" type="button" ?disabled=${this._busy} @click=${this._clearPause}>Clear pause</button>
          `:Y}
        </span>
      </div>
      ${this._message?U`<p class="message" role="alert">${this._message}</p>`:Y}
      ${this._choosing?U`
        <pv-pin-sheet
          mode="choose"
          .hass=${this.hass}
          .api=${this.api}
          .layout=${this.layout}
          .target=${this.member}
          .shuffle=${this.shuffle}
          @pv-pin-set=${this._closeSheet}
          @pv-sheet-close=${this._closeSheet}
        ></pv-pin-sheet>
      `:Y}
      ${this._confirmingRemove?U`
        <pv-notice-sheet
          .layout=${this.layout}
          heading=${`Remove ${this.member.name}'s PIN?`}
          body=${this.member.parent?`On a shared screen, ${this.member.name} will need a new PIN to start parent mode.`:"You can set a new one any time."}
          .actions=${[{id:"cancel",label:"Cancel",kind:"secondary"},{id:"remove",label:"Remove PIN",kind:"destructive"}]}
          @pv-sheet-action=${this._onRemoveChoice}
        ></pv-notice-sheet>
      `:Y}
    `}async _onRemoveChoice(e){e.stopPropagation(),this._confirmingRemove=!1,"remove"===e.detail.id&&await this._remove()}_closeSheet(e){e.stopPropagation(),this._choosing=!1}async _remove(){await this._run(()=>this.api.clearPin(this.member.id))}async _clearPause(){await this._run(()=>this.api.clearPause(this.member.id))}async _run(e){this._busy=!0,this._message="";try{await e()}catch(e){this._message=e?.message||Si(fi(e))}finally{this._busy=!1}}}io.styles=[ot,r`
      :host {
        display: block;
      }

      .row {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 8px 12px;
      }

      .status {
        flex: 1;
        min-width: 140px;
        color: var(--pv-text-secondary, #6B7280);
      }

      .status.needs {
        color: #B45309;
        font-weight: 600;
      }

      .buttons {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
      }

      .buttons button {
        min-height: 44px;
      }

      .message {
        margin: 6px 0 0;
        color: var(--pv-danger, #DC2626);
        font-size: 0.875rem;
      }
    `],e([ue({attribute:!1})],io.prototype,"hass",void 0),e([ue({attribute:!1})],io.prototype,"api",void 0),e([ue({type:String})],io.prototype,"layout",void 0),e([ue({attribute:!1})],io.prototype,"member",void 0),e([ue({type:Boolean})],io.prototype,"shuffle",void 0),e([ue({type:Boolean})],io.prototype,"sharedScreens",void 0),e([me()],io.prototype,"_choosing",void 0),e([me()],io.prototype,"_confirmingRemove",void 0),e([me()],io.prototype,"_message",void 0),e([me()],io.prototype,"_busy",void 0),ge("pv-pin-actions",io);const so=Hi.PRESETS.map(e=>e.color);class ao extends le{constructor(){super(...arguments),this.household=null,this.layout="landscape",this.mode="settings",this.pageProps={},this.drafts=new Map,this._rev=null,this._problem="",this._saving=!1,this._notice=null,this._loaded=!1}get _memberId(){return this.pageProps.memberId??null}get _member(){return this.household?.members.find(e=>e.id===this._memberId)??null}get _draftKey(){return this._memberId??"new"}willUpdate(){if(!this._loaded&&this.household){const e=this.drafts.get(this._draftKey);this._use(e??eo(this._member,this.household.members,so)),this._loaded=!0}}_use(e){this._draft=e.draft,this._start=e.start,this._rev=e.rev}get _record(){return{draft:this._draft,start:this._start,rev:this._rev}}confirmLeave(){return this._loaded&&to(this._draft,this._start)?(this._notice="discard",new Promise(e=>{this._leave=e})):Promise.resolve(!0)}render(){if(!this._loaded||!this.household)return Y;const e=this._member,t=null===this._memberId;if(!t&&!e)return U`<p class="gone">This person was removed on another screen.</p>`;const i=this._draft,s=to(i,this._start);return U`
      <div class="top">
        <pv-member-avatar
          .member=${{name:i.name||"?",color:i.color,picture:i.picture,person:i.person}}
          .hass=${this.hass}
          size="64"
        ></pv-member-avatar>
        <div class="actions">
          <button class="pv-btn pv-btn-secondary" type="button" @click=${this._cancel}>Cancel</button>
          <button class="pv-btn pv-btn-primary" type="button"
            ?disabled=${this._saving||!t&&!s}
            @click=${this._save}>${t?"Add":"Save"}</button>
        </div>
      </div>
      ${this._problem?U`<p class="problem" role="alert">${this._problem}</p>`:Y}
      ${this._renderName()}
      ${this._renderColor()}
      ${this._renderPicture()}
      ${this._renderAgeGroup()}
      ${this._renderParent()}
      ${this._renderPin(e)}
      ${this._renderHomeAssistant()}
      ${e?U`
        <button class="pv-btn remove" type="button" @click=${()=>{this._notice="remove"}}>Remove ${e.name}</button>
      `:Y}
      ${this._renderNotice(e)}
    `}_renderName(){return U`
      <label class="field">
        <span class="label">Name</span>
        <input
          class="pv-input"
          type="text"
          maxlength="40"
          autocomplete="off"
          .value=${this._draft.name}
          @input=${e=>this._change({name:e.target.value})}
        />
      </label>
    `}_renderColor(){const e=Li(this.household.members,this._memberId??void 0);return U`
      <fieldset class="field">
        <legend>Color</legend>
        <div class="swatches">
          ${Hi.PRESETS.map(t=>{const i=e.get(t.color.toUpperCase()),s=this._draft.color.toUpperCase()===t.color.toUpperCase();return U`
              <button
                class="swatch"
                type="button"
                style="background:${t.color}"
                aria-pressed=${s?"true":"false"}
                aria-label=${i?`${t.name}, used by ${i.name}`:t.name}
                ?disabled=${!!i}
                @click=${()=>this._change({color:t.color})}
              >${i?Oi(i.name):""}</button>
            `})}
        </div>
      </fieldset>
    `}_personPicture(){const e=this._draft.person;return e?this.hass?.states?.[e]?.attributes?.entity_picture??null:null}_renderPicture(){const e=this._draft.picture,t="string"==typeof e.emoji?"emoji":e.person?"photo":"initial",i=this._personPicture(),s=!!this._draft.person,a=e=>this._change({picture:e});return U`
      <fieldset class="field">
        <legend>Picture</legend>
        <div class="segmented" role="group" aria-label="Picture">
          <button type="button" aria-pressed=${"initial"===t?"true":"false"}
            @click=${()=>a({initial:!0})}>Initial</button>
          <button type="button" aria-pressed=${"emoji"===t?"true":"false"}
            @click=${()=>a({emoji:"string"==typeof e.emoji?e.emoji:"🙂"})}>Emoji</button>
          <button type="button" aria-pressed=${"photo"===t?"true":"false"} ?disabled=${!s}
            @click=${()=>a({person:!0})}>Photo</button>
        </div>
        ${"emoji"===t?U`
          <input class="pv-input emoji" type="text" maxlength="16" placeholder="Type or paste an emoji"
            aria-label="Emoji"
            .value=${String(e.emoji??"")}
            @input=${e=>a({emoji:e.target.value})} />
        `:Y}
        ${s?"photo"!==t||i?Y:U`<p class="hint">Their Home Assistant person has no photo yet, so their initial shows.</p>`:U`<p class="hint">Link a Home Assistant person to use their photo.</p>`}
      </fieldset>
    `}_renderAgeGroup(){return U`
      <fieldset class="field">
        <legend>Age group</legend>
        <div class="radios">
          ${zi.map(e=>U`
            <label class="radio">
              <input type="radio" name="age-group" .checked=${this._draft.age_group===e.id}
                @change=${()=>this._change({age_group:e.id})} />
              <span>${e.label}</span>
              ${e.hint?U`<span class="age-hint">${e.hint}</span>`:Y}
            </label>
          `)}
        </div>
      </fieldset>
    `}_renderParent(){const e=this._draft.parent,t=()=>this._change({parent:!e});return U`
      <div class="field">
        <div class="toggle-row">
          <span class="label" id="parent-label">Parent</span>
          <div
            class="pv-toggle ${e?"active":""}"
            role="switch"
            tabindex="0"
            aria-checked=${e?"true":"false"}
            aria-labelledby="parent-label"
            @click=${t}
            @keydown=${e=>{"Enter"!==e.key&&" "!==e.key||(e.preventDefault(),t())}}
          ></div>
        </div>
        <p class="hint">Parents open Settings. On a shared screen they need a PIN.</p>
      </div>
    `}_renderPin(e){return U`
      <div class="field">
        <span class="label">PIN</span>
        ${e?U`
          <pv-pin-actions
            .hass=${this.hass}
            .api=${this.api}
            .layout=${this.layout}
            .member=${e}
            .shuffle=${!!this.household?.security.shuffle_keypad}
            .sharedScreens=${(this.household?.security.shared_screens??0)>0}
          ></pv-pin-actions>
        `:U`
          <p class="hint">You can set a PIN after adding ${this._draft.name.trim()||"them"}.</p>
        `}
      </div>
    `}_renderHomeAssistant(){const e=this.household.members,t=new Set(e.filter(e=>e.id!==this._memberId&&e.person).map(e=>e.person)),i=Object.keys(this.hass?.states??{}).filter(e=>e.startsWith("person.")&&!t.has(e)).sort(),s=this._memberId?Ii(this._memberId,this.data?.calendars??[]):[];return U`
      <fieldset class="field">
        <legend>Home Assistant</legend>
        <label class="field">
          <span class="label">Person</span>
          <select class="pv-input pv-select" .value=${this._draft.person??""}
            @change=${e=>this._linkPerson(e.target.value)}>
            <option value="" ?selected=${!this._draft.person}>None</option>
            ${i.map(e=>U`
              <option value=${e} ?selected=${this._draft.person===e}>${this.hass.states[e]?.attributes?.friendly_name??e}</option>
            `)}
          </select>
        </label>
        <span class="label">Calendars</span>
        ${s.length?U`<ul class="calendars">${s.map(e=>U`<li>${e.display_name}</li>`)}</ul>`:U`<p class="hint">No calendars yet. Choose who each calendar belongs to in Calendars.</p>`}
      </fieldset>
    `}_renderNotice(e){return this._notice?"discard"===this._notice?U`
        <pv-notice-sheet .layout=${this.layout} heading="Discard changes?"
          .actions=${[{id:"keep",label:"Keep editing",kind:"secondary"},{id:"discard",label:"Discard",kind:"destructive"}]}
          @pv-sheet-action=${this._onDiscardChoice}></pv-notice-sheet>
      `:"remove"===this._notice&&e?U`
        <pv-notice-sheet .layout=${this.layout} heading="Remove ${e.name}?"
          body="Their calendars stay, and won't belong to anyone."
          .actions=${[{id:"cancel",label:"Cancel",kind:"secondary"},{id:"remove",label:"Remove",kind:"destructive"}]}
          @pv-sheet-action=${this._onRemoveChoice}></pv-notice-sheet>
      `:U`
      <pv-notice-sheet .layout=${this.layout} heading="This changed on another screen."
        .actions=${[{id:"keep",label:"Keep editing",kind:"secondary"},{id:"load",label:"Load the new version",kind:"primary"}]}
        @pv-sheet-action=${this._onChangedChoice}></pv-notice-sheet>
    `:Y}_change(e){this._draft={...this._draft,...e},this._problem="",this.drafts.set(this._draftKey,this._record)}_linkPerson(e){const t=this._draft.picture;this._change({person:e||null,picture:!e&&t.person?{initial:!0}:this._draft.picture})}_pop(){this.dispatchEvent(new CustomEvent(Ei,{bubbles:!0,composed:!0}))}_cancel(){to(this._draft,this._start)?this._notice="discard":this._pop()}async _save(){const e=function(e,t,i){const s=e.name.trim();if(!s)return"Add a name.";const a=t.filter(e=>e.id!==i);if(a.some(e=>e.name.toLocaleLowerCase()===s.toLocaleLowerCase()))return"Someone already has that name.";const n=a.find(t=>t.color.toUpperCase()===e.color.toUpperCase());return n?`${n.name} already has that color.`:null}(this._draft,this.household?.members??[],this._memberId);if(e)return void(this._problem=e);const t=this._member;if(null===this._rev||t){this._saving=!0;try{const e=t&&null!==this._rev?{id:t.id,rev:this._rev}:void 0;await this.api.saveMember(function(e){const t={};for(const i of Jr)null!==e.rev&&Qr(e.draft[i],e.start[i])||(t[i]=e.draft[i]);return"string"==typeof t.name&&(t.name=t.name.trim()),t}(this._record),e),this.drafts.delete(this._draftKey),this._start=this._draft,this._pop()}catch(e){const t=fi(e);"changed"===t?this._notice="changed":this._problem=e?.message||Si(t)}finally{this._saving=!1}}else this._problem="That person was removed on another screen."}_onDiscardChoice(e){e.stopPropagation(),this._notice=null;const t="discard"===e.detail.id;if(t&&(this.drafts.delete(this._draftKey),this._draft=this._start),this._leave){const e=this._leave;this._leave=void 0,e(t)}else t&&this._pop()}async _onRemoveChoice(e){e.stopPropagation(),this._notice=null;const t=this._member;if("remove"===e.detail.id&&t)try{await this.api.deleteMember(t.id),this.drafts.delete(this._draftKey),this._start=this._draft,this._pop()}catch(e){this._problem=e?.message||Si(fi(e))}}_onChangedChoice(e){e.stopPropagation(),this._notice=null;const t=this._member;this.household&&t&&("load"===e.detail.id?(this._use(eo(t,this.household.members,so)),this.drafts.delete(this._draftKey)):(this._use(function(e,t,i){const s=Zr(t,i,so),a={...s};for(const t of Jr)Qr(e.draft[t],e.start[t])||(a[t]=e.draft[t]);return{draft:a,start:s,rev:t.rev}}(this._record,t,this.household.members)),this.drafts.set(this._draftKey,this._record)))}}ao.styles=[nt,ot,ct,r`
      :host {
        display: block;
        max-width: 640px;
      }

      .top {
        display: flex;
        align-items: center;
        gap: 16px;
        margin-bottom: 20px;
      }

      .top .actions {
        display: flex;
        gap: 8px;
        margin-left: auto;
      }

      .top .actions button {
        min-height: 48px;
        min-width: 88px;
      }

      .problem {
        margin: 0 0 16px;
        padding: 10px 14px;
        border-radius: 12px;
        background: color-mix(in srgb, var(--pv-danger, #DC2626) 10%, transparent);
        color: var(--pv-danger, #DC2626);
      }

      .field {
        margin: 0 0 22px;
        padding: 0;
        border: none;
      }

      .field > .label,
      legend {
        display: block;
        margin-bottom: 8px;
        font-weight: 600;
        font-size: 0.9375rem;
      }

      .hint {
        margin: 6px 0 0;
        font-size: 0.875rem;
        color: var(--pv-text-secondary, #6B7280);
      }

      .swatches {
        display: grid;
        grid-template-columns: repeat(auto-fill, 48px);
        gap: 8px;
      }

      .swatch {
        position: relative;
        width: 48px;
        height: 48px;
        border-radius: 50%;
        border: 3px solid transparent;
        cursor: pointer;
        font: inherit;
        font-weight: 700;
        color: #FFFFFF;
        text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
      }

      .swatch[aria-pressed='true'] {
        border-color: var(--pv-text, #1A1B1E);
        box-shadow: inset 0 0 0 2px var(--pv-card-bg, #FFFFFF);
      }

      .swatch:disabled {
        cursor: not-allowed;
        opacity: 0.45;
      }

      .segmented {
        display: inline-flex;
        gap: 4px;
        padding: 4px;
        border-radius: 12px;
        background: color-mix(in srgb, var(--pv-text, #1A1B1E) 6%, transparent);
      }

      .segmented button {
        min-height: 44px;
        padding: 0 16px;
        border: none;
        border-radius: 9px;
        background: transparent;
        color: inherit;
        font: inherit;
        cursor: pointer;
      }

      .segmented button[aria-pressed='true'] {
        background: var(--pv-card-bg, #FFFFFF);
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.15);
        font-weight: 600;
      }

      .segmented button:disabled {
        opacity: 0.4;
        cursor: not-allowed;
      }

      .emoji {
        margin-top: 10px;
        max-width: 240px;
      }

      .radios {
        display: flex;
        flex-direction: column;
        gap: 4px;
      }

      .radio {
        display: flex;
        align-items: center;
        gap: 10px;
        min-height: 48px;
        cursor: pointer;
      }

      .radio input {
        width: 20px;
        height: 20px;
        accent-color: var(--pv-accent, #6366F1);
      }

      .radio .age-hint {
        color: var(--pv-text-secondary, #6B7280);
        font-size: 0.875rem;
      }

      .toggle-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        min-height: 48px;
      }

      .calendars {
        margin: 6px 0 0;
        padding-left: 18px;
      }

      .remove {
        min-height: 48px;
        margin-top: 8px;
        background: transparent;
        border: 1.5px solid var(--pv-danger, #DC2626);
        color: var(--pv-danger, #DC2626);
      }

      .gone {
        color: var(--pv-text-secondary, #6B7280);
      }
    `],e([ue({attribute:!1})],ao.prototype,"hass",void 0),e([ue({attribute:!1})],ao.prototype,"data",void 0),e([ue({attribute:!1})],ao.prototype,"household",void 0),e([ue({attribute:!1})],ao.prototype,"api",void 0),e([ue({type:String})],ao.prototype,"layout",void 0),e([ue({type:String})],ao.prototype,"mode",void 0),e([ue({attribute:!1})],ao.prototype,"pageProps",void 0),e([ue({attribute:!1})],ao.prototype,"drafts",void 0),e([me()],ao.prototype,"_draft",void 0),e([me()],ao.prototype,"_start",void 0),e([me()],ao.prototype,"_problem",void 0),e([me()],ao.prototype,"_saving",void 0),e([me()],ao.prototype,"_notice",void 0),ge("pv-settings-person",ao);class no extends le{constructor(){super(...arguments),this.household=null,this.layout="landscape",this.mode="settings",this._message="",this._busy=!1,this._toggleShared=()=>{this.household&&this._run(()=>this.api.setSharedScreen(!this.household.account.shared))},this._toggleShuffle=()=>{this.household&&this._run(()=>this.api.saveSecurity({shuffle_keypad:!this.household.security.shuffle_keypad}))}}render(){const e=this.household;if(!e)return Y;const t=e.account,i=e.security.shared_screens>0;return U`
      <section>
        <h2>This screen</h2>
        ${this._switch("Shared family screen","shared-label",t.shared,this._toggleShared)}
        <p class="hint">Yes, the whole family uses it. Settings asks for a parent's PIN.</p>
        ${this._message?U`<p class="message" role="alert">${this._message}</p>`:Y}
        ${t.is_admin?U`
          <p class="note">
            This screen is signed in with an admin account. A non-admin account is safer for a
            shared screen, because anyone here can reach Home Assistant's own settings.
            <a href="https://www.home-assistant.io/docs/authentication/" target="_blank" rel="noopener noreferrer">How to set one up</a>
          </p>
        `:Y}
      </section>

      <section>
        <h2>PINs</h2>
        ${Pi(e.members).map(t=>U`
          <div class="person">
            <pv-member-avatar .member=${t} .hass=${this.hass} size="32"></pv-member-avatar>
            <span class="name">${t.name}</span>
            <pv-pin-actions
              .hass=${this.hass}
              .api=${this.api}
              .layout=${this.layout}
              .member=${t}
              .shuffle=${e.security.shuffle_keypad}
              .sharedScreens=${i}
            ></pv-pin-actions>
          </div>
        `)}
      </section>

      <section>
        ${this._switch("Shuffle the keypad","shuffle-label",e.security.shuffle_keypad,this._toggleShuffle)}
        <p class="hint">The numbers move each time, so smudges and glances don't give a PIN away.</p>
      </section>

      <p class="rule">
        After 5 wrong tries, a PIN pauses for 30 seconds, and each pause after that is twice as
        long, up to 15 minutes. A parent can clear a pause here. Forgot every parent's PIN? Sign in
        to Home Assistant with a parent's or an admin's own account and set new ones here.
      </p>
    `}_switch(e,t,i,s){return U`
      <div class="toggle-row">
        <span class="label" id=${t}>${e}</span>
        <div
          class="pv-toggle ${i?"active":""}"
          role="switch"
          tabindex="0"
          aria-checked=${i?"true":"false"}
          aria-labelledby=${t}
          aria-disabled=${this._busy?"true":"false"}
          @click=${s}
          @keydown=${e=>{"Enter"!==e.key&&" "!==e.key||(e.preventDefault(),s())}}
        ></div>
      </div>
    `}async _run(e){if(!this._busy){this._busy=!0,this._message="";try{await e()}catch(e){this._message=e?.message||Si(fi(e))}finally{this._busy=!1}}}}no.styles=[nt,ot,ct,r`
      :host {
        display: block;
        max-width: 640px;
      }

      section {
        margin: 0 0 28px;
      }

      h2 {
        margin: 0 0 10px;
        font-size: 1rem;
        font-weight: 700;
      }

      .toggle-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        min-height: 48px;
      }

      .label {
        font-weight: 600;
      }

      .hint {
        margin: 6px 0 0;
        font-size: 0.875rem;
        color: var(--pv-text-secondary, #6B7280);
        line-height: 1.5;
      }

      .note {
        margin: 12px 0 0;
        padding: 12px 14px;
        border-radius: 12px;
        background: color-mix(in srgb, #F59E0B 14%, transparent);
        line-height: 1.5;
      }

      .message {
        margin: 8px 0 0;
        color: var(--pv-danger, #DC2626);
      }

      .person {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 10px 0;
        border-bottom: 1px solid var(--pv-border-subtle, #E5E7EB);
      }

      .person .name {
        width: 120px;
        flex-shrink: 0;
        font-weight: 600;
      }

      .person pv-pin-actions {
        flex: 1;
        min-width: 0;
      }

      .rule {
        font-size: 0.875rem;
        color: var(--pv-text-secondary, #6B7280);
        line-height: 1.6;
      }
    `],e([ue({attribute:!1})],no.prototype,"hass",void 0),e([ue({attribute:!1})],no.prototype,"data",void 0),e([ue({attribute:!1})],no.prototype,"household",void 0),e([ue({attribute:!1})],no.prototype,"api",void 0),e([ue({type:String})],no.prototype,"layout",void 0),e([ue({type:String})],no.prototype,"mode",void 0),e([me()],no.prototype,"_message",void 0),e([me()],no.prototype,"_busy",void 0),ge("pv-settings-pins",no);class ro extends le{render(){return U`
      <p class="name">PlanaVista</p>
      <p class="version">Version ${Fr}</p>
      <ul>
        <li><a href="https://github.com/tavenhall1/planavista" target="_blank" rel="noopener noreferrer">Project on GitHub</a></li>
        <li><a href="https://github.com/tavenhall1/planavista/issues" target="_blank" rel="noopener noreferrer">Report a problem</a></li>
      </ul>
    `}}ro.styles=[nt,r`
      :host {
        display: block;
        max-width: 640px;
      }

      .name {
        margin: 0;
        font-size: 1.125rem;
        font-weight: 700;
      }

      .version {
        margin: 4px 0 20px;
        color: var(--pv-text-secondary, #6B7280);
      }

      ul {
        list-style: none;
        margin: 0;
        padding: 0;
      }

      a {
        display: flex;
        align-items: center;
        min-height: 48px;
        color: var(--pv-accent-ink, var(--pv-accent, #6366F1));
        text-decoration: none;
        font-weight: 600;
      }
    `],ge("pv-settings-about",ro);class oo{constructor(e){this._host=e,this._watched=null,this._unsubscribe=null,this._fallback=new qn(()=>e.requestUpdate()),e.addController(this)}get edits(){return this._host.drafts?.get("appearance")??this._fallback}hostConnected(){this._watch()}hostUpdate(){this._watch()}hostDisconnected(){this._unsubscribe?.(),this._unsubscribe=null,this._watched=null,this.edits.flush()}current(){return this.edits.current(rr(this._host.data?.display))}set(e,t){this.edits.set(e,e=>this._host.api.saveConfig({display:e}),e=>this._error(e),function(e){if(!e)return;const t=e;if("number"==typeof t.clientX&&t.detail>0)return{x:t.clientX,y:t.clientY};const i=e.currentTarget;if(!i?.getBoundingClientRect)return;const s=i.getBoundingClientRect();return{x:s.left+s.width/2,y:s.top+s.height/2}}(t))}_watch(){const e=this.edits;e!==this._watched&&(this._unsubscribe?.(),this._watched=e,this._unsubscribe=e.subscribe(()=>this._host.requestUpdate()))}_error(e){this._host.dispatchEvent(new CustomEvent(Ci,{detail:{message:Si(fi(e))},bubbles:!0,composed:!0}))}}const lo={background:{min:4.5,message:e=>`Text is hard to read on the ${e} background.`,ratio:e=>je(e["--pv-text"],e["--pv-card-bg"]),fix:(e,t)=>Je(e["--pv-bg"],e["--pv-text"],t)},accent:{min:3,message:e=>`The ${e} accent is hard to see on this background.`,ratio:e=>je(e["--pv-accent"],e["--pv-card-bg"]),fix:(e,t)=>Je(e["--pv-accent"],e["--pv-card-bg"],t)},header:{min:4.5,message:e=>`Text on the ${e} header is hard to read.`,ratio:e=>Ie(e["--pv-header-gradient"])?je(e["--pv-header-text"],e["--pv-header-gradient"]):null,fix:(e,t)=>Je(e["--pv-header-gradient"],e["--pv-header-text"],t)},now_color:{min:3,message:e=>`The ${e} now line is hard to see on this background.`,ratio:e=>je(e["--pv-now-color"],e["--pv-card-bg"]),fix:(e,t)=>Je(e["--pv-now-color"],e["--pv-card-bg"],t)}},co=Object.keys(lo);function po(e,t){const i=e.ratio(t);return null!==i&&i<e.min}function ho(e,t,i,s){return{...e,[t]:{...e[t],[i]:s}}}function uo(e,t){const i="light"===t?e.light:e.dark;return co.filter(s=>void 0!==i[s]||"dark"===t&&void 0!==e.light[s])}const mo=[{key:"accent",label:"Accent",token:"--pv-accent"},{key:"background",label:"Background",token:"--pv-bg"},{key:"header",label:"Header",token:"--pv-header-gradient"},{key:"now_color",label:"Now line",token:"--pv-now-color"}],vo=[{key:"plain",label:"Plain"},{key:"gradient_purple",label:"Purple"},{key:"gradient_teal",label:"Teal"},{key:"gradient_sunset",label:"Sunset"},{key:"solid_accent",label:"Accent"},{key:"solid_dark",label:"Dark"}],go={light:"Light",dark:"Dark"},bo=[{key:"corner_style",label:"Corners",options:[["sharp","Sharp"],["rounded","Rounded"],["pill","Pill"]]},{key:"shadow_depth",label:"Shadows",options:[["none","None"],["subtle","Subtle"],["bold","Bold"]]},{key:"event_style",label:"Events",options:[["stripes","Stripes"],["solid","Solid"]]}];class yo extends le{constructor(){super(...arguments),this.household=null,this.layout="landscape",this.mode="settings",this.drafts=new Map,this._open=null,this._confirmReset=!1,this._page=new oo(this),this._onResetChoice=e=>{e.stopPropagation(),this._confirmReset=!1,"reset"===e.detail.id&&(this._open=null,this._page.set({colors_light:{},colors_dark:{}}))}}render(){if(!this.data)return Y;const e=this._page.current(),t=or(e),i=function(e){const t=[];for(const i of["light","dark"]){const s=Wt(e,i);for(const a of uo(e,i)){const n=lo[a];if(po(n,s))for(const r of[0,.5,1,1.5,2,3]){const o=n.fix(s,n.min+r);if(o&&!po(n,Wt(ho(e,i,a,o),i))){t.push({mode:i,key:a,message:n.message(i),fix:o});break}}}}return t}(t),s=Jn[e.theme_pair],a=Object.keys(e.colors_light).length+Object.keys(e.colors_dark).length>0;return U`
      <section>
        <h2 class="section-heading">Colors</h2>
        <div class="issues" aria-live="polite">${i.map(e=>U`
          <p class="issue">
            <span>⚠ ${e.message}</span>
            <button class="pv-btn pv-btn-secondary" type="button"
              @click=${t=>this._setColor(e.mode,e.key,e.fix,t)}>Fix it</button>
          </p>
        `)}</div>
        ${this._renderColors(t)}
        <p class="help">Dark colors follow your light ones until you change them. Matched means PlanaVista picks a dark color that goes with your light one; choose Matched again to go back.</p>
      </section>
      <section>
        <h2 class="section-heading">Shape, for both versions</h2>
        ${this._renderShape(e.shape)}
      </section>
      <section>
        <button class="pv-btn pv-btn-secondary reset" type="button" ?disabled=${!a}
          @click=${()=>{this._confirmReset=!0}}>Reset ${s} to its original colors</button>
      </section>
      ${this._confirmReset?U`
        <pv-notice-sheet
          .layout=${this.layout}
          heading=${`Reset ${s} to its original colors?`}
          body="Your light and dark colors go back to the theme's own. Corners, shadows, and the other shape settings stay."
          .actions=${[{id:"cancel",label:"Cancel",kind:"secondary"},{id:"reset",label:"Reset",kind:"destructive"}]}
          @pv-sheet-action=${this._onResetChoice}
        ></pv-notice-sheet>
      `:Y}
    `}_renderColors(e){const t={light:Wt(e,"light"),dark:Wt(e,"dark")};return U`
      <table>
        <thead>
          <tr><td></td><th scope="col">Light</th><th scope="col">Dark</th></tr>
        </thead>
        <tbody>
          ${mo.map(i=>U`
            <tr>
              <th scope="row">${i.label}</th>
              ${["light","dark"].map(s=>{const a=this._open?.key===i.key&&this._open.mode===s,n=this._caption(e,s,i.key);return U`
                  <td>
                    <button class="cell" type="button" aria-expanded=${a?"true":"false"}
                      aria-label=${`${i.label}, ${go[s]}: ${n}`}
                      @click=${()=>{this._open=a?null:{key:i.key,mode:s}}}>
                      <span class="swatch" style="background: ${t[s][i.token]}"></span>
                      <span class="caption">${n}</span>
                    </button>
                  </td>
                `})}
            </tr>
            ${this._open?.key===i.key?U`
              <tr>
                <td colspan="3">${this._renderEditor(e,this._open.mode,i.key)}</td>
              </tr>
            `:Y}
          `)}
        </tbody>
      </table>
    `}_caption(e,t,i){const s=e[t][i];if(void 0===s)return"dark"===t&&void 0!==e.light[i]?"Matched":"Original";if("header"===i){const e=vo.find(e=>e.key===s);if(e)return e.label}return s.toUpperCase()}_renderEditor(e,t,i){const s=e[t][i],a="light"===t?"Original":"Matched",n=s&&s.startsWith("#")?s:"";return U`
      <div class="editor" aria-label=${`${mo.find(e=>e.key===i)?.label} for ${go[t]}`} role="group">
        <div class="pill-group">
          <button class="pill-btn ${void 0===s?"pill-btn--active":""}" type="button"
            aria-pressed=${void 0===s?"true":"false"}
            @click=${e=>this._setColor(t,i,void 0,e)}>${a}</button>
          ${"header"===i?vo.map(e=>U`
            <button class="pill-btn ${s===e.key?"pill-btn--active":""}" type="button"
              aria-pressed=${s===e.key?"true":"false"}
              @click=${s=>this._setColor(t,i,e.key,s)}>${e.label}</button>
          `):Y}
        </div>
        <pv-color-swatch-picker
          .value=${n}
          @color-change=${e=>{e.stopPropagation(),this._setColor(t,i,e.detail.color,e)}}
        ></pv-color-swatch-picker>
      </div>
    `}_renderShape(e){const t=e.avatar_border??"primary",i="primary"!==t&&"white"!==t&&"light"!==t;return U`
      <div class="shape">
        ${bo.map(t=>{const i=e[t.key]??("event_style"===t.key?"stripes":void 0);return U`
            <div role="group" aria-label=${t.label}>
              <span class="shape-label">${t.label}</span>
              <div class="pill-group">
                ${t.options.map(([e,s])=>U`
                  <button class="pill-btn ${i===e?"pill-btn--active":""}" type="button"
                    aria-pressed=${i===e?"true":"false"}
                    @click=${i=>this._setShape({[t.key]:e},i)}>${s}</button>
                `)}
              </div>
            </div>
          `})}
        <div role="group" aria-label="Avatar border">
          <span class="shape-label">Avatar border</span>
          <div class="pill-group">
            <button class="pill-btn ${"primary"===t?"pill-btn--active":""}" type="button"
              aria-pressed=${"primary"===t?"true":"false"}
              @click=${e=>this._setShape({avatar_border:"primary"},e)}>Their color</button>
            <button class="pill-btn ${"white"===t||"light"===t?"pill-btn--active":""}" type="button"
              aria-pressed=${"white"===t||"light"===t?"true":"false"}
              @click=${e=>this._setShape({avatar_border:"white"},e)}>White</button>
            <button class="pill-btn ${i?"pill-btn--active":""}" type="button"
              aria-pressed=${i?"true":"false"}
              @click=${e=>this._setShape({avatar_border:i?t:"#4D8FD9"},e)}>Custom</button>
          </div>
          ${i?U`
            <label class="border-custom">
              <input type="color" .value=${t}
                @input=${e=>this._setShape({avatar_border:e.target.value},e)}>
              <span>${t.toUpperCase()}</span>
            </label>
          `:Y}
        </div>
      </div>
    `}_setColor(e,t,i,s){const a=this._page.current(),n={..."light"===e?a.colors_light:a.colors_dark};void 0===i?delete n[t]:n[t]=i,this._page.set("light"===e?{colors_light:n}:{colors_dark:n},s)}_setShape(e,t){this._page.set({shape:{...this._page.current().shape,...e}},t)}}yo.styles=[ot,ct,bi,r`
      :host {
        display: block;
      }

      section + section {
        margin-top: 26px;
      }

      .section-heading {
        margin: 0 0 10px;
        font-family: var(--pv-font-heading, ui-rounded, 'SF Pro Rounded', 'PlanaVista Rounded', system-ui, sans-serif);
        font-size: 1rem;
        font-weight: 700;
        color: var(--pv-text, #1A1B1E);
      }

      .help {
        margin: 10px 0 0;
        font-size: 0.875rem;
        line-height: 1.45;
        color: var(--pv-text-secondary, #5F6670);
      }

      button {
        font: inherit;
        color: inherit;
        -webkit-tap-highlight-color: transparent;
      }

      button:focus-visible,
      input:focus-visible {
        outline: 2px solid var(--pv-accent-ink, var(--pv-accent, #5B5BD6));
        outline-offset: 2px;
      }

      /* Hard to read */
      .issues:empty {
        display: none;
      }

      .issues {
        display: flex;
        flex-direction: column;
        gap: 8px;
        margin-bottom: 16px;
      }

      .issue {
        display: flex;
        align-items: center;
        gap: 12px;
        margin: 0;
        padding: 10px 12px;
        border-radius: var(--pv-radius, 12px);
        background: var(--pv-warn-bg, #FDF1DC);
        color: var(--pv-warn-ink, #8A5A00);
      }

      .issue span {
        flex: 1;
        font-weight: 600;
        line-height: 1.4;
      }

      .issue button {
        min-height: 48px;
        flex-shrink: 0;
      }

      /* Colors */
      table {
        width: 100%;
        border-collapse: separate;
        border-spacing: 0 6px;
      }

      th {
        font-weight: 650;
        text-align: left;
        color: var(--pv-text, #1A1B1E);
      }

      thead th {
        font-size: 0.875rem;
        color: var(--pv-text-secondary, #5F6670);
        padding: 0 4px;
      }

      tbody th {
        width: 28%;
        padding-right: 8px;
      }

      .cell {
        display: flex;
        align-items: center;
        gap: 10px;
        width: 100%;
        min-height: 56px;
        padding: 4px;
        border: 1.5px solid transparent;
        border-radius: var(--pv-radius, 12px);
        background: transparent;
        text-align: left;
        cursor: pointer;
      }

      .cell:hover,
      .cell[aria-expanded='true'] {
        border-color: var(--pv-border, #E7E7E3);
        background: var(--pv-card-bg, #FFFFFF);
      }

      .cell[aria-expanded='true'] {
        border-color: var(--pv-accent, #5B5BD6);
      }

      .swatch {
        flex-shrink: 0;
        width: 48px;
        height: 48px;
        box-sizing: border-box;
        border-radius: var(--pv-radius-sm, 8px);
        border: 1px solid var(--pv-border, #E7E7E3);
      }

      .caption {
        font-size: 0.875rem;
        color: var(--pv-text-secondary, #5F6670);
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .editor {
        padding: 12px;
        border-radius: var(--pv-radius, 12px);
        background: var(--pv-card-bg, #FFFFFF);
        border: 1px solid var(--pv-border, #E7E7E3);
      }

      .editor .pill-group {
        margin-bottom: 12px;
      }

      /* Shape */
      .shape {
        display: flex;
        flex-direction: column;
        gap: 16px;
      }

      .shape-label {
        display: block;
        margin-bottom: 8px;
        font-size: 0.875rem;
        font-weight: 600;
        color: var(--pv-text-secondary, #5F6670);
      }

      .pill-btn {
        min-height: 48px;
      }

      .border-custom {
        display: flex;
        align-items: center;
        gap: 10px;
        margin-top: 10px;
        font-size: 0.875rem;
        color: var(--pv-text-secondary, #5F6670);
      }

      .border-custom input {
        width: 48px;
        height: 48px;
        padding: 0;
        border: 1px solid var(--pv-border, #E7E7E3);
        border-radius: var(--pv-radius-sm, 8px);
        background: transparent;
        cursor: pointer;
      }

      .reset {
        min-height: 48px;
      }

      .reset:disabled {
        opacity: 0.45;
        cursor: default;
      }
    `],e([ue({attribute:!1})],yo.prototype,"hass",void 0),e([ue({attribute:!1})],yo.prototype,"data",void 0),e([ue({attribute:!1})],yo.prototype,"household",void 0),e([ue({attribute:!1})],yo.prototype,"api",void 0),e([ue({type:String,reflect:!0})],yo.prototype,"layout",void 0),e([ue({type:String})],yo.prototype,"mode",void 0),e([ue({attribute:!1})],yo.prototype,"drafts",void 0),e([me()],yo.prototype,"_open",void 0),e([me()],yo.prototype,"_confirmReset",void 0),ge("pv-settings-customize",yo);const fo=["#4D8FD9","#F3722C","#43AA8B"],_o={sun:"",schedule:"",home_assistant:"Each screen follows its own Home Assistant theme setting. Handy for phones."};function xo(e,t){const i=[`--p-page: ${e["--pv-bg"]}`,`--p-card: ${e["--pv-card-bg"]}`,`--p-header: ${e["--pv-header-gradient"]}`,`--p-accent: ${e["--pv-accent"]}`,`--p-line: ${e["--pv-border"]}`].join("; ");return U`
    <span class="pic" style=${i}>
      <span class="pic-header"></span>
      <span class="pic-bar"><span class="pic-tab"></span></span>
      <span class="pic-cols">
        ${fo.map(e=>U`<span class="pic-col" style="--p-person: ${Yt(e,void 0,t).color}"></span>`)}
      </span>
    </span>
  `}class wo extends le{constructor(){super(...arguments),this.household=null,this.layout="landscape",this.mode="settings",this.drafts=new Map,this._page=new oo(this)}render(){if(!this.data)return Y;const e=this._page.current(),t=or(e);return U`
      <section>
        ${this._renderModes(t,e.appearance)}
      </section>
      ${"automatic"===e.appearance?U`
        <section>
          ${this._heading("When to switch","switch-heading")}
          ${this._renderSwitch(e.appearance_switch,e.light_from,e.dark_from)}
        </section>
      `:Y}
      <section>
        ${this._heading("Theme","theme-heading")}
        ${this._renderThemes(t)}
        <p class="help">Every theme has a light and a dark version. Automatic moves between them.</p>
      </section>
      ${"settings"===this.mode?U`
        <section>
          <button class="link-row" type="button" @click=${()=>this._customize(e.theme_pair)}>
            <span class="row-text">
              <span class="row-title">Customize ${Jn[e.theme_pair]}</span>
              <span class="row-help">Light and dark colors, corners, shadows</span>
            </span>
            <span class="chevron" aria-hidden="true">›</span>
          </button>
        </section>
        <section>
          ${this._heading("Motion","motion-heading")}
          ${this._renderMotion(e.motion)}
          <p class="help">Reduced swaps movement for quick fades. Follow the device uses this screen's own setting.</p>
        </section>
      `:Y}
    `}_heading(e,t){return U`<h2 class="section-heading" id=${t}>${e}</h2>`}_renderModes(e,t){const i=Wt(e,"light"),s=Wt(e,"dark");return U`
      <div class="modes" role="radiogroup" aria-label="Appearance"
        @keydown=${e=>this._arrows(e,Wn,t,t=>this._page.set({appearance:t},e))}>
        ${Wn.map(e=>U`
          <button class="mode-option" type="button" role="radio" data-value=${e}
            aria-checked=${e===t?"true":"false"}
            tabindex=${e===t?"0":"-1"}
            @click=${t=>this._page.set({appearance:e},t)}>
            <span class="frame">
              ${"automatic"===e?U`<span class="pic-pair split">${xo(i,"light")}<span class="pic-over">${xo(s,"dark")}</span></span>`:xo("dark"===e?s:i,"dark"===e?"dark":"light")}
              <span class="badge" aria-hidden="true">✓</span>
            </span>
            <span class="option-label">${Gn[e]}</span>
          </button>
        `)}
      </div>
    `}_renderSwitch(e,t,i){const s=Un(this.hass?.states),a="24h"===this.data.display?.time_format?"24h":"12h",n=s?function(e,t,i){if(!e)return null;const s=pr(e.next_rising,t),a=pr(e.next_setting,t);if(!s||!a)return null;if("below_horizon"===e.state)return`Light at ${mr(s,i)}, dark again at ${mr(a,i)}.`;const n=function(e,t){return e.getFullYear()===t.getFullYear()&&e.getMonth()===t.getMonth()&&e.getDate()===t.getDate()}(a,t)?" tonight":"";return`Dark at ${mr(a,i)}${n}, light again at ${mr(s,i)}.`}(s,new Date,a)??"Uses your home's location in Home Assistant.":"Home Assistant's Sun integration isn't set up, so the schedule's times are used until it is.",r={..._o,sun:n};return U`
      <div class="rows" role="radiogroup" aria-labelledby="switch-heading"
        @keydown=${t=>this._arrows(t,Yn,e,e=>this._page.set({appearance_switch:e},t))}>
        ${Yn.map(s=>U`
          <button class="row" type="button" role="radio" data-value=${s}
            aria-checked=${s===e?"true":"false"}
            tabindex=${s===e?"0":"-1"}
            @click=${e=>this._page.set({appearance_switch:s},e)}>
            <span class="dot" aria-hidden="true"></span>
            <span class="row-text">
              <span class="row-title">${Qn[s]}</span>
              ${r[s]?U`<span class="row-help">${r[s]}</span>`:Y}
            </span>
          </button>
          ${"schedule"===s&&"schedule"===e?U`
            <div class="times">
              <label>Light from
                <input class="pv-input" type="time" .value=${t}
                  @change=${e=>this._time("light_from",e)}>
              </label>
              <label>Dark from
                <input class="pv-input" type="time" .value=${i}
                  @change=${e=>this._time("dark_from",e)}>
              </label>
            </div>
          `:Y}
        `)}
      </div>
    `}_renderThemes(e){return U`
      <div class="themes" role="radiogroup" aria-labelledby="theme-heading"
        @keydown=${t=>this._arrows(t,Kn,e.pair,e=>this._page.set({theme_pair:e},t))}>
        ${Kn.map(t=>{const i={...e,pair:t};return U`
            <button class="theme" type="button" role="radio" data-value=${t}
              aria-checked=${t===e.pair?"true":"false"}
              tabindex=${t===e.pair?"0":"-1"}
              @click=${e=>this._page.set({theme_pair:t},e)}>
              <span class="pic-pair halves">
                ${xo(Wt(i,"light"),"light")}
                <span class="pic-over">${xo(Wt(i,"dark"),"dark")}</span>
              </span>
              <span class="option-label">${Jn[t]}</span>
              <span class="badge" aria-hidden="true">✓</span>
            </button>
          `})}
      </div>
    `}_renderMotion(e){return U`
      <div class="seg" role="radiogroup" aria-labelledby="motion-heading"
        @keydown=${t=>this._arrows(t,Xn,e,e=>this._page.set({motion:e},t))}>
        ${Xn.map(t=>U`
          <button class="seg-btn" type="button" role="radio" data-value=${t}
            aria-checked=${t===e?"true":"false"}
            tabindex=${t===e?"0":"-1"}
            @click=${e=>this._page.set({motion:t},e)}>${Zn[t]}</button>
        `)}
      </div>
    `}_arrows(e,t,i,s){if("radio"!==e.target.getAttribute?.("role"))return;const a="ArrowRight"===e.key||"ArrowDown"===e.key?1:"ArrowLeft"===e.key||"ArrowUp"===e.key?-1:0;if(!a)return;e.preventDefault();const n=Math.max(0,t.indexOf(i)),r=t[(n+a+t.length)%t.length];s(r);const o=e.currentTarget;this.updateComplete.then(()=>o.querySelector(`[data-value='${r}']`)?.focus())}_time(e,t){const i=t.target.value.slice(0,5);/^([01]\d|2[0-3]):[0-5]\d$/.test(i)&&this._page.set("light_from"===e?{light_from:i}:{dark_from:i},t)}_customize(e){const t={tag:"pv-settings-customize",title:`Customize ${Jn[e]}`,back:"Appearance"};this.dispatchEvent(new CustomEvent(Fi,{detail:t,bubbles:!0,composed:!0}))}}wo.styles=[ot,ct,bi,r`
      :host {
        display: block;
      }

      section + section {
        margin-top: 28px;
      }

      .section-heading {
        margin: 0 0 10px;
        font-family: var(--pv-font-heading, ui-rounded, 'SF Pro Rounded', 'PlanaVista Rounded', system-ui, sans-serif);
        font-size: 1rem;
        font-weight: 700;
        color: var(--pv-text, #1A1B1E);
      }

      .help {
        margin: 8px 0 0;
        font-size: 0.875rem;
        line-height: 1.45;
        color: var(--pv-text-secondary, #5F6670);
      }

      button {
        font: inherit;
        color: inherit;
        -webkit-tap-highlight-color: transparent;
      }

      button:focus-visible,
      input:focus-visible {
        outline: 2px solid var(--pv-accent-ink, var(--pv-accent, #5B5BD6));
        outline-offset: 2px;
      }

      /* The little pictures of the card. */
      .pic {
        display: flex;
        flex-direction: column;
        box-sizing: border-box;
        width: 112px;
        height: 76px;
        border-radius: 10px;
        overflow: hidden;
        background: var(--p-page);
        border: 1px solid var(--p-line);
      }

      .pic-header {
        height: 14px;
        flex-shrink: 0;
        background: var(--p-header);
        border-bottom: 1px solid var(--p-line);
      }

      .pic-bar {
        display: flex;
        align-items: center;
        height: 10px;
        flex-shrink: 0;
        padding: 0 6px;
        background: var(--p-card);
      }

      .pic-tab {
        width: 18px;
        height: 5px;
        border-radius: 3px;
        background: var(--p-accent);
      }

      .pic-cols {
        flex: 1;
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 4px;
        padding: 5px 6px 6px;
      }

      .pic-col {
        border-radius: 3px;
        background: var(--p-card);
        border-top: 3px solid var(--p-person);
      }

      .pic-pair {
        position: relative;
        display: block;
        width: fit-content;
        border-radius: 10px;
      }

      .pic-pair .pic-over {
        position: absolute;
        inset: 0;
      }

      /* Automatic: day and night split corner to corner. */
      .pic-pair.split .pic-over {
        clip-path: polygon(100% 0, 100% 100%, 0 100%);
      }

      /* A theme: its light half at the left, its dark half at the right. */
      .pic-pair.halves .pic-over {
        clip-path: inset(0 0 0 50%);
      }

      /* Light, Dark, Automatic */
      .modes {
        display: flex;
        flex-wrap: wrap;
        gap: 14px;
      }

      .mode-option {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 8px;
        min-height: 48px;
        padding: 6px;
        border: none;
        border-radius: 14px;
        background: transparent;
        cursor: pointer;
      }

      .frame {
        position: relative;
        display: block;
        border-radius: 12px;
        padding: 3px;
        box-shadow: 0 0 0 1.5px transparent;
        transition: box-shadow 150ms ease;
      }

      [aria-checked='true'] > .frame {
        box-shadow: 0 0 0 2.5px var(--pv-accent, #5B5BD6);
      }

      .badge {
        position: absolute;
        top: -6px;
        right: -6px;
        display: none;
        align-items: center;
        justify-content: center;
        width: 22px;
        height: 22px;
        border-radius: 50%;
        background: var(--pv-accent, #5B5BD6);
        color: var(--pv-accent-text, #FFFFFF);
        font-size: 0.75rem;
        font-weight: 800;
        box-shadow: 0 0 0 2px var(--pv-card-bg, #FFFFFF);
      }

      [aria-checked='true'] .badge {
        display: inline-flex;
      }

      .option-label {
        font-size: 0.9375rem;
        font-weight: 650;
        color: var(--pv-text, #1A1B1E);
      }

      /* When to switch */
      .rows {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }

      .row {
        display: flex;
        align-items: flex-start;
        gap: 12px;
        width: 100%;
        min-height: 56px;
        padding: 12px 14px;
        border: 1.5px solid var(--pv-border, #E7E7E3);
        border-radius: var(--pv-radius, 12px);
        background: var(--pv-card-bg, #FFFFFF);
        text-align: left;
        cursor: pointer;
      }

      .row[aria-checked='true'] {
        border-color: var(--pv-accent, #5B5BD6);
      }

      .dot {
        flex-shrink: 0;
        width: 20px;
        height: 20px;
        margin-top: 1px;
        box-sizing: border-box;
        border-radius: 50%;
        border: 2px solid var(--pv-text-secondary, #5F6670);
      }

      .row[aria-checked='true'] .dot {
        border: 6px solid var(--pv-accent, #5B5BD6);
      }

      .row-text {
        display: flex;
        flex-direction: column;
        gap: 3px;
      }

      .row-title {
        font-weight: 650;
        color: var(--pv-text, #1A1B1E);
      }

      .row-help {
        font-size: 0.875rem;
        line-height: 1.4;
        color: var(--pv-text-secondary, #5F6670);
      }

      .times {
        display: flex;
        flex-wrap: wrap;
        gap: 14px;
        margin: 4px 0 0 46px;
      }

      .times label {
        display: flex;
        flex-direction: column;
        gap: 6px;
        font-size: 0.875rem;
        font-weight: 600;
        color: var(--pv-text-secondary, #5F6670);
      }

      .times input {
        min-height: 48px;
        min-width: 140px;
        box-sizing: border-box;
      }

      /* Themes */
      .themes {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 12px;
      }

      :host(:not([layout='landscape'])) .themes {
        grid-template-columns: 1fr;
      }

      .theme {
        position: relative;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 10px;
        min-height: 48px;
        padding: 12px;
        border: 1.5px solid var(--pv-border, #E7E7E3);
        border-radius: var(--pv-radius-lg, 16px);
        background: var(--pv-card-bg, #FFFFFF);
        cursor: pointer;
      }

      :host(:not([layout='landscape'])) .theme {
        flex-direction: row;
        justify-content: flex-start;
        gap: 16px;
      }

      .theme[aria-checked='true'] {
        border-color: var(--pv-accent, #5B5BD6);
        box-shadow: 0 0 0 1.5px var(--pv-accent, #5B5BD6);
      }

      .theme .pic-pair,
      .theme .pic {
        width: 100%;
        max-width: 168px;
      }

      :host(:not([layout='landscape'])) .theme .pic-pair,
      :host(:not([layout='landscape'])) .theme .pic {
        width: 152px;
      }

      .theme .badge {
        top: 8px;
        right: 8px;
      }

      /* Customize */
      .link-row {
        display: flex;
        align-items: center;
        gap: 12px;
        width: 100%;
        min-height: 56px;
        padding: 12px 14px;
        border: 1.5px solid var(--pv-border, #E7E7E3);
        border-radius: var(--pv-radius, 12px);
        background: var(--pv-card-bg, #FFFFFF);
        text-align: left;
        cursor: pointer;
      }

      .link-row .row-text {
        flex: 1;
      }

      .chevron {
        font-size: 1.375rem;
        color: var(--pv-text-secondary, #5F6670);
      }

      /* Motion */
      .seg {
        display: inline-flex;
        flex-wrap: wrap;
        padding: 3px;
        border-radius: 12px;
        background: var(--pv-seg, #ECECE8);
      }

      .seg-btn {
        min-height: 48px;
        padding: 0 16px;
        border: none;
        border-radius: 9px;
        background: transparent;
        font-weight: 650;
        color: var(--pv-text-secondary, #5F6670);
        cursor: pointer;
      }

      .seg-btn[aria-checked='true'] {
        background: var(--pv-seg-on, #FFFFFF);
        color: var(--pv-text, #1A1B1E);
        box-shadow: 0 1px 2px rgba(0, 0, 0, 0.12);
      }
    `],e([ue({attribute:!1})],wo.prototype,"hass",void 0),e([ue({attribute:!1})],wo.prototype,"data",void 0),e([ue({attribute:!1})],wo.prototype,"household",void 0),e([ue({attribute:!1})],wo.prototype,"api",void 0),e([ue({type:String,reflect:!0})],wo.prototype,"layout",void 0),e([ue({type:String})],wo.prototype,"mode",void 0),e([ue({attribute:!1})],wo.prototype,"drafts",void 0),ge("pv-appearance-editor",wo);class $o extends le{constructor(){super(...arguments),this.household=null,this.layout="landscape",this.mode="settings",this.drafts=new Map}render(){return U`
      <pv-appearance-editor
        .hass=${this.hass}
        .data=${this.data}
        .household=${this.household}
        .api=${this.api}
        .layout=${this.layout}
        .drafts=${this.drafts}
        mode="settings"
      ></pv-appearance-editor>
    `}}$o.styles=r`
    :host {
      display: block;
    }
  `,e([ue({attribute:!1})],$o.prototype,"hass",void 0),e([ue({attribute:!1})],$o.prototype,"data",void 0),e([ue({attribute:!1})],$o.prototype,"household",void 0),e([ue({attribute:!1})],$o.prototype,"api",void 0),e([ue({type:String})],$o.prototype,"layout",void 0),e([ue({type:String})],$o.prototype,"mode",void 0),e([ue({attribute:!1})],$o.prototype,"drafts",void 0),ge("pv-settings-appearance",$o);class ko extends le{constructor(){super(...arguments),this.household=null,this.layout="landscape",this.session=null,this.sessionEndsAt=0,this.parent=null,this.drafts=new Map,this._selected=null,this._stack=[],this._toast="",this._back=async()=>{await this._mayLeave()&&(this._stack.length>0?this._stack=this._stack.slice(0,-1):this._selected=null)},this._done=async()=>{await this._mayLeave()&&this.dispatchEvent(new CustomEvent("pv-settings-close",{bubbles:!0,composed:!0}))},this._onPush=e=>{e.stopPropagation(),this._stack=[...this._stack,e.detail]},this._onPop=e=>{e.stopPropagation(),this._stack=this._stack.slice(0,-1)},this._onError=e=>{e.stopPropagation(),this._toast=e.detail.message,window.clearTimeout(this._toastTimer),this._toastTimer=window.setTimeout(()=>{this._toast=""},4e3)}}connectedCallback(){super.connectedCallback(),this.addEventListener(Fi,this._onPush),this.addEventListener(Ei,this._onPop),this.addEventListener(Ci,this._onError)}disconnectedCallback(){super.disconnectedCallback(),this.removeEventListener(Fi,this._onPush),this.removeEventListener(Ei,this._onPop),this.removeEventListener(Ci,this._onError),window.clearTimeout(this._toastTimer)}_context(){return{household:this.household,data:this.data}}get _split(){return"landscape"===this.layout}_current(e){return e.find(e=>e.id===this._selected)??(this._split?e[0]:void 0)}render(){const e=Xi.pages(this._context()),t=this._current(e),i=this._stack[this._stack.length-1],s=!this._split&&t;return U`
      ${this.session?.parent&&this.parent?U`
        <pv-parent-strip .member=${this.parent} .hass=${this.hass} .endsAt=${this.sessionEndsAt}></pv-parent-strip>
      `:Y}
      <div class="bar">
        ${s?U`<button class="back" type="button" @click=${this._back}>‹ ${i?i.back:"Settings"}</button>`:U`<h1 class="title">Settings</h1>`}
        <button class="pv-btn pv-btn-primary done" type="button" @click=${this._done}>Done</button>
      </div>
      <div class="body">
        ${this._split||!t?this._renderList(e,t):Y}
        ${t?this._renderPage(t,i):Y}
      </div>
      ${this._toast?U`<div class="toast" role="status">${this._toast}</div>`:Y}
    `}_renderList(e,t){const i=this._context();return U`
      <nav class="list" aria-label="Settings">
        ${function(e,t=Ki){const i=new Set(t.map(e=>e.id)),s=[...new Set(e.map(e=>e.group).filter(e=>!i.has(e)))].map(e=>({id:e,label:null,order:1e3}));return[...t,...s].sort((e,t)=>e.order-t.order).map(t=>({group:t,pages:e.filter(e=>e.group===t.id)})).filter(e=>e.pages.length>0)}(e).map(({group:e,pages:s})=>U`
          <section class="group">
            ${e.label?U`<h2 class="group-label">${e.label}</h2>`:Y}
            ${s.map(e=>{const s=this._split&&t?.id===e.id;return U`
                <button class="row ${s?"row--active":""}" type="button"
                  aria-current=${s?"page":"false"}
                  @click=${()=>this._select(e.id)}>
                  <span class="row-text">
                    <span class="row-label">${e.label}</span>
                    ${e.summary?U`<span class="row-value">${e.summary(i)}</span>`:Y}
                  </span>
                  <span class="chevron" aria-hidden="true">›</span>
                </button>
              `})}
          </section>
        `)}
      </nav>
    `}_renderPage(e,t){const i=Ln(t?t.tag:e.tag),s=t?t.title:e.label,a=[e.id,...this._stack.map(e=>`${e.tag}:${JSON.stringify(e.props??{})}`)].join("/");return U`
      <section class="page" aria-label=${s}>
        ${this._split&&t?U`<button class="back" type="button" @click=${this._back}>‹ ${t.back}</button>`:Y}
        <h1 class="page-heading">${s}</h1>
        ${this.household&&!this.household.available?U`<p class="banner">People and PINs can't be changed until PlanaVista is updated.</p>`:Y}
        ${Kr(a,Hn`
          <${i}
            class="page-el"
            .hass=${this.hass}
            .data=${this.data}
            .household=${this.household}
            .api=${this.api}
            .layout=${this.layout}
            mode="settings"
            .pageProps=${t?.props??{}}
            .drafts=${this.drafts}
          ></${i}>
        `)}
      </section>
    `}async _mayLeave(){const e=this.renderRoot.querySelector(".page-el");return!e?.confirmLeave||e.confirmLeave()}async _select(e){e===this._selected&&0===this._stack.length||await this._mayLeave()&&(this._stack=[],this._selected=e)}}ko.styles=[nt,ot,r`
      :host {
        position: relative;
        display: flex;
        flex-direction: column;
        height: 100%;
        background: var(--pv-card-bg, #FFFFFF);
        color: var(--pv-text, #1A1B1E);
        font-family: var(--pv-font-family, -apple-system, system-ui, sans-serif);
      }

      .bar {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        min-height: 60px;
        padding: 6px 12px 6px 16px;
        border-bottom: 1px solid var(--pv-border-subtle, #E5E7EB);
        flex-shrink: 0;
      }

      .title {
        font-family: var(--pv-font-heading, ui-rounded, 'SF Pro Rounded', 'PlanaVista Rounded', system-ui, sans-serif);
        margin: 0;
        font-size: 1.25rem;
        font-weight: 800;
      }

      .done {
        min-height: 48px;
        min-width: 88px;
      }

      .back {
        display: inline-flex;
        align-items: center;
        min-height: 48px;
        padding: 0 8px;
        border: none;
        background: transparent;
        color: var(--pv-accent-ink, var(--pv-accent, #6366F1));
        font: inherit;
        font-size: 1rem;
        cursor: pointer;
      }

      .body {
        flex: 1;
        min-height: 0;
        display: flex;
      }

      .list {
        box-sizing: border-box;
        width: 100%;
        overflow-y: auto;
        padding: 12px;
      }

      :host([layout='landscape']) .list {
        width: clamp(260px, 30%, 320px);
        flex-shrink: 0;
        border-right: 1px solid var(--pv-border-subtle, #E5E7EB);
      }

      .group {
        margin-bottom: 14px;
      }

      .group-label {
        font-family: var(--pv-font-heading, ui-rounded, 'SF Pro Rounded', 'PlanaVista Rounded', system-ui, sans-serif);
        margin: 8px 12px 4px;
        font-size: 0.8125rem;
        font-weight: 600;
        color: var(--pv-text-secondary, #6B7280);
      }

      .row {
        display: flex;
        align-items: center;
        gap: 8px;
        width: 100%;
        min-height: 56px;
        padding: 8px 12px;
        border: none;
        border-radius: 12px;
        background: transparent;
        color: inherit;
        font: inherit;
        text-align: left;
        cursor: pointer;
      }

      .row:hover {
        background: color-mix(in srgb, var(--pv-text, #1A1B1E) 5%, transparent);
      }

      .row--active,
      .row--active:hover {
        background: color-mix(in srgb, var(--pv-accent, #6366F1) 12%, transparent);
      }

      .row-text {
        flex: 1;
        min-width: 0;
        display: flex;
        flex-direction: column;
        gap: 2px;
      }

      .row-label {
        font-weight: 600;
      }

      .row-value {
        font-size: 0.875rem;
        color: var(--pv-text-secondary, #6B7280);
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .chevron {
        color: var(--pv-text-secondary, #6B7280);
        font-size: 1.25rem;
      }

      .page {
        flex: 1;
        min-width: 0;
        box-sizing: border-box;
        overflow-y: auto;
        padding: 12px 20px 40px;
      }

      .page-heading {
        font-family: var(--pv-font-heading, ui-rounded, 'SF Pro Rounded', 'PlanaVista Rounded', system-ui, sans-serif);
        margin: 6px 0 16px;
        font-size: 1.5rem;
        font-weight: 800;
      }

      .banner {
        margin: 0 0 16px;
        padding: 12px 14px;
        border-radius: 12px;
        background: color-mix(in srgb, #F59E0B 14%, transparent);
      }

      .toast {
        position: absolute;
        left: 16px;
        right: 16px;
        bottom: 20px;
        margin: 0 auto;
        max-width: 480px;
        padding: 12px 16px;
        border-radius: 12px;
        background: var(--pv-text, #1A1B1E);
        color: var(--pv-card-bg, #FFFFFF);
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
        text-align: center;
      }
    `],e([ue({attribute:!1})],ko.prototype,"hass",void 0),e([ue({attribute:!1})],ko.prototype,"data",void 0),e([ue({attribute:!1})],ko.prototype,"household",void 0),e([ue({attribute:!1})],ko.prototype,"api",void 0),e([ue({type:String,reflect:!0})],ko.prototype,"layout",void 0),e([ue({attribute:!1})],ko.prototype,"session",void 0),e([ue({type:Number})],ko.prototype,"sessionEndsAt",void 0),e([ue({attribute:!1})],ko.prototype,"parent",void 0),e([ue({attribute:!1})],ko.prototype,"drafts",void 0),e([me()],ko.prototype,"_selected",void 0),e([me()],ko.prototype,"_stack",void 0),e([me()],ko.prototype,"_toast",void 0),ge("pv-settings",ko);const Fo=["#F94144","#277DA1","#43AA8B","#F9C74F"];class Eo extends le{render(){const e=2*Math.PI*30;return U`
      <div class="rings" aria-hidden="true">
        ${Fo.map(t=>U`
          <svg width=${72} height=${72} viewBox="0 0 ${72} ${72}">
            ${V`
              <circle cx="36" cy="36" r=${30} fill="none" stroke=${t} stroke-width="8" opacity="0.2"></circle>
              <circle cx="36" cy="36" r=${30} fill="none" stroke=${t} stroke-width="8"
                stroke-linecap="round" stroke-dasharray=${e} stroke-dashoffset=${.25*e}></circle>
            `}
          </svg>
        `)}
      </div>
    `}}Eo.styles=r`
    :host {
      display: block;
    }

    .rings {
      display: flex;
      justify-content: center;
      gap: 18px;
      margin: 24px 0 8px;
    }

    svg {
      transform: rotate(-90deg);
    }
  `,ge("pv-setup-welcome",Eo);class Co extends le{constructor(){super(...arguments),this.household=null,this.layout="landscape",this.mode="setup",this._rows=[],this._name="",this._message="",this._built=!1,this._added=0,this._add=()=>{var e,t;this._name.trim()&&(this._rows=[...this._rows,(e=this._name,t=this._added++,{key:`new:${t}`,name:e.trim(),person:null,memberId:null,role:"adult",checked:!0})],this._name="")}}willUpdate(){if(!this._built&&this.hass&&this.household){const e=Object.values(this.hass.states).filter(e=>e.entity_id.startsWith("person.")).map(e=>({entity_id:e.entity_id,name:e.attributes.friendly_name??e.entity_id,user_id:e.attributes.user_id??null})).sort((e,t)=>e.name.localeCompare(t.name));this._rows=function(e,t,i){const s=e.map(e=>({key:e.id,name:e.name,person:e.person,memberId:e.id,role:Ti(e),checked:!0}));for(const a of t){if(e.some(e=>e.person===a.entity_id))continue;const t=!!i&&a.user_id===i;s.push({key:a.entity_id,name:a.name,person:a.entity_id,memberId:null,role:t?"parent":"adult",checked:!0})}return s}(this.household.members,e,this.hass.user?.id??null),this._built=!0}}async commit(){const e=this.household?.members??[],t=function(e,t){const i={add:[],update:[],remove:[]};for(const s of e){const e=s.memberId?t.find(e=>e.id===s.memberId):void 0;e?s.checked?s.role!==Ti(e)&&i.update.push({id:e.id,changes:Bi(s.role)}):i.remove.push(e.id):s.checked&&s.name.trim()&&i.add.push({name:s.name.trim(),...Bi(s.role),...s.person?{person:s.person}:{}})}return i}(this._rows,e);this._message="";try{for(const e of t.remove)await this.api.deleteMember(e);for(const{id:i,changes:s}of t.update){const t=e.find(e=>e.id===i);await this.api.saveMember(s,t?{id:i,rev:t.rev}:void 0)}for(const e of t.add)await this.api.saveMember(e);return!0}catch(e){return this._message=e?.message||Si(fi(e)),!1}finally{this._built=!1,this.requestUpdate()}}render(){return U`
      <ul>
        ${this._rows.map((e,t)=>U`
          <li>
            <label class="check">
              <input type="checkbox" .checked=${e.checked} aria-label="${e.name} lives here"
                @change=${e=>this._update(t,{checked:e.target.checked})} />
            </label>
            <pv-member-avatar
              .member=${{name:e.name,color:this.household?.members.find(t=>t.id===e.memberId)?.color??"#9CA3AF",picture:e.person?{person:!0}:{initial:!0},person:e.person}}
              .hass=${this.hass}
              size="40"
            ></pv-member-avatar>
            <span class="name">${e.name}</span>
            <select class="pv-input pv-select role" aria-label="What ${e.name} is"
              ?disabled=${!e.checked}
              @change=${e=>this._update(t,{role:e.target.value})}>
              ${Mi.map(t=>U`<option value=${t.id} ?selected=${e.role===t.id}>${t.label}</option>`)}
            </select>
          </li>
        `)}
      </ul>
      <div class="add">
        <input class="pv-input" type="text" maxlength="40" placeholder="Someone without Home Assistant"
          aria-label="Name of someone to add"
          .value=${this._name}
          @input=${e=>{this._name=e.target.value}}
          @keydown=${e=>{"Enter"===e.key&&this._add()}} />
        <button class="pv-btn pv-btn-secondary" type="button" ?disabled=${!this._name.trim()} @click=${this._add}>Add someone</button>
      </div>
      ${this._message?U`<p class="message" role="alert">${this._message}</p>`:Y}
    `}_update(e,t){this._rows=this._rows.map((i,s)=>s===e?{...i,...t}:i)}}Co.styles=[nt,ot,ct,r`
      :host {
        display: block;
      }

      ul {
        list-style: none;
        margin: 0 0 20px;
        padding: 0;
      }

      li {
        display: flex;
        align-items: center;
        gap: 12px;
        min-height: 64px;
        border-bottom: 1px solid var(--pv-border-subtle, #E5E7EB);
      }

      .check {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 48px;
        height: 48px;
        cursor: pointer;
      }

      .check input {
        width: 22px;
        height: 22px;
        accent-color: var(--pv-accent, #6366F1);
      }

      .name {
        flex: 1;
        min-width: 0;
        font-weight: 600;
      }

      .role {
        width: auto;
        min-width: 150px;
        min-height: 44px;
      }

      .add {
        display: flex;
        gap: 8px;
      }

      .add input {
        flex: 1;
      }

      .add button {
        min-height: 48px;
      }

      .message {
        margin: 12px 0 0;
        color: var(--pv-danger, #DC2626);
      }
    `],e([ue({attribute:!1})],Co.prototype,"hass",void 0),e([ue({attribute:!1})],Co.prototype,"data",void 0),e([ue({attribute:!1})],Co.prototype,"household",void 0),e([ue({attribute:!1})],Co.prototype,"api",void 0),e([ue({type:String})],Co.prototype,"layout",void 0),e([ue({type:String})],Co.prototype,"mode",void 0),e([me()],Co.prototype,"_rows",void 0),e([me()],Co.prototype,"_name",void 0),e([me()],Co.prototype,"_message",void 0),ge("pv-setup-people",Co);class So extends le{constructor(){super(...arguments),this.household=null,this.layout="landscape",this.mode="setup",this.drafts=new Map}render(){return U`
      <pv-appearance-editor
        .hass=${this.hass}
        .data=${this.data}
        .household=${this.household}
        .api=${this.api}
        .layout=${this.layout}
        .drafts=${this.drafts}
        mode="setup"
      ></pv-appearance-editor>
    `}}function Do(e,t,i){const s={};return"12"===t?.time_format&&(s.time_format="12h"),"24"===t?.time_format&&(s.time_format="24h"),"monday"!==t?.first_weekday&&"sunday"!==t?.first_weekday||(s.first_day=t.first_weekday),!e.weather_entity&&i.length>0&&(s.weather_entity=[...i].sort()[0]),s}So.styles=r`
    :host {
      display: block;
    }
  `,e([ue({attribute:!1})],So.prototype,"hass",void 0),e([ue({attribute:!1})],So.prototype,"data",void 0),e([ue({attribute:!1})],So.prototype,"household",void 0),e([ue({attribute:!1})],So.prototype,"api",void 0),e([ue({type:String})],So.prototype,"layout",void 0),e([ue({type:String})],So.prototype,"mode",void 0),e([ue({attribute:!1})],So.prototype,"drafts",void 0),ge("pv-setup-look",So);class Ao extends le{constructor(){super(...arguments),this.household=null,this.layout="landscape",this.mode="setup",this._message=""}async commit(){this._message="";try{const e=Object.keys(this.hass.states).filter(e=>e.startsWith("weather.")),t=this.hass.locale;return await this.api.saveConfig({display:Do(this.data.display,t,e),onboarding_complete:!0}),await this.api.saveSetup({completed:!0,step:null}),!0}catch(e){return this._message=Si(fi(e)),!1}}render(){return U`
      <ul>
        <li>Tap the gear to change anything later.</li>
        <li>On a shared screen, Settings asks for a parent's PIN.</li>
      </ul>
      ${this._message?U`<p class="message" role="alert">${this._message}</p>`:Y}
    `}}Ao.styles=[nt,r`
      :host {
        display: block;
      }

      ul {
        margin: 8px 0 0;
        padding-left: 22px;
        line-height: 1.6;
        font-size: 1.0625rem;
      }

      li + li {
        margin-top: 8px;
      }

      .message {
        margin: 16px 0 0;
        color: var(--pv-danger, #DC2626);
      }
    `],e([ue({attribute:!1})],Ao.prototype,"hass",void 0),e([ue({attribute:!1})],Ao.prototype,"data",void 0),e([ue({attribute:!1})],Ao.prototype,"household",void 0),e([ue({attribute:!1})],Ao.prototype,"api",void 0),e([ue({type:String})],Ao.prototype,"layout",void 0),e([ue({type:String})],Ao.prototype,"mode",void 0),e([me()],Ao.prototype,"_message",void 0),ge("pv-setup-done",Ao);class zo extends le{constructor(){super(...arguments),this.household=null,this.layout="landscape",this.drafts=new Map,this._index=0,this._busy=!1,this._toast="",this._started=!1,this._next=async()=>{if(this._busy)return;const e=this.renderRoot.querySelector(".step-el");this._busy=!0;try{if(e?.commit&&!await e.commit())return;const t=this._steps();if(this._index>=t.length-1)return void this.dispatchEvent(new CustomEvent("onboarding-complete",{bubbles:!0,composed:!0}));this._index+=1,this._remember(t[this._index].id)}finally{this._busy=!1}},this._back=()=>{0===this._index||this._busy||(this._index-=1,this._remember(this._steps()[this._index].id))}}disconnectedCallback(){super.disconnectedCallback(),window.clearTimeout(this._toastTimer)}willUpdate(){!this._started&&this.data&&(this._index=function(e,t){const i=t?e.findIndex(e=>e.id===t):-1;return i>=0?i:0}(this._steps(),this.household?.setup.step??null),this._started=!0)}_steps(){return Gi.pages({household:this.household,data:this.data})}render(){const e=this._steps();if(0===e.length)return Y;const t=Math.min(this._index,e.length-1),i=e[t],s=t===e.length-1,a=Ln(i.tag);return U`
      <div class="top">
        <button class="back ${0===t?"hidden":""}" type="button"
          ?disabled=${0===t||this._busy}
          aria-hidden=${0===t?"true":"false"}
          @click=${this._back}>‹ Back</button>
        <div class="progress-dots" role="img" aria-label="Step ${t+1} of ${e.length}">
          ${e.map((e,i)=>U`<div class="dot ${i===t?"dot--active":""}"></div>`)}
        </div>
        <span></span>
      </div>
      <div class="content">
        <div class="column">
          <h1 class="heading">${i.heading}</h1>
          ${i.lead?U`<p class="lead">${i.lead}</p>`:Y}
          ${Kr(i.id,Hn`
            <${a}
              class="step-el"
              .hass=${this.hass}
              .data=${this.data}
              .household=${this.household}
              .api=${this.api}
              .layout=${this.layout}
              .drafts=${this.drafts}
              mode="setup"
            ></${a}>
          `)}
        </div>
      </div>
      <div class="bottom">
        <button class="pv-btn pv-btn-primary main" type="button" ?disabled=${this._busy} @click=${this._next}>
          ${i.primary??(s?"Finish":"Next")}
        </button>
      </div>
      ${this._toast?U`<div class="toast" role="status">${this._toast}</div>`:Y}
    `}_remember(e){this.api.saveSetup({step:e}).catch(e=>{this._toast=Si(fi(e)),window.clearTimeout(this._toastTimer),this._toastTimer=window.setTimeout(()=>{this._toast=""},4e3)})}}zo.styles=[nt,ot,r`
      :host {
        position: relative;
        display: flex;
        flex-direction: column;
        height: 100%;
        background: var(--pv-card-bg, #FFFFFF);
        color: var(--pv-text, #1A1B1E);
        font-family: var(--pv-font-family, -apple-system, system-ui, sans-serif);
      }

      .top {
        display: grid;
        grid-template-columns: 1fr auto 1fr;
        align-items: center;
        min-height: 56px;
        padding: 4px 12px;
        flex-shrink: 0;
      }

      .back {
        justify-self: start;
        display: inline-flex;
        align-items: center;
        min-height: 48px;
        padding: 0 8px;
        border: none;
        background: transparent;
        color: var(--pv-accent-ink, var(--pv-accent, #6366F1));
        font: inherit;
        font-size: 1rem;
        cursor: pointer;
      }

      .back.hidden {
        visibility: hidden;
      }

      .content {
        flex: 1;
        min-height: 0;
        overflow-y: auto;
        padding: 8px 20px 24px;
      }

      .column {
        max-width: 640px;
        margin: 0 auto;
      }

      .heading {
        font-family: var(--pv-font-heading, ui-rounded, 'SF Pro Rounded', 'PlanaVista Rounded', system-ui, sans-serif);
        margin: 8px 0 8px;
        font-size: 2rem;
        font-weight: 800;
        letter-spacing: -0.02em;
        line-height: 1.2;
      }

      .lead {
        margin: 0 0 24px;
        color: var(--pv-text-secondary, #6B7280);
        font-size: 1.0625rem;
        line-height: 1.5;
      }

      .bottom {
        display: flex;
        justify-content: center;
        padding: 12px 20px calc(16px + env(safe-area-inset-bottom, 0px));
        border-top: 1px solid var(--pv-border-subtle, #E5E7EB);
        flex-shrink: 0;
      }

      .main {
        width: min(640px, 100%);
        min-height: 52px;
        font-size: 1.0625rem;
      }

      .toast {
        position: absolute;
        left: 16px;
        right: 16px;
        bottom: 92px;
        margin: 0 auto;
        max-width: 480px;
        padding: 12px 16px;
        border-radius: 12px;
        background: var(--pv-text, #1A1B1E);
        color: var(--pv-card-bg, #FFFFFF);
        text-align: center;
      }

      .progress-dots {
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: var(--pv-border-subtle, #E5E7EB);
        transition: background var(--pv-transition, 200ms ease),
                    transform var(--pv-transition, 200ms ease);
      }

      .dot--active {
        background: var(--pv-accent, #6366F1);
        transform: scale(1.25);
      }
    `],e([ue({attribute:!1})],zo.prototype,"hass",void 0),e([ue({attribute:!1})],zo.prototype,"data",void 0),e([ue({attribute:!1})],zo.prototype,"household",void 0),e([ue({attribute:!1})],zo.prototype,"api",void 0),e([ue({type:String,reflect:!0})],zo.prototype,"layout",void 0),e([ue({attribute:!1})],zo.prototype,"drafts",void 0),e([me()],zo.prototype,"_index",void 0),e([me()],zo.prototype,"_busy",void 0),e([me()],zo.prototype,"_toast",void 0),ge("pv-setup",zo);const Mo="sensor.planavista_config";class To extends le{constructor(){super(),this._wizardOpen=!1,this._onboardingDone=!1,this._settingsOpen=!1,this._sheet=null,this._sheetOpener=null,this._drafts=new Map,this._settingsVia=null,this._views={},this._moduleId=null,this._openTarget=null,this._serviceRevision=0,this._household=new Dr(this),this._session=new Or(this,()=>this._api),this._layout=new Tr(this),this._forecast=new Ar(this,()=>this._display().weather_entity),this._appearanceEdits=new qn(()=>this.requestUpdate()),this._moduleOverlay=!1,this._appearance=new kr(this,this._appearanceEdits,()=>({display:this.hass?.states?.[this._entityId()]?.attributes?.display,cardTheme:this._config?.theme,sun:Un(this.hass?.states),haDark:!!this.hass?.themes?.darkMode,overlayOpen:!!this._sheet||this._settingsOpen||this._wizardOpen||this._moduleOverlay}),async()=>{await this.updateComplete,await(this.renderRoot.querySelector(".pv-module")?.updateComplete)}),this._api=new ki({callWS:e=>this.hass.callWS(e)},()=>this._session.token,e=>this._session.ended(e)),this._services={},this._pinGate={ask:(e,t)=>new Promise(i=>{0===e.length||this._sheet?i(!1):(this._sheetOpener=this.renderRoot?.activeElement??null,this._sheet={kind:"pin",purpose:"module",heading:t,members:e,resolve:i})})},this._dataFor=vt((e,t)=>this.hass?function(e,t="sensor.planavista_config"){const i=e.states[t];if(!i)return null;const s=i.attributes,a=s.events||[];return{calendars:s.calendars||[],events:a,display:s.display||{time_format:"12h",weather_entity:"",first_day:"sunday",default_view:"day",theme:"light"},onboarding_complete:s.onboarding_complete,version:s.version}}(this.hass,t):null),this._displayFor=vt((e,t)=>function(e,t){const i=t?.display;return{time_format:e?.time_format||i?.time_format||"12h",weather_entity:e?.weather_entity||i?.weather_entity||"",first_day:e?.first_day||i?.first_day||"sunday",default_view:e?.default_view||e?.view||i?.default_view||"week",theme:e?.theme||i?.theme||"light",theme_overrides:i?.theme_overrides,location_autocomplete:!0===i?.location_autocomplete}}(e,t)),this._modulesFor=vt((e,t,i)=>function(e,t,i={config:void 0,data:null}){const s=e.filter(e=>!e.enabled||e.enabled(i));let a=s;if(Array.isArray(t.modules)){const e=[];for(const i of t.modules){const t="string"==typeof i?s.find(e=>e.id===i):void 0;t&&!e.includes(t)&&e.push(t)}e.length>0&&(a=e)}const n="string"==typeof t.module?a.find(e=>e.id===t.module):void 0;return{shown:a,initial:n??a[0]}}(Wi.list(),e??{},{config:e,data:null,household:this._household.view})),this._drafts.set("appearance",this._appearanceEdits);for(const e of Wi.list())e.service&&(this._services[e.id]=e.service(this))}get householdView(){return this._household.view}get pinSession(){return this._session.session}get planavistaData(){return this._data()}sessionEnded(e){this._session.ended(e)}serviceChanged(){this._serviceRevision++}shouldUpdate(e){if(1===e.size&&e.has("hass")){const t=e.get("hass"),i=e=>!!e?.themes?.darkMode;return!(!Vn(this._appearance.settings).haDarkMode||i(t)===i(this.hass))||function(e,t,i){return e&&t?i.some(i=>e.states[i]!==t.states[i]):e!==t}(t,this.hass,this._watchedEntityIds())}return!0}_entityId(){return this._config?.entity||Mo}_data(){const e=this._entityId();return this._dataFor(this.hass?.states?.[e],e)}_display(){return this._displayFor(this._config,this._data())}_modules(){const e=this._household.view;return this._modulesFor(this._config,e?.modules,!!e?.available)}_ctx(){return{config:this._config,data:this._data(),household:this._household.view}}_glanceChips(){const e=this._ctx();return Object.values(this._services).flatMap(t=>t.glance?.(e)??[])}_open(e){const t=this._modules().shown.find(t=>t.id===e.module);t&&(this._moduleId=t.id,e.view&&t.views.some(t=>t.id===e.view)&&(this._views={...this._views,[t.id]:e.view}),this._openTarget={...e})}_moduleAction(e){this.renderRoot.querySelector(".pv-module")?.moduleAction?.(e)}_watchedEntityIds(){const e=this._data(),t=[this._entityId(),...Vn(this._appearance.settings).entities],i=this._display().weather_entity;i&&t.push(i);for(const i of this._modules().shown)t.push(...i.watchedEntities({config:this._config,data:e}));return t}setConfig(e){this._config={entity:Mo,...e},this._views={},this._moduleId=null}_activeModule(){const e=this._modules();return e.shown.find(e=>e.id===this._moduleId)??e.initial}willUpdate(e){super.willUpdate(e);const t=this._activeModule(),i=this._data();t&&i&&!(t.id in this._views)&&(this._views={...this._views,[t.id]:Ui(t,{config:this._config,data:i})})}_setView(e){const t=this._activeModule();t&&this._views[t.id]!==e&&(this._views={...this._views,[t.id]:e})}connectedCallback(){super.connectedCallback(),function(e=document,t=import.meta.url){if(e.getElementById(vr))return;const i=e.createElement("style");i.id=vr,i.textContent=`@font-face{font-family:'PlanaVista Rounded';src:url('${function(e){const t=new URL(e),i=new URL("fonts/nunito-latin-wght.woff2",t);return i.search=t.search,i.href}(t)}') format('woff2');font-weight:200 1000;font-style:normal;font-display:swap}`,e.head.appendChild(i)}()}updated(e){super.updated(e),this._guardSettings()}_onOnboardingComplete(){this._wizardOpen=!1,this._onboardingDone=!0}_access(){const e=!!this.hass?.user?.is_admin;return this._household.ready?function(e,t){return e&&e.available?e.account.parent_level?"open":"shared"===e.account.kind||"other"===e.account.kind?Ri(e.members).length>0?"pin":"no_pin":"none":t?"open":"none"}(this._household.view,e):e?"open":"none"}_openSettings(e){this._sheetOpener=e?.composedPath?.()[0]??null;const t=this._access();"open"===t||this._session.session?.parent?(this._settingsVia="open"===t?"access":"session",this._settingsOpen=!0):"pin"===t?this._sheet={kind:"pin",purpose:"settings",heading:"Who's opening Settings?"}:"no_pin"===t&&(this._sheet={kind:"no_pin"})}_beginSetup(e){this._sheetOpener=e?.composedPath?.()[0]??null,"open"===this._access()||this._session.session?.parent?this._wizardOpen=!0:"pin"===this._access()&&(this._sheet={kind:"pin",purpose:"setup",heading:"Who's setting up PlanaVista?"})}_renderSetupCard(){const e=this._access(),t=U`
      <div class="pvc-setup-icon" aria-hidden="true">
        <svg viewBox="0 0 24 24" width="48" height="48" fill="currentColor">
          <path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V9h14v11zM9 14H7v-2h2v2zm4 0h-2v-2h2v2zm4 0h-2v-2h2v2zm-8 4H7v-2h2v2zm4 0h-2v-2h2v2zm4 0h-2v-2h2v2z"/>
        </svg>
      </div>
    `;return"open"!==e&&"pin"!==e?U`
        <div class="pvc-setup-pending">
          ${t}
          <p class="pvc-setup-title">PlanaVista isn't set up yet</p>
          <p class="pvc-setup-hint">An admin can set it up from their own Home Assistant login.</p>
        </div>
      `:U`
      <div class="pvc-setup-pending"
        role="button"
        tabindex="0"
        aria-label="Begin PlanaVista setup"
        @click=${this._beginSetup}
        @keydown=${e=>{"Enter"!==e.key&&" "!==e.key||(e.preventDefault(),this._beginSetup(e))}}
      >
        ${t}
        <p class="pvc-setup-title">PlanaVista</p>
        <p class="pvc-setup-hint">Tap to begin setup</p>
      </div>
    `}_onUnlocked(e){const t=this._sheet;this._session.unlocked(e.detail.result),this._closeSheet(),"pin"!==t?.kind||"module"!==t.purpose?("pin"!==t?.kind||"settings"!==t.purpose&&"continue"!==t.purpose||(this._settingsVia="session",this._settingsOpen=!0),"pin"===t?.kind&&"setup"===t.purpose&&(this._wizardOpen=!0)):t.resolve(!!this._session.session)}_onSheetCancel(){const e=this._sheet;this._closeSheet(),"pin"===e?.kind&&"module"===e.purpose&&e.resolve(!1),"pin"===e?.kind&&"continue"===e.purpose&&this._onSettingsClose()}_guardSettings(){if(!this._settingsOpen||this._session.session?.parent||this._sheet)return;const e=this._access();"open"!==e&&("access"!==this._settingsVia||"pin"!==e?this._onSettingsClose():this._sheet={kind:"pin",purpose:"continue",heading:"Enter a parent's PIN to keep changing settings"})}_closeSheet(){this._sheet=null;const e=this._sheetOpener;this._sheetOpener=null,e?.focus?.()}_renderSheet(){const e=this._sheet;if(!e)return Y;const t=this._layout.layout;if("no_pin"===e.kind)return U`
        <pv-notice-sheet
          .layout=${t}
          heading="Settings needs a parent's PIN"
          body="On a shared screen, a parent opens Settings with their PIN, and no parent has one yet. Sign in to Home Assistant with a parent's or an admin's own account, then set one in Settings, PINs and parent mode."
          .actions=${[{id:"ok",label:"OK",kind:"primary"}]}
          @pv-sheet-action=${this._closeSheet}
        ></pv-notice-sheet>
      `;const i=this._household.view;return U`
      <pv-pin-sheet
        .hass=${this.hass}
        .api=${this._api}
        .layout=${t}
        mode="unlock"
        .members=${"module"===e.purpose?e.members:i?Ri(i.members):[]}
        .heading=${e.heading}
        .shuffle=${!!i?.security.shuffle_keypad}
        @pv-unlocked=${this._onUnlocked}
        @pv-sheet-close=${this._onSheetCancel}
      ></pv-pin-sheet>
    `}_renderParentStrip(){const e=this._session.session;if(!e?.parent)return Y;const t=this._household.view?.members.find(t=>t.id===e.memberId);if(!t)return Y;const i=this._activeModule(),s=i?this._services[i.id]?.stripActions?.(this._ctx())??[]:[];return U`
      <pv-parent-strip
        .member=${t}
        .hass=${this.hass}
        .endsAt=${this._session.endsAt??0}
        .actions=${s}
        @pv-lock=${()=>this._session.lock()}
        @pv-strip-action=${e=>this._moduleAction(e.detail.id)}
      ></pv-parent-strip>
    `}_onSettingsClose(){this._settingsOpen=!1,this._settingsVia=null}_onSettingsLock(){this._session.lock(),"open"!==this._access()&&this._onSettingsClose()}_getWeatherEntity(){const e=this._display().weather_entity;return e?this.hass?.states?.[e]:null}render(){if(!this._config||!this.hass)return Y;const e=this._data();if(!e)return U`
        <ha-card>
          <div class="pvc-empty">
            <p>PlanaVista entity not found</p>
            <p style="font-size: 0.8rem;">Check that the PlanaVista integration is configured.</p>
          </div>
        </ha-card>
      `;if(!1===e.onboarding_complete&&!this._onboardingDone)return U`
        <ha-card>
          ${this._wizardOpen?U`
            <pv-setup
              .hass=${this.hass}
              .data=${e}
              .household=${this._household.view}
              .api=${this._api}
              .layout=${this._layout.layout}
              .drafts=${this._drafts}
              @onboarding-complete=${this._onOnboardingComplete}
            ></pv-setup>
          `:this._renderSetupCard()}
          ${this._renderSheet()}
        </ha-card>
      `;const t=this._display(),i=this._activeModule();return U`
      <ha-card>
        ${this._renderParentStrip()}
        ${this._config.hide_header?Y:this._renderHeader(t)}
        ${i?this._renderModule(i,e,t):Y}
        ${i?this._renderBar(i):Y}
        ${this._settingsOpen?U`
          <div class="pvc-settings-overlay">
            <pv-settings
              .hass=${this.hass}
              .data=${e}
              .household=${this._household.view}
              .api=${this._api}
              .layout=${this._layout.layout}
              .session=${this._session.session}
              .sessionEndsAt=${this._session.endsAt??0}
              .parent=${this._household.view?.members.find(e=>e.id===this._session.session?.memberId)??null}
              .drafts=${this._drafts}
              @pv-settings-close=${this._onSettingsClose}
              @pv-lock=${this._onSettingsLock}
            ></pv-settings>
          </div>
        `:Y}
        ${this._renderSheet()}
      </ha-card>
    `}_renderModule(e,t,i){const s=Ln(e.tag);return Hn`
      <${s}
        class="pv-module"
        layout=${this._layout.layout}
        .hass=${this.hass}
        .cardConfig=${this._config}
        .data=${t}
        .display=${i}
        .view=${this._views[e.id]}
        .mode=${this._appearance.mode}
        .shape=${this._appearance.look.shape}
        .forecast=${this._forecast.forecast}
        .household=${this._household.view}
        .session=${this._session.session}
        .sessionEndsAt=${this._session.endsAt??0}
        .services=${this._services}
        .revision=${this._serviceRevision}
        .pinGate=${this._pinGate}
        .openTarget=${this._openTarget}
        @pv-view-change=${e=>this._setView(e.detail.view)}
        @pv-overlay-change=${e=>{this._moduleOverlay=e.detail.open}}
        @pv-open=${e=>this._open(e.detail)}
      ></${s}>
    `}_renderHeader(e){const t=this._config?.hide_weather?null:this._getWeatherEntity();return U`
      <pv-glance-header
        layout=${this._layout.layout}
        .timeFormat=${e.time_format||"12h"}
        .weather=${t??null}
        .weatherEntity=${e.weather_entity}
        .today=${function(e){const t=Ee(new Date),i=e.find(e=>e.datetime&&Ee(xe(e.datetime))===t);return i&&"number"==typeof i.temperature?{high:Math.round(i.temperature),low:"number"==typeof i.templow?Math.round(i.templow):null}:null}(this._forecast.forecast)}
        .chips=${this._glanceChips()}
        @pv-open=${e=>this._open(e.detail)}
      ></pv-glance-header>
    `}_renderBar(e){return U`
      <pv-nav-bar
        layout=${this._layout.layout}
        .modules=${this._modules().shown.map(e=>({id:e.id,label:e.label,icon:e.icon}))}
        .activeModule=${e.id}
        .views=${e.views}
        .activeView=${this._views[e.id]??""}
        .canOpenSettings=${"none"!==this._access()}
        .actions=${this._services[e.id]?.barActions?.(this._ctx())??[]}
        @pv-module-action=${e=>this._moduleAction(e.detail.id)}
        @pv-module-select=${e=>{this._moduleId=e.detail.id}}
        @pv-view-select=${e=>this._setView(e.detail.id)}
        @pv-open-settings=${this._openSettings}
      ></pv-nav-bar>
    `}static getConfigElement(){return document.createElement("planavista-calendar-card-editor")}static getStubConfig(){return{entity:Mo}}getCardSize(){return 10}}var Bo;To.styles=[nt,ot,rt,ht,r`
      :host {
        display: block;
        height: calc(100vh - var(--header-height, 56px));
        overflow: hidden;
        font-family: var(--pv-font-family);
        color: var(--pv-text);
      }

      ha-card {
        display: flex;
        flex-direction: column;
        overflow: hidden;
        height: 100%;
        background: var(--pv-card-bg);
        border-radius: var(--pv-radius-lg);
        box-shadow: var(--pv-shadow);
        /* Header type scales with the card, not the window (spec 12.1). */
        container-type: inline-size;
      }

      /* One header, module, and bar in every layout; only their order changes,
         so turning a tablet never rebuilds the module (spec 12.1). */
      pv-glance-header {
        order: 1;
        flex-shrink: 0;
      }

      .pv-module {
        order: 3;
        flex: 1 1 auto;
        min-height: 0;
      }

      pv-nav-bar {
        order: 4;
        flex-shrink: 0;
      }

      :host([layout='landscape']) pv-nav-bar {
        order: 2;
      }

/* Empty state */

      .pvc-empty {
        padding: 2rem;
        text-align: center;
        color: var(--pv-text-muted);
      }

/* Setup-pending placeholder shown in card editor preview */

      .pvc-setup-pending {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 3rem 2rem;
        text-align: center;
        gap: 0.5rem;
        cursor: pointer;
        outline: none;
      }

      .pvc-setup-pending:focus-visible {
        outline: 2px solid var(--pv-accent, #6366F1);
        outline-offset: 4px;
      }

      .pvc-setup-icon {
        color: var(--pv-accent-ink, var(--pv-accent, #6366F1));
        opacity: 0.8;
        margin-bottom: 0.5rem;
      }

      .pvc-setup-title {
        font-size: 1rem;
        font-weight: 600;
        color: var(--pv-text, #1A1B1E);
        margin: 0;
      }

      .pvc-setup-hint {
        font-size: 0.8125rem;
        color: var(--pv-text-secondary, #6B7280);
        margin: 0;
        max-width: 260px;
        line-height: 1.5;
      }

/* Settings overlay */

      .pvc-settings-overlay {
        position: absolute;
        inset: 0;
        z-index: 50;
        background: var(--pv-card-bg, #FFFFFF);
        animation: pv-fadeIn 200ms ease forwards;
      }

      @keyframes pv-fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }

    `],e([ue({attribute:!1})],To.prototype,"hass",void 0),e([me()],To.prototype,"_config",void 0),e([me()],To.prototype,"_wizardOpen",void 0),e([me()],To.prototype,"_onboardingDone",void 0),e([me()],To.prototype,"_settingsOpen",void 0),e([me()],To.prototype,"_sheet",void 0),e([me()],To.prototype,"_views",void 0),e([me()],To.prototype,"_moduleId",void 0),e([me()],To.prototype,"_openTarget",void 0),e([me()],To.prototype,"_serviceRevision",void 0),e([me()],To.prototype,"_moduleOverlay",void 0),function(e=Xi,t=Gi){for(const t of Cr)e.register(t);for(const e of Sr)t.register(e)}(),ge("planavista-calendar-card",To),Bo=To,be(()=>ye("planavista-card",class extends(customElements.get("planavista-calendar-card")??Bo){}));const Po=["planavista-calendar-card","planavista-card"];var Oo;window.customCards=window.customCards||[],(Oo=window.customCards).some(e=>Po.includes(e.type))||Oo.push({type:"planavista-calendar-card",name:"PlanaVista",description:"All-in-one calendar with clock, weather, toggles, and views",preview:!0}),console.info(`%c PLANAVISTA %c v${Fr} `,"color: white; background: #6366F1; font-weight: bold; border-radius: 4px 0 0 4px; padding: 2px 6px;","color: #6366F1; background: #EEF2FF; font-weight: bold; border-radius: 0 4px 4px 0; padding: 2px 6px;");
