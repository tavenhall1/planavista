function e(e,t,i,s){var r,a=arguments.length,o=a<3?t:null===s?s=Object.getOwnPropertyDescriptor(t,i):s;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)o=Reflect.decorate(e,t,i,s);else for(var n=e.length-1;n>=0;n--)(r=e[n])&&(o=(a<3?r(o):a>3?r(t,i,o):r(t,i))||o);return a>3&&o&&Object.defineProperty(t,i,o),o}"function"==typeof SuppressedError&&SuppressedError;const t=globalThis,i=t.ShadowRoot&&(void 0===t.ShadyCSS||t.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,s=Symbol(),r=new WeakMap;let a=class{constructor(e,t,i){if(this._$cssResult$=!0,i!==s)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=e,this.t=t}get styleSheet(){let e=this.o;const t=this.t;if(i&&void 0===e){const i=void 0!==t&&1===t.length;i&&(e=r.get(t)),void 0===e&&((this.o=e=new CSSStyleSheet).replaceSync(this.cssText),i&&r.set(t,e))}return e}toString(){return this.cssText}};const o=(e,...t)=>{const i=1===e.length?e[0]:t.reduce((t,i,s)=>t+(e=>{if(!0===e._$cssResult$)return e.cssText;if("number"==typeof e)return e;throw Error("Value passed to 'css' function must be a 'css' function result: "+e+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(i)+e[s+1],e[0]);return new a(i,e,s)},n=i?e=>e:e=>e instanceof CSSStyleSheet?(e=>{let t="";for(const i of e.cssRules)t+=i.cssText;return(e=>new a("string"==typeof e?e:e+"",void 0,s))(t)})(e):e,{is:l,defineProperty:d,getOwnPropertyDescriptor:c,getOwnPropertyNames:p,getOwnPropertySymbols:h,getPrototypeOf:v}=Object,u=globalThis,m=u.trustedTypes,g=m?m.emptyScript:"",y=u.reactiveElementPolyfillSupport,b=(e,t)=>e,f={toAttribute(e,t){switch(t){case Boolean:e=e?g:null;break;case Object:case Array:e=null==e?e:JSON.stringify(e)}return e},fromAttribute(e,t){let i=e;switch(t){case Boolean:i=null!==e;break;case Number:i=null===e?null:Number(e);break;case Object:case Array:try{i=JSON.parse(e)}catch(e){i=null}}return i}},_=(e,t)=>!l(e,t),x={attribute:!0,type:String,converter:f,reflect:!1,useDefault:!1,hasChanged:_};Symbol.metadata??=Symbol("metadata"),u.litPropertyMetadata??=new WeakMap;let w=class extends HTMLElement{static addInitializer(e){this._$Ei(),(this.l??=[]).push(e)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(e,t=x){if(t.state&&(t.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(e)&&((t=Object.create(t)).wrapped=!0),this.elementProperties.set(e,t),!t.noAccessor){const i=Symbol(),s=this.getPropertyDescriptor(e,i,t);void 0!==s&&d(this.prototype,e,s)}}static getPropertyDescriptor(e,t,i){const{get:s,set:r}=c(this.prototype,e)??{get(){return this[t]},set(e){this[t]=e}};return{get:s,set(t){const a=s?.call(this);r?.call(this,t),this.requestUpdate(e,a,i)},configurable:!0,enumerable:!0}}static getPropertyOptions(e){return this.elementProperties.get(e)??x}static _$Ei(){if(this.hasOwnProperty(b("elementProperties")))return;const e=v(this);e.finalize(),void 0!==e.l&&(this.l=[...e.l]),this.elementProperties=new Map(e.elementProperties)}static finalize(){if(this.hasOwnProperty(b("finalized")))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(b("properties"))){const e=this.properties,t=[...p(e),...h(e)];for(const i of t)this.createProperty(i,e[i])}const e=this[Symbol.metadata];if(null!==e){const t=litPropertyMetadata.get(e);if(void 0!==t)for(const[e,i]of t)this.elementProperties.set(e,i)}this._$Eh=new Map;for(const[e,t]of this.elementProperties){const i=this._$Eu(e,t);void 0!==i&&this._$Eh.set(i,e)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(e){const t=[];if(Array.isArray(e)){const i=new Set(e.flat(1/0).reverse());for(const e of i)t.unshift(n(e))}else void 0!==e&&t.push(n(e));return t}static _$Eu(e,t){const i=t.attribute;return!1===i?void 0:"string"==typeof i?i:"string"==typeof e?e.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){this._$ES=new Promise(e=>this.enableUpdating=e),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach(e=>e(this))}addController(e){(this._$EO??=new Set).add(e),void 0!==this.renderRoot&&this.isConnected&&e.hostConnected?.()}removeController(e){this._$EO?.delete(e)}_$E_(){const e=new Map,t=this.constructor.elementProperties;for(const i of t.keys())this.hasOwnProperty(i)&&(e.set(i,this[i]),delete this[i]);e.size>0&&(this._$Ep=e)}createRenderRoot(){const e=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return((e,s)=>{if(i)e.adoptedStyleSheets=s.map(e=>e instanceof CSSStyleSheet?e:e.styleSheet);else for(const i of s){const s=document.createElement("style"),r=t.litNonce;void 0!==r&&s.setAttribute("nonce",r),s.textContent=i.cssText,e.appendChild(s)}})(e,this.constructor.elementStyles),e}connectedCallback(){this.renderRoot??=this.createRenderRoot(),this.enableUpdating(!0),this._$EO?.forEach(e=>e.hostConnected?.())}enableUpdating(e){}disconnectedCallback(){this._$EO?.forEach(e=>e.hostDisconnected?.())}attributeChangedCallback(e,t,i){this._$AK(e,i)}_$ET(e,t){const i=this.constructor.elementProperties.get(e),s=this.constructor._$Eu(e,i);if(void 0!==s&&!0===i.reflect){const r=(void 0!==i.converter?.toAttribute?i.converter:f).toAttribute(t,i.type);this._$Em=e,null==r?this.removeAttribute(s):this.setAttribute(s,r),this._$Em=null}}_$AK(e,t){const i=this.constructor,s=i._$Eh.get(e);if(void 0!==s&&this._$Em!==s){const e=i.getPropertyOptions(s),r="function"==typeof e.converter?{fromAttribute:e.converter}:void 0!==e.converter?.fromAttribute?e.converter:f;this._$Em=s;const a=r.fromAttribute(t,e.type);this[s]=a??this._$Ej?.get(s)??a,this._$Em=null}}requestUpdate(e,t,i,s=!1,r){if(void 0!==e){const a=this.constructor;if(!1===s&&(r=this[e]),i??=a.getPropertyOptions(e),!((i.hasChanged??_)(r,t)||i.useDefault&&i.reflect&&r===this._$Ej?.get(e)&&!this.hasAttribute(a._$Eu(e,i))))return;this.C(e,t,i)}!1===this.isUpdatePending&&(this._$ES=this._$EP())}C(e,t,{useDefault:i,reflect:s,wrapped:r},a){i&&!(this._$Ej??=new Map).has(e)&&(this._$Ej.set(e,a??t??this[e]),!0!==r||void 0!==a)||(this._$AL.has(e)||(this.hasUpdated||i||(t=void 0),this._$AL.set(e,t)),!0===s&&this._$Em!==e&&(this._$Eq??=new Set).add(e))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(e){Promise.reject(e)}const e=this.scheduleUpdate();return null!=e&&await e,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??=this.createRenderRoot(),this._$Ep){for(const[e,t]of this._$Ep)this[e]=t;this._$Ep=void 0}const e=this.constructor.elementProperties;if(e.size>0)for(const[t,i]of e){const{wrapped:e}=i,s=this[t];!0!==e||this._$AL.has(t)||void 0===s||this.C(t,void 0,i,s)}}let e=!1;const t=this._$AL;try{e=this.shouldUpdate(t),e?(this.willUpdate(t),this._$EO?.forEach(e=>e.hostUpdate?.()),this.update(t)):this._$EM()}catch(t){throw e=!1,this._$EM(),t}e&&this._$AE(t)}willUpdate(e){}_$AE(e){this._$EO?.forEach(e=>e.hostUpdated?.()),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(e)),this.updated(e)}_$EM(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(e){return!0}update(e){this._$Eq&&=this._$Eq.forEach(e=>this._$ET(e,this[e])),this._$EM()}updated(e){}firstUpdated(e){}};w.elementStyles=[],w.shadowRootOptions={mode:"open"},w[b("elementProperties")]=new Map,w[b("finalized")]=new Map,y?.({ReactiveElement:w}),(u.reactiveElementVersions??=[]).push("2.1.2");const $=globalThis,k=e=>e,F=$.trustedTypes,C=F?F.createPolicy("lit-html",{createHTML:e=>e}):void 0,E="$lit$",D=`lit$${Math.random().toFixed(9).slice(2)}$`,S="?"+D,z=`<${S}>`,A=document,T=()=>A.createComment(""),P=e=>null===e||"object"!=typeof e&&"function"!=typeof e,B=Array.isArray,M="[ \t\n\f\r]",O=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,I=/-->/g,L=/>/g,H=RegExp(`>|${M}(?:([^\\s"'>=/]+)(${M}*=${M}*(?:[^ \t\n\f\r"'\`<>=]|("|')|))|$)`,"g"),N=/'/g,j=/"/g,U=/^(?:script|style|textarea|title)$/i,R=e=>(t,...i)=>({_$litType$:e,strings:t,values:i}),V=R(1),W=R(2),Y=Symbol.for("lit-noChange"),q=Symbol.for("lit-nothing"),K=new WeakMap,G=A.createTreeWalker(A,129);function X(e,t){if(!B(e)||!e.hasOwnProperty("raw"))throw Error("invalid template strings array");return void 0!==C?C.createHTML(t):t}const Q=(e,t)=>{const i=e.length-1,s=[];let r,a=2===t?"<svg>":3===t?"<math>":"",o=O;for(let t=0;t<i;t++){const i=e[t];let n,l,d=-1,c=0;for(;c<i.length&&(o.lastIndex=c,l=o.exec(i),null!==l);)c=o.lastIndex,o===O?"!--"===l[1]?o=I:void 0!==l[1]?o=L:void 0!==l[2]?(U.test(l[2])&&(r=RegExp("</"+l[2],"g")),o=H):void 0!==l[3]&&(o=H):o===H?">"===l[0]?(o=r??O,d=-1):void 0===l[1]?d=-2:(d=o.lastIndex-l[2].length,n=l[1],o=void 0===l[3]?H:'"'===l[3]?j:N):o===j||o===N?o=H:o===I||o===L?o=O:(o=H,r=void 0);const p=o===H&&e[t+1].startsWith("/>")?" ":"";a+=o===O?i+z:d>=0?(s.push(n),i.slice(0,d)+E+i.slice(d)+D+p):i+D+(-2===d?t:p)}return[X(e,a+(e[i]||"<?>")+(2===t?"</svg>":3===t?"</math>":"")),s]};class Z{constructor({strings:e,_$litType$:t},i){let s;this.parts=[];let r=0,a=0;const o=e.length-1,n=this.parts,[l,d]=Q(e,t);if(this.el=Z.createElement(l,i),G.currentNode=this.el.content,2===t||3===t){const e=this.el.content.firstChild;e.replaceWith(...e.childNodes)}for(;null!==(s=G.nextNode())&&n.length<o;){if(1===s.nodeType){if(s.hasAttributes())for(const e of s.getAttributeNames())if(e.endsWith(E)){const t=d[a++],i=s.getAttribute(e).split(D),o=/([.?@])?(.*)/.exec(t);n.push({type:1,index:r,name:o[2],strings:i,ctor:"."===o[1]?se:"?"===o[1]?re:"@"===o[1]?ae:ie}),s.removeAttribute(e)}else e.startsWith(D)&&(n.push({type:6,index:r}),s.removeAttribute(e));if(U.test(s.tagName)){const e=s.textContent.split(D),t=e.length-1;if(t>0){s.textContent=F?F.emptyScript:"";for(let i=0;i<t;i++)s.append(e[i],T()),G.nextNode(),n.push({type:2,index:++r});s.append(e[t],T())}}}else if(8===s.nodeType)if(s.data===S)n.push({type:2,index:r});else{let e=-1;for(;-1!==(e=s.data.indexOf(D,e+1));)n.push({type:7,index:r}),e+=D.length-1}r++}}static createElement(e,t){const i=A.createElement("template");return i.innerHTML=e,i}}function J(e,t,i=e,s){if(t===Y)return t;let r=void 0!==s?i._$Co?.[s]:i._$Cl;const a=P(t)?void 0:t._$litDirective$;return r?.constructor!==a&&(r?._$AO?.(!1),void 0===a?r=void 0:(r=new a(e),r._$AT(e,i,s)),void 0!==s?(i._$Co??=[])[s]=r:i._$Cl=r),void 0!==r&&(t=J(e,r._$AS(e,t.values),r,s)),t}class ee{constructor(e,t){this._$AV=[],this._$AN=void 0,this._$AD=e,this._$AM=t}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(e){const{el:{content:t},parts:i}=this._$AD,s=(e?.creationScope??A).importNode(t,!0);G.currentNode=s;let r=G.nextNode(),a=0,o=0,n=i[0];for(;void 0!==n;){if(a===n.index){let t;2===n.type?t=new te(r,r.nextSibling,this,e):1===n.type?t=new n.ctor(r,n.name,n.strings,this,e):6===n.type&&(t=new oe(r,this,e)),this._$AV.push(t),n=i[++o]}a!==n?.index&&(r=G.nextNode(),a++)}return G.currentNode=A,s}p(e){let t=0;for(const i of this._$AV)void 0!==i&&(void 0!==i.strings?(i._$AI(e,i,t),t+=i.strings.length-2):i._$AI(e[t])),t++}}class te{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(e,t,i,s){this.type=2,this._$AH=q,this._$AN=void 0,this._$AA=e,this._$AB=t,this._$AM=i,this.options=s,this._$Cv=s?.isConnected??!0}get parentNode(){let e=this._$AA.parentNode;const t=this._$AM;return void 0!==t&&11===e?.nodeType&&(e=t.parentNode),e}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(e,t=this){e=J(this,e,t),P(e)?e===q||null==e||""===e?(this._$AH!==q&&this._$AR(),this._$AH=q):e!==this._$AH&&e!==Y&&this._(e):void 0!==e._$litType$?this.$(e):void 0!==e.nodeType?this.T(e):(e=>B(e)||"function"==typeof e?.[Symbol.iterator])(e)?this.k(e):this._(e)}O(e){return this._$AA.parentNode.insertBefore(e,this._$AB)}T(e){this._$AH!==e&&(this._$AR(),this._$AH=this.O(e))}_(e){this._$AH!==q&&P(this._$AH)?this._$AA.nextSibling.data=e:this.T(A.createTextNode(e)),this._$AH=e}$(e){const{values:t,_$litType$:i}=e,s="number"==typeof i?this._$AC(e):(void 0===i.el&&(i.el=Z.createElement(X(i.h,i.h[0]),this.options)),i);if(this._$AH?._$AD===s)this._$AH.p(t);else{const e=new ee(s,this),i=e.u(this.options);e.p(t),this.T(i),this._$AH=e}}_$AC(e){let t=K.get(e.strings);return void 0===t&&K.set(e.strings,t=new Z(e)),t}k(e){B(this._$AH)||(this._$AH=[],this._$AR());const t=this._$AH;let i,s=0;for(const r of e)s===t.length?t.push(i=new te(this.O(T()),this.O(T()),this,this.options)):i=t[s],i._$AI(r),s++;s<t.length&&(this._$AR(i&&i._$AB.nextSibling,s),t.length=s)}_$AR(e=this._$AA.nextSibling,t){for(this._$AP?.(!1,!0,t);e!==this._$AB;){const t=k(e).nextSibling;k(e).remove(),e=t}}setConnected(e){void 0===this._$AM&&(this._$Cv=e,this._$AP?.(e))}}class ie{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(e,t,i,s,r){this.type=1,this._$AH=q,this._$AN=void 0,this.element=e,this.name=t,this._$AM=s,this.options=r,i.length>2||""!==i[0]||""!==i[1]?(this._$AH=Array(i.length-1).fill(new String),this.strings=i):this._$AH=q}_$AI(e,t=this,i,s){const r=this.strings;let a=!1;if(void 0===r)e=J(this,e,t,0),a=!P(e)||e!==this._$AH&&e!==Y,a&&(this._$AH=e);else{const s=e;let o,n;for(e=r[0],o=0;o<r.length-1;o++)n=J(this,s[i+o],t,o),n===Y&&(n=this._$AH[o]),a||=!P(n)||n!==this._$AH[o],n===q?e=q:e!==q&&(e+=(n??"")+r[o+1]),this._$AH[o]=n}a&&!s&&this.j(e)}j(e){e===q?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,e??"")}}class se extends ie{constructor(){super(...arguments),this.type=3}j(e){this.element[this.name]=e===q?void 0:e}}class re extends ie{constructor(){super(...arguments),this.type=4}j(e){this.element.toggleAttribute(this.name,!!e&&e!==q)}}class ae extends ie{constructor(e,t,i,s,r){super(e,t,i,s,r),this.type=5}_$AI(e,t=this){if((e=J(this,e,t,0)??q)===Y)return;const i=this._$AH,s=e===q&&i!==q||e.capture!==i.capture||e.once!==i.once||e.passive!==i.passive,r=e!==q&&(i===q||s);s&&this.element.removeEventListener(this.name,this,i),r&&this.element.addEventListener(this.name,this,e),this._$AH=e}handleEvent(e){"function"==typeof this._$AH?this._$AH.call(this.options?.host??this.element,e):this._$AH.handleEvent(e)}}class oe{constructor(e,t,i){this.element=e,this.type=6,this._$AN=void 0,this._$AM=t,this.options=i}get _$AU(){return this._$AM._$AU}_$AI(e){J(this,e)}}const ne=$.litHtmlPolyfillSupport;ne?.(Z,te),($.litHtmlVersions??=[]).push("3.3.2");const le=globalThis;let de=class extends w{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){const e=super.createRenderRoot();return this.renderOptions.renderBefore??=e.firstChild,e}update(e){const t=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(e),this._$Do=((e,t,i)=>{const s=i?.renderBefore??t;let r=s._$litPart$;if(void 0===r){const e=i?.renderBefore??null;s._$litPart$=r=new te(t.insertBefore(T(),e),e,void 0,i??{})}return r._$AI(e),r})(t,this.renderRoot,this.renderOptions)}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(!0)}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(!1)}render(){return Y}};de._$litElement$=!0,de.finalized=!0,le.litElementHydrateSupport?.({LitElement:de});const ce=le.litElementPolyfillSupport;ce?.({LitElement:de}),(le.litElementVersions??=[]).push("4.2.2");const pe={attribute:!0,type:String,converter:f,reflect:!1,hasChanged:_},he=(e=pe,t,i)=>{const{kind:s,metadata:r}=i;let a=globalThis.litPropertyMetadata.get(r);if(void 0===a&&globalThis.litPropertyMetadata.set(r,a=new Map),"setter"===s&&((e=Object.create(e)).wrapped=!0),a.set(i.name,e),"accessor"===s){const{name:s}=i;return{set(i){const r=t.get.call(this);t.set.call(this,i),this.requestUpdate(s,r,e,!0,i)},init(t){return void 0!==t&&this.C(s,void 0,e,t),t}}}if("setter"===s){const{name:s}=i;return function(i){const r=this[s];t.call(this,i),this.requestUpdate(s,r,e,!0,i)}}throw Error("Unsupported decorator location: "+s)};function ve(e){return(t,i)=>"object"==typeof i?he(e,t,i):((e,t,i)=>{const s=t.hasOwnProperty(i);return t.constructor.createProperty(i,e),s?Object.getOwnPropertyDescriptor(t,i):void 0})(e,t,i)}function ue(e){return ve({...e,state:!0,attribute:!1})}function me(e,t){return(t,i,s)=>((e,t,i)=>(i.configurable=!0,i.enumerable=!0,Reflect.decorate&&"object"!=typeof t&&Object.defineProperty(e,t,i),i))(t,i,{get(){return(t=>t.renderRoot?.querySelector(e)??null)(this)}})}function ge(e,t){return ye(()=>be(e,t))}function ye(e){return"undefined"==typeof document||null===document.querySelector("home-assistant")||customElements.get("home-assistant")?e():(customElements.whenDefined("home-assistant").then(e),!1)}function be(e,t){return!customElements.get(e)&&(customElements.define(e,t),!0)}const fe=/^\d{4}-\d{2}-\d{2}$/;function _e(e){return fe.test(e)}function xe(e){if(_e(e)){const[t,i,s]=e.split("-").map(Number);return new Date(t,i-1,s)}return new Date(e)}function we(e,t="12h"){const i=xe(e);return"24h"===t?i.toLocaleTimeString("en-US",{hour:"2-digit",minute:"2-digit",hour12:!1}):i.toLocaleTimeString("en-US",{hour:"numeric",minute:"2-digit",hour12:!0})}function $e(e,t="medium"){switch(t){case"long":return e.toLocaleDateString("en-US",{weekday:"long",year:"numeric",month:"long",day:"numeric"});case"medium":return e.toLocaleDateString("en-US",{weekday:"short",month:"short",day:"numeric"});case"short":return e.toLocaleDateString("en-US",{month:"numeric",day:"numeric"});case"weekday":return e.toLocaleDateString("en-US",{weekday:"long"})}}function ke(e){const t=new Date;return e.getFullYear()===t.getFullYear()&&e.getMonth()===t.getMonth()&&e.getDate()===t.getDate()}function Fe(e,t="sunday"){const i=new Date(e),s=i.getDay(),r="monday"===t?0===s?-6:1-s:-s;return i.setDate(i.getDate()+r),i.setHours(0,0,0,0),i}function Ce(e){return`${e.getFullYear()}-${String(e.getMonth()+1).padStart(2,"0")}-${String(e.getDate()).padStart(2,"0")}`}function Ee(e,t){const i=Date.UTC(e.getFullYear(),e.getMonth(),e.getDate()),s=Date.UTC(t.getFullYear(),t.getMonth(),t.getDate());return Math.round((s-i)/864e5)}function De(e,t){const i=new Map(t.map(e=>[e.entity_id,e])),s=new Map;for(const t of e){const e=`${t.summary}|${t.start}|${t.end}`;if(s.has(e)){const r=s.get(e),a=i.get(t.calendar_entity_id);a&&r.shared_calendars.push({entity_id:a.entity_id,color:a.color,color_light:a.color_light,person_entity:a.person_entity,display_name:a.display_name})}else{const r=i.get(t.calendar_entity_id);s.set(e,{...t,shared_calendars:r?[{entity_id:r.entity_id,color:r.color,color_light:r.color_light,person_entity:r.person_entity,display_name:r.display_name}]:[]})}}return Array.from(s.values())}function Se(e){return xe(e.end)<new Date}function ze(e){if(_e(e.start))return!0;const t=xe(e.start),i=xe(e.end);return 0===t.getHours()&&0===t.getMinutes()&&0===i.getHours()&&0===i.getMinutes()&&Ce(t)!==Ce(i)}function Ae(e,t){return new Date(Math.max(xe(e.end).getTime()-1,t.getTime()))}function Te(e,t){const i=ze(e);return i!==ze(t)?i?-1:1:xe(e.start).getTime()-xe(t.start).getTime()}function Pe(e){const t=new Map;for(const i of e){const e=xe(i.start),s=Ce(Ae(i,e)),r=new Date(e.getFullYear(),e.getMonth(),e.getDate());for(let e=0;e<1e3;e++){const e=Ce(r);if(t.has(e)||t.set(e,[]),t.get(e).push(i),e===s)break;r.setDate(r.getDate()+1)}}for(const[,e]of t)e.sort(Te);return t}function Be(e,t,i){return e.filter(e=>{const s=xe(e.start),r=xe(e.end);return s<i&&r>t})}function Me(e,t){return e.filter(e=>!t.has(e.calendar_entity_id))}function Oe(e){const t=parseInt(e.slice(1,3),16)/255,i=parseInt(e.slice(3,5),16)/255,s=parseInt(e.slice(5,7),16)/255,r=e=>e<=.03928?e/12.92:Math.pow((e+.055)/1.055,2.4);return.2126*r(t)+.7152*r(i)+.0722*r(s)}function Ie(e){return Oe(e)>.4?"#1A1B1E":"#FFFFFF"}const Le={sharp:{radius:"4px",radiusLg:"6px",radiusSm:"2px"},rounded:{radius:"12px",radiusLg:"16px",radiusSm:"8px"},pill:{radius:"20px",radiusLg:"24px",radiusSm:"14px"}},He={none:{shadow:"none",shadowLg:"none",shadowXl:"none"},subtle:{shadow:"0 1px 3px rgba(0, 0, 0, 0.08), 0 1px 2px rgba(0, 0, 0, 0.04)",shadowLg:"0 10px 25px rgba(0, 0, 0, 0.08), 0 4px 10px rgba(0, 0, 0, 0.04)",shadowXl:"0 20px 40px rgba(0, 0, 0, 0.12)"},bold:{shadow:"0 2px 8px rgba(0, 0, 0, 0.15), 0 1px 3px rgba(0, 0, 0, 0.1)",shadowLg:"0 12px 32px rgba(0, 0, 0, 0.18), 0 6px 14px rgba(0, 0, 0, 0.1)",shadowXl:"0 24px 48px rgba(0, 0, 0, 0.24)"}},Ne={gradient_purple:{gradient:"linear-gradient(135deg, #667eea 0%, #764ba2 100%)",text:"#FFFFFF"},gradient_teal:{gradient:"linear-gradient(135deg, #0D9488 0%, #2563EB 100%)",text:"#FFFFFF"},gradient_sunset:{gradient:"linear-gradient(135deg, #F59E0B 0%, #EF4444 100%)",text:"#FFFFFF"},solid_accent:{gradient:"",text:"#FFFFFF"},solid_dark:{gradient:"#1A1B1E",text:"#FFFFFF"}},je={light:{"--pv-bg":"#FAFAF8","--pv-card-bg":"#FFFFFF","--pv-card-bg-elevated":"#FFFFFF","--pv-text":"#1A1B1E","--pv-text-secondary":"#6B7280","--pv-text-muted":"#9CA3AF","--pv-border":"#E5E7EB","--pv-border-subtle":"#F3F4F6","--pv-accent":"#6366F1","--pv-accent-text":"#FFFFFF","--pv-today-bg":"rgba(99, 102, 241, 0.06)","--pv-now-color":"#EF4444","--pv-event-hover":"rgba(0, 0, 0, 0.03)","--pv-shadow":"0 1px 3px rgba(0, 0, 0, 0.08), 0 1px 2px rgba(0, 0, 0, 0.04)","--pv-shadow-lg":"0 10px 25px rgba(0, 0, 0, 0.08), 0 4px 10px rgba(0, 0, 0, 0.04)","--pv-shadow-xl":"0 20px 40px rgba(0, 0, 0, 0.12)","--pv-radius":"12px","--pv-radius-lg":"16px","--pv-radius-sm":"8px","--pv-transition":"200ms cubic-bezier(0.4, 0, 0.2, 1)","--pv-font-family":"Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif","--pv-header-gradient":"linear-gradient(135deg, #667eea 0%, #764ba2 100%)","--pv-header-text":"#FFFFFF","--pv-backdrop":"rgba(0, 0, 0, 0.3)"},dark:{"--pv-bg":"#1A1B1E","--pv-card-bg":"#25262B","--pv-card-bg-elevated":"#2C2E33","--pv-text":"#E4E5E7","--pv-text-secondary":"#909296","--pv-text-muted":"#5C5F66","--pv-border":"#373A40","--pv-border-subtle":"#2C2E33","--pv-accent":"#818CF8","--pv-accent-text":"#FFFFFF","--pv-today-bg":"rgba(129, 140, 248, 0.08)","--pv-now-color":"#F87171","--pv-event-hover":"rgba(255, 255, 255, 0.04)","--pv-shadow":"0 1px 3px rgba(0, 0, 0, 0.3), 0 1px 2px rgba(0, 0, 0, 0.2)","--pv-shadow-lg":"0 10px 25px rgba(0, 0, 0, 0.3), 0 4px 10px rgba(0, 0, 0, 0.2)","--pv-shadow-xl":"0 20px 40px rgba(0, 0, 0, 0.4)","--pv-radius":"12px","--pv-radius-lg":"16px","--pv-radius-sm":"8px","--pv-transition":"200ms cubic-bezier(0.4, 0, 0.2, 1)","--pv-font-family":"Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif","--pv-header-gradient":"linear-gradient(135deg, #3730A3 0%, #581C87 100%)","--pv-header-text":"#FFFFFF","--pv-backdrop":"rgba(0, 0, 0, 0.6)"},minimal:{"--pv-bg":"#FFFFFF","--pv-card-bg":"#FFFFFF","--pv-card-bg-elevated":"#FFFFFF","--pv-text":"#111827","--pv-text-secondary":"#6B7280","--pv-text-muted":"#D1D5DB","--pv-border":"#F3F4F6","--pv-border-subtle":"#F9FAFB","--pv-accent":"#111827","--pv-accent-text":"#FFFFFF","--pv-today-bg":"rgba(17, 24, 39, 0.03)","--pv-now-color":"#EF4444","--pv-event-hover":"rgba(0, 0, 0, 0.02)","--pv-shadow":"0 0 0 1px rgba(0, 0, 0, 0.05)","--pv-shadow-lg":"0 4px 12px rgba(0, 0, 0, 0.05)","--pv-shadow-xl":"0 8px 24px rgba(0, 0, 0, 0.08)","--pv-radius":"8px","--pv-radius-lg":"12px","--pv-radius-sm":"6px","--pv-transition":"150ms ease","--pv-font-family":"Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif","--pv-header-gradient":"#111827","--pv-header-text":"#FFFFFF","--pv-backdrop":"rgba(0, 0, 0, 0.2)"},vibrant:{"--pv-bg":"#FAFAF8","--pv-card-bg":"#FFFFFF","--pv-card-bg-elevated":"#FFFFFF","--pv-text":"#1A1B1E","--pv-text-secondary":"#6B7280","--pv-text-muted":"#9CA3AF","--pv-border":"#E5E7EB","--pv-border-subtle":"#F3F4F6","--pv-accent":"#7C3AED","--pv-accent-text":"#FFFFFF","--pv-today-bg":"rgba(124, 58, 237, 0.06)","--pv-now-color":"#F43F5E","--pv-event-hover":"rgba(0, 0, 0, 0.03)","--pv-shadow":"0 1px 3px rgba(124, 58, 237, 0.1), 0 1px 2px rgba(0, 0, 0, 0.04)","--pv-shadow-lg":"0 10px 25px rgba(124, 58, 237, 0.15), 0 4px 10px rgba(0, 0, 0, 0.04)","--pv-shadow-xl":"0 20px 40px rgba(124, 58, 237, 0.2)","--pv-radius":"14px","--pv-radius-lg":"20px","--pv-radius-sm":"10px","--pv-transition":"250ms cubic-bezier(0.34, 1.56, 0.64, 1)","--pv-font-family":"Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif","--pv-header-gradient":"linear-gradient(135deg, #7C3AED 0%, #EC4899 100%)","--pv-header-text":"#FFFFFF","--pv-backdrop":"rgba(124, 58, 237, 0.2)"}},Ue=new WeakMap;function Re(e,t,i){const s=`${t}:${JSON.stringify(i||{})}`;if(Ue.get(e)===s)return;const r={...je[t]||je.light};if(i){if(i.accent&&(r["--pv-accent"]=i.accent,r["--pv-accent-text"]=Ie(i.accent),r["--pv-today-bg"]=(a=i.accent,`rgba(${parseInt(a.slice(1,3),16)}, ${parseInt(a.slice(3,5),16)}, ${parseInt(a.slice(5,7),16)}, 0.06)`)),i.background){if(r["--pv-bg"]=i.background,Oe(i.background)>.5)r["--pv-card-bg"]="#FFFFFF",r["--pv-card-bg-elevated"]="#FFFFFF";else{const e=parseInt(i.background.slice(1,3),16),t=parseInt(i.background.slice(3,5),16),s=parseInt(i.background.slice(5,7),16),a=(e,t)=>Math.min(255,e+t);r["--pv-card-bg"]=`#${a(e,12).toString(16).padStart(2,"0")}${a(t,12).toString(16).padStart(2,"0")}${a(s,12).toString(16).padStart(2,"0")}`,r["--pv-card-bg-elevated"]=`#${a(e,20).toString(16).padStart(2,"0")}${a(t,20).toString(16).padStart(2,"0")}${a(s,20).toString(16).padStart(2,"0")}`}r["--pv-text"]=Ie(i.background);const e=Oe(r["--pv-text"])>.5?{secondary:"#909296",muted:"#5C5F66"}:{secondary:"#6B7280",muted:"#9CA3AF"};r["--pv-text-secondary"]=e.secondary,r["--pv-text-muted"]=e.muted;const t=Oe(i.background)>.5?{border:"#E5E7EB",borderSubtle:"#F3F4F6"}:{border:"#373A40",borderSubtle:"#2C2E33"};r["--pv-border"]=t.border,r["--pv-border-subtle"]=t.borderSubtle,r["--pv-event-hover"]=Oe(i.background)>.5?"rgba(0, 0, 0, 0.03)":"rgba(255, 255, 255, 0.04)",r["--pv-backdrop"]=Oe(i.background)>.5?"rgba(0, 0, 0, 0.3)":"rgba(0, 0, 0, 0.6)"}if(i.header_style)if("custom"===i.header_style&&i.header_custom)r["--pv-header-gradient"]=i.header_custom,r["--pv-header-text"]=Ie(i.header_custom);else if("solid_accent"===i.header_style){const e=i.accent||r["--pv-accent"];r["--pv-header-gradient"]=e,r["--pv-header-text"]=Ie(e)}else{const e=Ne[i.header_style];e&&(r["--pv-header-gradient"]=e.gradient,r["--pv-header-text"]=e.text)}if(i.corner_style&&Le[i.corner_style]){const e=Le[i.corner_style];r["--pv-radius"]=e.radius,r["--pv-radius-lg"]=e.radiusLg,r["--pv-radius-sm"]=e.radiusSm}if(i.shadow_depth&&He[i.shadow_depth]){const e=He[i.shadow_depth];r["--pv-shadow"]=e.shadow,r["--pv-shadow-lg"]=e.shadowLg,r["--pv-shadow-xl"]=e.shadowXl}i.avatar_border&&"primary"!==i.avatar_border&&"light"!==i.avatar_border&&(r["--pv-avatar-border"]=i.avatar_border),i.now_color&&(r["--pv-now-color"]=i.now_color)}var a;for(const[t,i]of Object.entries(r))e.style.setProperty(t,i);Ue.set(e,s)}function Ve(e){Ue.delete(e)}function We(e,t){const i=e||t||"light";return"planavista"===i?"light":"modern"===i?"vibrant":i in je?i:"light"}async function Ye(e,t){const i={summary:t.summary};t.start_date_time&&(i.start_date_time=t.start_date_time),t.end_date_time&&(i.end_date_time=t.end_date_time),t.start_date&&(i.start_date=t.start_date),t.end_date&&(i.end_date=t.end_date),t.description&&(i.description=t.description),t.location&&(i.location=t.location),await e.callService("calendar","create_event",i,{entity_id:t.entity_id})}async function qe(e,t){const i={entity_id:t.entity_id,summary:t.summary};t.start_date_time&&(i.start_date_time=t.start_date_time),t.end_date_time&&(i.end_date_time=t.end_date_time),t.start_date&&(i.start_date=t.start_date),t.end_date&&(i.end_date=t.end_date),t.description&&(i.description=t.description),t.location&&(i.location=t.location),t.attendee_entity_ids?.length&&(i.attendee_entity_ids=t.attendee_entity_ids),await e.callService("planavista","create_event_with_attendees",i)}async function Ke(e,t){const i={entity_id:t.entity_id,uid:t.uid};t.recurrence_id&&(i.recurrence_id=t.recurrence_id),await e.callService("planavista","delete_event",i)}async function Ge(e,t="sensor.planavista_config"){await e.callService("homeassistant","update_entity",{entity_id:t})}async function Xe(e,t,i){try{const s=await e.callWS({type:"planavista/get_event_organizer",entity_id:t,uid:i});return s?.organizer_entity_id??null}catch{return null}}function Qe(e,t){if(!t)return null;const i=e.states[t];return i?.attributes?.entity_picture||null}function Ze(e,t){if(!t)return"";const i=e.states[t];return i?.attributes?.friendly_name||t.replace("person.","")}const Je=o`
  :host {
    display: block;
    font-family: var(--pv-font-family, Inter, -apple-system, system-ui, sans-serif);
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
`,et=o`
  .pv-display {
    font-size: 3.5rem;
    font-weight: 300;
    line-height: 1.1;
    letter-spacing: -0.02em;
  }

  .pv-heading-1 {
    font-size: 1.5rem;
    font-weight: 600;
    line-height: 1.3;
    letter-spacing: -0.01em;
  }

  .pv-heading-2 {
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
`,tt=o`
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
`,it=o`
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
`,st=o`
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
`,rt=o`
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
`,at=o`
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
`,ot=o`
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
`;o`
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
`;class nt extends de{constructor(){super(...arguments),this.calendars=[],this.timeFormat="12h",this.compact=!1,this.showStripes=!0,this.tick=0}render(){const e=this.event;if(!e)return q;const t=e.shared_calendars||[],i=t.length>1,s=function(e,t){if(e.organizer){const t=e.shared_calendars.find(t=>t.display_name?.toLowerCase()===e.organizer?.toLowerCase()||t.entity_id===e.organizer);if(t)return t}for(const i of t){const t=e.shared_calendars.find(e=>e.entity_id===i.entity_id);if(t)return t}return e.shared_calendars[0]}(e,this.calendars),r=s?.color||e.calendar_color||"var(--pv-accent)";let a;a=this.showStripes&&i?`background: ${function(e){const t=e.length;if(t<=1)return"";const i=2===t?60:Math.min(50,Math.round(100/t*1.5)),s=(100-i)/(t-1),r=[];let a=0;return e.forEach((e,t)=>{const o=e.color_light||e.color,n=0===t?i:s;r.push(`${o} ${a}%`),a+=n,r.push(`${o} ${a}%`)}),`linear-gradient(135deg, ${r.join(", ")})`}(t)}`:this.showStripes?`background: ${t[0]?.color_light||e.calendar_color_light||e.calendar_color}`:"background: var(--pv-card-bg, #FFFFFF)";const o=this.showStripes?t[0]?.color_light||e.calendar_color_light||e.calendar_color:"#FFFFFF",n=this.showStripes?Ie(o):"var(--pv-text)",l=Se(e)?" past":"",d=(this.compact?"chip chip--compact":"chip")+l,c=this.compact?"chip-title chip-title--wrap":"chip-title chip-title--nowrap",p=ze(e);return V`
      <div
        class="${d}"
        style="${a}; --chip-border-color: ${r}; --chip-text: ${n}"
        @click=${this._onClick}
      >
        <div class="chip-body">
          <div class="${c}">${e.summary}</div>
          ${this.compact?q:V`
            <div class="chip-time">
              ${p?"All day":`${we(e.start,this.timeFormat)} – ${we(e.end,this.timeFormat)}`}
            </div>
          `}
        </div>
        ${!this.compact&&t.length>0?this._renderAvatars(t):q}
      </div>
    `}_renderAvatars(e){const t=e.slice(0,4),i=e.length-4;return V`
      <div class="chip-avatars">
        ${t.map(e=>{const t=e.person_entity?Qe(this.hass,e.person_entity):null,i=e.person_entity?Ze(this.hass,e.person_entity):e.display_name||"?";return t?V`<img class="chip-avatar" src="${t}" alt="${i}" />`:V`<div class="chip-initial" style="background: ${e.color}">${i[0]?.toUpperCase()||"?"}</div>`})}
        ${i>0?V`<div class="chip-overflow">+${i}</div>`:q}
      </div>
    `}_onClick(){this.dispatchEvent(new CustomEvent("event-click",{detail:{event:this.event},bubbles:!0,composed:!0}))}}function lt(e){let t,i=null;return(...s)=>(i&&i.length===s.length&&s.every((e,t)=>e===i[t])||(t=e(...s),i=s),t)}nt.styles=[Je,o`
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

      .chip-title--wrap {
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        white-space: normal;
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

      /* Compact mode (month view) */
      .chip--compact {
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
        .chip--compact { padding: 0.375rem 0.75rem; border-left-width: 3px; }
        .chip--compact .chip-title { font-size: 1rem; }
      }
    `],e([ve({attribute:!1})],nt.prototype,"hass",void 0),e([ve({attribute:!1})],nt.prototype,"event",void 0),e([ve({attribute:!1})],nt.prototype,"calendars",void 0),e([ve({attribute:!1})],nt.prototype,"timeFormat",void 0),e([ve({type:Boolean})],nt.prototype,"compact",void 0),e([ve({type:Boolean})],nt.prototype,"showStripes",void 0),e([ve({type:Number})],nt.prototype,"tick",void 0),ge("pv-event-chip",nt);const dt=/^\d{2}:\d{2}$/;function ct(e){return String(e).padStart(2,"0")}function pt(e){return`${ct(e.getHours())}:${ct(e.getMinutes())}`}function ht(e){const t=-e.getTimezoneOffset(),i=t>=0?"+":"-",s=Math.abs(t);return`${Ce(e)}T${ct(e.getHours())}:${ct(e.getMinutes())}:${ct(e.getSeconds())}${i}${ct(Math.floor(s/60))}:${ct(s%60)}`}function vt(e,t){const[i,s,r]=e.split("-").map(Number);return Ce(new Date(i,s-1,r+t))}function ut(e,t){const[i,s,r]=e.split("-").map(Number),[a,o]=t.split(":").map(Number);return new Date(i,s-1,r,a,o,0,0)}function mt(e){return e.allDay?{start_date:e.date,end_date:vt(e.date,Math.max(1,Math.round(e.spanDays)))}:{start_date_time:ht(ut(e.date,e.startTime)),end_date_time:ht(ut(vt(e.date,e.endDayOffset),e.endTime))}}function gt(e,t=e.calendar_entity_id){if(!e.uid)throw new Error("This event has no unique ID, so it can only be changed in its calendar app.");const i={entity_id:t,uid:e.uid};return e.recurrence_id&&(i.recurrence_id=e.recurrence_id),i}function yt(e,t=e.calendar_entity_id){const i=_e(e.start)?{entity_id:t,summary:e.summary,start_date:e.start,end_date:e.end}:{entity_id:t,summary:e.summary,start_date_time:e.start,end_date_time:e.end};return e.description&&(i.description=e.description),e.location&&(i.location=e.location),i}function bt(e,t,i){return{deleteData:gt(e,t),createData:{...i,entity_id:t},restoreData:yt(e,t)}}class ft extends Error{constructor(e,t){super(e),this.restored=t,this.name="EditRestoreError"}}function _t(e){return e instanceof Error?e.message:String(e&&"object"==typeof e&&"message"in e?e.message:e)}async function xt(e){await e.remove();try{await e.create()}catch(t){const i=_t(t);try{await e.restore()}catch(e){throw new ft(`Your changes couldn't be saved (${i}), and the original event couldn't be put back (${_t(e)}). Please re-create it in your calendar app.`,!1)}throw new ft(`Your changes couldn't be saved (${i}). The original event was restored.`,!0)}}class wt{constructor(){this.hiddenCalendars=new Set,this.currentView="day",this.currentDate=new Date,this.selectedEvent=null,this.dialogOpen=null,this.createPrefill=null,this.isLoading=!1,this._hosts=new Set,this._autoAdvanceTimer=null,this._todayKey=Ce(new Date),this._onVisibilityChange=()=>{"visible"===document.visibilityState&&this.checkRollover()}}subscribe(e){this._hosts.add(e)}unsubscribe(e){this._hosts.delete(e)}_notify(){for(const e of this._hosts)e.requestUpdate()}toggleCalendar(e){const t=new Set(this.hiddenCalendars);t.has(e)?t.delete(e):t.add(e),this.hiddenCalendars=t,this._notify()}setView(e){this.currentView!==e&&(this.currentView=e,this._notify())}navigateDate(e){this.currentDate="today"===e?new Date:function(e,t,i){const s=new Date(e),r="next"===i?1:-1;switch(t){case"day":s.setDate(s.getDate()+r);break;case"week":case"agenda":s.setDate(s.getDate()+7*r);break;case"month":s.setMonth(s.getMonth()+r)}return s}(this.currentDate,this.currentView,e),this._notify()}setDate(e){this.currentDate=new Date(e),this._notify()}selectEvent(e){this.selectedEvent=e,this._notify()}openCreateDialog(e){this.dialogOpen="create",this.createPrefill=e||null,this._notify()}openEditDialog(e,t){this.dialogOpen="edit",this.selectedEvent=e;const i={...e};t?.removeGuests&&(i._removeGuestsHint=!0),this.createPrefill=i,this._notify()}closeDialog(){this.dialogOpen=null,this.createPrefill=null,this._notify()}async doCreateEvent(e,t){this.isLoading=!0,this._notify();try{await Ye(e,t),await Ge(e),this.closeDialog()}catch(e){throw console.error("PlanaVista: Failed to create event",e),e}finally{this.isLoading=!1,this._notify()}}async doDeleteEvent(e,t){this.isLoading=!0,this._notify();try{await Ke(e,t),await Ge(e),this.selectedEvent=null,this.closeDialog()}catch(e){throw console.error("PlanaVista: Failed to delete event",e),e}finally{this.isLoading=!1,this._notify()}}async doEditEvent(e,t,i,s){this.isLoading=!0,this._notify();try{await xt({remove:()=>Ke(e,t),create:()=>Ye(e,i),restore:()=>Ye(e,s)}),await Ge(e),this.selectedEvent=null,this.closeDialog()}catch(t){throw console.error("PlanaVista: Failed to edit event",t),await Ge(e).catch(()=>{}),t}finally{this.isLoading=!1,this._notify()}}checkRollover(e=new Date){const t=function(e,t,i){return Ce(i)===t?null:Ce(e)===t?new Date(i):null}(this.currentDate,this._todayKey,e);this._todayKey=Ce(e),t&&(this.currentDate=t,this._notify())}get autoAdvancing(){return null!==this._autoAdvanceTimer}startAutoAdvance(){this._autoAdvanceTimer||(this.checkRollover(),this._autoAdvanceTimer=setInterval(()=>this.checkRollover(),6e4),"undefined"!=typeof document&&document.addEventListener("visibilitychange",this._onVisibilityChange))}stopAutoAdvance(){this._autoAdvanceTimer&&(clearInterval(this._autoAdvanceTimer),this._autoAdvanceTimer=null),"undefined"!=typeof document&&document.removeEventListener("visibilitychange",this._onVisibilityChange)}}class $t{constructor(e){this.host=e,this.store=new wt,e.addController(this)}hostConnected(){this.store.subscribe(this.host),this.store.startAutoAdvance()}hostDisconnected(){this.store.unsubscribe(this.host),this.store.stopAutoAdvance()}}class kt{constructor(e,t){this.host=e,this.getStore=t,e.addController(this)}hostConnected(){this._sync()}hostUpdate(){this._sync()}hostDisconnected(){this._store?.unsubscribe(this.host),this._store=void 0}_sync(){const e=this.getStore();e!==this._store&&(this._store?.unsubscribe(this.host),e?.subscribe(this.host),this._store=e)}}function Ft(e,t){const i=(e?.calendars||[]).filter(e=>!1!==e.visible),s=t?.calendars;return Array.isArray(s)&&s.length>0?i.filter(e=>s.includes(e.entity_id)):i}class Ct extends de{constructor(){super(...arguments),this.events=[],this.calendars=[],this.currentDate=new Date,this.hiddenCalendars=new Set,this.timeFormat="12h",this.hideColumnHeaders=!1,this.avatarBorderMode="primary",this.sharedEventMap=new Map,this.tick=0}firstUpdated(){this._scrollToNow()}updated(e){super.updated(e),e.has("currentDate")&&this._scrollToNow()}_scrollToNow(){requestAnimationFrame(()=>{const e=this.shadowRoot?.querySelector(".time-grid-wrapper");if(!e)return;this._scrollContainer=e;const t=new Date,i=60*(t.getHours()-0)+t.getMinutes();if(i>0&&i<1440){const t=i/1440*e.scrollHeight-e.clientHeight/3;e.scrollTo({top:Math.max(0,t),behavior:"smooth"})}})}render(){const e=Me(this.events,this.hiddenCalendars),t=new Date(this.currentDate);t.setHours(0,0,0,0);const i=new Date(this.currentDate);i.setHours(23,59,59,999);const s=Be(e,t,i),r=s.filter(e=>ze(e)),a=s.filter(e=>!ze(e)),o=this.calendars.filter(e=>!1!==e.visible&&!this.hiddenCalendars.has(e.entity_id)),n=function(e,t){const i=new Map,s=new Map(t.map(e=>[e.entity_id,e]));for(const e of t)if(!1!==e.visible){const t=e.person_entity||e.entity_id;i.has(t)||i.set(t,[])}for(const t of e){const e=s.get(t.calendar_entity_id),r=e?.person_entity||t.calendar_entity_id;i.has(r)||i.set(r,[]),i.get(r).push(t)}return i}(a,o),l=Array.from(n.keys()),d=new Date,c=d.toDateString()===this.currentDate.toDateString(),p=60*(d.getHours()-0)+d.getMinutes(),h=c?p/1440*100:-1;return 0===o.length?V`
        <div class="empty-state">
          <ha-icon icon="mdi:calendar-blank"></ha-icon>
          <p>No calendars visible</p>
        </div>
      `:V`
      <div class="day-container">
        ${r.length>0?V`
          <div class="all-day-section">
            <div class="all-day-gutter">All Day</div>
            <div class="all-day-events">
              ${r.map(e=>V`
                <div
                  class="all-day-chip${Se(e)?" past":""}"
                  style="background: ${e.calendar_color}; color: ${Ie(e.calendar_color)}"
                  @click=${()=>this._onEventClick(e)}
                >${e.summary}</div>
              `)}
            </div>
          </div>
        `:q}

        ${this.hideColumnHeaders?q:V`
          <div class="column-headers">
            <div class="header-gutter"></div>
            ${l.map(e=>{const t=o.find(t=>(t.person_entity||t.entity_id)===e),i=t?.person_entity?Qe(this.hass,t.person_entity):null,s=t?.person_entity?Ze(this.hass,t.person_entity):t?.display_name||e,r=t?.color||"#6366F1",a=t?.color_light||r,n="light"===this.avatarBorderMode?a:"primary"===this.avatarBorderMode?r:this.avatarBorderMode;return V`
                <div class="person-header">
                  ${i?V`<img class="person-avatar" src="${i}" alt="${s}"
                        style="${n?`--pv-avatar-border: ${n}`:""}" />`:V`<div class="person-initial" style="background: ${r}">${s[0]?.toUpperCase()||"?"}</div>`}
                  <span class="person-name">${s}</span>
                </div>
              `})}
          </div>
        `}

        ${c?q:V`
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
              ${h>=0&&h<=100?V`
                <div class="pv-now-line" style="top: ${h}%"></div>
              `:q}
              ${l.map(e=>this._renderColumn(e,n.get(e)||[]))}
            </div>
          </div>
          ${this._renderNextDayFooter()}
        </div>
      </div>
    `}_renderTimeLabels(){const e=[];for(let t=0;t<=24;t++){const i=(t-0)/24*100;let s;if("24h"===this.timeFormat)s=`${String(t%24).padStart(2,"0")}:00`;else{const e=t%24;s=`${e%12||12} ${e>=12?"PM":"AM"}`}e.push(V`
        <div class="time-label" style="top: ${i}%">${s}</div>
      `)}return e}_renderHourLines(){const e=[],t=1/24*100;for(let i=0;i<24;i++){const s=(i-0)/24*100;i%2==1&&e.push(V`
          <div class="hour-band-odd" style="top: ${s}%; height: ${t}%"></div>
        `)}return e}_renderNextDayFooter(){const e=new Date(this.currentDate);e.setDate(e.getDate()+1);const t=e.toLocaleDateString("en-US",{weekday:"long",month:"long",day:"numeric"});return V`
      <div class="next-day-footer" @click=${this._goToNextDay}>
        ${t}
        <ha-icon icon="mdi:arrow-down"></ha-icon>
      </div>
    `}_goToToday(){this.dispatchEvent(new CustomEvent("day-click",{detail:{date:new Date},bubbles:!0,composed:!0}))}_goToNextDay(){const e=new Date(this.currentDate);e.setDate(e.getDate()+1),this.dispatchEvent(new CustomEvent("day-click",{detail:{date:e},bubbles:!0,composed:!0}))}_renderColumn(e,t){const i=function(e){const t=e.filter(e=>!ze(e)).sort((e,t)=>xe(e.start).getTime()-xe(t.start).getTime());if(0===t.length)return[];const i=t.map(e=>({event:e,start:xe(e.start).getTime(),end:xe(e.end).getTime(),column:0,cluster:0}));let s=0,r=0;for(let e=0;e<i.length;e++){let t=!1;for(let s=r;s<e;s++)if(i[e].start<i[s].end){t=!0;break}if(!t&&e>r){const t=e;let a=0;for(let e=r;e<t;e++)a=Math.max(a,i[e].column+1);for(let e=r;e<t;e++)i[e].cluster=s;s++,r=e}const a=new Set;for(let t=r;t<e;t++)i[e].start<i[t].end&&a.add(i[t].column);let o=0;for(;a.has(o);)o++;i[e].column=o}i.forEach((e,t)=>{t>=r&&(e.cluster=s)});const a=new Map;for(const e of i){const t=a.get(e.cluster)||0;a.set(e.cluster,Math.max(t,e.column+1))}return i.map(e=>({...e.event,column:e.column,totalColumns:a.get(e.cluster)||1}))}(t);return V`
      <div class="person-column">
        ${i.map(e=>{const t=function(e,t=0,i=24,s){const r=xe(e.start),a=xe(e.end),o=60*(i-t),n=s??r,l=new Date(n.getFullYear(),n.getMonth(),n.getDate(),t),d=new Date(n.getFullYear(),n.getMonth(),n.getDate(),i),c=e=>e<=l?0:e>=d?o:60*(e.getHours()-t)+e.getMinutes(),p=c(r),h=c(a),v=Math.max(h-p,15);return{top:p/o*100,height:v/o*100}}(e,0,24,this.currentDate),i=e.totalColumns>1?`calc(${100/e.totalColumns}% - 6px)`:"calc(100% - 6px)",s=e.totalColumns>1?`calc(${e.column/e.totalColumns*100}% + 3px)`:"3px",r=e.uid?this.sharedEventMap.get(e.uid):void 0,a=r&&r.length>1;return V`
            <div
              class="positioned-event${Se(e)?" past":""}"
              style="
                top: ${t.top}%;
                height: ${t.height}%;
                width: ${i};
                left: ${s};
                --event-color: ${e.calendar_color};
                --event-color-light: ${e.calendar_color_light||""};
                --event-text: ${Ie(e.calendar_color_light||e.calendar_color)};
              "
              @click=${()=>this._onEventClick(e)}
            >
              <div class="event-title">${e.summary}</div>
              <div class="event-time">${we(e.start,this.timeFormat)}</div>
              ${a?V`
                <div class="event-participants">
                  ${r.map(e=>{const t=e.person_entity?Qe(this.hass,e.person_entity):null,i=e.person_entity?Ze(this.hass,e.person_entity):e.calendar_name;return t?V`<img class="event-participant-avatar"
                          src="${t}" alt="${i}"
                          style="--participant-color: ${e.calendar_color}" />`:V`<div class="event-participant-initial"
                          style="background: ${e.calendar_color}; --participant-color: ${e.calendar_color}"
                        >${i[0]?.toUpperCase()||"?"}</div>`})}
                </div>
              `:q}
            </div>
          `})}
      </div>
    `}_onEventClick(e){this.dispatchEvent(new CustomEvent("event-click",{detail:{event:e},bubbles:!0,composed:!0}))}}function Et(e,t=48){return(Dt[e]||Dt.cloudy)(t)}Ct.styles=[Je,it,at,ot,o`
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
        height: ${1920}px;
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
        color: var(--pv-accent, #6366F1);
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
        color: var(--pv-accent, #6366F1);
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
    `],e([ve({attribute:!1})],Ct.prototype,"hass",void 0),e([ve({type:Array})],Ct.prototype,"events",void 0),e([ve({type:Array})],Ct.prototype,"calendars",void 0),e([ve({type:Object})],Ct.prototype,"currentDate",void 0),e([ve({type:Object})],Ct.prototype,"hiddenCalendars",void 0),e([ve({attribute:!1})],Ct.prototype,"timeFormat",void 0),e([ve({type:Boolean})],Ct.prototype,"hideColumnHeaders",void 0),e([ve({attribute:!1})],Ct.prototype,"avatarBorderMode",void 0),e([ve({attribute:!1})],Ct.prototype,"sharedEventMap",void 0),e([ve({type:Number})],Ct.prototype,"tick",void 0),ge("pv-view-day",Ct);const Dt={sunny:e=>V`
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
    </svg>`,"clear-night":e=>V`
    <svg width="${e}" height="${e}" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M38 14C30 14 23 20 21 28C20 31 20 35 21 38C23 44 28 49 35 50C38 51 41 51 44 50C36 52 27 48 23 40C19 32 21 22 28 16C31 14 34 13 38 14Z" fill="#94A3B8" />
      <circle cx="44" cy="16" r="1.5" fill="#94A3B8" opacity="0.6" />
      <circle cx="50" cy="24" r="1" fill="#94A3B8" opacity="0.4" />
      <circle cx="46" cy="32" r="1.2" fill="#94A3B8" opacity="0.5" />
    </svg>`,cloudy:e=>V`
    <svg width="${e}" height="${e}" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M48 40H18C13.6 40 10 36.4 10 32C10 27.6 13.6 24 18 24C18.2 24 18.5 24 18.7 24C20.2 18.6 25.2 15 31 15C37.9 15 43.5 19.9 44.2 26.5C44.8 26.3 45.4 26.2 46 26.2C49.3 26.2 52 28.9 52 32.2C52 32.2 52 32.2 52 32.3" fill="#CBD5E1" />
      <path d="M48 40H18C13.6 40 10 36.4 10 32C10 27.6 13.6 24 18 24C18.2 24 18.5 24 18.7 24C20.2 18.6 25.2 15 31 15C37.9 15 43.5 19.9 44.2 26.5C44.8 26.3 45.4 26.2 46 26.2C49.3 26.2 52 28.9 52 32.2V40C52 40 50 40 48 40Z" fill="#94A3B8" />
    </svg>`,partlycloudy:e=>V`
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
    </svg>`,rainy:e=>V`
    <svg width="${e}" height="${e}" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M48 34H18C13.6 34 10 30.4 10 26C10 21.6 13.6 18 18 18C18.2 18 18.5 18 18.7 18C20.2 12.6 25.2 9 31 9C37.9 9 43.5 13.9 44.2 20.5C44.8 20.3 45.4 20.2 46 20.2C49.3 20.2 52 22.9 52 26.2V34H48Z" fill="#94A3B8" />
      <g stroke="#60A5FA" stroke-width="2.5" stroke-linecap="round">
        <line x1="22" y1="40" x2="20" y2="48" class="pv-rain-drop" />
        <line x1="32" y1="40" x2="30" y2="48" class="pv-rain-drop" style="animation-delay: 0.3s" />
        <line x1="42" y1="40" x2="40" y2="48" class="pv-rain-drop" style="animation-delay: 0.6s" />
        <line x1="27" y1="48" x2="25" y2="56" class="pv-rain-drop" style="animation-delay: 0.15s" />
        <line x1="37" y1="48" x2="35" y2="56" class="pv-rain-drop" style="animation-delay: 0.45s" />
      </g>
    </svg>`,pouring:e=>V`
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
    </svg>`,snowy:e=>V`
    <svg width="${e}" height="${e}" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M48 32H18C13.6 32 10 28.4 10 24C10 19.6 13.6 16 18 16C18.2 16 18.5 16 18.7 16C20.2 10.6 25.2 7 31 7C37.9 7 43.5 11.9 44.2 18.5C44.8 18.3 45.4 18.2 46 18.2C49.3 18.2 52 20.9 52 24.2V32H48Z" fill="#94A3B8" />
      <circle cx="20" cy="42" r="2.5" fill="#BFDBFE" class="pv-snow-flake" />
      <circle cx="32" cy="40" r="2.5" fill="#BFDBFE" class="pv-snow-flake" style="animation-delay: 0.3s" />
      <circle cx="44" cy="43" r="2.5" fill="#BFDBFE" class="pv-snow-flake" style="animation-delay: 0.6s" />
      <circle cx="25" cy="52" r="2" fill="#BFDBFE" class="pv-snow-flake" style="animation-delay: 0.15s" />
      <circle cx="38" cy="51" r="2" fill="#BFDBFE" class="pv-snow-flake" style="animation-delay: 0.45s" />
    </svg>`,"snowy-rainy":e=>V`
    <svg width="${e}" height="${e}" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M48 32H18C13.6 32 10 28.4 10 24C10 19.6 13.6 16 18 16C18.2 16 18.5 16 18.7 16C20.2 10.6 25.2 7 31 7C37.9 7 43.5 11.9 44.2 18.5C44.8 18.3 45.4 18.2 46 18.2C49.3 18.2 52 20.9 52 24.2V32H48Z" fill="#94A3B8" />
      <g stroke="#60A5FA" stroke-width="2" stroke-linecap="round">
        <line x1="22" y1="38" x2="20" y2="46" class="pv-rain-drop" />
        <line x1="42" y1="38" x2="40" y2="46" class="pv-rain-drop" style="animation-delay: 0.3s" />
      </g>
      <circle cx="32" cy="42" r="2.5" fill="#BFDBFE" class="pv-snow-flake" style="animation-delay: 0.15s" />
      <circle cx="27" cy="52" r="2" fill="#BFDBFE" class="pv-snow-flake" style="animation-delay: 0.45s" />
      <circle cx="37" cy="50" r="2" fill="#BFDBFE" class="pv-snow-flake" style="animation-delay: 0.6s" />
    </svg>`,fog:e=>V`
    <svg width="${e}" height="${e}" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <g stroke="#94A3B8" stroke-width="3" stroke-linecap="round">
        <line x1="12" y1="24" x2="52" y2="24" opacity="0.4" />
        <line x1="16" y1="32" x2="48" y2="32" opacity="0.6" />
        <line x1="12" y1="40" x2="52" y2="40" opacity="0.8" />
        <line x1="18" y1="48" x2="46" y2="48" opacity="0.5" />
      </g>
    </svg>`,hail:e=>V`
    <svg width="${e}" height="${e}" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M48 30H18C13.6 30 10 26.4 10 22C10 17.6 13.6 14 18 14C18.2 14 18.5 14 18.7 14C20.2 8.6 25.2 5 31 5C37.9 5 43.5 9.9 44.2 16.5C44.8 16.3 45.4 16.2 46 16.2C49.3 16.2 52 18.9 52 22.2V30H48Z" fill="#94A3B8" />
      <circle cx="20" cy="40" r="3" fill="#93C5FD" stroke="#60A5FA" stroke-width="1" />
      <circle cx="32" cy="44" r="3" fill="#93C5FD" stroke="#60A5FA" stroke-width="1" />
      <circle cx="44" cy="38" r="3" fill="#93C5FD" stroke="#60A5FA" stroke-width="1" />
      <circle cx="26" cy="52" r="2.5" fill="#93C5FD" stroke="#60A5FA" stroke-width="1" />
      <circle cx="38" cy="54" r="2.5" fill="#93C5FD" stroke="#60A5FA" stroke-width="1" />
    </svg>`,lightning:e=>V`
    <svg width="${e}" height="${e}" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M48 30H18C13.6 30 10 26.4 10 22C10 17.6 13.6 14 18 14C18.2 14 18.5 14 18.7 14C20.2 8.6 25.2 5 31 5C37.9 5 43.5 9.9 44.2 16.5C44.8 16.3 45.4 16.2 46 16.2C49.3 16.2 52 18.9 52 22.2V30H48Z" fill="#64748B" />
      <path d="M34 30L28 42H34L30 56L42 40H36L40 30H34Z" fill="#FBBF24" stroke="#F59E0B" stroke-width="0.5" />
    </svg>`,"lightning-rainy":e=>V`
    <svg width="${e}" height="${e}" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M48 28H18C13.6 28 10 24.4 10 20C10 15.6 13.6 12 18 12C18.2 12 18.5 12 18.7 12C20.2 6.6 25.2 3 31 3C37.9 3 43.5 7.9 44.2 14.5C44.8 14.3 45.4 14.2 46 14.2C49.3 14.2 52 16.9 52 20.2V28H48Z" fill="#64748B" />
      <path d="M34 28L28 40H34L30 52L42 38H36L40 28H34Z" fill="#FBBF24" />
      <g stroke="#60A5FA" stroke-width="2" stroke-linecap="round">
        <line x1="18" y1="36" x2="16" y2="44" class="pv-rain-drop" style="animation-delay: 0.2s" />
        <line x1="48" y1="34" x2="46" y2="42" class="pv-rain-drop" style="animation-delay: 0.5s" />
        <line x1="22" y1="48" x2="20" y2="56" class="pv-rain-drop" style="animation-delay: 0.1s" />
        <line x1="44" y1="46" x2="42" y2="54" class="pv-rain-drop" style="animation-delay: 0.4s" />
      </g>
    </svg>`,windy:e=>V`
    <svg width="${e}" height="${e}" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <g stroke="#94A3B8" stroke-width="3" stroke-linecap="round">
        <path d="M10 24 Q30 24 38 20 Q46 16 48 20 Q50 24 46 24" fill="none" />
        <path d="M8 34 Q28 34 40 30 Q48 28 50 32 Q52 36 48 36" fill="none" />
        <path d="M14 44 Q30 44 36 40 Q42 36 44 40 Q46 44 42 44" fill="none" />
      </g>
    </svg>`,"windy-variant":e=>V`
    <svg width="${e}" height="${e}" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M48 28H22C17.6 28 14 24.4 14 20C14 15.6 17.6 12 22 12C22.2 12 22.5 12 22.7 12C24.2 7 28.8 4 34 4C40.3 4 45.5 8.5 46.2 14.5C46.8 14.3 47.4 14.2 48 14.2C51 14.2 53.5 16.7 53.5 19.7V28H48Z" fill="#CBD5E1" />
      <g stroke="#94A3B8" stroke-width="2.5" stroke-linecap="round">
        <path d="M8 36 Q28 36 36 33 Q44 30 46 34 Q48 38 44 38" fill="none" />
        <path d="M12 46 Q28 46 34 43 Q40 40 42 44 Q44 48 40 48" fill="none" />
      </g>
    </svg>`,exceptional:e=>V`
    <svg width="${e}" height="${e}" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="32" cy="32" r="20" stroke="#F59E0B" stroke-width="3" fill="none" />
      <line x1="32" y1="18" x2="32" y2="34" stroke="#F59E0B" stroke-width="3" stroke-linecap="round" />
      <circle cx="32" cy="42" r="2" fill="#F59E0B" />
    </svg>`};function St(e){try{const t=e();t&&"function"==typeof t.catch&&t.catch(()=>{})}catch{}}class zt{constructor(e){this._onForecast=e,this._entityId="",this._unsub=null,this._generation=0}update(e,t,i){if(!t||!e){const e=""!==this._entityId;return this.stop(),void(e&&this._onForecast([]))}if(t===this._entityId)return;this.stop(),this._entityId=t;const s=this._generation;e.subscribeMessage(e=>{s===this._generation&&this._onForecast(e?.forecast||[])},{type:"weather/subscribe_forecast",forecast_type:"daily",entity_id:t}).then(e=>{s===this._generation?this._unsub=e:St(e)}).catch(()=>{s===this._generation&&this._onForecast(i||[])})}stop(){if(this._generation++,this._entityId="",this._unsub){const e=this._unsub;this._unsub=null,St(e)}}}function At(e){const t=new Map;for(const i of e)i.datetime&&t.set(Ce(xe(i.datetime)),{condition:i.condition||"",tempHigh:i.temperature??0,tempLow:i.templow??i.temperature??0});return t}const Tt=["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];class Pt extends de{constructor(){super(...arguments),this.events=[],this.calendars=[],this.currentDate=new Date,this.hiddenCalendars=new Set,this.timeFormat="12h",this.firstDay="sunday",this.weatherEntity="",this.showStripes=!0,this.tick=0,this._forecast=[],this._forecastSub=new zt(e=>{this._forecast=e})}_getWeekDays(){const e=Fe(this.currentDate,this.firstDay);return Array.from({length:7},(t,i)=>{const s=new Date(e);return s.setDate(s.getDate()+i),s})}_getWeekLabel(e){const t=e[0],i=e[6],s={month:"long",day:"numeric"};return t.getMonth()===i.getMonth()?`${t.toLocaleDateString("en-US",{month:"long"})} ${t.getDate()} – ${i.getDate()}`:`${t.toLocaleDateString("en-US",s)} – ${i.toLocaleDateString("en-US",s)}`}connectedCallback(){super.connectedCallback(),this.hasUpdated&&this._syncForecast()}updated(e){super.updated(e),(e.has("weatherEntity")||e.has("hass"))&&this._syncForecast()}disconnectedCallback(){super.disconnectedCallback(),this._forecastSub.stop()}_syncForecast(){this._forecastSub.update(this.hass?.connection,this.weatherEntity,this.hass?.states?.[this.weatherEntity]?.attributes?.forecast)}render(){const e=Me(this.events,this.hiddenCalendars),t=this._getWeekDays(),i=new Date(t[0]);i.setHours(0,0,0,0);const s=new Date(t[6]);s.setHours(23,59,59,999);const r=De(Be(e,i,s),this.calendars),a=At(this._forecast);return V`
      <div class="week-container">
        <div class="week-label">${this._getWeekLabel(t)}</div>
        <div class="day-grid">
          ${t.map(e=>this._renderDayCard(e,r,a))}
        </div>
      </div>
    `}_renderDayCard(e,t,i){const s=ke(e),r=Ce(e),a=new Date(e);a.setHours(0,0,0,0);const o=new Date(e);o.setHours(23,59,59,999);const n=Be(t,a,o).sort(Te),l=i.get(r),d=`${Tt[e.getDay()]} ${e.getDate()}`,c=n.length;return V`
      <div class="day-card ${s?"day-card--today":""}">
        <div class="day-card-header">
          <div class="day-card-header-left">
            <div class="day-name">${d}</div>
            <div class="day-meta">
              <span>${c} event${1!==c?"s":""}</span>
              <button class="add-event-link" @click=${()=>this._addEvent(e)}>+ Add</button>
            </div>
          </div>
          ${l?V`
            <div class="day-weather">
              ${Et(l.condition)}
              <span class="day-weather-temp">${Math.round(l.tempHigh)}°/${Math.round(l.tempLow)}°</span>
            </div>
          `:q}
        </div>
        ${n.length>0?V`
          <div class="day-card-events">
            ${n.map(e=>V`
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
        `:V`
          <div class="day-card-empty">No events</div>
        `}
      </div>
    `}_addEvent(e){this.dispatchEvent(new CustomEvent("create-event",{detail:{date:e},bubbles:!0,composed:!0}))}_onEventClick(e){this.dispatchEvent(new CustomEvent("event-click",{detail:{event:e},bubbles:!0,composed:!0}))}}Pt.styles=[Je,ot,o`
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
        color: var(--pv-accent);
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
        color: var(--pv-accent);
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

      /* MD: tablets, 2 columns */
      @media (max-width: 1023px) {
        .day-grid { grid-template-columns: repeat(2, 1fr); }
      }

      /* SM/XS: phones, 1 column (agenda-like) */
      @media (max-width: 767px) {
        .day-grid {
          grid-template-columns: 1fr;
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
    `],e([ve({attribute:!1})],Pt.prototype,"hass",void 0),e([ve({type:Array})],Pt.prototype,"events",void 0),e([ve({type:Array})],Pt.prototype,"calendars",void 0),e([ve({type:Object})],Pt.prototype,"currentDate",void 0),e([ve({type:Object})],Pt.prototype,"hiddenCalendars",void 0),e([ve({attribute:!1})],Pt.prototype,"timeFormat",void 0),e([ve({attribute:!1})],Pt.prototype,"firstDay",void 0),e([ve({attribute:!1})],Pt.prototype,"weatherEntity",void 0),e([ve({type:Boolean})],Pt.prototype,"showStripes",void 0),e([ve({type:Number})],Pt.prototype,"tick",void 0),e([ue()],Pt.prototype,"_forecast",void 0),ge("pv-view-week",Pt);const Bt=["Sun","Mon","Tue","Wed","Thu","Fri","Sat"],Mt=["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];class Ot extends de{constructor(){super(...arguments),this.events=[],this.calendars=[],this.currentDate=new Date,this.hiddenCalendars=new Set,this.firstDay="sunday",this.timeFormat="12h",this.showStripes=!0,this.tick=0}render(){const e=De(Me(this.events,this.hiddenCalendars),this.calendars),t=function(e,t="sunday"){const i=Fe(new Date(e.getFullYear(),e.getMonth(),1),t),s=[];for(let e=0;e<42;e++){const t=new Date(i);t.setDate(i.getDate()+e),s.push(t)}return s}(this.currentDate,this.firstDay),i=Pe(e),s=this.currentDate.getMonth(),r="monday"===this.firstDay?Mt:Bt,a=this.currentDate.toLocaleDateString("en-US",{month:"long",year:"numeric"});return V`
      <div class="month-container">
        <div class="month-name">${a}</div>
        <div class="weekday-header">
          ${r.map(e=>V`<div class="weekday-name">${e}</div>`)}
        </div>
        <div class="month-grid">
          ${t.map(e=>this._renderDayCell(e,s,i))}
        </div>
      </div>
    `}_renderDayCell(e,t,i){const s=Ce(e),r=i.get(s)||[],a=e.getMonth()!==t,o=ke(e),n=r.slice(0,3),l=r.length-3;return V`
      <div
        class="day-cell ${a?"other-month":""} ${o?"today":""}"
        @click=${()=>this._onDayClick(e)}
      >
        <div class="day-number">${e.getDate()}</div>
        <div class="day-events">
          ${n.map(e=>V`
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
          ${l>0?V`
            <div class="more-events" @click=${t=>{t.stopPropagation(),this._onDayClick(e)}}>
              +${l} more
            </div>
          `:q}
        </div>
      </div>
    `}_onDayClick(e){this.dispatchEvent(new CustomEvent("day-click",{detail:{date:e},bubbles:!0,composed:!0}))}_onEventClick(e){this.dispatchEvent(new CustomEvent("event-click",{detail:{event:e},bubbles:!0,composed:!0}))}}Ot.styles=[Je,o`
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
        display: inline-block;
      }

      .day-cell.today .day-number {
        background: var(--pv-accent);
        color: var(--pv-accent-text);
        border-radius: var(--pv-radius-sm, 50%);
        width: 24px;
        height: 24px;
        display: inline-flex;
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
        font-size: 0.625rem;
        color: var(--pv-text-secondary);
        padding: 0 0.375rem;
        cursor: pointer;
        font-weight: 500;
      }

      .more-events:hover {
        color: var(--pv-accent);
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
    `],e([ve({attribute:!1})],Ot.prototype,"hass",void 0),e([ve({type:Array})],Ot.prototype,"events",void 0),e([ve({type:Array})],Ot.prototype,"calendars",void 0),e([ve({type:Object})],Ot.prototype,"currentDate",void 0),e([ve({type:Object})],Ot.prototype,"hiddenCalendars",void 0),e([ve({attribute:!1})],Ot.prototype,"firstDay",void 0),e([ve({attribute:!1})],Ot.prototype,"timeFormat",void 0),e([ve({type:Boolean})],Ot.prototype,"showStripes",void 0),e([ve({type:Number})],Ot.prototype,"tick",void 0),ge("pv-view-month",Ot);const It=["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];class Lt extends de{constructor(){super(...arguments),this.events=[],this.calendars=[],this.currentDate=new Date,this.hiddenCalendars=new Set,this.timeFormat="12h",this.weatherEntity="",this.showStripes=!0,this.tick=0,this._daysLoaded=14,this._forecast=[],this._forecastSub=new zt(e=>{this._forecast=e})}render(){const e=new Date;e.setHours(0,0,0,0);const t=[];for(let i=0;i<this._daysLoaded;i++){const s=new Date(e);s.setDate(s.getDate()+i),t.push(s)}const i=Pe(De(Me(this.events,this.hiddenCalendars),this.calendars)),s=At(this._forecast);return V`
      <div class="agenda-container">
        ${t.map(e=>this._renderDayCard(e,i,s))}
        <div class="load-more" @click=${this._loadMore}>
          Load more days
        </div>
      </div>
    `}_renderDayCard(e,t,i){const s=Ce(e),r=t.get(s)||[],a=ke(e),o=i.get(s),n=function(e){if(ke(e))return"Today";if(function(e){const t=new Date;return t.setDate(t.getDate()+1),e.getFullYear()===t.getFullYear()&&e.getMonth()===t.getMonth()&&e.getDate()===t.getDate()}(e))return"Tomorrow";const t=new Date,i=Math.floor((e.getTime()-t.getTime())/864e5);return i<7&&i>=0?e.toLocaleDateString("en-US",{weekday:"long"}):$e(e,"medium")}(e),l=$e(e,"long"),d=[...r].sort(Te);return V`
      <div class="day-card ${a?"day-card--today":""}">
        <div class="day-card-header">
          <div class="day-card-header-left">
            <span class="day-name ${a?"day-name--today":""}">
              ${It[e.getDay()]} ${e.getDate()}
            </span>
            ${n?V`<span class="day-relative">${n}</span>`:V`<span class="day-relative">${l}</span>`}
          </div>
          ${o?V`
            <div class="day-weather">
              ${Et(o.condition,20)}
              <span class="day-weather-temps">${Math.round(o.tempHigh)}°/${Math.round(o.tempLow)}°</span>
            </div>
          `:q}
        </div>
        <div class="day-subheader">
          <span>${d.length} event${1!==d.length?"s":""}</span>
          <button class="add-event-link" @click=${()=>this._addEvent(e)}>+ Add event</button>
        </div>
        <div class="day-events">
          ${d.length>0?d.map(e=>V`
                <pv-event-chip
                  .hass=${this.hass}
                  .event=${e}
                  .calendars=${this.calendars}
                  .timeFormat=${this.timeFormat}
                  .showStripes=${this.showStripes}
                  .tick=${this.tick}
                  @event-click=${e=>this._onEventClick(e.detail.event)}
                ></pv-event-chip>
              `):V`<div class="empty-day">No events</div>`}
        </div>
      </div>
    `}connectedCallback(){super.connectedCallback(),this.hasUpdated&&this._syncForecast()}updated(e){super.updated(e),(e.has("weatherEntity")||e.has("hass"))&&this._syncForecast()}disconnectedCallback(){super.disconnectedCallback(),this._forecastSub.stop()}_syncForecast(){this._forecastSub.update(this.hass?.connection,this.weatherEntity,this.hass?.states?.[this.weatherEntity]?.attributes?.forecast)}_loadMore(){this._daysLoaded+=14}_addEvent(e){this.dispatchEvent(new CustomEvent("create-event",{detail:{date:e},bubbles:!0,composed:!0}))}_onEventClick(e){this.dispatchEvent(new CustomEvent("event-click",{detail:{event:e},bubbles:!0,composed:!0}))}}Lt.styles=[Je,ot,o`
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
        color: var(--pv-accent);
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
        color: var(--pv-accent);
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
        color: var(--pv-accent);
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
    `],e([ve({attribute:!1})],Lt.prototype,"hass",void 0),e([ve({type:Array})],Lt.prototype,"events",void 0),e([ve({type:Array})],Lt.prototype,"calendars",void 0),e([ve({type:Object})],Lt.prototype,"currentDate",void 0),e([ve({type:Object})],Lt.prototype,"hiddenCalendars",void 0),e([ve({attribute:!1})],Lt.prototype,"timeFormat",void 0),e([ve({attribute:!1})],Lt.prototype,"weatherEntity",void 0),e([ve({type:Boolean})],Lt.prototype,"showStripes",void 0),e([ve({type:Number})],Lt.prototype,"tick",void 0),e([ue()],Lt.prototype,"_daysLoaded",void 0),e([ue()],Lt.prototype,"_forecast",void 0),ge("pv-view-agenda",Lt);class Ht extends de{constructor(){super(...arguments),this.event=null,this.timeFormat="12h",this._confirmDelete=!1,this._deleteMode=null,this._deleting=!1,this._deleteError="",this._organizerEntityId=null,this._storeSubscription=new kt(this,()=>this.store),this._lastOrganizerUid=""}updated(e){if(super.updated(e),e.has("event")&&this.event){const e=this.event.shared_calendars,t=this.event.uid||"";e&&e.length>1&&t&&t!==this._lastOrganizerUid?(this._lastOrganizerUid=t,this._organizerEntityId=null,this._fetchOrganizer(this.event.calendar_entity_id,t)):(!e||e.length<=1)&&(this._organizerEntityId=null,this._lastOrganizerUid="")}}async _fetchOrganizer(e,t){this._organizerEntityId=await Xe(this.hass,e,t)}render(){if(!this.event)return q;const e=this.event,t=ze(e),i=xe(e.start),s=e.shared_calendars,r=s&&s.length>1;return V`
      <div class="pv-overlay" @click=${this._close}>
        <div class="pv-popup" @click=${e=>e.stopPropagation()} style="position: relative;">
          <button class="pv-btn-icon close-btn" @click=${this._close}>
            <ha-icon icon="mdi:close"></ha-icon>
          </button>

          <div class="popup-header">
            <h3 class="popup-title">${e.summary}</h3>
            ${r?V`
              <div class="participants-row">
                ${s.map(e=>V`
                  <span class="participant-chip" style="background: ${e.calendar_color}">
                    ${e.calendar_name}
                    ${e.entity_id===this._organizerEntityId?V`<span class="organizer-tag">organizer</span>`:q}
                  </span>
                `)}
              </div>
            `:V`
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
                ${t?V`
                  <div style="color: var(--pv-text-secondary); font-size: 0.875rem">All Day</div>
                `:V`
                  <div style="color: var(--pv-text-secondary); font-size: 0.875rem">
                    ${we(e.start,this.timeFormat)} – ${we(e.end,this.timeFormat)}
                  </div>
                `}
              </div>
            </div>

            ${e.location?V`
              <div class="detail-row">
                <ha-icon icon="mdi:map-marker-outline"></ha-icon>
                <div class="detail-text">${e.location}</div>
              </div>
            `:q}

            ${e.description?V`
              <div class="detail-row">
                <ha-icon icon="mdi:text"></ha-icon>
                <div class="detail-text" style="white-space: pre-wrap;">${e.description}</div>
              </div>
            `:q}
          </div>

          ${this._confirmDelete?V`
            <div class="delete-confirm">
              ${this._deleteError?V`
                <div style="color: #EF4444; font-size: 0.8125rem; margin-bottom: 0.75rem;">${this._deleteError}</div>
              `:q}

              ${r&&!this._deleteMode?V`
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
              `:V`
                <div class="delete-confirm-text">
                  ${"all"===this._deleteMode&&r?`Delete "${e.summary}" from all ${s.length} calendars?`:"remove-me"===this._deleteMode&&r?`Remove "${e.summary}" from ${e.calendar_name}'s calendar only?`:`Delete "${e.summary}"?`}
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
          `:V`
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
    `}_close(){this._confirmDelete=!1,this._deleteMode=null,this._deleting=!1,this._deleteError="",this.store.selectEvent(null)}_edit(){this.event&&this.store.openEditDialog(this.event)}_openRemoveGuests(){this.event&&(this._confirmDelete=!1,this._deleteMode=null,this.store.openEditDialog(this.event,{removeGuests:!0}))}async _delete(){if(!this.event?.uid)return void(this._deleteError="Cannot delete this event: it has no unique ID. Delete it from your calendar app directly.");const e=this.event.shared_calendars,t=e&&e.length>1;this._deleting=!0,this._deleteError="";try{if(t&&"all"===this._deleteMode){for(const t of e)try{await Ke(this.hass,{entity_id:t.entity_id,uid:this.event.uid,recurrence_id:this.event.recurrence_id})}catch(e){console.warn(`[PlanaVista] Failed to delete from ${t.entity_id}:`,e)}await Ge(this.hass),this.store.selectEvent(null)}else if(t&&"remove-me"===this._deleteMode){const e=this.event.calendar_entity_id;await Ke(this.hass,{entity_id:e,uid:this.event.uid,recurrence_id:this.event.recurrence_id}),await Ge(this.hass),this.store.selectEvent(null)}else{const e={entity_id:this.event.calendar_entity_id,uid:this.event.uid,recurrence_id:this.event.recurrence_id};await this.store.doDeleteEvent(this.hass,e)}}catch(e){console.error("PlanaVista: Delete failed",e),this._deleteError="Failed to delete event. Please try again.",this._deleting=!1}}}function Nt(e){const t=[e.housenumber,e.street].filter(Boolean).join(" "),i=[];for(const s of[e.name,t,e.city,e.state,e.postcode,e.country]){const e=(s||"").trim();e&&!i.some(t=>t.toLowerCase()===e.toLowerCase())&&i.push(e)}return i.join(", ")}Ht.styles=[Je,tt,st,ot,o`
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
    `],e([ve({attribute:!1})],Ht.prototype,"hass",void 0),e([ve({type:Object})],Ht.prototype,"event",void 0),e([ve({attribute:!1})],Ht.prototype,"timeFormat",void 0),e([ue()],Ht.prototype,"_confirmDelete",void 0),e([ue()],Ht.prototype,"_deleteMode",void 0),e([ue()],Ht.prototype,"_deleting",void 0),e([ue()],Ht.prototype,"_deleteError",void 0),e([ue()],Ht.prototype,"_organizerEntityId",void 0),e([ve({attribute:!1})],Ht.prototype,"store",void 0),ge("pv-event-popup",Ht);class jt{constructor(e){this._opts=e,this._timer=null,this._abort=null,this._seq=0,this._fetch=e.fetchFn??((e,t)=>fetch(e,t))}input(e,t){this.cancel();const i=e.trim();if(!t||i.length<3)return this._opts.onResults([]),void this._opts.onLoading(!1);this._opts.onLoading(!0);const s=this._seq;this._timer=setTimeout(()=>{this._timer=null,this._run(i,s)},350)}cancel(){this._seq++,this._timer&&(clearTimeout(this._timer),this._timer=null),this._abort&&(this._abort.abort(),this._abort=null)}async _run(e,t){const i=new AbortController;this._abort=i;try{const r=await this._fetch((s=e,`https://photon.komoot.io/api/?q=${encodeURIComponent(s)}&limit=5&lang=en`),{signal:i.signal,credentials:"omit",referrerPolicy:"no-referrer"});if(!r.ok)throw new Error(`Photon HTTP ${r.status}`);const a=await r.json();t===this._seq&&this._opts.onResults(function(e){const t=e?.features;if(!Array.isArray(t))return[];const i=[];for(const e of t){const t=Nt(e?.properties||{});if(t&&!i.includes(t)&&i.push(t),5===i.length)break}return i}(a))}catch{t===this._seq&&this._opts.onResults([])}finally{t===this._seq&&(this._abort=null,this._opts.onLoading(!1))}var s}}const Ut=["Su","Mo","Tu","We","Th","Fr","Sa"];class Rt extends de{constructor(){super(...arguments),this.calendars=[],this.open=!1,this.mode="create",this.prefill=null,this.timeFormat="12h",this.locationAutocomplete=!1,this._title="",this._selectedCalendars=new Set,this._originalCalendars=new Set,this._organizerEntityId="",this._date="",this._startTime="",this._endTime="",this._allDay=!1,this._spanDays=1,this._endDayOffset=0,this._description="",this._location="",this._showMore=!1,this._saving=!1,this._error="",this._removeGuestsHint=!1,this._datePickerOpen=!1,this._pickerMonth=0,this._pickerYear=0,this._activeTimePicker=null,this._locationSuggestions=[],this._locationLoading=!1,this._locationFocused=!1,this._locationSearch=new jt({onResults:e=>{this._locationSuggestions=e},onLoading:e=>{this._locationLoading=e}}),this._storeSubscription=new kt(this,()=>this.store)}disconnectedCallback(){super.disconnectedCallback(),this._locationSearch.cancel()}updated(e){super.updated(e),e.has("locationAutocomplete")&&!this.locationAutocomplete&&this._resetLocationSearch(),e.has("open")&&this.open&&(this._initForm(),this._datePickerOpen=!1,requestAnimationFrame(()=>{this._titleInput?.focus()}))}_initForm(){if(this._error="",this._saving=!1,this._showMore=!1,this._resetLocationSearch(),this._locationFocused=!1,this._removeGuestsHint=!!this.prefill?._removeGuestsHint,this.prefill){this._title=this.prefill.summary||"",this._description=this.prefill.description||"",this._location=this.prefill.location||"";const e=this.prefill.shared_calendars;e&&e.length>0?this._selectedCalendars=new Set(e.map(e=>e.entity_id)):this.prefill.calendar_entity_id?this._selectedCalendars=new Set([this.prefill.calendar_entity_id]):this._selectedCalendars=new Set([this.calendars[0]?.entity_id].filter(Boolean)),this._originalCalendars=new Set(this._selectedCalendars),e&&e.length>1&&this.prefill.uid?(this._organizerEntityId="",this._fetchOrganizer(this.prefill.calendar_entity_id||"",this.prefill.uid)):this._organizerEntityId=this.prefill.calendar_entity_id||"",this.prefill.start?this._applyDates(function(e,t){const i=xe(e);if(_e(e)){const e=t?xe(t):i;return{date:Ce(i),allDay:!0,startTime:"09:00",endTime:"10:00",spanDays:Math.max(1,Ee(i,e)),endDayOffset:0}}const s=t?xe(t):new Date(i.getTime()+36e5);return{date:Ce(i),allDay:!1,startTime:pt(i),endTime:pt(s),spanDays:1,endDayOffset:Math.max(0,Ee(i,s))}}(this.prefill.start,this.prefill.end)):this._setDefaults(),(this._description||this._location)&&(this._showMore=!0)}else this._setDefaults()}async _fetchOrganizer(e,t){const i=await Xe(this.hass,e,t);i&&(this._organizerEntityId=i)}_setDefaults(){this._title="",this._selectedCalendars=new Set,this._originalCalendars=new Set,this._organizerEntityId="",this._applyDates(function(e){const t=new Date(e);t.setMinutes(15*Math.ceil(t.getMinutes()/15),0,0);const i=new Date(t.getTime()+36e5);return{date:Ce(t),allDay:!1,startTime:pt(t),endTime:pt(i),spanDays:1,endDayOffset:Ee(t,i)}}(new Date)),this._description="",this._location=""}get _formDates(){return{date:this._date,allDay:this._allDay,startTime:this._startTime,endTime:this._endTime,spanDays:this._spanDays,endDayOffset:this._endDayOffset}}_applyDates(e){this._date=e.date,this._allDay=e.allDay,this._startTime=e.startTime,this._endTime=e.endTime,this._spanDays=e.spanDays,this._endDayOffset=e.endDayOffset;const[t,i]=e.date.split("-").map(Number);this._pickerYear=t,this._pickerMonth=i-1}_toDateStr(e){return`${e.getFullYear()}-${String(e.getMonth()+1).padStart(2,"0")}-${String(e.getDate()).padStart(2,"0")}`}_renderEndsHint(){const e=this._formDates;if(!(e.allDay?e.spanDays>1:e.endDayOffset>0))return q;const[t,i,s]=function(e){return e.allDay?vt(e.date,Math.max(1,e.spanDays)-1):vt(e.date,e.endDayOffset)}(e).split("-").map(Number),r=new Date(t,i-1,s).toLocaleDateString("en-US",{weekday:"short",month:"short",day:"numeric"});return V`<div class="ends-hint">${e.allDay?`Through ${r} (${e.spanDays} days)`:`Ends ${r}`}</div>`}_formatDateDisplay(){if(!this._date)return"Select a date";const[e,t,i]=this._date.split("-").map(Number);return new Date(e,t-1,i).toLocaleDateString("en-US",{weekday:"short",month:"long",day:"numeric",year:"numeric"})}render(){if(!this.open)return q;const e=this.calendars.filter(e=>!1!==e.visible),t="edit"===this.mode,i=t?"Edit Event":"New Event";return V`
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
              ${this._error?V`<div class="error-msg">${this._error}</div>`:q}

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
                ${this._removeGuestsHint?V`
                  <div style="
                    display: flex; align-items: center; gap: 0.5rem;
                    padding: 0.5rem 0.75rem; margin-bottom: 0.5rem;
                    background: color-mix(in srgb, var(--pv-accent, #6366F1) 8%, transparent);
                    border: 1px solid color-mix(in srgb, var(--pv-accent, #6366F1) 20%, transparent);
                    border-radius: var(--pv-radius-sm, 8px);
                    font-size: 0.8125rem; color: var(--pv-text-secondary);
                  ">
                    <ha-icon icon="mdi:information-outline" style="--mdc-icon-size: 16px; color: var(--pv-accent, #6366F1); flex-shrink: 0;"></ha-icon>
                    Tap a guest to remove them from this event
                  </div>
                `:q}
                <div class="calendar-select">
                  ${e.map(e=>{const i=this._selectedCalendars.has(e.entity_id),s=e.entity_id===this._organizerEntityId,r=t&&s;return V`
                      <div class="cal-option-wrap">
                        ${s&&i?V`<span class="organizer-badge">Organizer</span>`:q}
                        <button
                          class="cal-option ${i?"selected":""} ${r?"locked":""}"
                          style="${i?`background: ${e.color}; --cal-bg: ${e.color}`:`--cal-bg: ${e.color}`}"
                          @click=${()=>this._toggleCalendar(e.entity_id)}
                        >
                          <span class="cal-dot" style="background: ${e.color}"></span>
                          ${e.display_name}
                          ${r?V`<ha-icon class="lock-icon" icon="mdi:lock-outline"></ha-icon>`:q}
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

              ${this._allDay?q:V`
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

              ${this._showMore?V`
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
              `:V`
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
    `}_renderDatePicker(){return V`
      <div class="date-picker-wrap">
        <div class="date-display" @click=${this._toggleDatePicker}>
          <ha-icon icon="mdi:calendar"></ha-icon>
          ${this._formatDateDisplay()}
        </div>
      </div>
    `}_renderDatePickerDropdown(){if(!this._datePickerOpen)return q;const e=this._dateDisplay;if(!e)return q;const t=e.getBoundingClientRect(),i=window.innerHeight-t.bottom-8<330&&t.top>330?t.top-330-4:t.bottom+4;return V`
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
          ${Ut.map(e=>V`<span class="picker-weekday">${e}</span>`)}
        </div>
        <div class="picker-days">
          ${this._getPickerDays().map(e=>{const t=e.getMonth()!==this._pickerMonth,i=this._toDateStr(e)===this._toDateStr(new Date),s=this._toDateStr(e)===this._date;return V`
              <button
                class="picker-day ${t?"other-month":""} ${i?"today":""} ${s?"selected":""}"
                @click=${()=>this._selectPickerDay(e)}
              >${e.getDate()}</button>
            `})}
        </div>
      </div>
    `}_toggleDatePicker(){if(this._activeTimePicker=null,this._datePickerOpen=!this._datePickerOpen,this._datePickerOpen&&this._date){const[e,t]=this._date.split("-").map(Number);this._pickerYear=e,this._pickerMonth=t-1}}_pickerPrevMonth(){this._pickerMonth--,this._pickerMonth<0&&(this._pickerMonth=11,this._pickerYear--)}_pickerNextMonth(){this._pickerMonth++,this._pickerMonth>11&&(this._pickerMonth=0,this._pickerYear++)}_getPickerDays(){const e=new Date(this._pickerYear,this._pickerMonth,1),t=e.getDay(),i=new Date(e);i.setDate(i.getDate()-t);const s=[];for(let e=0;e<42;e++){const t=new Date(i);t.setDate(t.getDate()+e),s.push(t)}return s}_selectPickerDay(e){this._date=this._toDateStr(e),this._datePickerOpen=!1}_formatTimeForDisplay(e){if(!e)return"Select time";const[t,i]=e.split(":").map(Number);if("24h"===this.timeFormat)return`${String(t).padStart(2,"0")}:${String(i).padStart(2,"0")}`;const s=t>=12?"PM":"AM";return`${t%12||12}:${String(i).padStart(2,"0")} ${s}`}_getTimeSlots(){const e=[];for(let t=0;t<24;t++)for(let i=0;i<60;i+=15)e.push(`${String(t).padStart(2,"0")}:${String(i).padStart(2,"0")}`);return e}_openTimePicker(e){this._datePickerOpen=!1,this._activeTimePicker=this._activeTimePicker===e?null:e,this._activeTimePicker&&this.updateComplete.then(()=>{const e=this.renderRoot.querySelector(".time-picker-dropdown"),t=e?.querySelector(".time-slot.selected");t&&e&&(e.scrollTop=t.offsetTop-e.clientHeight/2+t.clientHeight/2)})}_selectTime(e){if("start"===this._activeTimePicker){const t=function(e,t){const i={...e,startTime:t};if(0===e.endDayOffset&&e.endTime<=t){const[e,s]=t.split(":").map(Number);i.endTime=`${ct((e+1)%24)}:${ct(s)}`,i.endDayOffset=e+1>=24?1:0}else 1===i.endDayOffset&&i.endTime>t&&(i.endDayOffset=0);return i}(this._formDates,e);this._startTime=t.startTime,this._endTime=t.endTime,this._endDayOffset=t.endDayOffset}else{const t=function(e,t){const i={...e,endTime:t};return 1===e.endDayOffset&&t>e.startTime&&(i.endDayOffset=0),i}(this._formDates,e);this._endTime=t.endTime,this._endDayOffset=t.endDayOffset}this._activeTimePicker=null}_renderTimePickerDropdown(){if(!this._activeTimePicker)return q;const e="start"===this._activeTimePicker?this._startTimeEl:this._endTimeEl;if(!e)return q;const t=e.getBoundingClientRect(),i="start"===this._activeTimePicker?this._startTime:this._endTime,s=this._getTimeSlots(),r=window.innerHeight-t.bottom-8<280&&t.top>280?t.top-280-4:t.bottom+4;return V`
      <div
        class="time-picker-dropdown"
        style="top: ${r}px; left: ${t.left}px; width: ${t.width}px;"
      >
        ${s.map(e=>V`
          <div
            class="time-slot ${e===i?"selected":""}"
            @click=${()=>this._selectTime(e)}
          >${this._formatTimeForDisplay(e)}</div>
        `)}
      </div>
    `}_resetLocationSearch(){this._locationSearch.cancel(),this._locationSuggestions=[],this._locationLoading=!1}_renderLocationField(){return V`
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
    `}_renderLocationDropdown(){if(!this.locationAutocomplete||!this._locationFocused||!this._locationSuggestions.length&&!this._locationLoading)return q;const e=this._locationInput;if(!e)return q;const t=e.getBoundingClientRect();return V`
      <div
        class="location-suggestions-fixed"
        style="top: ${t.bottom}px; left: ${t.left}px; width: ${t.width}px;"
      >
        ${this._locationLoading?V`
          <div class="location-loading">Searching...</div>
        `:q}
        ${this._locationSuggestions.map(e=>V`
          <div class="location-suggestion" @mousedown=${()=>this._selectLocation(e)}>
            <ha-icon icon="mdi:map-marker"></ha-icon>
            <span>${e}</span>
          </div>
        `)}
        ${this._locationSuggestions.length>0?V`
          <div class="location-powered">Suggestions by Photon &middot; &copy; OpenStreetMap contributors</div>
        `:q}
      </div>
    `}_onLocationInput(e){const t=e.target.value;this._location=t,this._locationSearch.input(t,this.locationAutocomplete)}_selectLocation(e){this._resetLocationSearch(),this._location=e,this._locationFocused=!1}_toggleCalendar(e){if("edit"===this.mode&&e===this._organizerEntityId)return;const t=new Set(this._selectedCalendars);t.has(e)?(t.delete(e),e===this._organizerEntityId&&(this._organizerEntityId=t.size>0?[...t][0]:"")):(t.add(e),this._organizerEntityId||(this._organizerEntityId=e)),this._selectedCalendars=t,this._removeGuestsHint=!1}_onOverlayClick(){this._close()}_close(){this._datePickerOpen=!1,this._activeTimePicker=null,this._resetLocationSearch(),this.store.closeDialog()}async _editFallback(e,t,i){const s=this.prefill?.uid,r=this.prefill?.recurrence_id,a=this.prefill?.calendar_entity_id,o=[...t].filter(e=>!i.has(e)),n=[...i].filter(e=>!t.has(e)),l=[...t].filter(e=>i.has(e));if(a&&l.includes(a)&&s){const t=bt(this.prefill,a,e);await this.store.doEditEvent(this.hass,t.deleteData,t.createData,t.restoreData)}else a&&n.includes(a)&&s&&await Ke(this.hass,{entity_id:a,uid:s,recurrence_id:r});for(const t of l)if(t!==a){if(s)try{await Ke(this.hass,{entity_id:t,uid:s,recurrence_id:r})}catch{}await Ye(this.hass,{...e,entity_id:t})}for(const t of o)await Ye(this.hass,{...e,entity_id:t});for(const e of n)if(e!==a&&s)try{await Ke(this.hass,{entity_id:e,uid:s,recurrence_id:r})}catch{}await Ge(this.hass),this.store.selectedEvent=null,this.store.closeDialog()}async _save(){if(!this._title.trim())return void(this._error="Please enter an event title");if(0===this._selectedCalendars.size)return void(this._error="Please select at least one calendar");const e=function(e){if(!_e(e.date))return"Please pick a date";if(e.allDay)return null;if(!dt.test(e.startTime)||!dt.test(e.endTime))return"Please pick a start and end time";const t=ut(e.date,e.startTime);return ut(vt(e.date,e.endDayOffset),e.endTime)>t?null:"End time must be after start time"}(this._formDates);if(e)this._error=e;else{this._error="",this._saving=!0;try{const e=function(e,t){const i={summary:t.summary.trim(),...mt(e)},s=t.description?.trim(),r=t.location?.trim();return s&&(i.description=s),r&&(i.location=r),i}(this._formDates,{summary:this._title,description:this._description,location:this._location}),t=this._selectedCalendars,i=this._originalCalendars;if("edit"===this.mode){const s=this.prefill?.uid,r=i.size>1,a=this._organizerEntityId||this.prefill?.calendar_entity_id||"";if(r&&s&&a){const r=[...t];try{await async function(e,t){const i={type:"planavista/update_event",entity_id:t.entity_id,uid:t.uid};return void 0!==t.summary&&(i.summary=t.summary),void 0!==t.description&&(i.description=t.description),void 0!==t.location&&(i.location=t.location),t.start_date_time&&(i.start_date_time=t.start_date_time),t.end_date_time&&(i.end_date_time=t.end_date_time),t.start_date&&(i.start_date=t.start_date),t.end_date&&(i.end_date=t.end_date),t.attendee_entity_ids&&(i.attendee_entity_ids=t.attendee_entity_ids),e.callWS(i)}(this.hass,{entity_id:a,uid:s,summary:e.summary,description:e.description||"",location:e.location||"",start_date_time:e.start_date_time,end_date_time:e.end_date_time,start_date:e.start_date,end_date:e.end_date,attendee_entity_ids:r})}catch(s){console.warn("[PlanaVista] update_event WS failed, falling back to delete+recreate:",s),await this._editFallback(e,t,i)}const o=[...t,...i],n=this.hass;this.store.selectedEvent=null,this.store.closeDialog(),setTimeout(async()=>{try{const e=[...new Set(o)];for(const t of e)await n.callService("homeassistant","update_entity",{entity_id:t});await Ge(n)}catch{}},3e3)}else if(t.size>1&&s){const i=this.prefill,s=i.calendar_entity_id,r=a||[...t][0],o=[...t].filter(e=>e!==r);try{await xt({remove:()=>Ke(this.hass,gt(i,s)),create:()=>qe(this.hass,{...e,entity_id:r,attendee_entity_ids:o}),restore:()=>Ye(this.hass,yt(i,s))})}catch(e){throw await Ge(this.hass).catch(()=>{}),e}const n=[...t],l=this.hass;this.store.selectedEvent=null,this.store.closeDialog(),setTimeout(async()=>{try{for(const e of n)await l.callService("homeassistant","update_entity",{entity_id:e});await Ge(l)}catch{}},3e3)}else{const t=this.prefill?.calendar_entity_id||"",i=bt(this.prefill,t,e);await this.store.doEditEvent(this.hass,i.deleteData,i.createData,i.restoreData)}}else{const i=[...t];if(i.length>1){const s=this._organizerEntityId||i[0],r=i.filter(e=>e!==s);await qe(this.hass,{...e,entity_id:s,attendee_entity_ids:r}),this.store.closeDialog();const a=[...t],o=this.hass;setTimeout(async()=>{try{for(const e of a)await o.callService("homeassistant","update_entity",{entity_id:e});await Ge(o)}catch{}},3e3)}else{const t={...e,entity_id:i[0]};await this.store.doCreateEvent(this.hass,t)}}}catch(e){this._error=e instanceof ft?e.message:`Failed to save event: ${e?.message||"Unknown error"}`,this._saving=!1}}}}Rt.styles=[Je,tt,rt,st,ot,o`
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
        color: var(--pv-accent);
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
        color: var(--pv-accent);
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
    `],e([ve({attribute:!1})],Rt.prototype,"hass",void 0),e([ve({type:Array})],Rt.prototype,"calendars",void 0),e([ve({type:Boolean})],Rt.prototype,"open",void 0),e([ve({type:String})],Rt.prototype,"mode",void 0),e([ve({type:Object})],Rt.prototype,"prefill",void 0),e([ve({attribute:!1})],Rt.prototype,"timeFormat",void 0),e([ve({attribute:!1})],Rt.prototype,"locationAutocomplete",void 0),e([ue()],Rt.prototype,"_title",void 0),e([ue()],Rt.prototype,"_selectedCalendars",void 0),e([ue()],Rt.prototype,"_originalCalendars",void 0),e([ue()],Rt.prototype,"_organizerEntityId",void 0),e([ue()],Rt.prototype,"_date",void 0),e([ue()],Rt.prototype,"_startTime",void 0),e([ue()],Rt.prototype,"_endTime",void 0),e([ue()],Rt.prototype,"_allDay",void 0),e([ue()],Rt.prototype,"_spanDays",void 0),e([ue()],Rt.prototype,"_endDayOffset",void 0),e([ue()],Rt.prototype,"_description",void 0),e([ue()],Rt.prototype,"_location",void 0),e([ue()],Rt.prototype,"_showMore",void 0),e([ue()],Rt.prototype,"_saving",void 0),e([ue()],Rt.prototype,"_error",void 0),e([ue()],Rt.prototype,"_removeGuestsHint",void 0),e([ue()],Rt.prototype,"_datePickerOpen",void 0),e([ue()],Rt.prototype,"_pickerMonth",void 0),e([ue()],Rt.prototype,"_pickerYear",void 0),e([ue()],Rt.prototype,"_activeTimePicker",void 0),e([ue()],Rt.prototype,"_locationSuggestions",void 0),e([ue()],Rt.prototype,"_locationLoading",void 0),e([ue()],Rt.prototype,"_locationFocused",void 0),e([ve({attribute:!1})],Rt.prototype,"store",void 0),e([me("#title-input")],Rt.prototype,"_titleInput",void 0),e([me(".location-input")],Rt.prototype,"_locationInput",void 0),e([me(".date-display")],Rt.prototype,"_dateDisplay",void 0),e([me(".start-time-display")],Rt.prototype,"_startTimeEl",void 0),e([me(".end-time-display")],Rt.prototype,"_endTimeEl",void 0),ge("pv-event-create-dialog",Rt);class Vt extends de{constructor(){super(...arguments),this.data=null,this.previewOverrides=null,this.canOpenSettings=!1,this._tick=Math.floor(Date.now()/6e4),this._filterOpen=!1,this._refreshing=!1,this._pv=new $t(this),this._viewInitialized=!1,this._tickTimer=null,this._touchStart=null,this._filterCloseHandler=e=>this._onFilterClickOutside(e),this._derive=lt((e,t,i)=>function(e,t,i){const s=Ft(e,t),r=e?.events||[],a=new Map;for(const e of r){const t=e.uid;if(!t)continue;a.has(t)||a.set(t,[]);const i=a.get(t),r=e.calendar_entity_id;if(!i.some(e=>e.entity_id===r)){const t=s.find(e=>e.entity_id===r);i.push({entity_id:r,calendar_name:e.calendar_name||t?.display_name||"",calendar_color:e.calendar_color||t?.color||"",person_entity:t?.person_entity||""})}}return{calendars:s,visibleEvents:Me(r,i),sharedEventMap:a}}(e,t,i))}connectedCallback(){super.connectedCallback(),this._tick=Math.floor(Date.now()/6e4),this._scheduleTick()}disconnectedCallback(){super.disconnectedCallback(),this._tickTimer&&(clearTimeout(this._tickTimer),this._tickTimer=null),document.removeEventListener("click",this._filterCloseHandler)}_scheduleTick(){this._tickTimer&&clearTimeout(this._tickTimer),this._tickTimer=setTimeout(()=>{this._tick=Math.floor(Date.now()/6e4),this._scheduleTick()},6e4-Date.now()%6e4+50)}willUpdate(e){if(e.has("cardConfig")){const e=this.cardConfig?.view||this.cardConfig?.default_view;e&&this._pv.store.setView(e)}if(!this._viewInitialized&&this.data){const e=(t=this.cardConfig,i=this.data,t?.view||t?.default_view||i?.display?.default_view||void 0);e&&this._pv.store.setView(e),this._viewInitialized=!0}var t,i}_derived(){return this._derive(this.data,this.cardConfig,this._pv.store.hiddenCalendars)}render(){if(!this.hass||!this.display)return q;const{calendars:e,visibleEvents:t}=this._derived(),i=this._pv.store,s=this.display;return V`
      ${this._renderToolbar(e,i.currentView)}
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

      ${i.selectedEvent?V`
        <pv-event-popup
          .store=${i}
          .hass=${this.hass}
          .event=${i.selectedEvent}
          .timeFormat=${s?.time_format||"12h"}
        ></pv-event-popup>
      `:q}

      ${i.dialogOpen?V`
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
      `:q}
    `}_renderToolbar(e,t){const i=e.filter(e=>this._pv.store.hiddenCalendars.has(e.entity_id)).length;return V`
      <div class="pvc-toolbar">
        <div class="pvc-filter-wrap">
          <button
            class="pvc-filter-btn ${i>0?"has-hidden":""}"
            @click=${this._toggleFilterDropdown}
          >
            <ha-icon icon="mdi:filter-variant" style="--mdc-icon-size: 20px"></ha-icon>
            Calendars
            ${i>0?V`<span class="pvc-filter-badge">${e.length-i}/${e.length}</span>`:q}
          </button>

          ${this._filterOpen?V`
            <div class="pvc-filter-panel">
              ${e.map(e=>{const t=!this._pv.store.hiddenCalendars.has(e.entity_id),i=e.person_entity?Qe(this.hass,e.person_entity):null,s=e.display_name||(e.person_entity?Ze(this.hass,e.person_entity):e.entity_id),r=(s||"?")[0].toUpperCase();return V`
                  <div
                    class="pvc-filter-item ${t?"active":""}"
                    style="--item-color: ${e.color}"
                    @click=${()=>this._pv.store.toggleCalendar(e.entity_id)}
                  >
                    <div class="pvc-filter-check">
                      ${t?V`<span class="pvc-filter-check-icon">✓</span>`:q}
                    </div>
                    <div
                      class="pvc-filter-avatar"
                      style="${i?`background-image: url(${i}); background-color: ${e.color}`:`background: ${e.color}`}"
                    >${i?"":r}</div>
                    <span class="pvc-filter-name">${s}</span>
                  </div>
                `})}
            </div>
          `:q}
        </div>

        <!-- Mobile inline calendar chips (shown on xs/sm via CSS) -->
        <div class="pvc-cal-strip">
          ${e.map(e=>{const t=!this._pv.store.hiddenCalendars.has(e.entity_id),i=e.person_entity?Qe(this.hass,e.person_entity):null,s=e.display_name||(e.person_entity?Ze(this.hass,e.person_entity):e.entity_id),r=(s||"?")[0].toUpperCase();return V`
              <button
                class="pvc-cal-chip ${t?"active":""}"
                style="--chip-color: ${e.color}"
                @click=${()=>this._pv.store.toggleCalendar(e.entity_id)}
              >
                <div
                  class="pvc-cal-chip-avatar"
                  style="${i?`background-image: url(${i}); background-color: ${e.color}`:`background: ${e.color}`}"
                >${i?"":r}</div>
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

          <div class="pvc-view-tabs">
            ${["day","week","month","agenda"].map(e=>V`
              <button
                class="pvc-view-tab ${t===e?"active":""}"
                @click=${()=>this._pv.store.setView(e)}
              >${e}</button>
            `)}
          </div>

          <button class="pvc-refresh-btn ${this._refreshing?"spinning":""}"
            @click=${this._refreshCalendars}
            title="Refresh calendars" aria-label="Refresh calendars"
            ?disabled=${this._refreshing}>
            <ha-icon icon="mdi:autorenew"></ha-icon>
          </button>
          ${this.canOpenSettings?V`
            <button class="pvc-settings-btn" @click=${this._openSettings}
              title="Settings" aria-label="Open settings">
              <ha-icon icon="mdi:cog"></ha-icon>
            </button>
          `:q}
        </div>
      </div>
    `}_toggleFilterDropdown(e){e.stopPropagation(),this._filterOpen=!this._filterOpen,this._filterOpen?requestAnimationFrame(()=>{document.addEventListener("click",this._filterCloseHandler)}):document.removeEventListener("click",this._filterCloseHandler)}_onFilterClickOutside(e){const t=e.composedPath(),i=this.shadowRoot?.querySelector(".pvc-filter-panel"),s=this.shadowRoot?.querySelector(".pvc-filter-btn");i&&!t.includes(i)&&s&&!t.includes(s)&&(this._filterOpen=!1,document.removeEventListener("click",this._filterCloseHandler))}_renderView(e,t,i,s){const r=s?.time_format||"12h",a=s?.first_day||"sunday",o=this._pv.store.currentDate,n=this._pv.store.hiddenCalendars,l=this.previewOverrides||s?.theme_overrides,d=l?.avatar_border||"primary",c="stripes"===(l?.event_style||"stripes");switch(e){case"day":{const{sharedEventMap:e}=this._derived(),s=this._tick;return V`<pv-view-day
          .hass=${this.hass}
          .events=${t}
          .calendars=${i}
          .currentDate=${o}
          .hiddenCalendars=${n}
          .timeFormat=${r}
          .hideColumnHeaders=${!1}
          .avatarBorderMode=${d}
          .sharedEventMap=${e}
          .tick=${s}
        ></pv-view-day>`}case"week":{const e=this._tick;return V`<pv-view-week
          .hass=${this.hass}
          .events=${t}
          .calendars=${i}
          .currentDate=${o}
          .hiddenCalendars=${n}
          .timeFormat=${r}
          .firstDay=${a}
          .weatherEntity=${s?.weather_entity||""}
          .showStripes=${c}
          .tick=${e}
        ></pv-view-week>`}case"month":{const e=this._tick;return V`<pv-view-month
          .hass=${this.hass}
          .events=${t}
          .calendars=${i}
          .currentDate=${o}
          .hiddenCalendars=${n}
          .firstDay=${a}
          .timeFormat=${r}
          .showStripes=${c}
          .tick=${e}
        ></pv-view-month>`}case"agenda":{const e=this._tick;return V`<pv-view-agenda
          .hass=${this.hass}
          .events=${t}
          .calendars=${i}
          .currentDate=${o}
          .hiddenCalendars=${n}
          .timeFormat=${r}
          .weatherEntity=${s?.weather_entity||""}
          .showStripes=${c}
          .tick=${e}
        ></pv-view-agenda>`}default:return q}}_onEventClick(e){const t=e.detail.event;if(t.uid){const e=(this.data?.events||[]).filter(e=>e.uid===t.uid&&""!==e.uid),i=new Set,s=e.filter(e=>!i.has(e.calendar_entity_id)&&(i.add(e.calendar_entity_id),!0));if(s.length>1){const e={...t,shared_calendars:s.map(e=>({entity_id:e.calendar_entity_id,calendar_name:e.calendar_name,calendar_color:e.calendar_color}))};return void this._pv.store.selectEvent(e)}}this._pv.store.selectEvent(t)}_onCreateEvent(e){const t=e.detail?.date,i={};if(t){const e=t.getFullYear(),s=String(t.getMonth()+1).padStart(2,"0"),r=String(t.getDate()).padStart(2,"0");i.start=`${e}-${s}-${r}T09:00:00`,i.end=`${e}-${s}-${r}T10:00:00`}this._pv.store.openCreateDialog(i)}_onDayClick(e){this._pv.store.setDate(e.detail.date),this._pv.store.setView("day")}_onTouchStart(e){this._touchStart=1===e.touches.length?{x:e.touches[0].clientX,y:e.touches[0].clientY}:null}_onTouchEnd(e){const t=this._touchStart;if(this._touchStart=null,!t||e.touches.length>0||1!==e.changedTouches.length)return;const i=e.changedTouches[0],s=(r=i.clientX-t.x,a=i.clientY-t.y,Math.abs(r)<=50||Math.abs(r)<=2*Math.abs(a)?null:r>0?"prev":"next");var r,a;s&&this._pv.store.navigateDate(s)}_onTouchCancel(){this._touchStart=null}_openSettings(){this.dispatchEvent(new CustomEvent("pv-open-settings",{bubbles:!0,composed:!0}))}async _refreshCalendars(){if(!this._refreshing){this._refreshing=!0;try{for(const e of this.data?.calendars||[])e.entity_id&&await this.hass.callService("homeassistant","update_entity",{entity_id:e.entity_id});await this.hass.callService("homeassistant","update_entity",{entity_id:this.cardConfig?.entity||"sensor.planavista_config"})}catch{}setTimeout(()=>{this._refreshing=!1},800)}}}Vt.styles=[Je,tt,et,ot,o`
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
        color: var(--pv-accent);
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
        color: white;
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
        color: white;
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

/* View switcher */

      .pvc-view-tabs {
        display: flex;
        background: var(--pv-border-subtle);
        border-radius: var(--pv-radius-sm, 8px);
        padding: 2px;
      }

      .pvc-view-tab {
        padding: 6px 14px;
        border: none;
        border-radius: var(--pv-radius-sm, 6px);
        background: transparent;
        color: var(--pv-text-secondary);
        font-size: 0.8125rem;
        font-weight: 600;
        cursor: pointer;
        transition: all 200ms ease;
        font-family: inherit;
        text-transform: capitalize;
        min-height: 36px;
        -webkit-tap-highlight-color: transparent;
      }

      .pvc-view-tab.active {
        background: var(--pv-card-bg);
        color: var(--pv-text);
        box-shadow: var(--pv-shadow);
      }

      .pvc-view-tab:hover:not(.active) {
        color: var(--pv-text);
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

      .pvc-refresh-btn,
      .pvc-settings-btn {
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

      .pvc-refresh-btn:hover,
      .pvc-settings-btn:hover {
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

/* xs: phones (≤479px), date-only header, avatar strip, compact controls */

      @media (max-width: 479px){
/* Toolbar */
        .pvc-toolbar {
          flex-wrap: wrap;
          justify-content: center;
          padding: 8px 10px;
          gap: 6px;
        }
/* Hide desktop filter dropdown, show inline avatar strip */
        .pvc-filter-wrap { display: none; }
        .pvc-cal-strip {
          display: flex;
          align-items: center;
          gap: 6px;
          width: 100%;
          overflow-x: auto;
          -webkit-overflow-scrolling: touch;
          scrollbar-width: none;
          padding-bottom: 2px;
        }
        .pvc-cal-strip::-webkit-scrollbar { display: none; }
        .pvc-controls {
          width: 100%;
          justify-content: center;
          flex-wrap: wrap;
          gap: 4px;
        }
        .pvc-new-btn {
          padding: 6px 12px;
          font-size: 0.8125rem;
          min-height: 34px;
        }
        .pvc-today-btn {
          padding: 4px 10px;
          font-size: 0.8125rem;
          min-height: 32px;
        }
        .pvc-nav-btn {
          width: 34px;
          height: 34px;
        }
        .pvc-view-tab {
          padding: 4px 8px;
          font-size: 0.6875rem;
          min-height: 30px;
        }
        .pvc-settings-btn {
          width: 34px;
          height: 34px;
        }
      }

/* sm: large phones (480–767px), compact header, avatar strip */

      @media (min-width: 480px) and (max-width: 767px){
/* Show avatar strip, hide dropdown */
        .pvc-filter-wrap { display: none; }
        .pvc-cal-strip {
          display: flex;
          align-items: center;
          gap: 8px;
          width: 100%;
          overflow-x: auto;
          -webkit-overflow-scrolling: touch;
          scrollbar-width: none;
        }
        .pvc-cal-strip::-webkit-scrollbar { display: none; }
        .pvc-toolbar {
          flex-wrap: wrap;
          justify-content: center;
          gap: 6px;
        }
        .pvc-controls {
          width: 100%;
          justify-content: center;
          flex-wrap: wrap;
        }
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
        color: white;
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
        .pvc-view-tab { padding: 8px 16px; font-size: 0.9375rem; min-height: 44px; }
        .pvc-settings-btn { width: 48px; height: 48px; --mdc-icon-size: 24px; }
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
        .pvc-view-tab { padding: 10px 20px; font-size: 1.0625rem; min-height: 52px; }
        .pvc-settings-btn { width: 56px; height: 56px; --mdc-icon-size: 28px; }
      }
    `],e([ve({attribute:!1})],Vt.prototype,"hass",void 0),e([ve({attribute:!1})],Vt.prototype,"cardConfig",void 0),e([ve({attribute:!1})],Vt.prototype,"data",void 0),e([ve({attribute:!1})],Vt.prototype,"display",void 0),e([ve({attribute:!1})],Vt.prototype,"previewOverrides",void 0),e([ve({type:Boolean})],Vt.prototype,"canOpenSettings",void 0),e([ue()],Vt.prototype,"_tick",void 0),e([ue()],Vt.prototype,"_filterOpen",void 0),e([ue()],Vt.prototype,"_refreshing",void 0),ge("pv-calendar-module",Vt);const Wt=o`
.page-content {
        max-width: 560px;
        margin: 0 auto;
        animation: pv-slideLeft 250ms ease forwards;
      }
.page-title {
        font-size: 1.375rem;
        font-weight: 700;
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
        color: var(--pv-accent, #6366F1);
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
`;class Yt{constructor(e){this._onView=e,this._unsub=null,this._generation=0}update(e){if(e===this._connection)return;if(this.stop(),this._connection=e,!e)return;const t=this._generation;e.subscribeMessage(e=>{t===this._generation&&this._onView(e)},{type:"planavista/household/subscribe"}).then(e=>{t===this._generation?this._unsub=e:St(e)}).catch(()=>{t===this._generation&&this._onView(null)})}stop(){if(this._generation++,this._connection=void 0,this._unsub){const e=this._unsub;this._unsub=null,St(e)}}}class qt{constructor(e,t){this._ws=e,this._session=t}_call(e,t,i=!0){const s={type:e,...t},r=i?this._session():null;return r&&(s.session=r),this._ws.callWS(s)}saveMember(e,t){const i={member:e};return t&&Object.assign(i,{member_id:t.id,rev:t.rev}),this._call("planavista/household/member/save",i)}deleteMember(e){return this._call("planavista/household/member/delete",{member_id:e})}reorder(e){return this._call("planavista/household/member/reorder",{order:e})}setSharedScreen(e){return this._call("planavista/household/shared_screen",{shared:e})}saveSecurity(e){return this._call("planavista/household/settings/save",e)}saveSetup(e){return this._call("planavista/household/setup/save",e)}saveConfig(e){return this._call("planavista/config/save",e)}unlock(e,t){return this._call("planavista/pin/unlock",{member_id:e,pin:t},!1)}setPin(e,t){return this._call("planavista/pin/set",{member_id:e,pin:t})}clearPin(e){return this._call("planavista/pin/clear",{member_id:e})}clearPause(e){return this._call("planavista/pin/clear_lockout",{member_id:e})}lock(e){return this._call("planavista/pin/lock",{session:e},!1)}touch(e){return this._call("planavista/pin/touch",{session:e},!1)}}function Kt(e){return e&&"object"==typeof e&&"string"==typeof e.code?e.code:"unknown"}const Gt="pv-push-page",Xt="pv-pop-page",Qt="pv-page-error";function Zt(e){switch(e){case"parent_mode_required":return"Parent mode ended. Enter a parent's PIN to keep changing settings.";case"not_allowed":return"Only a parent can change this.";case"unavailable":return"Update PlanaVista to change people and PINs.";default:return"Couldn't save. Check the connection and try again."}}class Jt extends de{constructor(){super(...arguments),this.household=null,this.layout="landscape",this.mode="settings",this._loaded=!1}willUpdate(){!this._loaded&&this.data?.display&&(this._draft={...this.data.display},this._loaded=!0)}_apply(e){this._draft={...this._draft,...e},this.api.saveConfig({display:{...this.data.display,...this._draft}}).catch(e=>this._error(e))}_error(e){this.dispatchEvent(new CustomEvent(Qt,{detail:{message:Zt(Kt(e))},bubbles:!0,composed:!0}))}get _weatherEntities(){return this.hass?Object.keys(this.hass.states).filter(e=>e.startsWith("weather.")).sort():[]}_entityLabel(e){return this.hass?.states[e]?.attributes?.friendly_name||e}_toggleLocationAutocomplete(){this._apply({location_autocomplete:!this._draft.location_autocomplete})}_renderPreferences(){return V`
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
            ${this._weatherEntities.map(e=>V`
              <option value="${e}" ?selected=${this._draft.weather_entity===e}>${this._entityLabel(e)}</option>
            `)}
          </select>
        </div>

        <!-- Default View -->
        <div class="field-group">
          <label class="pv-label">Default View</label>
          <div class="view-grid" role="group" aria-label="Default calendar view">
            ${[{key:"day",label:"Day",icon:"M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V9h14v11zm-7-7c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"},{key:"week",label:"Week",icon:"M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zM7 12h2v6H7zm4 0h2v6h-2zm4 0h2v6h-2z"},{key:"month",label:"Month",icon:"M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zM9 14H7v-2h2v2zm4 0h-2v-2h2v2zm4 0h-2v-2h2v2zm-8 4H7v-2h2v2zm4 0h-2v-2h2v2zm4 0h-2v-2h2v2z"},{key:"agenda",label:"Agenda",icon:"M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zM7 7v2h14V7H7z"}].map(e=>V`
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
    `}render(){return this._loaded?this._renderPreferences():q}}Jt.styles=[Je,tt,rt,ot,Wt,o`
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
        color: var(--pv-accent, #6366F1);
      }
@media (max-width: 479px) {
.field-group { margin-bottom: 1rem; }
.view-grid { grid-template-columns: repeat(2, 1fr); }
}
    `],e([ve({attribute:!1})],Jt.prototype,"hass",void 0),e([ve({attribute:!1})],Jt.prototype,"data",void 0),e([ve({attribute:!1})],Jt.prototype,"household",void 0),e([ve({attribute:!1})],Jt.prototype,"api",void 0),e([ve({attribute:!1})],Jt.prototype,"layout",void 0),e([ve({type:String})],Jt.prototype,"mode",void 0),e([ue()],Jt.prototype,"_draft",void 0),ge("pv-calendar-options-page",Jt);const ei={young_child:"Young child",older_child:"Older child",teen:"Teen",adult:"Adult"},ti=[{id:"young_child",label:"Young child",hint:"About 4 to 8"},{id:"older_child",label:"Older child",hint:"About 9 to 12"},{id:"teen",label:"Teen",hint:""},{id:"adult",label:"Adult",hint:""}],ii=[{id:"parent",label:"Parent"},{id:"adult",label:"Adult"},{id:"teen",label:"Teen"},{id:"older_child",label:"Older child"},{id:"young_child",label:"Young child"}];function si(e){return e.parent?"parent":e.age_group}function ri(e){return"parent"===e?{age_group:"adult",parent:!0}:{age_group:e,parent:!1}}function ai(e){return[...e].sort((e,t)=>e.order-t.order||e.id.localeCompare(t.id))}function oi(e){const t=[...e.trim()][0];return t?t.toLocaleUpperCase():"?"}function ni(e){return ai(e).filter(e=>e.parent&&e.has_pin)}function li(e,t){return t.filter(t=>t.member_id===e)}function di(e,t){const i=new Map;for(const s of e)s.id!==t&&i.set(s.color.toUpperCase(),s);return i}class ci extends de{constructor(){super(...arguments),this.value="",this.valueLight="",this._isCustom=!1}updated(e){if(super.updated(e),e.has("value")&&this.value){const e=ci.PRESETS.some(e=>e.color.toLowerCase()===this.value.toLowerCase());this._isCustom=!e}}_selectPreset(e){this._isCustom=!1,this._emit(e.color,e.light)}_openCustomPicker(){this._colorInput?.click()}_onCustomColorChange(e){const t=e.target.value,i=function(e){let t=e.replace("#","");if(3===t.length&&(t=t.split("").map(e=>e+e).join("")),6!==t.length)return e;const i=parseInt(t.substring(0,2),16),s=parseInt(t.substring(2,4),16),r=parseInt(t.substring(4,6),16);if(isNaN(i)||isNaN(s)||isNaN(r))return e;const a=Math.round(i+.65*(255-i)),o=Math.round(s+.65*(255-s)),n=Math.round(r+.65*(255-r)),l=e=>e.toString(16).padStart(2,"0");return`#${l(a)}${l(o)}${l(n)}`}(t);this._isCustom=!0,this._emit(t,i)}_emit(e,t){this.value=e,this.valueLight=t,this.dispatchEvent(new CustomEvent("color-change",{detail:{color:e,colorLight:t},bubbles:!0,composed:!0}))}_isSelected(e){return this.value.toLowerCase()===e.toLowerCase()}render(){const e=ci.PRESETS,t=this._isCustom?this.value:"",i=this._isCustom&&!!this.value;return V`
      <div class="swatch-grid" role="group" aria-label="Color presets">
        ${e.map(e=>{const t=this._isSelected(e.color);return V`
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
            ${t?"":V`<span aria-hidden="true">+</span>`}
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
    `}}ci.PRESETS=[{name:"Ink Black",color:"#001219",light:"#A6ACAF"},{name:"Dark Teal",color:"#005F73",light:"#A6C7CE"},{name:"Dark Cyan",color:"#0A9396",light:"#A9D9DA"},{name:"Pearl Aqua",color:"#94D2BD",light:"#DAEFE8"},{name:"Wheat",color:"#E9D8A6",light:"#F7F1E0"},{name:"Golden Orange",color:"#EE9B00",light:"#F9DCA6"},{name:"Burnt Caramel",color:"#CA6702",light:"#ECCAA6"},{name:"Rusty Spice",color:"#BB3E03",light:"#E7BBA7"},{name:"Oxidized Iron",color:"#AE2012",light:"#E3B1AC"},{name:"Brown Red",color:"#9B2226",light:"#DCB2B3"},{name:"Strawberry Red",color:"#F94144",light:"#FDBDBE"},{name:"Pumpkin Spice",color:"#F3722C",light:"#FBCEB5"},{name:"Carrot Orange",color:"#F8961E",light:"#FDDAB0"},{name:"Atomic Tangerine",color:"#F9844A",light:"#FDD4C0"},{name:"Tuscan Sun",color:"#F9C74F",light:"#FDEBC1"},{name:"Willow Green",color:"#90BE6D",light:"#D8E8CC"},{name:"Seaweed",color:"#43AA8B",light:"#BDE1D6"},{name:"Ocean Cyan",color:"#4D908E",light:"#C1D8D7"},{name:"Blue Slate",color:"#577590",light:"#C4CFD8"},{name:"Cerulean",color:"#277DA1",light:"#B3D2DE"}],ci.styles=[Je,o`
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
        color: var(--pv-accent, #6366F1);
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
    `],e([ve({type:String})],ci.prototype,"value",void 0),e([ve({type:String})],ci.prototype,"valueLight",void 0),e([ue()],ci.prototype,"_isCustom",void 0),e([me("#custom-color-input")],ci.prototype,"_colorInput",void 0),ge("pv-color-swatch-picker",ci);const pi=new Set(["state","attributes"]);class hi extends de{constructor(){super(...arguments),this.household=null,this.layout="landscape",this.mode="settings",this._rows=[],this._dragIdx=null,this._dragOverIdx=null,this._built=!1}willUpdate(){if(!this._built&&this.hass&&this.data){const e=Object.keys(this.hass.states).filter(e=>e.startsWith("calendar."));this._rows=function(e,t,i,s){const r=[],a=new Set;for(const t of e){const e=s[r.length%s.length];a.add(t.entity_id),r.push({saved:Object.fromEntries(Object.entries(t).filter(([e])=>!pi.has(e))),entity_id:t.entity_id,display_name:t.display_name||t.entity_id,color:t.color||e.color,color_light:t.color_light||e.light,person_entity:t.person_entity||"",member_id:t.member_id??null,include:!0})}for(const e of t.filter(e=>!a.has(e)).sort()){const t=s[r.length%s.length];r.push({saved:null,entity_id:e,display_name:i(e)||e,color:t.color,color_light:t.light,person_entity:"",member_id:null,include:!1})}return r}(this.data.calendars,e,e=>this.hass.states[e]?.attributes?.friendly_name,ci.PRESETS),this._built=!0}}_save(){var e;this.api.saveConfig({calendars:(e=this._rows,e.filter(e=>e.include).map(e=>({icon:"mdi:calendar",visible:!0,...e.saved??{},entity_id:e.entity_id,display_name:e.display_name,color:e.color,color_light:e.color_light,person_entity:e.person_entity,member_id:e.member_id})))}).catch(e=>this._error(e))}_error(e){this.dispatchEvent(new CustomEvent(Qt,{detail:{message:Zt(Kt(e))},bubbles:!0,composed:!0}))}get _personEntities(){return this.hass?Object.keys(this.hass.states).filter(e=>e.startsWith("person.")).sort():[]}_personLabel(e){return this._entityLabel(e)}_entityLabel(e){return this.hass?.states[e]?.attributes?.friendly_name||e}_updateCalendar(e,t,i=!0){const s=[...this._rows];s[e]={...s[e],...t},this._rows=s,i&&this._save()}_onCalendarColorChange(e,t){t.stopPropagation(),this._updateCalendar(e,{color:t.detail.color,color_light:t.detail.colorLight})}_renderCalendars(){return 0===this._rows.length?V`
        <div class="page-content">
          <p class="page-subtitle">No calendar entities found in Home Assistant.</p>
          <p class="empty-hint">Add calendar integrations (Google Calendar, CalDAV, etc.) and re-run setup.</p>
        </div>
      `:V`
      <div class="page-content">
        <div class="calendar-list">
          ${this._rows.map((e,t)=>this._renderCalendarRow(e,t))}
        </div>
      </div>
    `}_onDragStart(e,t){this._dragIdx=e,t.dataTransfer&&(t.dataTransfer.effectAllowed="move",t.dataTransfer.setData("text/plain",String(e)))}_onDragOver(e,t){t.preventDefault(),t.dataTransfer&&(t.dataTransfer.dropEffect="move"),this._dragOverIdx=e}_onDragLeave(){this._dragOverIdx=null}_onDrop(e,t){if(t.preventDefault(),null!==this._dragIdx&&this._dragIdx!==e){const t=[...this._rows],[i]=t.splice(this._dragIdx,1);t.splice(e,0,i),this._rows=t,this._save()}this._dragIdx=null,this._dragOverIdx=null}_onDragEnd(){this._dragIdx=null,this._dragOverIdx=null}_renderCalendarRow(e,t){const i=this._dragIdx===t,s=this._dragOverIdx===t&&this._dragIdx!==t;return V`
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
              ${e.include?V`
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
        ${e.include?V`
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
                ${this._personEntities.map(t=>V`
                  <option value="${t}" ?selected=${e.person_entity===t}>${this._personLabel(t)}</option>
                `)}
              </select>
            </div>

            ${this._renderBelongsTo(e,t)}
          </div>
        `:""}
      </div>
    `}_renderBelongsTo(e,t){if(!this.household?.available)return q;const i=ai(this.household.members),s=function(e,t){if(e.person_entity){const i=t.find(t=>t.person===e.person_entity);if(i)return{memberId:i.id,viaPerson:!0}}const i=t.some(t=>t.id===e.member_id)?e.member_id:null;return{memberId:i,viaPerson:!1}}(e,i);return V`
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
          ${i.map(e=>V`
            <option value="${e.id}" ?selected=${s.memberId===e.id}>${e.name}</option>
          `)}
        </select>
        ${s.viaPerson?V`
          <p class="cal-owner-hint">Through ${this._personLabel(e.person_entity)}'s Home Assistant person.</p>
        `:q}
      </div>
    `}render(){return this._built?this._renderCalendars():q}}function vi(e,t){return e.order-t.order||e.id.localeCompare(t.id)}hi.styles=[Je,tt,rt,ot,Wt,o`
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
    `],e([ve({attribute:!1})],hi.prototype,"hass",void 0),e([ve({attribute:!1})],hi.prototype,"data",void 0),e([ve({attribute:!1})],hi.prototype,"household",void 0),e([ve({attribute:!1})],hi.prototype,"api",void 0),e([ve({attribute:!1})],hi.prototype,"layout",void 0),e([ve({type:String})],hi.prototype,"mode",void 0),e([ue()],hi.prototype,"_rows",void 0),e([ue()],hi.prototype,"_dragIdx",void 0),e([ue()],hi.prototype,"_dragOverIdx",void 0),ge("pv-calendar-calendars-page",hi);const ui=new class{constructor(){this._modules=new Map}register(e){this._modules.set(e.id,e)}get(e){return this._modules.get(e)}list(){return[...this._modules.values()].sort(vi)}};class mi{constructor(){this._pages=new Map}register(e){this._pages.set(e.id,e)}pages(e){return[...this._pages.values()].filter(t=>!t.applies||t.applies(e)).sort((e,t)=>e.order-t.order||e.id.localeCompare(t.id))}}const gi=[{id:"people",label:null,order:100},{id:"chores",label:"Chores",order:200},{id:"calendar",label:"Calendar",order:300},{id:"appearance",label:null,order:400},{id:"security",label:null,order:500},{id:"data",label:null,order:600},{id:"about",label:null,order:900}],yi=new mi,bi=new mi,fi={id:"calendar",label:"Calendar",icon:"mdi:calendar-month",tag:"pv-calendar-module",order:10,watchedEntities:({config:e,data:t})=>Ft(t,e).map(e=>e.person_entity).filter(e=>!!e)},_i={day:"Day",week:"Week",month:"Month",agenda:"Agenda"},xi=[{id:"calendars",label:"Calendars",group:"calendar",order:300,tag:"pv-calendar-calendars-page",summary:({data:e})=>{const t=e.calendars?.length??0;return 0===t?"None yet":`${t} ${1===t?"calendar":"calendars"}`}},{id:"calendar-options",label:"Calendar options",group:"calendar",order:310,tag:"pv-calendar-options-page",summary:({data:e})=>`${_i[e.display?.default_view??"week"]??"Week"} · ${"24h"===e.display?.time_format?"24-hour":"12-hour"}`}],wi=[{id:"calendars",label:"Calendars",order:200,tag:"pv-calendar-calendars-page",heading:"Calendars",lead:"Choose the calendars to show, and who each one belongs to."}];!function(e=ui){e.register(fi)}(),function(e=yi,t=bi){for(const t of xi)e.register(t);for(const e of wi)t.register(e)}();const $i=Symbol.for(""),ki=e=>{if(e?.r===$i)return e?._$litStatic$},Fi=e=>({_$litStatic$:e,r:$i}),Ci=new Map,Ei=(e=>(t,...i)=>{const s=i.length;let r,a;const o=[],n=[];let l,d=0,c=!1;for(;d<s;){for(l=t[d];d<s&&void 0!==(a=i[d],r=ki(a));)l+=r+t[++d],c=!0;d!==s&&n.push(a),o.push(l),d++}if(d===s&&o.push(t[s]),c){const e=o.join("$$lit$$");void 0===(t=Ci.get(e))&&(o.raw=o,Ci.set(e,t=o)),i=n}return e(t,...i)})(V);var Di="1.1.0";const Si={planavista:"Clean Light",light:"Clean Light",dark:"Deep Dark",minimal:"Minimal",modern:"Vibrant",vibrant:"Vibrant"};function zi(e,t,i){return`${e} ${1===e?t:i}`}const Ai=[{id:"people",label:"People",group:"people",order:100,tag:"pv-settings-people",applies:({household:e})=>null!==e,summary:({household:e})=>{const t=e?.members.length??0;return 0===t?"No one yet":zi(t,"person","people")}},{id:"appearance",label:"Appearance",group:"appearance",order:400,tag:"pv-settings-appearance",summary:({data:e})=>Si[e.display?.theme??"light"]??"Clean Light"},{id:"pins",label:"PINs and parent mode",group:"security",order:500,tag:"pv-settings-pins",applies:({household:e})=>null!==e,summary:({household:e})=>{const t=e?.members.filter(e=>e.has_pin).length??0,i=e?.account.shared?"Shared screen":"Not a shared screen";return t>0?`${i} · ${zi(t,"PIN","PINs")}`:i}},{id:"about",label:"About PlanaVista",group:"about",order:900,tag:"pv-settings-about",summary:()=>`Version ${Di}`}],Ti=[{id:"welcome",label:"Welcome",order:0,tag:"pv-setup-welcome",heading:"Welcome to PlanaVista",lead:"About 5 minutes. Everything can change later in Settings.",primary:"Set up"},{id:"people",label:"Who lives here?",order:100,tag:"pv-setup-people",heading:"Who lives here?",lead:"Choose everyone in your home and what they are. People without Home Assistant can be added too."},{id:"look",label:"Look",order:900,tag:"pv-setup-look",heading:"Pick a look",lead:"You can change it any time in Settings."},{id:"done",label:"Done",order:1e3,tag:"pv-setup-done",heading:"You're all set",primary:"Open the calendar"}];class Pi{constructor(e){this._host=e,this.view=null,this.ready=!1,this._subscription=new Yt(e=>{this.view=e,this.ready=!0,this._host.requestUpdate()}),e.addController(this)}hostConnected(){this._follow()}hostUpdate(){this._follow()}hostDisconnected(){this._subscription.stop(),this.view=null,this.ready=!1}_follow(){this._subscription.update(this._host.hass?.connection)}}const Bi=new Set(["INPUT","TEXTAREA","SELECT"]);class Mi{constructor(e){this._host=e,this.layout="landscape",this._box=null,this._measured=!1,this._textFocused=!1,this._onFocusIn=e=>{const t=e.composedPath()[0];this._textFocused=!!t&&Bi.has(t.tagName)},this._onFocusOut=()=>{this._textFocused=!1},e.addController(this)}hostConnected(){this._host.addEventListener("focusin",this._onFocusIn),this._host.addEventListener("focusout",this._onFocusOut),this._observer=new ResizeObserver(e=>{const t=e[e.length-1]?.contentRect;t&&this._measure({width:t.width,height:t.height})}),this._observer.observe(this._host);const e=this._host.getBoundingClientRect();this._measure({width:e.width,height:e.height})}hostDisconnected(){this._observer?.disconnect(),this._observer=void 0,this._host.removeEventListener("focusin",this._onFocusIn),this._host.removeEventListener("focusout",this._onFocusOut)}_measure(e){if(0===e.width&&0===e.height)return;const t=function(e,t,i,s){if(t&&i&&s&&e.width===i.width&&e.height<i.height)return t;if(e.width<600)return"phone";const r=e.height>0?e.width/e.height:Number.POSITIVE_INFINITY;return r>=.95&&r<=1.05?"portrait"===t||"landscape"===t?t:"landscape":r>1?"landscape":"portrait"}(e,this._measured?this.layout:null,this._box,this._textFocused);this._box=e,this._measured=!0,t===this.layout&&this._host.getAttribute("layout")===t||(this.layout=t,this._host.setAttribute("layout",t),this._host.requestUpdate())}}const Oi=12e4;class Ii{constructor(e,t){this._host=e,this._api=t,this.session=null,this._check=()=>{var e,t;this.session&&(e=this.session,t=Date.now(),0===function(e,t){return Math.max(0,e.lastTouch+Oi-t)}(e,t))&&this.lock()},this._onActivity=()=>{if(!this.session)return;const{session:e,touch:t}=function(e,t){return t-e.lastTouch<3e4?{session:e,touch:!1}:{session:{...e,lastTouch:t},touch:!0}}(this.session,Date.now());if(!t)return;this.session=e;const i=e.token;this._api().touch(i).catch(()=>{this.session?.token===i&&this._forget()}),this._host.requestUpdate()},this._onVisibility=()=>{"hidden"===document.visibilityState&&this.lock()},e.addController(this)}get token(){return this.session?.token??null}get endsAt(){return this.session?this.session.lastTouch+Oi:null}hostConnected(){this._host.addEventListener("pointerdown",this._onActivity,!0),this._host.addEventListener("keydown",this._onActivity,!0),document.addEventListener("visibilitychange",this._onVisibility)}hostDisconnected(){this._host.removeEventListener("pointerdown",this._onActivity,!0),this._host.removeEventListener("keydown",this._onActivity,!0),document.removeEventListener("visibilitychange",this._onVisibility),this.lock()}unlocked(e){e.ok&&e.session&&e.member_id&&(this._forget(),this.session=function(e,t){return{token:e.session,memberId:e.member_id,parent:e.parent,lastTouch:t}}({session:e.session,member_id:e.member_id,parent:!!e.parent},Date.now()),this._timer=window.setInterval(this._check,1e3),this._host.requestUpdate())}lock(){const e=this.token;this._forget(),e&&this._api().lock(e).catch(()=>{})}_forget(){window.clearInterval(this._timer),this._timer=void 0,this.session&&(this.session=null,this._host.requestUpdate())}}class Li extends de{constructor(){super(...arguments),this._config={}}setConfig(e){this._config=e}render(){return V`
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
    `}}Li.styles=o`
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
  `,e([ve({attribute:!1})],Li.prototype,"hass",void 0),ge("planavista-calendar-card-editor",Li);class Hi extends de{constructor(){super(...arguments),this.timeFormat="12h",this._minute=Math.floor(Date.now()/6e4),this._timer=null}createRenderRoot(){return this}connectedCallback(){super.connectedCallback(),this._minute=Math.floor(Date.now()/6e4),this._timer=setInterval(()=>{const e=Math.floor(Date.now()/6e4);e!==this._minute&&(this._minute=e)},1e3)}disconnectedCallback(){super.disconnectedCallback(),this._timer&&(clearInterval(this._timer),this._timer=null)}render(){const{time:e,ampm:t,date:i}=function(e,t){const i=String(e.getMinutes()).padStart(2,"0"),s=e.toLocaleDateString("en-US",{weekday:"long",month:"long",day:"numeric"});return"24h"===t?{time:`${e.getHours()}:${i}`,ampm:"",date:s}:{time:`${e.getHours()%12||12}:${i}`,ampm:e.getHours()>=12?"PM":"AM",date:s}}(new Date,this.timeFormat);return V`
      <div class="pvc-header-date">${i}</div>
      <div class="pvc-header-time">
        <span class="pvc-time-display">${e}</span>${t?V`<span class="pvc-time-ampm">${t}</span>`:q}
      </div>
    `}}e([ve({attribute:!1})],Hi.prototype,"timeFormat",void 0),e([ue()],Hi.prototype,"_minute",void 0),ge("pv-clock",Hi);class Ni extends de{constructor(){super(...arguments),this.household=null,this.layout="landscape",this.mode="settings",this._theme="light",this._themeOverrides={},this._customizeOpen=!1,this._loaded=!1}willUpdate(){if(!this._loaded&&this.data?.display){const e=this.data.display;this._theme=We(void 0,e.theme),this._themeOverrides=e.theme_overrides?{...e.theme_overrides}:{},this._customizeOpen=Object.keys(this._themeOverrides).length>0,this._loaded=!0}}disconnectedCallback(){super.disconnectedCallback(),this._saveNow()}_queueSave(){window.clearTimeout(this._saveTimer),this._saveTimer=window.setTimeout(()=>this._saveNow(),400)}_saveNow(){if(void 0===this._saveTimer)return;window.clearTimeout(this._saveTimer),this._saveTimer=void 0;const e=Object.keys(this._themeOverrides).length>0?this._themeOverrides:void 0;this.api.saveConfig({display:{...this.data.display,theme:this._theme,theme_overrides:e}}).catch(e=>this._error(e))}_error(e){this.dispatchEvent(new CustomEvent(Qt,{detail:{message:Zt(Kt(e))},bubbles:!0,composed:!0}))}_dispatchThemePreview(){this.dispatchEvent(new CustomEvent("theme-preview",{detail:{theme:this._theme,overrides:Object.keys(this._themeOverrides).length>0?this._themeOverrides:null},bubbles:!0,composed:!0})),this._queueSave()}_setOverride(e,t){if(void 0===t||""===t){const{[e]:t,...i}=this._themeOverrides;this._themeOverrides=i}else this._themeOverrides={...this._themeOverrides,[e]:t};this._dispatchThemePreview()}_resetOverrides(){this._themeOverrides={},this._dispatchThemePreview()}_renderCustomize(){const e=this._themeOverrides,t=Object.keys(e).length>0;return V`
      <!-- Customize toggle -->
      <button
        class="customize-toggle"
        type="button"
        @click=${()=>{this._customizeOpen=!this._customizeOpen}}
      >
        <span class="customize-toggle-label">Customize</span>
        <svg class="customize-toggle-chevron ${this._customizeOpen?"open":""}" viewBox="0 0 24 24" width="18" height="18">
          <path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6z" fill="currentColor"/>
        </svg>
      </button>

      ${this._customizeOpen?V`
        <div class="customize-section">

          <!-- Accent Color -->
          <div class="customize-group">
            <label class="pv-label">Accent Color</label>
            <pv-color-swatch-picker
              .value=${e.accent||""}
              @color-change=${e=>this._setOverride("accent",e.detail.color)}
            ></pv-color-swatch-picker>
          </div>

          <!-- Background -->
          <div class="customize-group">
            <label class="pv-label">Background</label>
            <div class="bg-options">
              <button class="pill-btn ${e.background?"":"pill-btn--active"}" type="button"
                @click=${()=>this._setOverride("background",void 0)}>Base Default</button>
              <div class="bg-custom-row">
                <label class="bg-custom-label">Custom:</label>
                <input type="color" class="bg-color-input"
                  .value=${e.background||"#FFFFFF"}
                  @input=${e=>this._setOverride("background",e.target.value)}
                />
                ${e.background?V`
                  <span class="bg-color-hex">${e.background}</span>
                `:""}
              </div>
            </div>
          </div>

          <!-- Header Style -->
          <div class="customize-group">
            <label class="pv-label">Header Style</label>
            <div class="header-style-grid">
              ${[{key:"gradient_purple",label:"Purple",gradient:"linear-gradient(135deg, #667eea, #764ba2)"},{key:"gradient_teal",label:"Teal",gradient:"linear-gradient(135deg, #0D9488, #2563EB)"},{key:"gradient_sunset",label:"Sunset",gradient:"linear-gradient(135deg, #F59E0B, #EF4444)"},{key:"solid_accent",label:"Accent",gradient:e.accent||"#6366F1"},{key:"solid_dark",label:"Dark",gradient:"#1A1B1E"}].map(t=>V`
                <button
                  class="header-style-btn ${e.header_style===t.key?"header-style-btn--active":""}"
                  type="button"
                  @click=${()=>this._setOverride("header_style",t.key)}
                >
                  <div class="header-style-preview" style="background: ${t.gradient};"></div>
                  <span class="header-style-label">${t.label}</span>
                </button>
              `)}
              <button
                class="header-style-btn ${"custom"===e.header_style?"header-style-btn--active":""}"
                type="button"
                @click=${()=>this._setOverride("header_style","custom")}
              >
                <div class="header-style-preview" style="background: ${e.header_custom||"#333"};"></div>
                <span class="header-style-label">Custom</span>
              </button>
            </div>
            ${"custom"===e.header_style?V`
              <div class="header-custom-row">
                <input type="color" class="bg-color-input"
                  .value=${e.header_custom||"#333333"}
                  @input=${e=>{this._themeOverrides={...this._themeOverrides,header_custom:e.target.value},this._dispatchThemePreview()}}
                />
                <span class="bg-color-hex">${e.header_custom||"#333333"}</span>
              </div>
            `:""}
          </div>

          <!-- Corners -->
          <div class="customize-group">
            <label class="pv-label">Corners</label>
            <div class="pill-group">
              ${["sharp","rounded","pill"].map(t=>V`
                <button
                  class="pill-btn ${(e.corner_style||"rounded")===t?"pill-btn--active":""}"
                  type="button"
                  @click=${()=>this._setOverride("corner_style",t)}
                >${t.charAt(0).toUpperCase()+t.slice(1)}</button>
              `)}
            </div>
          </div>

          <!-- Shadows -->
          <div class="customize-group">
            <label class="pv-label">Shadows</label>
            <div class="pill-group">
              ${["none","subtle","bold"].map(t=>V`
                <button
                  class="pill-btn ${(e.shadow_depth||"subtle")===t?"pill-btn--active":""}"
                  type="button"
                  @click=${()=>this._setOverride("shadow_depth",t)}
                >${t.charAt(0).toUpperCase()+t.slice(1)}</button>
              `)}
            </div>
          </div>

          <!-- Avatar Border -->
          <div class="customize-group">
            <label class="pv-label">Avatar Border</label>
            <div class="pill-group">
              ${["primary","light"].map(t=>V`
                <button
                  class="pill-btn ${(e.avatar_border||"primary")===t?"pill-btn--active":""}"
                  type="button"
                  @click=${()=>this._setOverride("avatar_border",t)}
                >${"primary"===t?"Primary":"Light"}</button>
              `)}
            </div>
            <div class="bg-custom-row" style="margin-top: 0.375rem;">
              <label class="bg-custom-label">Custom:</label>
              <input type="color" class="bg-color-input"
                .value=${e.avatar_border&&"primary"!==e.avatar_border&&"light"!==e.avatar_border?e.avatar_border:"#6366F1"}
                @input=${e=>this._setOverride("avatar_border",e.target.value)}
              />
              ${e.avatar_border&&"primary"!==e.avatar_border&&"light"!==e.avatar_border?V`
                <span class="bg-color-hex">${e.avatar_border}</span>
              `:""}
            </div>
          </div>

          <!-- Now Line Color -->
          <div class="customize-group">
            <label class="pv-label">Now Indicator</label>
            <div class="bg-options">
              <button class="pill-btn ${e.now_color?"":"pill-btn--active"}" type="button"
                @click=${()=>this._setOverride("now_color",void 0)}>Theme Default</button>
              <div class="bg-custom-row">
                <label class="bg-custom-label">Custom:</label>
                <input type="color" class="bg-color-input"
                  .value=${e.now_color||"#EF4444"}
                  @input=${e=>this._setOverride("now_color",e.target.value)}
                />
                ${e.now_color?V`
                  <span class="bg-color-hex">${e.now_color}</span>
                `:""}
              </div>
            </div>
          </div>

          <!-- Event Style -->
          <div class="customize-group">
            <label class="pv-label">Event Style</label>
            <div class="pill-group">
              ${["stripes","solid"].map(t=>V`
                <button
                  class="pill-btn ${(e.event_style||"stripes")===t?"pill-btn--active":""}"
                  type="button"
                  @click=${()=>this._setOverride("event_style",t)}
                >${"stripes"===t?"Stripes":"Solid"}</button>
              `)}
            </div>
          </div>

          <!-- Reset -->
          ${t?V`
            <button class="reset-btn" type="button" @click=${this._resetOverrides}>
              <svg viewBox="0 0 24 24" width="16" height="16">
                <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z" fill="currentColor"/>
              </svg>
              Reset to Base Theme
            </button>
          `:""}

        </div>
      `:""}
    `}_renderTheme(){return V`
      <div class="page-content">
        <div class="theme-grid">
          ${[{key:"light",name:"Clean Light",description:"White background, subtle shadows",previewBg:"#FFFFFF",previewAccent:"#6366F1",previewText:"#1A1B1E"},{key:"dark",name:"Deep Dark",description:"Dark gray background, glowing accents",previewBg:"#1E1E2E",previewAccent:"#818CF8",previewText:"#E5E7EB"},{key:"minimal",name:"Minimal",description:"Barely-there UI, content first",previewBg:"#FAFAF9",previewAccent:"#374151",previewText:"#374151"},{key:"vibrant",name:"Vibrant",description:"Rich colors, bold personality",previewBg:"#4F46E5",previewAccent:"#F59E0B",previewText:"#FFFFFF"}].map(e=>V`
            <button
              class="theme-card ${this._theme===e.key?"theme-card--active":""}"
              type="button"
              aria-pressed="${this._theme===e.key}"
              @click=${()=>{this._theme=e.key,this._dispatchThemePreview()}}
            >
              <!-- Mini preview -->
              <div
                class="theme-preview"
                style="background: ${e.previewBg}; border-color: ${e.previewAccent}20;"
              >
                <!-- Header bar -->
                <div class="theme-preview-header" style="background: ${e.previewAccent}15; border-bottom: 1px solid ${e.previewAccent}30;">
                  <div class="theme-preview-dot" style="background: ${e.previewAccent};"></div>
                  <div class="theme-preview-bar" style="background: ${e.previewText}20; width: 40%;"></div>
                  <div class="theme-preview-bar" style="background: ${e.previewText}20; width: 20%;"></div>
                </div>
                <!-- Event pills -->
                <div class="theme-preview-body">
                  <div class="theme-preview-event" style="border-left-color: ${e.previewAccent}; background: ${e.previewAccent}18; color: ${e.previewText};"></div>
                  <div class="theme-preview-event" style="border-left-color: ${e.previewAccent}88; background: ${e.previewAccent}10; color: ${e.previewText}; width: 70%;"></div>
                  <div class="theme-preview-event" style="border-left-color: ${e.previewAccent}55; background: ${e.previewAccent}0C; color: ${e.previewText}; width: 85%;"></div>
                </div>
              </div>

              <!-- Label -->
              <div class="theme-info">
                <span class="theme-name">${e.name}</span>
                <span class="theme-desc">${e.description}</span>
              </div>

              <!-- Selected checkmark -->
              ${this._theme===e.key?V`
                <div class="theme-check" aria-hidden="true">
                  <svg viewBox="0 0 24 24" width="16" height="16">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" fill="currentColor"/>
                  </svg>
                </div>
              `:""}
            </button>
          `)}
        </div>

        ${this._renderCustomize()}
      </div>
    `}render(){return this._loaded?this._renderTheme():q}}Ni.styles=[Je,tt,rt,ot,Wt,o`
/* ── Theme grid (page 2) ────────────────────────────────── */
.theme-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 12px;
      }
@media (max-width: 400px) {
.theme-grid {
          grid-template-columns: 1fr;
        }
}
.theme-card {
        position: relative;
        display: flex;
        flex-direction: column;
        align-items: stretch;
        padding: 0;
        border: 2px solid var(--pv-border-subtle, #E5E7EB);
        border-radius: var(--pv-radius, 12px);
        background: transparent;
        cursor: pointer;
        font-family: inherit;
        text-align: left;
        overflow: hidden;
        transition: all var(--pv-transition, 200ms ease);
        -webkit-tap-highlight-color: transparent;
      }
.theme-card:hover {
        border-color: var(--pv-accent, #6366F1);
        transform: translateY(-2px);
        box-shadow: 0 4px 16px color-mix(in srgb, var(--pv-accent, #6366F1) 20%, transparent);
      }
.theme-card--active {
        border-color: var(--pv-accent, #6366F1);
        box-shadow: 0 0 0 3px color-mix(in srgb, var(--pv-accent, #6366F1) 25%, transparent);
      }
/* Mini preview area */
.theme-preview {
        height: 80px;
        border-radius: 0;
        border-bottom: 1px solid transparent;
        overflow: hidden;
        display: flex;
        flex-direction: column;
      }
.theme-preview-header {
        display: flex;
        align-items: center;
        gap: 6px;
        padding: 6px 10px;
        flex-shrink: 0;
      }
.theme-preview-dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        flex-shrink: 0;
      }
.theme-preview-bar {
        height: 6px;
        border-radius: 3px;
        flex-shrink: 0;
      }
.theme-preview-body {
        flex: 1;
        padding: 6px 10px;
        display: flex;
        flex-direction: column;
        gap: 4px;
      }
.theme-preview-event {
        height: 12px;
        border-radius: 3px;
        border-left: 3px solid transparent;
        width: 100%;
      }
/* Label area */
.theme-info {
        padding: 0.625rem 0.75rem 0.75rem;
        display: flex;
        flex-direction: column;
        gap: 2px;
      }
.theme-name {
        font-size: 0.875rem;
        font-weight: 600;
        color: var(--pv-text, #1A1B1E);
        line-height: 1.3;
      }
.theme-desc {
        font-size: 0.75rem;
        color: var(--pv-text-secondary, #6B7280);
        line-height: 1.4;
      }
/* Checkmark badge */
.theme-check {
        position: absolute;
        top: 8px;
        right: 8px;
        width: 22px;
        height: 22px;
        border-radius: 50%;
        background: var(--pv-accent, #6366F1);
        color: var(--pv-accent-text, #FFFFFF);
        display: flex;
        align-items: center;
        justify-content: center;
      }
/* ── Customize accordion (page 2) ─────────────────────── */
.customize-toggle {
        display: flex;
        align-items: center;
        justify-content: space-between;
        width: 100%;
        margin-top: 1.5rem;
        padding: 0.75rem 0;
        border: none;
        border-top: 1px solid var(--pv-border-subtle, #E5E7EB);
        background: transparent;
        cursor: pointer;
        font-family: inherit;
        -webkit-tap-highlight-color: transparent;
      }
.customize-toggle-label {
        font-size: 0.875rem;
        font-weight: 600;
        color: var(--pv-text-secondary, #6B7280);
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }
.customize-toggle-chevron {
        fill: var(--pv-text-secondary, #6B7280);
        transition: transform var(--pv-transition, 200ms ease);
      }
.customize-toggle-chevron.open {
        transform: rotate(180deg);
      }
.customize-section {
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
        padding-top: 0.5rem;
        animation: pv-fadeIn 200ms ease forwards;
      }
.customize-group {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
      }
/* Background options */
.bg-options {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
      }
.bg-custom-row {
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }
.bg-custom-label {
        font-size: 0.8125rem;
        color: var(--pv-text-secondary, #6B7280);
        font-weight: 500;
      }
.bg-color-input {
        width: 36px;
        height: 36px;
        border: 2px solid var(--pv-border-subtle, #E5E7EB);
        border-radius: 8px;
        padding: 2px;
        cursor: pointer;
        background: transparent;
      }
.bg-color-hex {
        font-size: 0.75rem;
        font-family: monospace;
        color: var(--pv-text-muted, #9CA3AF);
      }
/* Header style grid */
.header-style-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 8px;
      }
@media (max-width: 400px) {
.header-style-grid {
          grid-template-columns: repeat(2, 1fr);
        }
}
.header-style-btn {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 4px;
        padding: 6px;
        border: 2px solid var(--pv-border-subtle, #E5E7EB);
        border-radius: var(--pv-radius-sm, 8px);
        background: transparent;
        cursor: pointer;
        font-family: inherit;
        transition: all var(--pv-transition, 200ms ease);
        -webkit-tap-highlight-color: transparent;
      }
.header-style-btn:hover {
        border-color: var(--pv-accent, #6366F1);
      }
.header-style-btn--active {
        border-color: var(--pv-accent, #6366F1);
        box-shadow: 0 0 0 2px color-mix(in srgb, var(--pv-accent, #6366F1) 25%, transparent);
      }
.header-style-preview {
        width: 100%;
        height: 24px;
        border-radius: 4px;
      }
.header-style-label {
        font-size: 0.6875rem;
        font-weight: 500;
        color: var(--pv-text-secondary, #6B7280);
      }
.header-custom-row {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        margin-top: 0.5rem;
      }
/* Reset button */
.reset-btn {
        display: inline-flex;
        align-items: center;
        gap: 0.375rem;
        padding: 0.5rem 1rem;
        border: 1px solid var(--pv-border-subtle, #E5E7EB);
        border-radius: 9999px;
        background: transparent;
        color: var(--pv-text-secondary, #6B7280);
        font-size: 0.8125rem;
        font-weight: 500;
        font-family: inherit;
        cursor: pointer;
        transition: all var(--pv-transition, 200ms ease);
        align-self: flex-start;
        -webkit-tap-highlight-color: transparent;
      }
.reset-btn svg {
        fill: currentColor;
      }
.reset-btn:hover {
        border-color: var(--pv-accent, #6366F1);
        color: var(--pv-accent, #6366F1);
      }
@media (max-width: 479px) {
.theme-grid { grid-template-columns: 1fr; }
}
    `],e([ve({attribute:!1})],Ni.prototype,"hass",void 0),e([ve({attribute:!1})],Ni.prototype,"data",void 0),e([ve({attribute:!1})],Ni.prototype,"household",void 0),e([ve({attribute:!1})],Ni.prototype,"api",void 0),e([ve({attribute:!1})],Ni.prototype,"layout",void 0),e([ve({type:String})],Ni.prototype,"mode",void 0),e([ue()],Ni.prototype,"_theme",void 0),e([ue()],Ni.prototype,"_themeOverrides",void 0),e([ue()],Ni.prototype,"_customizeOpen",void 0),ge("pv-theme-picker",Ni);class ji extends de{constructor(){super(...arguments),this.size=40}render(){const e=this.member;if(!e)return q;const t=function(e,t){const i=e.picture;if(i&&"string"==typeof i.emoji&&i.emoji)return{kind:"emoji",text:i.emoji};if(i&&!0===i.person&&e.person){const i=t(e.person);if(i)return{kind:"photo",url:i}}return{kind:"initial",text:oi(e.name)}}(e,e=>this.hass?.states?.[e]?.attributes?.entity_picture??null),i=Math.round(this.size*("emoji"===t.kind?.55:.42)),s=`width:${this.size}px;height:${this.size}px;font-size:${i}px;background:${e.color};color:${Ie(e.color)}`;return V`
      <div class="avatar" role="img" aria-label=${e.name} style=${s}>
        ${"photo"===t.kind?V`<img src=${t.url} alt="" />`:t.text}
      </div>
    `}}ji.styles=o`
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
  `,e([ve({attribute:!1})],ji.prototype,"member",void 0),e([ve({attribute:!1})],ji.prototype,"hass",void 0),e([ve({type:Number})],ji.prototype,"size",void 0),ge("pv-member-avatar",ji);class Ui extends de{constructor(){super(...arguments),this.endsAt=0,this.color="currentColor",this.size=28,this._now=Date.now()}connectedCallback(){super.connectedCallback(),this._timer=window.setInterval(()=>{this._now=Date.now()},1e3)}disconnectedCallback(){super.disconnectedCallback(),window.clearInterval(this._timer)}render(){const e=Math.max(0,this.endsAt-this._now),t=Math.min(1,e/Oi),i=this.size/2,s=(this.size-3)/2,r=2*Math.PI*s,a=10*Math.ceil(Math.ceil(e/1e3)/10),o=`Parent mode ends in ${Math.floor(a/60)} min ${a%60} s`;return V`
      <svg width=${this.size} height=${this.size} viewBox="0 0 ${this.size} ${this.size}" role="img" aria-label=${o}>
        ${W`
          <circle class="track" cx=${i} cy=${i} r=${s} fill="none"
            stroke=${this.color} stroke-width=${3}></circle>
          <circle cx=${i} cy=${i} r=${s} fill="none" stroke=${this.color}
            stroke-width=${3} stroke-linecap="round"
            stroke-dasharray=${r} stroke-dashoffset=${r*(1-t)}></circle>
        `}
      </svg>
    `}}Ui.styles=o`
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
  `,e([ve({type:Number})],Ui.prototype,"endsAt",void 0),e([ve({type:String})],Ui.prototype,"color",void 0),e([ve({type:Number})],Ui.prototype,"size",void 0),e([ue()],Ui.prototype,"_now",void 0),ge("pv-session-ring",Ui);class Ri extends de{constructor(){super(...arguments),this.endsAt=0}render(){const e=this.member;return e?V`
      <div class="strip" style="--strip-color: ${e.color}">
        <pv-member-avatar .member=${e} .hass=${this.hass} size="28"></pv-member-avatar>
        <span class="who">${e.name} <span class="mode">· parent mode</span></span>
        <pv-session-ring .endsAt=${this.endsAt} color=${e.color}></pv-session-ring>
        <button class="pv-btn pv-btn-ghost lock" type="button" @click=${this._lock}>Lock</button>
      </div>
    `:q}_lock(){this.dispatchEvent(new CustomEvent("pv-lock",{bubbles:!0,composed:!0}))}}Ri.styles=[tt,o`
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

      .lock {
        min-width: 48px;
        min-height: 48px;
      }
    `],e([ve({attribute:!1})],Ri.prototype,"member",void 0),e([ve({attribute:!1})],Ri.prototype,"hass",void 0),e([ve({type:Number})],Ri.prototype,"endsAt",void 0),ge("pv-parent-strip",Ri);const Vi=o`
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

  @media (prefers-reduced-motion: no-preference) {
    .panel {
      animation: pv-sheet-rise 220ms ease-out;
    }

    :host([layout='landscape']) .panel {
      animation: pv-sheet-pop 180ms ease-out;
    }
  }

  @keyframes pv-sheet-rise {
    from { transform: translateY(24px); opacity: 0; }
    to { transform: none; opacity: 1; }
  }

  @keyframes pv-sheet-pop {
    from { transform: scale(0.96); opacity: 0; }
    to { transform: none; opacity: 1; }
  }
`;function Wi(e,t){if("Tab"!==t.key)return;const i=[...e.querySelectorAll('button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])')],s=function(e,t,i){return 0===t?-1:e<0?i?t-1:0:i?(e-1+t)%t:(e+1)%t}(i.indexOf(e.activeElement),i.length,t.shiftKey);s>=0&&(t.preventDefault(),i[s].focus())}const Yi=["1","2","3","4","5","6","7","8","9","0"];function qi(e,t=Math.random){const i=[...Yi];if(!e)return i;for(let e=i.length-1;e>0;e--){const s=Math.floor(t()*(e+1));[i[e],i[s]]=[i[s],i[e]]}return i}function Ki(e){return{digits:"",length:e??6}}function Gi(e){return e.digits.length===e.length}function Xi(e){return e.digits.length>=4}class Qi extends de{constructor(){super(...arguments),this.layout="landscape",this.mode="unlock",this.members=[],this.heading="",this.shuffle=!1,this._step="pick",this._entry=Ki(null),this._first="",this._message="",this._pausedUntil=0,this._now=Date.now(),this._busy=!1,this._shake=!1,this._digits=qi(!1),this._started=!1,this._cancel=()=>{this._fire("pv-sheet-close",{})},this._onKey=e=>{"Escape"===e.key?(e.preventDefault(),this._cancel()):/^[0-9]$/.test(e.key)&&"pick"!==this._step?(e.preventDefault(),this._press(e.key)):"Backspace"===e.key&&"pick"!==this._step?(e.preventDefault(),this._delete()):"Enter"===e.key&&"choose"===this._step?(e.preventDefault(),this._next()):Wi(this.shadowRoot,e)}}connectedCallback(){super.connectedCallback(),this.addEventListener("keydown",this._onKey)}disconnectedCallback(){super.disconnectedCallback(),this.removeEventListener("keydown",this._onKey),window.clearInterval(this._ticker)}willUpdate(e){this._started||(this._started=!0,this._digits=qi(this.shuffle),"choose"===this.mode?(this._step="choose",this._entry=Ki(null)):1===this.members.length&&this._enterFor(this.members[0]))}firstUpdated(){this.renderRoot.querySelector(".person, .key")?.focus()}render(){return V`
      <div class="backdrop" @click=${this._cancel}></div>
      <div class="panel" role="dialog" aria-modal="true" aria-labelledby="pin-heading">
        ${"pick"===this._step?this._renderPicker():this._renderPad()}
      </div>
    `}_renderPicker(){return V`
      <h2 class="heading" id="pin-heading">${this.heading}</h2>
      <div class="people">
        ${this.members.map(e=>V`
          <button class="person" type="button" @click=${()=>this._enterFor(e)}>
            <pv-member-avatar .member=${e} .hass=${this.hass} size="64"></pv-member-avatar>
            <span>${e.name}</span>
          </button>
        `)}
      </div>
      <div class="actions">
        <button class="pv-btn pv-btn-secondary" type="button" @click=${this._cancel}>Cancel</button>
      </div>
    `}_renderPad(){const e=this._paused(),t="enter"===this._step?`${this._who?.name??""}, enter your PIN`:"choose"===this._step?`Choose a PIN for ${this.target?.name??""}`:"Enter it again",i=e?`Too many tries. Try again in ${function(e){const t=Math.max(0,Math.ceil(e/1e3));return`${Math.floor(t/60)}:${String(t%60).padStart(2,"0")}`}(this._pausedUntil-this._now)}.`:this._message;return V`
      ${"enter"===this._step&&this.members.length>1?V`<button class="back" type="button" @click=${this._backToPicker}>‹ Someone else</button>`:q}
      <h2 class="heading" id="pin-heading">${t}</h2>
      ${"choose"===this._step?V`<p class="hint">4 to 6 digits.</p>`:q}
      <div class="boxes ${this._shake?"shake":""}" aria-hidden="true">
        ${Array.from({length:this._entry.length},(e,t)=>V`
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
      ${"choose"===this._step?V`
          <button class="pv-btn pv-btn-primary next" type="button"
            ?disabled=${!Xi(this._entry)||this._busy}
            @click=${this._next}>Next</button>
        `:q}
    `}_renderKey(e,t){return V`
      <button class="key" type="button" ?disabled=${t||this._busy} @click=${()=>this._press(e)}>${e}</button>
    `}_enterFor(e){this._who=e,this._step="enter",this._message="",this._entry=Ki(e.pin_length);const t=e.locked_until?Date.parse(e.locked_until):0;t>Date.now()&&this._pause(t)}_backToPicker(){this._step="pick",this._who=void 0,this._message=""}_paused(){return this._pausedUntil>this._now}_pause(e){this._pausedUntil=e,this._now=Date.now(),window.clearInterval(this._ticker),this._ticker=window.setInterval(()=>{this._now=Date.now(),this._paused()||window.clearInterval(this._ticker)},1e3)}_press(e){this._busy||this._paused()||(this._message="",this._entry=function(e,t){return!/^[0-9]$/.test(t)||e.digits.length>=e.length?e:{...e,digits:e.digits+t}}(this._entry,e),"enter"===this._step&&Gi(this._entry)?this._check():("choose"===this._step&&6===this._entry.digits.length||"confirm"===this._step&&Gi(this._entry))&&this._next())}_delete(){var e;this._entry=(e=this._entry,{...e,digits:e.digits.slice(0,-1)})}_next(){if("choose"===this._step){if(!Xi(this._entry))return;return this._first=this._entry.digits,this._entry=Ki(this._first.length),void(this._step="confirm")}"confirm"===this._step&&Gi(this._entry)&&(this._entry.digits===this._first?this._save(this._first):this._restartChoosing("Those didn't match. Try again."))}_restartChoosing(e){this._message=e,this._first="",this._entry=Ki(null),this._step="choose",this._shakeBoxes()}async _check(){const e=this._who;if(e){this._busy=!0;try{const t=await this.api.unlock(e.id,this._entry.digits);if(t.ok)return void this._fire("pv-unlocked",{result:t});if(this._entry=Ki(e.pin_length),"paused"===t.reason)this._pause(Date.now()+1e3*(t.retry_after??30));else if("wrong_pin"===t.reason){const i=t.tries_left??0;this._message=`That's not ${e.name}'s PIN. ${1===i?"1 more try":`${i} more tries`} before a short pause.`}else this._message=`${e.name} has no PIN yet.`;this._shakeBoxes()}catch{this._entry=Ki(e.pin_length),this._message="Couldn't check the PIN. Check the connection and try again."}finally{this._busy=!1}}}async _save(e){const t=this.target;if(t){this._busy=!0;try{await this.api.setPin(t.id,e),this._fire("pv-pin-set",{memberId:t.id})}catch(e){this._restartChoosing(Zt(Kt(e)))}finally{this._busy=!1}}}_shakeBoxes(){this._shake=!0,window.setTimeout(()=>{this._shake=!1},320)}_fire(e,t){this.dispatchEvent(new CustomEvent(e,{detail:t,bubbles:!0,composed:!0}))}}Qi.styles=[tt,Vi,o`
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
        color: var(--pv-accent, #6366F1);
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

      @media (prefers-reduced-motion: no-preference) {
        .boxes.shake {
          animation: pv-shake 300ms ease-in-out;
        }
      }

      @media (prefers-reduced-motion: reduce) {
        .boxes.shake {
          animation: pv-fade 300ms ease-in-out;
        }
      }

      @keyframes pv-shake {
        20%, 60% { transform: translateX(-8px); }
        40%, 80% { transform: translateX(8px); }
      }

      @keyframes pv-fade {
        50% { opacity: 0.3; }
      }
    `],e([ve({attribute:!1})],Qi.prototype,"hass",void 0),e([ve({attribute:!1})],Qi.prototype,"api",void 0),e([ve({type:String,reflect:!0})],Qi.prototype,"layout",void 0),e([ve({type:String})],Qi.prototype,"mode",void 0),e([ve({attribute:!1})],Qi.prototype,"members",void 0),e([ve({type:String})],Qi.prototype,"heading",void 0),e([ve({attribute:!1})],Qi.prototype,"target",void 0),e([ve({type:Boolean})],Qi.prototype,"shuffle",void 0),e([ue()],Qi.prototype,"_step",void 0),e([ue()],Qi.prototype,"_who",void 0),e([ue()],Qi.prototype,"_entry",void 0),e([ue()],Qi.prototype,"_first",void 0),e([ue()],Qi.prototype,"_message",void 0),e([ue()],Qi.prototype,"_pausedUntil",void 0),e([ue()],Qi.prototype,"_now",void 0),e([ue()],Qi.prototype,"_busy",void 0),e([ue()],Qi.prototype,"_shake",void 0),ge("pv-pin-sheet",Qi);class Zi extends de{constructor(){super(...arguments),this.heading="",this.body="",this.actions=[],this.layout="landscape"}firstUpdated(){this.renderRoot.querySelector(".actions button")?.focus()}render(){return V`
      <div class="backdrop" @click=${()=>this._choose("cancel")}></div>
      <div class="panel" role="dialog" aria-modal="true" aria-labelledby="notice-heading" @keydown=${this._onKey}>
        <h2 class="heading" id="notice-heading">${this.heading}</h2>
        ${this.body?V`<p class="body">${this.body}</p>`:q}
        <div class="actions">
          ${this.actions.map(e=>V`
            <button
              type="button"
              class="pv-btn ${"secondary"===e.kind?"pv-btn-secondary":"pv-btn-primary"} ${"destructive"===e.kind?"destructive":""}"
              @click=${()=>this._choose(e.id)}
            >${e.label}</button>
          `)}
        </div>
      </div>
    `}_onKey(e){if("Escape"===e.key)return e.preventDefault(),void this._choose("cancel");Wi(this.shadowRoot,e)}_choose(e){this.dispatchEvent(new CustomEvent("pv-sheet-action",{detail:{id:e},bubbles:!0,composed:!0}))}}Zi.styles=[tt,Vi,o`
      .destructive {
        background: var(--pv-danger, #DC2626);
        border-color: transparent;
        color: #FFFFFF;
      }
    `],e([ve({type:String})],Zi.prototype,"heading",void 0),e([ve({type:String})],Zi.prototype,"body",void 0),e([ve({attribute:!1})],Zi.prototype,"actions",void 0),e([ve({type:String,reflect:!0})],Zi.prototype,"layout",void 0),ge("pv-notice-sheet",Zi);let Ji=class{constructor(e){}get _$AU(){return this._$AM._$AU}_$AT(e,t,i){this._$Ct=e,this._$AM=t,this._$Ci=i}_$AS(e,t){return this.update(e,t)}update(e,t){return this.render(...t)}};const es={},ts=(e=>(...t)=>({_$litDirective$:e,values:t}))(class extends Ji{constructor(){super(...arguments),this.key=q}render(e,t){return this.key=e,t}update(e,[t,i]){return t!==this.key&&(((e,t=es)=>{e._$AH=t})(e),this.key=t),i}});function is(e,t,i){const s=[...e];if(t<0||t>=s.length||i<0||i>=s.length||t===i)return s;const[r]=s.splice(t,1);return s.splice(i,0,r),s}class ss extends de{constructor(){super(...arguments),this.household=null,this.layout="landscape",this.mode="settings",this._order=null,this._dragging=null,this._dragMove=e=>{if(!this._dragging||!this._order)return;const t=[...this.renderRoot.querySelectorAll("li")].map(e=>{const t=e.getBoundingClientRect();return{top:t.top,height:t.height}}),i=function(e,t){if(0===t.length)return-1;const i=t.findIndex(t=>e<t.top+t.height/2);return i>=0?i:t.length-1}(e.clientY,t),s=this._order.indexOf(this._dragging);i>=0&&i!==s&&(this._order=is(this._order,s,i))},this._dragEnd=()=>{if(!this._dragging||!this._order)return;const e=this._order;this._dragging=null,this._saveOrder(e)}}_members(){const e=ai(this.household?.members??[]);if(!this._order)return e;const t=new Map(e.map(e=>[e.id,e]));return this._order.map(e=>t.get(e)).filter(e=>!!e)}render(){const e=this._members(),t=!!this.household?.available;return V`
      <div class="head">
        <p class="lead">This is the order people appear in. Drag ≡ to change it.</p>
        ${t?V`<button class="pv-btn pv-btn-secondary add" type="button" @click=${this._add}>+ Add someone</button>`:q}
      </div>
      ${0===e.length?V`<p class="empty">No one here yet.</p>`:q}
      <ul>
        ${e.map((e,i)=>V`
          <li class=${this._dragging===e.id?"dragging":""}>
            ${t?V`
              <button class="handle" type="button" aria-label="Move ${e.name}"
                @pointerdown=${t=>this._dragStart(t,e.id)}
                @pointermove=${this._dragMove}
                @pointerup=${this._dragEnd}
                @pointercancel=${this._dragEnd}
                @keydown=${e=>this._keyMove(e,i)}>≡</button>
            `:q}
            <button class="open" type="button" @click=${()=>this._open(e)}>
              <pv-member-avatar .member=${e} .hass=${this.hass} size="40"></pv-member-avatar>
              <span class="text">
                <span class="name">${e.name}</span>
                <span class="summary">${function(e,t){const i=[e.parent?"Parent":ei[e.age_group]];e.has_pin&&i.push("PIN on");const s=li(e.id,t);return 0===s.length?i.push("no calendar"):1===s.length?i.push(`${e.name}'s calendar`):i.push(`${s.length} calendars`),i.join(" · ")}(e,this.data?.calendars??[])}</span>
              </span>
              <span class="chevron" aria-hidden="true">›</span>
            </button>
          </li>
        `)}
      </ul>
      ${t&&e.length>0?V`<button class="pv-btn pv-btn-secondary add" type="button" @click=${this._add}>+ Add someone</button>`:q}
    `}_push(e){this.dispatchEvent(new CustomEvent(Gt,{detail:e,bubbles:!0,composed:!0}))}_open(e){this._push({tag:"pv-settings-person",title:e.name,back:"People",props:{memberId:e.id}})}_add(){this._push({tag:"pv-settings-person",title:"New person",back:"People",props:{memberId:null}})}_dragStart(e,t){e.currentTarget.setPointerCapture(e.pointerId),this._order=this._members().map(e=>e.id),this._dragging=t}_keyMove(e,t){if("ArrowUp"!==e.key&&"ArrowDown"!==e.key)return;e.preventDefault();const i=this._members().map(e=>e.id),s="ArrowUp"===e.key?t-1:t+1;s<0||s>=i.length||(this._order=is(i,t,s),this._saveOrder(this._order).then(()=>{this.renderRoot.querySelectorAll(".handle")[s]?.focus()}))}async _saveOrder(e){const t=ai(this.household?.members??[]).map(e=>e.id);if(e.join()!==t.join())try{await this.api.reorder(e)}catch(e){this.dispatchEvent(new CustomEvent(Qt,{detail:{message:Zt(Kt(e))},bubbles:!0,composed:!0}))}this._order=null}}ss.styles=[Je,tt,o`
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
    `],e([ve({attribute:!1})],ss.prototype,"hass",void 0),e([ve({attribute:!1})],ss.prototype,"data",void 0),e([ve({attribute:!1})],ss.prototype,"household",void 0),e([ve({attribute:!1})],ss.prototype,"api",void 0),e([ve({type:String})],ss.prototype,"layout",void 0),e([ve({type:String})],ss.prototype,"mode",void 0),e([ue()],ss.prototype,"_order",void 0),e([ue()],ss.prototype,"_dragging",void 0),ge("pv-settings-people",ss);const rs=["name","color","picture","age_group","parent","person"];function as(e,t){return JSON.stringify(e)===JSON.stringify(t)}function os(e,t,i){if(e)return{name:e.name,color:e.color,picture:e.picture,age_group:e.age_group,parent:e.parent,person:e.person};const s=di(t),r=i.find(e=>!s.has(e.toUpperCase()))??i[0];return{name:"",color:r,picture:{initial:!0},age_group:"adult",parent:!1,person:null}}function ns(e,t){return!as(e,t)}class ls extends de{constructor(){super(...arguments),this.layout="landscape",this.shuffle=!1,this.sharedScreens=!1,this._choosing=!1,this._message="",this._busy=!1}_paused(){return(this.member.locked_until?Date.parse(this.member.locked_until):0)>Date.now()}_status(){return this._paused()?{text:"Paused after too many tries",needs:!1}:this.member.has_pin?{text:"PIN set",needs:!1}:this.member.parent&&this.sharedScreens?{text:"Needs a PIN on a shared screen",needs:!0}:{text:"No PIN",needs:!1}}render(){const e=this._status();return V`
      <div class="row">
        <span class="status ${e.needs?"needs":""}">${e.text}</span>
        <span class="buttons">
          <button class="pv-btn pv-btn-secondary" type="button" ?disabled=${this._busy}
            @click=${()=>{this._message="",this._choosing=!0}}>
            ${this.member.has_pin?"Change PIN":"Set PIN"}
          </button>
          ${this.member.has_pin?V`
            <button class="pv-btn pv-btn-secondary" type="button" ?disabled=${this._busy} @click=${this._remove}>Remove PIN</button>
          `:q}
          ${this._paused()?V`
            <button class="pv-btn pv-btn-secondary" type="button" ?disabled=${this._busy} @click=${this._clearPause}>Clear pause</button>
          `:q}
        </span>
      </div>
      ${this._message?V`<p class="message" role="alert">${this._message}</p>`:q}
      ${this._choosing?V`
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
      `:q}
    `}_closeSheet(e){e.stopPropagation(),this._choosing=!1}async _remove(){await this._run(()=>this.api.clearPin(this.member.id))}async _clearPause(){await this._run(()=>this.api.clearPause(this.member.id))}async _run(e){this._busy=!0,this._message="";try{await e()}catch(e){this._message=e?.message||Zt(Kt(e))}finally{this._busy=!1}}}ls.styles=[tt,o`
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
    `],e([ve({attribute:!1})],ls.prototype,"hass",void 0),e([ve({attribute:!1})],ls.prototype,"api",void 0),e([ve({type:String})],ls.prototype,"layout",void 0),e([ve({attribute:!1})],ls.prototype,"member",void 0),e([ve({type:Boolean})],ls.prototype,"shuffle",void 0),e([ve({type:Boolean})],ls.prototype,"sharedScreens",void 0),e([ue()],ls.prototype,"_choosing",void 0),e([ue()],ls.prototype,"_message",void 0),e([ue()],ls.prototype,"_busy",void 0),ge("pv-pin-actions",ls);const ds=ci.PRESETS.map(e=>e.color);class cs extends de{constructor(){super(...arguments),this.household=null,this.layout="landscape",this.mode="settings",this.pageProps={},this.drafts=new Map,this._problem="",this._saving=!1,this._notice=null,this._loaded=!1}get _memberId(){return this.pageProps.memberId??null}get _member(){return this.household?.members.find(e=>e.id===this._memberId)??null}get _draftKey(){return this._memberId??"new"}willUpdate(){!this._loaded&&this.household&&(this._start=os(this._member,this.household.members,ds),this._draft=this.drafts.get(this._draftKey)??this._start,this._loaded=!0)}confirmLeave(){return this._loaded&&ns(this._draft,this._start)?(this._notice="discard",new Promise(e=>{this._leave=e})):Promise.resolve(!0)}render(){if(!this._loaded||!this.household)return q;const e=this._member,t=null===this._memberId;if(!t&&!e)return V`<p class="gone">This person was removed on another screen.</p>`;const i=this._draft,s=ns(i,this._start);return V`
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
      ${this._problem?V`<p class="problem" role="alert">${this._problem}</p>`:q}
      ${this._renderName()}
      ${this._renderColor()}
      ${this._renderPicture()}
      ${this._renderAgeGroup()}
      ${this._renderParent()}
      ${this._renderPin(e)}
      ${this._renderHomeAssistant()}
      ${e?V`
        <button class="pv-btn remove" type="button" @click=${()=>{this._notice="remove"}}>Remove ${e.name}</button>
      `:q}
      ${this._renderNotice(e)}
    `}_renderName(){return V`
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
    `}_renderColor(){const e=di(this.household.members,this._memberId??void 0);return V`
      <fieldset class="field">
        <legend>Color</legend>
        <div class="swatches">
          ${ci.PRESETS.map(t=>{const i=e.get(t.color.toUpperCase()),s=this._draft.color.toUpperCase()===t.color.toUpperCase();return V`
              <button
                class="swatch"
                type="button"
                style="background:${t.color}"
                aria-pressed=${s?"true":"false"}
                aria-label=${i?`${t.name}, used by ${i.name}`:t.name}
                ?disabled=${!!i}
                @click=${()=>this._change({color:t.color})}
              >${i?oi(i.name):""}</button>
            `})}
        </div>
      </fieldset>
    `}_personPicture(){const e=this._draft.person;return e?this.hass?.states?.[e]?.attributes?.entity_picture??null:null}_renderPicture(){const e=this._draft.picture,t="string"==typeof e.emoji?"emoji":e.person?"photo":"initial",i=this._personPicture(),s=!!this._draft.person,r=e=>this._change({picture:e});return V`
      <fieldset class="field">
        <legend>Picture</legend>
        <div class="segmented" role="group" aria-label="Picture">
          <button type="button" aria-pressed=${"initial"===t?"true":"false"}
            @click=${()=>r({initial:!0})}>Initial</button>
          <button type="button" aria-pressed=${"emoji"===t?"true":"false"}
            @click=${()=>r({emoji:"string"==typeof e.emoji?e.emoji:"🙂"})}>Emoji</button>
          <button type="button" aria-pressed=${"photo"===t?"true":"false"} ?disabled=${!s}
            @click=${()=>r({person:!0})}>Photo</button>
        </div>
        ${"emoji"===t?V`
          <input class="pv-input emoji" type="text" maxlength="16" placeholder="Type or paste an emoji"
            aria-label="Emoji"
            .value=${String(e.emoji??"")}
            @input=${e=>r({emoji:e.target.value})} />
        `:q}
        ${s?"photo"!==t||i?q:V`<p class="hint">Their Home Assistant person has no photo yet, so their initial shows.</p>`:V`<p class="hint">Link a Home Assistant person to use their photo.</p>`}
      </fieldset>
    `}_renderAgeGroup(){return V`
      <fieldset class="field">
        <legend>Age group</legend>
        <div class="radios">
          ${ti.map(e=>V`
            <label class="radio">
              <input type="radio" name="age-group" .checked=${this._draft.age_group===e.id}
                @change=${()=>this._change({age_group:e.id})} />
              <span>${e.label}</span>
              ${e.hint?V`<span class="age-hint">${e.hint}</span>`:q}
            </label>
          `)}
        </div>
      </fieldset>
    `}_renderParent(){const e=this._draft.parent,t=()=>this._change({parent:!e});return V`
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
    `}_renderPin(e){return V`
      <div class="field">
        <span class="label">PIN</span>
        ${e?V`
          <pv-pin-actions
            .hass=${this.hass}
            .api=${this.api}
            .layout=${this.layout}
            .member=${e}
            .shuffle=${!!this.household?.security.shuffle_keypad}
            .sharedScreens=${(this.household?.security.shared_screens??0)>0}
          ></pv-pin-actions>
        `:V`
          <p class="hint">You can set a PIN after adding ${this._draft.name.trim()||"them"}.</p>
        `}
      </div>
    `}_renderHomeAssistant(){const e=this.household.members,t=new Set(e.filter(e=>e.id!==this._memberId&&e.person).map(e=>e.person)),i=Object.keys(this.hass?.states??{}).filter(e=>e.startsWith("person.")&&!t.has(e)).sort(),s=this._memberId?li(this._memberId,this.data?.calendars??[]):[];return V`
      <fieldset class="field">
        <legend>Home Assistant</legend>
        <label class="field">
          <span class="label">Person</span>
          <select class="pv-input pv-select" .value=${this._draft.person??""}
            @change=${e=>this._linkPerson(e.target.value)}>
            <option value="" ?selected=${!this._draft.person}>None</option>
            ${i.map(e=>V`
              <option value=${e} ?selected=${this._draft.person===e}>${this.hass.states[e]?.attributes?.friendly_name??e}</option>
            `)}
          </select>
        </label>
        <span class="label">Calendars</span>
        ${s.length?V`<ul class="calendars">${s.map(e=>V`<li>${e.display_name}</li>`)}</ul>`:V`<p class="hint">No calendars yet. Choose who each calendar belongs to in Calendars.</p>`}
      </fieldset>
    `}_renderNotice(e){return this._notice?"discard"===this._notice?V`
        <pv-notice-sheet .layout=${this.layout} heading="Discard changes?"
          .actions=${[{id:"keep",label:"Keep editing",kind:"secondary"},{id:"discard",label:"Discard",kind:"destructive"}]}
          @pv-sheet-action=${this._onDiscardChoice}></pv-notice-sheet>
      `:"remove"===this._notice&&e?V`
        <pv-notice-sheet .layout=${this.layout} heading="Remove ${e.name}?"
          body="Their calendars stay, and won't belong to anyone."
          .actions=${[{id:"cancel",label:"Cancel",kind:"secondary"},{id:"remove",label:"Remove",kind:"destructive"}]}
          @pv-sheet-action=${this._onRemoveChoice}></pv-notice-sheet>
      `:V`
      <pv-notice-sheet .layout=${this.layout} heading="This changed on another screen."
        .actions=${[{id:"keep",label:"Keep editing",kind:"secondary"},{id:"load",label:"Load the new version",kind:"primary"}]}
        @pv-sheet-action=${this._onChangedChoice}></pv-notice-sheet>
    `:q}_change(e){this._draft={...this._draft,...e},this._problem="",this.drafts.set(this._draftKey,this._draft)}_linkPerson(e){const t=this._draft.picture;this._change({person:e||null,picture:!e&&t.person?{initial:!0}:this._draft.picture})}_pop(){this.dispatchEvent(new CustomEvent(Xt,{bubbles:!0,composed:!0}))}_cancel(){ns(this._draft,this._start)?this._notice="discard":this._pop()}async _save(){const e=function(e,t,i){const s=e.name.trim();if(!s)return"Add a name.";const r=t.filter(e=>e.id!==i);if(r.some(e=>e.name.toLocaleLowerCase()===s.toLocaleLowerCase()))return"Someone already has that name.";const a=r.find(t=>t.color.toUpperCase()===e.color.toUpperCase());return a?`${a.name} already has that color.`:null}(this._draft,this.household?.members??[],this._memberId);if(e)return void(this._problem=e);const t=this._member;this._saving=!0;try{await this.api.saveMember(function(e,t){const i={};for(const s of rs)t&&as(e[s],t[s])||(i[s]=e[s]);return"string"==typeof i.name&&(i.name=i.name.trim()),i}(this._draft,t),t?{id:t.id,rev:t.rev}:void 0),this.drafts.delete(this._draftKey),this._start=this._draft,this._pop()}catch(e){const t=Kt(e);"changed"===t?this._notice="changed":this._problem=e?.message||Zt(t)}finally{this._saving=!1}}_onDiscardChoice(e){e.stopPropagation(),this._notice=null;const t="discard"===e.detail.id;if(t&&(this.drafts.delete(this._draftKey),this._draft=this._start),this._leave){const e=this._leave;this._leave=void 0,e(t)}else t&&this._pop()}async _onRemoveChoice(e){e.stopPropagation(),this._notice=null;const t=this._member;if("remove"===e.detail.id&&t)try{await this.api.deleteMember(t.id),this.drafts.delete(this._draftKey),this._start=this._draft,this._pop()}catch(e){this._problem=e?.message||Zt(Kt(e))}}_onChangedChoice(e){e.stopPropagation(),this._notice=null,"load"===e.detail.id&&this.household&&(this._start=os(this._member,this.household.members,ds),this._draft=this._start,this.drafts.delete(this._draftKey))}}cs.styles=[Je,tt,rt,o`
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
    `],e([ve({attribute:!1})],cs.prototype,"hass",void 0),e([ve({attribute:!1})],cs.prototype,"data",void 0),e([ve({attribute:!1})],cs.prototype,"household",void 0),e([ve({attribute:!1})],cs.prototype,"api",void 0),e([ve({type:String})],cs.prototype,"layout",void 0),e([ve({type:String})],cs.prototype,"mode",void 0),e([ve({attribute:!1})],cs.prototype,"pageProps",void 0),e([ve({attribute:!1})],cs.prototype,"drafts",void 0),e([ue()],cs.prototype,"_draft",void 0),e([ue()],cs.prototype,"_start",void 0),e([ue()],cs.prototype,"_problem",void 0),e([ue()],cs.prototype,"_saving",void 0),e([ue()],cs.prototype,"_notice",void 0),ge("pv-settings-person",cs);class ps extends de{constructor(){super(...arguments),this.household=null,this.layout="landscape",this.mode="settings",this._message="",this._busy=!1,this._toggleShared=()=>{this.household&&this._run(()=>this.api.setSharedScreen(!this.household.account.shared))},this._toggleShuffle=()=>{this.household&&this._run(()=>this.api.saveSecurity({shuffle_keypad:!this.household.security.shuffle_keypad}))}}render(){const e=this.household;if(!e)return q;const t=e.account,i=e.security.shared_screens>0;return V`
      <section>
        <h2>This screen</h2>
        ${this._switch("Shared family screen","shared-label",t.shared,this._toggleShared)}
        <p class="hint">Yes, the whole family uses it. Settings asks for a parent's PIN.</p>
        ${this._message?V`<p class="message" role="alert">${this._message}</p>`:q}
        ${t.is_admin?V`
          <p class="note">
            This screen is signed in with an admin account. A non-admin account is safer for a
            shared screen, because anyone here can reach Home Assistant's own settings.
            <a href="https://www.home-assistant.io/docs/authentication/" target="_blank" rel="noopener noreferrer">How to set one up</a>
          </p>
        `:q}
      </section>

      <section>
        <h2>PINs</h2>
        ${ai(e.members).map(t=>V`
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
    `}_switch(e,t,i,s){return V`
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
    `}async _run(e){if(!this._busy){this._busy=!0,this._message="";try{await e()}catch(e){this._message=e?.message||Zt(Kt(e))}finally{this._busy=!1}}}}ps.styles=[Je,tt,rt,o`
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
    `],e([ve({attribute:!1})],ps.prototype,"hass",void 0),e([ve({attribute:!1})],ps.prototype,"data",void 0),e([ve({attribute:!1})],ps.prototype,"household",void 0),e([ve({attribute:!1})],ps.prototype,"api",void 0),e([ve({type:String})],ps.prototype,"layout",void 0),e([ve({type:String})],ps.prototype,"mode",void 0),e([ue()],ps.prototype,"_message",void 0),e([ue()],ps.prototype,"_busy",void 0),ge("pv-settings-pins",ps);class hs extends de{render(){return V`
      <p class="name">PlanaVista</p>
      <p class="version">Version ${Di}</p>
      <ul>
        <li><a href="https://github.com/tavenhall1/planavista" target="_blank" rel="noopener noreferrer">Project on GitHub</a></li>
        <li><a href="https://github.com/tavenhall1/planavista/issues" target="_blank" rel="noopener noreferrer">Report a problem</a></li>
      </ul>
    `}}hs.styles=[Je,o`
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
        color: var(--pv-accent, #6366F1);
        text-decoration: none;
        font-weight: 600;
      }
    `],ge("pv-settings-about",hs);class vs extends de{constructor(){super(...arguments),this.household=null,this.layout="landscape",this.mode="settings"}render(){return V`
      <pv-theme-picker
        .hass=${this.hass}
        .data=${this.data}
        .household=${this.household}
        .api=${this.api}
        .layout=${this.layout}
        mode=${this.mode}
      ></pv-theme-picker>
    `}}vs.styles=o`
    :host {
      display: block;
    }
  `,e([ve({attribute:!1})],vs.prototype,"hass",void 0),e([ve({attribute:!1})],vs.prototype,"data",void 0),e([ve({attribute:!1})],vs.prototype,"household",void 0),e([ve({attribute:!1})],vs.prototype,"api",void 0),e([ve({type:String})],vs.prototype,"layout",void 0),e([ve({type:String})],vs.prototype,"mode",void 0),ge("pv-settings-appearance",vs);class us extends de{constructor(){super(...arguments),this.household=null,this.layout="landscape",this.session=null,this.sessionEndsAt=0,this.parent=null,this.drafts=new Map,this._selected=null,this._stack=[],this._toast="",this._back=async()=>{await this._mayLeave()&&(this._stack.length>0?this._stack=this._stack.slice(0,-1):this._selected=null)},this._done=async()=>{await this._mayLeave()&&this.dispatchEvent(new CustomEvent("pv-settings-close",{bubbles:!0,composed:!0}))},this._onPush=e=>{e.stopPropagation(),this._stack=[...this._stack,e.detail]},this._onPop=e=>{e.stopPropagation(),this._stack=this._stack.slice(0,-1)},this._onError=e=>{e.stopPropagation(),this._toast=e.detail.message,window.clearTimeout(this._toastTimer),this._toastTimer=window.setTimeout(()=>{this._toast=""},4e3)}}connectedCallback(){super.connectedCallback(),this.addEventListener(Gt,this._onPush),this.addEventListener(Xt,this._onPop),this.addEventListener(Qt,this._onError)}disconnectedCallback(){super.disconnectedCallback(),this.removeEventListener(Gt,this._onPush),this.removeEventListener(Xt,this._onPop),this.removeEventListener(Qt,this._onError),window.clearTimeout(this._toastTimer)}_context(){return{household:this.household,data:this.data}}get _split(){return"landscape"===this.layout}_current(e){return e.find(e=>e.id===this._selected)??(this._split?e[0]:void 0)}render(){const e=yi.pages(this._context()),t=this._current(e),i=this._stack[this._stack.length-1],s=!this._split&&t;return V`
      ${this.session?.parent&&this.parent?V`
        <pv-parent-strip .member=${this.parent} .hass=${this.hass} .endsAt=${this.sessionEndsAt}></pv-parent-strip>
      `:q}
      <div class="bar">
        ${s?V`<button class="back" type="button" @click=${this._back}>‹ ${i?i.back:"Settings"}</button>`:V`<h1 class="title">Settings</h1>`}
        <button class="pv-btn pv-btn-primary done" type="button" @click=${this._done}>Done</button>
      </div>
      <div class="body">
        ${this._split||!t?this._renderList(e,t):q}
        ${t?this._renderPage(t,i):q}
      </div>
      ${this._toast?V`<div class="toast" role="status">${this._toast}</div>`:q}
    `}_renderList(e,t){const i=this._context();return V`
      <nav class="list" aria-label="Settings">
        ${function(e,t=gi){const i=new Set(t.map(e=>e.id)),s=[...new Set(e.map(e=>e.group).filter(e=>!i.has(e)))].map(e=>({id:e,label:null,order:1e3}));return[...t,...s].sort((e,t)=>e.order-t.order).map(t=>({group:t,pages:e.filter(e=>e.group===t.id)})).filter(e=>e.pages.length>0)}(e).map(({group:e,pages:s})=>V`
          <section class="group">
            ${e.label?V`<h2 class="group-label">${e.label}</h2>`:q}
            ${s.map(e=>{const s=this._split&&t?.id===e.id;return V`
                <button class="row ${s?"row--active":""}" type="button"
                  aria-current=${s?"page":"false"}
                  @click=${()=>this._select(e.id)}>
                  <span class="row-text">
                    <span class="row-label">${e.label}</span>
                    ${e.summary?V`<span class="row-value">${e.summary(i)}</span>`:q}
                  </span>
                  <span class="chevron" aria-hidden="true">›</span>
                </button>
              `})}
          </section>
        `)}
      </nav>
    `}_renderPage(e,t){const i=Fi(t?t.tag:e.tag),s=t?t.title:e.label,r=[e.id,...this._stack.map(e=>`${e.tag}:${JSON.stringify(e.props??{})}`)].join("/");return V`
      <section class="page" aria-label=${s}>
        ${this._split&&t?V`<button class="back" type="button" @click=${this._back}>‹ ${t.back}</button>`:q}
        <h1 class="page-heading">${s}</h1>
        ${this.household&&!this.household.available?V`<p class="banner">People and PINs can't be changed until PlanaVista is updated.</p>`:q}
        ${ts(r,Ei`
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
    `}async _mayLeave(){const e=this.renderRoot.querySelector(".page-el");return!e?.confirmLeave||e.confirmLeave()}async _select(e){e===this._selected&&0===this._stack.length||await this._mayLeave()&&(this._stack=[],this._selected=e)}}us.styles=[Je,tt,o`
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
        margin: 0;
        font-size: 1.25rem;
        font-weight: 700;
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
        color: var(--pv-accent, #6366F1);
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
        margin: 6px 0 16px;
        font-size: 1.5rem;
        font-weight: 700;
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
    `],e([ve({attribute:!1})],us.prototype,"hass",void 0),e([ve({attribute:!1})],us.prototype,"data",void 0),e([ve({attribute:!1})],us.prototype,"household",void 0),e([ve({attribute:!1})],us.prototype,"api",void 0),e([ve({type:String,reflect:!0})],us.prototype,"layout",void 0),e([ve({attribute:!1})],us.prototype,"session",void 0),e([ve({type:Number})],us.prototype,"sessionEndsAt",void 0),e([ve({attribute:!1})],us.prototype,"parent",void 0),e([ve({attribute:!1})],us.prototype,"drafts",void 0),e([ue()],us.prototype,"_selected",void 0),e([ue()],us.prototype,"_stack",void 0),e([ue()],us.prototype,"_toast",void 0),ge("pv-settings",us);const ms=["#F94144","#277DA1","#43AA8B","#F9C74F"];class gs extends de{render(){const e=2*Math.PI*30;return V`
      <div class="rings" aria-hidden="true">
        ${ms.map(t=>V`
          <svg width=${72} height=${72} viewBox="0 0 ${72} ${72}">
            ${W`
              <circle cx="36" cy="36" r=${30} fill="none" stroke=${t} stroke-width="8" opacity="0.2"></circle>
              <circle cx="36" cy="36" r=${30} fill="none" stroke=${t} stroke-width="8"
                stroke-linecap="round" stroke-dasharray=${e} stroke-dashoffset=${.25*e}></circle>
            `}
          </svg>
        `)}
      </div>
    `}}gs.styles=o`
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
  `,ge("pv-setup-welcome",gs);class ys extends de{constructor(){super(...arguments),this.household=null,this.layout="landscape",this.mode="setup",this._rows=[],this._name="",this._message="",this._built=!1,this._added=0,this._add=()=>{var e,t;this._name.trim()&&(this._rows=[...this._rows,(e=this._name,t=this._added++,{key:`new:${t}`,name:e.trim(),person:null,memberId:null,role:"adult",checked:!0})],this._name="")}}willUpdate(){if(!this._built&&this.hass&&this.household){const e=Object.values(this.hass.states).filter(e=>e.entity_id.startsWith("person.")).map(e=>({entity_id:e.entity_id,name:e.attributes.friendly_name??e.entity_id,user_id:e.attributes.user_id??null})).sort((e,t)=>e.name.localeCompare(t.name));this._rows=function(e,t,i){const s=e.map(e=>({key:e.id,name:e.name,person:e.person,memberId:e.id,role:si(e),checked:!0}));for(const r of t){if(e.some(e=>e.person===r.entity_id))continue;const t=!!i&&r.user_id===i;s.push({key:r.entity_id,name:r.name,person:r.entity_id,memberId:null,role:t?"parent":"adult",checked:!0})}return s}(this.household.members,e,this.hass.user?.id??null),this._built=!0}}async commit(){const e=this.household?.members??[],t=function(e,t){const i={add:[],update:[],remove:[]};for(const s of e){const e=s.memberId?t.find(e=>e.id===s.memberId):void 0;e?s.checked?s.role!==si(e)&&i.update.push({id:e.id,changes:ri(s.role)}):i.remove.push(e.id):s.checked&&s.name.trim()&&i.add.push({name:s.name.trim(),...ri(s.role),...s.person?{person:s.person}:{}})}return i}(this._rows,e);this._message="";try{for(const e of t.remove)await this.api.deleteMember(e);for(const{id:i,changes:s}of t.update){const t=e.find(e=>e.id===i);await this.api.saveMember(s,t?{id:i,rev:t.rev}:void 0)}for(const e of t.add)await this.api.saveMember(e);return!0}catch(e){return this._message=e?.message||Zt(Kt(e)),!1}finally{this._built=!1,this.requestUpdate()}}render(){return V`
      <ul>
        ${this._rows.map((e,t)=>V`
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
              ${ii.map(t=>V`<option value=${t.id} ?selected=${e.role===t.id}>${t.label}</option>`)}
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
      ${this._message?V`<p class="message" role="alert">${this._message}</p>`:q}
    `}_update(e,t){this._rows=this._rows.map((i,s)=>s===e?{...i,...t}:i)}}ys.styles=[Je,tt,rt,o`
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
    `],e([ve({attribute:!1})],ys.prototype,"hass",void 0),e([ve({attribute:!1})],ys.prototype,"data",void 0),e([ve({attribute:!1})],ys.prototype,"household",void 0),e([ve({attribute:!1})],ys.prototype,"api",void 0),e([ve({type:String})],ys.prototype,"layout",void 0),e([ve({type:String})],ys.prototype,"mode",void 0),e([ue()],ys.prototype,"_rows",void 0),e([ue()],ys.prototype,"_name",void 0),e([ue()],ys.prototype,"_message",void 0),ge("pv-setup-people",ys);class bs extends de{constructor(){super(...arguments),this.household=null,this.layout="landscape",this.mode="setup"}render(){return V`
      <pv-theme-picker
        .hass=${this.hass}
        .data=${this.data}
        .household=${this.household}
        .api=${this.api}
        .layout=${this.layout}
        mode="setup"
      ></pv-theme-picker>
    `}}function fs(e,t,i){const s={...e};return"12"===t?.time_format&&(s.time_format="12h"),"24"===t?.time_format&&(s.time_format="24h"),"monday"!==t?.first_weekday&&"sunday"!==t?.first_weekday||(s.first_day=t.first_weekday),!s.weather_entity&&i.length>0&&(s.weather_entity=[...i].sort()[0]),s}bs.styles=o`
    :host {
      display: block;
    }
  `,e([ve({attribute:!1})],bs.prototype,"hass",void 0),e([ve({attribute:!1})],bs.prototype,"data",void 0),e([ve({attribute:!1})],bs.prototype,"household",void 0),e([ve({attribute:!1})],bs.prototype,"api",void 0),e([ve({type:String})],bs.prototype,"layout",void 0),e([ve({type:String})],bs.prototype,"mode",void 0),ge("pv-setup-look",bs);class _s extends de{constructor(){super(...arguments),this.household=null,this.layout="landscape",this.mode="setup",this._message=""}async commit(){this._message="";try{const e=Object.keys(this.hass.states).filter(e=>e.startsWith("weather.")),t=this.hass.locale;return await this.api.saveConfig({display:fs(this.data.display,t,e),onboarding_complete:!0}),await this.api.saveSetup({completed:!0,step:null}),!0}catch(e){return this._message=Zt(Kt(e)),!1}}render(){return V`
      <ul>
        <li>Tap the gear to change anything later.</li>
        <li>On a shared screen, Settings asks for a parent's PIN.</li>
      </ul>
      ${this._message?V`<p class="message" role="alert">${this._message}</p>`:q}
    `}}_s.styles=[Je,o`
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
    `],e([ve({attribute:!1})],_s.prototype,"hass",void 0),e([ve({attribute:!1})],_s.prototype,"data",void 0),e([ve({attribute:!1})],_s.prototype,"household",void 0),e([ve({attribute:!1})],_s.prototype,"api",void 0),e([ve({type:String})],_s.prototype,"layout",void 0),e([ve({type:String})],_s.prototype,"mode",void 0),e([ue()],_s.prototype,"_message",void 0),ge("pv-setup-done",_s);class xs extends de{constructor(){super(...arguments),this.household=null,this.layout="landscape",this._index=0,this._busy=!1,this._toast="",this._started=!1,this._next=async()=>{if(this._busy)return;const e=this.renderRoot.querySelector(".step-el");this._busy=!0;try{if(e?.commit&&!await e.commit())return;const t=this._steps();if(this._index>=t.length-1)return void this.dispatchEvent(new CustomEvent("onboarding-complete",{bubbles:!0,composed:!0}));this._index+=1,this._remember(t[this._index].id)}finally{this._busy=!1}},this._back=()=>{0===this._index||this._busy||(this._index-=1,this._remember(this._steps()[this._index].id))}}disconnectedCallback(){super.disconnectedCallback(),window.clearTimeout(this._toastTimer)}willUpdate(){!this._started&&this.data&&(this._index=function(e,t){const i=t?e.findIndex(e=>e.id===t):-1;return i>=0?i:0}(this._steps(),this.household?.setup.step??null),this._started=!0)}_steps(){return bi.pages({household:this.household,data:this.data})}render(){const e=this._steps();if(0===e.length)return q;const t=Math.min(this._index,e.length-1),i=e[t],s=t===e.length-1,r=Fi(i.tag);return V`
      <div class="top">
        <button class="back ${0===t?"hidden":""}" type="button"
          ?disabled=${0===t||this._busy}
          aria-hidden=${0===t?"true":"false"}
          @click=${this._back}>‹ Back</button>
        <div class="progress-dots" role="img" aria-label="Step ${t+1} of ${e.length}">
          ${e.map((e,i)=>V`<div class="dot ${i===t?"dot--active":""}"></div>`)}
        </div>
        <span></span>
      </div>
      <div class="content">
        <div class="column">
          <h1 class="heading">${i.heading}</h1>
          ${i.lead?V`<p class="lead">${i.lead}</p>`:q}
          ${ts(i.id,Ei`
            <${r}
              class="step-el"
              .hass=${this.hass}
              .data=${this.data}
              .household=${this.household}
              .api=${this.api}
              .layout=${this.layout}
              mode="setup"
            ></${r}>
          `)}
        </div>
      </div>
      <div class="bottom">
        <button class="pv-btn pv-btn-primary main" type="button" ?disabled=${this._busy} @click=${this._next}>
          ${i.primary??(s?"Finish":"Next")}
        </button>
      </div>
      ${this._toast?V`<div class="toast" role="status">${this._toast}</div>`:q}
    `}_remember(e){this.api.saveSetup({step:e}).catch(e=>{this._toast=Zt(Kt(e)),window.clearTimeout(this._toastTimer),this._toastTimer=window.setTimeout(()=>{this._toast=""},4e3)})}}xs.styles=[Je,tt,o`
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
        color: var(--pv-accent, #6366F1);
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
        margin: 8px 0 8px;
        font-size: 2rem;
        font-weight: 700;
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
    `],e([ve({attribute:!1})],xs.prototype,"hass",void 0),e([ve({attribute:!1})],xs.prototype,"data",void 0),e([ve({attribute:!1})],xs.prototype,"household",void 0),e([ve({attribute:!1})],xs.prototype,"api",void 0),e([ve({type:String,reflect:!0})],xs.prototype,"layout",void 0),e([ue()],xs.prototype,"_index",void 0),e([ue()],xs.prototype,"_busy",void 0),e([ue()],xs.prototype,"_toast",void 0),ge("pv-setup",xs);const ws="sensor.planavista_config";class $s extends de{constructor(){super(...arguments),this._wizardOpen=!1,this._onboardingDone=!1,this._settingsOpen=!1,this._previewOverrides=null,this._sheet=null,this._sheetOpener=null,this._drafts=new Map,this._settingsVia=null,this._previewed=!1,this._household=new Pi(this),this._session=new Ii(this,()=>this._api),this._layout=new Mi(this),this._api=new qt({callWS:e=>this.hass.callWS(e)},()=>this._session.token),this._dataFor=lt((e,t)=>this.hass?function(e,t="sensor.planavista_config"){const i=e.states[t];if(!i)return null;const s=i.attributes,r=s.events||[];return{calendars:s.calendars||[],events:r,display:s.display||{time_format:"12h",weather_entity:"",first_day:"sunday",default_view:"day",theme:"light"},onboarding_complete:s.onboarding_complete,version:s.version}}(this.hass,t):null),this._displayFor=lt((e,t)=>function(e,t){const i=t?.display;return{time_format:e?.time_format||i?.time_format||"12h",weather_entity:e?.weather_entity||i?.weather_entity||"",first_day:e?.first_day||i?.first_day||"sunday",default_view:e?.default_view||e?.view||i?.default_view||"week",theme:e?.theme||i?.theme||"light",theme_overrides:i?.theme_overrides,location_autocomplete:!0===i?.location_autocomplete}}(e,t)),this._modulesFor=lt(e=>function(e,t){let i=e;if(Array.isArray(t.modules)){const s=[];for(const i of t.modules){const t="string"==typeof i?e.find(e=>e.id===i):void 0;t&&!s.includes(t)&&s.push(t)}s.length>0&&(i=s)}const s="string"==typeof t.module?i.find(e=>e.id===t.module):void 0;return{shown:i,initial:s??i[0]}}(ui.list(),e??{}))}shouldUpdate(e){return 1!==e.size||!e.has("hass")||(t=e.get("hass"),i=this.hass,s=this._watchedEntityIds(),t&&i?s.some(e=>t.states[e]!==i.states[e]):t!==i);var t,i,s}_entityId(){return this._config?.entity||ws}_data(){const e=this._entityId();return this._dataFor(this.hass?.states?.[e],e)}_display(){return this._displayFor(this._config,this._data())}_modules(){return this._modulesFor(this._config)}_watchedEntityIds(){const e=this._data(),t=[this._entityId()],i=this._display().weather_entity;i&&t.push(i);for(const i of this._modules().shown)t.push(...i.watchedEntities({config:this._config,data:e}));return t}setConfig(e){this._config={entity:ws,...e}}updated(e){super.updated(e),this._guardSettings(),this._settingsOpen||this._wizardOpen||(e.has("hass")||e.has("_config")||e.has("_settingsOpen"))&&this._applySavedTheme()}_applySavedTheme(){const e=this._data();Re(this,We(this._config?.theme,e?.display?.theme),e?.display?.theme_overrides||null)}_onOnboardingComplete(){this._wizardOpen=!1,this._onboardingDone=!0,Ve(this)}_access(){const e=!!this.hass?.user?.is_admin;return this._household.ready?function(e,t){return e&&e.available?e.account.parent_level?"open":"shared"===e.account.kind||"other"===e.account.kind?ni(e.members).length>0?"pin":"no_pin":"none":t?"open":"none"}(this._household.view,e):e?"open":"none"}_openSettings(e){this._sheetOpener=e?.composedPath?.()[0]??null;const t=this._access();"open"===t||this._session.session?.parent?(this._settingsVia="open"===t?"access":"session",this._settingsOpen=!0):"pin"===t?this._sheet={kind:"pin",purpose:"settings",heading:"Who's opening Settings?"}:"no_pin"===t&&(this._sheet={kind:"no_pin"})}_beginSetup(e){this._sheetOpener=e?.composedPath?.()[0]??null,"open"===this._access()||this._session.session?.parent?this._wizardOpen=!0:"pin"===this._access()&&(this._sheet={kind:"pin",purpose:"setup",heading:"Who's setting up PlanaVista?"})}_renderSetupCard(){const e=this._access(),t=V`
      <div class="pvc-setup-icon" aria-hidden="true">
        <svg viewBox="0 0 24 24" width="48" height="48" fill="currentColor">
          <path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V9h14v11zM9 14H7v-2h2v2zm4 0h-2v-2h2v2zm4 0h-2v-2h2v2zm-8 4H7v-2h2v2zm4 0h-2v-2h2v2zm4 0h-2v-2h2v2z"/>
        </svg>
      </div>
    `;return"open"!==e&&"pin"!==e?V`
        <div class="pvc-setup-pending">
          ${t}
          <p class="pvc-setup-title">PlanaVista isn't set up yet</p>
          <p class="pvc-setup-hint">An admin can set it up from their own Home Assistant login.</p>
        </div>
      `:V`
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
    `}_onUnlocked(e){const t=this._sheet;this._session.unlocked(e.detail.result),this._closeSheet(),"pin"!==t?.kind||"settings"!==t.purpose&&"continue"!==t.purpose||(this._settingsVia="session",this._settingsOpen=!0),"pin"===t?.kind&&"setup"===t.purpose&&(this._wizardOpen=!0)}_onSheetCancel(){const e=this._sheet;this._closeSheet(),"pin"===e?.kind&&"continue"===e.purpose&&this._onSettingsClose()}_guardSettings(){if(!this._settingsOpen||this._session.session?.parent||this._sheet)return;const e=this._access();"open"!==e&&("access"!==this._settingsVia||"pin"!==e?this._onSettingsClose():this._sheet={kind:"pin",purpose:"continue",heading:"Enter a parent's PIN to keep changing settings"})}_closeSheet(){this._sheet=null;const e=this._sheetOpener;this._sheetOpener=null,e?.focus?.()}_renderSheet(){const e=this._sheet;if(!e)return q;const t=this._layout.layout;if("no_pin"===e.kind)return V`
        <pv-notice-sheet
          .layout=${t}
          heading="Settings needs a parent's PIN"
          body="On a shared screen, a parent opens Settings with their PIN, and no parent has one yet. Sign in to Home Assistant with a parent's or an admin's own account, then set one in Settings, PINs and parent mode."
          .actions=${[{id:"ok",label:"OK",kind:"primary"}]}
          @pv-sheet-action=${this._closeSheet}
        ></pv-notice-sheet>
      `;const i=this._household.view;return V`
      <pv-pin-sheet
        .hass=${this.hass}
        .api=${this._api}
        .layout=${t}
        mode="unlock"
        .members=${i?ni(i.members):[]}
        .heading=${e.heading}
        .shuffle=${!!i?.security.shuffle_keypad}
        @pv-unlocked=${this._onUnlocked}
        @pv-sheet-close=${this._onSheetCancel}
      ></pv-pin-sheet>
    `}_renderParentStrip(){const e=this._session.session;if(!e?.parent)return q;const t=this._household.view?.members.find(t=>t.id===e.memberId);return t?V`
      <pv-parent-strip
        .member=${t}
        .hass=${this.hass}
        .endsAt=${this._session.endsAt??0}
        @pv-lock=${()=>this._session.lock()}
      ></pv-parent-strip>
    `:q}_onSettingsClose(){this._settingsOpen=!1,this._settingsVia=null,this._previewOverrides=null,Ve(this),this._previewed?this._previewed=!1:this._applySavedTheme()}_onSettingsLock(){this._session.lock(),"open"!==this._access()&&this._onSettingsClose()}_onThemePreview(e){const{theme:t,overrides:i}=e.detail,s=We(t);Ve(this),Re(this,s,i),this._previewOverrides=i,this._previewed=!0}_getWeatherEntity(){const e=this._display().weather_entity;return e?this.hass?.states?.[e]:null}_showWeatherDetails(){const e=this._display().weather_entity;e&&this.dispatchEvent(new CustomEvent("hass-more-info",{detail:{entityId:e},bubbles:!0,composed:!0}))}render(){if(!this._config||!this.hass)return q;const e=this._data();if(!e)return V`
        <ha-card>
          <div class="pvc-empty">
            <p>PlanaVista entity not found</p>
            <p style="font-size: 0.8rem;">Check that the PlanaVista integration is configured.</p>
          </div>
        </ha-card>
      `;if(!1===e.onboarding_complete&&!this._onboardingDone)return V`
        <ha-card>
          ${this._wizardOpen?V`
            <pv-setup
              .hass=${this.hass}
              .data=${e}
              .household=${this._household.view}
              .api=${this._api}
              .layout=${this._layout.layout}
              @onboarding-complete=${this._onOnboardingComplete}
              @theme-preview=${this._onThemePreview}
            ></pv-setup>
          `:this._renderSetupCard()}
          ${this._renderSheet()}
        </ha-card>
      `;const t=this._display(),i=this._modules().initial;return V`
      <ha-card>
        ${this._renderParentStrip()}
        ${this._config.hide_header?q:this._renderHeader(t)}
        ${i?this._renderModule(i,e,t):q}
        ${this._settingsOpen?V`
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
              @theme-preview=${this._onThemePreview}
            ></pv-settings>
          </div>
        `:q}
        ${this._renderSheet()}
      </ha-card>
    `}_renderModule(e,t,i){const s=Fi(e.tag);return Ei`
      <${s}
        .hass=${this.hass}
        .cardConfig=${this._config}
        .data=${t}
        .display=${i}
        .previewOverrides=${this._previewOverrides}
        .canOpenSettings=${"none"!==this._access()}
        @pv-open-settings=${this._openSettings}
      ></${s}>
    `}_renderHeader(e){const t=this._config?.hide_weather?null:this._getWeatherEntity();return V`
      <div class="pvc-header">
        ${t?V`
          <div class="pvc-weather" @click=${this._showWeatherDetails}
               title="Click for weather details">
            <div class="pvc-weather-icon">
              ${Et(t.state||"cloudy",48)}
            </div>
            <div class="pvc-weather-info">
              <span class="pvc-weather-temp">
                ${Math.round(t.attributes.temperature??0)}°${this._getTempUnit(t)}
              </span>
              <span class="pvc-weather-condition">
                ${(t.state||"").replace(/-/g," ")}
              </span>
            </div>
          </div>
        `:V`<div class="pvc-no-weather"></div>`}

        <pv-clock .timeFormat=${e.time_format||"12h"}></pv-clock>
      </div>
    `}_getTempUnit(e){return(e.attributes.temperature_unit||"").includes("C")?"C":"F"}static getConfigElement(){return document.createElement("planavista-calendar-card-editor")}static getStubConfig(){return{entity:ws}}getCardSize(){return 10}}var ks;$s.styles=[Je,tt,et,ot,o`
      :host {
        display: block;
        height: calc(100vh - var(--header-height, 56px));
        overflow: hidden;
        font-family: var(--pv-font-family);
        color: var(--pv-text);
      }

      pv-clock {
        display: contents;
      }

      ha-card {
        display: flex;
        flex-direction: column;
        overflow: hidden;
        height: 100%;
        background: var(--pv-card-bg);
        border-radius: var(--pv-radius-lg);
        box-shadow: var(--pv-shadow);
      }

/* ================================================================
         HEADER: weather left, date center, time right
         ================================================================ */

      .pvc-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 18px 24px;
        background: var(--pv-header-gradient);
        color: var(--pv-header-text);
        flex-shrink: 0;
      }

/* -- Weather (left) -- */

      .pvc-weather {
        display: flex;
        align-items: center;
        gap: 10px;
        cursor: pointer;
        padding: 6px 10px;
        border-radius: var(--pv-radius-sm);
        transition: background 200ms ease;
        -webkit-tap-highlight-color: transparent;
      }

      .pvc-weather:hover {
        background: rgba(255, 255, 255, 0.15);
      }

      .pvc-weather:active {
        background: rgba(255, 255, 255, 0.25);
      }

      .pvc-weather-info {
        display: flex;
        flex-direction: column;
      }

      .pvc-weather-temp {
        font-size: 1.75rem;
        font-weight: 700;
        line-height: 1.15;
        letter-spacing: -0.5px;
      }

      .pvc-weather-condition {
        font-size: 0.8125rem;
        opacity: 0.85;
        text-transform: capitalize;
        line-height: 1.3;
      }

/* -- Date (center) -- */

      .pvc-header-date {
        font-size: 1.25rem;
        font-weight: 600;
        opacity: 0.95;
        text-align: center;
        white-space: nowrap;
      }

/* -- Time (right) -- */

      .pvc-header-time {
        text-align: right;
      }

      .pvc-time-display {
        font-size: 2rem;
        font-weight: 700;
        letter-spacing: -0.5px;
        line-height: 1.15;
      }

      .pvc-time-ampm {
        font-size: 0.875rem;
        font-weight: 500;
        opacity: 0.8;
        margin-left: 3px;
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
        color: var(--pv-accent, #6366F1);
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

/* Placeholder when no weather configured */

      .pvc-no-weather {
        padding: 6px 10px;
        opacity: 0.6;
        font-size: 0.875rem;
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

      @media (max-width: 479px){
/* Header: date only, slim bar */
        .pvc-header {
          padding: 8px 14px;
          justify-content: center;
        }
        .pvc-weather { display: none; }
        .pvc-header-time { display: none; }
        .pvc-header-date { font-size: 0.9375rem; }
      }

      @media (min-width: 480px) and (max-width: 767px){
        .pvc-header {
          padding: 10px 16px;
        }
        .pvc-weather { display: none; }
        .pvc-header-time { display: none; }
        .pvc-header-date { font-size: 1.0625rem; }
      }

/* md: tablets (768–1023px), single row, slightly compressed */

      @media (min-width: 768px) and (max-width: 1023px){
        .pvc-weather-icon { --icon-size: 36px; }
        .pvc-weather-temp { font-size: 1.5rem; }
        .pvc-time-display { font-size: 1.75rem; }
      }

/* short height (landscape phone, etc.): date-only compact header */

      @media (max-height: 500px){
        .pvc-header {
          padding: 6px 14px;
          justify-content: center;
        }
        .pvc-weather { display: none; }
        .pvc-header-time { display: none; }
        .pvc-header-date { font-size: 0.875rem; }
      }

      @media (min-width: 1024px){
        .pvc-header { padding: 22px 28px; }
        .pvc-weather-temp { font-size: 2rem; }
        .pvc-weather-condition { font-size: 0.9375rem; }
        .pvc-header-date { font-size: 1.5rem; }
        .pvc-time-display { font-size: 2.5rem; }
        .pvc-time-ampm { font-size: 1rem; }
      }

      @media (min-width: 1440px){
        .pvc-header { padding: 26px 36px; }
        .pvc-weather-icon { --icon-size: 56px; }
        .pvc-weather-temp { font-size: 2.375rem; }
        .pvc-weather-condition { font-size: 1.0625rem; }
        .pvc-header-date { font-size: 1.75rem; }
        .pvc-time-display { font-size: 3rem; }
        .pvc-time-ampm { font-size: 1.125rem; }
      }
    `],e([ve({attribute:!1})],$s.prototype,"hass",void 0),e([ue()],$s.prototype,"_config",void 0),e([ue()],$s.prototype,"_wizardOpen",void 0),e([ue()],$s.prototype,"_onboardingDone",void 0),e([ue()],$s.prototype,"_settingsOpen",void 0),e([ue()],$s.prototype,"_previewOverrides",void 0),e([ue()],$s.prototype,"_sheet",void 0),function(e=yi,t=bi){for(const t of Ai)e.register(t);for(const e of Ti)t.register(e)}(),ge("planavista-calendar-card",$s),ks=$s,ye(()=>be("planavista-card",class extends(customElements.get("planavista-calendar-card")??ks){}));const Fs=["planavista-calendar-card","planavista-card"];var Cs;window.customCards=window.customCards||[],(Cs=window.customCards).some(e=>Fs.includes(e.type))||Cs.push({type:"planavista-calendar-card",name:"PlanaVista",description:"All-in-one calendar with clock, weather, toggles, and views",preview:!0}),console.info(`%c PLANAVISTA %c v${Di} `,"color: white; background: #6366F1; font-weight: bold; border-radius: 4px 0 0 4px; padding: 2px 6px;","color: #6366F1; background: #EEF2FF; font-weight: bold; border-radius: 0 4px 4px 0; padding: 2px 6px;");
