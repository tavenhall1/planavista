function e(e,t,s,i){var a,n=arguments.length,o=n<3?t:null===i?i=Object.getOwnPropertyDescriptor(t,s):i;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)o=Reflect.decorate(e,t,s,i);else for(var r=e.length-1;r>=0;r--)(a=e[r])&&(o=(n<3?a(o):n>3?a(t,s,o):a(t,s))||o);return n>3&&o&&Object.defineProperty(t,s,o),o}"function"==typeof SuppressedError&&SuppressedError;const t=globalThis,s=t.ShadowRoot&&(void 0===t.ShadyCSS||t.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,i=Symbol(),a=new WeakMap;let n=class{constructor(e,t,s){if(this._$cssResult$=!0,s!==i)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=e,this.t=t}get styleSheet(){let e=this.o;const t=this.t;if(s&&void 0===e){const s=void 0!==t&&1===t.length;s&&(e=a.get(t)),void 0===e&&((this.o=e=new CSSStyleSheet).replaceSync(this.cssText),s&&a.set(t,e))}return e}toString(){return this.cssText}};const o=(e,...t)=>{const s=1===e.length?e[0]:t.reduce((t,s,i)=>t+(e=>{if(!0===e._$cssResult$)return e.cssText;if("number"==typeof e)return e;throw Error("Value passed to 'css' function must be a 'css' function result: "+e+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(s)+e[i+1],e[0]);return new n(s,e,i)},r=s?e=>e:e=>e instanceof CSSStyleSheet?(e=>{let t="";for(const s of e.cssRules)t+=s.cssText;return(e=>new n("string"==typeof e?e:e+"",void 0,i))(t)})(e):e,{is:l,defineProperty:d,getOwnPropertyDescriptor:c,getOwnPropertyNames:h,getOwnPropertySymbols:p,getPrototypeOf:u}=Object,m=globalThis,v=m.trustedTypes,g=v?v.emptyScript:"",b=m.reactiveElementPolyfillSupport,y=(e,t)=>e,f={toAttribute(e,t){switch(t){case Boolean:e=e?g:null;break;case Object:case Array:e=null==e?e:JSON.stringify(e)}return e},fromAttribute(e,t){let s=e;switch(t){case Boolean:s=null!==e;break;case Number:s=null===e?null:Number(e);break;case Object:case Array:try{s=JSON.parse(e)}catch(e){s=null}}return s}},_=(e,t)=>!l(e,t),w={attribute:!0,type:String,converter:f,reflect:!1,useDefault:!1,hasChanged:_};Symbol.metadata??=Symbol("metadata"),m.litPropertyMetadata??=new WeakMap;let x=class extends HTMLElement{static addInitializer(e){this._$Ei(),(this.l??=[]).push(e)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(e,t=w){if(t.state&&(t.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(e)&&((t=Object.create(t)).wrapped=!0),this.elementProperties.set(e,t),!t.noAccessor){const s=Symbol(),i=this.getPropertyDescriptor(e,s,t);void 0!==i&&d(this.prototype,e,i)}}static getPropertyDescriptor(e,t,s){const{get:i,set:a}=c(this.prototype,e)??{get(){return this[t]},set(e){this[t]=e}};return{get:i,set(t){const n=i?.call(this);a?.call(this,t),this.requestUpdate(e,n,s)},configurable:!0,enumerable:!0}}static getPropertyOptions(e){return this.elementProperties.get(e)??w}static _$Ei(){if(this.hasOwnProperty(y("elementProperties")))return;const e=u(this);e.finalize(),void 0!==e.l&&(this.l=[...e.l]),this.elementProperties=new Map(e.elementProperties)}static finalize(){if(this.hasOwnProperty(y("finalized")))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(y("properties"))){const e=this.properties,t=[...h(e),...p(e)];for(const s of t)this.createProperty(s,e[s])}const e=this[Symbol.metadata];if(null!==e){const t=litPropertyMetadata.get(e);if(void 0!==t)for(const[e,s]of t)this.elementProperties.set(e,s)}this._$Eh=new Map;for(const[e,t]of this.elementProperties){const s=this._$Eu(e,t);void 0!==s&&this._$Eh.set(s,e)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(e){const t=[];if(Array.isArray(e)){const s=new Set(e.flat(1/0).reverse());for(const e of s)t.unshift(r(e))}else void 0!==e&&t.push(r(e));return t}static _$Eu(e,t){const s=t.attribute;return!1===s?void 0:"string"==typeof s?s:"string"==typeof e?e.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){this._$ES=new Promise(e=>this.enableUpdating=e),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach(e=>e(this))}addController(e){(this._$EO??=new Set).add(e),void 0!==this.renderRoot&&this.isConnected&&e.hostConnected?.()}removeController(e){this._$EO?.delete(e)}_$E_(){const e=new Map,t=this.constructor.elementProperties;for(const s of t.keys())this.hasOwnProperty(s)&&(e.set(s,this[s]),delete this[s]);e.size>0&&(this._$Ep=e)}createRenderRoot(){const e=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return((e,i)=>{if(s)e.adoptedStyleSheets=i.map(e=>e instanceof CSSStyleSheet?e:e.styleSheet);else for(const s of i){const i=document.createElement("style"),a=t.litNonce;void 0!==a&&i.setAttribute("nonce",a),i.textContent=s.cssText,e.appendChild(i)}})(e,this.constructor.elementStyles),e}connectedCallback(){this.renderRoot??=this.createRenderRoot(),this.enableUpdating(!0),this._$EO?.forEach(e=>e.hostConnected?.())}enableUpdating(e){}disconnectedCallback(){this._$EO?.forEach(e=>e.hostDisconnected?.())}attributeChangedCallback(e,t,s){this._$AK(e,s)}_$ET(e,t){const s=this.constructor.elementProperties.get(e),i=this.constructor._$Eu(e,s);if(void 0!==i&&!0===s.reflect){const a=(void 0!==s.converter?.toAttribute?s.converter:f).toAttribute(t,s.type);this._$Em=e,null==a?this.removeAttribute(i):this.setAttribute(i,a),this._$Em=null}}_$AK(e,t){const s=this.constructor,i=s._$Eh.get(e);if(void 0!==i&&this._$Em!==i){const e=s.getPropertyOptions(i),a="function"==typeof e.converter?{fromAttribute:e.converter}:void 0!==e.converter?.fromAttribute?e.converter:f;this._$Em=i;const n=a.fromAttribute(t,e.type);this[i]=n??this._$Ej?.get(i)??n,this._$Em=null}}requestUpdate(e,t,s,i=!1,a){if(void 0!==e){const n=this.constructor;if(!1===i&&(a=this[e]),s??=n.getPropertyOptions(e),!((s.hasChanged??_)(a,t)||s.useDefault&&s.reflect&&a===this._$Ej?.get(e)&&!this.hasAttribute(n._$Eu(e,s))))return;this.C(e,t,s)}!1===this.isUpdatePending&&(this._$ES=this._$EP())}C(e,t,{useDefault:s,reflect:i,wrapped:a},n){s&&!(this._$Ej??=new Map).has(e)&&(this._$Ej.set(e,n??t??this[e]),!0!==a||void 0!==n)||(this._$AL.has(e)||(this.hasUpdated||s||(t=void 0),this._$AL.set(e,t)),!0===i&&this._$Em!==e&&(this._$Eq??=new Set).add(e))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(e){Promise.reject(e)}const e=this.scheduleUpdate();return null!=e&&await e,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??=this.createRenderRoot(),this._$Ep){for(const[e,t]of this._$Ep)this[e]=t;this._$Ep=void 0}const e=this.constructor.elementProperties;if(e.size>0)for(const[t,s]of e){const{wrapped:e}=s,i=this[t];!0!==e||this._$AL.has(t)||void 0===i||this.C(t,void 0,s,i)}}let e=!1;const t=this._$AL;try{e=this.shouldUpdate(t),e?(this.willUpdate(t),this._$EO?.forEach(e=>e.hostUpdate?.()),this.update(t)):this._$EM()}catch(t){throw e=!1,this._$EM(),t}e&&this._$AE(t)}willUpdate(e){}_$AE(e){this._$EO?.forEach(e=>e.hostUpdated?.()),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(e)),this.updated(e)}_$EM(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(e){return!0}update(e){this._$Eq&&=this._$Eq.forEach(e=>this._$ET(e,this[e])),this._$EM()}updated(e){}firstUpdated(e){}};x.elementStyles=[],x.shadowRootOptions={mode:"open"},x[y("elementProperties")]=new Map,x[y("finalized")]=new Map,b?.({ReactiveElement:x}),(m.reactiveElementVersions??=[]).push("2.1.2");const $=globalThis,k=e=>e,E=$.trustedTypes,F=E?E.createPolicy("lit-html",{createHTML:e=>e}):void 0,C="$lit$",S=`lit$${Math.random().toFixed(9).slice(2)}$`,D="?"+S,A=`<${D}>`,M=document,T=()=>M.createComment(""),z=e=>null===e||"object"!=typeof e&&"function"!=typeof e,P=Array.isArray,O="[ \t\n\f\r]",B=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,N=/-->/g,R=/>/g,I=RegExp(`>|${O}(?:([^\\s"'>=/]+)(${O}*=${O}*(?:[^ \t\n\f\r"'\`<>=]|("|')|))|$)`,"g"),L=/'/g,q=/"/g,H=/^(?:script|style|textarea|title)$/i,j=e=>(t,...s)=>({_$litType$:e,strings:t,values:s}),U=j(1),W=j(2),V=Symbol.for("lit-noChange"),Y=Symbol.for("lit-nothing"),K=new WeakMap,G=M.createTreeWalker(M,129);function J(e,t){if(!P(e)||!e.hasOwnProperty("raw"))throw Error("invalid template strings array");return void 0!==F?F.createHTML(t):t}class X{constructor({strings:e,_$litType$:t},s){let i;this.parts=[];let a=0,n=0;const o=e.length-1,r=this.parts,[l,d]=((e,t)=>{const s=e.length-1,i=[];let a,n=2===t?"<svg>":3===t?"<math>":"",o=B;for(let t=0;t<s;t++){const s=e[t];let r,l,d=-1,c=0;for(;c<s.length&&(o.lastIndex=c,l=o.exec(s),null!==l);)c=o.lastIndex,o===B?"!--"===l[1]?o=N:void 0!==l[1]?o=R:void 0!==l[2]?(H.test(l[2])&&(a=RegExp("</"+l[2],"g")),o=I):void 0!==l[3]&&(o=I):o===I?">"===l[0]?(o=a??B,d=-1):void 0===l[1]?d=-2:(d=o.lastIndex-l[2].length,r=l[1],o=void 0===l[3]?I:'"'===l[3]?q:L):o===q||o===L?o=I:o===N||o===R?o=B:(o=I,a=void 0);const h=o===I&&e[t+1].startsWith("/>")?" ":"";n+=o===B?s+A:d>=0?(i.push(r),s.slice(0,d)+C+s.slice(d)+S+h):s+S+(-2===d?t:h)}return[J(e,n+(e[s]||"<?>")+(2===t?"</svg>":3===t?"</math>":"")),i]})(e,t);if(this.el=X.createElement(l,s),G.currentNode=this.el.content,2===t||3===t){const e=this.el.content.firstChild;e.replaceWith(...e.childNodes)}for(;null!==(i=G.nextNode())&&r.length<o;){if(1===i.nodeType){if(i.hasAttributes())for(const e of i.getAttributeNames())if(e.endsWith(C)){const t=d[n++],s=i.getAttribute(e).split(S),o=/([.?@])?(.*)/.exec(t);r.push({type:1,index:a,name:o[2],strings:s,ctor:"."===o[1]?se:"?"===o[1]?ie:"@"===o[1]?ae:te}),i.removeAttribute(e)}else e.startsWith(S)&&(r.push({type:6,index:a}),i.removeAttribute(e));if(H.test(i.tagName)){const e=i.textContent.split(S),t=e.length-1;if(t>0){i.textContent=E?E.emptyScript:"";for(let s=0;s<t;s++)i.append(e[s],T()),G.nextNode(),r.push({type:2,index:++a});i.append(e[t],T())}}}else if(8===i.nodeType)if(i.data===D)r.push({type:2,index:a});else{let e=-1;for(;-1!==(e=i.data.indexOf(S,e+1));)r.push({type:7,index:a}),e+=S.length-1}a++}}static createElement(e,t){const s=M.createElement("template");return s.innerHTML=e,s}}function Q(e,t,s=e,i){if(t===V)return t;let a=void 0!==i?s._$Co?.[i]:s._$Cl;const n=z(t)?void 0:t._$litDirective$;return a?.constructor!==n&&(a?._$AO?.(!1),void 0===n?a=void 0:(a=new n(e),a._$AT(e,s,i)),void 0!==i?(s._$Co??=[])[i]=a:s._$Cl=a),void 0!==a&&(t=Q(e,a._$AS(e,t.values),a,i)),t}let Z=class{constructor(e,t){this._$AV=[],this._$AN=void 0,this._$AD=e,this._$AM=t}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(e){const{el:{content:t},parts:s}=this._$AD,i=(e?.creationScope??M).importNode(t,!0);G.currentNode=i;let a=G.nextNode(),n=0,o=0,r=s[0];for(;void 0!==r;){if(n===r.index){let t;2===r.type?t=new ee(a,a.nextSibling,this,e):1===r.type?t=new r.ctor(a,r.name,r.strings,this,e):6===r.type&&(t=new ne(a,this,e)),this._$AV.push(t),r=s[++o]}n!==r?.index&&(a=G.nextNode(),n++)}return G.currentNode=M,i}p(e){let t=0;for(const s of this._$AV)void 0!==s&&(void 0!==s.strings?(s._$AI(e,s,t),t+=s.strings.length-2):s._$AI(e[t])),t++}};class ee{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(e,t,s,i){this.type=2,this._$AH=Y,this._$AN=void 0,this._$AA=e,this._$AB=t,this._$AM=s,this.options=i,this._$Cv=i?.isConnected??!0}get parentNode(){let e=this._$AA.parentNode;const t=this._$AM;return void 0!==t&&11===e?.nodeType&&(e=t.parentNode),e}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(e,t=this){e=Q(this,e,t),z(e)?e===Y||null==e||""===e?(this._$AH!==Y&&this._$AR(),this._$AH=Y):e!==this._$AH&&e!==V&&this._(e):void 0!==e._$litType$?this.$(e):void 0!==e.nodeType?this.T(e):(e=>P(e)||"function"==typeof e?.[Symbol.iterator])(e)?this.k(e):this._(e)}O(e){return this._$AA.parentNode.insertBefore(e,this._$AB)}T(e){this._$AH!==e&&(this._$AR(),this._$AH=this.O(e))}_(e){this._$AH!==Y&&z(this._$AH)?this._$AA.nextSibling.data=e:this.T(M.createTextNode(e)),this._$AH=e}$(e){const{values:t,_$litType$:s}=e,i="number"==typeof s?this._$AC(e):(void 0===s.el&&(s.el=X.createElement(J(s.h,s.h[0]),this.options)),s);if(this._$AH?._$AD===i)this._$AH.p(t);else{const e=new Z(i,this),s=e.u(this.options);e.p(t),this.T(s),this._$AH=e}}_$AC(e){let t=K.get(e.strings);return void 0===t&&K.set(e.strings,t=new X(e)),t}k(e){P(this._$AH)||(this._$AH=[],this._$AR());const t=this._$AH;let s,i=0;for(const a of e)i===t.length?t.push(s=new ee(this.O(T()),this.O(T()),this,this.options)):s=t[i],s._$AI(a),i++;i<t.length&&(this._$AR(s&&s._$AB.nextSibling,i),t.length=i)}_$AR(e=this._$AA.nextSibling,t){for(this._$AP?.(!1,!0,t);e!==this._$AB;){const t=k(e).nextSibling;k(e).remove(),e=t}}setConnected(e){void 0===this._$AM&&(this._$Cv=e,this._$AP?.(e))}}class te{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(e,t,s,i,a){this.type=1,this._$AH=Y,this._$AN=void 0,this.element=e,this.name=t,this._$AM=i,this.options=a,s.length>2||""!==s[0]||""!==s[1]?(this._$AH=Array(s.length-1).fill(new String),this.strings=s):this._$AH=Y}_$AI(e,t=this,s,i){const a=this.strings;let n=!1;if(void 0===a)e=Q(this,e,t,0),n=!z(e)||e!==this._$AH&&e!==V,n&&(this._$AH=e);else{const i=e;let o,r;for(e=a[0],o=0;o<a.length-1;o++)r=Q(this,i[s+o],t,o),r===V&&(r=this._$AH[o]),n||=!z(r)||r!==this._$AH[o],r===Y?e=Y:e!==Y&&(e+=(r??"")+a[o+1]),this._$AH[o]=r}n&&!i&&this.j(e)}j(e){e===Y?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,e??"")}}class se extends te{constructor(){super(...arguments),this.type=3}j(e){this.element[this.name]=e===Y?void 0:e}}class ie extends te{constructor(){super(...arguments),this.type=4}j(e){this.element.toggleAttribute(this.name,!!e&&e!==Y)}}class ae extends te{constructor(e,t,s,i,a){super(e,t,s,i,a),this.type=5}_$AI(e,t=this){if((e=Q(this,e,t,0)??Y)===V)return;const s=this._$AH,i=e===Y&&s!==Y||e.capture!==s.capture||e.once!==s.once||e.passive!==s.passive,a=e!==Y&&(s===Y||i);i&&this.element.removeEventListener(this.name,this,s),a&&this.element.addEventListener(this.name,this,e),this._$AH=e}handleEvent(e){"function"==typeof this._$AH?this._$AH.call(this.options?.host??this.element,e):this._$AH.handleEvent(e)}}class ne{constructor(e,t,s){this.element=e,this.type=6,this._$AN=void 0,this._$AM=t,this.options=s}get _$AU(){return this._$AM._$AU}_$AI(e){Q(this,e)}}const oe={I:ee},re=$.litHtmlPolyfillSupport;re?.(X,ee),($.litHtmlVersions??=[]).push("3.3.2");const le=globalThis;let de=class extends x{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){const e=super.createRenderRoot();return this.renderOptions.renderBefore??=e.firstChild,e}update(e){const t=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(e),this._$Do=((e,t,s)=>{const i=s?.renderBefore??t;let a=i._$litPart$;if(void 0===a){const e=s?.renderBefore??null;i._$litPart$=a=new ee(t.insertBefore(T(),e),e,void 0,s??{})}return a._$AI(e),a})(t,this.renderRoot,this.renderOptions)}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(!0)}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(!1)}render(){return V}};de._$litElement$=!0,de.finalized=!0,le.litElementHydrateSupport?.({LitElement:de});const ce=le.litElementPolyfillSupport;ce?.({LitElement:de}),(le.litElementVersions??=[]).push("4.2.2");const he={attribute:!0,type:String,converter:f,reflect:!1,hasChanged:_},pe=(e=he,t,s)=>{const{kind:i,metadata:a}=s;let n=globalThis.litPropertyMetadata.get(a);if(void 0===n&&globalThis.litPropertyMetadata.set(a,n=new Map),"setter"===i&&((e=Object.create(e)).wrapped=!0),n.set(s.name,e),"accessor"===i){const{name:i}=s;return{set(s){const a=t.get.call(this);t.set.call(this,s),this.requestUpdate(i,a,e,!0,s)},init(t){return void 0!==t&&this.C(i,void 0,e,t),t}}}if("setter"===i){const{name:i}=s;return function(s){const a=this[i];t.call(this,s),this.requestUpdate(i,a,e,!0,s)}}throw Error("Unsupported decorator location: "+i)};function ue(e){return(t,s)=>"object"==typeof s?pe(e,t,s):((e,t,s)=>{const i=t.hasOwnProperty(s);return t.constructor.createProperty(s,e),i?Object.getOwnPropertyDescriptor(t,s):void 0})(e,t,s)}function me(e){return ue({...e,state:!0,attribute:!1})}function ve(e,t){return(t,s,i)=>((e,t,s)=>(s.configurable=!0,s.enumerable=!0,Reflect.decorate&&"object"!=typeof t&&Object.defineProperty(e,t,s),s))(t,s,{get(){return(t=>t.renderRoot?.querySelector(e)??null)(this)}})}function ge(e,t){return be(()=>ye(e,t))}function be(e){return"undefined"==typeof document||null===document.querySelector("home-assistant")||customElements.get("home-assistant")?e():(customElements.whenDefined("home-assistant").then(e),!1)}function ye(e,t){return!customElements.get(e)&&(customElements.define(e,t),!0)}const fe=/^\d{4}-\d{2}-\d{2}$/;function _e(e){return fe.test(e)}function we(e){if(_e(e)){const[t,s,i]=e.split("-").map(Number);return new Date(t,s-1,i)}return new Date(e)}function xe(e,t="12h"){const s=we(e);return"24h"===t?s.toLocaleTimeString("en-US",{hour:"2-digit",minute:"2-digit",hour12:!1}):s.toLocaleTimeString("en-US",{hour:"numeric",minute:"2-digit",hour12:!0})}function $e(e){const t=new Date;return e.getFullYear()===t.getFullYear()&&e.getMonth()===t.getMonth()&&e.getDate()===t.getDate()}function ke(e,t="sunday"){const s=new Date(e),i=s.getDay(),a="monday"===t?0===i?-6:1-i:-i;return s.setDate(s.getDate()+a),s.setHours(0,0,0,0),s}function Ee(e){return`${e.getFullYear()}-${String(e.getMonth()+1).padStart(2,"0")}-${String(e.getDate()).padStart(2,"0")}`}function Fe(e,t){const s=Date.UTC(e.getFullYear(),e.getMonth(),e.getDate()),i=Date.UTC(t.getFullYear(),t.getMonth(),t.getDate());return Math.round((i-s)/864e5)}function Ce(e,t){const s=e=>e.toLocaleDateString("en-US",{month:"long"});return e.getMonth()===t.getMonth()?`${s(e)} ${e.getDate()} – ${t.getDate()}`:`${s(e)} ${e.getDate()} – ${s(t)} ${t.getDate()}`}function Se(e){return`${e.summary}|${De(e.start)}|${De(e.end)}`}function De(e){if(_e(e))return e;const t=Date.parse(e);return Number.isNaN(t)?e:String(t)}function Ae(e,t){const s=new Map(t.map(e=>[e.entity_id,e])),i=new Map;for(const t of e){const e=Se(t);if(i.has(e)){const a=i.get(e),n=s.get(t.calendar_entity_id);n&&a.shared_calendars.push({entity_id:n.entity_id,color:n.color,color_light:n.color_light,person_entity:n.person_entity,display_name:n.display_name,uid:t.uid,recurrence_id:t.recurrence_id})}else{const a=s.get(t.calendar_entity_id);i.set(e,{...t,shared_calendars:a?[{entity_id:a.entity_id,color:a.color,color_light:a.color_light,person_entity:a.person_entity,display_name:a.display_name,uid:t.uid,recurrence_id:t.recurrence_id}]:[]})}}return Array.from(i.values())}function Me(e){return we(e.end)<new Date}function Te(e){if(_e(e.start))return!0;const t=we(e.start),s=we(e.end);return 0===t.getHours()&&0===t.getMinutes()&&0===s.getHours()&&0===s.getMinutes()&&Ee(t)!==Ee(s)}function ze(e,t){return new Date(Math.max(we(e.end).getTime()-1,t.getTime()))}function Pe(e,t){const s=Te(e);return s!==Te(t)?s?-1:1:we(e.start).getTime()-we(t.start).getTime()}function Oe(e){const t=new Map;for(const s of e){const e=we(s.start),i=Ee(ze(s,e)),a=new Date(e.getFullYear(),e.getMonth(),e.getDate());for(let e=0;e<1e3;e++){const e=Ee(a);if(t.has(e)||t.set(e,[]),t.get(e).push(s),e===i)break;a.setDate(a.getDate()+1)}}for(const[,e]of t)e.sort(Pe);return t}function Be(e,t,s){return e.filter(e=>{const i=we(e.start),a=we(e.end);return i<s&&a>t})}function Ne(e,t){return e.filter(e=>!t.has(e.calendar_entity_id))}const Re="#FFFFFF",Ie="#1A1B1E";function Le(e){const t=/^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(e.trim());if(!t)return null;const s=3===t[1].length?t[1].split("").map(e=>e+e).join(""):t[1];return[0,2,4].map(e=>parseInt(s.slice(e,e+2),16))}function qe(e,t,s){const i=e=>Math.round(Math.min(255,Math.max(0,e))).toString(16).padStart(2,"0");return`#${i(e)}${i(t)}${i(s)}`.toUpperCase()}function He(e){const t=e/255;return t<=.04045?t/12.92:((t+.055)/1.055)**2.4}function je(e){const t=Le(e);if(!t)return 0;const[s,i,a]=t.map(He);return.2126*s+.7152*i+.0722*a}function Ue(e,t){const s=je(e),i=je(t);return(Math.max(s,i)+.05)/(Math.min(s,i)+.05)}function We(e){return Ue(e,Re)>=Ue(e,Ie)?Re:Ie}function Ve(e){const[t,s,i]=(Le(e)??[0,0,0]).map(He),a=Math.cbrt(.4122214708*t+.5363325363*s+.0514459929*i),n=Math.cbrt(.2119034982*t+.6806995451*s+.1073969566*i),o=Math.cbrt(.0883024619*t+.2817188376*s+.6299787005*i),r=.2104542553*a+.793617785*n-.0040720468*o,l=1.9779984951*a-2.428592205*n+.4505937099*o,d=.0259040371*a+.7827717662*n-.808675766*o,c=Math.hypot(l,d);return{l:r,c:c,h:c<1e-6?0:(180*Math.atan2(d,l)/Math.PI+360)%360}}function Ye({l:e,c:t,h:s}){const i=t*Math.cos(s*Math.PI/180),a=t*Math.sin(s*Math.PI/180),n=(e+.3963377774*i+.2158037573*a)**3,o=(e-.1055613458*i-.0638541728*a)**3,r=(e-.0894841775*i-1.291485548*a)**3;return[4.0767416621*n-3.3077115913*o+.2309699292*r,-1.2684380046*n+2.6097574011*o-.3413193965*r,-.0041960863*n-.7034186147*o+1.707614701*r]}function Ke(e){return e.every(e=>e>=-1e-4&&e<=1.0001)}function Ge(e){const t=Math.min(1,Math.max(0,e.l));let s=Math.max(0,e.c);if(!Ke(Ye({l:t,c:s,h:e.h}))){let i=0,a=s;for(let s=0;s<24;s++){const s=(i+a)/2;Ke(Ye({l:t,c:s,h:e.h}))?i=s:a=s}s=i}const[i,a,n]=Ye({l:t,c:s,h:e.h}).map(e=>function(e){return 255*(e<=.0031308?12.92*e:1.055*e**(1/2.4)-.055)}(Math.min(1,Math.max(0,e))));return qe(i,a,n)}function Je(e){const{l:t,c:s,h:i}=Ve(e);return Ge({l:Math.min(.9,Math.max(t+.07,.69)),c:s,h:i})}function Xe(e){const t=Le(e);return t?`#${t.map(e=>Math.round(e+.65*(255-e)).toString(16).padStart(2,"0")).join("")}`:e}function Qe(e){const{c:t,h:s}=Ve(e);return Ge({l:.255,c:Math.min(t,.037),h:s})}function Ze(e,t){const s=Ve(e);return Ge({...s,l:s.l+t})}function et(e,t,s,i){const a=Le(e);if(!a)return null;if(Ue(e,t)>=s)return qe(...a);const n=Ve(e),o=i?"lighter"===i?1:0:Ve(t).l<.5?1:0,r=e=>Ge({...n,l:n.l+(o-n.l)*e});if(Ue(r(1),t)<s)return null;let l=0,d=1;for(let e=0;e<24;e++){const e=(l+d)/2;Ue(r(e),t)>=s?d=e:l=e}return r(d)}async function tt(e,t){const s={summary:t.summary};t.start_date_time&&(s.start_date_time=t.start_date_time),t.end_date_time&&(s.end_date_time=t.end_date_time),t.start_date&&(s.start_date=t.start_date),t.end_date&&(s.end_date=t.end_date),t.description&&(s.description=t.description),t.location&&(s.location=t.location),await e.callService("calendar","create_event",s,{entity_id:t.entity_id})}async function st(e,t){const s={entity_id:t.entity_id,summary:t.summary};t.start_date_time&&(s.start_date_time=t.start_date_time),t.end_date_time&&(s.end_date_time=t.end_date_time),t.start_date&&(s.start_date=t.start_date),t.end_date&&(s.end_date=t.end_date),t.description&&(s.description=t.description),t.location&&(s.location=t.location),t.attendee_entity_ids?.length&&(s.attendee_entity_ids=t.attendee_entity_ids),await e.callService("planavista","create_event_with_attendees",s)}async function it(e,t){const s={entity_id:t.entity_id,uid:t.uid};t.recurrence_id&&(s.recurrence_id=t.recurrence_id),await e.callService("planavista","delete_event",s)}async function at(e,t="sensor.planavista_config"){await e.callService("homeassistant","update_entity",{entity_id:t})}async function nt(e,t,s){try{const i=await e.callWS({type:"planavista/get_event_organizer",entity_id:t,uid:s});return i?.organizer_entity_id??null}catch{return null}}function ot(e,t){if(!t)return null;const s=e.states[t];return s?.attributes?.entity_picture||null}function rt(e,t){if(!t)return"";const s=e.states[t];return s?.attributes?.friendly_name||t.replace("person.","")}const lt=o`
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
`,dt=o`
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
    color: var(--pv-text-muted);
  }
`,ct=o`
  .pv-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    padding: 0.625rem 1.25rem;
    border: none;
    border-radius: var(--pv-radius, 12px);
    font-family: inherit;
    font-size: 0.9375rem;
    font-weight: 600;
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

  .pv-btn-primary:hover:not(:disabled) {
    opacity: 0.9;
    transform: translateY(-1px);
    box-shadow: var(--pv-shadow);
  }

  .pv-btn-primary:active:not(:disabled) {
    transform: translateY(0);
  }

  .pv-btn-secondary {
    background: transparent;
    color: var(--pv-text);
    border: 1px solid var(--pv-border);
  }

  .pv-btn-secondary:hover:not(:disabled) {
    background: var(--pv-event-hover);
  }

  .pv-btn-ghost {
    background: transparent;
    color: var(--pv-text-secondary);
    padding: 0.5rem;
  }

  .pv-btn-ghost:hover:not(:disabled) {
    background: var(--pv-event-hover);
    color: var(--pv-text);
  }

  /* A disabled button looks it: faded, no lift, nothing under the pointer (milestone 8). */
  .pv-btn:disabled,
  .pv-btn[aria-disabled='true'] {
    opacity: 0.45;
    cursor: default;
    transform: none;
    box-shadow: none;
  }

  /* Destructive: a filled button in a confirmation, red text on a secondary button in place. */
  .pv-btn-danger {
    background: var(--pv-danger, #C62828);
    color: #FFFFFF;
  }

  .pv-btn.danger {
    color: var(--pv-danger-ink, #A12828);
  }

  /* An answer that moves things on, in a list where nothing is filled (one primary per screen). */
  .pv-btn.accent {
    color: var(--pv-accent-ink, #5B5BD6);
  }

  .pv-btn.apart {
    margin-top: 12px;
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
`,ht=o`
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
`,pt=o`
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
    margin-bottom: 0.375rem;
    font-size: 0.8125rem;
    font-weight: 750;
    color: var(--pv-text-secondary, #5F6670);
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
    flex-shrink: 0;
    border: none;
    padding: 0;
    /* Off reads at about 3:1 on the card, like a control should (spec 11.8). */
    background: var(--pv-text-muted, #8E949C);
    border-radius: var(--pv-radius, 12px);
    cursor: pointer;
    transition: background var(--pv-transition, 200ms ease);
  }

  .pv-toggle.active,
  .pv-toggle[aria-checked='true'] {
    background: var(--pv-accent);
  }

  /* The switch is drawn 44 by 24; its target reaches 48 by 48. */
  .pv-toggle::before {
    content: '';
    position: absolute;
    inset: -12px -2px;
  }

  .pv-toggle:focus-visible {
    outline: 2px solid var(--pv-accent-ink, #5B5BD6);
    outline-offset: 2px;
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

  .pv-toggle.active::after,
  .pv-toggle[aria-checked='true']::after {
    transform: translateX(20px);
  }
`,ut=o`
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
`,mt=o`
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
`;const vt=o`
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
    flex-shrink: 0;
    min-height: 48px;
    white-space: nowrap;
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
`;class gt extends de{constructor(){super(...arguments),this.calendars=[],this.timeFormat="12h",this.compact=!1,this.showStripes=!0,this.tick=0,this.badge=null}render(){const e=this.event;if(!e)return Y;const t=e.shared_calendars||[],s=t.length>1,i=function(e,t){if(e.organizer){const t=e.shared_calendars.find(t=>t.display_name?.toLowerCase()===e.organizer?.toLowerCase()||t.entity_id===e.organizer);if(t)return t}for(const s of t){const t=e.shared_calendars.find(e=>e.entity_id===s.entity_id);if(t)return t}return e.shared_calendars[0]}(e,this.calendars),a=i?.color||e.calendar_color||"var(--pv-accent)";let n;n=this.showStripes&&s?`background: ${function(e){const t=e.length;if(t<=1)return"";const s=2===t?60:Math.min(50,Math.round(100/t*1.5)),i=(100-s)/(t-1),a=[];let n=0;return e.forEach((e,t)=>{const o=e.color_light||e.color,r=0===t?s:i;a.push(`${o} ${n}%`),n+=r,a.push(`${o} ${n}%`)}),`linear-gradient(135deg, ${a.join(", ")})`}(t)}`:this.showStripes?`background: ${t[0]?.color_light||e.calendar_color_light||e.calendar_color}`:"background: var(--pv-card-bg, #FFFFFF)";const o=this.showStripes?t[0]?.color_light||e.calendar_color_light||e.calendar_color:"#FFFFFF",r=this.showStripes?We(o):"var(--pv-text)",l=Me(e)?" past":"",d=(this.compact?"chip chip--compact":"chip")+l,c=Te(e);return U`
      <div
        class="${d}"
        style="${n}; --chip-border-color: ${a}; --chip-text: ${r}"
        role="button"
        tabindex="0"
        @click=${this._onClick}
        @keydown=${this._onKey}
      >
        <div class="chip-body">
          <div class="${"chip-title chip-title--nowrap"}">${e.summary}</div>
          ${this.compact?Y:U`
            <div class="chip-time">
              <span class="time-text">${c?"All day":`${xe(e.start,this.timeFormat)} – ${xe(e.end,this.timeFormat)}`}</span>
              ${this.badge?U`<span class="badge ${this.badge.tone}">${this.badge.words}</span>`:Y}
            </div>
          `}
        </div>
        ${!this.compact&&t.length>0?this._renderAvatars(t):Y}
      </div>
    `}_renderAvatars(e){const t=e.slice(0,4),s=e.length-4;return U`
      <div class="chip-avatars">
        ${t.map(e=>{const t=e.person_entity?ot(this.hass,e.person_entity):null,s=e.person_entity?rt(this.hass,e.person_entity):e.display_name||"?";return t?U`<img class="chip-avatar" src="${t}" alt="${s}" />`:U`<div class="chip-initial" style="background: ${e.color}; color: ${We(e.color)}">${s[0]?.toUpperCase()||"?"}</div>`})}
        ${s>0?U`<div class="chip-overflow">+${s}</div>`:Y}
      </div>
    `}_onKey(e){"Enter"!==e.key&&" "!==e.key||(e.preventDefault(),this._onClick())}_onClick(){this.dispatchEvent(new CustomEvent("event-click",{detail:{event:this.event},bubbles:!0,composed:!0}))}}gt.styles=[lt,vt,o`
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

      .chip:focus-visible {
        outline: 2px solid var(--pv-accent-ink, #5B5BD6);
        outline-offset: 1px;
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
        display: flex;
        align-items: center;
        flex-wrap: wrap;
        gap: 6px;
        font-size: 0.75rem;
        font-weight: 500;
        font-variant-numeric: tabular-nums;
        color: var(--chip-text);
        margin-top: 2px;
      }

      .chip-time .time-text {
        opacity: 0.8;
      }

      .chip-time .badge {
        padding: 1px 6px;
        font-size: 0.75rem;
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
      @container pv-calendar (max-width: 479px) {
        .chip { padding: 0.375rem 0.5rem; }
        .chip-title { font-size: 0.8125rem; }
        .chip-time { font-size: 0.6875rem; }
        .chip-avatar, .chip-initial, .chip-overflow { width: 20px; height: 20px; font-size: 0.5rem; }
      }

      /* Large screens */
      @container pv-calendar (min-width: 1024px) {
        .chip { padding: 0.625rem 0.75rem; }
        .chip-title { font-size: 0.9375rem; }
        .chip-time { font-size: 0.8125rem; }
        .chip-avatar, .chip-initial, .chip-overflow { width: 28px; height: 28px; }
      }

      /* XL screens: ~50% larger for wall displays */
      @container pv-calendar (min-width: 1440px) {
        .chip { padding: 1rem 1.25rem; gap: 0.75rem; border-left-width: 4px; }
        .chip-title { font-size: 1.375rem; }
        .chip-time { font-size: 1.125rem; }
        .chip-avatar, .chip-initial, .chip-overflow { width: 40px; height: 40px; font-size: 0.8125rem; }
        .chip.chip--compact { padding: 0.375rem 0.75rem; border-left-width: 3px; }
        .chip--compact .chip-title { font-size: 1rem; }
      }
    `],e([ue({attribute:!1})],gt.prototype,"hass",void 0),e([ue({attribute:!1})],gt.prototype,"event",void 0),e([ue({attribute:!1})],gt.prototype,"calendars",void 0),e([ue({attribute:!1})],gt.prototype,"timeFormat",void 0),e([ue({type:Boolean})],gt.prototype,"compact",void 0),e([ue({type:Boolean})],gt.prototype,"showStripes",void 0),e([ue({type:Number})],gt.prototype,"tick",void 0),e([ue({attribute:!1})],gt.prototype,"badge",void 0),ge("pv-event-chip",gt);const bt=e=>(...t)=>({_$litDirective$:e,values:t});let yt=class{constructor(e){}get _$AU(){return this._$AM._$AU}_$AT(e,t,s){this._$Ct=e,this._$AM=t,this._$Ci=s}_$AS(e,t){return this.update(e,t)}update(e,t){return this.render(...t)}};const{I:ft}=oe,_t=e=>e,wt=()=>document.createComment(""),xt=(e,t,s)=>{const i=e._$AA.parentNode,a=void 0===t?e._$AB:t._$AA;if(void 0===s){const t=i.insertBefore(wt(),a),n=i.insertBefore(wt(),a);s=new ft(t,n,e,e.options)}else{const t=s._$AB.nextSibling,n=s._$AM,o=n!==e;if(o){let t;s._$AQ?.(e),s._$AM=e,void 0!==s._$AP&&(t=e._$AU)!==n._$AU&&s._$AP(t)}if(t!==a||o){let e=s._$AA;for(;e!==t;){const t=_t(e).nextSibling;_t(i).insertBefore(e,a),e=t}}}return s},$t=(e,t,s=e)=>(e._$AI(t,s),e),kt={},Et=(e,t=kt)=>e._$AH=t,Ft=e=>{e._$AR(),e._$AA.remove()},Ct=bt(class extends yt{constructor(){super(...arguments),this.key=Y}render(e,t){return this.key=e,t}update(e,[t,s]){return t!==this.key&&(Et(e),this.key=t),s}});function St(e,t){return Math.abs(e)<=50||Math.abs(e)<=2*Math.abs(t)?null:e>0?"prev":"next"}function Dt(e){let t,s=null;return(...i)=>(s&&s.length===i.length&&i.every((e,t)=>e===s[t])||(t=e(...i),s=i),t)}const At=/^\d{2}:\d{2}$/;function Mt(e){return String(e).padStart(2,"0")}function Tt(e){return`${Mt(e.getHours())}:${Mt(e.getMinutes())}`}function zt(e){const t=-e.getTimezoneOffset(),s=t>=0?"+":"-",i=Math.abs(t);return`${Ee(e)}T${Mt(e.getHours())}:${Mt(e.getMinutes())}:${Mt(e.getSeconds())}${s}${Mt(Math.floor(i/60))}:${Mt(i%60)}`}function Pt(e,t){const[s,i,a]=e.split("-").map(Number);return Ee(new Date(s,i-1,a+t))}function Ot(e,t){const[s,i,a]=e.split("-").map(Number),[n,o]=t.split(":").map(Number);return new Date(s,i-1,a,n,o,0,0)}function Bt(e){return e.allDay?Pt(e.date,Math.max(1,e.spanDays)-1):Pt(e.date,e.endDayOffset)}function Nt(e){return e.allDay?{start_date:e.date,end_date:Pt(e.date,Math.max(1,Math.round(e.spanDays)))}:{start_date_time:zt(Ot(e.date,e.startTime)),end_date_time:zt(Ot(Pt(e.date,e.endDayOffset),e.endTime))}}function Rt(e,t=e.calendar_entity_id){if(!e.uid)throw new Error("This event can only be changed in its calendar's own app.");const s={entity_id:t,uid:e.uid};return e.recurrence_id&&(s.recurrence_id=e.recurrence_id),s}function It(e,t=e.calendar_entity_id){const s=_e(e.start)?{entity_id:t,summary:e.summary,start_date:e.start,end_date:e.end}:{entity_id:t,summary:e.summary,start_date_time:e.start,end_date_time:e.end};return e.description&&(s.description=e.description),e.location&&(s.location=e.location),s}function Lt(e,t,s){return{deleteData:Rt(e,t),createData:{...s,entity_id:t},restoreData:It(e,t)}}class qt extends Error{constructor(e,t){super(e),this.restored=t,this.name="EditRestoreError"}}function Ht(e){return e instanceof Error?e.message:String(e&&"object"==typeof e&&"message"in e?e.message:e)}async function jt(e){await e.remove();try{await e.create()}catch(t){const s=Ht(t);try{await e.restore()}catch(e){throw console.warn(`[PlanaVista] The edit failed (${s}) and the original couldn't be put back (${Ht(e)})`),new qt("Your changes couldn't be saved, and the event couldn't be put back. Add it again in its calendar's own app.",!1)}throw console.warn(`[PlanaVista] The edit failed (${s}); the original is back`),new qt("Your changes couldn't be saved, so the event is back as it was. Close this, then open the event again to try once more.",!0)}}function Ut(e){return 1===e.length?[e[0]]:[]}class Wt{constructor(){this.hiddenCalendars=new Set,this.currentView="day",this.currentDate=new Date,this.selectedEvent=null,this.dialogOpen=null,this.createPrefill=null,this.isLoading=!1,this._hosts=new Set,this._autoAdvanceTimer=null,this._todayKey=Ee(new Date),this._onVisibilityChange=()=>{"visible"===document.visibilityState&&this.checkRollover()}}subscribe(e){this._hosts.add(e)}unsubscribe(e){this._hosts.delete(e)}_notify(){for(const e of this._hosts)e.requestUpdate()}toggleCalendar(e){const t=new Set(this.hiddenCalendars);t.has(e)?t.delete(e):t.add(e),this.hiddenCalendars=t,this._notify()}showAllCalendars(){0!==this.hiddenCalendars.size&&(this.hiddenCalendars=new Set,this._notify())}setView(e){this.currentView!==e&&(this.currentView=e,this._notify())}navigateDate(e){this.currentDate="today"===e?new Date:function(e,t,s){const i=new Date(e),a="next"===s?1:-1;switch(t){case"day":i.setDate(i.getDate()+a);break;case"week":case"agenda":i.setDate(i.getDate()+7*a);break;case"month":i.setMonth(i.getMonth()+a)}return i}(this.currentDate,this.currentView,e),this._notify()}setDate(e){this.currentDate=new Date(e),this._notify()}selectEvent(e){this.selectedEvent=e,this._notify()}openCreateDialog(e){this.dialogOpen="create",this.createPrefill=e||null,this._notify()}openEditDialog(e,t){this.dialogOpen="edit",this.selectedEvent=e;const s={...e};t?.removeGuests&&(s._removeGuestsHint=!0),this.createPrefill=s,this._notify()}closeDialog(){this.dialogOpen=null,this.createPrefill=null,this._notify()}async doCreateEvent(e,t){this.isLoading=!0,this._notify();try{await tt(e,t),await at(e),this.closeDialog()}catch(e){throw console.error("PlanaVista: Failed to create event",e),e}finally{this.isLoading=!1,this._notify()}}async doDeleteEvent(e,t){this.isLoading=!0,this._notify();try{await it(e,t),await at(e),this.selectedEvent=null,this.closeDialog()}catch(e){throw console.error("PlanaVista: Failed to delete event",e),e}finally{this.isLoading=!1,this._notify()}}async doEditEvent(e,t,s,i){this.isLoading=!0,this._notify();try{await jt({remove:()=>it(e,t),create:()=>tt(e,s),restore:()=>tt(e,i)}),await at(e),this.selectedEvent=null,this.closeDialog()}catch(t){throw console.error("PlanaVista: Failed to edit event",t),await at(e).catch(()=>{}),t}finally{this.isLoading=!1,this._notify()}}checkRollover(e=new Date){const t=function(e,t,s){return Ee(s)===t?null:Ee(e)===t?new Date(s):null}(this.currentDate,this._todayKey,e);this._todayKey=Ee(e),t&&(this.currentDate=t,this._notify())}get autoAdvancing(){return null!==this._autoAdvanceTimer}startAutoAdvance(){this._autoAdvanceTimer||(this.checkRollover(),this._autoAdvanceTimer=setInterval(()=>this.checkRollover(),6e4),"undefined"!=typeof document&&document.addEventListener("visibilitychange",this._onVisibilityChange))}stopAutoAdvance(){this._autoAdvanceTimer&&(clearInterval(this._autoAdvanceTimer),this._autoAdvanceTimer=null),"undefined"!=typeof document&&document.removeEventListener("visibilitychange",this._onVisibilityChange)}}class Vt{constructor(e){this.host=e,this.store=new Wt,e.addController(this)}hostConnected(){this.store.subscribe(this.host),this.store.startAutoAdvance()}hostDisconnected(){this.store.unsubscribe(this.host),this.store.stopAutoAdvance()}}class Yt{constructor(e,t){this.host=e,this.getStore=t,e.addController(this)}hostConnected(){this._sync()}hostUpdate(){this._sync()}hostDisconnected(){this._store?.unsubscribe(this.host),this._store=void 0}_sync(){const e=this.getStore();e!==this._store&&(this._store?.unsubscribe(this.host),e?.subscribe(this.host),this._store=e)}}function Kt(e,t){const s=(e?.calendars||[]).filter(e=>!1!==e.visible),i=t?.calendars;return Array.isArray(i)&&i.length>0?s.filter(e=>i.includes(e.entity_id)):s}function Gt(e,t){const s=[];for(const i of e){const e=t.find(e=>e.entity_id===i)?.member_id??null;s.includes(e)||s.push(e)}return s}const Jt={young_child:"Young child",older_child:"Older child",teen:"Teen",adult:"Adult"},Xt=[{id:"young_child",label:"Young child",hint:"About 4 to 8"},{id:"older_child",label:"Older child",hint:"About 9 to 12"},{id:"teen",label:"Teen",hint:""},{id:"adult",label:"Adult",hint:""}],Qt={young_child:"Pictures and big buttons. Every chore needs an OK.",older_child:"A list with pictures. Chores marked Needs an OK wait for one.",teen:"The full list and a timeline. Chores marked Needs an OK wait for one.",adult:"The full list and a timeline. No OKs needed."},Zt=[{id:"parent",label:"Parent"},{id:"adult",label:"Adult"},{id:"teen",label:"Teen"},{id:"older_child",label:"Older child"},{id:"young_child",label:"Young child"}];function es(e){return e.parent?"parent":e.age_group}function ts(e){return"parent"===e?{age_group:"adult",parent:!0}:{age_group:e,parent:!1}}function ss(e){return[...e].sort((e,t)=>e.order-t.order||e.id.localeCompare(t.id))}function is(e){const t=[...e.trim()][0];return t?t.toLocaleUpperCase():"?"}function as(e){return ss(e).filter(e=>e.parent&&e.has_pin)}function ns(e,t){return e&&e.available?e.account.parent_level?"open":"shared"===e.account.kind||"other"===e.account.kind?as(e.members).length>0?"pin":"no_pin":"none":t?"open":"none"}function os(e,t){return t.filter(t=>t.member_id===e)}function rs(e,t){const s=new Map;for(const i of e)i.id!==t&&s.set(i.color.toUpperCase(),i);return s}function ls(e,t){return"light"===t?e.color:e.color_dark||Je(e.color)}const ds="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, system-ui, sans-serif",cs="ui-rounded, 'SF Pro Rounded', 'PlanaVista Rounded', "+ds,hs={sharp:{radius:"4px",radiusLg:"6px",radiusSm:"2px"},rounded:{radius:"12px",radiusLg:"16px",radiusSm:"8px"},pill:{radius:"20px",radiusLg:"24px",radiusSm:"14px"}},ps={none:{shadow:"none",shadowLg:"none",shadowXl:"none"},subtle:{shadow:"0 1px 3px rgba(0, 0, 0, 0.08), 0 1px 2px rgba(0, 0, 0, 0.04)",shadowLg:"0 10px 25px rgba(0, 0, 0, 0.08), 0 4px 10px rgba(0, 0, 0, 0.04)",shadowXl:"0 20px 40px rgba(0, 0, 0, 0.12)"},bold:{shadow:"0 2px 8px rgba(0, 0, 0, 0.15), 0 1px 3px rgba(0, 0, 0, 0.1)",shadowLg:"0 12px 32px rgba(0, 0, 0, 0.18), 0 6px 14px rgba(0, 0, 0, 0.1)",shadowXl:"0 24px 48px rgba(0, 0, 0, 0.24)"}},us={gradient_purple:{light:"linear-gradient(135deg, #667eea 0%, #764ba2 100%)",dark:"linear-gradient(135deg, #3730A3 0%, #581C87 100%)"},gradient_teal:{light:"linear-gradient(135deg, #0D9488 0%, #2563EB 100%)",dark:"linear-gradient(135deg, #115E59 0%, #1E3A8A 100%)"},gradient_sunset:{light:"linear-gradient(135deg, #F59E0B 0%, #EF4444 100%)",dark:"linear-gradient(135deg, #92400E 0%, #991B1B 100%)"},solid_accent:{light:"",dark:""},solid_dark:{light:"#1A1B1E",dark:"#0B0C0D"}},ms={"color-scheme":"light","--pv-bg":"#F8F8F6","--pv-card-bg":"#FFFFFF","--pv-card-bg-elevated":"#FFFFFF","--pv-text":"#1A1B1E","--pv-text-secondary":"#5F6670","--pv-text-muted":"#8E949C","--pv-border":"#E7E7E3","--pv-border-subtle":"#F1F1EE","--pv-track":"#ECECE8","--pv-chip":"#F1F1EE","--pv-seg":"#ECECE8","--pv-seg-on":"#FFFFFF","--pv-accent":"#5B5BD6","--pv-accent-text":"#FFFFFF","--pv-accent-ink":"#5B5BD6","--pv-accent-tint":"#EEEEFC","--pv-accent-tint-ink":"#3B3BB0","--pv-warn-bg":"#FDF1DC","--pv-warn-ink":"#8A5A00","--pv-bad-bg":"#FBE4E4","--pv-bad-ink":"#A12828","--pv-star":"#8A6A00","--pv-danger":"#C62828","--pv-danger-ink":"#A12828","--pv-toast-bg":"#1F2023","--pv-toast-text":"#F4F4F2","--pv-toast-action":"#A9A9FF","--pv-today-bg":"rgba(91, 91, 214, 0.06)","--pv-now-color":"#E5484D","--pv-event-hover":"rgba(0, 0, 0, 0.03)","--pv-shadow":ps.subtle.shadow,"--pv-shadow-lg":ps.subtle.shadowLg,"--pv-shadow-xl":ps.subtle.shadowXl,"--pv-radius":"12px","--pv-radius-lg":"16px","--pv-radius-sm":"8px","--pv-transition":"200ms cubic-bezier(0.4, 0, 0.2, 1)","--pv-font-family":ds,"--pv-font-heading":cs,"--pv-header-gradient":"#FFFFFF","--pv-header-text":"#1A1B1E","--pv-header-muted":"#5F6670","--pv-backdrop":"rgba(0, 0, 0, 0.3)"},vs={...ms,"color-scheme":"dark","--pv-bg":"#111214","--pv-card-bg":"#1B1C1F","--pv-card-bg-elevated":"#25272B","--pv-text":"#E9E9E6","--pv-text-secondary":"#A3A7AE","--pv-text-muted":"#6F747C","--pv-border":"#2B2D31","--pv-border-subtle":"#232528","--pv-track":"#2C2E32","--pv-chip":"#25272B","--pv-seg":"#25272B","--pv-seg-on":"#3A3C42","--pv-accent":"#6262DE","--pv-accent-text":"#FFFFFF","--pv-accent-ink":"#8E8EF2","--pv-accent-tint":"#25254A","--pv-accent-tint-ink":"#C5C5FF","--pv-warn-bg":"#382A0F","--pv-warn-ink":"#F0C066","--pv-bad-bg":"#3B1C1F","--pv-bad-ink":"#F3A5A5","--pv-star":"#EFC75E","--pv-danger":"#B93838","--pv-danger-ink":"#F3A5A5","--pv-toast-bg":"#E9E9E6","--pv-toast-text":"#1A1B1E","--pv-toast-action":"#3B3BB0","--pv-today-bg":"rgba(142, 142, 242, 0.08)","--pv-now-color":"#FE6062","--pv-event-hover":"rgba(255, 255, 255, 0.04)","--pv-shadow":"none","--pv-shadow-lg":"none","--pv-shadow-xl":"none","--pv-header-gradient":"#1B1C1F","--pv-header-text":"#E9E9E6","--pv-header-muted":"#A3A7AE","--pv-backdrop":"rgba(0, 0, 0, 0.6)"},gs={planavista:{light:ms,dark:vs},minimal:{light:{...ms,"--pv-bg":"#FFFFFF","--pv-border":"#ECEEF1","--pv-border-subtle":"#F5F6F8","--pv-track":"#F1F2F4","--pv-chip":"#F3F4F6","--pv-seg":"#F1F2F4","--pv-accent":"#111827","--pv-accent-ink":"#111827","--pv-accent-tint":"#F3F4F6","--pv-accent-tint-ink":"#111827","--pv-today-bg":"rgba(17, 24, 39, 0.03)","--pv-shadow":"0 0 0 1px rgba(0, 0, 0, 0.05)","--pv-shadow-lg":"0 4px 12px rgba(0, 0, 0, 0.05)","--pv-shadow-xl":"0 8px 24px rgba(0, 0, 0, 0.08)","--pv-radius":"8px","--pv-radius-lg":"12px","--pv-radius-sm":"6px","--pv-transition":"150ms ease"},dark:{...vs,"--pv-bg":"#000000","--pv-card-bg":"#0E0E10","--pv-card-bg-elevated":"#18181B","--pv-text":"#EDEDED","--pv-text-secondary":"#A1A1AA","--pv-text-muted":"#71717A","--pv-border":"#1F2023","--pv-border-subtle":"#161618","--pv-track":"#1F2023","--pv-chip":"#18181B","--pv-seg":"#18181B","--pv-seg-on":"#2A2A2E","--pv-accent":"#EDEDED","--pv-accent-text":"#111214","--pv-accent-ink":"#EDEDED","--pv-accent-tint":"#1F1F23","--pv-accent-tint-ink":"#EDEDED","--pv-today-bg":"rgba(237, 237, 237, 0.05)","--pv-radius":"8px","--pv-radius-lg":"12px","--pv-radius-sm":"6px","--pv-transition":"150ms ease","--pv-header-gradient":"#0E0E10","--pv-header-text":"#EDEDED","--pv-header-muted":"#A1A1AA"}},vibrant:{light:{...ms,"--pv-bg":"#FAF8FF","--pv-border":"#ECE6FB","--pv-border-subtle":"#F4F0FD","--pv-accent":"#7C3AED","--pv-accent-ink":"#7C3AED","--pv-accent-tint":"#F1EAFE","--pv-accent-tint-ink":"#5B21B6","--pv-today-bg":"rgba(124, 58, 237, 0.06)","--pv-now-color":"#F43F5E","--pv-shadow":"0 1px 3px rgba(124, 58, 237, 0.1), 0 1px 2px rgba(0, 0, 0, 0.04)","--pv-shadow-lg":"0 10px 25px rgba(124, 58, 237, 0.15), 0 4px 10px rgba(0, 0, 0, 0.04)","--pv-shadow-xl":"0 20px 40px rgba(124, 58, 237, 0.2)","--pv-radius":"14px","--pv-radius-lg":"20px","--pv-radius-sm":"10px","--pv-transition":"250ms cubic-bezier(0.34, 1.56, 0.64, 1)","--pv-header-gradient":"linear-gradient(135deg, #7C3AED 0%, #EC4899 100%)","--pv-header-text":"#FFFFFF","--pv-header-muted":"rgba(255, 255, 255, 0.85)","--pv-backdrop":"rgba(124, 58, 237, 0.2)"},dark:{...vs,"--pv-bg":"#150E22","--pv-card-bg":"#20172F","--pv-card-bg-elevated":"#2A1F3D","--pv-border":"#2E2442","--pv-border-subtle":"#251B36","--pv-track":"#2E2442","--pv-chip":"#2A1F3D","--pv-seg":"#2A1F3D","--pv-seg-on":"#3A2D52","--pv-accent":"#7C4DEB","--pv-accent-ink":"#B79BFA","--pv-accent-tint":"#2E2050","--pv-accent-tint-ink":"#D9C9FF","--pv-today-bg":"rgba(183, 155, 250, 0.08)","--pv-radius":"14px","--pv-radius-lg":"20px","--pv-radius-sm":"10px","--pv-transition":"250ms cubic-bezier(0.34, 1.56, 0.64, 1)","--pv-header-gradient":"linear-gradient(135deg, #4C1D95 0%, #831843 100%)","--pv-header-text":"#FFFFFF","--pv-header-muted":"rgba(255, 255, 255, 0.85)"}}};function bs(e,t){const[s,i,a]=Le(e)??[0,0,0];return`rgba(${s}, ${i}, ${a}, ${t})`}function ys(e){const{c:t,h:s}=Ve(e);return Ge({l:.955,c:Math.min(t,.02),h:s})}function fs(e,t){const{c:s,h:i}=Ve(e);return Ge("light"===t?{l:.43,c:s,h:i}:{l:.84,c:Math.min(s,.09),h:i})}function _s(e,t,s,i,a){const n=et(s,e,4.5,a)??t;return{"--pv-text-secondary":n,"--pv-text-muted":et(i,e,3,a)??n}}function ws(e,t,s){if("plain"===e)return{"--pv-header-gradient":t["--pv-card-bg"],"--pv-header-text":t["--pv-text"],"--pv-header-muted":t["--pv-text-secondary"]};const i=us[e],a="solid_accent"===e?t["--pv-accent"]:i?i[s]:e,n=i&&"solid_accent"!==e?"#FFFFFF":We(a);return{"--pv-header-gradient":a,"--pv-header-text":n,"--pv-header-muted":"#FFFFFF"===n?"rgba(255, 255, 255, 0.85)":"rgba(26, 27, 30, 0.7)"}}function xs(e,t){const s={...(gs[e.pair]??gs.planavista)[t]},i="light"===t?e.light:e.dark,a=e.light,n=i.background??("dark"===t&&a.background?function(e){const{c:t,h:s}=Ve(e);return Ge({l:.19,c:Math.min(t,.02),h:s})}(a.background):void 0);n&&Le(n)&&Object.assign(s,function(e){if(Ve(e).l>=.6){const t=Ve(e).l>=.9?"#FFFFFF":Ze(e,.04);return{"color-scheme":"light","--pv-bg":e,"--pv-card-bg":t,"--pv-card-bg-elevated":t,"--pv-text":"#1A1B1E",..._s(t,"#1A1B1E","#5F6670","#8E949C","darker"),"--pv-border":Ze(e,-.07),"--pv-border-subtle":Ze(e,-.035),"--pv-track":Ze(e,-.06),"--pv-chip":Ze(e,-.04),"--pv-seg":Ze(e,-.06),"--pv-seg-on":t,"--pv-event-hover":"rgba(0, 0, 0, 0.03)","--pv-backdrop":"rgba(0, 0, 0, 0.3)"}}const t=Ze(e,.045);return{"color-scheme":"dark","--pv-bg":e,"--pv-card-bg":t,"--pv-card-bg-elevated":Ze(e,.075),"--pv-text":"#E9E9E6",..._s(t,"#E9E9E6","#A3A7AE","#6F747C","lighter"),"--pv-border":Ze(e,.115),"--pv-border-subtle":Ze(e,.07),"--pv-track":Ze(e,.12),"--pv-chip":Ze(e,.075),"--pv-seg":Ze(e,.075),"--pv-seg-on":Ze(e,.16),"--pv-event-hover":"rgba(255, 255, 255, 0.04)","--pv-backdrop":"rgba(0, 0, 0, 0.6)"}}(n));const o=i.accent??("dark"===t&&a.accent?Je(a.accent):void 0);o&&Le(o)&&Object.assign(s,function(e,t,s){return{"--pv-accent":e,"--pv-accent-text":We(e),"--pv-accent-ink":et(e,t,4.5)??We(t),"--pv-accent-tint":"light"===s?ys(e):Qe(e),"--pv-accent-tint-ink":fs(e,s),"--pv-today-bg":bs(e,"light"===s?.06:.1)}}(o,s["--pv-card-bg"],t));const r=i.header??("dark"===t&&a.header?a.header.startsWith("#")?function(e){const{l:t,c:s,h:i}=Ve(e);return Ge({l:Math.min(t,.4),c:.8*s,h:i})}(a.header):a.header:void 0);r?Object.assign(s,ws(r,s,t)):n&&s["--pv-header-gradient"]===gs[e.pair]?.[t]["--pv-card-bg"]&&Object.assign(s,ws("plain",s,t));const l=i.now_color??("dark"===t&&a.now_color?Je(a.now_color):void 0);l&&Le(l)&&(s["--pv-now-color"]=l);const d=hs[e.shape.corner_style??""];d&&(s["--pv-radius"]=d.radius,s["--pv-radius-lg"]=d.radiusLg,s["--pv-radius-sm"]=d.radiusSm);const c=ps[e.shape.shadow_depth??""];c&&(s["--pv-shadow"]=c.shadow,s["--pv-shadow-lg"]=c.shadowLg,s["--pv-shadow-xl"]=c.shadowXl);const h=e.shape.avatar_border;return"white"===h||"light"===h?s["--pv-avatar-border"]="#FFFFFF":h&&Le(h)&&(s["--pv-avatar-border"]=h),s}function $s(e,t,s){return"light"!==s&&Le(e)?{color:Je(e),colorLight:Qe(e)}:{color:e,colorLight:t||e}}const ks=new WeakMap;function Es(e,t,s=[]){if(!e)return e;const i=new Map(s.map(e=>[e.id,e])),a=(e.calendars||[]).some(e=>e.member_id&&i.has(e.member_id));if("light"===t&&!a)return e;const n=new Map,o=(e,s)=>{const i=`${e}|${s??""}`;let a=n.get(i);return a||(a=$s(e,s,t),n.set(i,a)),a},r=new Map;for(const s of e.calendars||[]){const e=s.member_id?i.get(s.member_id):void 0;e&&r.set(s.entity_id,"light"===t?{color:e.color,colorLight:Xe(e.color)}:{color:ls(e,"dark"),colorLight:Qe(e.color)})}return{...e,calendars:(e.calendars||[]).map(e=>{const{color:t,colorLight:s}=r.get(e.entity_id)??o(e.color,e.color_light);return{...e,color:t,color_light:s}}),events:(e.events||[]).map(e=>{const{color:t,colorLight:s}=r.get(e.calendar_entity_id)??o(e.calendar_color,e.calendar_color_light);return{...e,calendar_color:t,calendar_color_light:s}})}}const Fs=Object.freeze({value:null,leaving:!1});function Cs(e,t){return null!==t?e.value!==t||e.leaving?{value:t,leaving:!1}:e:null===e.value||e.leaving?e:{value:e.value,leaving:!0}}function Ss(e=document){let t=e.activeElement;for(;t?.shadowRoot?.activeElement;)t=t.shadowRoot.activeElement;return t&&"function"==typeof t.focus?t:null}function Ds(e,t){if("Tab"!==t.key)return;const s=[...e.querySelectorAll('button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])')],i=function(e,t,s){return 0===t?-1:e<0?s?t-1:0:s?(e-1+t)%t:(e+1)%t}(s.indexOf(e.activeElement),s.length,t.shiftKey);i>=0&&(t.preventDefault(),s[i].focus())}function As(e){return"shared"===e.account.kind||"other"===e.account.kind}function Ms(e,t,s){if(!e||!e.available)return"no";const i=e.account;if(i.parent_level)return"yes";if("member"===i.kind)return i.member_id===s?"yes":"no";if(!As(e))return"no";if(t&&(t.parent||t.memberId===s))return"yes";const a=e.members.find(e=>e.id===s);return a?a.has_pin?"pin":"yes":"no"}function Ts(e,t){return e&&e.available?e.account.parent_level?"yes":As(e)?t?.parent?"yes":as(e.members).length>0?"pin":"no_pin":"no":"no"}function zs(e,t){if(!e)return[];const s=e.members.find(e=>e.id===t),i=as(e.members).filter(e=>e.id!==t);return s?.has_pin?[s,...i]:i}function Ps(e,t,s){if(!e||!e.available)return"yes";const[i]=s;if(1===s.length&&i)return Ms(e,t,i);const a=Ts(e,t);return"no_pin"===a?"yes":a}const Os=["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"],Bs=["January","February","March","April","May","June","July","August","September","October","November","December"];function Ns(e,t){const s=`${Os[e.getDay()]}, ${Bs[e.getMonth()]} ${e.getDate()}`;return e.getFullYear()===t.getFullYear()?s:`${s}, ${e.getFullYear()}`}function Rs(e){return`${Os[e.getDay()].slice(0,3)}, ${Bs[e.getMonth()].slice(0,3)} ${e.getDate()}`}function Is(e){const t=we(e.start),s=we(e.end),i=new Date(s.getFullYear(),s.getMonth(),s.getDate()-1);return i<t?t:i}function Ls(e,t){return Ee(new Date(Math.max(t.getTime()-1,e.getTime())))!==Ee(e)}function qs(e,t){if(Te(e))return Hs(e,t);const s=we(e.start),i=we(e.end);if(t>=s&&t<i)return{words:"Now",tone:"neutral"};const a=(s.getTime()-t.getTime())/6e4;return a>0&&a<=15?{words:`In ${Math.ceil(a)} min`,tone:"time"}:null}function Hs(e,t){if(!Te(e))return null;const s=we(e.start),i=Is(e),a=Math.round((i.getTime()-s.getTime())/864e5)+1;if(a<2)return null;const n=new Date(t.getFullYear(),t.getMonth(),t.getDate()),o=Math.round((n.getTime()-new Date(s.getFullYear(),s.getMonth(),s.getDate()).getTime())/864e5)+1;return o>=1&&o<=a?{words:`Day ${o} of ${a}`,tone:"neutral"}:null}function js(e){return e.length<=1?e[0]??"":2===e.length?`${e[0]} and ${e[1]}`:`${e.slice(0,-1).join(", ")}, and ${e[e.length-1]}`}function Us(e){return e.summary?.trim()||"this event"}function Ws(e,t,s){const i=Us(e);if(!s||0===t.length)return`Couldn't delete ${i}. Check that Home Assistant is reachable, then try again.`;return`Couldn't delete ${i} from ${1===t.length?`${t[0]}'s calendar`:`${js(t.map(e=>`${e}'s`))} calendars`}. Try again in a moment.`}function Vs(e){if(!e)return{create:!0,delete:!0,edit:!0};const t="number"==typeof e.supported_features?e.supported_features:0;return{create:!!(1&t),delete:!!(2&t),edit:!!(4&t)||!!(1&t)&&!!(2&t)}}function Ys(e){const t=e.shared_calendars??[];return t.length?t.map(e=>e.entity_id):[e.calendar_entity_id]}const Ks="pv-push-page",Gs="pv-pop-page",Js="pv-page-error",Xs="pv-page-editor";function Qs(e,t){e.dispatchEvent(new CustomEvent(Xs,{detail:t,bubbles:!0,composed:!0}))}const Zs="pv-page-open",ei="pv-open-settings";function ti(e){switch(e){case"parent_mode_required":return"Parent mode ended. Enter a parent's PIN to keep changing settings.";case"not_allowed":return"Only a parent can change this.";case"unavailable":return"Update PlanaVista to change people and PINs.";default:return"Couldn't save. Check the connection and try again."}}function si(e){const t=e.display_name||e.entity_id;return e.member_id||e.person_entity?`${t}'s calendar`:`the ${t} calendar`}function ii(e){return e.charAt(0).toUpperCase()+e.slice(1)}const ai=[[[8,9],[34,6],[62,12]],[[18,12],[52,8]],[[4,6],[28,14],[70,8]]],ni=[2,1,0,3,1,2,0],oi=o`
  .skeleton {
    box-sizing: border-box;
    height: 100%;
    padding: 12px 16px;
    overflow: hidden;
  }

  .skeleton-week {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    grid-auto-rows: min-content;
    gap: 12px;
  }

  :host([layout='portrait']) .skeleton-week {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  :host([layout='phone']) .skeleton-week {
    grid-template-columns: minmax(0, 1fr);
  }

  .bone-card {
    display: flex;
    flex-direction: column;
    gap: 8px;
    min-height: 120px;
    padding: 12px;
    border: 1px solid var(--pv-border-subtle, #F1F1EE);
    border-radius: var(--pv-radius, 12px);
  }

  .skeleton-agenda {
    display: flex;
    flex-direction: column;
    gap: 12px;
    max-width: 800px;
    margin: 0 auto;
  }

  .skeleton-agenda .bone-card {
    min-height: 0;
  }

  .skeleton-month {
    display: grid;
    grid-template-columns: repeat(7, minmax(0, 1fr));
    grid-template-rows: repeat(5, minmax(0, 1fr));
    gap: 1px;
    padding: 0;
  }

  .bone-cell {
    display: flex;
    flex-direction: column;
    gap: 4px;
    padding: 6px;
    border: 1px solid var(--pv-border-subtle, #F1F1EE);
  }

  .skeleton-day {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .bone-heads,
  .bone-lanes {
    display: flex;
    gap: 12px;
    padding-left: 48px;
  }

  .bone-head {
    flex: 1 1 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
  }

  .bone-lanes {
    flex: 1 1 auto;
  }

  .bone-lane {
    position: relative;
    flex: 1 1 0;
  }

  .bone-lane .bone {
    position: absolute;
    left: 0;
    right: 0;
  }
`,ri=["January","February","March","April","May","June","July","August","September","October","November","December"];function li(e,t){return`New event on ${Ns(e,t)}`}function di(e,t,s=50){const i=Math.min(.999,Math.max(.05,t)),a=2*Math.PI/e,n=a*Math.sqrt(1-i*i),o=Math.log(1e3)/(i*a),r=[];for(let e=0;e<s;e++){const t=o*e/s,l=1-Math.exp(-i*a*t)*(Math.cos(n*t)+i*a/n*Math.sin(n*t));r.push(l.toFixed(4))}return r.push("1"),{easing:`linear(${r.join(", ")})`,duration:Math.round(1e3*o)}}const ci=di(.5,.86),hi=di(.45,.55),pi=di(.6,.9);function ui(){return"undefined"!=typeof CSS&&"function"==typeof CSS.supports&&CSS.supports("animation-timing-function","linear(0, 1)")}function mi(e,t=ui()){return t?e:{easing:"cubic-bezier(0.2, 0.8, 0.2, 1)",duration:e.duration}}function vi(e){const t=getComputedStyle(e).getPropertyValue("--pv-motion").trim();return"reduced"===t||"full"===t?t:"function"==typeof matchMedia&&matchMedia("(prefers-reduced-motion: reduce)").matches?"reduced":"full"}function gi(e,t){return e?e.view!==t.view?"switch":t.at>e.at?"forward":t.at<e.at?"back":"none":"none"}function bi(e,t,s){if("none"===e)return null;if("reduced"===t)return{keyframes:[{opacity:.4},{opacity:1}],options:{duration:150,easing:"ease-out"}};const i=mi(ci,s);return{keyframes:[{opacity:0,transform:"switch"===e?"translateY(12px)":`translateX(${"forward"===e?32:-32}px)`},{opacity:1,transform:"none"}],options:{duration:i.duration,easing:i.easing}}}const yi=o`
  .pv-seg {
    display: inline-flex;
    align-items: stretch;
    gap: 2px;
    max-width: 100%;
    height: 48px;
    padding: 0 4px;
    box-sizing: border-box;
    border-radius: 13px;
    background: var(--pv-seg, #ECECE8);
  }

  .pv-seg.stretch {
    display: flex;
    width: 100%;
  }

  .pv-seg.stretch > button {
    flex: 1 1 0;
    min-width: 0;
  }

  .pv-seg > button {
    position: relative;
    isolation: isolate;
    /* Each choice keeps its width, so a long list scrolls (or wraps the bar) instead of cutting words. */
    flex: 0 0 auto;
    min-width: 48px;
    height: 48px;
    padding: 0 14px;
    border: none;
    background: none;
    color: var(--pv-text-secondary, #5F6670);
    font: inherit;
    font-size: 0.875rem;
    font-weight: 650;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    cursor: pointer;
    -webkit-tap-highlight-color: transparent;
  }

  .pv-seg > button::before {
    content: '';
    position: absolute;
    inset: 5px 0;
    z-index: -1;
    border-radius: 9px;
  }

  .pv-seg > button[aria-pressed='true'],
  .pv-seg > button[aria-checked='true'] {
    color: var(--pv-text, #1A1B1E);
  }

  .pv-seg > button[aria-pressed='true']::before,
  .pv-seg > button[aria-checked='true']::before {
    background: var(--pv-seg-on, #FFFFFF);
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.12);
  }

  .pv-seg > button:not([aria-pressed='true']):not([aria-checked='true']):not(:disabled):hover {
    color: var(--pv-text, #1A1B1E);
  }

  .pv-seg > button:focus-visible {
    outline: none;
  }

  .pv-seg > button:focus-visible::before {
    outline: 2px solid var(--pv-accent-ink, #5B5BD6);
    outline-offset: -1px;
  }

  .pv-seg > button:disabled {
    opacity: 0.45;
    cursor: default;
  }
`,fi=o`
  .pv-choices {
    display: flex;
    flex-direction: column;
    border: 1px solid var(--pv-border, #E7E7E3);
    border-radius: 12px;
    background: var(--pv-card-bg, #FFFFFF);
    overflow: hidden;
  }

  .pv-choice {
    position: relative;
    display: flex;
    align-items: center;
    gap: 12px;
    min-height: 56px;
    padding: 10px 14px;
    box-sizing: border-box;
    cursor: pointer;
    -webkit-tap-highlight-color: transparent;
  }

  .pv-choice + .pv-choice {
    border-top: 1px solid var(--pv-border, #E7E7E3);
  }

  .pv-choice input {
    position: absolute;
    opacity: 0;
    width: 1px;
    height: 1px;
    margin: 0;
    pointer-events: none;
  }

  .pv-choice .choice-text {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .pv-choice .choice-title {
    font-weight: 600;
    color: var(--pv-text, #1A1B1E);
  }

  .pv-choice .choice-sub {
    font-size: 0.8125rem;
    line-height: 1.4;
    color: var(--pv-text-secondary, #5F6670);
  }

  .pv-choice .choice-check {
    flex: none;
    width: 22px;
    text-align: center;
    font-weight: 800;
    color: var(--pv-accent-ink, #5B5BD6);
    visibility: hidden;
  }

  .pv-choice:has(input:checked) .choice-check {
    visibility: visible;
  }

  .pv-choice:has(input:focus-visible) {
    outline: 2px solid var(--pv-accent-ink, #5B5BD6);
    outline-offset: -2px;
  }
`,_i=o`
  .pv-tag {
    display: inline-flex;
    align-items: center;
    flex-shrink: 0;
    padding: 3px 9px;
    border-radius: 999px;
    font-size: 0.75rem;
    font-weight: 600;
    line-height: 1.3;
    white-space: nowrap;
    background: color-mix(in srgb, var(--pv-accent, #5B5BD6) 12%, transparent);
    color: var(--pv-accent-ink, #5B5BD6);
  }

  .pv-tag.muted {
    background: color-mix(in srgb, var(--pv-text, #1A1B1E) 7%, transparent);
    color: var(--pv-text-secondary, #5F6670);
  }

  .pv-tag.muted.ok {
    color: var(--pv-text, #1A1B1E);
  }

  .pv-tag.ask,
  .pv-tag.attention {
    background: var(--pv-warn-bg, #FDF1DC);
    color: var(--pv-warn-ink, #8A5A00);
  }
`,wi=o`
  .pv-people {
    display: flex;
    flex: 0 0 auto;
    gap: 6px;
    padding: 8px 12px 0;
    overflow-x: auto;
    scrollbar-width: none;
  }

  .pv-people::-webkit-scrollbar {
    display: none;
  }

  .pv-person {
    flex: 0 0 auto;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2px;
    min-width: 56px;
    min-height: 56px;
    padding: 4px 6px;
    border: none;
    border-radius: 14px;
    background: transparent;
    color: var(--pv-text-secondary, #5F6670);
    font: inherit;
    font-size: 0.75rem;
    font-weight: 700;
    cursor: pointer;
    -webkit-tap-highlight-color: transparent;
  }

  .pv-person[aria-selected='true'],
  .pv-person[aria-pressed='true'] {
    color: var(--pv-text, #1A1B1E);
    background: color-mix(in srgb, var(--member, var(--pv-accent, #5B5BD6)) 16%, var(--pv-card-bg, #FFFFFF));
  }

  .pv-person:focus-visible {
    outline: 2px solid var(--pv-accent-ink, #5B5BD6);
    outline-offset: -2px;
  }
`,xi=o`
  .pv-person-chips {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  .pv-person-chip {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    min-height: 48px;
    padding: 4px 14px 4px 6px;
    box-sizing: border-box;
    border: 1.5px solid var(--pv-border, #E7E7E3);
    border-radius: 999px;
    background: var(--pv-card-bg, #FFFFFF);
    color: var(--pv-text, #1A1B1E);
    font: inherit;
    font-size: 0.875rem;
    font-weight: 600;
    cursor: pointer;
    -webkit-tap-highlight-color: transparent;
  }

  .pv-person-chip .dot {
    width: 28px;
    height: 28px;
    flex: none;
    border-radius: 50%;
    background: var(--member, var(--pv-accent, #5B5BD6));
  }

  .pv-person-chip[aria-pressed='true'] {
    border-color: var(--member, var(--pv-accent, #5B5BD6));
    background: color-mix(in srgb, var(--member, var(--pv-accent, #5B5BD6)) 12%, var(--pv-card-bg, #FFFFFF));
  }

  .pv-person-chip[aria-pressed='true']::after {
    content: '✓';
    font-weight: 800;
  }

  .pv-person-chip:focus-visible {
    outline: 2px solid var(--pv-accent-ink, #5B5BD6);
    outline-offset: 2px;
  }

  .pv-person-chip:disabled {
    opacity: 0.45;
    cursor: default;
  }
`,$i=o`
  .chips {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    align-items: center;
  }

  .chip {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    min-height: 48px;
    padding: 0 14px;
    box-sizing: border-box;
    border-radius: 999px;
    border: 1px solid var(--pv-border, #E7E7E3);
    background: var(--pv-card-bg, #FFFFFF);
    color: var(--pv-text, #1A1B1E);
    font: inherit;
    font-size: 0.9375rem;
    font-weight: 650;
    cursor: pointer;
    -webkit-tap-highlight-color: transparent;
  }

  .chip:has(pv-member-avatar) {
    padding-left: 6px;
  }

  .chip:hover,
  .chip:focus-visible {
    border-color: var(--pv-accent, #5B5BD6);
    outline: none;
  }

  .chip[aria-pressed='true'] {
    border-color: var(--pv-accent, #5B5BD6);
    background: var(--pv-accent-tint, #EEEEFC);
    color: var(--pv-accent-tint-ink, #3B3BB0);
  }
`;function ki(e,t,s){return t&&e.includes(t)?t:s&&e.includes(s)?s:e[0]??null}const Ei={number:28,row:21,more:14};class Fi extends de{constructor(){super(...arguments),this.events=[],this.calendars=[],this.currentDate=new Date,this.hiddenCalendars=new Set,this.timeFormat="12h",this.hideColumnHeaders=!1,this._dayPick=null,this.avatarBorderMode="primary",this.sharedEventMap=new Map,this.tick=0,this.layout="landscape",this.progress=null,this.revision=0,this._hourPx=80,this._measured=null,this._addEvent=()=>{this.dispatchEvent(new CustomEvent("create-event",{detail:{date:this.currentDate},bubbles:!0,composed:!0}))}}connectedCallback(){super.connectedCallback(),this.hasUpdated&&this._watchHours()}_openDay(e){this.dispatchEvent(new CustomEvent("pv-open",{detail:{module:"chores",view:"my_day",member:e},bubbles:!0,composed:!0}))}disconnectedCallback(){super.disconnectedCallback(),this._hoursObserver?.disconnect(),this._measured=null}firstUpdated(){this._watchHours(),this._fitHours(),this._scrollToNow()}updated(e){super.updated(e),e.has("currentDate")&&this._scrollToNow(),this._watchHours(),e.has("layout")&&this._fitHours()}_watchHours(){const e=this.shadowRoot?.querySelector(".time-grid-wrapper")??null;e!==this._measured&&(this._hoursObserver?.disconnect(),this._measured=e,e&&"undefined"!=typeof ResizeObserver&&(this._hoursObserver??=new ResizeObserver(()=>this._fitHours()),this._hoursObserver.observe(e)))}_fitHours(){const e=this._measured;if(!e)return;const t=(s=this.layout,i=e.clientHeight,"portrait"===s&&i>0?Math.max(48,Math.min(80,Math.floor(i/14))):80);var s,i;if(t===this._hourPx)return;const a=(n=e.scrollTop,r=t,(o=this._hourPx)>0?Math.round(n*r/o):n);var n,o,r;this._hourPx=t,this.updateComplete.then(()=>{e.scrollTop=a})}_scrollToNow(){requestAnimationFrame(()=>{const e=this.shadowRoot?.querySelector(".time-grid-wrapper");if(!e)return;this._scrollContainer=e;const t=new Date,s=60*(t.getHours()-0)+t.getMinutes();if(s>0&&s<1440){const t=s/1440*e.scrollHeight-e.clientHeight/3;e.scrollTo({top:Math.max(0,t),behavior:"smooth"})}})}_participant(e,t){const s=t.find(t=>t.entity_id===e.calendar_entity_id);return{calendar_name:e.calendar_name||s?.display_name||"",calendar_color:e.calendar_color||s?.color||"",person_entity:s?.person_entity||""}}_faces(e){return U`
      <div class="event-participants">
        ${e.map(e=>{const t=e.person_entity?ot(this.hass,e.person_entity):null,s=e.person_entity?rt(this.hass,e.person_entity):e.calendar_name;return t?U`<img class="event-participant-avatar" src="${t}" alt="${s}"
                style="--participant-color: ${e.calendar_color}" />`:U`<div class="event-participant-initial"
                style="background: ${e.calendar_color}; --participant-color: ${e.calendar_color}; color: ${We(e.calendar_color)}"
              >${s[0]?.toUpperCase()||"?"}</div>`})}
      </div>
    `}render(){const e=Ne(this.events,this.hiddenCalendars),t=new Date(this.currentDate);t.setHours(0,0,0,0);const s=new Date(this.currentDate);s.setHours(23,59,59,999);const i=Be(e,t,s),a=i.filter(e=>Te(e)),n=i.filter(e=>!Te(e)),o=this.calendars.filter(e=>!1!==e.visible&&!this.hiddenCalendars.has(e.entity_id)),r=function(e,t){const s=new Map,i=new Map(t.map(e=>[e.entity_id,e]));for(const e of t)if(!1!==e.visible){const t=e.person_entity||e.entity_id;s.has(t)||s.set(t,[])}for(const t of e){const e=i.get(t.calendar_entity_id),a=e?.person_entity||t.calendar_entity_id;s.has(a)||s.set(a,[]),s.get(a).push(t)}return s}(n,o),l=Array.from(r.keys()),d=ki(l,this._dayPick,this._ownPerson(l)),c=e=>{const t=o.find(t=>t.entity_id===e.calendar_entity_id);return t?t.person_entity||t.entity_id:null},h=new Date,p=h.toDateString()===this.currentDate.toDateString(),u=60*(h.getHours()-0)+h.getMinutes(),m=p?u/1440*100:-1;return 0===o.length?U`
        <div class="state">
          <div class="art" aria-hidden="true">📅</div>
          <h2>Every calendar is hidden</h2>
          <p>Show them again to see what's coming up.</p>
        </div>
      `:U`
      <div class="day-container" style="--pv-hour-px: ${this._hourPx}px">
        ${l.length>1?U`
          <div class="pv-people day-people" role="tablist" aria-label="Whose day">
            ${l.map(e=>{const t=this._face(e,o);return U`
                <button type="button" class="pv-person" role="tab" aria-selected=${e===d?"true":"false"}
                  style="--member:${t.color}" @click=${()=>{this._dayPick=e}}>${t.picture}${t.name}</button>
              `})}
          </div>
        `:Y}
        ${a.length>0?U`
          <div class="all-day-section ${a.some(e=>c(e)===d)?"":"none-chosen"}">
            <div class="all-day-gutter">All day</div>
            <div class="all-day-events">
              ${function(e){const t=new Map;for(const s of e){const e=Se(s),i=t.get(e);i?i.push(s):t.set(e,[s])}return[...t.values()]}(a).map(e=>{const t=e.find(e=>c(e)===d)??e[0],s=e.some(e=>c(e)===d);return U`
                  <div
                    class="all-day-chip${Me(t)?" past":""}${s?"":" other"}"
                    role="button"
                    tabindex="0"
                    @click=${()=>this._onEventClick(t)}
                    @keydown=${e=>this._onEventKey(e,t)}
                  ><span class="all-day-pill" style="background: ${t.calendar_color}; color: ${We(t.calendar_color)}">
                    <span class="all-day-name">${t.summary}</span>
                    ${e.length>1?this._faces(e.map(e=>this._participant(e,o))):Y}
                  </span></div>
                `})}
            </div>
          </div>
        `:Y}

        ${this.hideColumnHeaders?Y:U`
          <div class="column-headers">
            <div class="header-gutter"></div>
            ${l.map(e=>{const t=o.find(t=>(t.person_entity||t.entity_id)===e),s=t?.person_entity?ot(this.hass,t.person_entity):null,i=t?.person_entity?rt(this.hass,t.person_entity):t?.display_name||e,a=t?.color||"#6366F1",n=t?.color_light||a,r="light"===this.avatarBorderMode?n:"primary"===this.avatarBorderMode?a:this.avatarBorderMode,l=s?U`<img class="person-avatar" src="${s}" alt="${i}"
                    style="${r?`--pv-avatar-border: ${r}`:""}" />`:U`<div class="person-initial" style="background: ${a}; color: ${We(a)}">${i[0]?.toUpperCase()||"?"}</div>`,d=p&&t?.member_id&&this.progress?function(e,t){if(!t||t.due<=0)return null;const s=Math.min(t.due,t.done+t.pending),i=s>=t.due;return{fraction:s/t.due,closed:i,label:i?`${e}, ring closed for today. Open ${e}'s day`:`${e}, ${s} of ${t.due} done today. Open ${e}'s day`}}(i,this.progress(t.member_id)):null;return U`
                <div class="person-header">
                  ${d?U`
                    <button class="ring-wrap" type="button" aria-label=${d.label}
                      @click=${()=>this._openDay(t.member_id)}>
                      ${l}
                      <svg viewBox="0 0 100 100" aria-hidden="true">
                        <circle class="track" cx="50" cy="50" r="46" fill="none" stroke-width="6"></circle>
                        <circle class="done" cx="50" cy="50" r="46" fill="none" stroke=${a} stroke-width="6" stroke-linecap="round"
                          stroke-dasharray=${2*Math.PI*46} stroke-dashoffset=${2*Math.PI*46*(1-d.fraction)}></circle>
                      </svg>
                    </button>
                  `:l}
                  <span class="person-name">${i}</span>
                </div>
              `})}
          </div>
        `}

        ${p?Y:U`
          <div class="date-banner">
            <ha-icon icon="mdi:calendar-today"></ha-icon>
            ${this.currentDate.toLocaleDateString("en-US",{weekday:"long",month:"long",day:"numeric",year:"numeric"})}
          </div>
        `}

        ${0===i.length?U`
          <div class="day-empty" role="status">
            <span>${p?"Nothing on the calendar today.":`Nothing on the calendar on ${this.currentDate.toLocaleDateString("en-US",{weekday:"long"})}.`}</span>
            <button class="day-empty-add" type="button" @click=${this._addEvent}>New event</button>
          </div>
        `:Y}

        <div class="time-grid-wrapper">
          <div class="time-grid">
            <div class="time-gutter">
              ${this._renderTimeLabels()}
            </div>
            <div class="columns-area">
              ${this._renderHourLines()}
              ${m>=0&&m<=100?U`
                <div class="pv-now-line" style="top: ${m}%"></div>
              `:Y}
              ${l.map(e=>this._renderColumn(e,r.get(e)||[],e===d))}
            </div>
          </div>
          ${this._renderNextDayFooter()}
        </div>
      </div>
    `}_ownPerson(e){const t=this.hass?.user?.id;if(!t)return null;const s=Object.values(this.hass.states).find(e=>e.entity_id.startsWith("person.")&&e.attributes.user_id===t);return s&&e.includes(s.entity_id)?s.entity_id:null}_face(e,t){const s=t.find(t=>(t.person_entity||t.entity_id)===e),i=s?.person_entity?ot(this.hass,s.person_entity):null,a=s?.person_entity?rt(this.hass,s.person_entity):s?.display_name||e,n=s?.color||"#6366F1",o=i?U`<img class="person-avatar" src="${i}" alt="" />`:U`<div class="person-initial" style="background: ${n}; color: ${We(n)}">${a[0]?.toUpperCase()||"?"}</div>`;return{name:a,color:n,picture:o}}_renderTimeLabels(){const e=[];for(let t=0;t<=24;t++){const s=(t-0)/24*100;let i;if("24h"===this.timeFormat)i=`${String(t%24).padStart(2,"0")}:00`;else{const e=t%24;i=`${e%12||12} ${e>=12?"PM":"AM"}`}e.push(U`
        <div class="time-label" style="top: ${s}%">${i}</div>
      `)}return e}_renderHourLines(){const e=[],t=1/24*100;for(let s=0;s<24;s++){const i=(s-0)/24*100;s%2==1&&e.push(U`
          <div class="hour-band-odd" style="top: ${i}%; height: ${t}%"></div>
        `)}return e}_renderNextDayFooter(){const e=new Date(this.currentDate);e.setDate(e.getDate()+1);const t=e.toLocaleDateString("en-US",{weekday:"long",month:"long",day:"numeric"});return U`
      <button class="next-day-footer" type="button" aria-label="Go to ${t}" @click=${this._goToNextDay}>
        ${t}
        <ha-icon icon="mdi:arrow-down"></ha-icon>
      </button>
    `}_goToToday(){this.dispatchEvent(new CustomEvent("day-click",{detail:{date:new Date},bubbles:!0,composed:!0}))}_goToNextDay(){const e=new Date(this.currentDate);e.setDate(e.getDate()+1),this.dispatchEvent(new CustomEvent("day-click",{detail:{date:e},bubbles:!0,composed:!0}))}_renderColumn(e,t,s){const i=function(e){const t=e.filter(e=>!Te(e)).sort((e,t)=>we(e.start).getTime()-we(t.start).getTime());if(0===t.length)return[];const s=t.map(e=>({event:e,start:we(e.start).getTime(),end:we(e.end).getTime(),column:0,cluster:0}));let i=0,a=0;for(let e=0;e<s.length;e++){let t=!1;for(let i=a;i<e;i++)if(s[e].start<s[i].end){t=!0;break}if(!t&&e>a){const t=e;let n=0;for(let e=a;e<t;e++)n=Math.max(n,s[e].column+1);for(let e=a;e<t;e++)s[e].cluster=i;i++,a=e}const n=new Set;for(let t=a;t<e;t++)s[e].start<s[t].end&&n.add(s[t].column);let o=0;for(;n.has(o);)o++;s[e].column=o}s.forEach((e,t)=>{t>=a&&(e.cluster=i)});const n=new Map;for(const e of s){const t=n.get(e.cluster)||0;n.set(e.cluster,Math.max(t,e.column+1))}return s.map(e=>({...e.event,column:e.column,totalColumns:n.get(e.cluster)||1}))}(t);return U`
      <div class="person-column ${s?"chosen":""}">
        ${i.map(e=>{const t=function(e,t=0,s=24,i){const a=we(e.start),n=we(e.end),o=60*(s-t),r=i??a,l=new Date(r.getFullYear(),r.getMonth(),r.getDate(),t),d=new Date(r.getFullYear(),r.getMonth(),r.getDate(),s),c=e=>e<=l?0:e>=d?o:60*(e.getHours()-t)+e.getMinutes(),h=c(a),p=c(n),u=Math.max(p-h,15);return{top:h/o*100,height:u/o*100}}(e,0,24,this.currentDate),s=e.totalColumns>1?`calc(${100/e.totalColumns}% - 6px)`:"calc(100% - 6px)",i=e.totalColumns>1?`calc(${e.column/e.totalColumns*100}% + 3px)`:"3px",a=this.sharedEventMap.get(Se(e)),n=a&&a.length>1,o=we(e.end).getTime()-we(e.start).getTime()<27e5;return U`
            <div
              class="positioned-event${Me(e)?" past":""}${n?" shared":""}${o?" brief":""}"
              style="
                top: ${t.top}%;
                height: ${t.height}%;
                width: ${s};
                left: ${i};
                --event-color: ${e.calendar_color};
                --event-color-light: ${e.calendar_color_light||""};
                --event-text: ${We(e.calendar_color_light||e.calendar_color)};
              "
              role="button"
              tabindex="0"
              @click=${()=>this._onEventClick(e)}
              @keydown=${t=>this._onEventKey(t,e)}
            >
              <div class="event-title">${e.summary}</div>
              <div class="event-time">${xe(e.start,this.timeFormat)}</div>
              ${n?this._faces(a):Y}
            </div>
          `})}
      </div>
    `}_onEventKey(e,t){"Enter"!==e.key&&" "!==e.key||(e.preventDefault(),this._onEventClick(t))}_onEventClick(e){this.dispatchEvent(new CustomEvent("event-click",{detail:{event:e},bubbles:!0,composed:!0}))}}function Ci(e,t=48){return(Si[e]||Si.cloudy)(t)}Fi.styles=[wi,vt,lt,ht,ut,mt,o`
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
        min-height: 48px;
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
        font-weight: 500;
      }

      .all-day-events {
        flex: 1;
        display: flex;
        gap: 0 0.375rem;
        flex-wrap: wrap;
        padding: 0 0.5rem;
      }

      /* Names and the date in the rounded face (spec 11.2). */
      .person-name,
      .date-banner {
        font-family: var(--pv-font-heading, inherit);
        font-weight: 700;
      }

      .next-day-footer {
        width: 100%;
        min-height: 48px;
        border: none;
        font-family: var(--pv-font-heading, inherit);
        font-weight: 700;
      }

      .all-day-chip:focus-visible .all-day-pill,
      .positioned-event:focus-visible {
        outline: 2px solid var(--pv-accent-ink, #5B5BD6);
        outline-offset: 1px;
      }

      /* A 48 px target with the pill drawn inside, like the header's chips. */
      .all-day-chip {
        display: inline-flex;
        align-items: center;
        min-height: 48px;
        max-width: 200px;
        cursor: pointer;
        outline: none;
        -webkit-tap-highlight-color: transparent;
      }

      .all-day-pill {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        max-width: 100%;
        box-sizing: border-box;
        min-width: 0;
        padding: 6px 14px;
        border-radius: 9999px;
        font-size: 0.8125rem;
        font-weight: 600;
        color: white;
        transition: all 200ms ease;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        box-shadow: 0 1px 4px rgba(0, 0, 0, 0.12);
      }

      .all-day-name {
        min-width: 0;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .all-day-pill .event-participants {
        margin-top: 0;
        flex-shrink: 0;
      }

      /* On the pill, a ring in the pill's ink keeps the face of the person whose color it is visible. */
      .all-day-pill .event-participant-initial,
      .all-day-pill .event-participant-avatar {
        width: 20px;
        height: 20px;
        border-color: currentColor;
        font-size: 0.5625rem;
      }

      .all-day-chip.past .all-day-pill { opacity: 0.45; }

      .all-day-chip:hover .all-day-pill {
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
        /* Its width is the lane's less the gaps, padding and accent included, so it never runs into the next lane. */
        box-sizing: border-box;
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

      /* As on Week's chips: everyone's faces at the top right, so a short event keeps them in view. */
      .positioned-event .event-participants {
        position: absolute;
        top: 6px;
        right: 6px;
        margin: 0;
      }

      .positioned-event.brief {
        display: flex;
        align-items: baseline;
        gap: 8px;
        padding-top: 4px;
        padding-bottom: 4px;
      }

      .positioned-event.brief .event-title {
        min-width: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .positioned-event.brief .event-time {
        margin-top: 0;
        flex-shrink: 0;
      }

      .positioned-event.shared .event-title,
      .positioned-event.shared .event-time {
        padding-right: 40px;
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
      /* A quiet line on a day with nothing on it (spec 11.6); the lanes stay. */
      .day-empty {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 12px;
        min-height: 48px;
        padding: 0 16px;
        color: var(--pv-text-secondary);
        font-size: 0.9375rem;
        border-bottom: 1px solid var(--pv-border-subtle, rgba(0, 0, 0, 0.04));
        flex-shrink: 0;
      }

      .day-empty-add {
        min-height: 48px;
        padding: 0 12px;
        border: none;
        background: transparent;
        color: var(--pv-accent-ink, var(--pv-accent));
        font: inherit;
        font-weight: 700;
        cursor: pointer;
      }

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


      /* ═══════════ RESPONSIVE BREAKPOINTS ═══════════ */

      /* Wide enough for every lane's header: the strip stays out of the way. */
      .day-people { display: none; }
      .day-people .person-avatar,
      .day-people .person-initial { width: 28px; height: 28px; margin: 6px; font-size: 0.75rem; }

      /* xs: phones, hide column headers, compact events; one person at a time with the strip (milestone 8) */
      @container pv-calendar (max-width: 479px) {
        .column-headers { display: none; }
        .day-people { display: flex; }
        .person-column:not(.chosen) { display: none; }
        .all-day-chip.other,
        .all-day-section.none-chosen { display: none; }
        .time-gutter { width: 40px; }
        .all-day-gutter { width: 40px; font-size: 0.5625rem; }
        .time-label { font-size: 0.5625rem; }
        .positioned-event { padding: 3px 6px; }
        .positioned-event .event-title { font-size: 0.75rem; }
        .positioned-event .event-time { display: none; }
        .next-day-footer { padding: 10px; font-size: 0.8125rem; }
      }

      /* sm: large phones, hide column headers, narrower gutter; one person at a time with the strip */
      @container pv-calendar (min-width: 480px) and (max-width: 767px) {
        .column-headers { display: none; }
        .day-people { display: flex; }
        .person-column:not(.chosen) { display: none; }
        .all-day-chip.other,
        .all-day-section.none-chosen { display: none; }
        .time-gutter { width: 48px; }
        .all-day-gutter { width: 48px; }
        .positioned-event { padding: 4px 8px; }
        .positioned-event .event-title { font-size: 0.875rem; }
      }

      /* md: tablets, smaller avatars */
      @container pv-calendar (min-width: 768px) and (max-width: 1023px) {
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
      @container pv-calendar (min-width: 1024px) {
        .time-gutter { width: 72px; }
        .time-label { font-size: 0.8125rem; }
        .all-day-gutter { width: 72px; font-size: 0.8125rem; }
        .header-gutter { width: 72px; }
        .all-day-pill { font-size: 0.9375rem; }
        .positioned-event { min-height: 30px; }
        .positioned-event .event-title { font-size: 1.0625rem; }
        .positioned-event .event-time { font-size: 0.9375rem; }
        .person-name { font-size: 1rem; }
        .next-day-footer { font-size: 1.0625rem; }
      }

      /* xl: wall displays (1440px+), scale up ~40% */
      @container pv-calendar (min-width: 1440px) {
        .time-gutter { width: 84px; }
        .time-label { font-size: 0.9375rem; }
        .all-day-gutter { width: 84px; font-size: 0.9375rem; }
        .header-gutter { width: 84px; }
        .all-day-pill { font-size: 1.0625rem; }
        .positioned-event { min-height: 34px; padding: 8px 12px; }
        .positioned-event .event-title { font-size: 1.1875rem; }
        .positioned-event .event-time { font-size: 1.0625rem; }
        .person-avatar, .person-initial { width: 72px; height: 72px; font-size: 1.5rem; }
        .person-name { font-size: 1.125rem; }
        .next-day-footer { font-size: 1.1875rem; padding: 18px; }
      }
    `],e([ue({attribute:!1})],Fi.prototype,"hass",void 0),e([ue({type:Array})],Fi.prototype,"events",void 0),e([ue({type:Array})],Fi.prototype,"calendars",void 0),e([ue({type:Object})],Fi.prototype,"currentDate",void 0),e([ue({type:Object})],Fi.prototype,"hiddenCalendars",void 0),e([ue({attribute:!1})],Fi.prototype,"timeFormat",void 0),e([ue({type:Boolean})],Fi.prototype,"hideColumnHeaders",void 0),e([me()],Fi.prototype,"_dayPick",void 0),e([ue({attribute:!1})],Fi.prototype,"avatarBorderMode",void 0),e([ue({attribute:!1})],Fi.prototype,"sharedEventMap",void 0),e([ue({type:Number})],Fi.prototype,"tick",void 0),e([ue({type:String,reflect:!0})],Fi.prototype,"layout",void 0),e([ue({attribute:!1})],Fi.prototype,"progress",void 0),e([ue({attribute:!1})],Fi.prototype,"revision",void 0),e([me()],Fi.prototype,"_hourPx",void 0),ge("pv-view-day",Fi);const Si={sunny:e=>U`
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
    </svg>`};function Di(e){try{const t=e();t&&"function"==typeof t.catch&&t.catch(()=>{})}catch{}}function Ai(e){return Math.min(3e4,1e3*2**e)}class Mi{constructor(e){this._onForecast=e,this._entityId="",this._unsub=null,this._generation=0,this._attempt=0,this._hadForecast=!1,this._onReady=()=>{this._connection&&this._entityId&&(this._generation++,this._unsub=null,this._cancelRetry(),this._subscribe())}}update(e,t,s){if(this._legacy=s,!t||!e){const e=""!==this._entityId;return this.stop(),void(e&&this._onForecast([]))}t===this._entityId&&e===this._connection||(this.stop(),this._entityId=t,this._connection=e,e.addEventListener?.("ready",this._onReady),this._subscribe())}stop(){if(this._generation++,this._cancelRetry(),this._connection?.removeEventListener?.("ready",this._onReady),this._connection=void 0,this._entityId="",this._hadForecast=!1,this._unsub){const e=this._unsub;this._unsub=null,Di(e)}}_subscribe(){const e=this._connection;if(!e)return;const t=this._generation;e.subscribeMessage(e=>{t===this._generation&&(this._hadForecast=!0,this._onForecast(e?.forecast||[]))},{type:"weather/subscribe_forecast",forecast_type:"daily",entity_id:this._entityId},{resubscribe:!1}).then(e=>{t===this._generation?(this._unsub=e,this._attempt=0):Di(e)}).catch(()=>{if(t!==this._generation)return;const e=this._attempt>=6;!e&&this._hadForecast||this._onForecast(this._legacy||[]),e||(this._retry=setTimeout(()=>{this._retry=void 0,t===this._generation&&this._subscribe()},Ai(this._attempt++)))})}_cancelRetry(){void 0!==this._retry&&clearTimeout(this._retry),this._retry=void 0,this._attempt=0}}function Ti(e){const t=new Map;for(const s of e)s.datetime&&t.set(Ee(we(s.datetime)),{condition:s.condition||"",tempHigh:s.temperature??0,tempLow:s.templow??s.temperature??0});return t}const zi=(e,t)=>{const s=e._$AN;if(void 0===s)return!1;for(const e of s)e._$AO?.(t,!1),zi(e,t);return!0},Pi=e=>{let t,s;do{if(void 0===(t=e._$AM))break;s=t._$AN,s.delete(e),e=t}while(0===s?.size)},Oi=e=>{for(let t;t=e._$AM;e=t){let s=t._$AN;if(void 0===s)t._$AN=s=new Set;else if(s.has(e))break;s.add(e),Ri(t)}};function Bi(e){void 0!==this._$AN?(Pi(this),this._$AM=e,Oi(this)):this._$AM=e}function Ni(e,t=!1,s=0){const i=this._$AH,a=this._$AN;if(void 0!==a&&0!==a.size)if(t)if(Array.isArray(i))for(let e=s;e<i.length;e++)zi(i[e],!1),Pi(i[e]);else null!=i&&(zi(i,!1),Pi(i));else zi(this,e)}const Ri=e=>{2==e.type&&(e._$AP??=Ni,e._$AQ??=Bi)};class Ii extends yt{constructor(){super(...arguments),this._$AN=void 0}_$AT(e,t,s){super._$AT(e,t,s),Oi(this),this.isConnected=e._$AU}_$AO(e,t=!0){e!==this.isConnected&&(this.isConnected=e,e?this.reconnected?.():this.disconnected?.()),t&&(zi(this,e),Pi(this))}setValue(e){if((()=>void 0===this._$Ct.strings)())this._$Ct._$AI(e,this);else{const t=[...this._$Ct._$AH];t[this._$Ci]=e,this._$Ct._$AI(t,this,0)}}disconnected(){}reconnected(){}}const Li=new WeakMap,qi=bt(class extends Ii{render(e){return Y}update(e,[t]){const s=t!==this.G;return s&&void 0!==this.G&&this.rt(void 0),(s||this.lt!==this.ct)&&(this.G=t,this.ht=e.options?.host,this.rt(this.ct=e.element)),Y}rt(e){if(this.isConnected||(e=void 0),"function"==typeof this.G){const t=this.ht??globalThis;let s=Li.get(t);void 0===s&&(s=new WeakMap,Li.set(t,s)),void 0!==s.get(this.G)&&this.G.call(this.ht,void 0),s.set(this.G,e),void 0!==e&&this.G.call(this.ht,e)}else this.G.value=e}get lt(){return"function"==typeof this.G?Li.get(this.ht??globalThis)?.get(this.G):this.G?.value}disconnected(){this.lt===this.ct&&this.rt(void 0)}reconnected(){this.rt(this.ct)}});class Hi{constructor(){this._element=null,this._inputAt=-1/0,this._frame=0,this._onInput=()=>{this._inputAt=performance.now()},this._onScroll=()=>{this._frame||(this._frame=requestAnimationFrame(()=>{this._frame=0;const e=this._element;if(!e)return;const t=e.scrollTop;if(!function(e,t){return e<8||t<1500}(t,performance.now()-this._inputAt))return;const s=Math.max(0,e.scrollHeight-e.clientHeight);e.dispatchEvent(new CustomEvent("pv-content-scroll",{detail:{top:t,room:s},bubbles:!0,composed:!0}))}))},this.attach=e=>{const t=e instanceof HTMLElement?e:null;if(t===this._element)return;const s=this._element;if(s){s.removeEventListener("scroll",this._onScroll);for(const e of["wheel","touchmove","pointerdown","keydown"])s.removeEventListener(e,this._onInput)}if(this._element=t,t){t.addEventListener("scroll",this._onScroll,{passive:!0});for(const e of["wheel","touchmove","pointerdown","keydown"])t.addEventListener(e,this._onInput,{passive:!0});this._onScroll()}}}}class ji{constructor(){this._element=null,this._observer=null,this.attach=e=>{const t=e??null;t!==this._element&&(this._observer?.disconnect(),this._element=t,t&&"undefined"!=typeof ResizeObserver&&(this._observer??=new ResizeObserver(()=>this._measure()),this._observer.observe(t)))}}get change(){return e=this._tall,t=this._compact,void 0===e||void 0===t?80:Math.max(0,e-t);var e,t}_measure(){const e=this._element;if(!e||"portrait"!==e.getAttribute("layout"))return;const t=e.getBoundingClientRect().height,s=e.getAttribute("shape");"portrait"===s?this._tall=t:"phone"===s&&(this._compact=t)}}const Ui=["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];class Wi extends de{constructor(){super(...arguments),this.events=[],this.calendars=[],this.currentDate=new Date,this.hiddenCalendars=new Set,this.timeFormat="12h",this.firstDay="sunday",this.forecast=[],this.showStripes=!0,this.tick=0,this.layout="landscape",this._scroll=new Hi}updated(e){super.updated(e);const t=e.get("currentDate");t&&Ee(ke(t,this.firstDay))!==Ee(ke(this.currentDate,this.firstDay))&&this.renderRoot.querySelector(".week-container")?.scrollTo({top:0,behavior:"instant"})}_getWeekDays(){const e=ke(this.currentDate,this.firstDay);return Array.from({length:7},(t,s)=>{const i=new Date(e);return i.setDate(i.getDate()+s),i})}_getWeekLabel(e){return Ce(e[0],e[6])}render(){const e=Ne(this.events,this.hiddenCalendars),t=this._getWeekDays(),s=new Date(t[0]);s.setHours(0,0,0,0);const i=new Date(t[6]);i.setHours(23,59,59,999);const a=Ae(Be(e,s,i),this.calendars),n=Ti(this.forecast);return U`
      <div class="week-container" ${qi(this._scroll.attach)}>
        <div class="week-label">${this._getWeekLabel(t)}</div>
        <div class="day-grid">
          ${t.map(e=>this._renderDayCard(e,a,n))}
        </div>
      </div>
    `}_renderDayCard(e,t,s){const i=$e(e),a=Ee(e),n=new Date(e);n.setHours(0,0,0,0);const o=new Date(e);o.setHours(23,59,59,999);const r=Be(t,n,o).sort(Pe),l=s.get(a),d=`${Ui[e.getDay()]} ${e.getDate()}`;return U`
      <div class="day-card ${i?"day-card--today":""}">
        <div class="day-card-header">
          <div class="day-name">${d}</div>
          <div class="day-card-tools">
            ${l?U`
              <div class="day-weather">
                ${Ci(l.condition)}
                <span class="day-weather-temp">${Math.round(l.tempHigh)}°/${Math.round(l.tempLow)}°</span>
              </div>
            `:Y}
            <button class="add-btn" type="button" aria-label=${li(e,new Date)} title="New event"
              @click=${()=>this._addEvent(e)}>
              <ha-icon icon="mdi:plus"></ha-icon>
            </button>
          </div>
        </div>
        ${r.length>0?U`
          <div class="day-card-events">
            ${r.map(e=>U`
              <pv-event-chip
                .hass=${this.hass}
                .event=${e}
                .calendars=${this.calendars}
                .timeFormat=${this.timeFormat}
                .showStripes=${this.showStripes}
                .tick=${this.tick}
                @event-click=${e=>{e.stopPropagation(),this._onEventClick(e.detail.event)}}
              ></pv-event-chip>
            `)}
          </div>
        `:U`
          <div class="day-card-empty">Nothing planned</div>
        `}
      </div>
    `}_addEvent(e){this.dispatchEvent(new CustomEvent("create-event",{detail:{date:e},bubbles:!0,composed:!0}))}_onEventClick(e){this.dispatchEvent(new CustomEvent("event-click",{detail:{event:e},bubbles:!0,composed:!0}))}}Wi.styles=[lt,mt,o`
      :host { display: block; height: 100%; overflow: hidden; }

      .week-container {
        display: flex;
        flex-direction: column;
        height: 100%;
        overflow: auto;
      }

      /* Headings and numbers in the rounded face (spec 11.2). */
      .week-label {
        font-family: var(--pv-font-heading, inherit);
        font-size: 1.125rem;
        font-weight: 800;
        font-variant-numeric: tabular-nums;
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
        min-height: 48px;
        padding: 0 0 0 0.75rem;
        border-bottom: 1px solid var(--pv-border-subtle);
      }

      .day-name {
        font-family: var(--pv-font-heading, inherit);
        font-size: 0.9375rem;
        font-weight: 800;
        font-variant-numeric: tabular-nums;
        color: var(--pv-text);
      }

      .day-card--today .day-name {
        color: var(--pv-accent-ink, var(--pv-accent));
      }

      .day-card-tools {
        display: flex;
        align-items: center;
        gap: 2px;
      }

      /* New event on that day: a 48 px target (spec 11.8). */
      .add-btn {
        display: grid;
        place-items: center;
        width: 48px;
        height: 48px;
        padding: 0;
        border: none;
        border-radius: 50%;
        background: transparent;
        color: var(--pv-accent-ink, var(--pv-accent));
        cursor: pointer;
        --mdc-icon-size: 22px;
      }

      .add-btn:hover {
        background: var(--pv-event-hover, rgba(0, 0, 0, 0.04));
      }

      .add-btn:focus-visible {
        outline: 2px solid var(--pv-accent-ink, #5B5BD6);
        outline-offset: -4px;
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
        font-size: 0.875rem;
      }

      /* ═══════════ RESPONSIVE ═══════════ */

      /* SM/XS: small screens, tighter cards */
      @container pv-calendar (max-width: 767px) {
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
      @container pv-calendar (min-width: 1024px) {
        .week-label { font-size: 1.0625rem; }
        .day-name { font-size: 1rem; }
        .day-card { min-height: 140px; }
      }

      /* XL: wall displays, ~50% larger */
      @container pv-calendar (min-width: 1440px) {
        .week-label { font-size: 1.5rem; }
        .day-name { font-size: 1.375rem; }
        .day-weather svg { width: 36px; height: 36px; }
        .day-weather-temp { font-size: 0.9375rem; }
        .day-card { min-height: 180px; }
        .day-card-header { padding: 1rem 1.25rem 0.625rem; }
        .day-card-events { padding: 0.75rem; gap: 0.5rem; }
      }
    `],e([ue({attribute:!1})],Wi.prototype,"hass",void 0),e([ue({type:Array})],Wi.prototype,"events",void 0),e([ue({type:Array})],Wi.prototype,"calendars",void 0),e([ue({type:Object})],Wi.prototype,"currentDate",void 0),e([ue({type:Object})],Wi.prototype,"hiddenCalendars",void 0),e([ue({attribute:!1})],Wi.prototype,"timeFormat",void 0),e([ue({attribute:!1})],Wi.prototype,"firstDay",void 0),e([ue({attribute:!1})],Wi.prototype,"forecast",void 0),e([ue({type:Boolean})],Wi.prototype,"showStripes",void 0),e([ue({type:Number})],Wi.prototype,"tick",void 0),e([ue({type:String,reflect:!0})],Wi.prototype,"layout",void 0),ge("pv-view-week",Wi);const Vi=["Sun","Mon","Tue","Wed","Thu","Fri","Sat"],Yi=["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];class Ki extends de{constructor(){super(...arguments),this.events=[],this.calendars=[],this.currentDate=new Date,this.hiddenCalendars=new Set,this.firstDay="sunday",this.timeFormat="12h",this.showStripes=!0,this.tick=0,this.layout="landscape",this._fit={cell:0,normal:Ei,today:Ei}}connectedCallback(){super.connectedCallback(),this.hasUpdated&&this._observeGrid()}disconnectedCallback(){super.disconnectedCallback(),this._gridObserver?.disconnect()}firstUpdated(){this._observeGrid()}updated(){this._measure()}_observeGrid(){const e=this.shadowRoot?.querySelector(".month-grid");e&&"undefined"!=typeof ResizeObserver&&(this._gridObserver??=new ResizeObserver(()=>this._measure()),this._gridObserver.disconnect(),this._gridObserver.observe(e))}_measure(){const e=this.shadowRoot?.querySelector(".month-grid");if(!e||0===e.clientHeight)return;const t=e.querySelector(".day-events"),s=t&&parseFloat(getComputedStyle(t).rowGap)||0,i=e.querySelector("pv-event-chip"),a=e.querySelector(".more-events"),n=i?Math.ceil(i.getBoundingClientRect().height+s):Ei.row,o=a?Math.ceil(a.getBoundingClientRect().height+s):Ei.more,r=e=>{const t=e?.querySelector(".day-events");if(!e||!t)return Ei.number;const s=parseFloat(getComputedStyle(e).borderBottomWidth)||0;return Math.ceil(t.getBoundingClientRect().top-e.getBoundingClientRect().top+s)},l={number:r(e.querySelector(".day-cell:not(.today)")),row:n,more:o},d=e.querySelector(".day-cell.today"),c={cell:Math.floor(e.clientHeight/6),normal:l,today:d?{...l,number:r(d)}:l};JSON.stringify(c)!==JSON.stringify(this._fit)&&(this._fit=c)}render(){const e=Ae(Ne(this.events,this.hiddenCalendars),this.calendars),t=function(e,t="sunday"){const s=ke(new Date(e.getFullYear(),e.getMonth(),1),t),i=[];for(let e=0;e<42;e++){const t=new Date(s);t.setDate(s.getDate()+e),i.push(t)}return i}(this.currentDate,this.firstDay),s=Oe(e),i=this.currentDate.getMonth(),a="monday"===this.firstDay?Yi:Vi,n=this.currentDate.toLocaleDateString("en-US",{month:"long",year:"numeric"});return U`
      <div class="month-container">
        <div class="month-name">${n}</div>
        <div class="weekday-header">
          ${a.map(e=>U`<div class="weekday-name">${e}</div>`)}
        </div>
        <div class="month-grid">
          ${t.map(e=>this._renderDayCell(e,i,s))}
        </div>
      </div>
    `}_renderDayCell(e,t,s){const i=Ee(e),a=s.get(i)||[],n=e.getMonth()!==t,o=$e(e),{shown:r,more:l}=function(e,t,s=Ei){if(!(t>0)){const t=Math.min(e,3);return{shown:t,more:e-t}}const i=t-s.number;if(e<=Math.floor(i/s.row))return{shown:e,more:0};const a=Math.min(e,Math.max(1,Math.floor((i-s.more)/s.row)));return{shown:a,more:e-a}}(a.length,this._fit.cell,o?this._fit.today:this._fit.normal),d=a.slice(0,r);return U`
      <div
        class="day-cell ${n?"other-month":""} ${o?"today":""}"
        @click=${()=>this._onDayClick(e)}
      >
        <div class="day-number">${e.getDate()}</div>
        <div class="day-events">
          ${d.map(e=>U`
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
          ${l>0?U`
            <div class="more-events" @click=${t=>{t.stopPropagation(),this._onDayClick(e)}}>
              +${l} more
            </div>
          `:Y}
        </div>
      </div>
    `}_onDayClick(e){this.dispatchEvent(new CustomEvent("day-click",{detail:{date:e},bubbles:!0,composed:!0}))}_onEventClick(e){this.dispatchEvent(new CustomEvent("event-click",{detail:{event:e},bubbles:!0,composed:!0}))}}Ki.styles=[lt,o`
      :host { display: block; height: 100%; overflow: hidden; }

      .month-container {
        display: flex;
        flex-direction: column;
        height: 100%;
      }

      /* Headings and numbers in the rounded face (spec 11.2). */
      .month-name {
        font-family: var(--pv-font-heading, inherit);
        font-size: 1.125rem;
        font-weight: 800;
        font-variant-numeric: tabular-nums;
        color: var(--pv-text);
        padding: 0.75rem 1rem 0.5rem;
        text-align: left;
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
        font-family: var(--pv-font-heading, inherit);
        font-size: 0.8125rem;
        font-weight: 600;
        font-variant-numeric: tabular-nums;
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
        font-weight: 800;
      }

      .day-events {
        display: flex;
        flex-direction: column;
        gap: 1px;
      }

      /* Inside the cell, which is the day's whole target (spec 11.8). */
      .more-events {
        line-height: 1.2;
        font-size: 0.75rem;
        color: var(--pv-text-secondary);
        padding: 0 0.375rem;
        cursor: pointer;
        font-weight: 600;
      }

      .more-events:hover {
        color: var(--pv-accent-ink, var(--pv-accent));
      }

      /* ═══════════ RESPONSIVE BREAKPOINTS ═══════════ */

      /* xs: phones, compact day cells */
      @container pv-calendar (max-width: 479px) {
        .month-name { font-size: 0.9375rem; padding: 0.375rem 0.5rem; }
        .weekday-name { font-size: 0.5625rem; padding: 0.25rem 0; letter-spacing: 0.02em; }
        .day-number { font-size: 0.6875rem; padding: 0.0625rem 0.125rem; }
        .day-cell { padding: 0.125rem; }
        .day-cell.today .day-number { width: 20px; height: 20px; font-size: 0.625rem; }
        .more-events { font-size: 0.5rem; }
      }

      /* sm: large phones */
      @container pv-calendar (min-width: 480px) and (max-width: 767px) {
        .weekday-name { font-size: 0.625rem; }
        .day-number { font-size: 0.75rem; }
      }

      /* short height: tighter cells */
      @media (max-height: 500px) {
        .day-cell { padding: 0.125rem; }
        .day-number { font-size: 0.6875rem; }
      }

      /* lg: large screens (1024–1439px) */
      @container pv-calendar (min-width: 1024px) {
        .month-name { font-size: 1.25rem; }
        .weekday-name { font-size: 0.8125rem; padding: 0.625rem 0; }
        .day-number { font-size: 0.9375rem; padding: 0.25rem 0.375rem; }
        .day-cell.today .day-number { width: 30px; height: 30px; font-size: 0.875rem; }
        .more-events { font-size: 0.75rem; }
      }

      /* xl: wall displays (1440px+) */
      @container pv-calendar (min-width: 1440px) {
        .month-name { font-size: 1.375rem; }
        .weekday-name { font-size: 0.9375rem; padding: 0.75rem 0; }
        .day-number { font-size: 1.0625rem; padding: 0.375rem 0.5rem; }
        .day-cell.today .day-number { width: 36px; height: 36px; font-size: 1rem; }
        .day-cell { padding: 0.375rem; }
        .day-events { gap: 2px; }
        .more-events { font-size: 0.875rem; }
      }
    `],e([ue({attribute:!1})],Ki.prototype,"hass",void 0),e([ue({type:Array})],Ki.prototype,"events",void 0),e([ue({type:Array})],Ki.prototype,"calendars",void 0),e([ue({type:Object})],Ki.prototype,"currentDate",void 0),e([ue({type:Object})],Ki.prototype,"hiddenCalendars",void 0),e([ue({attribute:!1})],Ki.prototype,"firstDay",void 0),e([ue({attribute:!1})],Ki.prototype,"timeFormat",void 0),e([ue({type:Boolean})],Ki.prototype,"showStripes",void 0),e([ue({type:Number})],Ki.prototype,"tick",void 0),e([ue({type:String,reflect:!0})],Ki.prototype,"layout",void 0),e([me()],Ki.prototype,"_fit",void 0),ge("pv-view-month",Ki);const Gi=["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];class Ji extends de{constructor(){super(...arguments),this.events=[],this.calendars=[],this.currentDate=new Date,this.hiddenCalendars=new Set,this.timeFormat="12h",this.forecast=[],this.showStripes=!0,this.tick=0,this.layout="landscape",this._scroll=new Hi,this._daysLoaded=14}updated(e){super.updated(e);const t=e.get("currentDate");t&&Ee(t)!==Ee(this.currentDate)&&this.renderRoot.querySelector(".agenda-container")?.scrollTo({top:0,behavior:"instant"})}render(){const e=new Date(this.currentDate);e.setHours(0,0,0,0);const t=[];for(let s=0;s<this._daysLoaded;s++){const i=new Date(e);i.setDate(i.getDate()+s),t.push(i)}const s=Oe(Ae(Ne(this.events,this.hiddenCalendars),this.calendars)),i=Ti(this.forecast);if(t.every(e=>!s.get(Ee(e))?.length)){const e=new Date(this.tick?6e4*this.tick:Date.now()),s=function(e,t,s){const i=Fe(s,e);if(0===i)return{heading:"Nothing coming up",body:`Nothing is on the calendar for the next ${t} days.`};const a=new Date(e.getFullYear(),e.getMonth(),e.getDate()+t-1),n=`from ${Ns(e,s)} to ${Ns(a,s)}`;return Fe(s,a)<0?{heading:"Nothing on the calendar",body:`Nothing was on the calendar ${n}.`}:{heading:i>0?"Nothing coming up":"Nothing on the calendar",body:`Nothing is on the calendar ${n}.`}}(t[0],this._daysLoaded,new Date(e.getFullYear(),e.getMonth(),e.getDate()));return U`
        <div class="agenda-container" ${qi(this._scroll.attach)}>
          <div class="state">
            <div class="art" aria-hidden="true">🗓️</div>
            <h2>${s.heading}</h2>
            <p>${s.body}</p>
            <div class="buttons">
              <button class="pv-btn pv-btn-primary" type="button" @click=${()=>this._addEvent(t[0])}>New event</button>
              <button class="pv-btn pv-btn-secondary" type="button" @click=${this._loadMore}>Look further ahead</button>
            </div>
          </div>
        </div>
      `}return U`
      <div class="agenda-container" ${qi(this._scroll.attach)}>
        ${t.map((e,t)=>this._renderDayCard(e,s,i,0===t))}
        <button class="load-more" type="button" @click=${this._loadMore}>Show more days</button>
      </div>
    `}_renderDayCard(e,t,s,i){const a=Ee(e),n=t.get(a)||[],o=$e(e),r=s.get(a),l=new Date(this.tick?6e4*this.tick:Date.now()),d=function(e,t,s){const i=Fe(t,e);if(0===i)return"Today";if(1===i)return"Tomorrow";if(!s&&1!==e.getDate())return"";const a=ri[e.getMonth()];return e.getFullYear()===t.getFullYear()?a:`${a} ${e.getFullYear()}`}(e,new Date(l.getFullYear(),l.getMonth(),l.getDate()),i),c=[...n].sort(Pe);return U`
      <div class="day-card ${o?"day-card--today":""}">
        <div class="day-card-header">
          <div class="day-card-header-left">
            <span class="day-name ${o?"day-name--today":""}">
              ${Gi[e.getDay()]} ${e.getDate()}
            </span>
            ${d?U`<span class="day-relative">${d}</span>`:Y}
          </div>
          <div class="day-card-tools">
            ${r?U`
              <div class="day-weather">
                ${Ci(r.condition,20)}
                <span class="day-weather-temps">${Math.round(r.tempHigh)}°/${Math.round(r.tempLow)}°</span>
              </div>
            `:Y}
            <button class="add-btn" type="button" aria-label=${li(e,l)} title="New event"
              @click=${()=>this._addEvent(e)}>
              <ha-icon icon="mdi:plus"></ha-icon>
            </button>
          </div>
        </div>
        <div class="day-events">
          ${c.length>0?c.map(t=>U`
                <pv-event-chip
                  .hass=${this.hass}
                  .event=${t}
                  .calendars=${this.calendars}
                  .timeFormat=${this.timeFormat}
                  .showStripes=${this.showStripes}
                  .tick=${this.tick}
                  .badge=${o?qs(t,l):Hs(t,e)}
                  @event-click=${e=>{e.stopPropagation(),this._onEventClick(e.detail.event)}}
                ></pv-event-chip>
              `):U`<div class="empty-day">Nothing planned</div>`}
        </div>
      </div>
    `}_loadMore(){this._daysLoaded+=14}_addEvent(e){this.dispatchEvent(new CustomEvent("create-event",{detail:{date:e},bubbles:!0,composed:!0}))}_onEventClick(e){this.dispatchEvent(new CustomEvent("event-click",{detail:{event:e},bubbles:!0,composed:!0}))}}Ji.styles=[lt,mt,ct,vt,o`
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
        align-items: center;
        justify-content: space-between;
        min-height: 48px;
        padding: 0 0 0 0.75rem;
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

      /* Headings and numbers in the rounded face (spec 11.2). */
      .day-name {
        font-family: var(--pv-font-heading, inherit);
        font-size: 1.0625rem;
        font-weight: 800;
        font-variant-numeric: tabular-nums;
        color: var(--pv-text);
      }

      .day-name--today {
        color: var(--pv-accent-ink, var(--pv-accent));
      }

      .day-relative {
        font-size: 0.8125rem;
        color: var(--pv-text-secondary);
        font-weight: 600;
      }

      .day-card-tools {
        display: flex;
        align-items: center;
        gap: 2px;
      }

      /* New event on that day: a 48 px target (spec 11.8). */
      .add-btn {
        display: grid;
        place-items: center;
        width: 48px;
        height: 48px;
        padding: 0;
        border: none;
        border-radius: 50%;
        background: transparent;
        color: var(--pv-accent-ink, var(--pv-accent));
        cursor: pointer;
        --mdc-icon-size: 22px;
      }

      .add-btn:hover {
        background: var(--pv-event-hover, rgba(0, 0, 0, 0.04));
      }

      .add-btn:focus-visible {
        outline: 2px solid var(--pv-accent-ink, #5B5BD6);
        outline-offset: -4px;
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

      .day-events {
        display: flex;
        flex-direction: column;
        gap: 0.375rem;
        padding: 0.375rem 0.5rem 0.5rem;
      }

      .empty-day {
        color: var(--pv-text-muted);
        font-size: 0.875rem;
        padding: 0.75rem;
        text-align: center;
      }

      .load-more {
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        gap: 0.5rem;
        min-height: 48px;
        padding: 1rem;
        font-family: inherit;
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
      @container pv-calendar (max-width: 479px) {
        .day-card { margin: 0 0.5rem 0.5rem; }
        .day-name { font-size: 0.9375rem; }
      }

      /* MD+: constrain width */
      @container pv-calendar (min-width: 768px) {
        .agenda-container { max-width: 800px; margin: 0 auto; width: 100%; }
      }

      /* LG: large screens */
      @container pv-calendar (min-width: 1024px) {
        .day-name { font-size: 1.125rem; }
        .day-events { padding: 0.5rem 0.625rem 0.625rem; gap: 0.5rem; }
      }

      /* XL: wall displays, ~50% larger */
      @container pv-calendar (min-width: 1440px) {
        .agenda-container { max-width: 960px; }
        .day-name { font-size: 1.5rem; }
        .day-relative { font-size: 1rem; }
        .day-weather svg { width: 32px; height: 32px; }
        .day-weather-temps { font-size: 0.9375rem; }
        .day-events { padding: 0.75rem 1rem 1rem; gap: 0.625rem; }
        .load-more { font-size: 1.125rem; padding: 1.25rem; }
      }
    `],e([ue({attribute:!1})],Ji.prototype,"hass",void 0),e([ue({type:Array})],Ji.prototype,"events",void 0),e([ue({type:Array})],Ji.prototype,"calendars",void 0),e([ue({type:Object})],Ji.prototype,"currentDate",void 0),e([ue({type:Object})],Ji.prototype,"hiddenCalendars",void 0),e([ue({attribute:!1})],Ji.prototype,"timeFormat",void 0),e([ue({attribute:!1})],Ji.prototype,"forecast",void 0),e([ue({type:Boolean})],Ji.prototype,"showStripes",void 0),e([ue({type:Number})],Ji.prototype,"tick",void 0),e([ue({type:String,reflect:!0})],Ji.prototype,"layout",void 0),e([me()],Ji.prototype,"_daysLoaded",void 0),ge("pv-view-agenda",Ji);const Xi=o`
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
    font-weight: 800;
    text-align: left;
  }

  .heading:focus,
  h2[tabindex='-1']:focus {
    outline: none;
  }

  /* An editing sheet ends with Cancel, then its action (Add or Save). */
  .sheet-footer {
    display: flex;
    gap: 10px;
    margin-top: 16px;
  }

  .sheet-footer > .pv-btn {
    flex: 1 1 0;
  }

  /* Delete in place: a secondary button in red, set apart at the end. */
  .sheet-delete {
    display: flex;
    margin-top: 16px;
    padding-top: 16px;
    border-top: 1px solid var(--pv-border, #E7E7E3);
  }

  .sheet-delete > .pv-btn {
    flex: 1;
  }

  .body {
    margin: 0 0 16px;
    color: var(--pv-text-secondary, #6B7280);
    line-height: 1.5;
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
`;function Qi(e){return Math.max(0,e)}class Zi{constructor(e){this._host=e}get _rises(){return"landscape"!==this._host.layout}open(e,t){if(t.animate({opacity:[0,1]},{duration:200,easing:"ease-out"}),"reduced"===vi(this._host))return void e.animate({opacity:[0,1]},{duration:150,easing:"ease-out"});const s=mi(ci);e.animate(this._rises?{transform:["translateY(105%)","translateY(0)"]}:{transform:["scale(0.96)","scale(1)"],opacity:[0,1]},{duration:s.duration,easing:s.easing})}async close(e,t){const s="reduced"===vi(this._host),i=getComputedStyle(e).transform,a=i&&"none"!==i?i:"translateY(0)",n=s?e.animate({opacity:[1,0]},{duration:150,easing:"ease-in",fill:"forwards"}):e.animate(this._rises?{transform:[a,"translateY(105%)"]}:{transform:["scale(1)","scale(0.96)"],opacity:[1,0]},{duration:this._rises?240:160,easing:"cubic-bezier(.4,0,1,1)",fill:"forwards"});t.animate({opacity:[1,0]},{duration:s?150:200,easing:"ease-in",fill:"forwards"}),await n.finished.catch(()=>{})}springBack(e){const t=e.style.transform||"translateY(0)";e.style.transform="";const s="reduced"===vi(this._host)?{duration:120,easing:"ease-out"}:mi(hi);e.animate({transform:[t,"translateY(0)"]},{duration:s.duration,easing:s.easing})}attachDrag(e,t,s){let i=null,a=0;const n=t=>{if(this._rises){i={y:t.clientY,t:performance.now()},a=0;try{e.setPointerCapture(t.pointerId)}catch{}}},o=e=>{i&&(a=Qi(e.clientY-i.y),t.style.transform=`translateY(${a}px)`)},r=()=>{if(!i)return;const e=function(e,t){const s=Qi(e);return s>90||s/Math.max(1,t)>.6?"close":"settle"}(a,performance.now()-i.t);i=null,"close"!==e?this.springBack(t):s()};return e.addEventListener("pointerdown",n),e.addEventListener("pointermove",o),e.addEventListener("pointerup",r),e.addEventListener("pointercancel",r),()=>{e.removeEventListener("pointerdown",n),e.removeEventListener("pointermove",o),e.removeEventListener("pointerup",r),e.removeEventListener("pointercancel",r)}}}class ea{constructor(e,t={}){this._host=e,this._options=t,this._opened=!1,this._closing=!1,this._detach=null,this.onKeydown=e=>{if("Escape"!==e.key)this._host.shadowRoot&&Ds(this._host.shadowRoot,e);else{if(e.preventDefault(),this._options.escape?.())return;this.dismiss()}},this._motion=new Zi(e),e.addController(this)}get closing(){return this._closing}hostUpdated(){if(this._opened)return;const e=this._parts();e&&(this._opened=!0,this._motion.open(e.panel,e.backdrop),this._detach=this._motion.attachDrag(e.zone,e.panel,()=>this.dismiss()),(this._options.initialFocus?.()??e.panel.querySelector('h2[tabindex="-1"]')??e.panel.querySelector(".actions button"))?.focus())}hostDisconnected(){this._detach?.(),this._detach=null}dismiss(){if(!this._closing){if(this._options.mayDismiss&&!this._options.mayDismiss()){const e=this._parts();return void(e&&this._motion.springBack(e.panel))}this.close()}}async close(){if(this._closing)return;const e=this._parts();e&&(this._closing=!0,await this._motion.close(e.panel,e.backdrop),this._host.isConnected&&this._host.dispatchEvent(new CustomEvent("pv-sheet-close",{bubbles:!0,composed:!0})))}_parts(){const e=this._host.shadowRoot,t=e?.querySelector(".panel"),s=e?.querySelector(".backdrop"),i=e?.querySelector(".grab-zone");return t&&s&&i?{panel:t,backdrop:s,zone:i}:null}}function ta(e){let t=!1;return{down:e=>{t=e.target===e.currentTarget},click:()=>{const s=t;t=!1,s&&e()}}}class sa extends de{constructor(){super(...arguments),this._backdrop=ta(()=>this._choose("cancel")),this.heading="",this.body="",this.actions=[],this.layout="landscape",this._sheetMotion=new Zi(this),this._detachDrag=null,this._closing=!1}firstUpdated(){this.renderRoot.querySelector("#notice-heading")?.focus();const{panel:e,backdrop:t,zone:s}=this._parts();this._sheetMotion.open(e,t),this._detachDrag=this._sheetMotion.attachDrag(s,e,()=>this._choose("cancel"))}disconnectedCallback(){super.disconnectedCallback(),this._detachDrag?.(),this._detachDrag=null}_parts(){const e=this.renderRoot;return{panel:e.querySelector(".panel"),backdrop:e.querySelector(".backdrop"),zone:e.querySelector(".grab-zone")}}render(){return U`
      <div class="backdrop" @pointerdown=${this._backdrop.down} @click=${this._backdrop.click}></div>
      <div class="panel" role="dialog" aria-modal="true" aria-labelledby="notice-heading" @keydown=${this._onKey}>
        <div class="grab-zone" aria-hidden="true"><div class="grab"></div></div>
        <h2 class="heading" id="notice-heading" tabindex="-1">${this.heading}</h2>
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
    `}_onKey(e){if("Escape"===e.key)return e.preventDefault(),void this._choose("cancel");Ds(this.shadowRoot,e)}_choose(e){this._leave(()=>{this.dispatchEvent(new CustomEvent("pv-sheet-action",{detail:{id:e},bubbles:!0,composed:!0}))})}async _leave(e){if(this._closing)return;this._closing=!0;const{panel:t,backdrop:s}=this._parts();await this._sheetMotion.close(t,s),e(),requestAnimationFrame(()=>{if(this.isConnected){for(const e of[t,s])e.getAnimations().forEach(e=>e.cancel());t.style.transform="",this._closing=!1}})}}function ia(e){return e.shared_calendars??[]}sa.styles=[ct,Xi,o`
      .destructive {
        background: var(--pv-danger, #DC2626);
        border-color: transparent;
        color: #FFFFFF;
      }
    `],e([ue({type:String})],sa.prototype,"heading",void 0),e([ue({type:String})],sa.prototype,"body",void 0),e([ue({attribute:!1})],sa.prototype,"actions",void 0),e([ue({type:String,reflect:!0})],sa.prototype,"layout",void 0),ge("pv-notice-sheet",sa);class aa extends de{constructor(){super(...arguments),this._backdrop=ta(()=>this._sheet.dismiss()),this.event=null,this.timeFormat="12h",this.layout="landscape",this.calendars=[],this.leaving=!1,this.now=new Date,this._asking=!1,this._deleting=!1,this._error="",this._organizerEntityId=null,this._storeSubscription=new Yt(this,()=>this.store),this._sheet=new ea(this,{mayDismiss:()=>!this._deleting}),this._lastOrganizerUid="",this._onDeleteChoice=e=>{this._asking=!1;const t=e.detail.id;"delete"===t||"everyone"===t?(this.updateComplete.then(()=>this.renderRoot.querySelector("#event-title")?.focus()),this._delete("everyone"===t)):"remove"===t&&this.event?(this.renderRoot.querySelector(".danger")?.focus(),this.store.openEditDialog(this.event,{removeGuests:!0})):this.updateComplete.then(()=>this.renderRoot.querySelector(".danger")?.focus())},this._askDelete=async()=>{const e=this.event;e&&await this._mayChange(e)&&this.isConnected&&this.event&&(this._asking=!0)}}updated(e){if(super.updated(e),e.has("leaving")&&this.leaving&&this._sheet.close(),e.has("event")&&this.event){const e=ia(this.event),t=this.event.uid||"";e.length>1&&t&&t!==this._lastOrganizerUid?(this._lastOrganizerUid=t,this._organizerEntityId=null,this._fetchOrganizer(this.event.calendar_entity_id,t)):e.length<=1&&(this._organizerEntityId=null,this._lastOrganizerUid="")}}async _fetchOrganizer(e,t){this._organizerEntityId=await nt(this.hass,e,t)}render(){const e=this.event;if(!e)return Y;const t=ia(e),s=t.length?t:[{entity_id:e.calendar_entity_id,calendar_name:e.calendar_name,calendar_color:e.calendar_color}],i=function(e,t,s){const i=we(e.start),a=Ns(i,s);if(Te(e)){const t=Is(e);return{date:a,time:Ee(t)===Ee(i)?"All day":`All day, through ${Ns(t,s)}`}}const n=we(e.end),o=xe(e.start,t),r=xe(e.end,t);return{date:a,time:Ls(i,n)?`${o} – ${Rs(n)}, ${r}`:`${o} – ${r}`}}(e,this.timeFormat,this.now),a=qs(e,this.now),n=this.calendars.find(t=>t.entity_id===e.calendar_entity_id),o=Vs(n?.attributes),r=!!e.uid,l=Ys(e),d=this.gate?.allowed(l)??!0,c=function(e,t){const s=`Delete ${Us(e)}?`;return t.length>1?{heading:s,body:`It's on ${js(t.map(e=>`${e}'s`))} calendars.`,shared:!0}:{heading:s,body:"",shared:!1}}(e,t.length>1?t.map(e=>e.calendar_name):[]);return U`
      <div class="backdrop" @pointerdown=${this._backdrop.down} @click=${this._backdrop.click}></div>
      <div class="panel" role="dialog" aria-modal="true" aria-labelledby="event-title" @keydown=${this._sheet.onKeydown}>
        <div class="grab-zone" aria-hidden="true"><div class="grab"></div></div>
        <h2 class="heading" id="event-title" tabindex="-1">${e.summary?.trim()||"Untitled event"}</h2>
        <div class="people">
          ${s.map(e=>U`
            <span class="person" style="background: ${e.calendar_color}; color: ${We(e.calendar_color)}">${e.calendar_name}</span>
            ${s.length>1&&e.entity_id===this._organizerEntityId?U`<span class="pv-tag muted">Organizer</span>`:Y}
          `)}
        </div>
        ${a?U`<div class="status"><span class="badge ${a.tone}">${a.words}</span></div>`:Y}

        <div class="rows">
          <div class="row">
            <ha-icon icon="mdi:clock-outline"></ha-icon>
            <div><div>${i.date}</div><div class="sub">${i.time}</div></div>
          </div>
          ${e.location?U`
            <div class="row"><ha-icon icon="mdi:map-marker-outline"></ha-icon><div>${e.location}</div></div>
          `:Y}
          ${e.description?U`
            <div class="row"><ha-icon icon="mdi:text"></ha-icon><div class="notes">${e.description}</div></div>
          `:Y}
        </div>

        ${this._error?U`<p class="error" role="alert">${this._error}</p>`:Y}
        ${r&&(o.edit||o.delete)?d?Y:U`
          <p class="note">${this.gate?.note(l)}</p>
        `:U`
          <p class="note">This event can only be changed in its calendar's own app.</p>
        `}

        <div class="actions">
          ${d&&r&&o.edit?U`<button class="pv-btn pv-btn-secondary" type="button" @click=${this._edit}>Edit</button>`:Y}
          ${d&&r&&o.delete?U`
            <button class="pv-btn pv-btn-secondary danger apart" type="button" ?disabled=${this._deleting}
              @click=${this._askDelete}>${this._deleting?"Deleting…":"Delete event"}</button>
          `:Y}
          <button class="pv-btn pv-btn-secondary ${d&&r&&o.delete?"apart":""}" type="button" ?disabled=${this._deleting} @click=${()=>{this._sheet.close()}}>Done</button>
        </div>
      </div>
      ${this._asking?U`
        <pv-notice-sheet
          .layout=${this.layout}
          .heading=${c.heading}
          .body=${c.body}
          .actions=${this._deleteActions(c.shared,Us(e))}
          @pv-sheet-action=${this._onDeleteChoice}
        ></pv-notice-sheet>
      `:Y}
    `}_deleteActions(e,t){return e?[{id:"everyone",label:"Delete for everyone",kind:"destructive"},{id:"remove",label:"Remove someone",kind:"secondary"},{id:"cancel",label:"Cancel",kind:"secondary"}]:[{id:"delete",label:`Delete ${Us({summary:t})}`,kind:"destructive"},{id:"cancel",label:"Cancel",kind:"secondary"}]}async _edit(){const e=this.event;e&&await this._mayChange(e)&&this.isConnected&&this.event&&this.store.openEditDialog(this.event)}_mayChange(e){return this.gate?this.gate.ask(Ys(e),e.summary??""):Promise.resolve(!0)}async _delete(e){const t=this.event;if(!t?.uid)return;this._deleting=!0,this._error="";const s=ia(t);try{if(e&&s.length>1){const e=[];for(const i of s){const s=i.uid?{uid:i.uid,recurrence_id:i.recurrence_id}:{uid:t.uid,recurrence_id:t.recurrence_id};try{await it(this.hass,{entity_id:i.entity_id,...s})}catch(t){console.warn(`[PlanaVista] Couldn't delete from ${i.entity_id}:`,t),e.push(i.calendar_name)}}return await at(this.hass).catch(()=>{}),e.length?(this._error=Ws(t,e,!0),void(this._deleting=!1)):void this.store.selectEvent(null)}await this.store.doDeleteEvent(this.hass,{entity_id:t.calendar_entity_id,uid:t.uid,recurrence_id:t.recurrence_id})}catch(e){console.error("PlanaVista: Delete failed",e),this._error=Ws(t,[],!1),this._deleting=!1}}}function na(e){const t=[e.housenumber,e.street].filter(Boolean).join(" "),s=[];for(const i of[e.name,t,e.city,e.state,e.postcode,e.country]){const e=(i||"").trim();e&&!s.some(t=>t.toLowerCase()===e.toLowerCase())&&s.push(e)}return s.join(", ")}aa.styles=[_i,ct,Xi,vt,o`
      .heading {
        text-align: left;
        font-weight: 800;
        line-height: 1.25;
        overflow-wrap: anywhere;
      }

      .heading:focus {
        outline: none;
      }



      .people {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
        margin-top: 8px;
      }

      .person {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 4px 10px;
        border-radius: 9999px;
        font-size: 0.8125rem;
        font-weight: 700;
      }

      .status {
        margin-top: 10px;
      }

      .rows {
        display: flex;
        flex-direction: column;
        gap: 12px;
        margin: 16px 0 4px;
      }

      .row {
        display: flex;
        align-items: flex-start;
        gap: 12px;
        line-height: 1.4;
      }

      .row ha-icon {
        --mdc-icon-size: 20px;
        color: var(--pv-text-secondary, #5F6670);
        flex-shrink: 0;
        margin-top: 1px;
      }

      .row .sub {
        color: var(--pv-text-secondary, #5F6670);
        font-size: 0.875rem;
        font-variant-numeric: tabular-nums;
      }

      .row .notes {
        white-space: pre-wrap;
        overflow-wrap: anywhere;
      }

      .note {
        margin: 12px 0 0;
        color: var(--pv-text-secondary, #5F6670);
        font-size: 0.875rem;
      }

      .error {
        margin: 12px 0 0;
        padding: 10px 12px;
        border-radius: 12px;
        background: var(--pv-bad-bg, #FBE4E4);
        color: var(--pv-bad-ink, #A12828);
        font-size: 0.875rem;
        line-height: 1.4;
      }



    `],e([ue({attribute:!1})],aa.prototype,"hass",void 0),e([ue({attribute:!1})],aa.prototype,"event",void 0),e([ue({attribute:!1})],aa.prototype,"gate",void 0),e([ue({attribute:!1})],aa.prototype,"timeFormat",void 0),e([ue({type:String,reflect:!0})],aa.prototype,"layout",void 0),e([ue({attribute:!1})],aa.prototype,"calendars",void 0),e([ue({type:Boolean})],aa.prototype,"leaving",void 0),e([ue({attribute:!1})],aa.prototype,"now",void 0),e([ue({attribute:!1})],aa.prototype,"store",void 0),e([me()],aa.prototype,"_asking",void 0),e([me()],aa.prototype,"_deleting",void 0),e([me()],aa.prototype,"_error",void 0),e([me()],aa.prototype,"_organizerEntityId",void 0),ge("pv-event-popup",aa);class oa{constructor(e){this._opts=e,this._timer=null,this._abort=null,this._seq=0,this._fetch=e.fetchFn??((e,t)=>fetch(e,t))}input(e,t){this.cancel();const s=e.trim();if(!t||s.length<3)return this._opts.onResults([]),void this._opts.onLoading(!1);this._opts.onLoading(!0);const i=this._seq;this._timer=setTimeout(()=>{this._timer=null,this._run(s,i)},350)}cancel(){this._seq++,this._timer&&(clearTimeout(this._timer),this._timer=null),this._abort&&(this._abort.abort(),this._abort=null)}async _run(e,t){const s=new AbortController;this._abort=s;try{const a=await this._fetch((i=e,`https://photon.komoot.io/api/?q=${encodeURIComponent(i)}&limit=5&lang=en`),{signal:s.signal,credentials:"omit",referrerPolicy:"no-referrer"});if(!a.ok)throw new Error(`Photon HTTP ${a.status}`);const n=await a.json();t===this._seq&&this._opts.onResults(function(e){const t=e?.features;if(!Array.isArray(t))return[];const s=[];for(const e of t){const t=na(e?.properties||{});if(t&&!s.includes(t)&&s.push(t),5===s.length)break}return s}(n))}catch{t===this._seq&&this._opts.onResults([])}finally{t===this._seq&&(this._abort=null,this._opts.onLoading(!1))}var i}}function ra(e){return`${e.getFullYear()}-${String(e.getMonth()+1).padStart(2,"0")}-${String(e.getDate()).padStart(2,"0")}`}function la(e=15){const t=[];for(let s=0;s<1440;s+=e)t.push(`${String(Math.floor(s/60)).padStart(2,"0")}:${String(s%60).padStart(2,"0")}`);return t}function da(e,t){if(!/^\d{2}:\d{2}$/.test(e))return"";const[s,i]=e.split(":").map(Number);return"24h"===t?`${String(s).padStart(2,"0")}:${String(i).padStart(2,"0")}`:`${s%12||12}:${String(i).padStart(2,"0")} ${s>=12?"PM":"AM"}`}function ca(e){if(!/^\d{4}-\d{2}-\d{2}$/.test(e))return"";const[t,s,i]=e.split("-").map(Number);return new Date(t,s-1,i).toLocaleDateString("en-US",{weekday:"short",month:"long",day:"numeric",year:"numeric"})}const ha=["Su","Mo","Tu","We","Th","Fr","Sa"];function pa(e){const t=ra(new Date);return U`
    <div class="picker-header">
      <span class="picker-month-label">${new Date(e.year,e.month).toLocaleDateString("en-US",{month:"long",year:"numeric"})}</span>
      <div class="picker-nav">
        <button class="picker-nav-btn" type="button" aria-label="Previous month" @click=${e.onPrev}>
          <ha-icon icon="mdi:chevron-left"></ha-icon>
        </button>
        <button class="picker-nav-btn" type="button" aria-label="Next month" @click=${e.onNext}>
          <ha-icon icon="mdi:chevron-right"></ha-icon>
        </button>
      </div>
    </div>
    <div class="picker-weekdays">${ha.map(e=>U`<span class="picker-weekday">${e}</span>`)}</div>
    <div class="picker-days">
      ${function(e,t){const s=new Date(e,t,1),i=new Date(e,t,1-s.getDay());return Array.from({length:42},(e,t)=>new Date(i.getFullYear(),i.getMonth(),i.getDate()+t))}(e.year,e.month).map(s=>{const i=ra(s),a=!!e.min&&i<e.min||!!e.max&&i>e.max;return U`
          <button type="button"
            class="picker-day ${s.getMonth()!==e.month?"other-month":""} ${i===t?"today":""} ${i===e.selected?"selected":""}"
            aria-pressed=${i===e.selected?"true":"false"}
            aria-label=${s.toLocaleDateString("en-US",{weekday:"long",month:"long",day:"numeric"})}
            ?disabled=${a} @click=${()=>e.onPick(i)}><span>${s.getDate()}</span></button>
        `})}
    </div>
  `}function ua(e){return U`${e.slots.map(t=>U`
    <button type="button" class="time-slot ${t===e.selected?"selected":""}" aria-pressed=${t===e.selected?"true":"false"}
      @click=${()=>e.onPick(t)}>${da(t,e.format)}</button>
  `)}`}const ma=o`
  .picker-field {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    max-width: 100%;
    min-height: 48px;
    padding: 0 14px;
    box-sizing: border-box;
    border: 1px solid var(--pv-border, #E7E7E3);
    border-radius: var(--pv-radius-sm, 8px);
    background: var(--pv-card-bg, #FFFFFF);
    color: var(--pv-text, #1A1B1E);
    font: inherit;
    font-size: 0.9375rem;
    font-variant-numeric: tabular-nums;
    cursor: pointer;
  }

  .picker-field:hover:not(:disabled) {
    border-color: var(--pv-text-muted, #8E949C);
  }

  .picker-field:disabled {
    opacity: 0.45;
    cursor: default;
  }

  .picker-field ha-icon {
    --mdc-icon-size: 20px;
    color: var(--pv-text-muted, #8E949C);
  }

  .picker-field .placeholder {
    color: var(--pv-text-muted, #8E949C);
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
    width: 48px;
    height: 48px;
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
  }

  .picker-days {
    display: grid;
    grid-template-columns: repeat(7, 48px);
  }

  /* A 48 px target with the day drawn smaller inside (spec 11.8). */
  .picker-day {
    display: grid;
    place-items: center;
    width: 48px;
    height: 48px;
    padding: 0;
    border: none;
    background: transparent;
    color: var(--pv-text);
    font-family: var(--pv-font-heading, inherit);
    font-size: 0.875rem;
    font-variant-numeric: tabular-nums;
    cursor: pointer;
  }

  .picker-day span {
    display: grid;
    place-items: center;
    box-sizing: border-box;
    width: 36px;
    height: 36px;
    border-radius: 50%;
    transition: background 150ms;
  }

  .picker-day:hover span {
    background: var(--pv-event-hover, rgba(0,0,0,0.05));
  }

  .picker-day:focus-visible {
    outline: none;
  }

  .picker-day:focus-visible span {
    outline: 2px solid var(--pv-accent-ink, #5B5BD6);
    outline-offset: 1px;
  }

  .picker-day.other-month {
    color: var(--pv-text-muted);
    opacity: 0.4;
  }

  .picker-day.today span {
    border: 2px solid var(--pv-accent);
    font-weight: 700;
  }

  .picker-day.selected span {
    background: var(--pv-accent);
    color: var(--pv-accent-text, #fff);
    font-weight: 700;
  }

  .picker-day:disabled {
    opacity: 0.3;
    cursor: default;
  }

  .time-slot {
    display: block;
    width: 100%;
    min-height: 48px;
    padding: 0 16px;
    border: none;
    background: transparent;
    text-align: left;
    font-family: inherit;
    font-size: 0.9375rem;
    font-variant-numeric: tabular-nums;
    color: var(--pv-text);
    cursor: pointer;
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
`,va=[{id:"discard",label:"Discard changes",kind:"destructive"},{id:"keep",label:"Keep editing",kind:"secondary"}];class ga extends de{constructor(){super(...arguments),this._backdrop=ta(()=>this._sheet.dismiss()),this.calendars=[],this.open=!1,this.mode="create",this.prefill=null,this.timeFormat="12h",this.locationAutocomplete=!1,this.layout="landscape",this.leaving=!1,this._title="",this._selectedCalendars=new Set,this._gating=!1,this._originalCalendars=new Set,this._organizerEntityId="",this._date="",this._startTime="",this._endTime="",this._allDay=!1,this._spanDays=1,this._endDayOffset=0,this._description="",this._location="",this._showMore=!1,this._saving=!1,this._error="",this._removeGuestsHint=!1,this._askDiscard=!1,this._baseline="",this._datePickerOpen=!1,this._dateTarget="start",this._pickerMonth=0,this._pickerYear=0,this._activeTimePicker=null,this._locationSuggestions=[],this._locationLoading=!1,this._locationFocused=!1,this._locationSearch=new oa({onResults:e=>{this._locationSuggestions=e},onLoading:e=>{this._locationLoading=e}}),this._storeSubscription=new Yt(this,()=>this.store),this._sheet=new ea(this,{initialFocus:()=>this._titleInput??null,escape:()=>this._closePickers(),mayDismiss:()=>this._mayDismiss()}),this._onDiscardChoice=e=>{this._askDiscard=!1,"discard"===e.detail.id?this._sheet.close():this.updateComplete.then(()=>this._titleInput?.focus())},this._toggleAllDay=()=>{this._allDay=!this._allDay},this._cancel=()=>{this._saving||(this._datePickerOpen=!1,this._activeTimePicker=null,this._resetLocationSearch(),this._sheet.close())}}disconnectedCallback(){super.disconnectedCallback(),this._locationSearch.cancel()}updated(e){super.updated(e),e.has("leaving")&&this.leaving&&this._sheet.close(),e.has("locationAutocomplete")&&!this.locationAutocomplete&&this._resetLocationSearch(),e.has("open")&&this.open&&(this._initForm(),this._datePickerOpen=!1,this._baseline=this._signature())}_initForm(){if(this._error="",this._saving=!1,this._showMore=!1,this._resetLocationSearch(),this._locationFocused=!1,this._removeGuestsHint=!!this.prefill?._removeGuestsHint,this.prefill){this._title=this.prefill.summary||"",this._description=this.prefill.description||"",this._location=this.prefill.location||"";const e=this.prefill.shared_calendars;e&&e.length>0?this._selectedCalendars=new Set(e.map(e=>e.entity_id)):this.prefill.calendar_entity_id?this._selectedCalendars=new Set([this.prefill.calendar_entity_id]):this._selectedCalendars=new Set(Ut(this._offered().map(e=>e.entity_id))),this._originalCalendars=new Set(this._selectedCalendars),e&&e.length>1&&this.prefill.uid?(this._organizerEntityId="",this._fetchOrganizer(this.prefill.calendar_entity_id||"",this.prefill.uid)):this._organizerEntityId=this.prefill.calendar_entity_id||"",this.prefill.start?this._applyDates(function(e,t){const s=we(e);if(_e(e)){const e=t?we(t):s;return{date:Ee(s),allDay:!0,startTime:"09:00",endTime:"10:00",spanDays:Math.max(1,Fe(s,e)),endDayOffset:0}}const i=t?we(t):new Date(s.getTime()+36e5);return{date:Ee(s),allDay:!1,startTime:Tt(s),endTime:Tt(i),spanDays:1,endDayOffset:Math.max(0,Fe(s,i))}}(this.prefill.start,this.prefill.end)):this._setDefaults(),(this._description||this._location)&&(this._showMore=!0)}else this._setDefaults()}async _fetchOrganizer(e,t){const s=await nt(this.hass,e,t);s&&(this._organizerEntityId=s)}_offered(){return this.calendars.filter(e=>!1!==e.visible&&(Vs(e.attributes).create||this._originalCalendars.has(e.entity_id)))}_setDefaults(){this._title="",this._selectedCalendars=new Set(Ut(this._offered().map(e=>e.entity_id))),this._originalCalendars=new Set,this._organizerEntityId="",this._applyDates(function(e){const t=new Date(e);t.setMinutes(15*Math.ceil(t.getMinutes()/15),0,0);const s=new Date(t.getTime()+36e5);return{date:Ee(t),allDay:!1,startTime:Tt(t),endTime:Tt(s),spanDays:1,endDayOffset:Fe(t,s)}}(new Date)),this._description="",this._location=""}get _formDates(){return{date:this._date,allDay:this._allDay,startTime:this._startTime,endTime:this._endTime,spanDays:this._spanDays,endDayOffset:this._endDayOffset}}_applyDates(e){this._date=e.date,this._allDay=e.allDay,this._startTime=e.startTime,this._endTime=e.endTime,this._spanDays=e.spanDays,this._endDayOffset=e.endDayOffset;const[t,s]=e.date.split("-").map(Number);this._pickerYear=t,this._pickerMonth=s-1}_toDateStr(e){return`${e.getFullYear()}-${String(e.getMonth()+1).padStart(2,"0")}-${String(e.getDate()).padStart(2,"0")}`}_renderEndsHint(){const e=this._formDates;if(e.allDay||e.endDayOffset<=0)return Y;const[t,s,i]=Bt(e).split("-").map(Number),a=new Date(t,s-1,i).toLocaleDateString("en-US",{weekday:"short",month:"short",day:"numeric"});return U`<div class="ends-hint">Ends ${a}</div>`}_formatDateDisplay(){return this._date?ca(this._date):"Pick a date"}render(){if(!this.open)return Y;const e=this._offered(),t="edit"===this.mode,s=t?"Edit event":"New event";return U`
      <div class="backdrop" @pointerdown=${this._backdrop.down} @click=${this._backdrop.click}></div>
      <div class="panel" role="dialog" aria-modal="true" aria-labelledby="editor-title" @keydown=${this._sheet.onKeydown}>
        <div class="grab-zone" aria-hidden="true"><div class="grab"></div></div>
        <h2 class="heading" id="editor-title">${s}</h2>

        <div class="fields">
          <div class="form-grid">
            ${this._error?U`<div class="error-msg" role="alert">${this._error}</div>`:Y}

            <div class="form-field">
              <input
                id="title-input"
                class="pv-input"
                type="text"
                placeholder="Title"
                aria-label="Title"
                .value=${this._title}
                @input=${e=>this._title=e.target.value}
              />
            </div>

            <div class="form-field">
              <span class="pv-label" id="who-label">Who</span>
              ${this._removeGuestsHint?U`
                <div class="hint">
                  <ha-icon icon="mdi:information-outline"></ha-icon>
                  Tap someone to take them off this event.
                </div>
              `:Y}
              <div class="calendar-select pv-person-chips" role="group" aria-labelledby="who-label">
                ${e.map(e=>{const s=this._selectedCalendars.has(e.entity_id),i=e.entity_id===this._organizerEntityId,a=t&&i;return U`
                    <div class="who-wrap">
                      <button
                        type="button"
                        class="pv-person-chip ${a?"locked":""}"
                        aria-pressed=${s?"true":"false"}
                        style="--member: ${e.color}"
                        @click=${()=>this._toggleCalendar(e.entity_id)}
                      >
                        <span class="dot" aria-hidden="true"></span>
                        ${e.display_name}
                        ${i&&s?U`<span class="pv-tag muted">Organizer</span>`:Y}
                        ${a?U`<ha-icon class="lock-icon" icon="mdi:lock-outline"></ha-icon>`:Y}
                      </button>
                    </div>
                  `})}
              </div>
            </div>

            ${this._allDay?U`
              <div class="form-row">
                <div class="form-field">
                  <label class="pv-label" for="date-button">Starts</label>
                  ${this._renderDatePicker()}
                </div>
                <div class="form-field">
                  <label class="pv-label" for="end-date-button">Ends</label>
                  ${this._renderEndDatePicker()}
                </div>
              </div>
            `:U`
              <div class="form-field">
                <label class="pv-label" for="date-button">Date</label>
                ${this._renderDatePicker()}
                ${this._renderEndsHint()}
              </div>
            `}

            <div class="all-day-row" @click=${this._toggleAllDay}>
              <span class="all-day-label" id="all-day-label">All day</span>
              <div
                class="pv-toggle ${this._allDay?"active":""}"
                role="switch"
                tabindex="0"
                aria-checked="${this._allDay}"
                aria-labelledby="all-day-label"
                @keydown=${e=>{"Enter"!==e.key&&" "!==e.key||(e.preventDefault(),this._toggleAllDay())}}
              ></div>
            </div>

            ${this._allDay?Y:U`
              <div class="form-row">
                <div class="form-field">
                  <label class="pv-label" for="starts-button">Starts</label>
                  <button type="button" id="starts-button" class="time-display start-time-display"
                    aria-expanded=${"start"===this._activeTimePicker?"true":"false"}
                    @click=${()=>this._openTimePicker("start")}>
                    <ha-icon icon="mdi:clock-outline"></ha-icon>
                    ${this._formatTimeForDisplay(this._startTime)}
                  </button>
                </div>
                <div class="form-field">
                  <label class="pv-label" for="ends-button">Ends</label>
                  <button type="button" id="ends-button" class="time-display end-time-display"
                    aria-expanded=${"end"===this._activeTimePicker?"true":"false"}
                    @click=${()=>this._openTimePicker("end")}>
                    <ha-icon icon="mdi:clock-outline"></ha-icon>
                    ${this._formatTimeForDisplay(this._endTime)}
                  </button>
                </div>
              </div>
            `}

            ${this._showMore?U`
              <div class="form-field">
                <label class="pv-label" for="description-input">Description</label>
                <textarea
                  id="description-input"
                  class="pv-input"
                  rows="3"
                  placeholder="Add a description"
                  .value=${this._description}
                  @input=${e=>this._description=e.target.value}
                  style="resize: vertical; min-height: 80px;"
                ></textarea>
              </div>
              <div class="form-field">
                <label class="pv-label" for="location-input">Location</label>
                ${this._renderLocationField()}
              </div>
            `:U`
              <button class="show-more-btn" type="button" @click=${()=>this._showMore=!0}>
                <ha-icon icon="mdi:plus"></ha-icon>
                Add a description or location
              </button>
            `}
          </div>
        </div>

        <div class="footer">
          <button class="pv-btn pv-btn-secondary" type="button" ?disabled=${this._saving} @click=${this._cancel}>Cancel</button>
          <button class="pv-btn pv-btn-primary" type="button" ?disabled=${this._saving} @click=${this._save}>
            ${this._saving?"Saving…":t?"Save":"Add"}
          </button>
        </div>
      </div>

      ${this._renderLocationDropdown()}
      ${this._renderDatePickerDropdown()}
      ${this._renderTimePickerDropdown()}
      ${this._askDiscard?U`
        <pv-notice-sheet
          .layout=${this.layout}
          .heading=${t?"Discard your changes?":"Discard this event?"}
          .actions=${va}
          @pv-sheet-action=${this._onDiscardChoice}
        ></pv-notice-sheet>
      `:Y}
    `}_signature(){return function(e){return JSON.stringify([e.title.trim(),[...e.calendars].sort(),e.date,e.allDay,e.allDay?e.spanDays:[e.startTime,e.endTime,e.endDayOffset],e.description.trim(),e.location.trim()])}({title:this._title,calendars:this._selectedCalendars,date:this._date,allDay:this._allDay,startTime:this._startTime,endTime:this._endTime,spanDays:this._spanDays,endDayOffset:this._endDayOffset,description:this._description,location:this._location})}_closePickers(e=!0){if(!(this._datePickerOpen||null!==this._activeTimePicker||this._locationSuggestions.length>0))return!1;const t=this._datePickerOpen?"end"===this._dateTarget?this._endDateDisplay:this._dateDisplay:"start"===this._activeTimePicker?this._startTimeEl:"end"===this._activeTimePicker?this._endTimeEl:this._locationInput;return this._datePickerOpen=!1,this._activeTimePicker=null,this._resetLocationSearch(),e&&this._focusAfterUpdate(()=>t??null),!0}_showError(e){this._error=e,this.updateComplete.then(()=>this.renderRoot.querySelector(".error-msg")?.scrollIntoView({block:"nearest"}))}_focusAfterUpdate(e){this.updateComplete.then(()=>e()?.focus())}_mayDismiss(){return!(this._saving||this._signature()!==this._baseline&&(this._closePickers(!1),this._askDiscard=!0,1))}_renderDatePicker(){return U`
      <div class="date-picker-wrap">
        <button type="button" id="date-button" class="date-display"
          aria-expanded=${this._datePickerOpen&&"start"===this._dateTarget?"true":"false"} @click=${()=>this._toggleDatePicker("start")}>
          <ha-icon icon="mdi:calendar"></ha-icon>
          ${this._formatDateDisplay()}
        </button>
      </div>
    `}_renderEndDatePicker(){return U`
      <div class="date-picker-wrap">
        <button type="button" id="end-date-button" class="date-display end-date-display"
          aria-expanded=${this._datePickerOpen&&"end"===this._dateTarget?"true":"false"} @click=${()=>this._toggleDatePicker("end")}>
          <ha-icon icon="mdi:calendar"></ha-icon>
          ${this._date?ca(Bt(this._formDates)):"Pick a date"}
        </button>
      </div>
    `}_renderDatePickerDropdown(){if(!this._datePickerOpen)return Y;const e="end"===this._dateTarget,t=e?this._endDateDisplay:this._dateDisplay;if(!t)return Y;const s=t.getBoundingClientRect(),i=384,a=window.innerHeight-s.bottom-8<i&&s.top>i?s.top-i-4:s.bottom+4,n=Math.max(8,Math.min(a,window.innerHeight-i-8));return U`
      <div
        class="date-picker-dropdown"
        style="top: ${n}px; left: ${s.left}px;"
        @keydown=${this._sheet.onKeydown}
      >
        ${pa({year:this._pickerYear,month:this._pickerMonth,selected:e?Bt(this._formDates):this._date,min:e?this._date:void 0,onPick:e=>this._selectPickerDay(e),onPrev:()=>this._pickerPrevMonth(),onNext:()=>this._pickerNextMonth()})}
      </div>
    `}_toggleDatePicker(e="start"){this._activeTimePicker=null,this._datePickerOpen=!(this._datePickerOpen&&this._dateTarget===e),this._dateTarget=e;const t="end"===e?Bt(this._formDates):this._date;if(this._datePickerOpen&&t){const[e,s]=t.split("-").map(Number);this._pickerYear=e,this._pickerMonth=s-1}this._datePickerOpen&&this._focusAfterUpdate(()=>this.renderRoot.querySelector(".picker-day.selected")??this.renderRoot.querySelector(".picker-day.today")??this.renderRoot.querySelector(".picker-day"))}_pickerPrevMonth(){this._pickerMonth--,this._pickerMonth<0&&(this._pickerMonth=11,this._pickerYear--)}_pickerNextMonth(){this._pickerMonth++,this._pickerMonth>11&&(this._pickerMonth=0,this._pickerYear++)}_selectPickerDay(e){const t="end"===this._dateTarget;t?this._spanDays=function(e,t){const[s,i,a]=e.date.split("-").map(Number),[n,o,r]=t.split("-").map(Number),l=Fe(new Date(s,i-1,a),new Date(n,o-1,r));return{...e,spanDays:Math.max(1,l+1)}}(this._formDates,e).spanDays:this._date=function(e,t){return{...e,date:t}}(this._formDates,e).date,this._datePickerOpen=!1,this._focusAfterUpdate(()=>(t?this._endDateDisplay:this._dateDisplay)??null)}_formatTimeForDisplay(e){if(!e)return"Pick a time";const[t,s]=e.split(":").map(Number);if("24h"===this.timeFormat)return`${String(t).padStart(2,"0")}:${String(s).padStart(2,"0")}`;const i=t>=12?"PM":"AM";return`${t%12||12}:${String(s).padStart(2,"0")} ${i}`}_openTimePicker(e){this._datePickerOpen=!1,this._activeTimePicker=this._activeTimePicker===e?null:e,this._activeTimePicker&&this.updateComplete.then(()=>{const e=this.renderRoot.querySelector(".time-picker-dropdown"),t=e?.querySelector(".time-slot.selected");t&&e&&(e.scrollTop=t.offsetTop-e.clientHeight/2+t.clientHeight/2),(t??e?.querySelector(".time-slot"))?.focus({preventScroll:!0})})}_selectTime(e){if("start"===this._activeTimePicker){const t=function(e,t){const s={...e,startTime:t};if(0===e.endDayOffset&&e.endTime<=t){const[e,i]=t.split(":").map(Number);s.endTime=`${Mt((e+1)%24)}:${Mt(i)}`,s.endDayOffset=e+1>=24?1:0}else 1===s.endDayOffset&&s.endTime>t&&(s.endDayOffset=0);return s}(this._formDates,e);this._startTime=t.startTime,this._endTime=t.endTime,this._endDayOffset=t.endDayOffset}else{const t=function(e,t){const s={...e,endTime:t};return 1===e.endDayOffset&&t>e.startTime&&(s.endDayOffset=0),s}(this._formDates,e);this._endTime=t.endTime,this._endDayOffset=t.endDayOffset}const t="start"===this._activeTimePicker?this._startTimeEl:this._endTimeEl;this._activeTimePicker=null,this._focusAfterUpdate(()=>t??null)}_renderTimePickerDropdown(){if(!this._activeTimePicker)return Y;const e="start"===this._activeTimePicker?this._startTimeEl:this._endTimeEl;if(!e)return Y;const t=e.getBoundingClientRect(),s="start"===this._activeTimePicker?this._startTime:this._endTime,i=la(),a=window.innerHeight-t.bottom-8<280&&t.top>280?t.top-280-4:t.bottom+4;return U`
      <div
        class="time-picker-dropdown"
        style="top: ${a}px; left: ${t.left}px; width: ${t.width}px;"
        @keydown=${this._sheet.onKeydown}
      >
        ${ua({slots:i,selected:s,format:"24h"===this.timeFormat?"24h":"12h",onPick:e=>this._selectTime(e)})}
      </div>
    `}_resetLocationSearch(){this._locationSearch.cancel(),this._locationSuggestions=[],this._locationLoading=!1}_renderLocationField(){return U`
      <div class="location-wrap">
        <input
          id="location-input"
          class="pv-input location-input"
          type="text"
          placeholder=${this.locationAutocomplete?"Search for a place or address":"Add a location"}
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
        @keydown=${this._sheet.onKeydown}
      >
        ${this._locationLoading?U`
          <div class="location-loading">Searching…</div>
        `:Y}
        ${this._locationSuggestions.map(e=>U`
          <button type="button" class="location-suggestion"
            @mousedown=${e=>e.preventDefault()}
            @click=${()=>this._selectLocation(e)}>
            <ha-icon icon="mdi:map-marker"></ha-icon>
            <span>${e}</span>
          </button>
        `)}
        ${this._locationSuggestions.length>0?U`
          <div class="location-powered">Suggestions by Photon &middot; &copy; OpenStreetMap contributors</div>
        `:Y}
      </div>
    `}_onLocationInput(e){const t=e.target.value;this._location=t,this._locationSearch.input(t,this.locationAutocomplete)}_selectLocation(e){this._resetLocationSearch(),this._location=e,this._locationFocused=!1}_toggleCalendar(e){if("edit"===this.mode&&e===this._organizerEntityId)return;const t=new Set(this._selectedCalendars);t.has(e)?(t.delete(e),e===this._organizerEntityId&&(this._organizerEntityId=t.size>0?[...t][0]:"")):(t.add(e),this._organizerEntityId||(this._organizerEntityId=e)),this._selectedCalendars=t,this._removeGuestsHint=!1}async _editFallback(e,t,s){const i=this.prefill?.uid,a=this.prefill?.recurrence_id,n=this.prefill?.calendar_entity_id,o=this.prefill?.shared_calendars??[],r=e=>{const t=o.find(t=>t.entity_id===e);return t?.uid?{uid:t.uid,recurrence_id:t.recurrence_id}:{uid:i,recurrence_id:a}},l=[...t].filter(e=>!s.has(e)),d=[...s].filter(e=>!t.has(e)),c=[...t].filter(e=>s.has(e));if(n&&c.includes(n)&&i){const t=Lt(this.prefill,n,e);await this.store.doEditEvent(this.hass,t.deleteData,t.createData,t.restoreData)}else n&&d.includes(n)&&i&&await it(this.hass,{entity_id:n,uid:i,recurrence_id:a});for(const t of c){if(t===n)continue;const s=r(t);if(s.uid)try{await it(this.hass,{entity_id:t,uid:s.uid,recurrence_id:s.recurrence_id})}catch{}await tt(this.hass,{...e,entity_id:t})}for(const t of l)await tt(this.hass,{...e,entity_id:t});for(const e of d){if(e===n)continue;const t=r(e);if(t.uid)try{await it(this.hass,{entity_id:e,uid:t.uid,recurrence_id:t.recurrence_id})}catch{}}await at(this.hass),this.store.selectedEvent=null,this.store.closeDialog()}async _save(){if(!this._title.trim())return void this._showError("Give the event a title.");if(0===this._selectedCalendars.size)return void this._showError("Pick who it's for.");const e=function(e){if(!_e(e.date))return"Pick a date.";if(e.allDay)return null;if(!At.test(e.startTime)||!At.test(e.endTime))return"Pick when it starts and ends.";const t=Ot(e.date,e.startTime);return Ot(Pt(e.date,e.endDayOffset),e.endTime)>t?null:"Make it end after it starts."}(this._formDates);if(e)return void this._showError(e);if(this._gating)return;const t="edit"===this.mode?new Set([...this._originalCalendars,...this._selectedCalendars]):this._selectedCalendars;if(this.gate&&!this.gate.allowed([...t]))return void this._showError(this.gate.note([...t]));this._gating=!0;const s=!this.gate||await this.gate.ask([...t],this._title);if(this._gating=!1,s){this._error="",this._saving=!0;try{const e=function(e,t){const s={summary:t.summary.trim(),...Nt(e)},i=t.description?.trim(),a=t.location?.trim();return i&&(s.description=i),a&&(s.location=a),s}(this._formDates,{summary:this._title,description:this._description,location:this._location}),t=this._selectedCalendars,s=this._originalCalendars;if("edit"===this.mode){const i=this.prefill?.uid,a=s.size>1,n=this._organizerEntityId||this.prefill?.calendar_entity_id||"";if(a&&i&&n){const a=[...t];try{await async function(e,t){const s={type:"planavista/update_event",entity_id:t.entity_id,uid:t.uid};return void 0!==t.summary&&(s.summary=t.summary),void 0!==t.description&&(s.description=t.description),void 0!==t.location&&(s.location=t.location),t.start_date_time&&(s.start_date_time=t.start_date_time),t.end_date_time&&(s.end_date_time=t.end_date_time),t.start_date&&(s.start_date=t.start_date),t.end_date&&(s.end_date=t.end_date),t.attendee_entity_ids&&(s.attendee_entity_ids=t.attendee_entity_ids),e.callWS(s)}(this.hass,{entity_id:n,uid:i,summary:e.summary,description:e.description||"",location:e.location||"",start_date_time:e.start_date_time,end_date_time:e.end_date_time,start_date:e.start_date,end_date:e.end_date,attendee_entity_ids:a})}catch(i){console.warn("[PlanaVista] update_event WS failed, falling back to delete+recreate:",i),await this._editFallback(e,t,s)}const o=[...t,...s],r=this.hass;this.store.selectedEvent=null,this.store.closeDialog(),setTimeout(async()=>{try{const e=[...new Set(o)];for(const t of e)await r.callService("homeassistant","update_entity",{entity_id:t});await at(r)}catch{}},3e3)}else if(t.size>1&&i){const s=this.prefill,i=s.calendar_entity_id,a=n||[...t][0],o=[...t].filter(e=>e!==a);try{await jt({remove:()=>it(this.hass,Rt(s,i)),create:()=>st(this.hass,{...e,entity_id:a,attendee_entity_ids:o}),restore:()=>tt(this.hass,It(s,i))})}catch(e){throw await at(this.hass).catch(()=>{}),e}const r=[...t],l=this.hass;this.store.selectedEvent=null,this.store.closeDialog(),setTimeout(async()=>{try{for(const e of r)await l.callService("homeassistant","update_entity",{entity_id:e});await at(l)}catch{}},3e3)}else{const t=this.prefill?.calendar_entity_id||"",s=Lt(this.prefill,t,e);await this.store.doEditEvent(this.hass,s.deleteData,s.createData,s.restoreData)}}else{const s=[...t];if(s.length>1){const i=this._organizerEntityId||s[0],a=s.filter(e=>e!==i);await st(this.hass,{...e,entity_id:i,attendee_entity_ids:a}),this.store.closeDialog();const n=[...t],o=this.hass;setTimeout(async()=>{try{for(const e of n)await o.callService("homeassistant","update_entity",{entity_id:e});await at(o)}catch{}},3e3)}else{const t={...e,entity_id:s[0]};await this.store.doCreateEvent(this.hass,t)}}}catch(e){console.error("PlanaVista: Saving the event failed",e),this._showError(e instanceof qt?e.message:(i=this._title,`Couldn't ${"edit"===this.mode?"save":"add"} ${Us({summary:i})}. Check that Home Assistant is reachable, then try again.`)),this._saving=!1}var i}}}ga.styles=[ma,xi,_i,lt,ct,pt,Xi,mt,o`
      .panel {
        display: flex;
        flex-direction: column;
        overflow: hidden;
        padding-bottom: 0;
      }

      :host([layout='landscape']) .panel {
        width: min(560px, calc(100vw - 32px));
        max-height: 88vh;
        padding-bottom: 0;
      }

      .heading {
        text-align: left;
        font-weight: 800;
        margin: 0 0 14px;
      }

      /* The form scrolls between the heading and the footer. */
      .fields {
        flex: 1 1 auto;
        min-height: 0;
        overflow-y: auto;
        padding: 2px 2px 16px;
      }

      .footer {
        display: flex;
        gap: 10px;
        padding: 12px 0 calc(16px + env(safe-area-inset-bottom, 0px));
        border-top: 1px solid var(--pv-border-subtle, #F1F1EE);
      }

      .footer .pv-btn {
        flex: 1 1 0;
        min-height: 48px;
      }

      :host([layout='landscape']) .footer {
        padding-bottom: 20px;
      }

      :host([layout='phone']) .form-row {
        flex-direction: column;
        align-items: stretch;
        gap: 0.5rem;
      }

      .hint {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.5rem 0.75rem;
        margin-bottom: 0.5rem;
        border-radius: 12px;
        background: var(--pv-accent-tint, #EEEEFC);
        color: var(--pv-accent-tint-ink, #3B3BB0);
        font-size: 0.875rem;
      }

      .hint ha-icon {
        --mdc-icon-size: 16px;
        flex-shrink: 0;
      }

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
        min-height: 48px;
        cursor: pointer;
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





      .who-wrap {
        position: relative;
        display: inline-flex;
      }

      .pv-person-chip.locked {
        cursor: default;
        opacity: 0.9;
      }

      .cal-option .lock-icon {
        --mdc-icon-size: 12px;
        margin-left: 2px;
        opacity: 0.7;
      }


      .show-more-btn {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        align-self: flex-start;
        min-height: 48px;
        background: none;
        border: none;
        color: var(--pv-accent-ink, var(--pv-accent));
        font-size: 0.9375rem;
        font-weight: 600;
        cursor: pointer;
        padding: 0;
        font-family: inherit;
        text-align: left;
      }

      .show-more-btn ha-icon {
        --mdc-icon-size: 18px;
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
        padding: 10px 12px;
        border-radius: 12px;
        background: var(--pv-bad-bg, #FBE4E4);
        color: var(--pv-bad-ink, #A12828);
        font-size: 0.875rem;
        line-height: 1.4;
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
        text-align: left;
        cursor: pointer;
        min-height: 48px;
        box-sizing: border-box;
        transition: border-color 200ms ease;
      }

      .date-display:focus-visible,
      .time-display:focus-visible {
        outline: 2px solid var(--pv-accent-ink, #5B5BD6);
        outline-offset: 2px;
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
        padding: 8px;
        width: max-content;
        animation: pv-fadeIn 150ms ease;
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
        width: 100%;
        min-height: 48px;
        padding: 12px;
        border: none;
        border-bottom: 1px solid var(--pv-border-subtle, rgba(0,0,0,0.04));
        background: transparent;
        text-align: left;
        cursor: pointer;
        font-family: inherit;
        font-size: 0.875rem;
        color: var(--pv-text);
        line-height: 1.35;
        transition: background 120ms ease;
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
    `],e([ue({attribute:!1})],ga.prototype,"hass",void 0),e([ue({type:Array})],ga.prototype,"calendars",void 0),e([ue({attribute:!1})],ga.prototype,"gate",void 0),e([ue({type:Boolean})],ga.prototype,"open",void 0),e([ue({type:String})],ga.prototype,"mode",void 0),e([ue({type:Object})],ga.prototype,"prefill",void 0),e([ue({attribute:!1})],ga.prototype,"timeFormat",void 0),e([ue({attribute:!1})],ga.prototype,"locationAutocomplete",void 0),e([ue({type:String,reflect:!0})],ga.prototype,"layout",void 0),e([ue({type:Boolean})],ga.prototype,"leaving",void 0),e([me()],ga.prototype,"_title",void 0),e([me()],ga.prototype,"_selectedCalendars",void 0),e([me()],ga.prototype,"_originalCalendars",void 0),e([me()],ga.prototype,"_organizerEntityId",void 0),e([me()],ga.prototype,"_date",void 0),e([me()],ga.prototype,"_startTime",void 0),e([me()],ga.prototype,"_endTime",void 0),e([me()],ga.prototype,"_allDay",void 0),e([me()],ga.prototype,"_spanDays",void 0),e([me()],ga.prototype,"_endDayOffset",void 0),e([me()],ga.prototype,"_description",void 0),e([me()],ga.prototype,"_location",void 0),e([me()],ga.prototype,"_showMore",void 0),e([me()],ga.prototype,"_saving",void 0),e([me()],ga.prototype,"_error",void 0),e([me()],ga.prototype,"_removeGuestsHint",void 0),e([me()],ga.prototype,"_askDiscard",void 0),e([me()],ga.prototype,"_datePickerOpen",void 0),e([me()],ga.prototype,"_dateTarget",void 0),e([me()],ga.prototype,"_pickerMonth",void 0),e([me()],ga.prototype,"_pickerYear",void 0),e([me()],ga.prototype,"_activeTimePicker",void 0),e([me()],ga.prototype,"_locationSuggestions",void 0),e([me()],ga.prototype,"_locationLoading",void 0),e([me()],ga.prototype,"_locationFocused",void 0),e([ue({attribute:!1})],ga.prototype,"store",void 0),e([ve("#title-input")],ga.prototype,"_titleInput",void 0),e([ve(".location-input")],ga.prototype,"_locationInput",void 0),e([ve(".date-display")],ga.prototype,"_dateDisplay",void 0),e([ve(".end-date-display")],ga.prototype,"_endDateDisplay",void 0),e([ve(".start-time-display")],ga.prototype,"_startTimeEl",void 0),e([ve(".end-time-display")],ga.prototype,"_endTimeEl",void 0),ge("pv-event-create-dialog",ga);const ba="sensor.planavista_config",ya=[];class fa extends de{constructor(){var e;super(...arguments),this.data=null,this.mode="light",this.shape={},this.forecast=[],this.layout="landscape",this.services={},this.revision=0,this.household=null,this.session=null,this._tick=Math.floor(Date.now()/6e4),this._filterOpen=!1,this._refreshing=!1,this._pv=new Vt(this),this._progressOf=e=>this.services?.chores?.memberProgress?.(e)??null,this._overlayOpen=!1,this._drawn=null,this._movedAt=0,this._details=Fs,this._detailsMount=0,this._detailsOpener=null,this._editor=Fs,this._editorMount=0,this._editorOpener=null,this._editorWant=null,this._tickTimer=null,this._touchStart=null,this._filterCloseHandler=e=>this._onFilterClickOutside(e),this._onEditorClosed=()=>{this._editor=Fs,this._pv.store.dialogOpen&&this._pv.store.closeDialog(),this.requestUpdate();const e=this._editorOpener;this._editorOpener=null,this._details.value&&this._details.leaving||requestAnimationFrame(()=>{e?.isConnected&&e.focus()})},this._now=Dt(e=>new Date(6e4*e)),this._onDetailsClosed=()=>{this._details=Fs,this._pv.store.selectedEvent&&this._pv.store.selectEvent(null),this.requestUpdate();const e=this._detailsOpener;this._detailsOpener=null,requestAnimationFrame(()=>{e?.isConnected&&e.focus()})},this._derive=Dt((e,t,s,i,a)=>function(e,t,s){const i=Kt(e,t),a=e?.events||[],n=new Map;for(const e of a){const t=Se(e);n.has(t)||n.set(t,[]);const s=n.get(t),a=e.calendar_entity_id;if(!s.some(e=>e.entity_id===a)){const t=i.find(e=>e.entity_id===a);s.push({entity_id:a,calendar_name:e.calendar_name||t?.display_name||"",calendar_color:e.calendar_color||t?.color||"",person_entity:t?.person_entity||""})}}return{calendars:i,visibleEvents:Ne(a,s),sharedEventMap:n}}(Es(e,i,a),t,s)),this._openCalendarsPage=()=>{this.dispatchEvent(new CustomEvent(ei,{detail:{page:"calendars"},bubbles:!0,composed:!0}))},this._gate=(e=()=>({view:this.household,session:this.session,pinGate:this.pinGate,rows:this.data?.calendars??[]}),{allowed(t){const{view:s,session:i,rows:a}=e();return"no"!==Ps(s,i,Gt(t,a))},async ask(t,s){const{view:i,session:a,pinGate:n,rows:o}=e(),r=Gt(t,o),l=Ps(i,a,r);if("yes"===l)return!0;if("no"===l||!n)return!1;const{heading:d,reason:c}=function(e){const t=e.trim()||"this event";return{heading:`Who's changing ${t}?`,reason:`To change ${t}`}}(s);return n.ask(function(e,t){if(!e)return[];const[s]=t;return 1===t.length&&s?zs(e,s):as(e.members)}(i,r),d,c)},note(t){const{view:s,rows:i}=e(),a=Gt(t,i),n=1===a.length&&a[0]?[s?.members.find(e=>e.id===a[0])?.name??""]:[];return 1===(o=n.filter(Boolean)).length?`Only ${o[0]} or a parent can change this event.`:"Only a parent can change this event.";var o}}),this._refreshCalendars=async()=>{if(!this._refreshing){this._refreshing=!0;try{for(const e of this.data?.calendars||[])e.entity_id&&await this.hass.callService("homeassistant","update_entity",{entity_id:e.entity_id});await this.hass.callService("homeassistant","update_entity",{entity_id:this.cardConfig?.entity||ba})}catch{}setTimeout(()=>{this._refreshing=!1},800)}}}connectedCallback(){super.connectedCallback(),this._tick=Math.floor(Date.now()/6e4),this._scheduleTick()}disconnectedCallback(){super.disconnectedCallback(),this._tickTimer&&(clearTimeout(this._tickTimer),this._tickTimer=null),document.removeEventListener("click",this._filterCloseHandler),this._overlayOpen&&(this._overlayOpen=!1,this._fireOverlay(!1))}updated(e){super.updated(e),this._pv.store;const t=!(!this._details.value&&!this._editor.value);t!==this._overlayOpen&&(this._overlayOpen=t,this._fireOverlay(t)),this._playViewChange()}_navigate(e){this._movedAt=performance.now(),this._pv.store.navigateDate(e)}_playViewChange(){const e=this._pv.store,t=new Date(e.currentDate);t.setHours(0,0,0,0);const s={view:e.currentView,at:t.getTime()};let i=gi(this._drawn,s);this._drawn=s,("forward"===i||"back"===i)&&performance.now()-this._movedAt>1e3&&(i="none");const a=bi(i,vi(this),ui());a&&this.renderRoot.querySelector(".pvc-body")?.animate(a.keyframes,a.options)}_fireOverlay(e){this.dispatchEvent(new CustomEvent("pv-overlay-change",{detail:{open:e},bubbles:!0,composed:!0}))}_scheduleTick(){this._tickTimer&&clearTimeout(this._tickTimer),this._tickTimer=setTimeout(()=>{this._tick=Math.floor(Date.now()/6e4),this._scheduleTick()},6e4-Date.now()%6e4+50)}willUpdate(e){e.has("view")&&this.view&&this._pv.store.setView(this.view);const t=Cs(this._details,this._pv.store.selectedEvent);!t.value||this._details.value&&!this._details.leaving||(this._detailsMount+=1,this._detailsOpener=Ss()),this._details=t;const s=Cs(this._editor,this._wantedEditor());!s.value||this._editor.value&&!this._editor.leaving||(this._editorMount+=1,this._editorOpener=Ss()),this._editor=s}_wantedEditor(){const e=this._pv.store;if(!e.dialogOpen)return this._editorWant=null;const t=this._editorWant;return t&&t.mode===e.dialogOpen&&t.prefill===e.createPrefill?t:this._editorWant={mode:e.dialogOpen,prefill:e.createPrefill}}_derived(){return this._derive(this.data,this.cardConfig,this._pv.store.hiddenCalendars,this.mode,this.household?.members??ya)}render(){if(!this.hass||!this.display)return Y;const{calendars:e,visibleEvents:t}=this._derived(),s=this._pv.store,i=this.display,a=s.hiddenCalendars,n=this._running(),o=function({sensorState:e,running:t,calendars:s,configured:i,hidden:a}){return void 0===e||"unavailable"===e||"unknown"===e?t?"unavailable":"loading":0===s.length?t?(i??0)>0?"unavailable":"no-calendars":"loading":s.every(e=>a.has(e.entity_id))?"all-hidden":"ready"}({sensorState:this.hass.states[this.cardConfig?.entity||ba]?.state,running:n,calendars:e,configured:this.data?.calendars_configured,hidden:a}),r="ready"===o?function({connected:e,running:t=!0,calendars:s,hidden:i}){const a=[];e||a.push({kind:"offline",text:"Can't reach Home Assistant. These are the last events it sent, and they update when it's back."});const n=t?s.filter(e=>!i.has(e.entity_id)&&("unavailable"===e.state||!0===e.fetch_failed)):[];var o;return n.length&&a.push({kind:"unreachable",text:(o=n.map(si),1===o.length?`${ii(o[0])} can't be reached, so its events may be missing. Check its integration in Settings, Devices and services.`:`${ii(js(o))} can't be reached, so their events may be missing. Check their integrations in Settings, Devices and services.`)}),a}({connected:!1!==this.hass.connected,running:n,calendars:e,hidden:a}):[];return U`
      <div class="pvc-frame">
      ${"no-calendars"===o||"unavailable"===o?Y:this._renderToolbar(e)}
      ${r.map(e=>U`
        <div class="banner" role="status">
          <span class="text">${e.text}</span>
          ${"unreachable"===e.kind?U`
            <button class="pv-btn pv-btn-secondary" type="button" ?disabled=${this._refreshing} @click=${this._refreshCalendars}>Try again</button>
          `:Y}
        </div>
      `)}
      <div class="pvc-body"
        @touchstart=${this._onTouchStart}
        @touchend=${this._onTouchEnd}
        @touchcancel=${this._onTouchCancel}
        @event-click=${this._onEventClick}
        @day-click=${this._onDayClick}
        @create-event=${this._onCreateEvent}
      >
        ${"ready"===o?this._renderView(s.currentView,t,e,i):this._renderScreen(o,e)}
      </div>
      </div><!-- .pvc-frame -->

      ${this._details.value?Ct(this._detailsMount,U`
        <pv-event-popup
          layout=${this.layout}
          .store=${s}
          .hass=${this.hass}
          .event=${this._details.value}
          .leaving=${this._details.leaving}
          .calendars=${e}
          .gate=${this._gate}
          .now=${this._now(this._tick)}
          .timeFormat=${i?.time_format||"12h"}
          @pv-sheet-close=${this._onDetailsClosed}
        ></pv-event-popup>
      `):Y}

      ${this._editor.value?Ct(this._editorMount,U`
        <pv-event-create-dialog
          layout=${this.layout}
          .store=${s}
          .hass=${this.hass}
          .calendars=${this._mine(e)}
          .gate=${this._gate}
          .open=${!0}
          .mode=${this._editor.value.mode}
          .prefill=${this._editor.value.prefill}
          .leaving=${this._editor.leaving}
          .timeFormat=${i?.time_format||"12h"}
          .locationAutocomplete=${!0===i.location_autocomplete}
          @pv-sheet-close=${this._onEditorClosed}
        ></pv-event-create-dialog>
      `):Y}
    `}_running(){const e=this.hass.config?.state;return void 0===e||"RUNNING"===e}_renderScreen(e,t){if("loading"===e)return function(e,t,s){const i=Math.max(1,Math.min(4,s||3));switch(e){case"week":{const e="phone"===t?3:"portrait"===t?6:8;return U`
        <div class="skeleton skeleton-week" aria-busy="true" aria-label="Loading the calendar">
          ${Array.from({length:e},(e,t)=>U`
            <div class="bone-card">
              <div class="bone" style="width: 45%; height: 16px"></div>
              ${Array.from({length:ni[t%ni.length]},()=>U`<div class="bone" style="height: 44px"></div>`)}
            </div>
          `)}
        </div>
      `}case"month":return U`
        <div class="skeleton skeleton-month" aria-busy="true" aria-label="Loading the calendar">
          ${Array.from({length:35},(e,t)=>U`
            <div class="bone-cell">
              <div class="bone round" style="width: 18px; height: 18px"></div>
              ${Array.from({length:Math.min(2,ni[t%ni.length])},()=>U`<div class="bone" style="height: 14px"></div>`)}
            </div>
          `)}
        </div>
      `;case"agenda":return U`
        <div class="skeleton skeleton-agenda" aria-busy="true" aria-label="Loading the calendar">
          ${[2,1,3,1].map(e=>U`
            <div class="bone-card">
              <div class="bone" style="width: 30%; height: 18px"></div>
              ${Array.from({length:e},()=>U`<div class="bone" style="height: 48px"></div>`)}
            </div>
          `)}
        </div>
      `;default:return U`
        <div class="skeleton skeleton-day" aria-busy="true" aria-label="Loading the calendar">
          <div class="bone-heads">
            ${Array.from({length:i},()=>U`
              <div class="bone-head"><div class="bone round" style="width: 48px; height: 48px"></div><div class="bone" style="width: 56px; height: 12px"></div></div>
            `)}
          </div>
          <div class="bone-lanes">
            ${Array.from({length:i},(e,t)=>U`
              <div class="bone-lane">
                ${ai[t%ai.length].map(([e,t])=>U`
                  <div class="bone" style="top: ${e}%; height: ${t}%"></div>
                `)}
              </div>
            `)}
          </div>
        </div>
      `}}(this._pv.store.currentView,this.layout,t.length);if("unavailable"===e)return U`
        <div class="state" role="alert">
          <div class="art" aria-hidden="true">📡</div>
          <h2>Can't load the calendar</h2>
          <p>PlanaVista couldn't read the calendars just now, and tries again every minute. If this stays, check Settings, System, Logs for PlanaVista.</p>
          <div class="buttons">
            <button class="pv-btn pv-btn-secondary" type="button" ?disabled=${this._refreshing} @click=${this._refreshCalendars}>Try again</button>
          </div>
        </div>
      `;if("no-calendars"===e){const e="no"!==Ts(this.household,this.session);return U`
        <div class="state">
          <div class="art" aria-hidden="true">📅</div>
          <h2>No calendars yet</h2>
          <p>${e?"Add your family's calendars, and say whose each one is.":"A parent can add calendars in Settings."}</p>
          ${e?U`
            <div class="buttons">
              <button class="pv-btn pv-btn-primary" type="button" @click=${this._openCalendarsPage}>Add calendars</button>
            </div>
          `:Y}
        </div>
      `}return U`
      <div class="state">
        <div class="art" aria-hidden="true">📅</div>
        <h2>Every calendar is hidden</h2>
        <p>Show them again to see what's coming up.</p>
        <div class="buttons">
          <button class="pv-btn pv-btn-primary" type="button" @click=${()=>this._pv.store.showAllCalendars()}>Show all</button>
        </div>
      </div>
    `}_renderToolbar(e){const t=e.filter(e=>this._pv.store.hiddenCalendars.has(e.entity_id)).length,s=function(e){switch(e){case"day":return{prev:"Previous day",next:"Next day"};case"month":return{prev:"Previous month",next:"Next month"};default:return{prev:"Previous week",next:"Next week"}}}(this._pv.store.currentView),i=(a=this._pv.store.currentView,n=this._pv.store.currentDate,o=new Date,r=this.display?.first_day||"sunday","week"===a?Ee(ke(n,r))===Ee(ke(o,r)):"month"===a?n.getFullYear()===o.getFullYear()&&n.getMonth()===o.getMonth():Ee(n)===Ee(o));var a,n,o,r;return U`
      <div class="pvc-toolbar">
        <div class="pvc-filter-wrap">
          <button
            class="pvc-filter-btn ${t>0?"has-hidden":""}"
            type="button"
            aria-expanded=${this._filterOpen?"true":"false"}
            aria-label=${t>0?`Calendars, ${e.length-t} of ${e.length} shown`:"Calendars"}
            @click=${this._toggleFilterDropdown}
          >
            <ha-icon icon="mdi:filter-variant" style="--mdc-icon-size: 20px"></ha-icon>
            Calendars
            ${t>0?U`<span class="pvc-filter-badge">${e.length-t}/${e.length}</span>`:Y}
          </button>

          ${this._filterOpen?U`
            <div class="pvc-filter-panel">
              ${e.map(e=>{const t=!this._pv.store.hiddenCalendars.has(e.entity_id),s=e.person_entity?ot(this.hass,e.person_entity):null,i=e.display_name||(e.person_entity?rt(this.hass,e.person_entity):e.entity_id),a=(i||"?")[0].toUpperCase();return U`
                  <div
                    class="pvc-filter-item ${t?"active":""}"
                    style="--item-color: ${e.color}; --item-ink: ${We(e.color)}"
                    role="checkbox"
                    tabindex="0"
                    aria-checked=${t?"true":"false"}
                    @click=${()=>this._pv.store.toggleCalendar(e.entity_id)}
                    @keydown=${t=>{"Enter"!==t.key&&" "!==t.key||(t.preventDefault(),this._pv.store.toggleCalendar(e.entity_id))}}
                  >
                    <div class="pvc-filter-check">
                      ${t?U`<span class="pvc-filter-check-icon">✓</span>`:Y}
                    </div>
                    <div
                      class="pvc-filter-avatar"
                      style="${s?`background-image: url(${s}); background-color: ${e.color}`:`background: ${e.color}`}"
                    >${s?"":a}</div>
                    <span class="pvc-filter-name">${i}</span>
                  </div>
                `})}
            </div>
          `:Y}
        </div>

        <!-- Mobile inline calendar chips (shown on xs/sm via CSS) -->
        <div class="pvc-cal-strip">
          ${e.map(e=>{const t=!this._pv.store.hiddenCalendars.has(e.entity_id),s=e.person_entity?ot(this.hass,e.person_entity):null,i=e.display_name||(e.person_entity?rt(this.hass,e.person_entity):e.entity_id),a=(i||"?")[0].toUpperCase();return U`
              <button
                class="pvc-cal-chip ${t?"active":""}"
                type="button"
                aria-pressed=${t?"true":"false"}
                style="--chip-color: ${e.color}; --chip-ink: ${We(e.color)}"
                @click=${()=>this._pv.store.toggleCalendar(e.entity_id)}
              >
                <div
                  class="pvc-cal-chip-avatar"
                  style="${s?`background-image: url(${s}); background-color: ${e.color}`:`background: ${e.color}`}"
                >${s?"":a}</div>
                <span class="pvc-cal-chip-name">${i}</span>
              </button>
            `})}
        </div>

        <div class="pvc-controls">
          ${this._mine(e).length?U`
            <button class="pvc-new-btn" type="button" @click=${()=>this._pv.store.openCreateDialog()}>
              <ha-icon icon="mdi:plus"></ha-icon>
              New event
            </button>
          `:Y}

          <div class="pvc-nav">
            <button class="pvc-nav-btn" type="button" aria-label=${s.prev} title=${s.prev}
              @click=${()=>this._navigate("prev")}>
              <ha-icon icon="mdi:chevron-left"></ha-icon>
            </button>
            <button class="pvc-today-btn" type="button" ?disabled=${i} @click=${()=>this._navigate("today")}>
              Today
            </button>
            <button class="pvc-nav-btn" type="button" aria-label=${s.next} title=${s.next}
              @click=${()=>this._navigate("next")}>
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
    `}_toggleFilterDropdown(e){e.stopPropagation(),this._filterOpen=!this._filterOpen,this._filterOpen?requestAnimationFrame(()=>{document.addEventListener("click",this._filterCloseHandler)}):document.removeEventListener("click",this._filterCloseHandler)}_onFilterClickOutside(e){const t=e.composedPath(),s=this.shadowRoot?.querySelector(".pvc-filter-panel"),i=this.shadowRoot?.querySelector(".pvc-filter-btn");s&&!t.includes(s)&&i&&!t.includes(i)&&(this._filterOpen=!1,document.removeEventListener("click",this._filterCloseHandler))}_renderView(e,t,s,i){const a=i?.time_format||"12h",n=i?.first_day||"sunday",o=this._pv.store.currentDate,r=this._pv.store.hiddenCalendars,l=this.shape.avatar_border||"primary",d="stripes"===(this.shape.event_style||"stripes");switch(e){case"day":{const{sharedEventMap:e}=this._derived(),i=this._tick;return U`<pv-view-day
          layout=${this.layout}
          .hass=${this.hass}
          .events=${t}
          .calendars=${s}
          .currentDate=${o}
          .hiddenCalendars=${r}
          .timeFormat=${a}
          .hideColumnHeaders=${!1}
          .avatarBorderMode=${l}
          .sharedEventMap=${e}
          .tick=${i}
          .progress=${this.services?.chores?.memberProgress?this._progressOf:null}
          .revision=${this.revision}
        ></pv-view-day>`}case"week":{const e=this._tick;return U`<pv-view-week
          layout=${this.layout}
          .hass=${this.hass}
          .events=${t}
          .calendars=${s}
          .currentDate=${o}
          .hiddenCalendars=${r}
          .timeFormat=${a}
          .firstDay=${n}
          .forecast=${this.forecast}
          .showStripes=${d}
          .tick=${e}
        ></pv-view-week>`}case"month":{const e=this._tick;return U`<pv-view-month
          layout=${this.layout}
          .hass=${this.hass}
          .events=${t}
          .calendars=${s}
          .currentDate=${o}
          .hiddenCalendars=${r}
          .firstDay=${n}
          .timeFormat=${a}
          .showStripes=${d}
          .tick=${e}
        ></pv-view-month>`}case"agenda":{const e=this._tick;return U`<pv-view-agenda
          layout=${this.layout}
          .hass=${this.hass}
          .events=${t}
          .calendars=${s}
          .currentDate=${o}
          .hiddenCalendars=${r}
          .timeFormat=${a}
          .forecast=${this.forecast}
          .showStripes=${d}
          .tick=${e}
        ></pv-view-agenda>`}default:return Y}}_onEventClick(e){const t=e.detail.event,s=Es(this.data,this.mode,this.household?.members??ya)?.events||[];this._pv.store.selectEvent(function(e,t){if(e.uid){const s=t=>e.recurrence_id?t.recurrence_id===e.recurrence_id:Se(t)===Se(e),i=t.filter(t=>t.uid===e.uid&&""!==t.uid&&s(t)),a=new Set,n=i.filter(e=>!a.has(e.calendar_entity_id)&&(a.add(e.calendar_entity_id),!0));if(n.length>1){const t=n.map(e=>({entity_id:e.calendar_entity_id,calendar_name:e.calendar_name,calendar_color:e.calendar_color,uid:e.uid,recurrence_id:e.recurrence_id}));return{...e,shared_calendars:t}}}const s=e.shared_calendars;if(s?.length){const t=s.map(t=>({entity_id:t.entity_id,calendar_name:t.calendar_name??t.display_name??"",calendar_color:t.calendar_color??t.color??e.calendar_color,uid:t.uid,recurrence_id:t.recurrence_id}));return{...e,shared_calendars:t}}const i=Se(e),a=function(e){const t=new Set;return e.filter(e=>!t.has(e.calendar_entity_id)&&(t.add(e.calendar_entity_id),!0))}(t.filter(e=>Se(e)===i));if(a.length>1){const t=a.map(e=>({entity_id:e.calendar_entity_id,calendar_name:e.calendar_name,calendar_color:e.calendar_color,uid:e.uid,recurrence_id:e.recurrence_id}));return{...e,shared_calendars:t}}return e}(t,s))}_mine(e){return e.filter(e=>this._gate.allowed([e.entity_id]))}_onCreateEvent(e){if(!this._mine(this._derived().calendars).length)return;const t=e.detail?.date,s={};if(t){const e=t.getFullYear(),i=String(t.getMonth()+1).padStart(2,"0"),a=String(t.getDate()).padStart(2,"0");s.start=`${e}-${i}-${a}T09:00:00`,s.end=`${e}-${i}-${a}T10:00:00`}this._pv.store.openCreateDialog(s)}_onDayClick(e){this._movedAt=performance.now(),this._pv.store.setDate(e.detail.date),this.dispatchEvent(new CustomEvent("pv-view-change",{detail:{view:"day"},bubbles:!0,composed:!0}))}_onTouchStart(e){this._touchStart=1===e.touches.length?{x:e.touches[0].clientX,y:e.touches[0].clientY}:null}_onTouchEnd(e){const t=this._touchStart;if(this._touchStart=null,!t||e.touches.length>0||1!==e.changedTouches.length)return;const s=e.changedTouches[0],i=St(s.clientX-t.x,s.clientY-t.y);i&&this._navigate(i)}_onTouchCancel(){this._touchStart=null}}fa.styles=[lt,ct,dt,mt,vt,oi,o`
      :host {
        display: flex;
        flex-direction: column;
        flex: 1 1 auto;
        min-height: 0;
      }

      /* The card measures itself (DESIGN_SYSTEM 2.1): the toolbar and the views size
         against this frame's width. The sheets sit outside it, so it never holds them in. */
      .pvc-frame {
        display: flex;
        flex-direction: column;
        flex: 1 1 auto;
        min-height: 0;
        container: pv-calendar / inline-size;
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
        min-height: 48px;
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
        min-height: 48px;
        --mdc-icon-size: 20px;
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
        width: 48px;
        height: 48px;
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

      /* Today reads as chores' This week does: the secondary button's type (review). */
      .pvc-today-btn {
        padding: 6px 16px;
        border: 1px solid var(--pv-border);
        border-radius: var(--pv-radius, 12px);
        background: transparent;
        color: var(--pv-text, #1A1B1E);
        font-size: 0.9375rem;
        font-weight: 600;
        cursor: pointer;
        transition: all 200ms ease;
        font-family: inherit;
        min-height: 48px;
        -webkit-tap-highlight-color: transparent;
      }

      .pvc-today-btn:disabled {
        opacity: 0.45;
        cursor: default;
      }

      .pvc-today-btn:hover:not(:disabled) {
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
        width: 48px;
        height: 48px;
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
        min-height: 48px;
        padding: 4px 12px 4px 8px;
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

      @container pv-calendar (min-width: 1024px){
        .pvc-toolbar { padding: 14px 20px; gap: 10px; }
        .pvc-filter-btn { padding: 10px 20px; font-size: 1rem; min-height: 48px; }
        .pvc-new-btn { padding: 11px 22px; font-size: 1.0625rem; min-height: 48px; }
        .pvc-today-btn { padding: 8px 18px; font-size: 1rem; min-height: 48px; }
        .pvc-nav-btn { width: 48px; height: 48px; --mdc-icon-size: 24px; }
      }

/* xl: wall-mounted touch displays (1440px+, 27"+), scale up ~40% */

      @container pv-calendar (min-width: 1440px){
        .pvc-toolbar { padding: 16px 24px; gap: 12px; }
        .pvc-filter-btn { padding: 12px 24px; font-size: 1.125rem; min-height: 56px; }
        .pvc-filter-badge { min-width: 24px; height: 24px; font-size: 0.8125rem; }
        .pvc-filter-avatar { width: 40px; height: 40px; font-size: 1rem; }
        .pvc-filter-name { font-size: 1.0625rem; }
        .pvc-new-btn { padding: 14px 28px; font-size: 1.1875rem; min-height: 56px; }
        .pvc-today-btn { padding: 10px 22px; font-size: 1.125rem; min-height: 52px; }
        .pvc-nav-btn { width: 56px; height: 56px; --mdc-icon-size: 28px; }
      }
    `],e([ue({attribute:!1})],fa.prototype,"hass",void 0),e([ue({attribute:!1})],fa.prototype,"cardConfig",void 0),e([ue({attribute:!1})],fa.prototype,"data",void 0),e([ue({attribute:!1})],fa.prototype,"display",void 0),e([ue({attribute:!1})],fa.prototype,"mode",void 0),e([ue({attribute:!1})],fa.prototype,"shape",void 0),e([ue({attribute:!1})],fa.prototype,"forecast",void 0),e([ue({attribute:!1})],fa.prototype,"view",void 0),e([ue({type:String,reflect:!0})],fa.prototype,"layout",void 0),e([ue({attribute:!1})],fa.prototype,"services",void 0),e([ue({attribute:!1})],fa.prototype,"revision",void 0),e([ue({attribute:!1})],fa.prototype,"household",void 0),e([ue({attribute:!1})],fa.prototype,"session",void 0),e([ue({attribute:!1})],fa.prototype,"pinGate",void 0),e([me()],fa.prototype,"_tick",void 0),e([me()],fa.prototype,"_filterOpen",void 0),e([me()],fa.prototype,"_refreshing",void 0),ge("pv-calendar-module",fa);const _a=o`
.page-content {
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
@media (max-width: 479px) {
.page-title { font-size: 1.125rem; }
.page-subtitle { font-size: 0.8125rem; margin-bottom: 1.25rem; }
}
@media (min-width: 480px) and (max-width: 767px) {
.page-title { font-size: 1.25rem; }
}
`;class wa{constructor(e,t,s){this._message=e,this._onEvent=t,this._onStatus=s,this.status="idle",this._unsub=null,this._generation=0,this._attempt=0,this._hadEvent=!1,this._onReady=()=>{this._connection&&(this._generation++,this._unsub=null,this._cancelRetry(),this._subscribe())},this._onDisconnected=()=>{this._connection&&this._setStatus("offline")}}update(e){e!==this._connection&&(this.stop(),this._connection=e,e&&(e.addEventListener("ready",this._onReady),e.addEventListener("disconnected",this._onDisconnected),this._subscribe()))}stop(){if(this._generation++,this._cancelRetry(),this._connection?.removeEventListener("ready",this._onReady),this._connection?.removeEventListener("disconnected",this._onDisconnected),this._connection=void 0,this._hadEvent=!1,this._unsub){const e=this._unsub;this._unsub=null,Di(e)}this._setStatus("idle")}retry(){this._connection&&"live"!==this.status&&"connecting"!==this.status&&(this._generation++,this._cancelRetry(),this._subscribe())}_subscribe(){const e=this._connection;if(!e)return;const t=this._generation;"offline"!==this.status&&this._setStatus("connecting"),e.subscribeMessage(e=>{t===this._generation&&(this._hadEvent=!0,this._onEvent(e))},this._message,{resubscribe:!1}).then(e=>{t===this._generation?(this._unsub=e,this._attempt=0,this._setStatus("live")):Di(e)}).catch(()=>{t===this._generation&&(this._hadEvent||this._onEvent(null),this._setStatus("offline"),this._retry=setTimeout(()=>{this._retry=void 0,t===this._generation&&this._subscribe()},Ai(this._attempt++)))})}_setStatus(e){e!==this.status&&(this.status=e,this._onStatus?.(e))}_cancelRetry(){void 0!==this._retry&&clearTimeout(this._retry),this._retry=void 0,this._attempt=0}}function xa(e){return e&&"object"==typeof e&&"string"==typeof e.code?e.code:"unknown"}function $a(e){return e&&"object"==typeof e&&"string"==typeof e.message?e.message:null}const ka=new Set(["parent_mode_required","pin_required"]);class Ea{constructor(e,t,s,i){this._ws=e,this._session=t,this._onSessionEnded=s,this._onSessionUsed=i}call(e,t,s=!0){const i={type:e,...t},a=s?this._session():null;return a?(i.session=a,this._ws.callWS(i).then(e=>(this._onSessionUsed?.(a),e),e=>{throw ka.has(xa(e))&&this._onSessionEnded?.(a),e})):this._ws.callWS(i)}}class Fa extends wa{constructor(e){super({type:"planavista/household/subscribe"},e)}}class Ca extends Ea{saveMember(e,t){const s={member:e};return t&&(s.member_id=t.id,void 0!==t.rev&&(s.rev=t.rev)),this.call("planavista/household/member/save",s)}deleteMember(e){return this.call("planavista/household/member/delete",{member_id:e})}reorder(e){return this.call("planavista/household/member/reorder",{order:e})}setSharedScreen(e){return this.call("planavista/household/shared_screen",{shared:e})}saveSecurity(e){return this.call("planavista/household/settings/save",e)}saveSetup(e){return this.call("planavista/household/setup/save",e)}saveConfig(e){return this.call("planavista/config/save",e)}unlock(e,t){return this.call("planavista/pin/unlock",{member_id:e,pin:t},!1)}setPin(e,t){return this.call("planavista/pin/set",{member_id:e,pin:t})}clearPin(e){return this.call("planavista/pin/clear",{member_id:e})}clearPause(e){return this.call("planavista/pin/clear_lockout",{member_id:e})}lock(e){return this.call("planavista/pin/lock",{session:e},!1)}touch(e){return this.call("planavista/pin/touch",{session:e},!1)}exitKiosk(){return this.call("planavista/kiosk/exit",{})}}class Sa extends de{constructor(){super(...arguments),this.household=null,this.layout="landscape",this.mode="settings",this._loaded=!1}willUpdate(){!this._loaded&&this.data?.display&&(this._draft={...this.data.display},this._loaded=!0)}_apply(e){this._draft={...this._draft,...e},this.api.saveConfig({display:e}).catch(e=>this._error(e))}_error(e){this.dispatchEvent(new CustomEvent(Js,{detail:{message:ti(xa(e))},bubbles:!0,composed:!0}))}get _weatherEntities(){return this.hass?Object.keys(this.hass.states).filter(e=>e.startsWith("weather.")).sort():[]}_entityLabel(e){return this.hass?.states[e]?.attributes?.friendly_name||e}_toggleLocationAutocomplete(){this._apply({location_autocomplete:!this._draft.location_autocomplete})}_renderPreferences(){return U`
      <div class="page-content">
        <!-- Time format -->
        <div class="field-group">
          <label class="pv-label">Time format</label>
          <div class="pv-seg" role="group" aria-label="Time format">
            <button
              aria-pressed=${"12h"===this._draft.time_format?"true":"false"}
              type="button"
              @click=${()=>{this._apply({time_format:"12h"})}}
            >12-hour</button>
            <button
              aria-pressed=${"24h"===this._draft.time_format?"true":"false"}
              type="button"
              @click=${()=>{this._apply({time_format:"24h"})}}
            >24-hour</button>
          </div>
        </div>

        <!-- First day of the week -->
        <div class="field-group">
          <label class="pv-label">First day of the week</label>
          <div class="pv-seg" role="group" aria-label="First day of week">
            <button
              aria-pressed=${"sunday"===this._draft.first_day?"true":"false"}
              type="button"
              @click=${()=>{this._apply({first_day:"sunday"})}}
            >Sunday</button>
            <button
              aria-pressed=${"monday"===this._draft.first_day?"true":"false"}
              type="button"
              @click=${()=>{this._apply({first_day:"monday"})}}
            >Monday</button>
          </div>
        </div>

        <!-- Weather -->
        <div class="field-group">
          <label class="pv-label" for="weather-select">Weather</label>
          <select
            id="weather-select"
            class="pv-input pv-select"
            .value=${this._draft.weather_entity}
            @change=${e=>{this._apply({weather_entity:e.target.value})}}
          >
            <option value="">None</option>
            ${this._weatherEntities.map(e=>U`
              <option value="${e}" ?selected=${this._draft.weather_entity===e}>${this._entityLabel(e)}</option>
            `)}
          </select>
        </div>

        <!-- Default view -->
        <div class="field-group">
          <label class="pv-label">Default view</label>
          <div class="pv-seg stretch" role="group" aria-label="Default calendar view">
            ${[{key:"day",label:"Day"},{key:"week",label:"Week"},{key:"month",label:"Month"},{key:"agenda",label:"Agenda"}].map(e=>U`
              <button type="button" aria-pressed=${this._draft.default_view===e.key?"true":"false"}
                @click=${()=>{this._apply({default_view:e.key})}}>${e.label}</button>
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
    `}render(){return this._loaded?this._renderPreferences():Y}}Sa.styles=[yi,lt,ct,pt,mt,_a,o`
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
@media (max-width: 479px) {
.field-group { margin-bottom: 1rem; }
}
    `],e([ue({attribute:!1})],Sa.prototype,"hass",void 0),e([ue({attribute:!1})],Sa.prototype,"data",void 0),e([ue({attribute:!1})],Sa.prototype,"household",void 0),e([ue({attribute:!1})],Sa.prototype,"api",void 0),e([ue({attribute:!1})],Sa.prototype,"layout",void 0),e([ue({type:String})],Sa.prototype,"mode",void 0),e([me()],Sa.prototype,"_draft",void 0),ge("pv-calendar-options-page",Sa);class Da extends de{constructor(){super(...arguments),this.value="",this.valueLight="",this._isCustom=!1}updated(e){if(super.updated(e),e.has("value")&&this.value){const e=Da.PRESETS.some(e=>e.color.toLowerCase()===this.value.toLowerCase());this._isCustom=!e}}_selectPreset(e){this._isCustom=!1,this._emit(e.color,e.light)}_openCustomPicker(){this._colorInput?.click()}_onCustomColorChange(e){const t=e.target.value,s=Xe(t);this._isCustom=!0,this._emit(t,s)}_emit(e,t){this.value=e,this.valueLight=t,this.dispatchEvent(new CustomEvent("color-change",{detail:{color:e,colorLight:t},bubbles:!0,composed:!0}))}_isSelected(e){return this.value.toLowerCase()===e.toLowerCase()}render(){const e=Da.PRESETS,t=this._isCustom?this.value:"",s=this._isCustom&&!!this.value;return U`
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
          aria-label="Custom color${s?" (selected)":""}"
          aria-pressed="${s}"
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
    `}}Da.PRESETS=[{name:"Ink Black",color:"#001219",light:"#A6ACAF"},{name:"Dark Teal",color:"#005F73",light:"#A6C7CE"},{name:"Dark Cyan",color:"#0A9396",light:"#A9D9DA"},{name:"Pearl Aqua",color:"#94D2BD",light:"#DAEFE8"},{name:"Wheat",color:"#E9D8A6",light:"#F7F1E0"},{name:"Golden Orange",color:"#EE9B00",light:"#F9DCA6"},{name:"Burnt Caramel",color:"#CA6702",light:"#ECCAA6"},{name:"Rusty Spice",color:"#BB3E03",light:"#E7BBA7"},{name:"Oxidized Iron",color:"#AE2012",light:"#E3B1AC"},{name:"Brown Red",color:"#9B2226",light:"#DCB2B3"},{name:"Strawberry Red",color:"#F94144",light:"#FDBDBE"},{name:"Pumpkin Spice",color:"#F3722C",light:"#FBCEB5"},{name:"Carrot Orange",color:"#F8961E",light:"#FDDAB0"},{name:"Atomic Tangerine",color:"#F9844A",light:"#FDD4C0"},{name:"Tuscan Sun",color:"#F9C74F",light:"#FDEBC1"},{name:"Willow Green",color:"#90BE6D",light:"#D8E8CC"},{name:"Seaweed",color:"#43AA8B",light:"#BDE1D6"},{name:"Ocean Cyan",color:"#4D908E",light:"#C1D8D7"},{name:"Blue Slate",color:"#577590",light:"#C4CFD8"},{name:"Cerulean",color:"#277DA1",light:"#B3D2DE"}],Da.styles=[lt,o`
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
        width: 48px;
        height: 48px;
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
    `],e([ue({type:String})],Da.prototype,"value",void 0),e([ue({type:String})],Da.prototype,"valueLight",void 0),e([me()],Da.prototype,"_isCustom",void 0),e([ve("#custom-color-input")],Da.prototype,"_colorInput",void 0),ge("pv-color-swatch-picker",Da);const Aa=new Set(["state","attributes","fetch_failed"]);function Ma(e,t){if(e.person_entity){const s=t.find(t=>t.person===e.person_entity);if(s)return{memberId:s.id,viaPerson:!0}}const s=t.some(t=>t.id===e.member_id)?e.member_id:null;return{memberId:s,viaPerson:!1}}class Ta extends de{constructor(){super(...arguments),this.household=null,this.layout="landscape",this.mode="settings",this._rows=[],this._dragIdx=null,this._dragOverIdx=null,this._built=!1}willUpdate(){if(!this._built&&this.hass&&this.data){const e=Object.keys(this.hass.states).filter(e=>e.startsWith("calendar."));this._rows=function(e,t,s,i){const a=[],n=new Set;for(const t of e){const e=i[a.length%i.length];n.add(t.entity_id),a.push({saved:Object.fromEntries(Object.entries(t).filter(([e])=>!Aa.has(e))),entity_id:t.entity_id,display_name:t.display_name||t.entity_id,color:t.color||e.color,color_light:t.color_light||e.light,person_entity:t.person_entity||"",member_id:t.member_id??null,include:!0})}for(const e of t.filter(e=>!n.has(e)).sort()){const t=i[a.length%i.length];a.push({saved:null,entity_id:e,display_name:s(e)||e,color:t.color,color_light:t.light,person_entity:"",member_id:null,include:!1})}return a}(this.data.calendars,e,e=>this.hass.states[e]?.attributes?.friendly_name,Da.PRESETS),this._built=!0}}_save(){var e;this.api.saveConfig({calendars:(e=this._rows,e.filter(e=>e.include).map(e=>({icon:"mdi:calendar",visible:!0,...e.saved??{},entity_id:e.entity_id,display_name:e.display_name,color:e.color,color_light:e.color_light,person_entity:e.person_entity,member_id:e.member_id})))}).catch(e=>this._error(e))}_error(e){this.dispatchEvent(new CustomEvent(Js,{detail:{message:ti(xa(e))},bubbles:!0,composed:!0}))}get _personEntities(){return this.hass?Object.keys(this.hass.states).filter(e=>e.startsWith("person.")).sort():[]}_personLabel(e){return this._entityLabel(e)}_entityLabel(e){return this.hass?.states[e]?.attributes?.friendly_name||e}_updateCalendar(e,t,s=!0){const i=[...this._rows];i[e]={...i[e],...t},this._rows=i,s&&this._save()}_onCalendarColorChange(e,t){t.stopPropagation(),this._updateCalendar(e,{color:t.detail.color,color_light:t.detail.colorLight})}_renderCalendars(){return 0===this._rows.length?U`
        <div class="page-content">
          <p class="page-subtitle">Home Assistant has no calendars yet.</p>
          <p class="empty-hint">Add one in Settings, Devices and services (Google Calendar, CalDAV, or Local Calendar), and it shows up here.</p>
        </div>
      `:U`
      <div class="page-content">
        <div class="calendar-list">
          ${this._rows.map((e,t)=>this._renderCalendarRow(e,t))}
        </div>
      </div>
    `}_onDragStart(e,t){this._dragIdx=e,t.dataTransfer&&(t.dataTransfer.effectAllowed="move",t.dataTransfer.setData("text/plain",String(e)))}_onDragOver(e,t){t.preventDefault(),t.dataTransfer&&(t.dataTransfer.dropEffect="move"),this._dragOverIdx=e}_onDragLeave(){this._dragOverIdx=null}_onDrop(e,t){if(t.preventDefault(),null!==this._dragIdx&&this._dragIdx!==e){const t=[...this._rows],[s]=t.splice(this._dragIdx,1);t.splice(e,0,s),this._rows=t,this._save()}this._dragIdx=null,this._dragOverIdx=null}_onDragEnd(){this._dragIdx=null,this._dragOverIdx=null}_renderCalendarRow(e,t){const s=this._dragIdx===t,i=this._dragOverIdx===t&&this._dragIdx!==t;return U`
      <div class="cal-row ${s?"cal-row--dragging":""} ${i?"cal-row--dragover":""}"
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
              <label class="pv-label" for="cal-name-${t}">Name</label>
              <input
                id="cal-name-${t}"
                type="text"
                class="pv-input cal-name-input"
                .value=${e.display_name}
                placeholder="Name on the calendar"
                @input=${e=>this._updateCalendar(t,{display_name:e.target.value},!1)}
                @change=${()=>this._save()}
              />
            </div>

            ${this._renderColor(e,t)}

            <!-- Person entity link -->
            <div class="cal-field">
              <label class="pv-label" for="cal-person-${t}">Home Assistant person</label>
              <select
                id="cal-person-${t}"
                class="pv-input pv-select cal-person-select"
                .value=${e.person_entity}
                @change=${e=>this._updateCalendar(t,{person_entity:e.target.value})}
              >
                <option value="">None</option>
                ${this._personEntities.map(t=>U`
                  <option value="${t}" ?selected=${e.person_entity===t}>${this._personLabel(t)}</option>
                `)}
              </select>
            </div>

            ${this._renderBelongsTo(e,t)}
          </div>
        `:""}
      </div>
    `}_renderColor(e,t){const s=this.household?.available?ss(this.household.members):[],{owner:i}=function(e,t){const{memberId:s}=Ma(e,t),i=t.find(e=>e.id===s)??null;return{owner:i,color:i?i.color:e.color}}(e,s);return i?U`
        <div class="cal-field">
          <span class="pv-label">Color</span>
          <div class="cal-owned-color">
            <span class="cal-color-dot" style="background: ${i.color}" aria-hidden="true"></span>
            <span class="cal-owned-name">${i.name}'s color</span>
            <button class="pv-btn pv-btn-secondary" type="button"
              @click=${()=>this._openPerson(i)}>Set in People</button>
          </div>
        </div>
      `:U`
      <div class="cal-field">
        <label class="pv-label">Color</label>
        <pv-color-swatch-picker
          .value=${e.color}
          .valueLight=${e.color_light}
          @color-change=${e=>this._onCalendarColorChange(t,e)}
        ></pv-color-swatch-picker>
      </div>
    `}_openPerson(e){const t={tag:"pv-settings-person",title:e.name,back:"Calendars",props:{memberId:e.id}};this.dispatchEvent(new CustomEvent(Ks,{detail:t,bubbles:!0,composed:!0}))}_renderBelongsTo(e,t){if(!this.household?.available)return Y;const s=ss(this.household.members),i=Ma(e,s);return U`
      <div class="cal-field">
        <label class="pv-label" for="cal-owner-${t}">Belongs to</label>
        <select
          id="cal-owner-${t}"
          class="pv-input pv-select cal-person-select"
          .value=${i.memberId??""}
          ?disabled=${i.viaPerson}
          @change=${e=>this._updateCalendar(t,{member_id:e.target.value||null})}
        >
          <option value="">Nobody</option>
          ${s.map(e=>U`
            <option value="${e.id}" ?selected=${i.memberId===e.id}>${e.name}</option>
          `)}
        </select>
        ${i.viaPerson?U`
          <p class="cal-owner-hint">Through ${this._personLabel(e.person_entity)}'s Home Assistant person.</p>
        `:Y}
      </div>
    `}render(){return this._built?this._renderCalendars():Y}}function za(e,t){const s=e.initialView?.(t);return e.views.some(e=>e.id===s)?s:e.views[0]?.id??""}function Pa(e,t){return e.order-t.order||e.id.localeCompare(t.id)}Ta.styles=[lt,ct,pt,mt,_a,o`
.empty-hint {
        font-size: 0.875rem;
        color: var(--pv-text-muted, #9CA3AF);
        margin: 0.5rem 0 0;
      }
.cal-owned-color {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 10px 12px;
        min-height: 48px;
      }
.cal-color-dot {
        width: 28px;
        height: 28px;
        border-radius: 50%;
        flex: 0 0 auto;
      }
.cal-owned-name {
        flex: 1 1 auto;
        font-weight: 600;
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
    `],e([ue({attribute:!1})],Ta.prototype,"hass",void 0),e([ue({attribute:!1})],Ta.prototype,"data",void 0),e([ue({attribute:!1})],Ta.prototype,"household",void 0),e([ue({attribute:!1})],Ta.prototype,"api",void 0),e([ue({attribute:!1})],Ta.prototype,"layout",void 0),e([ue({type:String})],Ta.prototype,"mode",void 0),e([me()],Ta.prototype,"_rows",void 0),e([me()],Ta.prototype,"_dragIdx",void 0),e([me()],Ta.prototype,"_dragOverIdx",void 0),ge("pv-calendar-calendars-page",Ta);const Oa=new class{constructor(){this._modules=new Map}register(e){this._modules.set(e.id,e)}get(e){return this._modules.get(e)}list(){return[...this._modules.values()].sort(Pa)}};class Ba{constructor(){this._pages=new Map}register(e){this._pages.set(e.id,e)}pages(e){return[...this._pages.values()].filter(t=>!t.applies||t.applies(e)).sort((e,t)=>e.order-t.order||e.id.localeCompare(t.id))}}const Na=[{id:"people",label:null,order:100},{id:"chores",label:"Chores",order:200},{id:"calendar",label:"Calendar",order:300},{id:"appearance",label:null,order:400},{id:"security",label:null,order:500},{id:"data",label:null,order:600},{id:"about",label:null,order:900}],Ra="pv-step-change",Ia="pv-person-change",La=new Ba,qa=new Ba,Ha=new Ba,ja=new Ba,Ua={id:"calendar",label:"Calendar",icon:"mdi:calendar-month",tag:"pv-calendar-module",order:10,views:[{id:"day",label:"Day"},{id:"week",label:"Week"},{id:"month",label:"Month"},{id:"agenda",label:"Agenda"}],initialView:({config:e,data:t})=>function(e,t){return e?.view||e?.default_view||t?.display?.default_view||void 0}(e,t),watchedEntities:({config:e,data:t})=>Kt(t,e).map(e=>e.person_entity).filter(e=>!!e)},Wa={day:"Day",week:"Week",month:"Month",agenda:"Agenda"},Va=[{id:"calendars",label:"Calendars",group:"calendar",order:300,tag:"pv-calendar-calendars-page",summary:({data:e})=>{const t=e.calendars?.length??0;return 0===t?"None yet":`${t} ${1===t?"calendar":"calendars"}`}},{id:"calendar-options",label:"Calendar options",group:"calendar",order:310,tag:"pv-calendar-options-page",summary:({data:e})=>`${Wa[e.display?.default_view??"week"]??"Week"} · ${"24h"===e.display?.time_format?"24-hour":"12-hour"}`}],Ya=[{id:"calendars",label:"Calendars",order:200,tag:"pv-calendar-calendars-page",heading:"Calendars",lead:"Choose the calendars to show, and who each one belongs to."}];!function(e=Oa){e.register(Ua)}(),function(e=La,t=ja){for(const t of Va)e.register(t);for(const e of Ya)t.register(e)}();const Ka=o`
  ${vt}

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

  .section-head {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 8px;
    margin: 14px 4px 6px;
    font-size: 0.8125rem;
    font-weight: 750;
    color: var(--pv-text-secondary, #5F6670);
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

  .sr {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip: rect(0 0 0 0);
    white-space: nowrap;
  }
`,Ga=["Sun","Mon","Tue","Wed","Thu","Fri","Sat"],Ja=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];function Xa(e){const[t,s,i]=e.split("-").map(Number);return new Date(t,s-1,i,12)}function Qa(e,t){return Math.round((Xa(t).getTime()-Xa(e).getTime())/864e5)}function Za(e,t){const s=Xa(e);return Math.abs(Qa(t,e))<=6?Ga[s.getDay()]:`${Ja[s.getMonth()]} ${s.getDate()}`}function en(e,t){switch(e.status){case"done":return null;case"pending":return{words:"Waiting for OK",tone:"act",glyph:"⏳"};case"sent_back":return{words:e.note?`Sent back: ${e.note}`:"Sent back",tone:"bad",glyph:"↩"};case"excused":return{words:"Excused",tone:"muted"};case"away":return{words:"Away",tone:"neutral",glyph:"🧳"}}if(e.overdue_since)return{words:`Overdue since ${Za(e.overdue_since,t.today)}`,tone:"bad",glyph:"•"};if(e.from)return{words:`From ${Za(e.from,t.today)}`,tone:"neutral"};if(e.dated&&e.due_day)return e.due_day===t.today?{words:"Due today",tone:"time"}:{words:`Due ${Za(e.due_day,t.today)}`,tone:"neutral"};if("week"===e.section&&"week"===e.window&&t.remaining>0){if(t.daysLeft<=1)return{words:"Last day",tone:"bad",glyph:"•"};if(t.remaining>=t.daysLeft)return{words:`${t.daysLeft} days left`,tone:"time",glyph:"•"}}return null}function tn(e,t){switch(e){case"done":return{words:"Done",tone:"neutral",glyph:"✓"};case"pending":return{words:"Waiting for OK",tone:"act",glyph:"⏳"};case"missed":return{words:"Missed",tone:"bad",glyph:"×"};case"carried":return{words:"Carried over",tone:"time",glyph:"•"};case"open":return{words:"Not done that day",tone:"time",glyph:"•"};case"excused":return{words:t?`Excused: ${t}`:"Excused",tone:"muted"};default:return{words:e,tone:"neutral"}}}function sn(e){const t=Math.round(e);if(t<60)return`${Math.max(1,t)} min`;const s=t/60;return Number.isInteger(s)?`${s} h`:Number.isInteger(2*s)?`${s.toFixed(1)} h`:`${Math.floor(s)} h ${t%60} min`}function an(e,t,s){return 0===s?`${e}, nothing due today`:t>=s?`${e}, ring closed for today`:`${e}, ${t} of ${s} done today`}function nn(e,t="12h",s=!1){const i=String(e.getMinutes()).padStart(2,"0");if("24h"===t)return`${e.getHours()}:${i}`;const a=e.getHours()%12||12;return s?`${a}:${i} ${e.getHours()>=12?"PM":"AM"}`:`${a}:${i}`}function on(e,t,s,i){if(!e)return[];const a=Kt(e,i),n=new Map(a.map(e=>[e.entity_id,e.member_id??null])),o=[];for(const i of e.events??[]){if(!n.has(i.calendar_entity_id))continue;if(!i.start||_e(i.start))continue;const e=we(i.start),a=i.end?we(i.end):e;a<=t||e>=s||o.push({title:i.summary||"Busy",start:e,end:a,calendar:i.calendar_entity_id,member:n.get(i.calendar_entity_id)??null})}return o.sort((e,t)=>e.start.getTime()-t.start.getTime())}const rn=["morning","afternoon","evening"],ln={morning:"Morning",afternoon:"Afternoon",evening:"Evening"},dn=new Set(["open","sent_back"]);function cn(e,t){const s=e.completion?.at;if(!s)return!1;const i=new Date(s).getTime();return i>=new Date(t.day.start).getTime()&&i<new Date(t.day.end).getTime()}function hn(e,t="03:00"){const[s,i]=t.split(":").map(Number),a=60*e.getHours()+e.getMinutes();return a>=60*(Number.isFinite(s)?s:3)+(Number.isFinite(i)?i:0)&&a<720?"morning":a>=720&&a<1020?"afternoon":"evening"}function pn(e,t){return e.band??t}function un(e,t){const s=rn.indexOf(e),i=rn.indexOf(t);return s<i?"past":s===i?"now":"later"}function mn(e,t,s,i,a={}){const n=t.activities.get(e.chore),o=a.group?a.group.total-a.group.done:1,r={today:t.today,daysLeft:s.week.days_left,remaining:o};let l,d;if(e.completion&&("done"===e.status||"pending"===e.status)){l=nn(new Date(e.completion.at),t.timeFormat);const s=e.completion.done_by;d=s&&s!==e.member?t.members.find(e=>e.id===s)?.name??s:null}const c="month"===e.window?"this month":function(e,t){const s=sn(e.credit_minutes);return t&&e.stars>0?`${s} · ★ ${e.stars}`:s}(e,i);return{key:e.key,item:e,name:e.name,icon:e.icon,label:n?.label??null,badge:en(e,r),meta:c,state:e.status,doneAt:l,doneBy:d,...a}}function vn(e){return"overdue"===e.section?null:function(e){return"week"===e.section&&"week"===e.window&&!e.planned&&!e.from&&!e.dated}(e)||"once"===e.window&&"once"===e.period?`${e.section}|${e.chore}|${e.period}`:null}function gn(e,t){return t.members.filter(t=>e.members[t.id]).map(s=>function(e,t,s,i){const a=hn(i.now,s.settings?.day_starts),n=!!e.stars,o=[],r=t.items,l=[],d={morning:[],afternoon:[],evening:[]},c={morning:0,afternoon:0,evening:0},h=[],p=[],u=new Map,m=[];for(const e of r){const t=vn(e);if(t)u.set(t,[...u.get(t)??[],e]);else if("overdue"!==e.section){if("today"===e.section){const t=pn(e,a);if("done"===e.status){"past"===un(t,a)?(c[t]+=1,m.push(mn(e,i,s,n))):l.push(mn(e,i,s,n));continue}if("excused"===e.status||"away"===e.status)continue;d[t].push(mn(e,i,s,n));continue}"done"!==e.status?"excused"!==e.status&&"away"!==e.status&&p.push(mn(e,i,s,n)):cn(e,s)&&l.push(mn(e,i,s,n))}else dn.has(e.status)||"pending"===e.status?h.push(mn(e,i,s,n)):"done"===e.status&&cn(e,s)&&l.push(mn(e,i,s,n))}for(const[,e]of u){const t=e.filter(e=>"excused"!==e.status&&"away"!==e.status),o=t.length,r=t.filter(e=>"done"===e.status||"pending"===e.status).length,h="today"===e[0].section;for(const e of t){if("done"!==e.status||!cn(e,s))continue;const t=pn(e,a);h&&"past"===un(t,a)?(c[t]+=1,m.push(mn(e,i,s,n))):l.push(mn(e,i,s,n))}const u=t.find(e=>dn.has(e.status))??t.find(e=>"pending"===e.status);if(!u)continue;const v={done:r,total:o},g=sn(t.reduce((e,t)=>e+t.credit_minutes,0)),b=mn(u,i,s,n,{group:v});b.meta=o>1||"week"===u.window?`${g} · ${r} of ${o}`:b.meta,h?d[pn(u,a)].push(b):p.push(b)}if(h.length){o.push({kind:"head",key:"head:overdue",text:"Overdue",tone:"plain"});for(const e of h)o.push({kind:"row",key:e.key,row:e,zone:"overdue"})}const v=[];for(const e of rn){const t=un(e,a),s=d[e];if("past"===t){if(0===s.length){c[e]>0&&v.push({kind:"credit",key:`credit:${e}`,text:`${ln[e]} · ${c[e]} done`});continue}const t=s.filter(e=>dn.has(e.state)).length,i=s.length-t,a=[t?`${t} left`:"",i?`${i} waiting for OK`:"",c[e]?`${c[e]} done`:""].filter(Boolean);o.push({kind:"head",key:`head:${e}`,tone:"past",text:`${ln[e]} · ${a.join(", ")}`})}else{if(0===s.length)continue;o.push({kind:"head",key:`head:${e}`,tone:t,text:`${"now"===t?"Now":"Later"} · ${ln[e].toLowerCase()}`})}for(const e of s)o.push({kind:"row",key:e.key,row:e,zone:t})}if(p.length){const e=s.week.days_left;o.push({kind:"head",key:"head:week",text:"This week",right:1===e?"Last day":`${e} days left`,tone:"plain"});for(const e of p)o.push({kind:"row",key:e.key,row:e,zone:"week"})}const g=[...m,...l].sort((e,t)=>(e.item.completion?.at??"").localeCompare(t.item.completion?.at??""));if(g.length){o.push({kind:"head",key:"head:done",text:"Done today",tone:"plain"});for(const e of g)o.push({kind:"row",key:e.key,row:e,zone:"done"})}o.push(...v);const{due:b,done:y,pending:f}=t.today,_=y+f,w=b>0&&_>=b,x=[{kind:"count",text:b>0?`${Math.min(_,b)} of ${b} today`:"Nothing due today"}];n&&x.push({kind:"stars",text:`★ ${t.stars}`}),t.streak>=2&&x.push({kind:"streak",text:`🔥 ${t.streak} days`});const $=function(e,t,s){const i=function(e,t){return e.filter(e=>e.member===t)}(e,t),a=i.find(e=>e.start>s);return a?{event:a,freeUntil:!i.some(e=>e.start<=s&&e.end>s)&&a.start.getTime()-s.getTime()>=36e5}:null}(i.events,e.id,i.now),k=$?`Next on calendar: ${$.event.title} at ${nn($.event.start,i.timeFormat)}${$.freeUntil?" · free until then":""}`:null,E=r.filter(e=>e.counted&&dn.has(e.status)&&"week"!==e.section).length;return{member:e,entry:t,ring:{progress:b>0?Math.min(1,_/b):0,closed:w,label:an(e.name,Math.min(_,b),b)},line:x.map(e=>e.text).join(" · "),parts:x,next:k,away:t.away?{note:t.away.note??null}:null,pictures:"young_child"===e.age_group,entries:o,doneToday:g,left:E,empty:0===r.length}}(s,e.members[s.id],e,t))}function bn(e,t,s){const i=t.settings.evening_check;if(!i)return null;const[a,n]=i.split(":").map(Number),o=new Date(t.day.start),r=new Date(o.getFullYear(),o.getMonth(),o.getDate(),a,n);if(r<o&&r.setDate(r.getDate()+1),s<r||s>=new Date(t.day.end))return null;const l=e.filter(e=>e.left>0&&!e.away);if(0===l.length)return null;const d=l.map((e,t)=>0===t?`${e.member.name} has ${e.left} ${1===e.left?"chore":"chores"} left`:`${e.member.name} has ${e.left}`);return{text:`Evening check: ${1===d.length?d[0]:`${d.slice(0,-1).join(", ")} and ${d[d.length-1]}`}`,members:l.map(e=>e.member.id)}}function yn(e){const t=e.reduce((e,t)=>e+t.minutes,0);return t<=0?[]:e.filter(e=>e.minutes>0).map(e=>{const s=100*e.minutes/t;return{...e,percent:s,text:`${e.member.name} ${sn(e.minutes)} · ${Math.round(s)}%`}})}const fn=[[/\b(trash|garbage|bins?|recycling)\b/i,"🗑️"],[/\b(dish(es)?|dishwasher)\b/i,"🍽️"],[/\b(laundry|clothes|fold)\b/i,"🧺"],[/\bbeds?\b/i,"🛏️"],[/\btoys?\b/i,"🧸"],[/\bfish\b/i,"🐠"],[/\bcats?\b/i,"🐱"],[/\b(dogs?|walk the dog)\b/i,"🐕"],[/\b(pets?|feed)\b/i,"🐾"],[/\btable\b/i,"🍴"],[/\b(vacuum|sweep|mop|floors?)\b/i,"🧹"],[/\b(bath(room)?|toilet|shower|tub)\b/i,"🛁"],[/\b(leaf|leaves|rake)\b/i,"🍂"],[/\b(yard|garden|lawn|weeds?|mow)\b/i,"🌿"],[/\b(grocer(y|ies)|shopping|shop)\b/i,"🛒"],[/\b(plants?|flowers?)\b/i,"🪴"],[/\bcar\b/i,"🚗"],[/\b(garage|boxes|closet|attic|basement)\b/i,"📦"],[/\b(cook|dinner|lunch|breakfast|meal)\b/i,"🍳"],[/\b(homework|study|reading|read)\b/i,"📚"],[/\b(teeth|toothbrush)\b/i,"🪥"],[/\b(fix|repair|latch)\b/i,"🔨"],[/\bfilters?\b/i,"🔧"],[/\b(budget|bills?|finance|money)\b/i,"💵"],[/\b(windows?|dust|tidy|clean)\b/i,"✨"],[/\b(swim(ming)?|pool)\b/i,"🏊"],[/\b(soccer|football)\b/i,"⚽"],[/\bbasketball\b/i,"🏀"],[/\bbaseball\b/i,"⚾"],[/\b(school|class)\b/i,"🏫"],[/\bdentist\b/i,"🦷"],[/\b(doctor|checkup)\b/i,"🩺"],[/\b(piano|music|guitar|violin|band)\b/i,"🎹"],[/\b(dance|ballet)\b/i,"🩰"],[/\b(birthday|party)\b/i,"🎉"],[/\bpizza\b/i,"🍕"],[/\bmovies?\b/i,"🎬"],[/\b(practice|game|match|training)\b/i,"🏅"],[/\b(meeting|work|standup)\b/i,"💼"],[/\b(trip|travel|flight)\b/i,"🧳"],[/\b(bus)\b/i,"🚌"],[/\b(drop-off|pick-?up)\b/i,"🚗"],[/\b(church|temple|mosque)\b/i,"⛪"],[/\b(study group|tutor)\b/i,"📚"]];function _n(e,t="⭐"){for(const[t,s]of fn)if(t.test(e))return s;return t}function wn(e,t){return e&&!e.startsWith("mdi:")?e:_n(t)}const xn={morning:0,afternoon:12,evening:17};function $n(e,t){return`${nn(e.start,t,"12h"===t)} – ${nn(e.end,t,"12h"===t)}`}function kn(e,t){const s=[];let i=0;for(const a of t){if("open"!==a.state&&"sent_back"!==a.state)continue;const t=a.item.credit_minutes;if(!(null!==e&&i+t>e)&&(i+=t,s.push(a.name),3===s.length))break}return s}function En(e,t,s){const i="string"==typeof e.goal?e.goal:null,a=i?s.find(e=>e.id===i):void 0;if(!a)return null;const n=t.stars;return{reward:a,have:n,need:Math.max(0,a.cost-n),progress:a.cost>0?Math.min(1,n/a.cost):1}}function Fn(e){return e.need>0?`${e.need} more ★`:"Enough stars!"}function Cn(e){return`This week: ${e} ★`}const Sn=["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"],Dn=["Sun","Mon","Tue","Wed","Thu","Fri","Sat"],An=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"],Mn=["sun","mon","tue","wed","thu","fri","sat"];function Tn(e,t){const s=Xa(e);s.setDate(s.getDate()+t);const i=e=>String(e).padStart(2,"0");return`${s.getFullYear()}-${i(s.getMonth()+1)}-${i(s.getDate())}`}function zn(e,t){const s=Qa(t,e),i=Xa(e);return 0===s?"Today":1===s?"Tomorrow":s>1&&s<=6?Dn[i.getDay()]:s>=7&&s<=13?`Next ${Dn[i.getDay()]}`:`${An[i.getMonth()]} ${i.getDate()}`}function Pn(e,t){const s=Qa(t,e),i=Xa(e);return 0===s?"today":1===s?"tomorrow":Math.abs(s)<=6?Sn[i.getDay()]:`${["January","February","March","April","May","June","July","August","September","October","November","December"][i.getMonth()]} ${i.getDate()}`}function On(e){const t=e.map(e=>Dn[Mn.indexOf(e)]??e);return t.length<=1?t.join(""):`${t.slice(0,-1).join(", ")} and ${t[t.length-1]}`}function Bn(e,t,s){if(!e)return"";if("plan"===e.schedule){const t=e.days??[];return"day"===e.minimum?.per?t.length?On(t):"Every day":t.length?On(t):"Every week"}if("once"===e.schedule){const i=e.once;return i?.on?`Once · on ${Pn(i.on,s)}`:t.dated&&t.due_day?`Once · by ${Pn(t.due_day,s)}`:"Once · any time"}const i=e.repeats?.rrule??"";return i.includes("FREQ=DAILY")?"Repeats daily":i.includes("FREQ=MONTHLY")?"Repeats monthly":"Repeats weekly"}function Nn(e,t){const s=e.due_day&&Qa(t,e.due_day)>=0?e.due_day:t;return(e.due_day?[Tn(s,1),Tn(s,7)]:[Tn(t,1),Tn(t,7)]).map(e=>({day:e,label:zn(e,t)}))}function Rn(e,t){const s=e.due_day&&Qa(t,e.due_day)>=0?e.due_day:t;return[Tn(s,1),Tn(s,2),Tn(s,7)].map(e=>({day:e,label:zn(e,t)}))}function In(e){const t=e.map(e=>e.name);return t.length<=1?t.join(""):`${t.slice(0,-1).join(", ")} and ${t[t.length-1]}`}function Ln(e,t,s){const i=e?.created;if(!i?.at)return null;const a=t.find(e=>e.id===i.by)?.name??("automation"===i.by?"an automation":null),n=i.at.slice(0,10),o=0===Qa(n,s)?"today":`on ${Pn(n,s)}`;return a?`Added by ${a} ${o}`:`Added ${o}`}function qn(e){const{item:t,activity:s,owner:i,members:a,today:n}=e,o=a.filter(e=>e.parent&&e.id!==i.id),r=i.parent,l="pin"===e.member?`🔒 ${i.name}'s PIN`:void 0,d="pin"===e.parent?"🔒 Parent":"no_pin"===e.parent?"Needs a parent's PIN":void 0,c=t.status,h="open"===c||"sent_back"===c,p=[],u=[],m=t.due_day,v="no"!==e.member;if(h&&v){const e=function(e,t){if(!e.due_day||"day"===e.window)return[];const s=Math.min(Qa(t,e.due_day),6),i=[];for(let e=1;e<=s;e++){const s=Tn(t,e);i.push({day:s,label:zn(s,t)})}return i}(t,n);e.length&&p.push({id:"plan_day",label:"Plan it for a day",tag:l,chips:e,hint:m?`Shows on that day, and it's still due ${Pn(m,n)}.`:"Shows on that day."}),r||!m||t.request||(p.push({id:"more_time",label:"Ask for more time",tag:"Needs an OK",chips:Rn(t,n),pick:{min:Tn(m,1),max:Tn(n,60)},hint:o.length?`Sends a request to ${In(o)}.`:"Sends a request to the parents."}),p.push({id:"skip",label:"Ask to skip this week",tag:"Needs an OK",hint:"Sick, away, rained out…"})),p.push({id:"done_by",label:"Done by someone else…",tag:l,hint:"They get the credit."})}"done"!==c&&"pending"!==c||!v||(p.push({id:"undo",label:"Uncheck it",tag:l,hint:"It goes back on the list."}),"done"===c&&p.push({id:"done_by",label:"Done by someone else…",tag:l,hint:"Change who gets the credit."})),p.push({id:"history",label:"History",hint:"The streak, recent check-offs, and when it usually gets done."}),"no"!==e.parent&&("pending"===c&&(u.push({id:"approve",label:"Looks good",tag:d,hint:"Approves it, and the stars are earned."}),u.push({id:"send_back",label:"Send back",tag:d,hint:"It goes back on the list with a note."})),h&&(u.push({id:"change_due",label:"Change the due date",tag:d,chips:Nn(t,n),pick:{min:n},hint:m?`Due ${Pn(m,n)} now.`:"It has no due date now."}),u.push({id:"hand_off",label:"Hand it to someone else",tag:d,hint:"Just this time."}),u.push({id:"excuse",label:"Excuse it",tag:d,hint:"A sick day: nothing is missed, and the streak holds."})),u.push({id:"edit",label:"Edit",tag:d,hint:"Opens it in Settings."}),u.push({id:"delete",label:"Delete chore",tag:d,destructive:!0,hint:"It leaves the board for everyone."}));const g="once"===t.window&&s?.once?s.once.estimate_minutes:t.credit_minutes,b=[i.name,Bn(s,t,n),sn(g)];i.stars&&t.stars>0&&b.push(`★ ${t.stars}`);const y=t.request?"more_time"===t.request.kind&&t.request.until?`Waiting for a parent: more time, until ${Pn(t.request.until,n)}.`:"Waiting for a parent: skip this week.":null;return{title:t.name,meta:b.filter(Boolean).join(" · "),added:Ln(s,a,n),note:"sent_back"===c?t.note?`Sent back: ${t.note}`:"Sent back":y,member:p,parent:u}}const Hn={morning:"in the morning",afternoon:"in the afternoon",evening:"in the evening"},jn={mon:"Mondays",tue:"Tuesdays",wed:"Wednesdays",thu:"Thursdays",fri:"Fridays",sat:"Saturdays",sun:"Sundays"};function Un(e,t,s,i){const a=[];e.streak.days&&a.push(`🔥 ${e.streak.days} ${1===e.streak.days?"day":"days"} in a row`),e.streak.weeks&&a.push(`🔥 ${e.streak.weeks} ${1===e.streak.weeks?"week":"weeks"} in a row`),e.weeks.of>0&&void 0===e.streak.days&&a.push(`Done ${e.weeks.done} of the last ${e.weeks.of} ${1===e.weeks.of?"week":"weeks"}`);const n=e.recent[0];if(n){const o=new Date(n.at),r=n.at.slice(0,10),l="24h"===i?`${o.getHours()}:${String(o.getMinutes()).padStart(2,"0")}`:`${o.getHours()%12||12}:${String(o.getMinutes()).padStart(2,"0")} ${o.getHours()>=12?"PM":"AM"}`,d=n.done_by!==e.member?s.find(e=>e.id===n.done_by)?.name:null;a.push(`Last done ${Pn(r,t)} at ${l}${d?` by ${d}`:""}`)}else a.push("Not done yet");const{band:o,day:r}=e.usual;return r&&o?a.push(`Usually ${jn[r]} ${Hn[o]}`):o&&a.push(`Usually ${Hn[o]}`),a}function Wn(e){return`They get the credit for ${e}.`}const Vn=["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];function Yn(e){const t=Xa(e.week.start);return Ce(t,new Date(t.getFullYear(),t.getMonth(),t.getDate()+6))}function Kn(e){const t={date:e.date,kind:e.kind,away:e.away,dashed:"future"===e.kind};if(e.away)return{...t,label:"Away",tone:"muted",progress:0,closed:!1,empty:!1};const s=e.due??0,i=(e.done??0)+(e.pending??0);return"future"===e.kind?{...t,label:s?`${s} due`:"",tone:"muted",progress:0,closed:!1,empty:!s}:null===e.due?{...t,label:"",tone:"muted",progress:0,closed:!1,empty:!0}:0===s?{...t,label:"Nothing due",tone:"muted",progress:0,closed:!1,empty:!0}:"past"===e.kind&&e.missed>0?{...t,label:`${e.missed} missed`,tone:"bad",progress:Math.min(1,i/s),closed:!1,empty:!1}:{...t,label:`${Math.min(i,s)} of ${s}`,tone:"plain",progress:Math.min(1,i/s),closed:!!e.closed||i>=s,empty:!1}}function Gn(e,t,s){if(0===e.length)return null;const i=e.reduce((e,t)=>e+t.total,0),a=e.reduce((e,t)=>e+t.done,0),n=e.reduce((e,t)=>e+t.pending,0),o=e.filter(e=>e.from&&e.from<s).sort((e,t)=>(e.from??"").localeCompare(t.from??""))[0];let r=null,l="neutral";return o?.from?(r=`${o.name} from ${Vn[Xa(o.from).getDay()]}`,l="time"):n?(r=`⏳ ${n} waiting`,l="act"):a+n<i&&(r=1===t?"Last day":`${t} days left`),{text:`${a+n} of ${i}`,badge:r,badgeTone:l,progress:i?(a+n)/i:0}}const Jn=["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];function Xn(e){const t=e.map(e=>Jn[Xa(e).getDay()]);return t.length<=1?t.join(""):`${t.slice(0,-1).join(", ")} and ${t[t.length-1]}`}function Qn(e,t,s=[]){return e.rewards.map(i=>{const a=new Set([...e.requests.filter(e=>"redemption"===e.kind&&e.reward===i.id).map(e=>e.member),...s.filter(e=>e.reward===i.id).map(e=>e.member)]),n=function(e,t){const s=t.filter(e=>e.stars);return e.who.length?s.filter(t=>e.who.includes(t.id)):s}(i,t).map(t=>{const s=e.members[t.id]?.stars??0;return{member:t,afford:s>=i.cost,more:Math.max(0,i.cost-s),asked:a.has(t.id)}});return{reward:i,people:n,goals:t.filter(e=>e.goal===i.id),asked:t.filter(e=>a.has(e.id)),canRedeem:n.some(e=>e.afford&&!e.asked)}})}function Zn(e,t){if(!e.length)return e;const s=e.filter(e=>!t.requests.some(t=>"redemption"===t.kind&&t.member===e.member&&t.reward===e.reward));return s.length===e.length?e:s}function eo(e){return e?{name:e.name,icon:e.icon??"🎁",cost:e.cost,needsOk:e.needs_ok,who:[...e.who]}:{name:"",icon:"🎁",cost:20,needsOk:!0,who:[]}}function to(e){return e.name.trim()?!Number.isInteger(e.cost)||e.cost<1||e.cost>1e4?"A reward costs from 1 to 10,000 stars.":null:"Add a name."}const so=["🎁","🎬","🎮","🍦","🍕","📱","🌙","💵","🧸","🎨","⚽","🏊","🎟️","🍪"],io=new Set(["open","sent_back"]),ao=new Set(["done","pending"]);function no(e){const t={due:0,done:0,pending:0,minutes_due:0,minutes_done:0,minutes_pending:0};for(const s of e)s.counted&&"away"!==s.status&&"excused"!==s.status&&(t.due+=1,t.minutes_due+=s.credit_minutes,"done"===s.status?(t.done+=1,t.minutes_done+=s.credit_minutes):"pending"===s.status&&(t.pending+=1,t.minutes_pending+=s.credit_minutes));return t}function oo(e){const t=new Date(e),s=e=>String(Math.abs(e)).padStart(2,"0"),i=-t.getTimezoneOffset(),a=i>=0?"+":"-";return`${t.getFullYear()}-${s(t.getMonth()+1)}-${s(t.getDate())}T${s(t.getHours())}:${s(t.getMinutes())}:${s(t.getSeconds())}${a}${s(Math.trunc(i/60))}:${s(i%60)}`}function ro(e,t){if("complete"===t.op&&io.has(e.status)){const s=t.shows??"done";return{...e,status:s,note:null,completion:{id:`queued:${t.id}`,done_by:t.doneBy??e.member,by:"",at:oo(t.at),source:"tablet",state:s,review:null,stars:e.stars}}}return"undo"===t.op&&ao.has(e.status)?{...e,status:"open",completion:null}:e}class lo{constructor(e=5){this._keep=e,this._byToast=new Map}remember(e,t){for(this._byToast.set(e,t);this._byToast.size>this._keep;)this._byToast.delete(this._byToast.keys().next().value)}peek(e){return this._byToast.get(e)}take(e){const t=this._byToast.get(e);return this._byToast.delete(e),t}}function co(e,t,s){const i=new Date(e),a=e=>String(e).padStart(2,"0"),n=`${i.getFullYear()}-${a(i.getMonth()+1)}-${a(i.getDate())}`,o=nn(i,s,"12h"===s),r=Qa(n,t);if(0===r)return`Today at ${o}`;if(1===r)return`Yesterday at ${o}`;const l=Pn(n,t);return`${l[0].toUpperCase()}${l.slice(1)} at ${o}`}function ho(e,t,s){return"completion"===e.kind?t?`${e.what}: looks good.`:`${e.what} went back${s?`: ${s}`:""}.`:"redemption"===e.kind?t?`${e.what} is ${e.member?.name??"theirs"}'s.`:`${e.what}: declined.`:t?`Allowed: ${e.what}.`:`Not this time: ${e.what}.`}function po(e,t,s){return null!=s?Math.trunc(s):Math.max(1,Math.floor(e/t+.5+1e-9))}const uo=[5,15,30,60,120];function mo(e,t){return e.some(e=>"young_child"===t.find(t=>t.id===e)?.age_group)}function vo(e){const t=[Tn(e,1)];for(const s of[6,0]){const i=Xa(e).getDay(),a=Tn(e,(s-i+7)%7||7);t.includes(a)||t.push(a)}return t.map(t=>{const s=Xa(t).getDay(),i=zn(t,e);return{day:t,label:"Tomorrow"===i?i:6===s?"Saturday":0===s?"Sunday":i}})}const go=["SU","MO","TU","WE","TH","FR","SA"],bo=["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];function yo(e){const t=e%100;return t>=11&&t<=13?`${e}th`:`${e}${["th","st","nd","rd"][e%10]??"th"}`}function fo(e,t){return e.name.trim()?0===e.who.length?"Pick who does it.":"by"===e.when&&(!e.by||e.by<t)?"Pick a day to finish by.":!Number.isFinite(e.minutes)||e.minutes<1||e.minutes>1440?"About how long is from 1 minute to 24 hours.":null:"Add what needs doing."}function _o(e){try{navigator.vibrate?.("tick"===e?12:[18,40,28])}catch{}}let wo=null;function xo(e=!1){try{const t=window.AudioContext??window.webkitAudioContext;if(!t)return;wo??=new t;const s=wo.currentTime;(e?[659.25,783.99,1046.5]:[783.99,1046.5]).forEach((e,t)=>{const i=wo.createOscillator(),a=wo.createGain();i.type="sine",i.frequency.value=e;const n=s+.09*t;a.gain.setValueAtTime(0,n),a.gain.linearRampToValueAtTime(.12,n+.02),a.gain.exponentialRampToValueAtTime(1e-4,n+.35),i.connect(a).connect(wo.destination),i.start(n),i.stop(n+.4)})}catch{}}function $o(e){return{tag:"pv-chore-editor",title:e.name,back:"Chores",props:{choreId:e.id}}}const ko={page:"import-export"};class Eo extends de{constructor(){super(...arguments),this.toast=null}disconnectedCallback(){super.disconnectedCallback(),clearTimeout(this._timer)}updated(e){const t=e.get("toast");if(!e.has("toast")||t?.id===this.toast?.id)return;clearTimeout(this._timer);const s=this.toast;if(!s)return;const i=this.renderRoot.querySelector(".toast");if(i)if("reduced"===vi(this))i.animate({opacity:[0,1]},{duration:150});else{const e=mi(ci);i.animate({transform:["translateY(16px)","translateY(0)"],opacity:[0,1]},{duration:e.duration,easing:e.easing})}this._timer=setTimeout(()=>this._gone(s),s.ms??5e3)}render(){const e=this.toast;return e?U`
      <div class="toast ${"bad"===e.tone?"bad":""}" role="status" aria-live="polite">
        <span class="text">${e.text}</span>
        ${(e.actions??[]).map(t=>U`
          <button type="button" @click=${()=>this._act(e,t)}>${t.label}</button>
        `)}
      </div>
    `:Y}_act(e,t){clearTimeout(this._timer),this.dispatchEvent(new CustomEvent("pv-toast-action",{detail:{toast:e,action:t.id},bubbles:!0,composed:!0}))}_gone(e){this.dispatchEvent(new CustomEvent("pv-toast-gone",{detail:{toast:e},bubbles:!0,composed:!0}))}}Eo.styles=o`
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
      background: var(--pv-toast-bg, #1F2023);
      color: var(--pv-toast-text, #F4F4F2);
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
      min-height: 48px;
      min-width: 48px;
      padding: 0 10px;
      border: none;
      border-radius: 10px;
      background: transparent;
      color: var(--pv-toast-action, #A9A9FF);
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
  `,e([ue({attribute:!1})],Eo.prototype,"toast",void 0),ge("pv-toast",Eo);const Fo=(e,t,s)=>{const i=new Map;for(let a=t;a<=s;a++)i.set(e[a],a);return i},Co=bt(class extends yt{constructor(e){if(super(e),2!==e.type)throw Error("repeat() can only be used in text expressions")}dt(e,t,s){let i;void 0===s?s=t:void 0!==t&&(i=t);const a=[],n=[];let o=0;for(const t of e)a[o]=i?i(t,o):o,n[o]=s(t,o),o++;return{values:n,keys:a}}render(e,t,s){return this.dt(e,t,s).values}update(e,[t,s,i]){const a=(e=>e._$AH)(e),{values:n,keys:o}=this.dt(t,s,i);if(!Array.isArray(a))return this.ut=o,n;const r=this.ut??=[],l=[];let d,c,h=0,p=a.length-1,u=0,m=n.length-1;for(;h<=p&&u<=m;)if(null===a[h])h++;else if(null===a[p])p--;else if(r[h]===o[u])l[u]=$t(a[h],n[u]),h++,u++;else if(r[p]===o[m])l[m]=$t(a[p],n[m]),p--,m--;else if(r[h]===o[m])l[m]=$t(a[h],n[m]),xt(e,l[m+1],a[h]),h++,m--;else if(r[p]===o[u])l[u]=$t(a[p],n[u]),xt(e,a[h],a[p]),p--,u++;else if(void 0===d&&(d=Fo(o,u,m),c=Fo(r,h,p)),d.has(r[h]))if(d.has(r[p])){const t=c.get(o[u]),s=void 0!==t?a[t]:null;if(null===s){const t=xt(e,a[h]);$t(t,n[u]),l[u]=t}else l[u]=$t(s,n[u]),xt(e,a[h],s),a[t]=null;u++}else Ft(a[p]),p--;else Ft(a[h]),h++;for(;u<=m;){const t=xt(e,l[m+1]);$t(t,n[u]),l[u++]=t}for(;h<=p;){const e=a[h++];null!==e&&Ft(e)}return this.ut=o,Et(e,l),V}});class So extends de{constructor(){super(...arguments),this.size=58,this.progress=0,this.color="currentColor",this.closed=!1,this.dashed=!1,this.label="",this.celebrate=0,this.tracking=!1}get _stroke(){return this.size>=100?8:this.size>=50?4:3}firstUpdated(){this._setEasing()}updated(e){e.has("celebrate")&&this.celebrate&&void 0!==e.get("celebrate")&&this._play()}_setEasing(){if("reduced"===vi(this))return this.style.setProperty("--pv-ring-ms","180ms"),void this.style.setProperty("--pv-ring-ease","linear");const e=mi(pi);this.style.setProperty("--pv-ring-ms",`${e.duration}ms`),this.style.setProperty("--pv-ring-ease",e.easing)}_play(){const e=this.renderRoot.querySelector(".glow");if(!e)return;if("reduced"===vi(this))return void e.animate({opacity:[0,.5,0]},{duration:500,easing:"ease-out"});e.animate({opacity:[0,.7,0],transform:["scale(0.9)","scale(1.15)","scale(1.25)"]},{duration:900,easing:"ease-out"});const t=mi(hi);this.animate({transform:["scale(1)","scale(1.08)","scale(1)"]},{duration:t.duration,easing:t.easing});const s=[...this.renderRoot.querySelectorAll(".spark")],i=.75*this.size;s.forEach((e,t)=>{const a=t/s.length*Math.PI*2-Math.PI/2,n=Math.cos(a)*i,o=Math.sin(a)*i;e.animate({opacity:[0,1,0],transform:["translate(0, 0) scale(0.6)",`translate(${.7*n}px, ${.7*o}px) scale(1)`,`translate(${n}px, ${o}px) scale(0.4)`]},{duration:800,delay:18*t,easing:"cubic-bezier(0.2, 0.8, 0.2, 1)"})})}render(){const e=this.size,t=this._stroke,s=e/2,i=(e-t)/2,a=2*Math.PI*i,n=this.closed?1:Math.min(1,Math.max(0,this.progress)),o=e-2*t-2*Math.max(2,Math.round(.06*e)),r=Math.max(14,Math.round(.32*e));return U`
      <div style="width:${e}px;height:${e}px;position:relative;display:flex;align-items:center;justify-content:center"
        role=${this.label?"img":Y} aria-label=${this.label||Y}>
        <div class="glow" style="box-shadow: 0 0 0 4px ${this.color}, 0 0 24px 6px ${this.color}"></div>
        ${[0,1,2,3,4,5,6,7].map(()=>U`<span class="spark" style="background:${this.color}"></span>`)}
        <svg class="ring" width=${e} height=${e} viewBox="0 0 ${e} ${e}" aria-hidden="true">
          ${W`
            <circle class="track" cx=${s} cy=${s} r=${i} fill="none" stroke-width=${t}></circle>
            <circle class="fill" cx=${s} cy=${s} r=${i} fill="none" stroke=${this.color}
              stroke-width=${t} stroke-linecap="round" stroke-dasharray=${a}
              stroke-dashoffset=${a*(1-n)} opacity=${n>0?1:0}></circle>
          `}
        </svg>
        <div class="inside" style="width:${o}px;height:${o}px"><slot></slot></div>
        ${this.closed?U`
          <span class="badge" aria-hidden="true"
            style="width:${r}px;height:${r}px;background:${this.color};color:${We(this.color)}">
            <svg width=${Math.round(.6*r)} height=${Math.round(.6*r)} viewBox="0 0 24 24" fill="none"
              stroke="currentColor" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M5 12.5l4.5 4.5L19 7.5"></path>
            </svg>
          </span>
        `:Y}
      </div>
    `}}So.styles=o`
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

    :host([tracking]) .fill {
      transition: none;
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
  `,e([ue({type:Number})],So.prototype,"size",void 0),e([ue({type:Number})],So.prototype,"progress",void 0),e([ue({type:String})],So.prototype,"color",void 0),e([ue({type:Boolean,reflect:!0})],So.prototype,"closed",void 0),e([ue({type:Boolean,reflect:!0})],So.prototype,"dashed",void 0),e([ue({type:String})],So.prototype,"label",void 0),e([ue({type:Number})],So.prototype,"celebrate",void 0),e([ue({type:Boolean,reflect:!0})],So.prototype,"tracking",void 0),ge("pv-ring",So);class Do extends de{constructor(){super(...arguments),this.size=40}render(){const e=this.member;if(!e)return Y;const t=function(e,t){const s=e.picture;if(s&&"string"==typeof s.emoji&&s.emoji)return{kind:"emoji",text:s.emoji};if(s&&!0===s.person&&e.person){const s=t(e.person);if(s)return{kind:"photo",url:s}}return{kind:"initial",text:is(e.name)}}(e,e=>this.hass?.states?.[e]?.attributes?.entity_picture??null),s=Math.round(this.size*("emoji"===t.kind?.55:.42)),i=`width:${this.size}px;height:${this.size}px;font-size:${s}px;background:${e.color};color:${We(e.color)}`;return U`
      <div class="avatar" role="img" aria-label=${e.name} style=${i}>
        ${"photo"===t.kind?U`<img src=${t.url} alt="" />`:t.text}
      </div>
    `}}Do.styles=o`
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
  `,e([ue({attribute:!1})],Do.prototype,"member",void 0),e([ue({attribute:!1})],Do.prototype,"hass",void 0),e([ue({type:Number})],Do.prototype,"size",void 0),ge("pv-member-avatar",Do);class Ao{constructor(e,t=550){this._callbacks=e,this._holdMs=t,this._start=null,this._fill=0}get holding(){return null!==this._start}down(e,t,s){this._start={x:e,y:t,t:s},this._fill=0,this._callbacks.progress(0)}frame(e){this._start&&(this._fill=Math.min(1,Math.max(0,(e-this._start.t)/this._holdMs)),this._callbacks.progress(this._fill),this._fill>=1&&(this._start=null,this._callbacks.complete()))}move(e,t){this._start&&Math.hypot(e-this._start.x,t-this._start.y)>12&&this._stop(!1)}up(e){this._start&&this._stop(e-this._start.t<200)}cancel(){this._start&&this._stop(!1)}key(e){return(" "===e||"Enter"===e)&&(this._start=null,this._fill=1,this._callbacks.progress(1),this._callbacks.complete(),!0)}_stop(e){this._start=null,this._callbacks.rewind(this._fill),e&&this._callbacks.tap()}}function Mo(e,t){return e?e.key!==t.key?"reset":e.state!==t.state?"answered":"none":"none"}const To=11.5,zo=2*Math.PI*To;class Po extends de{constructor(){super(...arguments),this.color="#5B5BD6",this.highlight=!1,this.narrow=!1,this.locked=!1,this.dim=!1,this._fill=0,this._held=!1,this._frame=0,this._rewindFrame=0,this._hintPress=null,this._gesture=new Ao({progress:e=>{this._fill=e},complete:()=>this._finish(),rewind:e=>this._rewind(e),tap:()=>this._fire("pv-hint",{row:this.row})}),this._celebrate=!1,this._down=e=>{if(e.button>0)return;if(!this._holdable)return void(this._hintPress={x:e.clientX,y:e.clientY,t:performance.now()});if(this._held)return;cancelAnimationFrame(this._rewindFrame);const t=e.currentTarget;try{t.setPointerCapture(e.pointerId)}catch{}this._gesture.down(e.clientX,e.clientY,performance.now());const s=e=>{this._gesture.frame(e),this._gesture.holding&&(this._frame=requestAnimationFrame(s))};this._frame=requestAnimationFrame(s)},this._move=e=>{this._gesture.move(e.clientX,e.clientY)},this._up=e=>{const t=this._hintPress;if(t)return this._hintPress=null,void(!!e&&performance.now()-t.t<550&&Math.hypot(e.clientX-t.x,e.clientY-t.y)<=12&&this._fire("pv-hint",{row:this.row}));cancelAnimationFrame(this._frame),this._gesture.up(performance.now())},this._cancel=()=>{this._hintPress=null,cancelAnimationFrame(this._frame),this._gesture.cancel()},this._lost=()=>{this._gesture.holding&&this._up()},this._key=e=>{" "!==e.key&&"Enter"!==e.key||(e.preventDefault(),this._holdable&&!this._held?this._gesture.key(e.key):this._fire("pv-hint",{row:this.row}))},this._options=()=>{this._fire("pv-row-options",{row:this.row})},this._context=e=>{e.preventDefault(),this._options()}}willUpdate(e){if(e.has("row")){const t=Mo(e.get("row"),this.row);this.dataset.state=this.row.state,"none"!==t&&(this._held=!1,this._fill=0),"answered"!==t||"done"!==this.row.state&&"pending"!==this.row.state||(this._celebrate=!0)}}updated(){if(!this._celebrate)return;this._celebrate=!1;const e="reduced"===vi(this),t=this.renderRoot.querySelector(".check"),s=this.renderRoot.querySelector(".mark"),i=this.renderRoot.querySelector(".strike");if(e)return void t?.animate({opacity:[0,1]},{duration:150});const a=mi(hi);t?.animate({transform:["scale(0.55)","scale(1)"]},{duration:a.duration,easing:a.easing}),s?.animate({strokeDashoffset:[24,0]},{duration:320,delay:60,easing:"cubic-bezier(0.3, 0.7, 0.2, 1)",fill:"backwards"}),i?.animate({transform:["scaleX(0)","scaleX(1)"]},{duration:300,delay:120,easing:"ease-out",fill:"backwards"}),this.renderRoot.querySelector(".sparkles")?.animate({opacity:[0,1,0],transform:["translateY(4px)","translateY(-6px)"]},{duration:700,easing:"ease-out"})}disconnectedCallback(){super.disconnectedCallback(),cancelAnimationFrame(this._frame),cancelAnimationFrame(this._rewindFrame)}get _done(){return"done"===this.row.state}get _holdable(){return!this.locked&&("open"===this.row.state||"sent_back"===this.row.state||"done"===this.row.state)}_finish(){this._held=!0,this._fill=1;const e=this.renderRoot.querySelector(".circle")?.getBoundingClientRect()??new DOMRect,t={row:this.row,from:e,settle:e=>{e||this._rewind(1)}};this._fire(this._done?"pv-hold-undo":"pv-hold-done",t)}_rewind(e){if(this._held=!1,e<=0||"reduced"===vi(this))return void(this._fill=0);const t=performance.now(),s=220*e,i=a=>{const n=Math.min(1,(a-t)/s);this._fill=e*(1-n),n<1&&!this._gesture.holding&&(this._rewindFrame=requestAnimationFrame(i))};cancelAnimationFrame(this._rewindFrame),this._rewindFrame=requestAnimationFrame(i)}_fire(e,t){this.dispatchEvent(new CustomEvent(e,{detail:t,bubbles:!0,composed:!0}))}render(){const e=this.row;if(!e)return Y;const t=this.color,s=e.state,i="done"===s,a="pending"===s,n=this._held?1:this._fill,o=i?`Hold to uncheck ${e.name}`:`Hold to complete ${e.name}`,r=U`
      ${e.badge?U`
        <span class="badge ${e.badge.tone}">${e.badge.glyph?U`<span aria-hidden="true">${e.badge.glyph}</span>`:Y}${e.badge.words}</span>
      `:Y}
      ${e.badge||!e.meta||i?Y:U`<span class="meta">${e.meta}</span>`}
      ${i&&e.doneAt?U`<span class="meta">${e.doneBy?`${e.doneBy} · `:""}${e.doneAt}</span>`:Y}
    `;return U`
      <div class="row" style="--member:${t}">
        <div class="sweep" style="transform: scaleX(${i?0:n})"></div>
        <button class="circle" type="button" aria-label=${o} aria-disabled=${this.locked?"true":"false"}
          @pointerdown=${this._down} @pointermove=${this._move} @pointerup=${this._up}
          @pointercancel=${this._cancel} @lostpointercapture=${this._lost} @keydown=${this._key}
          @contextmenu=${e=>e.preventDefault()}>
          <svg width=${26} height=${26} viewBox="0 0 26 26" aria-hidden="true">
            ${i?W`
              <g class="check" style="transform-origin: 13px 13px">
                <circle cx="13" cy="13" r="12.5" fill=${t}></circle>
                <path class="mark" d="M7.5 13.4l3.6 3.6 7.4-7.6" fill="none" stroke=${We(t)} stroke-width="2.6"
                  stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="24"></path>
              </g>
              <circle cx="13" cy="13" r="15.5" fill="none" stroke=${t} stroke-width="2.4" stroke-linecap="round"
                stroke-dasharray=${2*Math.PI*15.5} stroke-dashoffset=${2*Math.PI*15.5*(1-n)}
                transform="rotate(-90 13 13)" opacity=${n>0?.55:0}></circle>
            `:W`
              <circle cx="13" cy="13" r=${To} fill="none" stroke=${t} stroke-width="2.4"
                stroke-dasharray=${a?"3.2 3.2":"none"} opacity=${a?.9:1}></circle>
              ${a?W`<text x="13" y="17.2" text-anchor="middle" font-size="11">⏳</text>`:Y}
              <circle cx="13" cy="13" r=${To} fill="none" stroke=${t} stroke-width="3.4" stroke-linecap="round"
                stroke-dasharray=${zo} stroke-dashoffset=${zo*(1-n)}
                transform="rotate(-90 13 13)" opacity=${n>0?1:0}></circle>
            `}
          </svg>
        </button>
        <button class="about ${l=e.badge,d=this.narrow,l&&(d||l.words.length>14)?"below":""}" type="button"
          @click=${this._options} @contextmenu=${this._context}
          aria-label=${`${e.name}${e.badge?`, ${e.badge.words}`:""}. Options`}>
          <span class="name"><span class="text">${e.name}<span class="strike"></span></span>${e.label?U`<span class="label">${e.label}</span>`:Y}</span>
          <span class="end">${r}</span>
        </button>
        <span class="sparkles" aria-hidden="true">✦ ✧ ✦</span>
      </div>
    `;var l,d}}function Oo(e){return e&&!e.startsWith("mdi:")?e:"⭐"}Po.styles=[Ka,o`
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

      /* A long badge (a sent-back note) sits under the name and wraps, in any panel. */
      .about.below {
        flex-direction: column;
        align-items: flex-start;
        justify-content: center;
        gap: 3px;
      }

      .about.below .name {
        flex: none;
      }

      .about.below .end,
      :host([narrow]) .end {
        flex-shrink: 1;
        min-width: 0;
        max-width: 100%;
      }

      .about.below .badge,
      :host([narrow]) .badge {
        white-space: normal;
        text-align: left;
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
    `],e([ue({attribute:!1})],Po.prototype,"row",void 0),e([ue({type:String})],Po.prototype,"color",void 0),e([ue({type:Boolean,reflect:!0})],Po.prototype,"highlight",void 0),e([ue({type:Boolean,reflect:!0})],Po.prototype,"narrow",void 0),e([ue({type:Boolean})],Po.prototype,"locked",void 0),e([ue({type:Boolean,reflect:!0})],Po.prototype,"dim",void 0),e([me()],Po.prototype,"_fill",void 0),e([me()],Po.prototype,"_held",void 0),ge("pv-chore-item",Po);class Bo extends de{constructor(){super(...arguments),this.color="#5B5BD6",this.now=!1,this.large=!1,this.locked=!1,this.stars=0,this._fill=0,this._held=!1,this._tracking=!0,this._frame=0,this._celebrate=!1,this._gesture=new Ao({progress:e=>{this._tracking=!0,this._fill=e},complete:()=>this._finish(),rewind:()=>{this._tracking=!1,this._held=!1,this._fill=0},tap:()=>this._fire("pv-hint",{row:this.row})}),this._hintPress=null,this._down=e=>{if(e.button>0)return;if(!this._holdable)return void(this._hintPress={x:e.clientX,y:e.clientY,t:performance.now()});if(this._held)return;try{e.currentTarget.setPointerCapture(e.pointerId)}catch{}this._gesture.down(e.clientX,e.clientY,performance.now());const t=e=>{this._gesture.frame(e),this._gesture.holding&&(this._frame=requestAnimationFrame(t))};this._frame=requestAnimationFrame(t)},this._up=e=>{const t=this._hintPress;if(t)return this._hintPress=null,void(!!e&&performance.now()-t.t<550&&Math.hypot(e.clientX-t.x,e.clientY-t.y)<=12&&this._fire("pv-hint",{row:this.row}));cancelAnimationFrame(this._frame),this._gesture.up(performance.now())},this._key=e=>{" "!==e.key&&"Enter"!==e.key||(e.preventDefault(),this._holdable&&!this._held&&this._gesture.key(e.key))}}willUpdate(e){if(e.has("row")){const t=Mo(e.get("row"),this.row);"none"!==t&&(this._tracking=!0,this._held=!1,this._fill=0),"answered"!==t||"done"!==this.row.state&&"pending"!==this.row.state||(this._celebrate=!0)}}updated(){if(!this._celebrate)return;this._celebrate=!1;const e=this.renderRoot.querySelector(".tile");if("reduced"===vi(this))return void e?.animate({opacity:[.5,1]},{duration:160});const t=mi(hi);e?.animate({transform:["scale(0.94)","scale(1)"]},{duration:t.duration,easing:t.easing})}disconnectedCallback(){super.disconnectedCallback(),cancelAnimationFrame(this._frame)}get _holdable(){const e=this.row.state;return!this.locked&&("open"===e||"sent_back"===e||"done"===e)}_finish(){this._held=!0,this._fill=1;const e=this.renderRoot.querySelector(".picture")?.getBoundingClientRect()??new DOMRect,t={row:this.row,from:e,settle:e=>{e||(this._tracking=!1,this._held=!1,this._fill=0)}};this._fire("done"===this.row.state?"pv-hold-undo":"pv-hold-done",t)}_fire(e,t){this.dispatchEvent(new CustomEvent(e,{detail:t,bubbles:!0,composed:!0}))}render(){const e=this.row;if(!e)return Y;const t=e.state,s="done"===t,i="pending"===t,a=this._held?1:this._fill,n=this.large?132:84;return U`
      <div class="tile ${i?"pending":""} ${s?"done":""}" style="--member:${this.color}">
        <div class="hold" role="button" tabindex=${this.locked?-1:0} aria-disabled=${this.locked?"true":"false"}
          aria-label=${s?`${e.name}, done. Hold to uncheck`:i?`${e.name}, waiting for OK`:`Hold to complete ${e.name}`}
          @pointerdown=${this._down} @pointermove=${e=>this._gesture.move(e.clientX,e.clientY)}
          @pointerup=${this._up} @pointercancel=${()=>{this._hintPress=null,this._gesture.cancel()}} @keydown=${this._key}
          @contextmenu=${e=>e.preventDefault()}>
        ${s?U`
          <span class="tick" style="background:${this.color};color:${We(this.color)}" aria-hidden="true">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5"></path></svg>
          </span>
        `:Y}
        <pv-ring size=${n} .progress=${a} ?tracking=${this._tracking} color=${this.color}>
          <span class="picture" aria-hidden="true">${wn(e.icon,e.name)}</span>
        </pv-ring>
        <span class="name">${e.name}</span>
        ${i?U`<span class="waiting">⏳ Waiting for OK</span>`:U`<span class="hint">${a>0&&!s?U`Keep holding… ${this.stars>0?`⭐ +${this.stars}`:""}`:this.large&&!s?"Hold me":""}</span>`}
        </div>
        <button class="more" type="button" aria-label=${`Options for ${e.name}`}
          @click=${()=>this._fire("pv-row-options",{row:e})}>
          <span aria-hidden="true">⋯</span>
        </button>
      </div>
    `}}Bo.styles=o`
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
  `,e([ue({attribute:!1})],Bo.prototype,"row",void 0),e([ue({type:String})],Bo.prototype,"color",void 0),e([ue({type:Boolean,reflect:!0})],Bo.prototype,"now",void 0),e([ue({type:Boolean,reflect:!0})],Bo.prototype,"large",void 0),e([ue({type:Boolean})],Bo.prototype,"locked",void 0),e([ue({type:Number})],Bo.prototype,"stars",void 0),e([me()],Bo.prototype,"_fill",void 0),e([me()],Bo.prototype,"_held",void 0),e([me()],Bo.prototype,"_tracking",void 0),ge("pv-chore-tile",Bo);class No extends de{constructor(){super(...arguments),this._scroll=new Hi,this.color="#5B5BD6",this.narrow=!1,this.locked=!1,this.celebrate=0,this.pulse=0,this.member="",this._before=null}willUpdate(e){e.has("color")&&this.style.setProperty("--member",this.color),e.has("model")&&e.get("model")&&(this._before=function(e){const t=new Map;for(const s of e){const e=s.dataset.key;e&&t.set(e,s.getBoundingClientRect())}return t}(this.renderRoot.querySelectorAll("[data-key]")))}updated(e){this._before&&(function(e,t,s){const i="reduced"===vi(s),a=mi(ci);for(const s of e){const e=s.dataset.key,n=e?t.get(e):void 0;if(!n)continue;const o=s.getBoundingClientRect(),r=n.left-o.left,l=n.top-o.top;Math.abs(r)<1&&Math.abs(l)<1||(i?s.animate({opacity:[.4,1]},{duration:160,easing:"ease-out"}):s.animate({transform:[`translate(${r}px, ${l}px)`,"translate(0, 0)"]},{duration:a.duration,easing:a.easing}))}}(this.renderRoot.querySelectorAll("[data-key]"),this._before,this),this._before=null),e.has("pulse")&&this.pulse&&void 0!==e.get("pulse")&&this._pulse()}_pulse(){"reduced"!==vi(this)&&this.animate({boxShadow:["0 0 0 0 transparent",`0 0 0 6px color-mix(in srgb, ${this.color} 35%, transparent)`,"0 0 0 0 transparent"]},{duration:1400,easing:"ease-in-out"})}flyStars(e,t){const s=this.renderRoot.querySelector(".layer"),i=this.renderRoot.querySelector(".stars");s&&(function(e,t,s,i,a){if(a<=0)return;const n=t.getBoundingClientRect(),o=document.createElement("span");o.textContent=`+${a} ★`,o.setAttribute("aria-hidden","true"),Object.assign(o.style,{position:"absolute",left:s.left-n.left+s.width/2+"px",top:s.top-n.top+"px",transform:"translate(-50%, 0)",font:"800 15px var(--pv-font-heading, ui-rounded, system-ui, sans-serif)",color:"var(--pv-star, #8A6A00)",pointerEvents:"none",zIndex:"30",whiteSpace:"nowrap"}),t.appendChild(o);const r=()=>o.remove();if("reduced"===vi(e)||!i)return void o.animate({opacity:[0,1,0]},{duration:700,easing:"ease-out"}).finished.then(r,r);const l=i.left+i.width/2-(s.left+s.width/2),d=i.top-s.top,c=mi(ci);o.animate([{transform:"translate(-50%, 0) scale(0.8)",opacity:0},{transform:"translate(-50%, -14px) scale(1.1)",opacity:1,offset:.25},{transform:`translate(calc(-50% + ${l}px), ${d}px) scale(0.7)`,opacity:.2}],{duration:Math.max(650,c.duration),easing:"cubic-bezier(0.3, 0.7, 0.2, 1)"}).finished.then(r,r)}(this,s,e,i?.getBoundingClientRect()??null,t),window.setTimeout(()=>function(e,t){if(!e||"reduced"===vi(t))return;const s=mi(hi);e.animate({transform:["scale(1)","scale(1.18)","scale(1)"]},{duration:s.duration,easing:s.easing})}(this.renderRoot.querySelector(".stars"),this),600))}_open(){this.dispatchEvent(new CustomEvent("pv-member-open",{detail:{member:this.model.member.id},bubbles:!0,composed:!0}))}render(){const e=this.model;if(!e)return Y;const t=e.member;return U`
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
      <div class="body" ${qi(this._scroll.attach)}>
        ${e.away?U`<div class="away">🧳 Away${e.away.note?` · ${e.away.note}`:""}. Nothing is due, and the streak keeps.</div>`:Y}
        ${e.ring.closed&&!e.entries.some(e=>"row"===e.kind&&("now"===e.zone||"later"===e.zone||"overdue"===e.zone))?U`<div class="closed"><strong>Ring closed for today</strong><span>Everything due today is done. Nice work.</span></div>`:Y}
        ${e.pictures?this._tiles(e):this._list(e)}
        ${e.empty&&!e.away?U`<div class="quiet">Nothing on the board today.</div>`:Y}
        <div class="layer"></div>
      </div>
    `}_next(e){const t=/^Next on calendar: (.*?)( · free until then)?$/.exec(e);return t?U`Next on calendar: <strong>${t[1]}</strong>${t[2]??""}`:e}_list(e){return Co(e.entries,e=>e.key,e=>this._entry(e))}_entry(e){return"head"===e.kind?U`
        <div class="head-row ${e.tone}" data-key=${e.key}>
          <span class="text">${e.text}</span>${e.right?U`<span>${e.right}</span>`:Y}
        </div>
      `:"credit"===e.kind?U`<div class="credit" data-key=${e.key}>${e.text}</div>`:U`
      <pv-chore-item data-key=${e.key} .row=${e.row} color=${this.color} ?narrow=${this.narrow}
        ?highlight=${"now"===e.zone} ?dim=${"later"===e.zone} ?locked=${this.locked}></pv-chore-item>
    `}_tiles(e){const t=[];let s=!0;for(const i of e.entries)"row"===i.kind&&"done"!==i.zone&&(t.push({row:i.row,now:s&&"pending"!==i.row.state,stars:e.member.stars?i.row.item.stars:0}),"pending"!==i.row.state&&(s=!1));for(const s of e.entries)"row"===s.kind&&"done"===s.zone&&t.push({row:s.row,now:!1,stars:0});const i=e.entry.week_stars;return U`
      <div class="tiles">
        ${Co(t,e=>e.row.key,e=>U`
          <pv-chore-tile data-key=${e.row.key} .row=${e.row} color=${this.color} ?now=${e.now} ?locked=${this.locked}
            .stars=${e.stars}></pv-chore-tile>
        `)}
      </div>
      ${e.member.stars?U`
        <div class="stickers">
          ${Cn(i)}
          <div class="row" role="img" aria-label=${`${i} ${1===i?"star":"stars"} this week`}>
            ${Array.from({length:Math.min(20,i)},()=>U`<span aria-hidden="true">⭐</span>`)}
            ${i>20?U`<span class="meta">+${i-20}</span>`:Y}
            ${0===i?U`<span class="meta">Stars show up here.</span>`:Y}
          </div>
        </div>
      `:Y}
    `}}No.styles=[Ka,o`
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
    `],e([ue({attribute:!1})],No.prototype,"model",void 0),e([ue({attribute:!1})],No.prototype,"hass",void 0),e([ue({type:String})],No.prototype,"color",void 0),e([ue({type:Boolean,reflect:!0})],No.prototype,"narrow",void 0),e([ue({type:Boolean})],No.prototype,"locked",void 0),e([ue({type:Number})],No.prototype,"celebrate",void 0),e([ue({type:Number})],No.prototype,"pulse",void 0),e([ue({type:String,reflect:!0})],No.prototype,"member",void 0),ge("pv-chores-column",No);const Ro=12;class Io extends de{constructor(){super(...arguments),this.household=null,this.session=null,this.data=null,this.timeFormat="12h",this.mode="light",this.layout="landscape",this.minute=0,this._width=0,this._phoneIndex=0,this._phonePicked=!1,this._celebrate={},this._pulse={},this._family=!1,this._closed=new Map,this._evening=!1,this._celebrated=new Set,this._familyDay=null,this._touch=null,this._columnsFor=Dt((e,t,s,i,a,n)=>{const o=t?ss(t.members):[],r=new Date;return gn(e,{today:e.today,now:r,events:on(s,new Date(e.day.start),new Date(e.day.end),i),timeFormat:a,activities:new Map(e.chores.map(e=>[e.id,e])),members:o})}),this._touchStart=e=>{this._touch=1===e.touches.length?{x:e.touches[0].clientX,y:e.touches[0].clientY}:null}}connectedCallback(){super.connectedCallback(),this._observer=new ResizeObserver(e=>{const t=Math.round(e[0]?.contentRect.width??0);Math.abs(t-this._width)>=1&&(this._width=t)}),this._observer.observe(this)}disconnectedCallback(){super.disconnectedCallback(),this._observer?.disconnect()}_columns(){return this._columnsFor(this.board,this.household,this.data,this.cardConfig,this.timeFormat,this.minute)}willUpdate(e){if(!this._phonePicked&&(e.has("board")||e.has("household"))){const e=this._columns().map(e=>e.member.id);this._phoneIndex=Math.max(0,e.indexOf(ki(e,null,this.household?.account?.member_id??null)??""))}if(!e.has("board")&&!e.has("minute"))return;const t=this._columns(),s=void 0!==e.get("board")||this._closed.size>0,i={...this._celebrate},a=this.board.today,n=s?function(e,t,s,i){const a=[];for(const n of e){const e=n.member.id;!1===t.get(e)&&n.ring.closed&&!s.has(`${e}|${i}`)&&(s.add(`${e}|${i}`),a.push(e))}return a}(t,this._closed,this._celebrated,a):[];for(const e of n)i[e]=(i[e]??0)+1;const o=n.length>0;for(const e of t)this._closed.set(e.member.id,e.ring.closed);const r=function(e){const t=e.filter(e=>e.entry.today.due>0);return t.length>0&&t.every(e=>e.ring.closed)}(t);if(r&&s&&o&&this._familyDay!==a){this._familyDay=a,this._family=!0;for(const e of t)e.entry.today.due>0&&(i[e.member.id]=(i[e.member.id]??0)+1);window.setTimeout(()=>{this._family=!1},6e3)}o&&(this._celebrate=i,_o("ring"),this.board.settings.sound&&xo(!0));const l=bn(t,this.board,new Date);if(l&&!this._evening&&this._closed.size>0){const e={...this._pulse};for(const t of l.members)e[t]=(e[t]??0)+1;this._pulse=e}this._evening=!!l}flyStars(e,t,s){const i=this.renderRoot.querySelector(`pv-chores-column[member="${e}"]`);i?.flyStars(t,s)}render(){if(!this.board)return Y;const e=this._columns(),t=bn(e,this.board,new Date),s=U`
      ${this._family?U`<div class="celebrate" role="status">🎉 Everyone closed their ring today. What a team.</div>`:Y}
      ${t?U`<div class="banner info" role="status"><span class="text">${t.text}</span></div>`:Y}
    `;if("phone"===this.layout)return U`${s}${this._phone(e)}`;const i=Math.max(0,this._width-24),a=function(e,t,s=12,i=240){if(e<=0)return[];const a=Math.max(1,Math.floor((t+s)/(i+s)));if(e<=a)return[e];const n=Math.ceil(e/a),o=Math.ceil(e/n),r=[];let l=e;for(;l>0;)r.push(Math.min(o,l)),l-=o;return r}(e.length,i||1200,Ro),n=Math.max(...a,1),o=i>0&&(i-Ro*(n-1))/n<300;let r=0;return U`
      ${s}
      <div class="rows">
        ${a.map(t=>{const s=e.slice(r,r+t);return r+=t,U`<div class="row">${Co(s,e=>e.member.id,e=>this._column(e,o))}</div>`})}
      </div>
    `}_column(e,t){const s=e.member.id;return U`
      <pv-chores-column member=${s} .model=${e} .hass=${this.hass} color=${ls(e.member,this.mode)}
        ?narrow=${t} ?locked=${"no"===Ms(this.household,this.session,s)}
        .celebrate=${this._celebrate[s]??0} .pulse=${this._pulse[s]??0}></pv-chores-column>
    `}_phone(e){if(0===e.length)return Y;const t=Math.min(this._phoneIndex,e.length-1),s=e[t];return U`
      <div class="pv-people" role="tablist" aria-label="Whose chores">
        ${e.map((e,s)=>U`
          <button type="button" class="pv-person" role="tab" aria-selected=${s===t?"true":"false"}
            style="--member:${ls(e.member,this.mode)}" @click=${()=>this._show(s)}>
            <pv-ring size="40" .progress=${e.ring.progress} ?closed=${e.ring.closed} color=${ls(e.member,this.mode)}>
              <pv-member-avatar .member=${{...e.member,color:ls(e.member,this.mode)}} .hass=${this.hass} size="28"></pv-member-avatar>
            </pv-ring>
            ${e.member.name}
          </button>
        `)}
      </div>
      <div class="phone" @touchstart=${this._touchStart} @touchend=${t=>this._touchEnd(t,e.length)}>
        ${Ct(s.member.id,this._column(s,!0))}
      </div>
    `}_show(e){const t=this._phoneIndex;this._phonePicked=!0,this._phoneIndex=e,t!==e&&"reduced"!==vi(this)&&this.updateComplete.then(()=>{const s=this.renderRoot.querySelector(".phone pv-chores-column");s?.animate({transform:[`translateX(${e>t?24:-24}px)`,"translateX(0)"],opacity:[.4,1]},{duration:220,easing:"ease-out"})})}_touchEnd(e,t){const s=this._touch;this._touch=null;const i=e.changedTouches[0];if(!s||!i)return;const a=St(i.clientX-s.x,i.clientY-s.y);"next"===a&&this._phoneIndex<t-1&&this._show(this._phoneIndex+1),"prev"===a&&this._phoneIndex>0&&this._show(this._phoneIndex-1)}}Io.styles=[wi,Ka,o`
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
        gap: ${Ro}px;
        padding: ${Ro}px;
      }

      .row {
        flex: 1 1 0;
        min-height: 0;
        display: flex;
        gap: ${Ro}px;
      }

      pv-chores-column {
        flex: 1 1 0;
      }




      .phone {
        flex: 1 1 auto;
        min-height: 0;
        display: flex;
        padding: ${Ro}px;
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
    `],e([ue({attribute:!1})],Io.prototype,"board",void 0),e([ue({attribute:!1})],Io.prototype,"household",void 0),e([ue({attribute:!1})],Io.prototype,"session",void 0),e([ue({attribute:!1})],Io.prototype,"data",void 0),e([ue({attribute:!1})],Io.prototype,"cardConfig",void 0),e([ue({attribute:!1})],Io.prototype,"hass",void 0),e([ue({attribute:!1})],Io.prototype,"timeFormat",void 0),e([ue({attribute:!1})],Io.prototype,"mode",void 0),e([ue({type:String,reflect:!0})],Io.prototype,"layout",void 0),e([ue({attribute:!1})],Io.prototype,"minute",void 0),e([me()],Io.prototype,"_width",void 0),e([me()],Io.prototype,"_phoneIndex",void 0),e([me()],Io.prototype,"_celebrate",void 0),e([me()],Io.prototype,"_pulse",void 0),e([me()],Io.prototype,"_family",void 0),ge("pv-chores-board",Io);class Lo extends de{constructor(){super(...arguments),this._backdrop=ta(()=>this._pick(null)),this.layout="landscape",this.heading="",this.body="",this.people=[],this.colorOf=e=>e.color,this._motion=new Zi(this),this._detach=null,this._closing=!1,this._key=e=>{if("Escape"===e.key)return e.preventDefault(),void this._pick(null);Ds(this.shadowRoot,e)}}firstUpdated(){const e=this.renderRoot.querySelector(".panel"),t=this.renderRoot.querySelector(".backdrop");this._motion.open(e,t),this._detach=this._motion.attachDrag(this.renderRoot.querySelector(".grab-zone"),e,()=>this._pick(null)),this.renderRoot.querySelector("#people-heading")?.focus()}disconnectedCallback(){super.disconnectedCallback(),this._detach?.()}render(){return U`
      <div class="backdrop" @pointerdown=${this._backdrop.down} @click=${this._backdrop.click}></div>
      <div class="panel" role="dialog" aria-modal="true" aria-labelledby="people-heading" @keydown=${this._key}>
        <div class="grab-zone" aria-hidden="true"><div class="grab"></div></div>
        <h2 class="heading" id="people-heading" tabindex="-1">${this.heading}</h2>
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
    `}async _pick(e){if(this._closing)return;this._closing=!0;const t=this.renderRoot.querySelector(".panel"),s=this.renderRoot.querySelector(".backdrop");await this._motion.close(t,s),this.dispatchEvent(new CustomEvent("pv-person-pick",{detail:{member:e},bubbles:!0,composed:!0}))}}Lo.styles=[ct,Xi,o`
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
    `],e([ue({type:String,reflect:!0})],Lo.prototype,"layout",void 0),e([ue({type:String})],Lo.prototype,"heading",void 0),e([ue({type:String})],Lo.prototype,"body",void 0),e([ue({attribute:!1})],Lo.prototype,"people",void 0),e([ue({attribute:!1})],Lo.prototype,"hass",void 0),e([ue({attribute:!1})],Lo.prototype,"colorOf",void 0),ge("pv-chores-people-sheet",Lo);class qo extends de{constructor(){super(...arguments),this.value="",this.min="",this.max="",this.placeholder="Pick a date",this.disabled=!1,this._open=!1,this._year=0,this._month=0,this._toggle=()=>{if(this._open=!this._open,!this._open)return;const e=this.value||this.min||"",t=new Date,[s,i]=e?e.split("-").map(Number):[t.getFullYear(),t.getMonth()+1];this._year=s,this._month=i-1,this.updateComplete.then(()=>{const e=this.renderRoot;(e.querySelector(".picker-day.selected")??e.querySelector(".picker-day.today")??e.querySelector(".picker-day:not([disabled])"))?.focus()})},this._key=e=>{"Escape"===e.key&&(e.preventDefault(),e.stopPropagation(),this._open=!1,this.updateComplete.then(()=>this.renderRoot.querySelector(".picker-field")?.focus()))}}render(){return U`
      <button class="picker-field" type="button" aria-expanded=${this._open?"true":"false"}
        aria-label=${this.getAttribute("aria-label")??Y} ?disabled=${this.disabled} @click=${this._toggle}>
        <ha-icon icon="mdi:calendar"></ha-icon>
        <span class=${this.value?"":"placeholder"}>${this.value?ca(this.value):this.placeholder}</span>
      </button>
      ${this._open?U`
        <div class="panel" @keydown=${this._key}>
          ${pa({year:this._year,month:this._month,selected:this.value,min:this.min||void 0,max:this.max||void 0,onPick:e=>this._pick(e),onPrev:()=>this._step(-1),onNext:()=>this._step(1)})}
        </div>
      `:Y}
    `}_step(e){const t=function(e,t,s){const i=new Date(e,t+s,1);return{year:i.getFullYear(),month:i.getMonth()}}(this._year,this._month,e);this._year=t.year,this._month=t.month}_pick(e){this.value=e,this._open=!1,this.dispatchEvent(new Event("change",{bubbles:!0,composed:!0})),this.updateComplete.then(()=>this.renderRoot.querySelector(".picker-field")?.focus())}}qo.styles=[ma,o`
      :host {
        display: inline-block;
        max-width: 100%;
      }

      .panel {
        margin-top: 6px;
        padding: 8px;
        border: 1px solid var(--pv-border, #E7E7E3);
        border-radius: 12px;
        background: var(--pv-card-bg, #FFFFFF);
        width: max-content;
        max-width: 100%;
        box-sizing: border-box;
      }
    `],e([ue({type:String})],qo.prototype,"value",void 0),e([ue({type:String})],qo.prototype,"min",void 0),e([ue({type:String})],qo.prototype,"max",void 0),e([ue({type:String})],qo.prototype,"placeholder",void 0),e([ue({type:Boolean,reflect:!0})],qo.prototype,"disabled",void 0),e([me()],qo.prototype,"_open",void 0),e([me()],qo.prototype,"_year",void 0),e([me()],qo.prototype,"_month",void 0),ge("pv-date-field",qo);const Ho={plan_day:"📅",more_time:"⏰",skip:"🛌",done_by:"🙋",history:"📜",undo:"↩️",change_due:"🗓️",hand_off:"🔁",excuse:"🤒",edit:"✏️",delete:"🗑️",approve:"✅",send_back:"↩️"},jo=["Not finished","Missed a spot","Do it again"];class Uo extends de{constructor(){super(...arguments),this._backdrop=ta(()=>{this.close()}),this.layout="landscape",this.color="#5B5BD6",this.history=null,this.busy=!1,this._open=null,this._note="",this._motion=new Zi(this),this._detach=null,this._closing=!1,this._key=e=>{if("Escape"===e.key)return e.preventDefault(),void this.close();Ds(this.shadowRoot,e)}}firstUpdated(){this.style.setProperty("--member",this.color);const e=this.renderRoot.querySelector(".panel"),t=this.renderRoot.querySelector(".backdrop");this._motion.open(e,t),this._detach=this._motion.attachDrag(this.renderRoot.querySelector(".grab-zone"),e,()=>{this.close()}),this.renderRoot.querySelector("#options-title")?.focus()}disconnectedCallback(){super.disconnectedCallback(),this._detach?.()}async close(){if(this._closing)return;this._closing=!0;const e=this.renderRoot.querySelector(".panel"),t=this.renderRoot.querySelector(".backdrop");await this._motion.close(e,t),this.dispatchEvent(new CustomEvent("pv-sheet-close",{bubbles:!0,composed:!0}))}render(){const e=this.model;return e?U`
      <div class="backdrop" @pointerdown=${this._backdrop.down} @click=${this._backdrop.click}></div>
      <div class="panel" role="dialog" aria-modal="true" aria-labelledby="options-title" @keydown=${this._key}
        aria-busy=${this.busy?"true":"false"}>
        <div class="grab-zone" aria-hidden="true"><div class="grab"></div></div>
        <div class="top">
          <h2 id="options-title" tabindex="-1">${e.title}</h2>
          <div class="meta-line">${e.meta}</div>
          ${e.added?U`<div class="added">${e.added}</div>`:Y}
          ${e.note?U`<div class="note"><span class="badge ${e.note.startsWith("Sent back")?"bad":"act"}">${e.note}</span></div>`:Y}
        </div>
        ${e.member.filter(e=>!e.destructive).map(e=>this._option(e))}
        ${e.parent.some(e=>!e.destructive)?U`<div class="group">For parents</div>${e.parent.filter(e=>!e.destructive).map(e=>this._option(e))}`:Y}
        <div class="actions">
          ${[...e.member,...e.parent].filter(e=>e.destructive).map(e=>U`
            <button class="pv-btn pv-btn-secondary danger" type="button" ?disabled=${e.disabled||this.busy}
              @click=${()=>this._tap(e,!1)}>${e.label}${e.tag?U` <span class="pv-tag muted">${e.tag}</span>`:Y}</button>
          `)}
          <button class="pv-btn pv-btn-secondary" type="button" @click=${()=>{this.close()}}>Done</button>
        </div>
      </div>
    `:Y}_option(e){const t=this._open===e.id,s=!!e.chips?.length||!!e.pick||"history"===e.id||"send_back"===e.id;return U`
      <div class="option ${e.destructive?"destructive":""}">
        <button type="button" ?disabled=${e.disabled||this.busy} aria-expanded=${s?t?"true":"false":Y}
          @click=${()=>this._tap(e,s)}>
          <span class="icon" aria-hidden="true">${Ho[e.id]}</span>
          <span class="words">
            <span class="label">${e.label}</span>
            ${e.hint?U`<span class="hint">${e.hint}</span>`:Y}
          </span>
          ${e.tag?U`<span class="pv-tag ${"Needs an OK"===e.tag?"ask":"muted"}">${e.tag}</span>`:Y}
        </button>
        ${t?this._more(e):Y}
      </div>
    `}_more(e){return"history"===e.id?this.history?U`<ul class="history">${this.history.map(e=>U`<li>${e}</li>`)}</ul>`:U`<ul class="history" aria-busy="true"><li class="bone loading"></li><li class="bone loading"></li></ul>`:"send_back"===e.id?U`
        <div class="chips">
          ${jo.map(t=>U`
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
          <pv-date-field  aria-label="Pick a date" min=${e.pick.min} max=${e.pick.max??Y}
            @change=${t=>{const s=t.target.value;s&&this._choose(e.id,s)}}></pv-date-field>
        `:Y}
      </div>
    `}_tap(e,t){if(t)return this._open=this._open===e.id?null:e.id,void("history"===e.id&&"history"===this._open&&this._choose("history"));this._choose(e.id)}_choose(e,t){this.dispatchEvent(new CustomEvent("pv-option",{detail:{id:e,value:t},bubbles:!0,composed:!0}))}}Uo.styles=[$i,_i,ct,Xi,Ka,o`
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

      .note .badge {
        white-space: normal;
        text-align: left;
      }

      .note {
        margin-top: 8px;
      }

      .group {
        margin: 14px 2px 2px;
        font-size: 0.8125rem;
        font-weight: 750;
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



      .chips {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        padding: 0 2px 14px 42px;
      }



      input[type='date'],
      input[type='text'] {
        min-height: 48px;
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
    `],e([ue({type:String,reflect:!0})],Uo.prototype,"layout",void 0),e([ue({attribute:!1})],Uo.prototype,"model",void 0),e([ue({type:String})],Uo.prototype,"color",void 0),e([ue({attribute:!1})],Uo.prototype,"history",void 0),e([ue({type:Boolean})],Uo.prototype,"busy",void 0),e([me()],Uo.prototype,"_open",void 0),e([me()],Uo.prototype,"_note",void 0),ge("pv-chore-options",Uo);class Wo extends de{constructor(){super(...arguments),this._backdrop=ta(()=>{this.close()}),this.layout="landscape",this.colorOf=e=>e.color,this.busy=new Set,this._sendingBack=null,this._note="",this._motion=new Zi(this),this._detach=null,this._closing=!1,this._key=e=>{if("Escape"===e.key)return e.preventDefault(),void this.close();"landscape"!==this.layout&&Ds(this.shadowRoot,e)}}firstUpdated(){const e=this.renderRoot.querySelector(".panel"),t=this.renderRoot.querySelector(".backdrop");if("landscape"===this.layout)if("reduced"===vi(this))e.animate({opacity:[0,1]},{duration:150});else{const t=mi(ci);e.animate({transform:["translateX(100%)","translateX(0)"]},{duration:t.duration,easing:t.easing})}else this._motion.open(e,t),this._detach=this._motion.attachDrag(this.renderRoot.querySelector(".grab-zone"),e,()=>{this.close()});this.renderRoot.querySelector("#inbox-title")?.focus()}updated(e){e.has("groups")&&this._sendingBack&&!this._all().some(e=>e.id===this._sendingBack)&&(this._sendingBack=null)}disconnectedCallback(){super.disconnectedCallback(),this._detach?.()}async close(){if(this._closing)return;this._closing=!0;const e=this.renderRoot.querySelector(".panel"),t=this.renderRoot.querySelector(".backdrop");if("landscape"===this.layout){const t="reduced"===vi(this)?e.animate({opacity:[1,0]},{duration:120,fill:"forwards"}):e.animate({transform:["translateX(0)","translateX(100%)"]},{duration:220,easing:"cubic-bezier(.4,0,1,1)",fill:"forwards"});await t.finished.catch(()=>{})}else await this._motion.close(e,t);this.dispatchEvent(new CustomEvent("pv-sheet-close",{bubbles:!0,composed:!0}))}_all(){const e=this.groups;return e?[...e.chores,...e.requests,...e.rewards]:[]}render(){const e=this.groups;return e?U`
      <div class="backdrop" @pointerdown=${this._backdrop.down} @click=${this._backdrop.click}></div>
      <div class="panel" role="dialog" aria-modal=${"landscape"===this.layout?"false":"true"} aria-labelledby="inbox-title"
        @keydown=${this._key}>
        <div class="grab-zone" aria-hidden="true"><div class="grab"></div></div>
        <div class="top">
          <h2 id="inbox-title" tabindex="-1">Waiting for OK${e.count?` · ${e.count}`:""}</h2>
        </div>
        ${0===e.count?U`
          <div class="state">
            <div class="art" aria-hidden="true">✅</div>
            <h2>Nothing is waiting</h2>
            <p>Check-offs that need a parent's OK, requests, and rewards land here.</p>
          </div>
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
        <div class="actions">
          <button class="pv-btn pv-btn-secondary" type="button" @click=${()=>{this.close()}}>Done</button>
        </div>
      </div>
    `:Y}_row(e){const t=this.busy.has(e.id),s=e.member;return U`
      <div class="row" aria-busy=${t?"true":"false"}>
        ${s?U`<pv-member-avatar .member=${{...s,color:this.colorOf(s)}} .hass=${this.hass} size="32"></pv-member-avatar>`:Y}
        <div class="words">
          <div class="what">${e.lead} <strong>${e.what}</strong>${e.tail}</div>
          <div class="detail">${e.detail}</div>
        </div>
        <div class="answers">
          <button class="pv-btn pv-btn-secondary" type="button" ?disabled=${t}
            @click=${()=>this._decline(e)}>${e.decline}</button>
          <button class="pv-btn pv-btn-secondary accent" type="button" ?disabled=${t||e.blocked}
            @click=${()=>this._review(e,!0)}>${t?"Saving…":e.allow}</button>
        </div>
      </div>
      ${this._sendingBack===e.id?U`
        <div class="reasons">
          <span class="lead">Sending back: what should change?</span>
          ${jo.map(t=>U`<button class="chip" type="button" @click=${()=>this._review(e,!1,t)}>${t}</button>`)}
          <input type="text" maxlength="60" placeholder="Write a note…" aria-label="Write a note" .value=${this._note}
            @input=${e=>{this._note=e.target.value}}
            @keydown=${t=>{"Enter"===t.key&&this._review(e,!1,this._note.trim()||null)}} />
          <button class="chip" type="button" @click=${()=>this._review(e,!1,this._note.trim()||null)}>Send back</button>
        </div>
      `:Y}
    `}_decline(e){if("completion"===e.kind)return this._sendingBack=this._sendingBack===e.id?null:e.id,void(this._note="");this._review(e,!1)}_review(e,t,s){this._sendingBack=null,this.dispatchEvent(new CustomEvent("pv-review",{detail:{row:e,allow:t,note:s},bubbles:!0,composed:!0}))}}Wo.styles=[$i,ct,Xi,vt,o`
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

      .actions {
        display: flex;
        margin-top: 16px;
      }

      .actions .pv-btn {
        flex: 1;
      }

      h2[tabindex='-1']:focus {
        outline: none;
      }

      .done {
        min-height: 48px;
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
        min-height: 48px;
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
        min-height: 48px;
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


      input {
        min-height: 48px;
        padding: 0 12px;
        border-radius: 12px;
        border: 1px solid var(--pv-border, #E7E7E3);
        background: var(--pv-card-bg, #FFFFFF);
        color: var(--pv-text, #1A1B1E);
        font: inherit;
      }

    `],e([ue({type:String,reflect:!0})],Wo.prototype,"layout",void 0),e([ue({attribute:!1})],Wo.prototype,"groups",void 0),e([ue({attribute:!1})],Wo.prototype,"hass",void 0),e([ue({attribute:!1})],Wo.prototype,"colorOf",void 0),e([ue({attribute:!1})],Wo.prototype,"busy",void 0),e([me()],Wo.prototype,"_sendingBack",void 0),e([me()],Wo.prototype,"_note",void 0),ge("pv-chores-inbox",Wo);class Vo extends de{constructor(){super(...arguments),this._backdrop=ta(()=>{this.close()}),this.layout="landscape",this.people=[],this.colorOf=e=>e.color,this.today="",this.minutesPerStar=15,this.busy=!1,this._draft={name:"",who:[],when:"today",by:null,every:"weekly",minutes:15,needsOk:!1,needsOkSet:!1,stars:null},this._problem=null,this._other=!1,this._changeStars=!1,this._motion=new Zi(this),this._detach=null,this._closing=!1,this._add=()=>{const e=fo(this._draft,this.today);this._problem=e,e||this.dispatchEvent(new CustomEvent("pv-quick-add",{detail:{draft:this._draft},bubbles:!0,composed:!0}))},this._key=e=>{if("Escape"===e.key)return e.preventDefault(),void this.close();Ds(this.shadowRoot,e)}}firstUpdated(){const e=this.renderRoot.querySelector(".panel"),t=this.renderRoot.querySelector(".backdrop");this._motion.open(e,t),this._detach=this._motion.attachDrag(this.renderRoot.querySelector(".grab-zone"),e,()=>{this.close()}),this.renderRoot.querySelector("#name")?.focus()}disconnectedCallback(){super.disconnectedCallback(),this._detach?.()}async close(){if(this._closing)return;this._closing=!0;const e=this.renderRoot.querySelector(".panel"),t=this.renderRoot.querySelector(".backdrop");await this._motion.close(e,t),this.dispatchEvent(new CustomEvent("pv-sheet-close",{bubbles:!0,composed:!0}))}_set(e){this._draft={...this._draft,...e},this._problem&&(this._problem=fo(this._draft,this.today))}_toggle(e){const t=this._draft.who.includes(e.id)?this._draft.who.filter(t=>t!==e.id):[...this._draft.who,e.id];this._draft=function(e,t,s){return{...e,who:t,needsOk:e.needsOkSet?e.needsOk:mo(t,s)}}(this._draft,t,this.people),this._problem&&(this._problem=fo(this._draft,this.today))}render(){const e=this._draft;return U`
      <div class="backdrop" @pointerdown=${this._backdrop.down} @click=${this._backdrop.click}></div>
      <div class="panel" role="dialog" aria-modal="true" aria-labelledby="add-title" @keydown=${this._key}>
        <div class="grab-zone" aria-hidden="true"><div class="grab"></div></div>
        <h2 class="heading" id="add-title">New chore</h2>
        <section>
          <label class="title" for="name">What needs doing?</label>
          <input id="name" type="text" maxlength="60" placeholder="Clean out the garage" autocomplete="off" .value=${e.name}
            @input=${e=>this._set({name:e.target.value})}
            @keydown=${e=>{"Enter"===e.key&&this._add()}} />
        </section>
        <section>
          <span class="title" id="who-title">Who</span>
          <div class="pv-person-chips" role="group" aria-labelledby="who-title">
            ${this.people.map(t=>U`
              <button class="pv-person-chip" type="button" aria-pressed=${e.who.includes(t.id)?"true":"false"}
                style="--member:${this.colorOf(t)}" @click=${()=>this._toggle(t)}>
                <pv-member-avatar .member=${{...t,color:this.colorOf(t)}} .hass=${this.hass} size="28"></pv-member-avatar>
                ${t.name}
              </button>
            `)}
          </div>
        </section>
        <section>
          <span class="title">When</span>
          <div class="pv-seg stretch" role="group" aria-label="When">
            ${[{id:"today",label:"Today"},{id:"by",label:"By a date"},{id:"repeats",label:"Repeats"}].map(t=>U`<button type="button" aria-pressed=${e.when===t.id?"true":"false"} @click=${()=>this._set({when:t.id})}>${t.label}</button>`)}
          </div>
          ${"by"===e.when?U`
            <div class="chips">
              ${vo(this.today).map(t=>U`
                <button class="chip" type="button" aria-pressed=${e.by===t.day?"true":"false"} @click=${()=>this._set({by:t.day})}>${t.label}</button>
              `)}
              <pv-date-field  aria-label="Pick a date" min=${this.today} .value=${e.by&&!vo(this.today).some(t=>t.day===e.by)?e.by:""}
                @change=${e=>this._set({by:e.target.value||null})}></pv-date-field>
            </div>
          `:Y}
          ${"repeats"===e.when?U`
            <div class="chips">
              ${function(e){const t=Xa(e);return[{id:"daily",label:"Every day"},{id:"weekly",label:`Every ${bo[t.getDay()]}`},{id:"monthly",label:`Every month on the ${yo(Math.min(28,t.getDate()))}`}]}(this.today).map(t=>U`
                <button class="chip" type="button" aria-pressed=${e.every===t.id?"true":"false"} @click=${()=>this._set({every:t.id})}>${t.label}</button>
              `)}
            </div>
          `:Y}
        </section>
        <section>
          <span class="title">About how long?</span>
          <div class="chips">
            ${uo.map(t=>U`
              <button class="chip" type="button" aria-pressed=${this._other||e.minutes!==t?"false":"true"}
                @click=${()=>{this._other=!1,this._set({minutes:t})}}>${sn(t)}</button>
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
            <button class="pv-toggle" type="button" role="switch" aria-checked=${e.needsOk?"true":"false"} aria-label="Needs a parent's OK"
              @click=${()=>this._set({needsOk:!e.needsOk,needsOkSet:!0})}></button>
          </div>
        </section>
        <section>
          <span class="worth">${function(e,t){const s=po(e.minutes,t,e.stars);return null!==e.stars?`Earns ★ ${s} each time`:`Earns ★ ${s} (${function(e){return 1===e?"1 per minute":`1 per ${e} minutes`}(t)})`}(e,this.minutesPerStar)}</span>
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
        <div class="sheet-footer">
          <button class="pv-btn pv-btn-secondary" type="button" @click=${()=>{this.close()}}>Cancel</button>
          <button class="pv-btn pv-btn-primary" type="button" ?disabled=${this.busy} @click=${this._add}>${this.busy?"Adding…":"Add"}</button>
        </div>
      </div>
    `}}Vo.styles=[$i,xi,pt,yi,ct,Xi,o`
      :host([layout='landscape']) .panel {
        width: min(480px, calc(100vw - 32px));
      }




      .text {
        min-height: 48px;
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
        min-width: 48px;
        min-height: 48px;
      }

      .problem {
        margin-top: 8px;
        color: var(--pv-bad-ink, #A12828);
        font-weight: 650;
      }
    `],e([ue({type:String,reflect:!0})],Vo.prototype,"layout",void 0),e([ue({attribute:!1})],Vo.prototype,"people",void 0),e([ue({attribute:!1})],Vo.prototype,"hass",void 0),e([ue({attribute:!1})],Vo.prototype,"colorOf",void 0),e([ue({type:String})],Vo.prototype,"today",void 0),e([ue({type:Number})],Vo.prototype,"minutesPerStar",void 0),e([ue({type:Boolean})],Vo.prototype,"busy",void 0),e([me()],Vo.prototype,"_draft",void 0),e([me()],Vo.prototype,"_problem",void 0),e([me()],Vo.prototype,"_other",void 0),e([me()],Vo.prototype,"_changeStars",void 0),ge("pv-chores-quick-add",Vo);const Yo=[{id:"timeline",label:"Timeline"},{id:"list",label:"List"},{id:"pictures",label:"Pictures"}];class Ko extends de{constructor(){super(...arguments),this._scroll=new Hi,this.columns=[],this.events=[],this.colorOf=e=>e.color,this.goal=null,this.shares=[],this.bedtime=null,this.timeFormat="12h",this.layout="landscape",this.locked=!1,this.minute=0}willUpdate(){this.column&&this.style.setProperty("--member",this.colorOf(this.column.member))}_style(){const e=this.column.member.my_day;return"list"===e||"pictures"===e?e:"timeline"}connectedCallback(){super.connectedCallback(),this._scroll.attach(this)}disconnectedCallback(){super.disconnectedCallback(),this._scroll.attach(void 0)}render(){const e=this.column;if(!e)return Y;const t=e.member,s=this._style();return U`
      ${this.columns.length>1?U`
        <div class="pv-people" role="tablist" aria-label="Whose day">
          ${this.columns.map(e=>U`
            <button class="pv-person" type="button" role="tab" aria-selected=${e.member.id===t.id?"true":"false"}
              style="--member:${this.colorOf(e.member)}" @click=${()=>this._fire("pv-my-day-member",{member:e.member.id})}>
              <pv-ring size="40" .progress=${e.ring.progress} ?closed=${e.ring.closed} color=${this.colorOf(e.member)}>
                <pv-member-avatar .member=${{...e.member,color:this.colorOf(e.member)}} .hass=${this.hass} size="28"></pv-member-avatar>
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
            <div class="pv-seg" role="group" aria-label="My day style">
              ${Yo.map(e=>U`
                <button type="button" aria-pressed=${e.id===s?"true":"false"}
                  @click=${()=>this._fire("pv-my-day-style",{member:t.id,style:e.id})}>${e.label}</button>
              `)}
            </div>
          </div>
          ${this.goal&&"landscape"!==this.layout?this._goal(this.goal):Y}
          ${"timeline"===s?this._timeline():"list"===s?this._list():this._pictures()}
        </div>
        ${this._side()}
      </div>
    `}_goal(e){return U`
      <div class="goal">
        <div class="text">
          <span>Goal: ${Oo(e.reward.icon)} ${e.reward.name}</span>
          <span class="num">${Fn(e)}</span>
        </div>
        <div class="bar" role="progressbar" aria-valuemin="0" aria-valuemax=${e.reward.cost} aria-valuenow=${e.have}
          aria-label=${`${e.reward.name}: ${e.have} of ${e.reward.cost} stars`}><span style="width:${Math.round(100*e.progress)}%"></span></div>
      </div>
    `}_row(e,t="now"){return U`<pv-chore-item .row=${e} color=${this.colorOf(this.column.member)} ?highlight=${"now"===t} ?locked=${this.locked}></pv-chore-item>`}_timeline(){const e=function(e,t){const s=t.now,i=hn(s,t.dayStarts),a=e.entries.flatMap(e=>"row"===e.kind?[{row:e.row,zone:e.zone}]:[]),n=e=>"pending"===e.state&&!!e.item.completion,o=a.filter(e=>("overdue"===e.zone||"past"===e.zone)&&!n(e.row)).map(e=>e.row),r=a.filter(e=>("now"===e.zone||"later"===e.zone)&&!n(e.row)).map(e=>e.row),l=a.filter(e=>"week"!==e.zone&&"done"!==e.zone&&n(e.row)).map(e=>e.row),d=[...e.doneToday,...l],c=a.filter(e=>"week"===e.zone).map(e=>e.row),h=t.events.filter(t=>t.member===e.member.id),p=[],u=t.bedtime;for(const e of rn){const a=un(e,i),n=h.filter(s=>hn(s.start,t.dayStarts)===e&&(!u||s.start<u)),l="past"===a?[]:[..."now"===a?o:[],...r.filter(t=>(t.item.band??i)===e)],m=d.filter(s=>s.item.completion&&hn(new Date(s.item.completion.at),t.dayStarts)===e),v=[];for(const e of n)v.push({at:e.start.getTime(),entry:{kind:"event",key:`event:${e.calendar}:${e.start.getTime()}:${e.title}`,time:nn(e.start,t.timeFormat),title:e.title,range:$n(e,t.timeFormat),past:e.end<=s,picture:_n(e.title,"📅")}});for(const e of m){const s=new Date(e.item.completion.at);v.push({at:s.getTime(),entry:{kind:"chore",key:e.key,time:nn(s,t.timeFormat),row:{...e,doneAt:void 0}}})}if("now"===a){const e=s.getTime(),i=h.find(e=>e.start>s),a=i?Math.round((i.start.getTime()-e)/6e4):u?Math.round((u.getTime()-e)/6e4):null;v.push({at:e,entry:{kind:"now",key:"now",time:nn(s,t.timeFormat)}});const n=h.some(e=>e.start<=s&&e.end>s);!n&&(null===a||a>=15)&&v.push({at:e+1,entry:{kind:"free",key:"free",until:i?nn(i.start,t.timeFormat):null,span:null!==a?sn(a):null,fits:kn(a,[...o,...r,...c])}}),l.forEach((t,s)=>v.push({at:e+2+s,entry:{kind:"chore",key:t.key,time:null,row:t}}))}else if("later"===a){const t=n.reduce((e,t)=>Math.max(e,t.end.getTime()),0),i=Math.max(t,new Date(s.getFullYear(),s.getMonth(),s.getDate(),xn[e]).getTime());l.forEach((e,t)=>v.push({at:i+t,entry:{kind:"chore",key:e.key,time:null,row:e}}))}0!==v.length&&(p.push({kind:"band",key:`band:${e}`,band:e,label:ln[e]}),p.push(...v.sort((e,t)=>e.at-t.at).map(e=>e.entry)))}return u&&u>s&&p.push({kind:"bedtime",key:"bedtime",time:nn(u,t.timeFormat,"12h"===t.timeFormat)}),p}(this.column,{now:new Date,events:this.events,timeFormat:this.timeFormat,bedtime:this.bedtime,dayStarts:this.board?.settings?.day_starts});return 0===e.length?U`<p class="meta" style="margin-top:12px">Nothing on today's timeline.</p>`:U`<div class="tl">${Co(e,e=>e.key,e=>this._entry(e))}</div>${this._weekRows()}`}_entry(e){switch(e.kind){case"band":return U`<div class="section-head tl-band">${e.label}</div>`;case"event":return U`
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
      <div class="tl-week">
        <div class="section-head"><span>This week</span><span class="right">${this.board.week.days_left} days left</span></div>
        ${Co(e,e=>e.key,e=>this._row(e,"week"))}
      </div>
    `}_list(){const e=this.column,t=e.entries.flatMap(e=>"row"===e.kind&&"week"!==e.zone&&"done"!==e.zone?[e.row]:[]),s=e.entries.flatMap(e=>"row"===e.kind&&"week"===e.zone?[e.row]:[]),i=function(e,t,s,i){const a=e.filter(e=>e.member===t&&e.start>s);if(0===a.length)return null;const[n,...o]=a,r=nn(n.start,i,"12h"===i);return 0===o.length?`Next: ${n.title} at ${r} · then nothing until tomorrow`:`Next: ${n.title} at ${r}`}(this.events,e.member.id,new Date,this.timeFormat);return U`
      ${i?U`<div class="next">📅 ${i}</div>`:Y}
      <div class="section-head"><span>Today</span></div>
      ${t.length||e.doneToday.length?Y:U`<p class="meta">Nothing due today.</p>`}
      ${Co(t,e=>e.key,e=>this._row(e))}
      ${Co(e.doneToday,e=>e.key,e=>this._row(e,"done"))}
      ${s.length&&"landscape"!==this.layout?U`
        <div class="section-head"><span>This week</span><span class="right">${this.board.week.days_left} days left</span></div>
        ${Co(s,e=>e.key,e=>this._row(e,"week"))}
      `:Y}
      ${this._fair()}
    `}_fair(){return 0===this.shares.length||"young_child"===this.column.member.age_group?Y:U`
      <div class="fair">
        <div class="section-head" style="margin-left:0"><span>Shared chores this week, by time done</span></div>
        <div class="bar" role="img" aria-label=${this.shares.map(e=>e.text).join(", ")}>
          ${this.shares.map(e=>U`<span style="width:${e.percent}%;background:${this.colorOf(e.member)}"></span>`)}
        </div>
        <div class="legend">${this.shares.map(e=>U`<span><i style="background:${this.colorOf(e.member)}"></i>${e.text}</span>`)}</div>
      </div>
    `}_pictures(){const e=function(e,t,s,i){const a=e.entries.flatMap(e=>"row"===e.kind?[{row:e.row,zone:e.zone}]:[]),n=a.filter(e=>"done"!==e.zone&&("open"===e.row.state||"sent_back"===e.row.state)),o=["overdue","now","past","later","week"];n.sort((e,t)=>o.indexOf(e.zone)-o.indexOf(t.zone));const[r,...l]=n.map(e=>e.row),d=[],c=t.find(t=>t.member===e.member.id&&t.start>s);return c&&d.push({kind:"event",picture:_n(c.title,"📅"),text:`${c.title} at ${nn(c.start,i)}`}),l[0]&&d.push({kind:"chore",row:l[0]}),{now:r??null,next:d,waiting:a.filter(e=>"pending"===e.row.state).map(e=>e.row),done:e.doneToday,later:l.slice(1)}}(this.column,this.events,new Date,this.timeFormat),t=this.column.member.stars?this.column.entry.week_stars:0,s=this.colorOf(this.column.member);return U`
      ${e.now?U`
        <div class="now-tile">
          <div class="label" style="text-align:center;margin-top:0;color:${s}">NOW</div>
          ${Ct(e.now.key,U`<pv-chore-tile large now .row=${e.now} color=${s} ?locked=${this.locked}
            .stars=${this.column.member.stars?e.now.item.stars:0}></pv-chore-tile>`)}
        </div>
      `:U`<div class="label" style="text-align:center">All done for now 🎉</div>`}
      ${e.next.length?U`
        <div class="pictures-next">
        <div class="label">Next</div>
        <div class="steps">
          ${Co(e.next,e=>"event"===e.kind?`event:${e.text}`:e.row.key,e=>"event"===e.kind?U`<div class="step"><span class="picture" aria-hidden="true">${e.picture}</span>${e.text}</div>`:U`<pv-chore-tile .row=${e.row} color=${s} ?locked=${this.locked}></pv-chore-tile>`)}
        </div>
        </div>
      `:Y}
      ${e.waiting.length||e.later.length||e.done.length?U`
        <div class="label">Later, waiting, and done</div>
        <div class="tiles">
          ${Co([...e.later,...e.waiting,...e.done],e=>e.key,e=>U`
            <pv-chore-tile .row=${e} color=${s} ?locked=${this.locked}></pv-chore-tile>
          `)}
        </div>
      `:Y}
      ${this.column.member.stars?U`
        <div class="label">${Cn(t)}${this.goal?U` · Goal: ${Oo(this.goal.reward.icon)} ${this.goal.reward.name} · ${Fn(this.goal)}`:Y}</div>
        <div class="stickers" role="img" aria-label=${`${t} stars this week`}>
          ${Array.from({length:Math.min(30,t)},()=>U`<span aria-hidden="true">⭐</span>`)}
          ${0===t?U`<span class="meta">Stars show up here.</span>`:Y}
        </div>
      `:Y}
    `}_side(){const e=this.column,t=e.entries.flatMap(e=>"row"===e.kind&&"week"===e.zone?[e.row]:[]);return"landscape"!==this.layout?Y:U`
      <aside class="card side">
        ${e.member.stars?U`
          <div class="section">
            <div class="section-head"><span>Stars</span></div>
            <div class="stars-big num">★ ${e.entry.stars}</div>
            ${this.goal?this._goal(this.goal):Y}
          </div>
        `:Y}
        <div class="section">
          <div class="section-head"><span>This week</span><span class="right">${this.board.week.days_left} days left</span></div>
          ${t.length?Co(t,e=>e.key,e=>this._row(e,"week")):U`<p class="meta">Nothing more this week.</p>`}
        </div>
      </aside>
    `}_fire(e,t){this.dispatchEvent(new CustomEvent(e,{detail:t,bubbles:!0,composed:!0}))}}Ko.styles=[wi,yi,Ka,o`
      :host {
        display: flex;
        flex-direction: column;
        flex: 1 1 auto;
        min-height: 0;
        overflow-y: auto;
        overscroll-behavior: contain;
        /* The Timeline's time column: its rows, bands, and This week line up after it. */
        --tl-time: 56px;
        --tl-gap: 8px;
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
        grid-template-columns: var(--tl-time) minmax(0, 1fr);
        gap: var(--tl-gap);
        align-items: center;
        min-height: 48px;
      }

      /* This week under the timeline keeps the timeline's left edge. */
      .tl-week {
        margin-left: calc(var(--tl-time) + var(--tl-gap));
      }

      .tl-time {
        justify-self: end;
        color: var(--pv-text-muted, #8E949C);
        font-size: 0.8125rem;
        font-variant-numeric: tabular-nums;
      }

      /* A band is a section head (one heading look), over the timeline's column. */
      .tl-band {
        margin-left: calc(var(--tl-time) + var(--tl-gap) + 4px);
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


      .side .section + .section {
        margin-top: 16px;
      }

      .stars-big {
        font-family: var(--pv-font-heading, ui-rounded, 'SF Pro Rounded', 'PlanaVista Rounded', system-ui, sans-serif);
        font-size: 2rem;
        font-weight: 800;
        color: var(--pv-star, #8A6A00);
      }
    `],e([ue({attribute:!1})],Ko.prototype,"column",void 0),e([ue({attribute:!1})],Ko.prototype,"columns",void 0),e([ue({attribute:!1})],Ko.prototype,"board",void 0),e([ue({attribute:!1})],Ko.prototype,"events",void 0),e([ue({attribute:!1})],Ko.prototype,"hass",void 0),e([ue({attribute:!1})],Ko.prototype,"colorOf",void 0),e([ue({attribute:!1})],Ko.prototype,"goal",void 0),e([ue({attribute:!1})],Ko.prototype,"shares",void 0),e([ue({attribute:!1})],Ko.prototype,"bedtime",void 0),e([ue({attribute:!1})],Ko.prototype,"timeFormat",void 0),e([ue({type:String,reflect:!0})],Ko.prototype,"layout",void 0),e([ue({type:Boolean})],Ko.prototype,"locked",void 0),e([ue({attribute:!1})],Ko.prototype,"minute",void 0),ge("pv-chores-my-day",Ko);class Go extends de{constructor(){super(...arguments),this._scroll=new Hi,this.view=null,this.rows=[],this.highlights=[],this.shares=[],this.colorOf=e=>e.color,this.layout="landscape",this.canExcuse=!1,this.current=!0,this.failed=!1,this._touch=null,this._touchStart=e=>{this._touch=1===e.touches.length?{x:e.touches[0].clientX,y:e.touches[0].clientY}:null},this._touchEnd=e=>{const t=this._touch;this._touch=null;const s=e.changedTouches[0];if(!t||!s)return;const i=St(s.clientX-t.x,s.clientY-t.y);i&&this._nav("next"===i?1:-1)}}connectedCallback(){super.connectedCallback(),this._scroll.attach(this)}disconnectedCallback(){super.disconnectedCallback(),this._scroll.attach(void 0)}render(){const e=this.view,t="landscape"===this.layout?"landscape":"phone"===this.layout?"phone":"portrait";return U`
      <div class="wrap" @touchstart=${this._touchStart} @touchend=${this._touchEnd}>
        <div class="top">
          <h2>${e?Yn(e):"This week"}</h2>
          <div class="week-nav">
            <button class="nav" type="button" aria-label="Last week" title="Last week" @click=${()=>this._nav(-1)}>
              <ha-icon icon="mdi:chevron-left"></ha-icon>
            </button>
            <button class="pv-btn pv-btn-secondary this-week" type="button" ?disabled=${this.current} @click=${()=>this._nav(0)}>This week</button>
            <button class="nav" type="button" aria-label="Next week" title="Next week" @click=${()=>this._nav(1)}>
              <ha-icon icon="mdi:chevron-right"></ha-icon>
            </button>
          </div>
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
    `}_grid(e,t){const s=function(e){const t=[];for(let s=0;s<7;s++){const i=Tn(e.week.start,s);if(i>=e.week.end)break;t.push({date:i,label:Vn[Xa(i).getDay()],today:i===e.today})}return t}(e);return U`
      <div class="card">
        <div class="grid ${t}" role="grid" aria-label=${Yn(e)}>
          <div></div>
          ${s.map(e=>U`<div class="dayhead ${e.today?"today":""}">${e.label}${e.today?U`<span class="sub">Today</span>`:Y}</div>`)}
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
    `}_row(e,t){const s=e.member,i=this.colorOf(s);return U`
      <div class="who">
        <pv-member-avatar .member=${{...s,color:i}} .hass=${this.hass} size="28"></pv-member-avatar>
        <span class="name">${s.name}</span>
      </div>
      ${e.cells.map(e=>this._cell(s,e,i))}
      ${"landscape"===t?this._weekly(e,i):Y}
    `}_cell(e,t,s){const i=`${e.name}, ${t.date}: ${t.label||"nothing known"}`;return U`
      <button class="cell ${t.kind} ${t.away?"away":""}" type="button" aria-label=${i}
        @click=${()=>this._fire("pv-week-day",{member:e.id,date:t.date})}>
        ${t.away?U`<span aria-hidden="true">🧳</span>`:t.empty?Y:U`
          <pv-ring size="34" .progress=${t.progress} ?closed=${t.closed} ?dashed=${t.dashed} color=${s}></pv-ring>
        `}
        <span class=${"bad"===t.tone?"bad":""}>${t.label}</span>
      </button>
    `}_weekly(e,t){const s=e.weekly;return s?U`
      <div class="weekly">
        <div class="line"><strong class="num">${s.text}</strong>
          ${s.badge?U`<span class="badge ${s.badgeTone}">${s.badge}</span>`:Y}
        </div>
        <div class="bar"><span style="width:${Math.round(100*s.progress)}%;background:${t}"></span></div>
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
    `:Y}_nav(e){this._fire("pv-week-nav",{offset:e})}_fire(e,t){this.dispatchEvent(new CustomEvent(e,{detail:t,bubbles:!0,composed:!0}))}}Go.styles=[ct,Ka,o`
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

      /* The calendar's toolbar grammar: the range on the left, then round arrows around This week. */
      .top h2 {
        margin: 0 6px;
        font-family: var(--pv-font-heading, ui-rounded, 'SF Pro Rounded', 'PlanaVista Rounded', system-ui, sans-serif);
        font-size: 1.125rem;
        font-weight: 800;
        font-variant-numeric: tabular-nums;
      }

      .week-nav {
        display: flex;
        align-items: center;
        gap: 4px;
        margin-left: auto;
      }

      .nav {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 48px;
        height: 48px;
        border: none;
        border-radius: 50%;
        background: transparent;
        color: var(--pv-text-secondary, #5F6670);
        cursor: pointer;
      }

      .nav:hover {
        background: var(--pv-event-hover, rgba(0, 0, 0, 0.04));
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
        min-height: 48px;
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
    `],e([ue({attribute:!1})],Go.prototype,"view",void 0),e([ue({attribute:!1})],Go.prototype,"rows",void 0),e([ue({attribute:!1})],Go.prototype,"highlights",void 0),e([ue({attribute:!1})],Go.prototype,"shares",void 0),e([ue({attribute:!1})],Go.prototype,"hass",void 0),e([ue({attribute:!1})],Go.prototype,"colorOf",void 0),e([ue({type:String,reflect:!0})],Go.prototype,"layout",void 0),e([ue({type:Boolean})],Go.prototype,"canExcuse",void 0),e([ue({type:Boolean})],Go.prototype,"current",void 0),e([ue({type:Boolean})],Go.prototype,"failed",void 0),ge("pv-chores-week",Go);const Jo=["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"],Xo=["January","February","March","April","May","June","July","August","September","October","November","December"];function Qo(e){return!("section"in e)}class Zo extends de{constructor(){super(...arguments),this._backdrop=ta(()=>{this.close()}),this.layout="landscape",this.date="",this.today="",this.day=null,this.failed=!1,this.canExcuse=!1,this.names=e=>e,this._motion=new Zi(this),this._detach=null,this._closing=!1,this._key=e=>{if("Escape"===e.key)return e.preventDefault(),void this.close();Ds(this.shadowRoot,e)}}firstUpdated(){const e=this.renderRoot.querySelector(".panel"),t=this.renderRoot.querySelector(".backdrop");this._motion.open(e,t),this._detach=this._motion.attachDrag(this.renderRoot.querySelector(".grab-zone"),e,()=>{this.close()}),this.renderRoot.querySelector("#day-title")?.focus()}disconnectedCallback(){super.disconnectedCallback(),this._detach?.()}async close(){if(this._closing)return;this._closing=!0;const e=this.renderRoot.querySelector(".panel"),t=this.renderRoot.querySelector(".backdrop");await this._motion.close(e,t),this.dispatchEvent(new CustomEvent("pv-sheet-close",{bubbles:!0,composed:!0}))}_badge(e){if(Qo(e)){const t=tn(e.status);return"done"===e.status&&e.done_by&&e.done_by!==this.member.id?{...t,words:`Done by ${this.names(e.done_by)}`}:t}return en(e,{today:this.today,daysLeft:7,remaining:0})??("done"===e.status?tn("done"):null)}render(){const e=this.day?.members[this.member?.id??""],t=e?.summary,s=this.day?e?.away?"Away: nothing was due, and the streak keeps.":t?t.closed?`Ring closed: ${t.done+t.pending} of ${t.due} done.`:`${t.done+t.pending} of ${t.due} done.`:"future"===this.day.kind?"Still to come.":"":"";return U`
      <div class="backdrop" @pointerdown=${this._backdrop.down} @click=${this._backdrop.click}></div>
      <div class="panel" role="dialog" aria-modal="true" aria-labelledby="day-title" @keydown=${this._key}>
        <div class="grab-zone" aria-hidden="true"><div class="grab"></div></div>
        <h2 class="heading" id="day-title" tabindex="-1">${this.member?.name} · ${function(e){const[t,s,i]=e.split("-").map(Number),a=new Date(t,s-1,i,12);return`${Jo[a.getDay()]}, ${Xo[a.getMonth()]} ${a.getDate()}`}(this.date)}</h2>
        ${s?U`<p class="sub">${s}</p>`:Y}
        ${this.failed?U`<p class="sub">Couldn't load this day. Try again in a moment.</p>`:this.day?e&&e.items.length?U`
          <ul>
            ${e.items.map(e=>{const t=this._badge(e);return U`
                <li>
                  <span class="pic" aria-hidden="true">${wn(e.icon,e.name)}</span>
                  <span class="name">${e.name}</span>
                  ${t?U`<span class="badge ${t.tone}">${t.glyph?`${t.glyph} `:""}${t.words}</span>`:Y}
                  ${Qo(e)&&"missed"===e.status&&this.canExcuse?U`
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
    `}_excuse(e){this.dispatchEvent(new CustomEvent("pv-day-excuse",{detail:{occurrence:e.key,name:e.name},bubbles:!0,composed:!0}))}}Zo.styles=[ct,Xi,Ka,o`
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
        min-height: 48px;
        border: none;
        background: transparent;
        color: var(--pv-accent-ink, #5B5BD6);
        font: inherit;
        font-weight: 750;
        cursor: pointer;
      }
    `],e([ue({type:String,reflect:!0})],Zo.prototype,"layout",void 0),e([ue({attribute:!1})],Zo.prototype,"member",void 0),e([ue({type:String})],Zo.prototype,"date",void 0),e([ue({type:String})],Zo.prototype,"today",void 0),e([ue({attribute:!1})],Zo.prototype,"day",void 0),e([ue({type:Boolean})],Zo.prototype,"failed",void 0),e([ue({type:Boolean})],Zo.prototype,"canExcuse",void 0),e([ue({attribute:!1})],Zo.prototype,"names",void 0),ge("pv-chores-day-sheet",Zo);class er extends de{constructor(){super(...arguments),this._scroll=new Hi,this.balances=[],this.cards=[],this.recent=null,this.colorOf=e=>e.color,this.layout="landscape",this.canEdit=!1}connectedCallback(){super.connectedCallback(),this._scroll.attach(this)}disconnectedCallback(){super.disconnectedCallback(),this._scroll.attach(void 0)}render(){return U`
      <div class="wrap">
        ${this.balances.length?U`
          <div class="balances">
            ${this.balances.map(e=>U`
              <div class="balance" style="--c:${this.colorOf(e.member)}">
                <pv-member-avatar .member=${{...e.member,color:this.colorOf(e.member)}} .hass=${this.hass} size="40"></pv-member-avatar>
                <span class="stars num" aria-label=${`${e.member.name}: ${e.stars} stars`}>★ ${e.stars}</span>
                <div class="goal">
                  ${e.goal?U`
                    Goal: ${Oo(e.goal.reward.icon)} ${e.goal.reward.name} · ${Fn(e.goal)}
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
              <button class="card add" type="button" @click=${()=>this._fire("pv-reward-open",{reward:null})}>+ New reward<span class="meta">Parents</span></button>
            `:Y}
          </div>
        `:U`
          <div class="state"><div class="art" aria-hidden="true">🎁</div><h2>No rewards yet</h2><p>A parent can add rewards to save stars up for.</p></div>
        `}
        ${this.recent?U`<p class="recent">${this.recent}</p>`:Y}
      </div>
    `}_card(e){const t=e.reward,s=e.asked.length;return U`
      <div class="card">
        ${e.goals.length?U`<span class="pv-tag goal-tag">${e.goals.map(e=>`${e.name}'s goal`).join(", ")}</span>`:Y}
        <button class="open" type="button" @click=${()=>this._fire("pv-reward-open",{reward:t.id})}>
          <span class="icon" aria-hidden="true">${Oo(t.icon)}</span>
          <span class="name">${t.name}</span>
          <span class="cost num">★ ${t.cost}</span>
        </button>
        <div class="tags">
          ${e.people.map(e=>U`<span class="pv-tag muted ${e.afford?"ok":""}">${e.member.name}${e.afford?" ✓":`: ${e.more} more`}</span>`)}
          ${s?U`<span class="badge act">⏳ ${e.asked.map(e=>e.name).join(", ")} · Waiting for OK</span>`:Y}
        </div>
        ${e.canRedeem?U`<button class="pv-btn pv-btn-secondary accent action" type="button" @click=${()=>this._fire("pv-reward-redeem",{reward:t.id})}>Redeem</button>`:U`<button class="pv-btn pv-btn-secondary action" type="button" disabled>${function(e){return e.canRedeem?"Redeem":e.asked.length?"Waiting for OK":"Not enough stars yet"}(e)}</button>`}
      </div>
    `}_fire(e,t){this.dispatchEvent(new CustomEvent(e,{detail:t,bubbles:!0,composed:!0}))}}er.styles=[_i,ct,Ka,o`
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



      .goal-tag {
        position: absolute;
        top: 10px;
        right: 10px;
      }

      .card .action {
        margin-top: auto;
        min-height: 48px;
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
    `],e([ue({attribute:!1})],er.prototype,"balances",void 0),e([ue({attribute:!1})],er.prototype,"cards",void 0),e([ue({attribute:!1})],er.prototype,"recent",void 0),e([ue({attribute:!1})],er.prototype,"hass",void 0),e([ue({attribute:!1})],er.prototype,"colorOf",void 0),e([ue({type:String,reflect:!0})],er.prototype,"layout",void 0),e([ue({type:Boolean})],er.prototype,"canEdit",void 0),ge("pv-chores-rewards",er);class tr extends de{constructor(){super(...arguments),this._backdrop=ta(()=>{this.close()}),this.layout="landscape",this.card=null,this.people=[],this.colorOf=e=>e.color,this.canEdit=!1,this.busy=!1,this._editing=!1,this._draft=eo(),this._problem=null,this._motion=new Zi(this),this._detach=null,this._closing=!1,this._started=!1,this._save=()=>{this._problem=to(this._draft),this._problem||this._fire("pv-reward-save",{draft:this._draft})},this._key=e=>{if("Escape"===e.key)return e.preventDefault(),void this.close();Ds(this.shadowRoot,e)}}willUpdate(){this._started||(this._started=!0,this._editing=!this.card,this._draft=eo(this.card?.reward))}firstUpdated(){const e=this.renderRoot.querySelector(".panel"),t=this.renderRoot.querySelector(".backdrop");this._motion.open(e,t),this._detach=this._motion.attachDrag(this.renderRoot.querySelector(".grab-zone"),e,()=>{this.close()}),(this.renderRoot.querySelector("input")??this.renderRoot.querySelector("#reward-title"))?.focus()}disconnectedCallback(){super.disconnectedCallback(),this._detach?.()}async close(){if(this._closing)return;this._closing=!0;const e=this.renderRoot.querySelector(".panel"),t=this.renderRoot.querySelector(".backdrop");await this._motion.close(e,t),this.dispatchEvent(new CustomEvent("pv-sheet-close",{bubbles:!0,composed:!0}))}render(){return U`
      <div class="backdrop" @pointerdown=${this._backdrop.down} @click=${this._backdrop.click}></div>
      <div class="panel" role="dialog" aria-modal="true" aria-labelledby="reward-title" @keydown=${this._key}>
        <div class="grab-zone" aria-hidden="true"><div class="grab"></div></div>
        ${this._editing?this._form():this._view()}
      </div>
    `}_view(){const e=this.card;if(!e)return Y;const t=e.reward;return U`
      <div class="icon" aria-hidden="true">${Oo(t.icon)}</div>
      <h2 class="heading" id="reward-title" tabindex="-1">${t.name}</h2>
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
        ${this.canEdit?U`<button class="pv-btn pv-btn-secondary" type="button" @click=${()=>{this._editing=!0}}>Edit</button>`:Y}
        <button class="pv-btn pv-btn-secondary" type="button" @click=${()=>{this.close()}}>Done</button>
      </div>
    `}_set(e){this._draft={...this._draft,...e},this._problem&&(this._problem=to(this._draft))}_form(){const e=this._draft,t=!!this.card;return U`
      <h2 class="heading" id="reward-title">${t?"Edit reward":"New reward"}</h2>
      <span class="title">Picture</span>
      <div class="pictures">
        ${so.map(t=>U`<button type="button" aria-pressed=${e.icon===t?"true":"false"} aria-label=${t} @click=${()=>this._set({icon:t})}>${t}</button>`)}
      </div>
      <label class="title" for="reward-name">Name</label>
      <input id="reward-name" type="text" maxlength="60" placeholder="Movie night pick" .value=${e.name}
        @input=${e=>this._set({name:e.target.value})} />
      <label class="title" for="reward-cost">Cost in stars</label>
      <input id="reward-cost" type="number" min="1" max="10000" inputmode="numeric" .value=${String(e.cost)}
        @input=${e=>this._set({cost:Math.round(Number(e.target.value))})} />
      <div class="row">
        <span>Needs a parent's OK</span>
        <button class="pv-toggle" type="button" role="switch" aria-checked=${e.needsOk?"true":"false"} aria-label="Needs a parent's OK"
          @click=${()=>this._set({needsOk:!e.needsOk})}></button>
      </div>
      <span class="title">Who can get it (nobody picked means everyone who earns stars)</span>
      <div class="pv-person-chips" role="group" aria-label="Who can get it">
        ${this.people.filter(e=>e.stars).map(t=>U`
          <button class="pv-person-chip" type="button" aria-pressed=${e.who.includes(t.id)?"true":"false"} style="--member:${this.colorOf(t)}"
            @click=${()=>this._set({who:e.who.includes(t.id)?e.who.filter(e=>e!==t.id):[...e.who,t.id]})}>
            <pv-member-avatar .member=${{...t,color:this.colorOf(t)}} .hass=${this.hass} size="28"></pv-member-avatar>
            ${t.name}
          </button>
        `)}
      </div>
      ${this._problem?U`<div class="problem" role="alert">${this._problem}</div>`:Y}
      <div class="sheet-footer">
        <button class="pv-btn pv-btn-secondary" type="button" @click=${()=>t?this._editing=!1:void this.close()}>Cancel</button>
        <button class="pv-btn pv-btn-primary" type="button" ?disabled=${this.busy} @click=${this._save}>${this.busy?"Saving…":t?"Save":"Add"}</button>
      </div>
      ${t?U`
        <div class="sheet-delete">
          <button class="pv-btn pv-btn-secondary danger" type="button" @click=${()=>this._fire("pv-reward-delete",{})}>Delete reward</button>
        </div>
      `:Y}
    `}_fire(e,t){this.dispatchEvent(new CustomEvent(e,{detail:t,bubbles:!0,composed:!0}))}}tr.styles=[xi,pt,ct,Xi,o`
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
        min-height: 48px;
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
        width: 48px;
        height: 48px;
        border-radius: 12px;
        border: 1px solid var(--pv-border, #E7E7E3);
        background: var(--pv-card-bg, #FFFFFF);
        font-size: 22px;
        cursor: pointer;
      }

      .pictures button[aria-pressed='true'] {
        border: 2px solid var(--pv-accent, #5B5BD6);
      }




      .row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        margin-top: 12px;
      }





      .problem {
        margin-top: 8px;
        color: var(--pv-bad-ink, #A12828);
        font-weight: 650;
      }

    `],e([ue({type:String,reflect:!0})],tr.prototype,"layout",void 0),e([ue({attribute:!1})],tr.prototype,"card",void 0),e([ue({attribute:!1})],tr.prototype,"people",void 0),e([ue({attribute:!1})],tr.prototype,"hass",void 0),e([ue({attribute:!1})],tr.prototype,"colorOf",void 0),e([ue({type:Boolean})],tr.prototype,"canEdit",void 0),e([ue({type:Boolean})],tr.prototype,"busy",void 0),e([me()],tr.prototype,"_editing",void 0),e([me()],tr.prototype,"_draft",void 0),e([me()],tr.prototype,"_problem",void 0),ge("pv-chores-reward-sheet",tr);class sr extends de{constructor(){super(...arguments),this.data=null,this.mode="light",this.layout="landscape",this.household=null,this.session=null,this.services={},this.revision=0,this.openTarget=null,this._sheet=null,this._toast=null,this._minute=Math.floor(Date.now()/6e4),this._weekOffset=0,this._drawn=null,this._week=null,this._weekFailed=!1,this._weekAsked=null,this._weekRevision=-1,this._myDayMember=null,this._reviewing=new Set,this._overlayOpen=!1,this._opener=null,this._recent=new lo,this._asking=[],this._watching=null,this._columnsFor=Dt((e,t,s,i,a,n)=>gn(e,{today:e.today,now:new Date,events:on(s,new Date(e.day.start),new Date(e.day.end),i),timeFormat:a,activities:new Map(e.chores.map(e=>[e.id,e])),members:t?ss(t.members):[]})),this._colorOf=e=>ls(e,this.mode),this._askStartOver=async()=>{await this.asParent("Who's starting over?")&&(this._sheet={kind:"start_over"})},this._onToastAction=e=>{this._toast=null,this.onToastAction(e.detail.toast,e.detail.action)}}get service(){return this.services?.chores}_watch(){const e=this.isConnected?this.service:void 0;this._watching?.service!==e&&(this._watching?.stop(),this._watching=e?{service:e,stop:e.watch()}:null)}moduleAction(e){"inbox"===e&&this._openInbox(),"add"===e&&this._openQuickAdd()}async _openInbox(){await this.asParent("Who's approving?")&&(this._sheet={kind:"inbox"})}async _openQuickAdd(){await this.asParent("Who's adding a chore?")&&(this._sheet={kind:"quick_add",busy:!1})}async _review(e){const{row:t,allow:s,note:i}=e,a=this.service?.api;if(!a||!await this.asParent("Who's approving?"))return!1;this._reviewing=new Set([...this._reviewing,t.id]);try{return await a.review(t.id,s?"allow":"decline",i??null),this.showToast({id:`review-${t.id}`,text:ho(t,s,i)}),!0}catch(e){return this.showToast({id:`review-${t.id}-${Date.now()}`,text:$a(e)??"That didn't save. Try again.",tone:"bad"}),!1}finally{const e=new Set(this._reviewing);e.delete(t.id),this._reviewing=e}}async _approveAll(e){let t=0;for(const s of e){if(!await this._review({row:s,allow:!0}))break;t+=1}t>1&&this.showToast({id:`approved-${Date.now()}`,text:`Approved ${t} chores.`})}async _quickAdd(e){const t=this.service?.board(),s=this.service?.api;if(t&&s&&"quick_add"===this._sheet?.kind&&await this.asParent("Who's adding a chore?")){this._sheet={kind:"quick_add",busy:!0};try{await s.saveActivity(function(e,t){const s=e.name.trim(),i={name:s,icon:_n(s),category:"other",assignees:[...e.who],on_board:!0,needs_ok:e.needsOk,stars:e.stars},a=Math.round(e.minutes);if("repeats"===e.when){const s=Xa(t),n="daily"===e.every?"FREQ=DAILY":"weekly"===e.every?`FREQ=WEEKLY;BYDAY=${go[s.getDay()]}`:`FREQ=MONTHLY;BYMONTHDAY=${Math.min(28,s.getDate())}`;return{...i,schedule:"repeats",repeats:{rrule:n,start:t,window:"day",estimate_minutes:a}}}return{...i,schedule:"once",once:{on:"today"===e.when?t:null,by:"by"===e.when?e.by:null,by_time:null,sessions:1,estimate_minutes:a}}}(e,t.today)),this._sheet=null,this.showToast({id:`added-${Date.now()}`,text:`Added ${e.name.trim()}.`})}catch(e){this._sheet={kind:"quick_add",busy:!1},this.showToast({id:`add-${Date.now()}`,text:$a(e)??"That didn't save. Try again.",tone:"bad"})}}}willUpdate(e){super.willUpdate(e),e.has("_sheet")&&!e.get("_sheet")&&this._sheet&&(this._opener=Ss()),e.has("openTarget")&&this.openTarget?.member&&(this._myDayMember=this.openTarget.member),this._watch();const t=this._asking.length?this.service?.board():null;if(t){const e=Zn(this._asking,t);e!==this._asking&&(this._asking=e)}const s=this.service?.takeNotices()??[],i=s[s.length-1];i&&(this._toast={id:i.id,text:i.text,tone:"bad",ms:7e3})}updated(e){if(super.updated(e),"week"===this.view&&this._loadWeek(),e.has("_sheet")&&e.get("_sheet")&&!this._sheet){const e=this._opener;this._opener=null,e?.isConnected&&e.focus()}const t=null!==this._sheet;t!==this._overlayOpen&&(this._overlayOpen=t,this.dispatchEvent(new CustomEvent("pv-overlay-change",{detail:{open:t},bubbles:!0,composed:!0}))),this._playViewChange()}_playViewChange(){const e={view:this.view??"board",at:"week"===this.view?this._weekOffset:0},t=gi(this._drawn,e);this._drawn=e;const s=bi(t,vi(this),ui());s&&this.renderRoot.querySelector(".view")?.animate(s.keyframes,s.options)}connectedCallback(){super.connectedCallback(),this._clock=setInterval(()=>{const e=Math.floor(Date.now()/6e4);e!==this._minute&&(this._minute=e)},5e3)}disconnectedCallback(){super.disconnectedCallback(),clearInterval(this._clock),this._watching?.stop(),this._watching=null,this._overlayOpen&&(this._overlayOpen=!1,this.dispatchEvent(new CustomEvent("pv-overlay-change",{detail:{open:!1},bubbles:!0,composed:!0})))}render(){const e=this.service;return e?U`
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
      `:"offline"===e.status?this._unreachable(e):this._skeleton()}_myDayColumn(e){const t=this._myDayMember??this.household?.account.member_id??null;return e.find(e=>e.member.id===t)??e[0]}_openMyDay(e){this._myDayMember=e,this.dispatchEvent(new CustomEvent("pv-view-change",{detail:{view:"my_day"},bubbles:!0,composed:!0}))}async _setStyle(e,t){const s=this.service?.api;if(s&&await this.asMember(e,"Whose day is this?"))try{await s.savePrefs(e,{my_day:t})}catch(e){this.showToast({id:`style-${Date.now()}`,text:$a(e)??"That didn't save. Try again.",tone:"bad"})}}_renderMyDay(e){const t=this.display?.time_format??"12h",s=this._columnsFor(e,this.household,this.data,this.cardConfig,t,this._minute),i=this._myDayColumn(s);if(!i)return Y;const a=i.member;return U`
      <pv-chores-my-day .column=${i} .columns=${s} .board=${e} .hass=${this.hass} layout=${this.layout}
        .events=${on(this.data,new Date(e.day.start),new Date(e.day.end),this.cardConfig)}
        .colorOf=${this._colorOf} .timeFormat=${t} .minute=${this._minute}
        .goal=${En(a,i.entry,e.rewards)} .shares=${function(e,t){return yn(t.map(t=>({member:t,minutes:e.members[t.id]?.contribution.shared_minutes??0})))}(e,ss(this.household?.members??[]))}
        .bedtime=${function(e,t){const s=e.bedtime,i=(5===t.getDay()||6===t.getDay()?s?.weekend:s?.weeknight)??s?.weeknight;if(!i||!/^\d{1,2}:\d{2}$/.test(i))return null;const[a,n]=i.split(":").map(Number);return new Date(t.getFullYear(),t.getMonth(),t.getDate(),a,n)}(a,new Date)}
        ?locked=${"no"===Ms(this.household,this.session,a.id)}
        @pv-my-day-member=${e=>{this._myDayMember=e.detail.member}}
        @pv-my-day-style=${e=>{this._setStyle(e.detail.member,e.detail.style)}}
        @pv-hold-done=${e=>this._complete(e.detail)}
        @pv-hold-undo=${e=>this._uncheck(e.detail)}
        @pv-hint=${e=>this._hint(e.detail.row)}
        @pv-row-options=${e=>this._openOptions(e.detail.row)}></pv-chores-my-day>
    `}_loadWeek(e=!1){const t=this.service?.board(),s=this.service?.api;if(!t||!s)return;const i=0===this._weekOffset?t.week.start:Tn(t.week.start,7*this._weekOffset),a=0===this._weekOffset&&this._weekRevision!==this.revision;(e||this._weekAsked!==i||a)&&(this._weekAsked=i,this._weekRevision=this.revision,this._week?.week.start!==i&&(this._week=null),this._weekFailed=!1,s.week(i).then(e=>{this._weekAsked===i&&(this._week=e)},()=>{this._weekAsked===i&&(this._weekFailed=!0)}))}_renderWeek(e){const t=ss(this.household?.members??[]),s=this._week;return U`
      <pv-chores-week .view=${s} .rows=${s?function(e,t,s){return t.filter(t=>e.members[t.id]).map(t=>{const i=e.members[t.id];return{member:t,cells:i.days.map(Kn),weekly:Gn(i.weekly,s,e.today)}})}(s,t,e.week.days_left):[]}
        .highlights=${s?function(e,t,s=3){const i=[];for(const s of t){const t=e.members[s.id];if(!t)continue;const a=t.days.filter(e=>"future"!==e.kind&&!e.away&&(e.due??0)>0);a.length>=2&&a.some(e=>"past"===e.kind)&&a.every(e=>Kn(e).closed)&&i.push({key:`closed:${s.id}`,member:s,text:`${s.name} has closed every ring this week.`})}for(const s of t){const t=e.members[s.id];if(t)for(const a of t.days)for(const t of a.missed_items??[])i.push({key:`missed:${t.key}`,member:s,text:`${s.name} missed ${t.name} on ${Pn(a.date,e.today)}.`,excuse:{occurrence:t.key,name:t.name,day:a.date}})}for(const s of t){const t=e.members[s.id],a=t?.days.filter(e=>e.away).map(e=>e.date)??[];a.length&&i.push({key:`away:${s.id}`,member:s,text:`${s.name} is away ${Xn(a)}.`})}return i.slice(0,s)}(s,t):[]} .shares=${s?function(e,t){return yn(t.filter(t=>e.members[t.id]).map(t=>({member:t,minutes:e.members[t.id].contribution.shared_minutes})))}(s,t):[]}
        .hass=${this.hass} .colorOf=${this._colorOf} layout=${this.layout} ?current=${0===this._weekOffset}
        ?failed=${this._weekFailed} ?canExcuse=${"no"!==Ts(this.household,this.session)}
        @pv-week-nav=${e=>this._navWeek(e.detail.offset)}
        @pv-week-day=${e=>this._openDay(e.detail.member,e.detail.date)}
        @pv-week-excuse=${e=>{this._excuseMissed(e.detail.occurrence,e.detail.name,e.detail.member)}}>
      </pv-chores-week>
    `}_navWeek(e){this._weekOffset=0===e?0:this._weekOffset+e,this._loadWeek(0===e&&this._weekFailed)}_openDay(e,t){const s=this.service?.api;if(!s)return;const i={kind:"day",member:e,date:t,day:null,failed:!1};this._sheet=i,s.day(t).then(e=>{"day"===this._sheet?.kind&&this._sheet.date===t&&(this._sheet={...this._sheet,day:e})},()=>{"day"===this._sheet?.kind&&this._sheet.date===t&&(this._sheet={...this._sheet,failed:!0})})}async _excuseMissed(e,t,s){const i=this.service?.api;if(i&&await this.asParent(`Who's excusing ${t}?`))try{await i.excuseMissed(e);const a=this._member(s)?.name;this.showToast({id:`excused-${e}`,text:`Excused ${t}.${a?` ${a}'s streak holds.`:""}`}),this._loadWeek(!0),"day"===this._sheet?.kind&&this._openDay(this._sheet.member,this._sheet.date)}catch(e){this.showToast({id:`excuse-${Date.now()}`,text:$a(e)??"That didn't save. Try again.",tone:"bad"})}}_renderRewards(e){const t=ss(this.household?.members??[]);return U`
      <pv-chores-rewards .balances=${function(e,t){return t.filter(t=>t.stars&&e.members[t.id]).map(t=>({member:t,stars:e.members[t.id].stars,goal:En(t,e.members[t.id],e.rewards)}))}(e,t)} .cards=${Qn(e,t,this._waitingAsks(e))}
        .recent=${function(e,t){const s=e.recent_redemptions[0];if(!s)return null;const i=e=>e?t.find(t=>t.id===e)?.name??null:null,a=i(s.member)??s.member,n="auto"===s.by?null:i(s.by);return`Recently: ${a} redeemed ${s.name} ${"today"===Pn(s.at.slice(0,10),e.today)?"today":`on ${Pn(s.at.slice(0,10),e.today)}`}${n?`, approved by ${n}`:""}.`}(e,t)} .hass=${this.hass} .colorOf=${this._colorOf} layout=${this.layout}
        ?canEdit=${"no"!==Ts(this.household,this.session)}
        @pv-reward-redeem=${e=>this._redeem(e.detail.reward)}
        @pv-reward-open=${e=>{this._openReward(e.detail.reward)}}></pv-chores-rewards>
    `}_waitingAsks(e){return Zn(this._asking,e)}_redeem(e){const t=this.service?.board();if(!t)return;const s=Qn(t,ss(this.household?.members??[]),this._waitingAsks(t)).find(t=>t.reward.id===e);if(!s)return;const i=s.people.filter(e=>e.afford&&!e.asked).map(e=>e.member),a=async t=>{const i=this.service?.api;if(!i||!await this.asMember(t.id,`Who's getting ${s.reward.name}?`))return;const a={member:t.id,reward:e};this._asking=[...this._asking,a];try{const n=await i.redeem(t.id,e);"given"===n.result&&(this._asking=this._asking.filter(e=>e!==a)),this.showToast({id:`redeem-${Date.now()}`,text:"given"===n.result?`${s.reward.name} is ${t.name}'s!`:`Asked for ${s.reward.name}. A parent will answer.`})}catch(e){this._asking=this._asking.filter(e=>e!==a),this.showToast({id:`redeem-${Date.now()}`,text:$a(e)??"That didn't save. Try again.",tone:"bad"})}};1!==i.length?this._sheet={kind:"people",heading:`Who's getting ${s.reward.name}?`,people:i,body:`It costs ★ ${s.reward.cost}.`,pick:e=>{e&&a(e)}}:a(i[0])}async _openReward(e){(null!==e||await this.asParent("Who's adding a reward?"))&&(this._sheet={kind:"reward",id:e,busy:!1})}async _saveReward(e,t){const s=this.service?.api;if(s&&await this.asParent(e?"Who's changing this reward?":"Who's adding a reward?")){this._sheet={kind:"reward",id:e,busy:!0};try{await s.saveReward(function(e){return{name:e.name.trim(),icon:e.icon.trim()||null,cost:e.cost,needs_ok:e.needsOk,who:[...e.who]}}(t),e??void 0),this._sheet=null,this.showToast({id:`reward-${Date.now()}`,text:e?`Saved ${t.name.trim()}.`:`Added ${t.name.trim()}.`})}catch(t){this._sheet={kind:"reward",id:e,busy:!1},this.showToast({id:`reward-${Date.now()}`,text:$a(t)??"That didn't save. Try again.",tone:"bad"})}}}async _setGoal(e,t){const s=this.service?.api,i=this._member(e);if(!s||!i||!await this.asMember(e,"Whose goal is this?"))return;const a=this.service?.board()?.rewards.find(e=>e.id===t);try{await s.savePrefs(e,{goal:t}),this.showToast({id:`goal-${Date.now()}`,text:a?`${i.name} is saving up for ${a.name}.`:`${i.name} has no goal now.`})}catch(e){this.showToast({id:`goal-${Date.now()}`,text:$a(e)??"That didn't save. Try again.",tone:"bad"})}}renderView(){const e=this.service?.board();return e?0===e.chores.length?this._empty():"my_day"===this.view?this._renderMyDay(e):"week"===this.view?this._renderWeek(e):"rewards"===this.view?this._renderRewards(e):U`
      <pv-chores-board .board=${e} .household=${this.household} .session=${this.session} .data=${this.data}
        .cardConfig=${this.cardConfig}
        .hass=${this.hass} .timeFormat=${this.display?.time_format??"12h"} .mode=${this.mode} layout=${this.layout}
        .minute=${this._minute}
        @pv-hold-done=${e=>this._complete(e.detail)}
        @pv-hold-undo=${e=>this._uncheck(e.detail)}
        @pv-hint=${e=>this._hint(e.detail.row)}
        @pv-row-options=${e=>this._openOptions(e.detail.row)}
        @pv-member-open=${e=>this._openMyDay(e.detail.member)}></pv-chores-board>
    `:Y}_empty(){const e=Ts(this.household,this.session);return U`
      <div class="state">
        <div class="art" aria-hidden="true">🧺</div>
        <h2>No chores yet</h2>
        <p>Add your family's chores, or import a plan you already agreed on.</p>
        ${"no"!==e?U`
          <div class="buttons">
            <button class="pv-btn pv-btn-primary" type="button" @click=${()=>this.moduleAction("add")}>New chore</button>
            <button class="pv-btn pv-btn-secondary" type="button" @click=${()=>this._openSettings(ko)}>Import a plan</button>
          </div>
        `:Y}
      </div>
    `}_member(e){return this.household?.members.find(t=>t.id===e)}async asMember(e,t){const s=Ms(this.household,this.session,e);return"yes"===s||!("no"===s||!this.pinGate)&&this.pinGate.ask(zs(this.household,e),t)}async _complete(e){const{row:t}=e,s=this.service,i=s?.board();if(!s||!i)return void e.settle(!1);const a=t.item.member;await this.asMember(a,`Who's checking off ${t.name}?`)?(this._checkOff(t,a,i,void 0,e.from),e.settle(!0)):e.settle(!1)}_checkOff(e,t,s,i,a){const n=this.service,o=this._member(i??t),r=s.chores.find(t=>t.id===e.item.chore),l=function(e,t){if(!e||e.parent)return!1;if(t?.needs_ok_always)return!0;const s=e.needs_ok_for??"none";return"all"===s||"marked"===s&&!!t?.needs_ok}(o,r);n.enqueue({op:"complete",occurrence:e.key,member:t,name:e.name,doneBy:i,shows:l?"pending":"done"}),_o("tick"),s.settings.sound&&xo();const d=`done-${e.key}-${Date.now()}`;this._recent.remember(d,{row:e,member:t,toast:d});const c=i&&i!==t&&o?function(e,t){return e.stars&&t>0?`${e.name} gets the credit and the stars.`:`${e.name} gets the credit.`}({name:o.name,stars:!!o.stars},e.item.stars):null;this.showToast({id:d,text:l?`${e.name}: waiting for OK.`:c??"Done.",actions:[{id:"undo",label:"Undo"},...i?[]:[{id:"someone",label:"Someone else did it?"}]],ms:6e3});const h=this._member(i??t);a&&h?.stars&&!l&&this.updateComplete.then(()=>{this.renderRoot.querySelector("pv-chores-board")?.flyStars(t,a,e.item.stars)})}async _uncheck(e){const{row:t}=e,s=t.item.member;this.service&&await this.asMember(s,`Who's unchecking ${t.name}?`)?(this.service.enqueue({op:"undo",occurrence:t.key,member:s,name:t.name}),e.settle(!0),this.showToast({id:`undo-${t.key}-${Date.now()}`,text:`${t.name} is open again.`})):e.settle(!1)}_hint(e){const t="no"===Ms(this.household,this.session,e.item.member),s=this._member(e.item.member)?.name??"its owner",i=t?`Only ${s} or a parent can check this off here.`:"done"===e.state?"Hold the check to uncheck it.":"pending"===e.state?"This is waiting for a parent's OK.":"Hold the circle to finish a chore. Let go early and nothing happens.";this.showToast({id:`hint-${Date.now()}`,text:i,ms:3500})}_itemRow(e){const t=this.service?.board();if(!t)return null;for(const s of Object.values(t.members)){const t=s.items.find(t=>t.key===e);if(t)return{key:e,item:t,name:t.name,icon:t.icon,label:null,badge:null,meta:"",state:t.status}}return null}_openOptions(e){this._sheet={kind:"options",key:e.key,history:null,busy:!1}}_optionsModel(e){const t=this.service?.board(),s=this._itemRow(e),i=s?this._member(s.item.member):void 0;return t&&s&&i?{row:s,owner:i,model:qn({item:s.item,activity:t.chores.find(e=>e.id===s.item.chore),owner:i,members:ss(this.household?.members??[]),today:t.today,member:Ms(this.household,this.session,i.id),parent:Ts(this.household,this.session)})}:null}async _run(e,t){try{return await e(),this._sheet=null,this.showToast({id:`ok-${Date.now()}`,text:t}),!0}catch(e){return this.showToast({id:`err-${Date.now()}`,text:$a(e)??"That didn't save. Try again.",tone:"bad",ms:6e3}),"options"===this._sheet?.kind&&(this._sheet={...this._sheet,busy:!1}),!1}}async _option(e,t){const s=this.service,i=this._optionsModel(e),a=s?.board();if(!s||!i||!a)return;const{row:n,owner:o}=i,r=n.item,l=s.api,d=a.today,c=n.name;switch(t.id){case"history":try{const t=await l.history(r.chore,r.member);"options"===this._sheet?.kind&&this._sheet.key===e&&(this._sheet={...this._sheet,history:Un(t,d,this.household?.members??[],this.display?.time_format??"12h")})}catch{"options"===this._sheet?.kind&&(this._sheet={...this._sheet,history:["History isn't available right now."]})}return;case"plan_day":{if(!t.value||!await this.asMember(o.id,`Who's planning ${c}?`))return;const s=r.due_day?` It's still due ${Pn(r.due_day,d)}.`:"";return void await this._run(()=>l.override(e,{planned_day:t.value}),`${c} shows on ${Pn(t.value,d)}.${s}`)}case"more_time":if(!t.value||!await this.asMember(o.id,"Who's asking for more time?"))return;return void await this._run(()=>l.request("more_time",e,t.value),"Asked for more time. A parent will answer.");case"skip":if(!await this.asMember(o.id,`Who's asking to skip ${c}?`))return;return void await this._run(()=>l.request("skip",e),"Asked to skip this week. A parent will answer.");case"undo":if(!await this.asMember(o.id,`Who's unchecking ${c}?`))return;return s.enqueue({op:"undo",occurrence:e,member:o.id,name:c}),this._sheet=null,void this.showToast({id:`undo-${e}-${Date.now()}`,text:`${c} is open again.`});case"done_by":{const t=ss(this.household?.members??[]).filter(e=>e.id!==o.id);return void(this._sheet={kind:"people",heading:"Who did it?",people:t,body:Wn(c),pick:async t=>{if(!t||!await this.asMember(o.id,`Who's checking off ${c}?`))return;const i=this.service?.board();i&&("done"!==r.status&&"pending"!==r.status||s.enqueue({op:"undo",occurrence:e,member:o.id,name:c}),this._checkOff(n,o.id,i,t.id))}})}case"change_due":if(!t.value||!await this.asParent(`Who's changing ${c}?`))return;return void await this._run(()=>l.override(e,{due:t.value}),`${c} is due ${Pn(t.value,d)} now.`);case"hand_off":{const t=ss(this.household?.members??[]).filter(e=>e.id!==o.id);return void(this._sheet={kind:"people",heading:`Who's doing ${c}?`,people:t,body:"Just this time. It comes back next time.",pick:async t=>{t&&await this.asParent(`Who's handing ${c} over?`)&&await this._run(()=>l.override(e,{assignee:t.id}),`${c} is ${t.name}'s this time.`)}})}case"excuse":if(!await this.asParent(`Who's excusing ${c}?`))return;return void await this._run(()=>l.override(e,{excused:!0}),`${c} is excused. Nothing is missed.`);case"approve":case"send_back":{const e=r.completion?.id;if(!e||!await this.asParent("approve"===t.id?"Who's approving?":"Who's sending it back?"))return;const s="approve"===t.id;return void await this._run(()=>l.review(e,s?"allow":"decline",s?null:t.value??null),s?`${c}: looks good.`:`${c} went back${t.value?`: ${t.value}`:""}.`)}case"edit":if(!await this.asParent(`Who's changing ${c}?`))return;return this._sheet=null,void this._openSettings((h={id:r.chore,name:a.chores.find(e=>e.id===r.chore)?.name??c},{page:"chores",stack:[$o(h)]}));case"delete":if(!await this.asParent(`Who's deleting ${c}?`))return;return void(this._sheet={kind:"delete",row:n})}var h}_openSettings(e){this.dispatchEvent(new CustomEvent(ei,{detail:e,bubbles:!0,composed:!0}))}_someoneElse(e){const t=ss(this.household?.members??[]).filter(t=>t.id!==e.member);this._sheet={kind:"people",heading:"Who did it?",body:Wn(e.row.name),people:t,pick:t=>{const s=this.service?.board();t&&s&&this.service&&(this.service.enqueue({op:"undo",occurrence:e.row.key,member:e.member,name:e.row.name}),this._checkOff(e.row,e.member,s,t.id))}}}_skeleton(){const e=Math.max(1,Math.min(4,this.household?.members.length??3));return U`
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
    `}_needsALook(){const e=Ts(this.household,this.session);return U`
      <div class="state" role="alert">
        <div class="art" aria-hidden="true">🧰</div>
        <h2>Chores need a look</h2>
        <p>Some chores data couldn't be read, so nothing is shown or saved until a parent decides. To get it back,
          restore a Home Assistant backup from before it went missing (Settings, System, Backups), or a PlanaVista
          file you exported. Or start over with no chores.</p>
        ${"no"!==e?U`
          <div class="buttons">
            <button class="pv-btn pv-btn-primary" type="button" @click=${()=>this._openSettings(ko)}>Restore from a file</button>
            <button class="pv-btn pv-btn-secondary" type="button" @click=${this._askStartOver}>Start over</button>
          </div>
        `:Y}
      </div>
    `}async asParent(e){const t=Ts(this.household,this.session);if("yes"===t)return!0;if("no_pin"===t)return this._sheet={kind:"no_pin",heading:"This needs a parent's PIN"},!1;if("no"===t||!this.pinGate||!this.household)return!1;const s=this.household.members.filter(e=>e.parent&&e.has_pin);return this.pinGate.ask(s,e)}showToast(e){this._toast=e}onToastAction(e,t){if(this.service)if("undo"===t){const t=this._recent.take(e.id);if(!t)return void this.showToast({id:`undo-${Date.now()}`,text:"Hold the check to uncheck it."});this.service.enqueue({op:"undo",occurrence:t.row.key,member:t.member,name:t.row.name}),this.showToast({id:`undo-${t.row.key}-${Date.now()}`,text:`${t.row.name} is open again.`})}else if("someone"===t){const t=this._recent.peek(e.id);t&&this._someoneElse(t)}}renderSheet(){return Y}_renderSheet(){const e=this._sheet;if(!e)return this.renderSheet();if("day"===e.kind){const t=this._member(e.member),s=this.service?.board();return t&&s?U`
        <pv-chores-day-sheet .layout=${this.layout} .member=${t} date=${e.date} today=${s.today}
          .day=${e.day} ?failed=${e.failed} ?canExcuse=${"no"!==Ts(this.household,this.session)}
          .names=${e=>this._member(e)?.name??e}
          @pv-day-excuse=${t=>{this._excuseMissed(t.detail.occurrence,t.detail.name,e.member)}}
          @pv-sheet-close=${()=>{"day"===this._sheet?.kind&&(this._sheet=null)}}></pv-chores-day-sheet>
      `:Y}if("reward"===e.kind){const t=this.service?.board();if(!t)return Y;const s=ss(this.household?.members??[]),i=e.id?Qn(t,s).find(t=>t.reward.id===e.id)??null:null;return e.id&&!i?(queueMicrotask(()=>{this._sheet===e&&(this._sheet=null)}),Y):U`
        <pv-chores-reward-sheet .layout=${this.layout} .card=${i} .people=${s} .hass=${this.hass} .colorOf=${this._colorOf}
          ?canEdit=${"no"!==Ts(this.household,this.session)} ?busy=${e.busy}
          @pv-reward-goal=${e=>{this._setGoal(e.detail.member,e.detail.reward)}}
          @pv-reward-save=${t=>{this._saveReward(e.id,t.detail.draft)}}
          @pv-reward-delete=${()=>{i&&(this._sheet={kind:"delete_reward",id:i.reward.id,name:i.reward.name})}}
          @pv-sheet-close=${()=>{"reward"===this._sheet?.kind&&(this._sheet=null)}}></pv-chores-reward-sheet>
      `}if("delete_reward"===e.kind)return U`
        <pv-notice-sheet .layout=${this.layout} heading=${`Delete ${e.name}?`}
          body="It leaves the catalog. Rewards already given stay in history, and nobody loses stars."
          .actions=${[{id:"delete",label:`Delete ${e.name}`,kind:"destructive"},{id:"cancel",label:"Cancel",kind:"secondary"}]}
          @pv-sheet-action=${t=>{this._confirmDeleteReward(e.id,e.name,t.detail.id)}}></pv-notice-sheet>
      `;if("inbox"===e.kind){const t=this.service?.board();if(!t)return Y;const s=function(e,t,s,i){const a=new Map(t.map(e=>[e.id,e])),n={chores:[],requests:[],rewards:[],count:e.length};for(const t of e){const e=a.get(t.member)??null,o=e?.name??t.member;if("completion"===t.kind){const r=t.done_by&&t.done_by!==t.member?a.get(t.done_by)?.name??t.done_by:null,l=t.stars?` · ★ ${t.stars}`:"";n.chores.push({id:t.id,kind:t.kind,member:e,lead:r?`${r} finished`:`${o} finished`,what:t.name,tail:r?` for ${o}`:"",detail:`${co(t.at,s,i)}${l}`,allow:"Looks good",decline:"Send back",blocked:!1})}else if("more_time"===t.kind||"skip"===t.kind){const i="more_time"===t.kind;n.requests.push({id:t.id,kind:t.kind,member:e,lead:i?`${o} asks for more time on`:`${o} asks to skip`,what:t.name,tail:i?"":" this week",detail:i&&t.until?`Move the due date to ${Pn(t.until,s)}`:"It would be excused, so nothing is missed.",allow:"Allow",decline:"Not this time",blocked:!1})}else{const s=t.cost??0,i=t.balance??0;n.rewards.push({id:t.id,kind:t.kind,member:e,lead:`${o} wants`,what:t.name,tail:"",detail:i>=s?`★ ${s} of ${i}`:`★ ${s}, and ${o} has ${i}: not enough stars yet`,allow:"Approve",decline:"Decline",blocked:i<s})}}return n}(t.requests,ss(this.household?.members??[]),t.today,this.display?.time_format??"12h");return U`
        <pv-chores-inbox .layout=${this.layout} .groups=${s} .hass=${this.hass} .colorOf=${this._colorOf} .busy=${this._reviewing}
          @pv-review=${e=>{this._review(e.detail)}}
          @pv-approve-all=${()=>{this._approveAll(s.chores)}}
          @pv-sheet-close=${()=>{this._sheet===e&&(this._sheet=null)}}></pv-chores-inbox>
      `}if("quick_add"===e.kind){const t=this.service?.board();return t?U`
        <pv-chores-quick-add .layout=${this.layout} .people=${ss(this.household?.members??[])} .hass=${this.hass}
          .colorOf=${this._colorOf} today=${t.today} .minutesPerStar=${t.settings.minutes_per_star} ?busy=${e.busy}
          @pv-quick-add=${e=>{this._quickAdd(e.detail.draft)}}
          @pv-sheet-close=${()=>{"quick_add"===this._sheet?.kind&&(this._sheet=null)}}></pv-chores-quick-add>
      `:Y}if("options"===e.kind){const t=this._optionsModel(e.key);return t?U`
        <pv-chore-options .layout=${this.layout} .model=${t.model} color=${ls(t.owner,this.mode)}
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
    `}async _confirmDelete(e,t){this._sheet=null,"delete"===t&&this.service&&await this._run(()=>this.service.api.deleteActivity(e.item.chore),`Deleted ${e.name}.`)}async _confirmDeleteReward(e,t,s){this._sheet=null,"delete"===s&&this.service&&await this.asParent(`Who's deleting ${t}?`)&&await this._run(()=>this.service.api.deleteReward(e),`Deleted ${t}.`)}async _onStartOver(e){if(this._sheet=null,"start_over"===e)try{await(this.service?.api.startOver()),this.showToast({id:`start-over-${Date.now()}`,text:"Chores started over."})}catch{this.showToast({id:`start-over-${Date.now()}`,text:"Couldn't start over. Try again.",tone:"bad"})}}}sr.styles=[ct,Ka,o`
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
    `],e([ue({attribute:!1})],sr.prototype,"hass",void 0),e([ue({attribute:!1})],sr.prototype,"data",void 0),e([ue({attribute:!1})],sr.prototype,"cardConfig",void 0),e([ue({attribute:!1})],sr.prototype,"display",void 0),e([ue({attribute:!1})],sr.prototype,"mode",void 0),e([ue({attribute:!1})],sr.prototype,"view",void 0),e([ue({type:String,reflect:!0})],sr.prototype,"layout",void 0),e([ue({attribute:!1})],sr.prototype,"household",void 0),e([ue({attribute:!1})],sr.prototype,"session",void 0),e([ue({attribute:!1})],sr.prototype,"services",void 0),e([ue({attribute:!1})],sr.prototype,"revision",void 0),e([ue({attribute:!1})],sr.prototype,"pinGate",void 0),e([ue({attribute:!1})],sr.prototype,"openTarget",void 0),e([me()],sr.prototype,"_sheet",void 0),e([me()],sr.prototype,"_toast",void 0),e([me()],sr.prototype,"_minute",void 0),e([me()],sr.prototype,"_weekOffset",void 0),e([me()],sr.prototype,"_week",void 0),e([me()],sr.prototype,"_weekFailed",void 0),e([me()],sr.prototype,"_myDayMember",void 0),e([me()],sr.prototype,"_reviewing",void 0),e([me()],sr.prototype,"_asking",void 0),ge("pv-chores-module",sr);const ir=["MO","TU","WE","TH","FR","SA","SU"],ar={MO:"Mon",TU:"Tue",WE:"Wed",TH:"Thu",FR:"Fri",SA:"Sat",SU:"Sun"},nr={MO:"Monday",TU:"Tuesday",WE:"Wednesday",TH:"Thursday",FR:"Friday",SA:"Saturday",SU:"Sunday"},or=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];function rr(e){const t=new Map;for(const s of e.replace(/^RRULE:/i,"").split(";")){const[e,i]=s.split("=");if(!e||void 0===i||t.has(e.toUpperCase()))return null;t.set(e.toUpperCase(),i.toUpperCase())}const s=t.get("FREQ");if("DAILY"!==s&&"WEEKLY"!==s&&"MONTHLY"!==s)return null;const i=t.has("INTERVAL")?Number(t.get("INTERVAL")):1,a=t.get("BYDAY")?.split(",")??[];if(!Number.isInteger(i)||i<1||a.some(e=>!ir.includes(e)))return null;if(a.length&&"WEEKLY"!==s)return null;const n=t.has("BYMONTHDAY")?Number(t.get("BYMONTHDAY")):null;if(null!==n&&("MONTHLY"!==s||!Number.isInteger(n)||n<1||n>31))return null;const o=t.has("COUNT")?Number(t.get("COUNT")):null;if(null!==o&&(!Number.isInteger(o)||o<1))return null;const r=t.get("UNTIL")?.match(/^(\d{4})(\d{2})(\d{2})(T\d{6}Z?)?$/);if(t.has("UNTIL")&&!r)return null;if(null!==o&&r)return null;const l=new Set(["FREQ","INTERVAL","BYDAY","BYMONTHDAY","COUNT","UNTIL"]);return[...t.keys()].some(e=>!l.has(e))?null:{freq:s,interval:i,byday:ir.filter(e=>a.includes(e)),bymonthday:n,count:o,until:r?`${r[1]}-${r[2]}-${r[3]}`:null}}function lr(e,t=!0){return 1===e.length?t?`${nr[e[0]]}s`:nr[e[0]]:e.map(e=>ar[e]).join(", ")}function dr(e){const t=e%100;return t>=11&&t<=13?`${e}th`:`${e}${["th","st","nd","rd"][e%10]??"th"}`}function cr(e){const[,t,s]=e.split("-").map(Number);return`${or[t-1]} ${s}`}const hr=["January","February","March","April","May","June","July","August","September","October","November","December"];function pr(e){const[t,s,i]=e.split("-").map(Number);return new Date(Date.UTC(t,s-1,i))}function ur(e){return e.toISOString().slice(0,10)}function mr(e){return(pr(e).getUTCDay()+6)%7}function vr(e){return ir[mr(e)]}function gr(e,t){const s=pr(e);return s.setUTCDate(s.getUTCDate()+t),ur(s)}function br(e){const[,t,s]=e.split("-").map(Number);return`${hr[t-1]} ${s}`}function yr(e){const t=[`FREQ=${e.freq}`];return e.interval>1&&t.push(`INTERVAL=${e.interval}`),"WEEKLY"===e.freq&&e.byday.length&&t.push(`BYDAY=${ir.filter(t=>e.byday.includes(t)).join(",")}`),"MONTHLY"===e.freq&&e.bymonthday&&t.push(`BYMONTHDAY=${e.bymonthday}`),"count"===e.ends&&t.push(`COUNT=${e.count}`),"until"===e.ends&&t.push(`UNTIL=${e.until.replace(/-/g,"")}`),t.join(";")}function fr(e,t){return new Date(Date.UTC(e,t+1,0)).getUTCDate()}function _r(e,t,s,i=1e3){const a=[],n=e.until&&e.until<s?e.until:s,o=t=>!(t>n||null!==e.count&&a.length>=e.count||a.length>=i||(a.push(t),0));if("DAILY"===e.freq){for(let s=t;s<=n&&o(s);s=gr(s,e.interval));return a}if("WEEKLY"===e.freq){const s=e.byday.length?e.byday.map(e=>ir.indexOf(e)):[mr(t)];s.sort((e,t)=>e-t);for(let i=gr(t,-mr(t));i<=n;i=gr(i,7*e.interval))for(const e of s){const s=gr(i,e);if(s>=t&&!o(s))return a}return a}const r=e.bymonthday??pr(t).getUTCDate(),l=pr(t);for(let s=0;;s+=e.interval){const e=l.getUTCFullYear()+Math.floor((l.getUTCMonth()+s)/12),i=(l.getUTCMonth()+s)%12;if(ur(new Date(Date.UTC(e,i,1)))>n)return a;if(r<=fr(e,i)){const s=ur(new Date(Date.UTC(e,i,r)));if(s>=t&&!o(s))return a}}}function wr(e,t){if("once"===e.schedule){const t=e.once;return(t?.estimate_minutes??15)/Math.max(1,t?.sessions??1)}if("repeats"===e.schedule)return e.repeats?.estimate_minutes??15;const s=e.minimum??{hours:0,per:"week"},i="shared"===e.split?e.shares:null,a=t??e.assignees?.[0],n=i&&a&&a in i?i[a]:s.hours,o=Math.max(1,e.times??1),r=e.days?.length??0;return 60*n/("week"===s.per&&r>0?r*o:o)}function xr(e,t,s){return po(wr(e,s),t,e.stars)}const $r={every_day:"Every day",every_week:"Every week",schedule:"On a schedule",once:"One time",off_board:"Not on the board"},kr=["every_day","every_week","schedule","once","off_board"];function Er(e){return!(!1===e.on_board||!e.assignees?.length||e.finished_at||"plan"===e.schedule&&e.set_time)}function Fr(e){return"plan"===e.schedule&&(!1===e.on_board||!!e.set_time)}function Cr(e){const t=Math.max(1,Math.round(e));if(t<60)return`${t} min`;const s=Math.floor(t/60),i=t%60;return i?`${s} h ${i} min`:`${s} h`}const Sr={mon:"Mon",tue:"Tue",wed:"Wed",thu:"Thu",fri:"Fri",sat:"Sat",sun:"Sun"},Dr={morning:"mornings",afternoon:"afternoons",evening:"evenings"};function Ar(e){const t=e.join();return"mon,tue,wed,thu,fri"===t?"school days":"sat,sun"===t?"weekends":e.map(e=>Sr[e]??e).join(", ")}function Mr(e){return 1===e.length?Dr[e[0]]:e.join(" and ")}function Tr(e,t){const[s,i]=e.split(":").map(Number);return"24h"===t?e:`${s%12||12}:${String(i).padStart(2,"0")} ${s<12?"AM":"PM"}`}function zr(e,t){const s=Math.round((Date.parse(`${e}T12:00:00`)-Date.parse(`${t}T12:00:00`))/864e5);return 0===s?"today":1===s?"tomorrow":s>1&&s<7?new Date(`${e}T12:00:00`).toLocaleDateString("en-US",{weekday:"long"}):cr(e)}function Pr(e,t,s="12h"){if("once"===e.schedule){const s=e.once,i=s?.on?zr(s.on,t):null,a=i?"today"===i||"tomorrow"===i?i[0].toUpperCase()+i.slice(1):`On ${i}`:s?.by?`By ${zr(s.by,t)}`:"Any time";return s&&s.sessions>1?`${a} · ${s.sessions} sessions`:a}if("repeats"===e.schedule){const t=e.repeats?rr(e.repeats.rrule):null;return t?function(e,t="day"){let s;if("DAILY"===e.freq)s=1===e.interval?"Every day":`Every ${e.interval} days`;else if("WEEKLY"===e.freq){const i=e.byday;if(1===e.interval)s="period"===t||0===i.length?"Weekly · any time that week":lr(i);else{const a=`Every ${e.interval} weeks`;s="period"===t||0===i.length?`${a} · any time that week`:`${a} · ${lr(i,!1)}`}}else{const i=1===e.interval?"Monthly":`Every ${e.interval} months`;s="period"===t||null===e.bymonthday?`${i} · any time that month`:`${i} on the ${dr(e.bymonthday)}`}return e.until?`${s} until ${cr(e.until)}`:e.count?`${s}, ${e.count} ${1===e.count?"time":"times"}`:s}(t,e.repeats.window):"On a schedule"}const i=e.minimum??{hours:0,per:"week"},a=e.days??[],n=e.time_of_day??[];if(e.set_time)return`${a.length?`${Ar(a)} at `:"At "}${Tr(e.set_time,s)} · set time`;const o=[`${Cr(60*i.hours)} a ${i.per}`];"day"===i.per&&(e.times??1)>1&&o.push(`${e.times} times`),"shared"===e.split&&o.push("split"),e.label&&o.push(e.label);let r="";return a.length?r=n.length?`${Ar(a)} ${Mr(n)}`:Ar(a):n.length?r=Mr(n):"week"===i.per&&(r="any day"),r?`${o.join(", ")} · ${r}`:o.join(", ")}function Or(e,t,s,i){if("once"!==t.schedule||!t.once)return e;const a=t.once.on??t.once.by,n=s.find(e=>e.chore===t.id&&e.due_day&&"done"!==e.status&&"pending"!==e.status&&"excused"!==e.status);return a&&n?.due_day&&n.due_day!==a?`${e} · moved to ${zr(n.due_day,i)}`:e}const Br=[$i,_i,o`
  :host {
    display: block;
  }

  .section-label {
    margin: 22px 4px 8px;
    font-size: 0.8125rem;
    font-weight: 750;
    color: var(--pv-text-secondary, #6B7280);
  }

  .section-label:first-child {
    margin-top: 4px;
  }

  .group {
    margin: 0;
    padding: 0;
    list-style: none;
    border-radius: 14px;
    background: var(--pv-card-bg, #FFFFFF);
    box-shadow: inset 0 0 0 1px var(--pv-border-subtle, #E5E7EB);
    overflow: hidden;
  }

  .group > li + li,
  .group > .row + .row {
    border-top: 1px solid var(--pv-border-subtle, #E5E7EB);
  }

  .row {
    display: flex;
    align-items: center;
    gap: 12px;
    width: 100%;
    min-height: 56px;
    padding: 8px 14px;
    box-sizing: border-box;
    border: none;
    background: transparent;
    color: inherit;
    font: inherit;
    text-align: left;
  }

  button.row {
    cursor: pointer;
  }

  button.row:hover {
    background: color-mix(in srgb, var(--pv-text, #1A1B1E) 4%, transparent);
  }

  .row-text {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .row-title {
    font-weight: 600;
  }

  .row-sub {
    font-size: 0.8125rem;
    color: var(--pv-text-secondary, #6B7280);
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .row-value {
    color: var(--pv-text-secondary, #6B7280);
    white-space: nowrap;
  }

  .chevron {
    color: var(--pv-text-secondary, #6B7280);
    font-size: 1.25rem;
  }

  .picture {
    flex-shrink: 0;
    width: 40px;
    height: 40px;
    display: grid;
    place-items: center;
    border-radius: 10px;
    background: color-mix(in srgb, var(--pv-text, #1A1B1E) 5%, transparent);
    font-size: 1.375rem;
  }

  /* Tags sit under a row's name, so a long name keeps the row's width. */
  .row-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
    margin-top: 2px;
  }




  .stars {
    flex-shrink: 0;
    font-weight: 700;
    color: var(--pv-star-ink, #8A6A00);
    white-space: nowrap;
  }

  .avatars {
    display: flex;
    flex-shrink: 0;
  }

  .avatars > * + * {
    margin-left: -8px;
  }

  .hint {
    margin: 8px 4px 0;
    font-size: 0.8125rem;
    line-height: 1.45;
    color: var(--pv-text-secondary, #6B7280);
  }






  .row > .pv-seg {
    flex: 1;
  }



  .stepper {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    margin-left: auto;
  }

  .stepper output {
    min-width: 72px;
    text-align: right;
    font-weight: 700;
  }

  .stepper button {
    width: 48px;
    height: 48px;
    border: 1px solid var(--pv-border-subtle, #E5E7EB);
    border-radius: 10px;
    background: var(--pv-card-bg, #FFFFFF);
    color: inherit;
    font: inherit;
    font-size: 1.25rem;
    cursor: pointer;
  }

  .stepper button:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

  .toggle-row .pv-toggle {
    margin-left: auto;
    flex-shrink: 0;
  }

  .problem {
    margin: 0 0 16px;
    padding: 10px 14px;
    border-radius: 12px;
    background: color-mix(in srgb, var(--pv-danger, #DC2626) 10%, transparent);
    color: var(--pv-danger, #DC2626);
  }

  .ok {
    color: var(--pv-success-ink, #2F7D4F);
  }

  /* The one delete in place (the sheets' danger button), across the end of an editor (review). */
  .end-delete {
    width: 100%;
    margin-top: 24px;
  }

  .empty {
    margin: 24px 4px;
    color: var(--pv-text-secondary, #6B7280);
    line-height: 1.5;
  }

  .skeleton {
    height: 56px;
    border-radius: 14px;
    margin-bottom: 8px;
    background: color-mix(in srgb, var(--pv-text, #1A1B1E) 6%, transparent);
  }

  @media (prefers-reduced-motion: no-preference) {
    .skeleton {
      animation: pv-pulse 1.4s ease-in-out infinite;
    }
  }

  @keyframes pv-pulse {
    50% {
      opacity: 0.5;
    }
  }
`];class Nr extends de{constructor(){super(...arguments),this.household=null,this.layout="landscape",this.services={},this.revision=0,this._member=null,this._search="",this._showFinished=!1}get _chores(){return this.services?.chores}render(){const e=this._chores?.board(),t=ss(this.household?.members??[]);if(!e)return U`<div class="skeleton"></div><div class="skeleton"></div><div class="skeleton"></div>`;const s=function(e,t,s,i){const a=(i.search??"").trim().toLocaleLowerCase(),n=e.filter(e=>(!i.member||e.assignees?.includes(i.member))&&(!a||e.name.toLocaleLowerCase().includes(a))),o=e.filter(e=>!e.finished_at),r=e=>function(e,t,s,i,a="12h",n=[]){const o=[];return Fr(e)?o.push("Plan only"):e.assignees?.length||o.push("No one yet"),Fr(e)||!e.needs_ok&&!e.needs_ok_always||o.push("Needs an OK"),{id:e.id,name:e.name,picture:wn(e.icon,e.name),rhythm:Or(Pr(e,i,a),e,n,i),tags:o,stars:Fr(e)?null:xr(e,s.minutes_per_star),people:t.filter(t=>e.assignees?.includes(t.id))}}(e,t,s,i.today,i.timeFormat,i.items),l=kr.map(e=>({id:e,label:$r[e],rows:n.filter(t=>{return!t.finished_at&&(Fr(s=t)?"off_board":"once"===s.schedule?"once":"repeats"===s.schedule?"schedule":"day"===s.minimum?.per?"every_day":"every_week")===e;var s}).map(r)})).filter(e=>e.rows.length>0);return{total:o.length,onBoard:o.filter(Er).length,groups:l,finished:n.filter(e=>e.finished_at).map(r)}}(e.chores,t,e.settings,{member:this._member,search:this._search,today:e.today,timeFormat:this.data?.display?.time_format,items:Object.values(e.members).flatMap(e=>e.items)}),i=t.find(e=>e.id===this._member)??null;return U`
      <div class="head">
        <p class="count">${s.total} ${1===s.total?"chore":"chores"} · ${s.onBoard} on the board</p>
        <button class="pv-btn pv-btn-primary new" type="button" @click=${()=>this._open(null)}>+ New chore</button>
      </div>
      <input class="pv-input search" type="search" placeholder="Search chores" aria-label="Search chores"
        .value=${this._search} @input=${e=>{this._search=e.target.value}} />
      <div class="chips filters" role="group" aria-label="Whose chores">
        <button class="chip chip--plain" type="button" aria-pressed=${null===this._member?"true":"false"}
          @click=${()=>{this._member=null}}>Everyone</button>
        ${t.map(e=>U`
          <button class="chip" type="button" aria-pressed=${this._member===e.id?"true":"false"}
            @click=${()=>{this._member=e.id}}>
            <pv-member-avatar .member=${e} .hass=${this.hass} size="28"></pv-member-avatar>${e.name}
          </button>
        `)}
      </div>
      ${0===s.groups.length?this._renderEmpty(s.total>0):Y}
      <div class="groups">
        ${s.groups.map(e=>U`
          <section class="rhythm-group" aria-label=${e.label}>
            <h2 class="section-label">${e.label} · ${e.rows.length}</h2>
            <ul class="group">${e.rows.map(e=>U`<li>${this._renderRow(e,!this._member)}</li>`)}</ul>
            ${"off_board"===e.id?U`<p class="hint">Plan only: part of the household plan, but not checked off. Turn on Show on the board in the chore to add it.</p>`:Y}
          </section>
        `)}
      </div>
      ${i?this._renderFor(i,s.groups.flatMap(e=>e.rows)):Y}
      ${s.finished.length?U`
        <button class="finished-link" type="button" aria-expanded=${this._showFinished?"true":"false"}
          @click=${()=>{this._showFinished=!this._showFinished}}>
          ${this._showFinished?"Hide finished":`Show ${s.finished.length} finished`} ›
        </button>
        ${this._showFinished?U`<ul class="group">${s.finished.map(e=>U`<li>${this._renderRow(e,!0)}</li>`)}</ul>`:Y}
      `:Y}
    `}_renderEmpty(e){return e?U`<p class="empty">No chores match.</p>`:U`<p class="empty">No chores yet. Tap + New chore, or import a plan in Import and export.</p>`}_renderRow(e,t){return U`
      <button class="row" type="button" @click=${()=>this._open(e)}>
        <span class="picture" aria-hidden="true">${e.picture}</span>
        <span class="row-text">
          <span class="row-title">${e.name}</span>
          <span class="row-sub">${e.rhythm}</span>
          ${e.tags.length?U`
            <span class="row-tags">
              ${e.tags.map(e=>U`<span class="pv-tag ${"Plan only"===e?"muted":"No one yet"===e?"attention":""}">${e}</span>`)}
            </span>
          `:Y}
        </span>
        ${null!==e.stars?U`<span class="stars" aria-label="${e.stars} stars each">★ ${e.stars}</span>`:Y}
        ${t?U`
          <span class="avatars">
            ${e.people.map(e=>U`<pv-member-avatar .member=${e} .hass=${this.hass} size="28"></pv-member-avatar>`)}
          </span>
        `:Y}
        <span class="chevron" aria-hidden="true">›</span>
      </button>
    `}_renderFor(e,t){const s=t.filter(e=>!e.tags.includes("Plan only")&&!e.tags.includes("No one yet"));return U`
      ${"all"!==e.needs_ok_for||e.parent?Y:U`<p class="hint">Every chore of ${e.name}'s needs an OK${"young_child"===e.age_group?`, because ${e.name} is a young child`:""}.</p>`}
      ${"young_child"===e.age_group&&s.length?U`
        <h2 class="section-label">How ${e.name} sees them</h2>
        <div class="tiles">
          ${s.map(e=>U`<div class="tile"><span class="emoji" aria-hidden="true">${e.picture}</span>${e.name}</div>`)}
        </div>
        <ul class="group" style="margin-top: 12px">
          <li>
            <button class="row" type="button" @click=${()=>this._openDay(e)}>
              <span class="row-text">
                <span class="row-title">Open ${e.name}'s day</span>
                <span class="row-sub">My day, the way ${e.name} sees it</span>
              </span>
              <span class="chevron" aria-hidden="true">›</span>
            </button>
          </li>
        </ul>
      `:Y}
    `}_open(e){const t=e?$o(e):{tag:"pv-chore-editor",title:"New chore",back:"Chores",props:{choreId:null,assignees:this._member?[this._member]:[]}};this.dispatchEvent(new CustomEvent(Ks,{detail:t,bubbles:!0,composed:!0}))}_openDay(e){this.dispatchEvent(new CustomEvent(Zs,{detail:{module:"chores",view:"my_day",member:e.id},bubbles:!0,composed:!0}))}}Nr.styles=[lt,ct,pt,Br,o`
      .head {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-bottom: 14px;
      }

      .count {
        flex: 1;
        margin: 0;
        color: var(--pv-text-secondary, #6B7280);
      }

      .new {
        min-height: 48px;
        white-space: nowrap;
      }

      .search {
        width: 100%;
        margin-bottom: 12px;
      }

      .filters {
        margin-bottom: 8px;
      }

      .groups {
        display: grid;
        gap: 0 20px;
      }

      :host([layout='landscape']) .groups {
        grid-template-columns: repeat(2, minmax(0, 1fr));
        align-items: start;
      }

      .rhythm-group {
        min-width: 0;
      }

      .tiles {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(96px, 1fr));
        gap: 10px;
        margin-top: 4px;
      }

      .tile {
        display: grid;
        justify-items: center;
        gap: 6px;
        padding: 12px 8px;
        border-radius: 14px;
        background: var(--pv-card-bg, #FFFFFF);
        box-shadow: inset 0 0 0 1px var(--pv-border-subtle, #E5E7EB);
        text-align: center;
        font-size: 0.875rem;
        font-weight: 600;
      }

      .tile .emoji {
        font-size: 2rem;
      }

      .finished-link {
        margin: 16px 4px 0;
        border: none;
        background: transparent;
        color: var(--pv-accent-ink, var(--pv-accent, #6366F1));
        font: inherit;
        font-weight: 600;
        cursor: pointer;
        min-height: 48px;
      }
    `],e([ue({attribute:!1})],Nr.prototype,"hass",void 0),e([ue({attribute:!1})],Nr.prototype,"data",void 0),e([ue({attribute:!1})],Nr.prototype,"household",void 0),e([ue({type:String,reflect:!0})],Nr.prototype,"layout",void 0),e([ue({attribute:!1})],Nr.prototype,"services",void 0),e([ue({type:Number})],Nr.prototype,"revision",void 0),e([me()],Nr.prototype,"_member",void 0),e([me()],Nr.prototype,"_search",void 0),e([me()],Nr.prototype,"_showFinished",void 0),ge("pv-chores-list-page",Nr);class Rr extends wa{constructor(e,t){super({type:"planavista/chores/subscribe"},e,t)}}class Ir extends Ea{complete(e,t){return this.call("planavista/chores/complete",t?{occurrence:e,done_by:t}:{occurrence:e})}undo(e){return this.call("planavista/chores/undo",{occurrence:e})}request(e,t,s){return this.call("planavista/chores/request",s?{kind:e,occurrence:t,until:s}:{kind:e,occurrence:t})}review(e,t,s){return this.call("planavista/chores/review",s?{request:e,decision:t,note:s}:{request:e,decision:t})}override(e,t){return this.call("planavista/chores/override",{occurrence:e,...t})}excuseMissed(e,t){return this.call("planavista/chores/excuse_missed",t?{occurrence:e,note:t}:{occurrence:e})}saveActivity(e,t){const s={activity:e};return t&&(s.activity_id=t.id,void 0!==t.rev&&(s.rev=t.rev)),this.call("planavista/chores/activity/save",s)}deleteActivity(e){return this.call("planavista/chores/activity/delete",{activity_id:e})}saveSettings(e){return this.call("planavista/chores/settings/save",{settings:e})}saveReward(e,t){return this.call("planavista/rewards/save",t?{reward:e,reward_id:t}:{reward:e})}deleteReward(e){return this.call("planavista/rewards/delete",{reward_id:e})}redeem(e,t){return this.call("planavista/rewards/redeem",{member:e,reward:t})}awardStars(e,t,s){return this.call("planavista/stars/award",{member:e,stars:t,reason:s})}starHistory(e){return this.call("planavista/stars/history",{member:e},!1)}week(e){return this.call("planavista/chores/week",e?{date:e}:{},!1)}day(e){return this.call("planavista/chores/day",{date:e},!1)}history(e,t){return this.call("planavista/chores/history",{chore:e,member:t},!1)}savePrefs(e,t){return this.call("planavista/household/member/prefs",{member_id:e,...t})}startOver(){return this.call("planavista/chores/start_over",{})}importPreview(e){return this.call("planavista/import/preview",{text:e})}importApply(e,t){return this.call("planavista/import/apply",{text:e,choices:t})}exportHousehold(){return this.call("planavista/export",{})}enable(e){return this.call("planavista/chores/enable",{enabled:e})}}function Lr(e,t=null){const s=xa(e);return"unknown"===s?{kind:"wait"}:{kind:"refused",code:s,message:t}}let qr=0;function Hr(e=Date.now()){return qr=(qr+1)%1e6,`${e.toString(36)}-${qr.toString(36)}-${Math.floor(1e6*Math.random()).toString(36)}`}class jr{constructor(e,t,s){this._storage=e,this._send=t,this._listener=s,this._flushing=!1,this._again=!1,this._sending=null,this._entries=e.load()}get entries(){return this._entries}get waiting(){return this._entries.length>0}latestFor(e){for(let t=this._entries.length-1;t>=0;t--)if(this._entries[t].occurrence===e)return this._entries[t]}add(e){const t=this.latestFor(e.occurrence);if("undo"===e.op&&"complete"===t?.op&&!this._isSending(t))return this._entries=this._entries.filter(e=>e!==t),this._persist(),null;const s={...e,id:e.id??Hr(),at:e.at??Date.now()};return this._entries=[...this._entries,s],this._persist(),s}async flush(){if(this._flushing)this._again=!0;else{this._flushing=!0;try{do{for(this._again=!1;this._entries.length>0;){const e=this._entries[0];let t;this._sending=e;try{t=await this._send(e)}catch(e){t=Lr(e)}if(this._sending=null,"wait"===t.kind)return;this._entries=this._entries.filter(t=>t!==e),this._persist(),"refused"===t.kind&&this._listener.refused(e,t.code,t.message)}}while(this._again)}finally{this._sending=null,this._flushing=!1}}}_isSending(e){return this._sending===e}_persist(){this._storage.save(this._entries),this._listener.changed()}}const Ur="planavista.checkoffs";function Wr(e){return e?[{id:"next",text:`Next: ${e.title} at ${e.time}${e.who?` · ${e.who}`:""}`,open:{module:"calendar"}}]:[]}function Vr(e){const t=e.household?.modules;return!!e.household?.available&&!0===t?.chores?.enabled}function Yr(e,t){const s="undo"===e.op?`Couldn't uncheck "${e.name}"`:`Couldn't save "${e.name}"`;return"period_closed"===t?`${s}: the day had ended.`:"pin_required"===t||"parent_mode_required"===t?`${s}. The PIN timed out, so hold it again.`:"other_pin_required"===t?`${s}. It needs its owner's PIN or a parent's.`:`${s}. Try again.`}const Kr=new Set;let Gr=null,Jr=0;const Xr=Math.random().toString(36).slice(2,8);let Qr=[];class Zr{constructor(e){this._host=e,this.id=`card${++Jr}-${Xr}`,this.feed=null,this.status="idle",this.notices=[],this._following=!1,this._watchers=0,this._boardFor={feed:null,entries:[],board:null},this.api=new Ir({callWS:e=>this._host.hass.callWS(e)},()=>this._host.pinSession?.token??null,e=>this._host.sessionEnded(e),e=>this._host.sessionUsed?.(e)),this.queue=(Gr||(Gr=new jr(function(e=Date.now){return{load(){try{const t=globalThis.localStorage?.getItem(Ur),s=t?JSON.parse(t):[];return Array.isArray(s)?s.filter(t=>!!t&&"object"==typeof t&&"string"==typeof t.occurrence&&("complete"===t.op||"undo"===t.op)&&"number"==typeof t.at&&e()-t.at<1728e5):[]}catch{return[]}},save(e){try{0===e.length?globalThis.localStorage?.removeItem(Ur):globalThis.localStorage?.setItem(Ur,JSON.stringify(e))}catch{}}}}(),e=>{const t=[...Kr].find(t=>t.id===e.card)??[...Kr].find(e=>e.connected);return t?t.send(e):Promise.resolve({kind:"wait"})},{changed:()=>Kr.forEach(e=>e.requestUpdate()),refused:(e,t)=>{const s=[...Kr],i=s.find(t=>t.id===e.card),a=(i?.watched?i:void 0)??s.find(e=>e.watched),n={id:e.id,text:Yr(e,t),entry:e};a?a.notify(n):(Qr=[...Qr,n],s.forEach(e=>e.requestUpdate()))}})),Gr),this._subscription=new Rr(e=>{this.feed=e,this.requestUpdate()},e=>{this.status=e,"live"===e&&this.queue.flush(),this.requestUpdate()}),e.addController(this)}get connected(){return"live"===this.status}hostConnected(){Kr.add(this),this._follow(),this._resend=setInterval(()=>{this.queue.waiting&&this.connected&&this.queue.flush()},15e3)}hostUpdate(){this._follow()}hostDisconnected(){Kr.delete(this),clearInterval(this._resend),this._resend=void 0,this._subscription.stop(),this._following=!1,this.feed=null}requestUpdate(){this._host.serviceChanged()}_follow(){Vr({household:this._host.householdView})?(this._following=!0,this._subscription.update(this._host.hass?.connection)):this._following&&(this._subscription.stop(),this._following=!1,this.feed=null)}retry(){this._subscription.retry(),this.queue.flush()}board(){const e=this.feed,t=this.queue.entries;if(this._boardFor.feed===e&&this._boardFor.entries===t)return this._boardFor.board;const s="ok"===e?.state&&e.board?function(e,t){if(0===t.length)return e;const s={...e.members},i=new Set;for(const e of t){const t=s[e.member];if(!t)continue;const a=t.items.findIndex(t=>t.key===e.occurrence);if(a<0)continue;const n=ro(t.items[a],e);if(n===t.items[a])continue;const o=[...t.items];o[a]=n,s[e.member]={...t,items:o},i.add(e.member)}if(0===i.size)return e;const a={due:0,done:0,pending:0};for(const[e,t]of Object.entries(s)){const n=i.has(e)?no(t.items):t.today;i.has(e)&&(s[e]={...t,today:n}),a.due+=n.due,a.done+=n.done,a.pending+=n.pending}return{...e,members:s,household:a}}(e.board,t):null;return this._boardFor={feed:e,entries:t,board:s},s}enqueue(e){const t=this.queue.add({...e,card:this.id});return this.connected&&this.queue.flush(),t}async send(e){if(!this.connected)return{kind:"wait"};try{return"complete"===e.op?await this.api.complete(e.occurrence,e.doneBy):await this.api.undo(e.occurrence),{kind:"sent"}}catch(e){return Lr(e,$a(e))}}watch(){this._watchers+=1;let e=!1;return()=>{e||(e=!0,this._watchers-=1)}}get watched(){return this._watchers>0}notify(e){this.notices=[...this.notices,e],this.requestUpdate()}takeNotices(){const e=this.watched&&Qr.length?[...this.notices,...Qr]:this.notices;return this.watched&&(Qr=[]),this.notices.length&&(this.notices=[]),e}glance(e){if(!Vr(e))return[];const t=this.board(),s=function(e){if(!e)return[];const{due:t,done:s,pending:i}=e.household;if(0===t)return[];const a=Math.min(t,s+i);return[{id:"chores",text:a>=t?`All ${t} chores done today`:`${a} of ${t} chores done today`,progress:a/t,primary:!0,open:{module:"chores",view:"board"}}]}(t);if(!t)return s;const i=this._host.planavistaData,a=new Date,n=function(e,t,s,a){const n=e.find(e=>e.start>s);if(!n)return null;const o=n.member?t.find(e=>e.id===n.member)?.name??null:null;return{title:n.title,time:nn(n.start,a),who:o??(r=n.calendar,function(e,t){return e?.calendars?.find(e=>e.entity_id===t)?.display_name??null}(i,r))};var r}(on(i,new Date(t.day.start),new Date(t.day.end),e.config),e.household?.members??[],a,i?.display?.time_format??"12h");return[...s,...Wr(n)]}barActions(e){return function(e,t,s){if(!e)return[];const i=[],a=e.requests.length;return a>0&&function(e){return"no"!==Ts(e,null)}(t)&&i.push({id:"inbox",label:`${a} waiting for OK`,short:String(a),glyph:"⏳",tone:"act"}),"no"!==Ts(t,s)&&i.push({id:"add",label:"New chore",short:"",glyph:"+"}),i}(this.board(),e.household??null,this._host.pinSession)}stripActions(){return this.board(),[]}memberProgress(e){const t=this.board()?.members[e];return t?{done:t.today.done,pending:t.today.pending,due:t.today.due}:null}}function el(e){const t=e.notify??{};return{requests:t.requests??!0,reminders:t.reminders??!1}}function tl(e){return Array.isArray(e.phones)?e.phones:[]}function sl(e){const t=e.replace(/^notify\./,"").replace(/^mobile_app_/,"").replace(/_/g," ").trim();return t?t[0].toUpperCase()+t.slice(1):e}function il(e){const t=e.map(e=>e.name);return t.length<=2?t.join(" and "):`${t.slice(0,-1).join(", ")}, and ${t[t.length-1]}`}const al=[{id:"make_up",label:"Make it up within the week",short:"Make it up",description:"Missed on its day? It moves to This week, and only counts as missed if the week ends first."},{id:"strict",label:"Strict days",short:"Strict days",description:"A chore not done on its day is missed."},{id:"carry_over",label:"Carry it over until done",short:"Carry it over",description:"Nothing is missed. It stays on the board, marked overdue, until it's done or excused."}];function nl(e,t){return t?Math.min(240,e<60?5*Math.floor(e/5)+5:e+15):Math.max(5,e<=60?5*Math.ceil(e/5)-5:e-15)}const ol={id:"chores",label:"Chores",icon:"mdi:checkbox-marked-circle-outline",tag:"pv-chores-module",order:20,views:[{id:"board",label:"Board"},{id:"week",label:"Week"},{id:"my_day",label:"My day"},{id:"rewards",label:"Rewards"}],watchedEntities:()=>[],enabled:e=>Vr(e),service:e=>new Zr(e)};function rl(e){return e.services?.chores?.board()??null}function ll(e){return e.services?.chores?.feed??null}function dl(e,t,s){return`${e} ${1===e?t:s}`}const cl=[{id:"chores",label:"Chores",group:"chores",order:200,tag:"pv-chores-list-page",applies:({household:e})=>Vr({household:e}),summary:e=>{const t=rl(e);return t?dl(t.chores.filter(e=>!e.finished_at).length,"chore","chores"):""},needsALook:e=>{return t=ll(e),s=rl(e),"needs_a_look"===t?.state?[{id:"chores-data",text:"Some chores data couldn't be read, so the board waits for a parent. Restore a PlanaVista file, or start over.",page:"import-export"}]:(s?.needs_a_look??[]).filter(e=>"unassigned"===e.kind).map(e=>({id:`unassigned:${e.chore}`,text:`No one is assigned to ${e.name}. It waits off the board until someone is.`,stack:[$o({id:e.chore,name:e.name})]}));var t,s}},{id:"chores-off",label:"Chores",group:"chores",order:200,tag:"pv-chores-off-page",applies:({household:e})=>!!e?.available&&!Vr({household:e}),summary:()=>"Off"},{id:"rewards",label:"Rewards",group:"chores",order:210,tag:"pv-rewards-page",applies:({household:e})=>Vr({household:e}),summary:e=>{const t=rl(e);return t?dl(t.rewards.length,"reward","rewards"):""}},{id:"rules",label:"Rules",group:"chores",order:220,tag:"pv-rules-page",applies:({household:e})=>Vr({household:e}),summary:e=>{const t=rl(e);return t?(s=t.settings,al.find(e=>e.id===s.missed)?.short??al[0].short):"";var s}},{id:"reminders",label:"Reminders",group:"chores",order:230,tag:"pv-reminders-page",applies:({household:e})=>Vr({household:e}),summary:e=>{const t=rl(e);return t?function(e,t="12h"){return e.evening_check?Tr(e.evening_check,t):"Off"}(t.settings,e.data?.display?.time_format):""},needsALook:e=>{return t=ll(e),s=e.household?.members??[],(t?.notify_problems??[]).flatMap(e=>{const t=s.find(t=>t.id===e.member);return t&&Array.isArray(t.phones)&&t.phones.includes(e.phone)?[{id:`phone:${e.phone}`,text:`${t.name}'s phone, ${sl(e.phone)}, isn't in Home Assistant anymore, so nothing is sent to it.`,page:"people",stack:[{tag:"pv-settings-person",title:t.name,back:"People",props:{memberId:t.id}}]}]:[]});var t,s}},{id:"import-export",label:"Import and export",group:"data",order:600,tag:"pv-import-export-page",applies:({household:e})=>!!e?.available}],hl=[{id:"chores",label:"Chores",order:100,slot:"role",tag:"pv-person-chores",applies:({household:e})=>Vr({household:e})},{id:"sleep",label:"Sleep",order:200,slot:"pin",tag:"pv-person-sleep",applies:({household:e})=>Vr({household:e})},{id:"phones",label:"Phones",order:300,slot:"links",tag:"pv-person-phones",applies:({household:e})=>Vr({household:e})}];function pl(e){return e.household?.setup.start??null}const ul=[{id:"restore",label:"Restore",order:50,tag:"pv-setup-file",heading:"Restore from a PlanaVista file",lead:"Choose the file, or paste its text. You see everything in it before anything is saved.",wide:!0,applies:e=>"restore"===pl(e)},{id:"chores",label:"Chores",order:300,tag:"pv-setup-chores-choice",heading:"Do you want chores too?",lead:"Chores sit next to the calendar. Kids hold a chore's circle to finish it and earn stars.",primary:"Continue",secondary:"Not now, just the calendar",applies:e=>!!e.household?.available&&"restore"!==pl(e)},{id:"chores-common",label:"Common chores",order:310,tag:"pv-setup-common-chores",heading:"Pick some to start with",lead:"Each comes with a person, how often, and about how long. Tap a picked chore to change those.",skip:!0,wide:!0,applies:e=>"common"===pl(e)},{id:"chores-plan",label:"Household plan",order:320,tag:"pv-setup-file",heading:"Start from your household plan",lead:"Choose the plan file, or paste its text. You see where everything goes before anything is saved.",wide:!0,applies:e=>"plan"===pl(e)},{id:"shared-screen",label:"Shared screen",order:400,tag:"pv-setup-shared-screen",heading:"Is this a shared family screen?",lead:"On a shared screen, parents use a PIN for grown-up things like approving chores and changing settings.",primary:"Continue",finish:"Open the board",module:"chores",applies:({household:e})=>Vr({household:e})}],ml=["people","chores","chores-common","chores-plan","shared-screen"],vl=[{id:"chores-board",label:"Your board",order:100,tag:"pv-setup-done-board",primary:"Open the board",module:"chores",applies:({household:e})=>Vr({household:e})}],gl=[["🧺","One board for everyone","Today's chores in a column for each person, with a ring that closes when they're done."],["⭐","Stars and rewards","If your family wants them. Kids save up for what they pick."],["📋","Start any way you like","From a few common chores, your household plan, or nothing at all."]];class bl extends de{constructor(){super(...arguments),this.layout="landscape",this.services={},this._start=()=>{const e=(t=this.services?.chores,{steps:ml,cancel:async()=>{await(t?.api.enable(!1))}});var t;this.dispatchEvent(new CustomEvent("pv-run-setup",{detail:e,bubbles:!0,composed:!0}))}}render(){return U`
      <p class="lead">Chores sit next to the calendar. Kids hold a chore's circle to finish it and earn stars.</p>
      <ul class="group">
        ${gl.map(([e,t,s])=>U`
          <li><span class="icon" aria-hidden="true">${e}</span><span><span class="title">${t}</span><span class="text">${s}</span></span></li>
        `)}
      </ul>
      <button class="pv-btn pv-btn-primary start" type="button" @click=${this._start}>Set up chores</button>
      <p class="note">A few questions. The calendar stays as it is.</p>
    `}}bl.styles=[lt,ct,Br,o`
      :host {
        max-width: 640px;
      }

      .lead {
        margin: 0 0 16px;
        color: var(--pv-text-secondary, #6B7280);
        font-size: 1.0625rem;
        line-height: 1.5;
      }

      .group li {
        display: flex;
        gap: 12px;
        align-items: flex-start;
        padding: 14px 16px;
      }

      .icon {
        flex-shrink: 0;
        width: 28px;
        font-size: 1.375rem;
        line-height: 1.2;
        text-align: center;
      }

      .title {
        display: block;
        font-weight: 700;
      }

      .text {
        display: block;
        margin-top: 2px;
        color: var(--pv-text-secondary, #6B7280);
        line-height: 1.4;
      }

      .start {
        width: 100%;
        min-height: 52px;
        margin-top: 20px;
        font-size: 1.0625rem;
      }

      .note {
        margin: 10px 0 0;
        color: var(--pv-text-secondary, #6B7280);
        font-size: 0.875rem;
        text-align: center;
      }
    `],e([ue({type:String})],bl.prototype,"layout",void 0),e([ue({attribute:!1})],bl.prototype,"services",void 0),ge("pv-chores-off-page",bl);class yl extends de{constructor(){super(...arguments),this.value="",this.format="12h",this.slots=null,this.clearable=!1,this.placeholder="Pick a time",this.disabled=!1,this._open=!1,this._toggle=()=>{this._open=!this._open,this._open&&this.updateComplete.then(()=>{const e=this.renderRoot.querySelector(".panel"),t=e?.querySelector(".time-slot.selected");e&&t&&(e.scrollTop=t.offsetTop-e.clientHeight/2+t.clientHeight/2),(t??e?.querySelector(".time-slot"))?.focus({preventScroll:!0})})},this._key=e=>{"Escape"===e.key&&(e.preventDefault(),e.stopPropagation(),this._open=!1,this.updateComplete.then(()=>this.renderRoot.querySelector(".picker-field")?.focus()))}}render(){return U`
      <button class="picker-field" type="button" aria-expanded=${this._open?"true":"false"}
        aria-label=${this.getAttribute("aria-label")??Y} ?disabled=${this.disabled} @click=${this._toggle}>
        <ha-icon icon="mdi:clock-outline"></ha-icon>
        <span class=${this.value?"":"placeholder"}>${this.value?da(this.value,this.format):this.placeholder}</span>
      </button>
      ${this._open?U`
        <div class="panel" @keydown=${this._key}>
          ${this.clearable?U`<button type="button" class="time-slot ${this.value?"":"selected"}" @click=${()=>this._pick("")}>No time</button>`:Y}
          ${ua({slots:this.slots??la(),selected:this.value,format:this.format,onPick:e=>this._pick(e)})}
        </div>
      `:Y}
    `}_pick(e){this.value=e,this._open=!1,this.dispatchEvent(new Event("change",{bubbles:!0,composed:!0})),this.updateComplete.then(()=>this.renderRoot.querySelector(".picker-field")?.focus())}}async function fl(e){try{if(navigator.clipboard&&window.isSecureContext)return await navigator.clipboard.writeText(e),!0}catch{}const t=document.createElement("textarea");t.value=e,t.setAttribute("readonly",""),t.style.position="fixed",t.style.opacity="0",document.body.appendChild(t),t.select();let s=!1;try{s=document.execCommand("copy")}catch{s=!1}return t.remove(),s}yl.styles=[ma,o`
      :host {
        display: inline-block;
        max-width: 100%;
      }

      .panel {
        margin-top: 6px;
        max-height: 280px;
        min-width: 160px;
        overflow-y: auto;
        border: 1px solid var(--pv-border, #E7E7E3);
        border-radius: 12px;
        background: var(--pv-card-bg, #FFFFFF);
        scrollbar-width: thin;
      }
    `],e([ue({type:String})],yl.prototype,"value",void 0),e([ue({type:String})],yl.prototype,"format",void 0),e([ue({attribute:!1})],yl.prototype,"slots",void 0),e([ue({type:Boolean})],yl.prototype,"clearable",void 0),e([ue({type:String})],yl.prototype,"placeholder",void 0),e([ue({type:Boolean,reflect:!0})],yl.prototype,"disabled",void 0),e([me()],yl.prototype,"_open",void 0),ge("pv-time-field",yl);const _l=[{id:"kitchen",label:"Kitchen"},{id:"cleaning",label:"Cleaning"},{id:"home",label:"Home and yard"},{id:"personal",label:"Personal"},{id:"school",label:"School"},{id:"work",label:"Work"},{id:"family",label:"Family"},{id:"other",label:"Other"}],wl=["mon","tue","wed","thu","fri","sat","sun"];function xl(e,t){return JSON.stringify(e)===JSON.stringify(t)}function $l(e,t){if(!e.length)return{};const s=t/e.length>=5?5:1,i=Math.floor(t/e.length/s)*s,a={};for(const t of e)a[t]=i;return a[e[0]]+=t-i*e.length,a}function kl(e,t,s=[]){const i={name:"",icon:null,category:"other",schedule:"plan",assignees:s,on_board:!0,needs_ok:!1,needs_ok_always:!1,stars:null,label:"",minutes:15,per:"day",split:"each",shares:{},times:1,days:[],time_of_day:[],once_when:"by",date:t,by_time:null,sessions:1,estimate:30,recurrence:function(e,t){const s=e?rr(e):null,i=gr(t,56);return s?{freq:s.freq,interval:s.interval,byday:s.byday,bymonthday:s.bymonthday,ends:s.count?"count":s.until?"until":"never",count:s.count??4,until:s.until??i,start:t}:{freq:"WEEKLY",interval:1,byday:[vr(t)],bymonthday:null,ends:"never",count:4,until:i,start:t}}(e?.repeats?.rrule??null,e?.repeats?.start??t),window:"day"};return e?(i.name=e.name,i.icon=e.icon,i.category=e.category||"other",i.schedule=e.schedule,i.assignees=[...e.assignees??[]],i.on_board=!1!==e.on_board,i.needs_ok=!!e.needs_ok,i.needs_ok_always=!!e.needs_ok_always,i.stars=e.stars??null,i.label=e.label??"",e.minimum&&(i.minutes=Math.round(60*e.minimum.hours),i.per=e.minimum.per),i.split="shared"===e.split?"shared":"each",e.shares&&(i.shares=Object.fromEntries(Object.entries(e.shares).map(([e,t])=>[e,Math.round(60*t)]))),i.times=e.times??1,i.days=[...e.days??[]],i.time_of_day=[...e.time_of_day??[]],e.once&&(i.once_when=e.once.on?"on":e.once.by?"by":"any",i.date=e.once.on??e.once.by??t,i.by_time=e.once.by_time,i.sessions=e.once.sessions,i.estimate=e.once.estimate_minutes),e.repeats&&(i.window=e.repeats.window,i.estimate=e.repeats.estimate_minutes),i):i}function El(e,t,s=[]){const i=kl(e,t,s);return{draft:i,start:i,rev:e?e.rev??1:null}}function Fl(e){return!xl(e.draft,e.start)}function Cl(e){const t=e.draft,s="shared"===t.split&&t.assignees.length>1,i={name:t.name.trim(),icon:t.icon,category:t.category,schedule:t.schedule,assignees:t.assignees,needs_ok:t.needs_ok,stars:t.stars,label:t.label.trim()||null};return e.start.needs_ok_always&&!t.needs_ok_always&&(i.needs_ok_always=!1),"plan"===t.schedule?Object.assign(i,{on_board:t.on_board,minimum:{hours:t.minutes/60,per:t.per},split:s?"shared":"each",shares:s?Object.fromEntries(t.assignees.map(e=>[e,(t.shares[e]??0)/60])):null,times:t.times,days:wl.filter(e=>t.days.includes(e)),time_of_day:["morning","afternoon","evening"].filter(e=>t.time_of_day.includes(e))}):"once"===t.schedule?(i.on_board=!0,i.once={on:"on"===t.once_when?t.date:null,by:"by"===t.once_when?t.date:null,by_time:"by"===t.once_when?t.by_time:null,sessions:t.sessions,estimate_minutes:t.estimate}):(i.on_board=!0,i.repeats={rrule:yr(t.recurrence),start:t.recurrence.start,window:"DAILY"===t.recurrence.freq?"day":t.window,estimate_minutes:t.estimate}),i}function Sl(e){if(e.assignees.some(t=>(e.shares[t]??0)<=0))return{ok:!1,text:"Give everyone some of the time."};const t=e.assignees.reduce((t,s)=>t+(e.shares[s]??0),0),s=e.minutes-t;return 0===s?{ok:!0,text:`✓ The shares add up to ${Cr(e.minutes)}.`}:s>0?{ok:!1,text:`${Cr(s)} still unassigned.`}:{ok:!1,text:`${Cr(-s)} over the time.`}}function Dl(e){return e.length<=1?e.join(""):`${e.slice(0,-1).join(", ")} and ${e[e.length-1]}`}function Al(e){return Cl({draft:e,start:e})}function Ml(e,t,s){const i=Al(e),a="once"===e.schedule?e.sessions>1?"Each session is":"It's":"repeats"===e.schedule?"Each time is":"Each check-off is",n=(e.assignees.length?e.assignees:[void 0]).map(s=>(s=>{const a=wr(i,s);return`${Cr(a)} and ★ ${po(a,t.minutes_per_star,e.stars)}`})(s));if(new Set(n).size<=1)return`${a} worth about ${n[0]}.`;const o=e.assignees.map((e,t)=>`${n[t]} for ${s.find(t=>t.id===e)?.name??e}`);return`${a} worth about ${Dl(o)}.`}function Tl(e){return"week"!==e.per||e.days.length||e.time_of_day.length?"week"===e.per&&e.days.length>1?`${Cr(e.minutes)} split across ${e.days.length} days.`:"day"===e.per&&e.days.length?"Only on the days picked.":"":"No days or times picked, so any time this week works. It waits under This week on the board."}const zl={make_up:"make it up within the week",strict:"strict days, so it counts as missed",carry_over:"carry it over until done"},Pl=[{label:"To-do list",domain:"todo",name:"Chores",suffix:"chores"},{label:"Chores left today",domain:"sensor",name:"Chores left",suffix:"chores_left"},{label:"Stars",domain:"sensor",name:"Stars",suffix:"stars"},{label:"Done for today",domain:"binary_sensor",name:"Chores done",suffix:"chores_done"},{label:"Events",domain:"event",name:"Chores",suffix:"chores"}];function Ol(e,t){const s=Object.keys(e??{});return Pl.map(({label:i,domain:a,name:n,suffix:o})=>{const r=`${t.name} ${n}`.toLocaleLowerCase();return{label:i,entity_id:s.find(t=>t.startsWith(`${a}.`)&&String(e?.[t]?.attributes?.friendly_name??"").toLocaleLowerCase()===r)??`${a}.${t.id}_${o}`}})}const Bl={MO:["M","Monday"],TU:["T","Tuesday"],WE:["W","Wednesday"],TH:["T","Thursday"],FR:["F","Friday"],SA:["S","Saturday"],SU:["S","Sunday"]},Nl={DAILY:["day","days"],WEEKLY:["week","weeks"],MONTHLY:["month","months"]};class Rl extends de{render(){const e=this.value;if(!e)return Y;const[t,s]=Nl[e.freq];return U`
      <div class="group">
        <div class="row">
          <div class="pv-seg stretch" role="group" aria-label="Repeats">
            ${["DAILY","WEEKLY","MONTHLY"].map(t=>U`
              <button type="button" aria-pressed=${e.freq===t?"true":"false"} @click=${()=>this._freq(t)}>
                ${"DAILY"===t?"Every day":"WEEKLY"===t?"Every week":"Every month"}
              </button>
            `)}
          </div>
        </div>
        <div class="row">
          <span class="label">Every</span>
          <span class="stepper">
            <output>${e.interval} ${1===e.interval?t:s}</output>
            <button type="button" aria-label="Less often" ?disabled=${e.interval<=1}
              @click=${()=>this._set({interval:e.interval-1})}>−</button>
            <button type="button" aria-label="More often" ?disabled=${e.interval>=99}
              @click=${()=>this._set({interval:e.interval+1})}>+</button>
          </span>
        </div>
        ${"WEEKLY"===e.freq?U`
          <div class="row">
            <span class="label">On</span>
            <div class="days" role="group" aria-label="Days of the week">
              ${ir.map(t=>U`
                <button class="day" type="button" aria-label=${Bl[t][1]}
                  aria-pressed=${e.byday.includes(t)?"true":"false"} @click=${()=>this._toggleDay(t)}>
                  ${Bl[t][0]}
                </button>
              `)}
            </div>
          </div>
        `:Y}
        ${"MONTHLY"===e.freq?U`
          <div class="row">
            <label class="label" for="monthday">On the</label>
            <select id="monthday" .value=${String(e.bymonthday??Number(e.start.slice(8,10)))}
              @change=${e=>this._set({bymonthday:Number(e.target.value)})}>
              ${Array.from({length:31},(e,t)=>t+1).map(t=>U`
                <option value=${String(t)} ?selected=${(e.bymonthday??Number(e.start.slice(8,10)))===t}>${dr(t)}</option>
              `)}
            </select>
          </div>
        `:Y}
        <div class="row">
          <label class="label" for="start">Starts</label>
          <pv-date-field id="start"  .value=${e.start}
            @change=${e=>this._start(e.target.value)}></pv-date-field>
        </div>
        <div class="row">
          <span class="label">Ends</span>
          <div class="pv-seg stretch" role="group" aria-label="Ends">
            ${["never","count","until"].map(t=>U`
              <button type="button" aria-pressed=${e.ends===t?"true":"false"} @click=${()=>this._set({ends:t})}>
                ${"never"===t?"Never":"count"===t?"After a number of times":"On a date"}
              </button>
            `)}
          </div>
        </div>
        ${"count"===e.ends?U`
          <div class="row">
            <span class="label">Times</span>
            <span class="stepper">
              <output>${e.count}</output>
              <button type="button" aria-label="Fewer times" ?disabled=${e.count<=1}
                @click=${()=>this._set({count:e.count-1})}>−</button>
              <button type="button" aria-label="More times" ?disabled=${e.count>=999}
                @click=${()=>this._set({count:e.count+1})}>+</button>
            </span>
          </div>
        `:Y}
        ${"until"===e.ends?U`
          <div class="row">
            <label class="label" for="until">End date</label>
            <pv-date-field id="until"  .value=${e.until} min=${e.start}
              @change=${t=>this._set({until:t.target.value||e.until})}></pv-date-field>
          </div>
        `:Y}
      </div>
      <p class="summary" aria-live="polite">${function(e){const t=rr(yr(e));if(!t)return"";let s;if("DAILY"===t.freq)s=1===t.interval?"Every day":`Every ${t.interval} days`;else if("WEEKLY"===t.freq){const a=(i=(t.byday.length?t.byday:[vr(e.start)]).map(e=>nr[e])).length<=1?i.join(""):`${i.slice(0,-1).join(", ")} and ${i[i.length-1]}`;s=1===t.interval?`Every ${a}`:`Every ${t.interval} weeks on ${a}`}else{const i=dr(t.bymonthday??pr(e.start).getUTCDate());s=1===t.interval?`Every month on the ${i}`:`Every ${t.interval} months on the ${i}`}var i;const a=e=>`${e} ${1===e?"time":"times"}`;if(t.until){const i=_r(t,e.start,t.until).length;return i?`${s} until ${br(t.until)}: ${a(i)}.`:"This never happens. Pick a later end date."}if(t.count){const i=_r(t,e.start,gr(e.start,10980));return i.length?`${s}, ${a(i.length)}, ending ${br(i[i.length-1])}.`:""}return`${s}, from ${br(e.start)}.`}(e)}</p>
    `}_set(e){this.value={...this.value,...e},this.dispatchEvent(new CustomEvent("pv-recurrence-change",{detail:this.value,bubbles:!0,composed:!0}))}_freq(e){const t=this.value;e!==t.freq&&this._set({freq:e,byday:"WEEKLY"===e?t.byday.length?t.byday:[vr(t.start)]:[],bymonthday:"MONTHLY"===e?t.bymonthday??Number(t.start.slice(8,10)):null})}_toggleDay(e){const t=this.value.byday.includes(e)?this.value.byday.filter(t=>t!==e):[...this.value.byday,e];this._set({byday:ir.filter(e=>t.includes(e))})}_start(e){e&&this._set({start:e,until:this.value.until<e?e:this.value.until})}}Rl.styles=[yi,o`
    :host {
      display: block;
    }

    .group {
      border-radius: 14px;
      background: var(--pv-card-bg, #FFFFFF);
      box-shadow: inset 0 0 0 1px var(--pv-border-subtle, #E5E7EB);
      overflow: hidden;
    }

    .row {
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      gap: 10px;
      min-height: 56px;
      padding: 8px 14px;
      box-sizing: border-box;
    }

    .row + .row {
      border-top: 1px solid var(--pv-border-subtle, #E5E7EB);
    }

    .label {
      flex: 1;
      min-width: 80px;
    }

    .row > .pv-seg {
      flex: 1 1 100%;
    }



    .stepper {
      display: inline-flex;
      align-items: center;
      gap: 10px;
    }

    .stepper output {
      min-width: 72px;
      text-align: right;
      font-weight: 700;
    }

    .stepper button,
    .day {
      width: 48px;
      height: 48px;
      border: 1px solid var(--pv-border-subtle, #E5E7EB);
      background: var(--pv-card-bg, #FFFFFF);
      color: inherit;
      font: inherit;
      cursor: pointer;
    }

    .stepper button {
      border-radius: 10px;
      font-size: 1.25rem;
    }

    .stepper button:disabled {
      opacity: 0.4;
      cursor: not-allowed;
    }

    .days {
      display: flex;
      flex: 1 1 100%;
      gap: 6px;
      flex-wrap: wrap;
    }

    .day {
      border-radius: 50%;
      font-weight: 600;
    }

    .day[aria-pressed='true'] {
      background: var(--pv-accent, #6366F1);
      border-color: var(--pv-accent, #6366F1);
      color: var(--pv-on-accent, #FFFFFF);
    }

    input,
    select {
      min-height: 48px;
      padding: 0 10px;
      border-radius: 10px;
      border: 1px solid var(--pv-border-subtle, #E5E7EB);
      background: var(--pv-card-bg, #FFFFFF);
      color: inherit;
      font: inherit;
    }

    .summary {
      margin: 8px 4px 0;
      font-size: 0.8125rem;
      color: var(--pv-text-secondary, #6B7280);
    }
  `],e([ue({attribute:!1})],Rl.prototype,"value",void 0),ge("pv-recurrence-picker",Rl);const Il={plan:"Part of the household plan: a set amount of time each day or each week.",once:"One time, on a day or by a date.",repeats:"On a schedule, like every Saturday or once a month."},Ll={mon:["M","Monday"],tue:["T","Tuesday"],wed:["W","Wednesday"],thu:["T","Thursday"],fri:["F","Friday"],sat:["S","Saturday"],sun:["S","Sunday"]},ql=[["morning","Morning"],["afternoon","Afternoon"],["evening","Evening"]],Hl=[15,30,60,120,240],jl=["🍽️","🧽","🧺","🛏️","🧸","🐠","🐱","🐕","🐾","🍴","🧹","🛁","🍂","🌿","🛒","🪴","🚗","📦","🍳","📚","🪥","🔨","🔧","💵","✨","🗑️","🧼","🪣","🛋️","🌀"];function Ul(e,t){return t?e<60?e+5:e+15:e<=60?Math.max(5,e-5):e-15}class Wl extends de{constructor(){super(...arguments),this.household=null,this.layout="landscape",this.pageProps={},this.drafts=new Map,this.services={},this.revision=0,this._problem="",this._saving=!1,this._notice=null,this._pictures=!1,this._otherEstimate=!1,this._copied="",this._loaded=!1,this._announced=""}get _chores(){return this.services?.chores}get _board(){return this._chores?.board()??null}get _choreId(){return this.pageProps.choreId??null}get _activity(){return this._board?.chores.find(e=>e.id===this._choreId)??null}get _draftKey(){return`chore:${this._choreId??"new"}`}get _draft(){return this._record.draft}willUpdate(){const e=this._board;if(!this._loaded&&e&&(null===this._choreId||this._activity)){const t=this.drafts.get(this._draftKey);this._record=t??El(this._activity,e.today,this.pageProps.assignees??[]),this._loaded=!0}}confirmLeave(){return this._loaded&&Fl(this._record)?(this._notice="discard",new Promise(e=>{this._leave=e})):Promise.resolve(!0)}updated(){const e=null===this._choreId,t={label:e?"Add":"Save",ready:!(this._saving||!e&&!Fl(this._record)),save:()=>{this._save()},cancel:()=>this._cancel()},s=`${t.label}|${t.ready}`;s!==this._announced&&(this._announced=s,Qs(this,t))}render(){const e=this._board;if(!e)return U`<div class="skeleton"></div><div class="skeleton"></div>`;if(null!==this._choreId&&!this._activity)return U`<p class="gone">This chore was deleted on another screen.</p>`;if(!this._loaded)return Y;const t=this._draft,s=ss(this.household?.members??[]);return this._choreId,U`
      <div class="top">
        <button class="picture-button" type="button" aria-expanded=${this._pictures?"true":"false"}
          @click=${()=>{this._pictures=!this._pictures}}>
          <span class="big" aria-hidden="true">${t.icon||_n(t.name||"chore")}</span>Change picture
        </button>
      </div>
      ${this._pictures?this._renderPictures():Y}
      ${this._problem?U`<p class="problem" role="alert">${this._problem}</p>`:Y}
      <div class="group">
        <label class="row name-row">
          <span class="row-sub" style="width: 56px">Name</span>
          <input type="text" maxlength="60" autocomplete="off" .value=${t.name} aria-label="Name"
            @input=${e=>this._change({name:e.target.value})} />
        </label>
      </div>
      <div class="pv-seg stretch" role="group" aria-label="Schedule" style="margin-top: 14px">
        ${["plan","once","repeats"].map(e=>U`
          <button type="button" aria-pressed=${t.schedule===e?"true":"false"}
            @click=${()=>this._change({schedule:e})}>${"plan"===e?"Plan":"once"===e?"Once":"Repeats"}</button>
        `)}
      </div>
      <p class="hint">${Il[t.schedule]}</p>
      ${this._renderWho(s)}
      ${"plan"===t.schedule?this._renderPlan(e):"once"===t.schedule?this._renderOnce(e):this._renderRepeats(e)}
      ${this._renderBoard(e,s)}
      ${this._activity?this._renderAutomations(this._activity,s):Y}
      ${this._activity?U`
        <button class="pv-btn pv-btn-secondary danger apart end-delete" type="button" @click=${()=>{this._notice="delete"}}>Delete chore</button>
      `:Y}
      ${this._renderNotice()}
    `}_renderPictures(){const e=this._draft;return U`
      <div class="group">
        <div class="pictures" role="group" aria-label="Pictures">
          <button type="button" aria-pressed=${null===e.icon?"true":"false"} aria-label="From the name"
            title="From the name" @click=${()=>this._pick(null)}>${_n(e.name||"chore")}</button>
          ${jl.map(t=>U`
            <button type="button" aria-pressed=${e.icon===t?"true":"false"} @click=${()=>this._pick(t)}>${t}</button>
          `)}
        </div>
        <label class="row">
          <span class="row-text">Another emoji</span>
          <input class="pv-input other" type="text" maxlength="8" placeholder="🦖" aria-label="Another emoji"
            .value=${e.icon&&!jl.includes(e.icon)?e.icon:""}
            @input=${e=>{const t=e.target.value.trim();this._change({icon:t||null})}} />
        </label>
      </div>
    `}_pick(e){this._change({icon:e}),this._pictures=!1}_renderWho(e){const t=this._draft,s="plan"===t.schedule&&t.assignees.length>1;return U`
      <h2 class="section-label">Who</h2>
      <div class="group">
        <div class="pv-person-chips who" role="group" aria-label="Who">
          ${e.map(e=>{const s=t.assignees.includes(e.id);return U`
              <button class="pv-person-chip" type="button" aria-pressed=${s?"true":"false"} style="--member:${e.color}"
                @click=${()=>this._toggleMember(e.id)}>
                <pv-member-avatar .member=${e} .hass=${this.hass} size="28"></pv-member-avatar>${e.name}
              </button>
            `})}
        </div>
        ${s?U`
          <div class="row">
            <div class="pv-seg stretch" role="group" aria-label="How the time is shared">
              <button type="button" aria-pressed=${"shared"===t.split?"true":"false"}
                @click=${()=>this._change({split:"shared",shares:$l(t.assignees,t.minutes)})}>Split the time</button>
              <button type="button" aria-pressed=${"each"===t.split?"true":"false"}
                @click=${()=>this._change({split:"each"})}>Each does it all</button>
            </div>
          </div>
          ${"shared"===t.split?e.filter(e=>t.assignees.includes(e.id)).map(e=>U`
            <div class="row">
              <pv-member-avatar .member=${e} .hass=${this.hass} size="28"></pv-member-avatar>
              <span class="row-text">${e.name}</span>
              ${this._stepper(t.shares[e.id]??0,s=>this._change({shares:{...t.shares,[e.id]:s}}),`${e.name}'s share`,0)}
            </div>
          `):Y}
        `:Y}
      </div>
      ${s&&"shared"===t.split?U`<p class="hint ${Sl(t).ok?"ok":""}">${Sl(t).text}</p>`:Y}
      ${t.assignees.length?Y:U`<p class="hint">No one yet: it waits off the board until someone is picked.</p>`}
      ${"plan"!==t.schedule&&t.assignees.length>1?U`<p class="hint">With two or more people, each one gets their own check-off.</p>`:Y}
    `}_stepper(e,t,s,i=5,a=Cr(e)){return U`
      <span class="stepper">
        <output>${0===e?"0 min":a}</output>
        <button type="button" aria-label="Less: ${s}" ?disabled=${e<=i} @click=${()=>t(Math.max(i,Ul(e,!1)))}>−</button>
        <button type="button" aria-label="More: ${s}" @click=${()=>t(Ul(e,!0))}>+</button>
      </span>
    `}_counter(e,t,s,i,a,n){return U`
      <span class="stepper">
        <output>${i}</output>
        <button type="button" aria-label="Fewer: ${s}" ?disabled=${e<=a} @click=${()=>t(e-1)}>−</button>
        <button type="button" aria-label="More: ${s}" ?disabled=${e>=n} @click=${()=>t(e+1)}>+</button>
      </span>
    `}_renderPlan(e){const t=this._draft,s=ss(this.household?.members??[]),i="day"===t.per?"day":"week";return U`
      <h2 class="section-label">How much</h2>
      <div class="group">
        <div class="row">
          <span class="row-text">Time</span>
          ${this._stepper(t.minutes,e=>this._setMinutes(e),"time")}
        </div>
        <div class="row">
          <div class="pv-seg stretch" role="group" aria-label="Each day or each week">
            <button type="button" aria-pressed=${"day"===t.per?"true":"false"} @click=${()=>this._change({per:"day"})}>Each day</button>
            <button type="button" aria-pressed=${"week"===t.per?"true":"false"} @click=${()=>this._change({per:"week"})}>Each week</button>
          </div>
        </div>
        <div class="row">
          <span class="row-text">Check off</span>
          ${this._counter(t.times,e=>this._change({times:e}),"check-offs",`${t.times} ${1===t.times?"time":"times"} a ${"week"===t.per&&t.days.length?"day picked":i}`,1,12)}
        </div>
      </div>
      <p class="hint">${Ml(t,e.settings,s)}</p>
      <h2 class="section-label">When</h2>
      <div class="group">
        <div class="row">
          <div class="stack">
            <span>Days</span>
            <div class="days" role="group" aria-label="Days">
              ${wl.map(e=>U`
                <button class="day" type="button" aria-label=${Ll[e][1]} aria-pressed=${t.days.includes(e)?"true":"false"}
                  @click=${()=>this._change({days:t.days.includes(e)?t.days.filter(t=>t!==e):[...t.days,e]})}>
                  ${Ll[e][0]}
                </button>
              `)}
            </div>
          </div>
        </div>
        <div class="row">
          <div class="stack">
            <span>Time of day</span>
            <div class="chips" role="group" aria-label="Time of day">
              ${ql.map(([e,s])=>U`
                <button class="chip chip--plain" type="button" aria-pressed=${t.time_of_day.includes(e)?"true":"false"}
                  @click=${()=>this._change({time_of_day:t.time_of_day.includes(e)?t.time_of_day.filter(t=>t!==e):[...t.time_of_day,e]})}>${s}</button>
              `)}
            </div>
          </div>
        </div>
      </div>
      ${Tl(t)?U`<p class="hint">${Tl(t)}</p>`:Y}
    `}_renderEstimate(e,t){const s=this._draft,i=ss(this.household?.members??[]),a=this._otherEstimate||!Hl.includes(s.estimate);return U`
      <h2 class="section-label">How long</h2>
      <div class="group">
        <div class="row">
          <div class="stack">
            <span>${t}</span>
            <div class="chips" role="group" aria-label=${t}>
              ${Hl.map(e=>U`
                <button class="chip chip--plain" type="button" aria-pressed=${a||s.estimate!==e?"false":"true"}
                  @click=${()=>{this._otherEstimate=!1,this._change({estimate:e})}}>${Cr(e)}</button>
              `)}
              <button class="chip chip--plain" type="button" aria-pressed=${a?"true":"false"}
                @click=${()=>{this._otherEstimate=!0}}>Other</button>
            </div>
            ${a?U`
              <label class="row" style="padding: 0">
                <span class="row-text">Minutes</span>
                <input class="pv-input other" type="number" min="1" max="1440" inputmode="numeric" .value=${String(s.estimate)}
                  @input=${e=>this._change({estimate:Math.max(0,Math.round(Number(e.target.value)||0))})} />
              </label>
            `:Y}
          </div>
        </div>
      </div>
      <p class="hint">${Ml(s,e.settings,i)}</p>
    `}_renderOnce(e){const t=this._draft;return U`
      <h2 class="section-label">When</h2>
      <div class="group">
        <div class="row">
          <div class="pv-seg stretch" role="group" aria-label="When">
            ${["on","by","any"].map(e=>U`
              <button type="button" aria-pressed=${t.once_when===e?"true":"false"} @click=${()=>this._change({once_when:e})}>
                ${"on"===e?"On a day":"by"===e?"By a date":"Any time"}
              </button>
            `)}
          </div>
        </div>
        ${"any"!==t.once_when?U`
          <label class="row">
            <span class="row-text">Date</span>
            <pv-date-field  min=${e.today} .value=${t.date}
              @change=${e=>this._change({date:e.target.value})}></pv-date-field>
          </label>
        `:Y}
        ${"by"===t.once_when?U`
          <label class="row">
            <span class="row-text">By<span class="row-sub">Leave it empty for the end of the day.</span></span>
            <pv-time-field  clearable .format=${"24h"===this.data?.display?.time_format?"24h":"12h"} .value=${t.by_time??""}
              @change=${e=>this._change({by_time:e.target.value||null})}></pv-time-field>
          </label>
        `:Y}
        <div class="row">
          <span class="row-text">Sessions</span>
          ${this._counter(t.sessions,e=>this._change({sessions:e}),"sessions",String(t.sessions),1,20)}
        </div>
      </div>
      <p class="hint">${function(e,t){const s=e.sessions>1?" Each session is its own check-off.":"";return"on"===e.once_when?`On the board on ${br(e.date)}.${s}`:"by"===e.once_when?e.date===t?`On the board today.${s}`:`On the board from today until ${zr(e.date,t)}.${s}`:`On the board until it's done.${s}`}(t,e.today)}</p>
      ${this._renderEstimate(e,"About how long, in all")}
    `}_renderRepeats(e){const t=this._draft,s=t.recurrence.freq;return U`
      <h2 class="section-label">Repeats</h2>
      <pv-recurrence-picker .value=${t.recurrence}
        @pv-recurrence-change=${e=>this._change({recurrence:e.detail})}></pv-recurrence-picker>
      ${"DAILY"!==s?U`
        <h2 class="section-label">Each time</h2>
        <div class="pv-seg stretch" role="group" aria-label="Each time">
          <button type="button" aria-pressed=${"day"===t.window?"true":"false"} @click=${()=>this._change({window:"day"})}>On the day</button>
          <button type="button" aria-pressed=${"period"===t.window?"true":"false"} @click=${()=>this._change({window:"period"})}>
            ${"MONTHLY"===s?"Any time that month":"Any time that week"}
          </button>
        </div>
        <p class="hint">${"day"===t.window?(i=e.settings.missed,`Not done on the day? The house rule decides. Right now that's: ${zl[i]??zl.make_up}.`):"It waits under This week on the board until it's done."}</p>
      `:Y}
      ${this._renderEstimate(e,"About how long")}
    `;var i}_toggle(e,t,s,i){return U`
      <div class="row toggle-row">
        <span class="row-text">
          <span>${t}</span>
          ${i?U`<span class="row-sub">${i}</span>`:Y}
        </span>
        <div class="pv-toggle ${e?"active":""}" role="switch" tabindex="0" aria-checked=${e?"true":"false"}
          aria-label=${t} @click=${s}
          @keydown=${e=>{"Enter"!==e.key&&" "!==e.key||(e.preventDefault(),s())}}></div>
      </div>
    `}_renderBoard(e,t){const s=this._draft,i=s.needs_ok||s.needs_ok_always,a=xr({...Al(s),stars:null},e.settings.minutes_per_star);return U`
      <h2 class="section-label">On the board</h2>
      <div class="group">
        ${"plan"===s.schedule?this._toggle(s.on_board,"Show on the board",()=>this._change({on_board:!s.on_board}),s.on_board?void 0:"Plan only: part of the household plan, but not checked off."):Y}
        ${this._toggle(i,"Needs a parent's OK",()=>this._change(i?{needs_ok:!1,needs_ok_always:!1}:{needs_ok:!0}),function(e,t){const s=t.filter(t=>e.assignees.includes(t.id)),i=e.needs_ok||e.needs_ok_always;if(!s.length)return i?"Check-offs wait for an OK for people whose setting is marked chores.":"";const a=t=>!t.parent&&(e.needs_ok_always||"all"===t.needs_ok_for||"marked"===t.needs_ok_for&&e.needs_ok),n=s.filter(a).map(e=>e.name);if(!i)return n.length?1===n.length?`${n[0]}'s check-offs still wait for an OK: every chore of ${n[0]}'s needs one.`:`Check-offs by ${Dl(n)} still wait for an OK: every chore of theirs needs one.`:"";const o=s.filter(e=>e.parent).map(e=>e.name),r=s.filter(e=>!e.parent&&!a(e)).map(e=>e.name),l=[];return 1===n.length?l.push(`${n[0]}'s check-offs wait for an OK.`):n.length&&l.push(`Check-offs by ${Dl(n)} wait for an OK.`),1===o.length?l.push(`${o[0]} is a parent, so ${o[0]}'s count right away.`):o.length&&l.push(`${Dl(o)} are parents, so theirs count right away.`),r.length&&l.push(`Check-offs by ${Dl(r)} count right away.`),l.join(" ")}(s,t)||void 0)}
        <div class="row">
          <span class="row-text">Stars<span class="row-sub">${null===s.stars?`★ ${a} each, from the time`:`★ ${s.stars} each`}</span></span>
          <div class="pv-seg stretch" role="group" aria-label="Stars" style="flex: 0 1 260px">
            <button type="button" aria-pressed=${null===s.stars?"true":"false"} @click=${()=>this._change({stars:null})}>Automatic</button>
            <button type="button" aria-pressed=${null!==s.stars?"true":"false"}
              @click=${()=>this._change({stars:s.stars??a})}>Set</button>
          </div>
        </div>
        ${null!==s.stars?U`
          <div class="row">
            <span class="row-text">Stars each check-off</span>
            ${this._counter(s.stars,e=>this._change({stars:e}),"stars",`★ ${s.stars}`,0,100)}
          </div>
        `:Y}
        <label class="row">
          <span class="row-text">Category</span>
          <select class="pv-input pv-select" .value=${s.category}
            @change=${e=>this._change({category:e.target.value})}>
            ${_l.map(e=>U`<option value=${e.id} ?selected=${s.category===e.id}>${e.label}</option>`)}
          </select>
        </label>
      </div>
    `}_renderAutomations(e,t){const s=t.find(t=>e.assignees.includes(t.id)),i=(a=e.id,n=s?.id,`action: planavista.complete_chore\ndata:\n  member: ${n??"casey"}\n  chore: ${a}`);var a,n;const o=s?Ol(this.hass?.states,s)[0].entity_id:null;return U`
      <h2 class="section-label">Use in automations</h2>
      <div class="group">
        <div class="row">
          <span class="row-text">Chore ID<code>${e.id}</code></span>
          <button class="pv-btn pv-btn-secondary copy" type="button" @click=${()=>this._copy(e.id,"id")}>
            ${"id"===this._copied?"Copied":"Copy"}</button>
        </div>
        <div class="row">
          <div class="stack">
            <pre>${i}</pre>
            <button class="pv-btn pv-btn-secondary copy" type="button" @click=${()=>this._copy(i,"yaml")}>
              ${"yaml"===this._copied?"Copied":"Copy"}</button>
          </div>
        </div>
      </div>
      <p class="hint">${o?`Or check it off on ${o}. `:""}The ID stays the same even if the chore is renamed.</p>
    `}async _copy(e,t){await fl(e)?(this._copied=t,window.setTimeout(()=>{this._copied===t&&(this._copied="")},2e3)):this._error("Couldn't copy. Select the text and copy it instead.")}_renderNotice(){return this._notice?"discard"===this._notice?U`
        <pv-notice-sheet .layout=${this.layout} heading="Discard changes?"
          .actions=${[{id:"discard",label:"Discard changes",kind:"destructive"},{id:"keep",label:"Keep editing",kind:"secondary"}]}
          @pv-sheet-action=${this._onDiscardChoice}></pv-notice-sheet>
      `:"delete"===this._notice&&this._activity?U`
        <pv-notice-sheet .layout=${this.layout} heading="Delete ${this._activity.name}?"
          body="It leaves the board at once. Past weeks still show what was done, and stars stay earned."
          .actions=${[{id:"delete",label:`Delete ${this._activity.name}`,kind:"destructive"},{id:"cancel",label:"Cancel",kind:"secondary"}]}
          @pv-sheet-action=${this._onDeleteChoice}></pv-notice-sheet>
      `:U`
      <pv-notice-sheet .layout=${this.layout} heading="This changed on another screen."
        .actions=${[{id:"keep",label:"Keep editing",kind:"secondary"},{id:"load",label:"Load the new version",kind:"primary"}]}
        @pv-sheet-action=${this._onChangedChoice}></pv-notice-sheet>
    `:Y}_change(e){const t={...this._draft,...e};this._record={...this._record,draft:t},this._problem="",this.drafts.set(this._draftKey,this._record)}_setMinutes(e){const t=this._draft,s="shared"===t.split&&t.assignees.length>1?$l(t.assignees,e):t.shares;this._change({minutes:e,shares:s})}_toggleMember(e){const t=this._draft,s=ss(this.household?.members??[]).map(e=>e.id),i=s.filter(s=>s===e?!t.assignees.includes(e):t.assignees.includes(s));this._change({assignees:i,shares:"shared"===t.split?$l(i,t.minutes):t.shares})}_pop(){this.dispatchEvent(new CustomEvent(Gs,{bubbles:!0,composed:!0}))}_error(e){this.dispatchEvent(new CustomEvent(Js,{detail:{message:e},bubbles:!0,composed:!0}))}_cancel(){Fl(this._record)?this._notice="discard":this._pop()}async _save(){const e=this._board,t=this._chores;if(!e||!t)return;const s=this._activity?.once?.on??this._activity?.once?.by??null,i=function(e,t,s=null){if(!e.name.trim())return"Add a name.";if("plan"===e.schedule){if(e.minutes<=0)return"Add how long it takes.";if("shared"===e.split&&e.assignees.length>1){if(e.assignees.some(t=>(e.shares[t]??0)<=0))return"Give everyone some of the time, or pick Each does it all.";if(!Sl(e).ok)return"Everyone's share has to add up to the time."}}if("once"===e.schedule&&"any"!==e.once_when){if(!e.date)return"Pick a date.";if(e.date<t&&e.date!==s)return"Pick today or a later day."}return"plan"!==e.schedule&&e.estimate<=0?"Add about how long it takes.":"repeats"!==e.schedule||function(e){const t=rr(yr(e));return!!t&&_r(t,e.start,gr(e.start,1830),1).length>0}(e.recurrence)?null:"This never happens. Pick another day or a later end date."}(this._draft,e.today,s);if(i)this._problem=i;else if(null===this._choreId||this._activity){this._saving=!0;try{const e=null!==this._choreId&&null!==this._record.rev?{id:this._choreId,rev:this._record.rev}:void 0;await t.api.saveActivity(Cl(this._record),e),this.drafts.delete(this._draftKey),this._record={...this._record,start:this._record.draft},this._pop()}catch(e){"changed"===xa(e)?this._notice="changed":this._problem=$a(e)??"Couldn't save. Check the connection and try again."}finally{this._saving=!1}}else this._problem="This chore was deleted on another screen."}_onDiscardChoice(e){e.stopPropagation(),this._notice=null;const t="discard"===e.detail.id;if(t&&(this.drafts.delete(this._draftKey),this._record={...this._record,draft:this._record.start}),this._leave){const e=this._leave;this._leave=void 0,e(t)}else t&&this._pop()}async _onDeleteChoice(e){e.stopPropagation(),this._notice=null;const t=this._activity;if("delete"===e.detail.id&&t&&this._chores)try{await this._chores.api.deleteActivity(t.id),this.drafts.delete(this._draftKey),this._record={...this._record,start:this._record.draft},this._pop()}catch(e){this._problem=$a(e)??"Couldn't delete. Check the connection and try again."}}_onChangedChoice(e){e.stopPropagation(),this._notice=null;const t=this._activity,s=this._board;t&&s&&("load"===e.detail.id?(this._record=El(t,s.today),this.drafts.delete(this._draftKey)):(this._record=function(e,t,s){const i=kl(t,s),a={...i};for(const t of Object.keys(e.draft))xl(e.draft[t],e.start[t])||(a[t]=e.draft[t]);return{draft:a,start:i,rev:t.rev??1}}(this._record,t,s.today),this.drafts.set(this._draftKey,this._record)))}}function Vl(e){return JSON.stringify(e.draft)!==JSON.stringify(e.start)}function Yl(e,t){return t?Math.min(1e4,e<20?e+1:e+5):Math.max(1,e<=20?e-1:e-5)}function Kl(e,t){return e.length?t.filter(t=>e.includes(t.id)).map(e=>e.name).join(", "):"Everyone who earns stars"}Wl.styles=[xi,yi,lt,ct,pt,Br,o`
      :host {
        max-width: 640px;
      }

      :host([layout='landscape']) {
        margin: 0 auto;
      }

      .top {
        display: flex;
        align-items: center;
        gap: 16px;
        margin-bottom: 16px;
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

      .picture-button {
        display: grid;
        justify-items: center;
        gap: 4px;
        border: none;
        background: transparent;
        color: var(--pv-accent-ink, var(--pv-accent, #6366F1));
        font: inherit;
        font-size: 0.8125rem;
        font-weight: 600;
        cursor: pointer;
      }

      .picture-button .big {
        width: 72px;
        height: 72px;
        display: grid;
        place-items: center;
        border-radius: 18px;
        background: var(--pv-card-bg, #FFFFFF);
        box-shadow: inset 0 0 0 1px var(--pv-border-subtle, #E5E7EB);
        font-size: 2.5rem;
      }

      .pictures {
        display: grid;
        grid-template-columns: repeat(auto-fill, 48px);
        gap: 6px;
        padding: 12px;
      }

      .pictures button {
        width: 48px;
        height: 48px;
        border-radius: 12px;
        border: 1px solid var(--pv-border-subtle, #E5E7EB);
        background: var(--pv-card-bg, #FFFFFF);
        font-size: 1.5rem;
        cursor: pointer;
      }

      .pictures button[aria-pressed='true'] {
        border-color: var(--pv-accent, #6366F1);
        box-shadow: inset 0 0 0 2px var(--pv-accent, #6366F1);
      }

      .name-row input {
        flex: 1;
        border: none;
        background: transparent;
        font: inherit;
        font-size: 1.0625rem;
        color: inherit;
        min-height: 48px;
      }

      .name-row input:focus {
        outline: none;
      }





      .check {
        position: absolute;
        top: 28px;
        left: calc(50% + 10px);
        width: 18px;
        height: 18px;
        display: grid;
        place-items: center;
        border-radius: 50%;
        background: var(--pv-accent, #6366F1);
        color: var(--pv-on-accent, #FFFFFF);
        font-size: 0.6875rem;
        box-shadow: 0 0 0 2px var(--pv-card-bg, #FFFFFF);
      }

      .days {
        display: flex;
        gap: 6px;
        flex-wrap: wrap;
      }

      .day {
        width: 48px;
        height: 48px;
        border-radius: 50%;
        border: 1px solid var(--pv-border-subtle, #E5E7EB);
        background: var(--pv-card-bg, #FFFFFF);
        color: inherit;
        font: inherit;
        font-weight: 600;
        cursor: pointer;
      }

      .day[aria-pressed='true'] {
        background: var(--pv-accent, #6366F1);
        border-color: var(--pv-accent, #6366F1);
        color: var(--pv-on-accent, #FFFFFF);
      }

      .stack {
        display: grid;
        gap: 8px;
        width: 100%;
      }

      .row .pv-input,
      .row .pv-select {
        max-width: 240px;
        margin-left: auto;
      }

      .other {
        max-width: 120px;
      }

      pre {
        margin: 0;
        padding: 12px 14px;
        border-radius: 12px;
        background: color-mix(in srgb, var(--pv-text, #1A1B1E) 6%, transparent);
        font-size: 0.8125rem;
        white-space: pre-wrap;
      }

      .copy {
        min-height: 48px;
        margin-left: auto;
      }

      code {
        font-size: 0.875rem;
      }

      .gone {
        color: var(--pv-text-secondary, #6B7280);
      }

      .who {
        padding: 12px 14px;
      }
    `],e([ue({attribute:!1})],Wl.prototype,"hass",void 0),e([ue({attribute:!1})],Wl.prototype,"data",void 0),e([ue({attribute:!1})],Wl.prototype,"household",void 0),e([ue({type:String,reflect:!0})],Wl.prototype,"layout",void 0),e([ue({attribute:!1})],Wl.prototype,"pageProps",void 0),e([ue({attribute:!1})],Wl.prototype,"drafts",void 0),e([ue({attribute:!1})],Wl.prototype,"services",void 0),e([ue({type:Number})],Wl.prototype,"revision",void 0),e([me()],Wl.prototype,"_record",void 0),e([me()],Wl.prototype,"_problem",void 0),e([me()],Wl.prototype,"_saving",void 0),e([me()],Wl.prototype,"_notice",void 0),e([me()],Wl.prototype,"_pictures",void 0),e([me()],Wl.prototype,"_otherEstimate",void 0),e([me()],Wl.prototype,"_copied",void 0),ge("pv-chore-editor",Wl);class Gl extends de{constructor(){super(...arguments),this.household=null,this.layout="landscape",this.services={},this.revision=0}render(){const e=this.services?.chores?.board();if(!e)return U`<div class="skeleton"></div><div class="skeleton"></div>`;const t=ss(this.household?.members??[]),s=e.rewards;return U`
      <div class="head">
        <p class="count">${s.length} ${1===s.length?"reward":"rewards"}</p>
        <button class="pv-btn pv-btn-primary new" type="button" @click=${()=>this._open(null)}>+ New reward</button>
      </div>
      ${s.length?U`
        <ul class="group">
          ${s.map(e=>U`
            <li>
              <button class="row" type="button" @click=${()=>this._open(e)}>
                <span class="picture" aria-hidden="true">${e.icon||_n(e.name,"🎁")}</span>
                <span class="row-text">
                  <span class="row-title">${e.name}</span>
                  <span class="row-sub">${function(e,t){const s=[`★ ${e.cost}`];return e.needs_ok&&s.push("needs an OK"),s.push(Kl(e.who,t)),s.join(" · ")}(e,t)}</span>
                </span>
                <span class="chevron" aria-hidden="true">›</span>
              </button>
            </li>
          `)}
        </ul>
      `:U`<p class="empty">No rewards yet. Add a few things worth saving stars for, like a movie night pick or 30 minutes of screen time.</p>`}
      ${s.length?U`<p class="hint">Kids see these in Rewards on the board and can pin one as what they're saving up for.</p>`:Y}
    `}_open(e){this.dispatchEvent(new CustomEvent(Ks,{detail:{tag:"pv-reward-editor",title:e?e.name:"New reward",back:"Rewards",props:{rewardId:e?.id??null}},bubbles:!0,composed:!0}))}}Gl.styles=[lt,ct,Br,o`
      :host {
        max-width: 640px;
      }

      .head {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-bottom: 14px;
      }

      .count {
        flex: 1;
        margin: 0;
        color: var(--pv-text-secondary, #6B7280);
      }

      .new {
        min-height: 48px;
        white-space: nowrap;
      }
    `],e([ue({attribute:!1})],Gl.prototype,"hass",void 0),e([ue({attribute:!1})],Gl.prototype,"data",void 0),e([ue({attribute:!1})],Gl.prototype,"household",void 0),e([ue({type:String})],Gl.prototype,"layout",void 0),e([ue({attribute:!1})],Gl.prototype,"services",void 0),e([ue({type:Number})],Gl.prototype,"revision",void 0),ge("pv-rewards-page",Gl);const Jl=["🎬","🎮","📺","🍦","🍕","🌙","💵","🍽️","🎨","📚","⚽","🎁","🛝","🧁","🎟️","🏊"];class Xl extends de{constructor(){super(...arguments),this.household=null,this.layout="landscape",this.pageProps={},this.drafts=new Map,this.services={},this.revision=0,this._problem="",this._saving=!1,this._notice=null,this._loaded=!1,this._announced=""}get _chores(){return this.services?.chores}get _rewardId(){return this.pageProps.rewardId??null}get _reward(){return this._chores?.board()?.rewards.find(e=>e.id===this._rewardId)??null}get _key(){return`reward:${this._rewardId??"new"}`}willUpdate(){this._loaded||!this._chores?.board()||null!==this._rewardId&&!this._reward||(this._record=this.drafts.get(this._key)??function(e){const t=function(e){return e?{name:e.name,icon:e.icon,cost:e.cost,needs_ok:e.needs_ok,who:[...e.who]}:{name:"",icon:null,cost:20,needs_ok:!0,who:[]}}(e);return{draft:t,start:t}}(this._reward),this._loaded=!0)}confirmLeave(){return this._loaded&&Vl(this._record)?(this._notice="discard",new Promise(e=>{this._leave=e})):Promise.resolve(!0)}updated(){const e=null===this._rewardId,t={label:e?"Add":"Save",ready:!(this._saving||!e&&!Vl(this._record)),save:()=>{this._save()},cancel:()=>this._cancel()},s=`${t.label}|${t.ready}`;s!==this._announced&&(this._announced=s,Qs(this,t))}render(){if(null!==this._rewardId&&this._chores?.board()&&!this._reward)return U`<p class="gone">This reward was removed on another screen.</p>`;if(!this._loaded)return U`<div class="skeleton"></div>`;const e=this._record.draft;this._rewardId;const t=ss(this.household?.members??[]).filter(e=>e.stars);return U`
      <div class="top">
        <span class="big" aria-hidden="true">${e.icon||_n(e.name||"reward","🎁")}</span>
      </div>
      ${this._problem?U`<p class="problem" role="alert">${this._problem}</p>`:Y}
      <div class="group">
        <label class="row name-row">
          <span class="row-sub" style="width: 56px">Name</span>
          <input type="text" maxlength="60" autocomplete="off" aria-label="Name" .value=${e.name}
            @input=${e=>this._change({name:e.target.value})} />
        </label>
      </div>
      <h2 class="section-label">Picture</h2>
      <div class="group">
        <div class="pictures" role="group" aria-label="Picture">
          ${Jl.map(t=>U`
            <button type="button" aria-pressed=${e.icon===t?"true":"false"} @click=${()=>this._change({icon:t})}>${t}</button>
          `)}
        </div>
      </div>
      <h2 class="section-label">Cost</h2>
      <div class="group">
        <div class="row">
          <span class="row-text">Stars</span>
          <span class="stepper">
            <output>★ ${e.cost}</output>
            <button type="button" aria-label="Fewer stars" ?disabled=${e.cost<=1} @click=${()=>this._change({cost:Yl(e.cost,!1)})}>−</button>
            <button type="button" aria-label="More stars" ?disabled=${e.cost>=1e4} @click=${()=>this._change({cost:Yl(e.cost,!0)})}>+</button>
          </span>
        </div>
        <div class="row toggle-row">
          <span class="row-text">
            <span>Needs a parent's OK</span>
            <span class="row-sub">${e.needs_ok?"Redeeming waits for a parent, and the stars are taken then.":"Redeeming takes the stars at once."}</span>
          </span>
          <div class="pv-toggle ${e.needs_ok?"active":""}" role="switch" tabindex="0" aria-checked=${e.needs_ok?"true":"false"}
            aria-label="Needs a parent's OK" @click=${()=>this._change({needs_ok:!e.needs_ok})}
            @keydown=${t=>{"Enter"!==t.key&&" "!==t.key||(t.preventDefault(),this._change({needs_ok:!e.needs_ok}))}}></div>
        </div>
      </div>
      <h2 class="section-label">Who can get it</h2>
      <div class="group">
        <div class="pv-person-chips" role="group" aria-label="Who can get it">
          <button class="chip" type="button" aria-pressed=${0===e.who.length?"true":"false"}
            @click=${()=>this._change({who:[]})}>Everyone</button>
          ${t.map(t=>U`
            <button class="pv-person-chip" type="button" aria-pressed=${e.who.includes(t.id)?"true":"false"} style="--member:${t.color}"
              @click=${()=>this._change({who:e.who.includes(t.id)?e.who.filter(e=>e!==t.id):[...e.who,t.id]})}>
              <pv-member-avatar .member=${t} .hass=${this.hass} size="28"></pv-member-avatar>${t.name}
            </button>
          `)}
        </div>
      </div>
      <p class="hint">${Kl(e.who,t)}. People earn stars when Stars is on for them on their page.</p>
      ${this._reward?U`<button class="pv-btn pv-btn-secondary danger apart end-delete" type="button" @click=${()=>{this._notice="delete"}}>Delete reward</button>`:Y}
      ${this._renderNotice()}
    `}_renderNotice(){return"discard"===this._notice?U`
        <pv-notice-sheet .layout=${this.layout} heading="Discard changes?"
          .actions=${[{id:"discard",label:"Discard changes",kind:"destructive"},{id:"keep",label:"Keep editing",kind:"secondary"}]}
          @pv-sheet-action=${this._onDiscard}></pv-notice-sheet>
      `:"delete"===this._notice&&this._reward?U`
        <pv-notice-sheet .layout=${this.layout} heading="Delete ${this._reward.name}?"
          body="Rewards already given stay in everyone's history."
          .actions=${[{id:"delete",label:`Delete ${this._reward.name}`,kind:"destructive"},{id:"cancel",label:"Cancel",kind:"secondary"}]}
          @pv-sheet-action=${this._onDelete}></pv-notice-sheet>
      `:Y}_change(e){this._record={...this._record,draft:{...this._record.draft,...e}},this._problem="",this.drafts.set(this._key,this._record)}_pop(){this.dispatchEvent(new CustomEvent(Gs,{bubbles:!0,composed:!0}))}_cancel(){Vl(this._record)?this._notice="discard":this._pop()}async _save(){const e=(t=this._record.draft).name.trim()?!Number.isInteger(t.cost)||t.cost<1||t.cost>1e4?"A reward costs from 1 to 10,000 stars.":null:"Add a name.";var t;if(e)return void(this._problem=e);const s=this._chores;if(s){this._saving=!0;try{await s.api.saveReward(function(e){return{name:e.name.trim(),icon:e.icon,cost:e.cost,needs_ok:e.needs_ok,who:e.who}}(this._record.draft),this._rewardId??void 0),this.drafts.delete(this._key),this._record={...this._record,start:this._record.draft},this._pop()}catch(e){this._problem=$a(e)??"Couldn't save. Check the connection and try again."}finally{this._saving=!1}}}_onDiscard(e){e.stopPropagation(),this._notice=null;const t="discard"===e.detail.id;if(t&&(this.drafts.delete(this._key),this._record={...this._record,draft:this._record.start}),this._leave){const e=this._leave;this._leave=void 0,e(t)}else t&&this._pop()}async _onDelete(e){e.stopPropagation(),this._notice=null;const t=this._reward;if("delete"===e.detail.id&&t&&this._chores)try{await this._chores.api.deleteReward(t.id),this.drafts.delete(this._key),this._record={...this._record,start:this._record.draft},this._pop()}catch(e){this._problem=$a(e)??"Couldn't delete. Check the connection and try again."}}}Xl.styles=[xi,lt,ct,pt,Br,o`
      :host {
        max-width: 640px;
      }

      .top {
        display: flex;
        align-items: center;
        gap: 16px;
        margin-bottom: 16px;
      }

      .actions {
        display: flex;
        gap: 8px;
        margin-left: auto;
      }

      .actions button {
        min-height: 48px;
        min-width: 88px;
      }

      .big {
        width: 72px;
        height: 72px;
        display: grid;
        place-items: center;
        border-radius: 18px;
        background: var(--pv-card-bg, #FFFFFF);
        box-shadow: inset 0 0 0 1px var(--pv-border-subtle, #E5E7EB);
        font-size: 2.5rem;
      }

      .pictures {
        display: grid;
        grid-template-columns: repeat(auto-fill, 48px);
        gap: 6px;
        padding: 12px;
      }

      .pictures button {
        width: 48px;
        height: 48px;
        border-radius: 12px;
        border: 1px solid var(--pv-border-subtle, #E5E7EB);
        background: var(--pv-card-bg, #FFFFFF);
        font-size: 1.5rem;
        cursor: pointer;
      }

      .pictures button[aria-pressed='true'] {
        border-color: var(--pv-accent, #6366F1);
        box-shadow: inset 0 0 0 2px var(--pv-accent, #6366F1);
      }

      .name-row input {
        flex: 1;
        min-height: 48px;
        border: none;
        background: transparent;
        color: inherit;
        font: inherit;
        font-size: 1.0625rem;
      }

      .name-row input:focus {
        outline: none;
      }

      .people {
        padding: 12px 14px;
      }

      .gone {
        color: var(--pv-text-secondary, #6B7280);
      }
    `],e([ue({attribute:!1})],Xl.prototype,"hass",void 0),e([ue({attribute:!1})],Xl.prototype,"data",void 0),e([ue({attribute:!1})],Xl.prototype,"household",void 0),e([ue({type:String})],Xl.prototype,"layout",void 0),e([ue({attribute:!1})],Xl.prototype,"pageProps",void 0),e([ue({attribute:!1})],Xl.prototype,"drafts",void 0),e([ue({attribute:!1})],Xl.prototype,"services",void 0),e([ue({type:Number})],Xl.prototype,"revision",void 0),e([me()],Xl.prototype,"_record",void 0),e([me()],Xl.prototype,"_problem",void 0),e([me()],Xl.prototype,"_saving",void 0),e([me()],Xl.prototype,"_notice",void 0),ge("pv-reward-editor",Xl);class Ql extends de{constructor(){super(...arguments),this.household=null,this.layout="landscape",this.services={},this.revision=0,this._pending={}}get _chores(){return this.services?.chores}render(){const e=this._chores?.board();if(!e)return U`<div class="skeleton"></div><div class="skeleton"></div>`;const t={...e.settings,...this._pending},s=this.data?.display?.time_format??"12h",i="sunday"===this.data?.display?.first_day?"Sunday":"Monday";return U`
      <h2 class="section-label">If a chore is missed</h2>
      <div class="pv-choices" role="radiogroup" aria-label="If a chore is missed">
        ${al.map(e=>U`
          <label class="pv-choice">
            <input type="radio" name="missed" .checked=${t.missed===e.id}
              @change=${()=>this._save({missed:e.id})} />
            <span class="choice-text">
              <span class="choice-title">${e.label}</span>
              <span class="choice-sub">${e.description}</span>
            </span>
            <span class="choice-check" aria-hidden="true">✓</span>
          </label>
        `)}
      </div>
      <p class="hint">A change starts with the next chore day. A parent can excuse a sick day under any rule.</p>

      <h2 class="section-label">Days and weeks</h2>
      <div class="group">
        <label class="row">
          <span class="row-text">A chore day starts at</span>
          <pv-time-field .value=${t.day_starts} .format=${"24h"===s?"24h":"12h"}
            .slots=${function(e="12h"){const t=[];for(let s=0;s<=12;s++){const i=`${String(Math.floor(s/2)).padStart(2,"0")}:${s%2?"30":"00"}`;t.push({value:i,label:Tr(i,e)})}return t}(s).map(e=>e.value)}
            @change=${e=>this._save({day_starts:e.target.value})}></pv-time-field>
        </label>
        <div class="row">
          <span class="row-text">Weeks start on</span>
          <span class="row-value">${i}</span>
        </div>
      </div>
      <p class="hint">Late-night check-offs count for the day before. Weeks follow the calendar's setting in Calendar options.</p>

      <h2 class="section-label">Waiting for OK</h2>
      <div class="group">
        ${this._toggle("day_end"===t.auto_approve,"Approve at the end of the day",()=>this._save({auto_approve:"day_end"===t.auto_approve?"never":"day_end"}))}
      </div>
      <p class="hint">Anything still waiting when the chore day ends is approved. On time means when it was done, not when it was approved.</p>

      <h2 class="section-label">Stars</h2>
      <div class="group">
        <div class="row">
          <span class="row-text">1 star for every</span>
          <span class="stepper">
            <output>${t.minutes_per_star} min</output>
            <button type="button" aria-label="Fewer minutes per star" ?disabled=${t.minutes_per_star<=5}
              @click=${()=>this._save({minutes_per_star:nl(t.minutes_per_star,!1)})}>−</button>
            <button type="button" aria-label="More minutes per star" ?disabled=${t.minutes_per_star>=240}
              @click=${()=>this._save({minutes_per_star:nl(t.minutes_per_star,!0)})}>+</button>
          </span>
        </div>
      </div>
      <p class="hint">A chore can set its own stars instead. A change applies to stars earned from then on.</p>

      <h2 class="section-label">Sound</h2>
      <div class="group">
        ${this._toggle(t.sound,"Play a sound when a chore is done",()=>this._save({sound:!t.sound}))}
      </div>
    `}_toggle(e,t,s){return U`
      <div class="row toggle-row">
        <span class="row-text">${t}</span>
        <div class="pv-toggle ${e?"active":""}" role="switch" tabindex="0" aria-checked=${e?"true":"false"}
          aria-label=${t} @click=${s}
          @keydown=${e=>{"Enter"!==e.key&&" "!==e.key||(e.preventDefault(),s())}}></div>
      </div>
    `}async _save(e){const t=this._chores;if(t){this._pending={...this._pending,...e};try{await t.api.saveSettings(e)}catch(e){this.dispatchEvent(new CustomEvent(Js,{detail:{message:$a(e)??"Couldn't save. Check the connection and try again."},bubbles:!0,composed:!0}))}finally{const t={...this._pending};for(const s of Object.keys(e))delete t[s];this._pending=t}}}}Ql.styles=[fi,lt,ct,pt,Br,o`
      :host {
        max-width: 640px;
      }



      .row .pv-select {
        max-width: 160px;
        margin-left: auto;
      }
    `],e([ue({attribute:!1})],Ql.prototype,"hass",void 0),e([ue({attribute:!1})],Ql.prototype,"data",void 0),e([ue({attribute:!1})],Ql.prototype,"household",void 0),e([ue({type:String})],Ql.prototype,"layout",void 0),e([ue({attribute:!1})],Ql.prototype,"services",void 0),e([ue({type:Number})],Ql.prototype,"revision",void 0),e([me()],Ql.prototype,"_pending",void 0),ge("pv-rules-page",Ql);class Zl extends de{constructor(){super(...arguments),this.household=null,this.layout="landscape",this.services={},this.revision=0,this._evening=void 0}get _chores(){return this.services?.chores}render(){const e=this._chores?.board();if(!e)return U`<div class="skeleton"></div><div class="skeleton"></div>`;const t=ss(this.household?.members??[]),s=this.data?.display?.time_format??"12h",i=void 0!==this._evening?this._evening:e.settings.evening_check,a=i?Tr(i,s):null,n=function(e){const t=e.filter(e=>tl(e).length).map(e=>({member:e,phones:tl(e),on:el(e).reminders}));return{rows:t,noPhone:e.filter(e=>!tl(e).length&&!!e.person)}}(t),o=function(e){const t=e.filter(e=>e.parent);return{rows:t.filter(e=>tl(e).length).map(e=>({member:e,phones:tl(e),on:el(e).requests})),noPhone:t.filter(e=>!tl(e).length)}}(t);return U`
      <h2 class="section-label">Evening check</h2>
      <div class="group">
        <div class="row toggle-row">
          <span class="row-text">Evening check on the screen</span>
          ${this._switch(!!i,"Evening check on the screen",()=>this._saveEvening(i?null:"19:00"))}
        </div>
        ${i?U`
          <label class="row">
            <span class="row-text">At</span>
            <pv-time-field .value=${i} .format=${"24h"===s?"24h":"12h"}
              .slots=${function(e,t="12h"){const s=[];for(let e=32;e<=44;e++){const i=`${String(Math.floor(e/2)).padStart(2,"0")}:${e%2?"30":"00"}`;s.push({value:i,label:Tr(i,t)})}return e&&!s.some(t=>t.value===e)&&(s.push({value:e,label:Tr(e,t)}),s.sort((e,t)=>e.value.localeCompare(t.value))),s}(i,s).map(e=>e.value)}
              @change=${e=>this._saveEvening(e.target.value)}></pv-time-field>
          </label>
        `:Y}
      </div>
      <p class="hint">${a?`At ${a}, the board says who still has chores, like "Casey has 2 chores left", and their column pulses once.`:"Turn it on to have the board say who still has chores in the evening."}</p>

      <h2 class="section-label">Phone reminders</h2>
      ${n.rows.length?U`
        <div class="group">${n.rows.map(e=>this._phoneRow(e,a?`At ${a}, only if chores are left`:"Turn on the evening check to send reminders","reminders",!!a))}</div>
      `:Y}
      ${n.noPhone.length?U`
        <p class="hint">No phone yet for ${il(n.noPhone)}. Add one on their page in People.</p>
      `:Y}
      ${n.rows.length||n.noPhone.length?Y:U`
        <p class="hint">Phones are set on each person's page, for people linked to a Home Assistant person.</p>
      `}

      <h2 class="section-label">Waiting for OK requests</h2>
      ${o.rows.length?U`
        <div class="group">${o.rows.map(e=>this._phoneRow(e,"Requests come with Looks good and Send back buttons","requests",!0))}</div>
      `:Y}
      ${o.noPhone.length?U`
        <p class="hint">No phone yet for ${il(o.noPhone)}. Add one on their page in People.</p>
      `:Y}
      <p class="hint">Without a phone, requests wait in Waiting for OK on the screen${"day_end"===e.settings.auto_approve?", and anything still waiting is approved at the end of the day":""}.</p>
    `}_switch(e,t,s,i=!1){return U`
      <div class="pv-toggle ${e?"active":""}" role="switch" tabindex=${i?"-1":"0"}
        aria-checked=${e?"true":"false"} aria-disabled=${i?"true":"false"} aria-label=${t}
        style=${i?"opacity: 0.45; pointer-events: none":""}
        @click=${s}
        @keydown=${e=>{"Enter"!==e.key&&" "!==e.key||(e.preventDefault(),s())}}></div>
    `}_phoneRow(e,t,s,i){const a=`${e.member.name}: ${"reminders"===s?"reminders":"requests"} on ${e.phones.map(e=>sl(e)).join(", ")}`;return U`
      <div class="row toggle-row">
        <pv-member-avatar .member=${e.member} .hass=${this.hass} size="36"></pv-member-avatar>
        <span class="row-text">
          <span class="row-title">${e.member.name} · ${e.phones.map(e=>sl(e)).join(", ")}</span>
          <span class="row-sub">${t}</span>
        </span>
        ${this._switch(e.on&&i,a,()=>this._saveNotify(e.member,s,!e.on),!i)}
      </div>
    `}_error(e){this.dispatchEvent(new CustomEvent(Js,{detail:{message:$a(e)??"Couldn't save. Check the connection and try again."},bubbles:!0,composed:!0}))}async _saveEvening(e){const t=this._chores;if(t){this._evening=e;try{await t.api.saveSettings({evening_check:e})}catch(e){this._error(e)}finally{this._evening=void 0}}}async _saveNotify(e,t,s){try{await this.api.saveMember({notify:{...el(e),[t]:s}},{id:e.id})}catch(e){this._error(e)}}}function ed(e){const t=e.from===e.to?cr(e.from):`${cr(e.from)} to ${cr(e.to)}`;return e.note?`${t} · ${e.note}`:t}function td(e){const t=Math.floor(e),s=Math.round(60*(e-t));return s?`${t} h ${s} min`:`${t} h`}Zl.styles=[lt,ct,pt,Br,o`
      :host {
        max-width: 640px;
      }

      .row .pv-select {
        max-width: 160px;
        margin-left: auto;
      }

      button.row .row-sub {
        white-space: normal;
      }
    `],e([ue({attribute:!1})],Zl.prototype,"hass",void 0),e([ue({attribute:!1})],Zl.prototype,"data",void 0),e([ue({attribute:!1})],Zl.prototype,"household",void 0),e([ue({attribute:!1})],Zl.prototype,"api",void 0),e([ue({type:String})],Zl.prototype,"layout",void 0),e([ue({attribute:!1})],Zl.prototype,"services",void 0),e([ue({type:Number})],Zl.prototype,"revision",void 0),e([me()],Zl.prototype,"_evening",void 0),ge("pv-reminders-page",Zl);const sd=[["all","Every chore"],["marked","Marked chores"],["none","No chores"]],id=[["timeline","Timeline"],["list","List"],["pictures","Pictures"]];class ad extends de{constructor(){super(...arguments),this.household=null,this.member=null,this.services={},this.revision=0,this.layout="landscape",this._adding=null,this._addAway=()=>{const e=this._adding;if(!e)return;const t=e.note?.trim()||null,s=[...this.draft.away,{from:e.from,to:e.to,note:t}].sort((e,t)=>e.from.localeCompare(t.from));this._change({away:s}),this._adding=null},this._openStars=()=>{this.member&&this.dispatchEvent(new CustomEvent(Ks,{detail:{tag:"pv-person-stars",title:`${this.member.name}'s stars`,back:this.member.name,props:{memberId:this.member.id}},bubbles:!0,composed:!0}))}}_change(e){this.dispatchEvent(new CustomEvent(Ia,{detail:e,bubbles:!0,composed:!0}))}render(){const e=this.draft;if(!e)return Y;const t=this.services?.chores?.board(),s=this.member&&t?t.members[this.member.id]?.stars??0:null,i=(a=t?.rewards??[],n=this.member?.id??"",a.filter(e=>!e.who.length||e.who.includes(n)));var a,n;return U`
      <span class="legend">Chores</span>
      <div class="group">
        ${e.parent?U`
          <div class="row">
            <span class="row-text">Needs an OK for<span class="row-sub">Never: a parent's check-offs count right away.</span></span>
          </div>
        `:U`
          <div class="row">
            <div class="stack">
              <span>Needs an OK for</span>
              <div class="pv-seg stretch" role="group" aria-label="Needs an OK for">
                ${sd.map(([t,s])=>U`
                  <button type="button" aria-pressed=${e.needs_ok_for===t?"true":"false"}
                    @click=${()=>this._change({needs_ok_for:t})}>${s}</button>
                `)}
              </div>
            </div>
          </div>
        `}
        <div class="row">
          <div class="stack">
            <span>My day</span>
            <div class="pv-seg stretch" role="group" aria-label="My day">
              ${id.map(([t,s])=>U`
                <button type="button" aria-pressed=${e.my_day===t?"true":"false"}
                  @click=${()=>this._change({my_day:t})}>${s}</button>
              `)}
            </div>
          </div>
        </div>
        <div class="row toggle-row">
          <span class="row-text">Earns stars</span>
          <div class="pv-toggle ${e.stars?"active":""}" role="switch" tabindex="0" aria-checked=${e.stars?"true":"false"}
            aria-label="Earns stars" @click=${()=>this._change({stars:!e.stars})}
            @keydown=${t=>{"Enter"!==t.key&&" "!==t.key||(t.preventDefault(),this._change({stars:!e.stars}))}}></div>
        </div>
        ${this.member&&null!==s?U`
          <button class="row" type="button" @click=${this._openStars}>
            <span class="row-text">Stars<span class="row-sub">History, and give or take stars with a reason</span></span>
            <span class="stars">★ ${s}</span>
            <span class="chevron" aria-hidden="true">›</span>
          </button>
        `:Y}
        ${e.stars?U`
          <label class="row">
            <span class="row-text">Saving up for</span>
            <select class="pv-input pv-select" .value=${e.goal??""}
              @change=${e=>this._change({goal:e.target.value||null})}>
              <option value="" ?selected=${!e.goal}>Nothing yet</option>
              ${i.map(t=>U`<option value=${t.id} ?selected=${e.goal===t.id}>${t.icon?`${t.icon} `:""}${t.name}</option>`)}
            </select>
          </label>
        `:Y}
        ${this._renderAway(e)}
      </div>
      <p class="hint">These start from the ${Jt[e.age_group].toLocaleLowerCase()} defaults.</p>
    `}_renderAway(e){return U`
      <div class="row">
        <span class="row-text">Away<span class="row-sub">Pause chores for a few days. Nothing is due or missed, and streaks hold.</span></span>
        ${this._adding?Y:U`
          <button class="pv-btn pv-btn-secondary remove" type="button"
            @click=${()=>{this._adding={from:"",to:"",note:""}}}>Add a time away</button>
        `}
      </div>
      ${e.away.map((t,s)=>U`
        <div class="row">
          <span class="row-text">${ed(t)}</span>
          <button class="pv-btn pv-btn-secondary remove" type="button" aria-label="Remove ${ed(t)}"
            @click=${()=>this._change({away:e.away.filter((e,t)=>t!==s)})}>Remove</button>
        </div>
      `)}
      ${this._adding?U`
        <div class="row">
          <div class="stack">
            <div class="away-form">
              <label>From <pv-date-field  .value=${this._adding.from}
                @change=${e=>{this._adding={...this._adding,from:e.target.value}}}></pv-date-field></label>
              <label>To <pv-date-field  .value=${this._adding.to} min=${this._adding.from}
                @change=${e=>{this._adding={...this._adding,to:e.target.value}}}></pv-date-field></label>
              <label>Note <input class="pv-input" type="text" maxlength="60" placeholder="At Grandma's" .value=${this._adding.note??""}
                @input=${e=>{this._adding={...this._adding,note:e.target.value}}} /></label>
            </div>
            <div style="display: flex; gap: 8px; justify-content: flex-end">
              <button class="pv-btn pv-btn-secondary" type="button" @click=${()=>{this._adding=null}}>Cancel</button>
              <button class="pv-btn pv-btn-primary" type="button"
                ?disabled=${!this._adding.from||!this._adding.to||this._adding.to<this._adding.from}
                @click=${this._addAway}>Add</button>
            </div>
          </div>
        </div>
      `:Y}
    `}}ad.styles=[yi,lt,ct,pt,Br,o`
      :host {
        margin: 0 0 22px;
      }

      .legend {
        display: block;
        margin-bottom: 8px;
        font-size: 0.8125rem;
        font-weight: 750;
        color: var(--pv-text-secondary, #5F6670);
      }

      .stack {
        display: grid;
        gap: 8px;
        width: 100%;
      }

      .row .pv-select {
        max-width: 240px;
        margin-left: auto;
      }

      .away-form {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
        gap: 8px;
        width: 100%;
      }

      .remove {
        min-height: 48px;
        margin-left: auto;
      }
    `],e([ue({attribute:!1})],ad.prototype,"hass",void 0),e([ue({attribute:!1})],ad.prototype,"household",void 0),e([ue({attribute:!1})],ad.prototype,"member",void 0),e([ue({attribute:!1})],ad.prototype,"draft",void 0),e([ue({attribute:!1})],ad.prototype,"services",void 0),e([ue({type:Number})],ad.prototype,"revision",void 0),e([ue({type:String})],ad.prototype,"layout",void 0),e([me()],ad.prototype,"_adding",void 0),ge("pv-person-chores",ad);class nd extends de{_change(e){this.dispatchEvent(new CustomEvent(Ia,{detail:e,bubbles:!0,composed:!0}))}_bedtime(e,t){const s=this.draft.bedtime;if(!t)return void this._change({bedtime:"weeknight"===e?null:s?{...s,weekend:s.weeknight}:null});const i="weeknight"===e?t:s?.weeknight??t,a="weekend"===e?t:s?.weekend??t;this._change({bedtime:{weeknight:i,weekend:a}})}render(){const e=this.draft;if(!e)return Y;const t=e.sleep_hours;return U`
      <span class="legend">Sleep</span>
      <div class="group">
        <label class="row">
          <span class="row-text">Bedtime, weeknights</span>
          <pv-time-field  .format=${"24h"===this.data?.display?.time_format?"24h":"12h"} .value=${e.bedtime?.weeknight??""}
            @change=${e=>this._bedtime("weeknight",e.target.value)}></pv-time-field>
        </label>
        <label class="row">
          <span class="row-text">Bedtime, weekends<span class="row-sub">Friday and Saturday nights</span></span>
          <pv-time-field  .format=${"24h"===this.data?.display?.time_format?"24h":"12h"} .value=${e.bedtime?.weekend??""} ?disabled=${!e.bedtime}
            @change=${e=>this._bedtime("weekend",e.target.value)}></pv-time-field>
        </label>
        <div class="row">
          <span class="row-text">Sleep</span>
          <span class="stepper">
            <output>${null===t?"Not set":td(t)}</output>
            <button type="button" aria-label="Less sleep" ?disabled=${null!==t&&t<=1}
              @click=${()=>this._change({sleep_hours:null===t?8:Math.max(1,t-.5)})}>−</button>
            <button type="button" aria-label="More sleep" ?disabled=${null!==t&&t>=16}
              @click=${()=>this._change({sleep_hours:null===t?8:Math.min(16,t+.5)})}>+</button>
          </span>
        </div>
      </div>
      <p class="hint">My day starts after sleep and ends at bedtime.</p>
    `}}nd.styles=[lt,pt,Br,o`
      :host {
        margin: 0 0 22px;
      }

      .legend {
        display: block;
        margin-bottom: 8px;
        font-size: 0.8125rem;
        font-weight: 750;
        color: var(--pv-text-secondary, #5F6670);
      }

      .row .pv-input {
        max-width: 160px;
        margin-left: auto;
      }
    `],e([ue({attribute:!1})],nd.prototype,"draft",void 0),e([ue({attribute:!1})],nd.prototype,"data",void 0),ge("pv-person-sleep",nd);class od extends de{constructor(){super(...arguments),this.household=null,this.member=null,this.services={},this.revision=0,this._copied=!1}_change(e){this.dispatchEvent(new CustomEvent(Ia,{detail:e,bubbles:!0,composed:!0}))}_togglePhone(e){const t=this.draft.phones.includes(e)?this.draft.phones.filter(t=>t!==e):[...this.draft.phones,e].slice(0,5);this._change({phones:t})}render(){const e=this.draft;if(!e)return Y;const t=function(e,t){const s=Object.keys(e?.services?.notify??{}).filter(e=>e.startsWith("mobile_app_")),i=t.person?e?.states?.[t.person]?.attributes?.device_trackers:void 0,a=new Set((Array.isArray(i)?i:[]).map(e=>String(e).replace(/^device_tracker\./,""))),n=Array.isArray(t.phones)?t.phones:[];return[...new Set([...s.map(e=>`notify.${e}`),...n])].map(e=>{const t=e.replace(/^notify\.mobile_app_/,"");return{service:e,label:sl(e),suggested:a.has(t)}}).sort((e,t)=>Number(t.suggested)-Number(e.suggested)||e.label.localeCompare(t.label))}(this.hass,{person:e.person,phones:e.phones}),s=this.services?.chores?.board(),i=s?.settings.evening_check??null,a=this.data?.display?.time_format??"12h";return U`
      <span class="legend">Phones</span>
      <div class="group">
        ${t.length?U`
          <div class="phones chips" role="group" aria-label="Phones">
            ${t.map(t=>U`
              <button class="chip chip--plain" type="button" aria-pressed=${e.phones.includes(t.service)?"true":"false"}
                @click=${()=>this._togglePhone(t.service)}>
                ${t.label}${t.suggested?U` <span class="suggested">· theirs</span>`:Y}
              </button>
            `)}
          </div>
        `:U`
          <div class="row"><span class="row-sub">No phones with the Home Assistant app yet. Install the Companion app on a phone, and it shows up here.</span></div>
        `}
        ${e.phones.length?U`
          ${this._toggle(e.notify.reminders,"Evening reminders",i?`At ${Tr(i,a)}, only if chores are left`:"Turn on the evening check in Reminders",()=>this._change({notify:{...e.notify,reminders:!e.notify.reminders}}))}
          ${e.parent?this._toggle(e.notify.requests,"Waiting for OK requests","With Looks good and Send back buttons",()=>this._change({notify:{...e.notify,requests:!e.notify.requests}})):Y}
        `:Y}
      </div>
      ${this.member?this._renderAutomations(this.member):Y}
    `}_toggle(e,t,s,i){return U`
      <div class="row toggle-row">
        <span class="row-text"><span>${t}</span><span class="row-sub">${s}</span></span>
        <div class="pv-toggle ${e?"active":""}" role="switch" tabindex="0" aria-checked=${e?"true":"false"}
          aria-label=${t} @click=${i}
          @keydown=${e=>{"Enter"!==e.key&&" "!==e.key||(e.preventDefault(),i())}}></div>
      </div>
    `}_renderAutomations(e){const t=this.hass?.devices??{},s=Object.entries(t).find(([,t])=>t.name===e.name&&"Household member"===t.model)?.[0];return U`
      <span class="legend space">Use in automations</span>
      <div class="group">
        <div class="row">
          <span class="row-text">ID<code>${e.id}</code></span>
          <button class="pv-btn pv-btn-secondary copy" type="button" @click=${()=>this._copy(e.id)}>${this._copied?"Copied":"Copy"}</button>
        </div>
        ${Ol(this.hass?.states,e).map(e=>U`
          <div class="row">
            <span class="row-text">${e.label}<code>${e.entity_id}</code></span>
          </div>
        `)}
      </div>
      <p class="hint">
        These names stay the same even if ${e.name} is renamed.
        ${s?U`<a href="/config/devices/device/${s}" target="_top">Open ${e.name} in Home Assistant ↗</a>`:Y}
      </p>
    `}async _copy(e){this._copied=await fl(e),window.setTimeout(()=>{this._copied=!1},2e3)}}od.styles=[lt,ct,pt,Br,o`
      :host {
        margin: 0 0 22px;
      }

      .legend {
        display: block;
        margin: 0 0 8px;
        font-size: 0.8125rem;
        font-weight: 750;
        color: var(--pv-text-secondary, #5F6670);
      }

      .legend + .group {
        margin-bottom: 0;
      }

      .space {
        margin-top: 22px;
      }

      .phones {
        padding: 12px 14px;
      }

      .suggested {
        font-size: 0.75rem;
        color: var(--pv-text-secondary, #6B7280);
      }

      code {
        font-size: 0.8125rem;
        overflow-wrap: anywhere;
      }

      .copy {
        min-height: 48px;
        margin-left: auto;
      }

      a {
        color: var(--pv-accent-ink, var(--pv-accent, #6366F1));
      }
    `],e([ue({attribute:!1})],od.prototype,"hass",void 0),e([ue({attribute:!1})],od.prototype,"data",void 0),e([ue({attribute:!1})],od.prototype,"household",void 0),e([ue({attribute:!1})],od.prototype,"member",void 0),e([ue({attribute:!1})],od.prototype,"draft",void 0),e([ue({attribute:!1})],od.prototype,"services",void 0),e([ue({type:Number})],od.prototype,"revision",void 0),e([me()],od.prototype,"_copied",void 0),ge("pv-person-phones",od);class rd extends de{constructor(){super(...arguments),this.household=null,this.layout="landscape",this.pageProps={},this.services={},this.revision=0,this._history=null,this._balance=0,this._give=!0,this._amount=5,this._reason="",this._problem="",this._saving=!1,this._award=async()=>{const e=this._reason.trim();if(!e)return void(this._problem="Add a reason.");const t=this._chores;if(t){this._saving=!0;try{const s=await t.api.awardStars(this._memberId,this._give?this._amount:-this._amount,e);this._balance=s.balance,this._reason="",await this._load()}catch(e){this._problem=$a(e)??"Couldn't save. Check the connection and try again."}finally{this._saving=!1}}}}get _memberId(){return String(this.pageProps.memberId??"")}get _chores(){return this.services?.chores}connectedCallback(){super.connectedCallback(),this._load()}async _load(){try{const e=await(this._chores?.api.starHistory(this._memberId));e&&(this._history=e.history,this._balance=e.balance)}catch(e){this._problem=$a(e)??"Couldn't load the history. Check the connection and try again.",this._history=[]}}render(){const e=this.household?.members??[],t=Object.fromEntries(e.map(e=>[e.id,e.name])),s=this._chores?.board()?.members[this._memberId]?.stars??this._balance;return U`
      <p class="balance" aria-label="${s} stars">★ ${s}</p>
      ${this._problem?U`<p class="problem" role="alert">${this._problem}</p>`:Y}
      <h2 class="section-label">Give or take</h2>
      <div class="group">
        <div class="row">
          <div class="pv-seg stretch" role="group" aria-label="Give or take">
            <button type="button" aria-pressed=${this._give?"true":"false"} @click=${()=>{this._give=!0}}>Give</button>
            <button type="button" aria-pressed=${this._give?"false":"true"} @click=${()=>{this._give=!1}}>Take</button>
          </div>
        </div>
        <div class="row">
          <span class="row-text">Stars</span>
          <span class="stepper">
            <output>★ ${this._amount}</output>
            <button type="button" aria-label="Fewer stars" ?disabled=${this._amount<=1} @click=${()=>{this._amount-=1}}>−</button>
            <button type="button" aria-label="More stars" ?disabled=${this._amount>=100} @click=${()=>{this._amount+=1}}>+</button>
          </span>
        </div>
        <div class="row">
          <input class="pv-input reason" type="text" maxlength="60" placeholder="Why? Like: Helped a neighbor" aria-label="Reason"
            .value=${this._reason} @input=${e=>{this._reason=e.target.value,this._problem=""}} />
        </div>
        <div class="row">
          <button class="pv-btn pv-btn-primary" type="button" style="margin-left: auto" ?disabled=${this._saving} @click=${this._award}>
            ${this._give?`Give ★ ${this._amount}`:`Take ★ ${this._amount}`}
          </button>
        </div>
      </div>
      <h2 class="section-label">History</h2>
      ${null===this._history?U`<div class="skeleton"></div><div class="skeleton"></div>`:this._history.length?U`
        <ul class="group">
          ${this._history.map(e=>{const s=function(e,t){const s=e.delta>0?`+${e.delta}`:`−${Math.abs(e.delta)}`;let i;return i="chore"===e.reason?e.name??"A chore":"undo"===e.reason?`Unchecked: ${e.name??"a chore"}`:"redeemed"===e.reason?e.name??"A reward":e.by&&t[e.by]?`${e.reason} (${t[e.by]})`:e.reason,{amount:s,what:i}}(e,t);return U`
              <li class="row">
                <span class="amount ${e.delta>0?"plus":""}">${s.amount}</span>
                <span class="row-text">${s.what}</span>
                <span class="when">${new Date(e.at).toLocaleDateString(void 0,{month:"short",day:"numeric"})}</span>
              </li>
            `})}
        </ul>
      `:U`<p class="empty">No stars yet.</p>`}
    `}}rd.styles=[yi,lt,ct,pt,Br,o`
      :host {
        max-width: 640px;
      }

      .balance {
        margin: 0 0 18px;
        font-family: var(--pv-font-heading, ui-rounded, 'SF Pro Rounded', 'PlanaVista Rounded', system-ui, sans-serif);
        font-size: 2.25rem;
        font-weight: 800;
        color: var(--pv-star-ink, #8A6A00);
      }

      .reason {
        width: 100%;
      }

      .amount {
        font-weight: 700;
        min-width: 48px;
      }

      .plus {
        color: var(--pv-success-ink, #2F7D4F);
      }

      .when {
        color: var(--pv-text-secondary, #6B7280);
        font-size: 0.8125rem;
        white-space: nowrap;
      }
    `],e([ue({attribute:!1})],rd.prototype,"hass",void 0),e([ue({attribute:!1})],rd.prototype,"data",void 0),e([ue({attribute:!1})],rd.prototype,"household",void 0),e([ue({type:String})],rd.prototype,"layout",void 0),e([ue({attribute:!1})],rd.prototype,"pageProps",void 0),e([ue({attribute:!1})],rd.prototype,"services",void 0),e([ue({type:Number})],rd.prototype,"revision",void 0),e([me()],rd.prototype,"_history",void 0),e([me()],rd.prototype,"_balance",void 0),e([me()],rd.prototype,"_give",void 0),e([me()],rd.prototype,"_amount",void 0),e([me()],rd.prototype,"_reason",void 0),e([me()],rd.prototype,"_problem",void 0),e([me()],rd.prototype,"_saving",void 0),ge("pv-person-stars",rd);const ld="Pasted text";class dd extends de{constructor(){super(...arguments),this.household=null,this.layout="landscape",this.services={},this.revision=0,this._pasting=null,this._text="",this._reading=!1,this._problem=null,this._exported=null,this._copied=!1,this._confirming=!1,this._mode="import",this._onStartOver=async e=>{if(e.stopPropagation(),this._confirming=!1,"start_over"===e.detail.id&&this._chores)try{await this._chores.api.startOver()}catch(e){const t=$a(e)??"Couldn't start over. Try again.";this.dispatchEvent(new CustomEvent(Js,{detail:{message:t},bubbles:!0,composed:!0}))}},this._onFile=async e=>{const t=e.target.files?.[0];if(!t)return;const s=await t.text();await this._read(s,t.name,this._mode)},this._export=async()=>{const e=this._chores;if(e)try{const{file:t,name:s}=await e.api.exportHousehold(),i=JSON.stringify(t,null,2);this._exported={text:i,name:s};const a=URL.createObjectURL(new Blob([i],{type:"application/json"})),n=document.createElement("a");n.href=a,n.download=s,n.click(),window.setTimeout(()=>URL.revokeObjectURL(a),1e4)}catch(e){this._problem={name:"Export",mode:"import",problem:{code:"error",message:$a(e)??"Couldn't export. Check the connection and try again.",problems:[]}}}},this._copy=async()=>{this._exported&&(this._copied=await fl(this._exported.text),window.setTimeout(()=>{this._copied=!1},2e3))}}get _chores(){return this.services?.chores}render(){const e="needs_a_look"===this._chores?.feed?.state;return U`
      ${e?U`
        <div class="error look" role="alert">
          <h3><span class="mark" aria-hidden="true">!</span>Chores need a look</h3>
          <p class="row-sub">Some chores data couldn't be read, so the board waits for a parent. Restore a PlanaVista file you
            exported (under Restore), or a Home Assistant backup from before it went missing (Settings, System, Backups).
            Or start over with no chores.</p>
          <div class="actions">
            <button class="pv-btn pv-btn-secondary" type="button" @click=${()=>{this._confirming=!0}}>Start over…</button>
          </div>
        </div>
      `:Y}
      ${this._confirming?U`
        <pv-notice-sheet .layout=${this.layout} heading="Start over with no chores?"
          body="Chores, rewards, stars, and their history are emptied. People, PINs, and calendars stay as they are."
          .actions=${[{id:"start_over",label:"Start over",kind:"destructive"},{id:"cancel",label:"Cancel",kind:"secondary"}]}
          @pv-sheet-action=${this._onStartOver}></pv-notice-sheet>
      `:Y}
      <input type="file" accept=".json,application/json,text/plain" @change=${this._onFile} />
      <h2 class="section-label">Import a plan</h2>
      <div class="group">
        <div class="row"><span class="row-sub">A Household Hours plan (version 1) brings its people, bedtimes, and activities. You see where everything goes before anything is saved.</span></div>
        ${this._renderActions("import")}
      </div>
      ${"import"===this._problem?.mode?this._renderProblem():Y}

      <h2 class="section-label">Export</h2>
      <div class="group">
        <div class="row"><span class="row-sub">Saves people, chores, rewards, and rules as a PlanaVista file that other tools can read. PINs, stars, and history aren't in it; Home Assistant backups keep those.</span></div>
        <div class="actions">
          <button class="pv-btn pv-btn-secondary" type="button" @click=${this._export}>Export a PlanaVista file</button>
          ${this._exported?U`
            <button class="pv-btn pv-btn-secondary" type="button" @click=${this._copy}>${this._copied?"Copied":"Copy the text"}</button>
          `:Y}
        </div>
      </div>

      <h2 class="section-label">Restore</h2>
      <div class="group">
        <div class="row"><span class="row-sub">Bring a household back from a PlanaVista file, such as after rebuilding Home Assistant. It shows the same review first.</span></div>
        ${this._renderActions("restore")}
      </div>
      ${"restore"===this._problem?.mode?this._renderProblem():Y}
    `}_renderActions(e){return U`
      <div class="actions">
        <button class="pv-btn ${"restore"===e?"pv-btn-secondary":"pv-btn-primary"}" type="button" ?disabled=${this._reading}
          @click=${()=>this._choose(e)}>Choose a file</button>
        <button class="pv-btn pv-btn-secondary" type="button" @click=${()=>{this._pasting=this._pasting===e?null:e,this._problem=null}}>
          Paste text</button>
      </div>
      ${this._pasting===e?U`
        <div class="paste">
          <textarea class="pv-input" aria-label="The file's text" placeholder="Paste the file's text here"
            .value=${this._text} @input=${e=>{this._text=e.target.value}}></textarea>
          <button class="pv-btn pv-btn-primary" type="button" ?disabled=${!this._text.trim()||this._reading}
            @click=${()=>this._read(this._text,ld,e)}>Review</button>
        </div>
      `:Y}
    `}_renderProblem(){const{name:e,problem:t}=this._problem;return U`
      <div class="error" role="alert">
        <h3><span class="mark" aria-hidden="true">!</span>Can't read this file</h3>
        <div>${"unknown_file"===t.code?(e===ld?"This text":`"${e}"`)+" isn't a plan PlanaVista knows. It reads Household Hours plans (version 1) and files exported from PlanaVista.":t.message}</div>
        ${t.problems.length?U`<ul>${t.problems.map(e=>U`<li>${e}</li>`)}</ul>`:Y}
        <div class="actions" style="padding: 12px 0 0">
          <button class="pv-btn pv-btn-secondary" type="button" @click=${()=>{this._pasting=this._problem.mode,this._problem=null}}>Paste text instead</button>
          <button class="pv-btn pv-btn-primary" type="button" @click=${()=>this._choose(this._problem.mode)}>Choose another file</button>
        </div>
      </div>
    `}_choose(e){this._mode=e;const t=this.renderRoot.querySelector('input[type="file"]');t&&(t.value="",t.click())}async _read(e,t,s){const i=this._chores;if(i){this._reading=!0,this._problem=null;try{const a=await i.api.importPreview(e);if(a.problem)return void(this._problem={name:t,problem:a.problem,mode:s});this._pasting=null,this._text="",this.dispatchEvent(new CustomEvent(Ks,{detail:{tag:"pv-import-review",title:"Review the import",back:"Import and export",props:{text:e,name:t,preview:a.preview}},bubbles:!0,composed:!0}))}catch(e){this._problem={name:t,mode:s,problem:{code:"error",message:$a(e)??"Couldn't read it. Check the connection and try again.",problems:[]}}}finally{this._reading=!1}}}}dd.styles=[lt,ct,pt,Br,o`
      :host {
        max-width: 640px;
      }

      .actions {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        padding: 12px 14px;
      }

      .actions button {
        min-height: 48px;
      }

      textarea {
        width: 100%;
        min-height: 160px;
        box-sizing: border-box;
        font-family: ui-monospace, monospace;
        font-size: 0.8125rem;
      }

      .paste {
        display: grid;
        gap: 8px;
        padding: 12px 14px;
      }

      .error {
        margin: 12px 0 0;
        padding: 16px;
        border-radius: 14px;
        background: var(--pv-card-bg, #FFFFFF);
        box-shadow: inset 0 0 0 1px var(--pv-border-subtle, #E5E7EB);
      }

      .error h3 {
        display: flex;
        align-items: center;
        gap: 10px;
        margin: 0 0 6px;
        font-size: 1.125rem;
      }

      .error .mark {
        width: 28px;
        height: 28px;
        display: grid;
        place-items: center;
        border-radius: 50%;
        background: color-mix(in srgb, var(--pv-danger, #DC2626) 14%, transparent);
        color: var(--pv-danger, #DC2626);
        font-weight: 800;
      }

      .error ul {
        margin: 6px 0 0;
        padding-left: 18px;
      }

      input[type='file'] {
        display: none;
      }

      .look {
        margin: 0 0 8px;
      }

      .look p {
        margin: 0;
        line-height: 1.45;
      }

      .look .actions {
        padding: 12px 0 0;
      }
    `],e([ue({attribute:!1})],dd.prototype,"hass",void 0),e([ue({attribute:!1})],dd.prototype,"data",void 0),e([ue({attribute:!1})],dd.prototype,"household",void 0),e([ue({type:String})],dd.prototype,"layout",void 0),e([ue({attribute:!1})],dd.prototype,"services",void 0),e([ue({type:Number})],dd.prototype,"revision",void 0),e([me()],dd.prototype,"_pasting",void 0),e([me()],dd.prototype,"_text",void 0),e([me()],dd.prototype,"_reading",void 0),e([me()],dd.prototype,"_problem",void 0),e([me()],dd.prototype,"_exported",void 0),e([me()],dd.prototype,"_copied",void 0),e([me()],dd.prototype,"_confirming",void 0),ge("pv-import-export-page",dd);const cd="planavista.household/v1";function hd(e){return e.fills_in?"Nothing is deleted. The file fills in what couldn't be read, and stars and history that could still be read stay.":e.file.format===cd?"Nothing is deleted. The file's chores, rewards, and rules update the ones here, and stars and history stay.":"Nothing is deleted. Stars, rewards, and history stay as they are."}function pd(e){return e.length<=2?e.join(" and "):`${e.slice(0,-1).join(", ")}, and ${e[e.length-1]}`}function ud(e){return e.file.exported?`${e.file.label} · exported ${br(e.file.exported)}`:e.file.label}function md(e,t){const s=t.people[e.ref];return s&&"match"in s?s.match??null:e.match}function vd(e,t){return t.people[e.ref]?.age_group??e.age_group}function gd(e,t){return"set_time"!==e.kind&&(t.on_board[e.ref]??e.on_board)}const bd={kitchen:"🍽️",cleaning:"🧽",home:"🌿",personal:"🙂",school:"📚",work:"💼",family:"👪",other:"📋"};function yd(e){const t=[...e.people_added];e.activities_added&&t.push(`${e.activities_added} ${1===e.activities_added?"activity":"activities"}`),e.rewards_added&&t.push(`${e.rewards_added} ${1===e.rewards_added?"reward":"rewards"}`);const s=[];return t.length&&s.push(`${pd(t)} added`),e.activities_updated&&s.push(`${e.activities_updated} updated`),s.length?`Imported: ${s.join(", ")}.`:"Imported. Nothing needed changing."}function fd(e){return _l.map(t=>({category:t.id,label:t.label,items:e.filter(e=>(e.category||"other")===t.id)})).concat([{category:"",label:"Other",items:e.filter(e=>!_l.some(t=>t.id===e.category))}]).filter(e=>e.items.length>0)}function _d(e,t){const s=e.activities.filter(e=>gd(e,t)),i=e.activities.filter(e=>"set_time"!==e.kind&&!gd(e,t)),a=e.activities.filter(e=>"set_time"===e.kind);return{board:s,planOnly:i,setTimes:a}}function wd(e,t){return e.people.filter(e=>!md(e,t)&&!vd(e,t))}function xd(e,t){const s=e.people.filter(e=>!md(e,t)).map(e=>e.name),i=e.activities.filter(e=>!e.match).length,a=e.activities.filter(e=>e.match).length,n=[...s];i&&n.push(`${i} ${1===i?"activity":"activities"}`);const o=e.rewards.filter(e=>!e.match).length;o&&n.push(`${o} ${1===o?"reward":"rewards"}`);const r=[];return n.length&&r.push(`Adds ${pd(n)}`),a&&r.push(`${r.length?"and updates":"Updates"} ${a}`),r.length?`${r.join(", ")}.`:"Nothing new to add."}class $d extends de{constructor(){super(...arguments),this.members=[],this.choices={people:{},on_board:{},assignees:{}},this.layout="landscape",this.timeFormat="12h",this._open=new Set,this._assigning=null,this._showUpdates=!1}_set(e){this.choices=e,this.dispatchEvent(new CustomEvent("pv-import-choices",{detail:e,bubbles:!0,composed:!0}))}_pickPerson(e,t){const s=""===t?{match:null}:{match:t};this._set({...this.choices,people:{...this.choices.people,[e]:{...this.choices.people[e],...s}}})}_pickAge(e,t){this._set({...this.choices,people:{...this.choices.people,[e]:{...this.choices.people[e],age_group:t}}})}_switch(e){this._set({...this.choices,on_board:{...this.choices.on_board,[e.ref]:!gd(e,this.choices)}})}_toggleOpen(e){const t=new Set(this._open);t.has(e)?t.delete(e):t.add(e),this._open=t}render(){const e=this.preview;if(!e)return Y;const t=_d(e,this.choices),s=e.file.format===cd;return U`
      ${e.fills_in?U`<p class="warning" role="note">Chores need a look, so this restore fills in the chores files that couldn't be read. What could still be read, such as stars and history, stays.</p>`:Y}
      <div class="tiles">
        ${function(e,t){const s=_d(e,t);return[{value:e.people.length,label:1===e.people.length?"person":"people"},{value:s.board.length,label:"on the board"},{value:s.planOnly.length,label:"plan only"},{value:s.setTimes.length,label:1===s.setTimes.length?"set time":"set times"}]}(e,this.choices).map(e=>U`<div class="tile"><strong>${e.value}</strong><span>${e.label}</span></div>`)}
      </div>
      <div class="columns">
        <div>
          ${this._renderPeople()}
          ${this._renderLook()}
          ${s&&(e.rewards.length||e.settings)?U`
            <h2 class="section-label">Rewards and rules</h2>
            <div class="group">
              ${e.rewards.length?U`<div class="row"><span class="row-text">${e.rewards.length} ${1===e.rewards.length?"reward":"rewards"}<span class="row-sub">${e.rewards.map(e=>e.name).slice(0,3).join(", ")}${e.rewards.length>3?", and more":""}</span></span></div>`:Y}
              ${e.settings?U`<div class="row"><span class="row-text">Rules<span class="row-sub">Come from the file.</span></span></div>`:Y}
            </div>
          `:Y}
        </div>
        <div>
          ${this._renderBoard(t.board)}
          ${this._renderPlanOnly(t.planOnly)}
          ${this._renderSetTimes(t.setTimes)}
        </div>
      </div>
    `}_renderPeople(){const e=this.preview,t=new Set(e.people.map(e=>md(e,this.choices)).filter(Boolean));return U`
      <h2 class="section-label">People · ${e.people.length}</h2>
      <div class="group">
        ${e.people.map(e=>{const s=md(e,this.choices),i=!s,a=vd(e,this.choices);return U`
            <div class="row">
              <div class="stack">
                <div style="display: flex; align-items: center; gap: 12px">
                  <span class="dot" style="background:${e.color??"#8E949C"}" aria-hidden="true">${e.name[0]?.toUpperCase()}</span>
                  <span class="row-text">
                    <span class="row-title">${e.name}</span>
                    <span class="row-sub">${function(e,t,s,i="12h"){const a=md(e,t),n=[a?`Matches ${s.find(e=>e.id===a)?.name??e.match_name??a}`:"New person"];return!a&&e.bedtime&&n.push(`bedtime ${Tr(e.bedtime.weeknight,i)}`),e.sleep_hours&&n.push(`sleeps ${td(e.sleep_hours)}`),n.join(" · ")}(e,this.choices,this.members,this.timeFormat)}</span>
                  </span>
                  ${i?U`<span class="pv-tag">New</span>`:Y}
                  <select class="pv-input pv-select" aria-label="Who ${e.name} is" .value=${s??""}
                    @change=${t=>this._pickPerson(e.ref,t.target.value)}>
                    <option value="" ?selected=${!s}>New person</option>
                    ${this.members.filter(e=>e.id===s||!t.has(e.id)).map(e=>U`
                      <option value=${e.id} ?selected=${e.id===s}>${e.name}</option>
                    `)}
                  </select>
                </div>
                ${i?U`
                  <div class="chips" role="group" aria-label="${e.name}'s age group">
                    ${Xt.map(t=>U`
                      <button class="chip chip--plain" type="button" aria-pressed=${a===t.id?"true":"false"}
                        @click=${()=>this._pickAge(e.ref,t.id)}>${t.label}</button>
                    `)}
                  </div>
                `:Y}
              </div>
            </div>
          `})}
      </div>
      <p class="hint">${s=this.preview.file.format,`Matched by name; pick someone else to change it. Bedtimes and sleep come from ${s===cd?"the file":"the plan"}.`}</p>
    `;var s}_renderLook(){const e=this.preview.needs_a_look.map(e=>{if("unassigned"===e.kind)return{kind:e.kind,ref:e.ref,title:`No one is assigned to ${e.name}.`,detail:"It waits in Chores, off the board, until someone is."};if("shares"===e.kind)return{kind:e.kind,ref:e.ref,title:`The shares of ${e.name} add up to ${Cr(60*e.hours)}, not ${Cr(60*e.planned)}.`,detail:`It comes in with ${Cr(60*e.hours)} a ${e.per}, what everyone's share adds up to.`};const t=e.names.length;return{kind:e.kind,title:`${t} ${1===t?"is":"are"} already in your chores.`,detail:`${t>3?`${e.names.slice(0,3).join(", ")}, and ${t-3} more`:pd(e.names)} get the plan's times.`}});if(!e.length)return Y;const t=this.preview.needs_a_look.find(e=>"updates"===e.kind);return U`
      <h2 class="section-label">Needs a look · ${e.length}</h2>
      <div class="group">
        ${e.map(e=>U`
          <div class="row">
            <div class="stack">
              <div style="display: flex; align-items: flex-start; gap: 12px">
                <span class="mark ${"updates"===e.kind?"":"mark--attention"}" aria-hidden="true">${"updates"===e.kind?"i":"!"}</span>
                <span class="row-text"><span>${e.title}</span><span class="row-sub">${e.detail}</span></span>
                ${"unassigned"===e.kind?U`
                  <button class="link" type="button" @click=${()=>{this._assigning=this._assigning===e.ref?null:e.ref??null}}>Assign</button>
                `:"updates"===e.kind?U`
                  <button class="link" type="button" @click=${()=>{this._showUpdates=!this._showUpdates}}>${this._showUpdates?"Hide them":"See them"}</button>
                `:Y}
              </div>
              ${"unassigned"===e.kind&&this._assigning===e.ref?this._renderAssign(e.ref):Y}
              ${"updates"===e.kind&&this._showUpdates&&"updates"===t?.kind?U`
                <span class="row-sub">${t.names.join(", ")}</span>
              `:Y}
            </div>
          </div>
        `)}
      </div>
    `}_renderAssign(e){const t=this.choices.assignees[e]??[];return U`
      <div class="chips" role="group" aria-label="Who does it">
        ${this.preview.people.map(s=>U`
          <button class="chip chip--plain" type="button" aria-pressed=${t.includes(s.ref)?"true":"false"}
            @click=${()=>{const i=t.includes(s.ref)?t.filter(e=>e!==s.ref):[...t,s.ref];this._set({...this.choices,assignees:{...this.choices.assignees,[e]:i}})}}>${s.name}</button>
        `)}
      </div>
    `}_renderActivity(e,t=!0){const s=gd(e,this.choices);return U`
      <div class="row toggle-row nested">
        <span class="picture" aria-hidden="true">${e.icon||_n(e.name)}</span>
        <span class="row-text">
          <span class="row-title">${e.name}</span>
          <span class="row-sub">${function(e,t,s,i="12h"){const a=(s.assignees[e.ref]??e.assignees).map(e=>t.find(t=>t.ref===e)?.name??e),n=[a.length?a.join(", "):"No one yet"];return e.set_time?n.push(`at ${Tr(e.set_time,i)}`):e.minimum&&n.push(`${Cr(60*e.minimum.hours)} a ${e.minimum.per}`),e.match&&n.push("updates yours"),n.join(" · ")}(e,this.preview.people,this.choices,this.timeFormat)}</span>
        </span>
        ${t?U`
          <div class="pv-toggle ${s?"active":""}" role="switch" tabindex="0" aria-checked=${s?"true":"false"}
            aria-label="${e.name} on the board" @click=${()=>this._switch(e)}
            @keydown=${t=>{"Enter"!==t.key&&" "!==t.key||(t.preventDefault(),this._switch(e))}}></div>
        `:Y}
      </div>
    `}_renderGroups(e,t){return fd(e).map(e=>{const s=`${t}:${e.category}`,i=this._open.has(s);return U`
        <button class="row" type="button" aria-expanded=${i?"true":"false"} @click=${()=>this._toggleOpen(s)}>
          <span class="picture" aria-hidden="true">${bd[e.category]??"📋"}</span>
          <span class="row-text"><span class="row-title">${e.label}</span></span>
          <span class="row-value">${e.items.length}</span>
          <span class="chevron" aria-hidden="true">${i?"⌄":"›"}</span>
        </button>
        ${i?e.items.map(e=>this._renderActivity(e)):Y}
      `})}_renderBoard(e){return U`
      <h2 class="section-label">On the board · ${e.length}</h2>
      ${e.length?U`<div class="group">${this._renderGroups(e,"board")}</div>`:U`<p class="hint">Nothing goes on the board yet. Turn on an activity under Plan only.</p>`}
    `}_renderPlanOnly(e){if(!e.length)return Y;const t=fd(e).map(e=>`${e.label} ${e.items.length}`).join(" · ");return U`
      <h2 class="section-label">Plan only · ${e.length}</h2>
      <div class="group">
        <button class="row" type="button" aria-expanded=${this._open.has("plan")?"true":"false"} @click=${()=>this._toggleOpen("plan")}>
          <span class="row-text"><span>${t}</span></span>
          <span class="chevron" aria-hidden="true">${this._open.has("plan")?"⌄":"›"}</span>
        </button>
        ${this._open.has("plan")?this._renderGroups(e,"plan"):Y}
      </div>
      <p class="hint">Kept in the plan, not checked off. Turn one on to add it.</p>
    `}_renderSetTimes(e){if(!e.length)return Y;const t=e.map(e=>e.name),s=t.length>2?`${t.slice(0,2).join(", ")}, and ${t.length-2} more`:t.join(" and ");return U`
      <h2 class="section-label">Set times · ${e.length}</h2>
      <div class="group">
        <button class="row" type="button" aria-expanded=${this._open.has("set")?"true":"false"} @click=${()=>this._toggleOpen("set")}>
          <span class="row-text"><span>${s}</span></span>
          <span class="chevron" aria-hidden="true">${this._open.has("set")?"⌄":"›"}</span>
        </button>
        ${this._open.has("set")?e.map(e=>this._renderActivity(e,!1)):Y}
      </div>
      <p class="hint">They belong on a calendar, so they never become chores.</p>
    `}}$d.styles=[lt,ct,pt,Br,o`
      .columns {
        display: grid;
        gap: 0 20px;
      }

      :host([layout='landscape']) .columns {
        grid-template-columns: repeat(2, minmax(0, 1fr));
        align-items: start;
      }

      .tiles {
        display: grid;
        grid-template-columns: repeat(4, minmax(0, 1fr));
        gap: 8px;
        margin-bottom: 4px;
      }

      :host([layout='landscape']) .tiles {
        display: none;
      }

      .tile {
        padding: 10px 12px;
        border-radius: 12px;
        background: var(--pv-card-bg, #FFFFFF);
        box-shadow: inset 0 0 0 1px var(--pv-border-subtle, #E5E7EB);
      }

      .tile strong {
        display: block;
        font-size: 1.25rem;
      }

      .tile span {
        font-size: 0.75rem;
        color: var(--pv-text-secondary, #6B7280);
      }

      .dot {
        flex-shrink: 0;
        width: 36px;
        height: 36px;
        display: grid;
        place-items: center;
        border-radius: 50%;
        color: #FFFFFF;
        font-weight: 700;
        text-shadow: 0 1px 2px rgba(0, 0, 0, 0.35);
      }

      .stack {
        display: grid;
        gap: 8px;
        width: 100%;
      }

      .row .pv-select {
        flex: 0 0 150px;
        max-width: 150px;
        margin-left: auto;
      }

      .mark {
        flex-shrink: 0;
        width: 24px;
        height: 24px;
        display: grid;
        place-items: center;
        border-radius: 50%;
        font-weight: 800;
        background: color-mix(in srgb, var(--pv-accent, #6366F1) 14%, transparent);
        color: var(--pv-accent-ink, var(--pv-accent, #6366F1));
      }

      .mark--attention {
        background: color-mix(in srgb, #F59E0B 22%, transparent);
        color: var(--pv-text, #1A1B1E);
      }

      .link {
        border: none;
        background: transparent;
        color: var(--pv-accent-ink, var(--pv-accent, #6366F1));
        font: inherit;
        font-weight: 600;
        cursor: pointer;
        min-height: 48px;
        white-space: nowrap;
      }

      .nested {
        padding-left: 18px;
      }

      .warning {
        margin: 0 0 12px;
        padding: 12px 14px;
        border-radius: 12px;
        background: color-mix(in srgb, #F59E0B 16%, transparent);
      }
    `],e([ue({attribute:!1})],$d.prototype,"hass",void 0),e([ue({attribute:!1})],$d.prototype,"preview",void 0),e([ue({attribute:!1})],$d.prototype,"members",void 0),e([ue({attribute:!1})],$d.prototype,"choices",void 0),e([ue({type:String,reflect:!0})],$d.prototype,"layout",void 0),e([ue({type:String})],$d.prototype,"timeFormat",void 0),e([me()],$d.prototype,"_open",void 0),e([me()],$d.prototype,"_assigning",void 0),e([me()],$d.prototype,"_showUpdates",void 0),ge("pv-import-preview",$d);class kd extends de{constructor(){super(...arguments),this.household=null,this.layout="landscape",this.pageProps={},this.services={},this.revision=0,this._choices={people:{},on_board:{},assignees:{}},this._problems=[],this._importing=!1,this._pop=()=>{this.dispatchEvent(new CustomEvent(Gs,{bubbles:!0,composed:!0}))},this._import=async()=>{const e=this.services?.chores;if(e){this._importing=!0,this._problems=[];try{const t=await e.api.importApply(String(this.pageProps.text??""),this._choices);if(t.problem)return void(this._problems=t.problem.problems.length?t.problem.problems:[t.problem.message]);t.summary&&this.dispatchEvent(new CustomEvent(Js,{detail:{message:yd(t.summary)},bubbles:!0,composed:!0})),this._pop()}catch(e){this._problems=[$a(e)??"Couldn't import. Check the connection and try again."]}finally{this._importing=!1}}}}get _preview(){return this.pageProps.preview}render(){const e=this._preview;if(!e)return Y;const t=String(this.pageProps.name??"Pasted text"),s=wd(e,this._choices);return U`
      <div class="file">
        <span class="badge" aria-hidden="true">JSON</span>
        <span class="row-text"><span class="row-title">${t}</span><span class="row-sub">${ud(e)}</span></span>
        <button class="pv-btn pv-btn-secondary" type="button" @click=${this._pop}>Choose another</button>
      </div>
      ${this._problems.length?U`
        <div class="problems" role="alert">
          <strong>This file has problems, so nothing was imported.</strong>
          <ul>${this._problems.map(e=>U`<li>${e}</li>`)}</ul>
        </div>
      `:Y}
      <pv-import-preview
        .hass=${this.hass}
        .preview=${e}
        .members=${ss(this.household?.members??[])}
        .choices=${this._choices}
        .layout=${this.layout}
        .timeFormat=${this.data?.display?.time_format??"12h"}
        @pv-import-choices=${e=>{this._choices=e.detail}}
      ></pv-import-preview>
      <div class="bar">
        <span class="text">
          ${s.length?`Pick an age group for ${s.map(e=>e.name).join(" and ")} to import.`:xd(e,this._choices)}
          <span class="sub">${hd(e)}</span>
        </span>
        <button class="pv-btn pv-btn-secondary" type="button" @click=${this._pop}>Cancel</button>
        <button class="pv-btn pv-btn-primary" type="button" ?disabled=${this._importing||s.length>0}
          @click=${this._import}>Import</button>
      </div>
    `}}kd.styles=[lt,ct,Br,o`
      :host {
        display: block;
      }

      .file {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-bottom: 8px;
        padding: 12px 14px;
        border-radius: 14px;
        background: var(--pv-card-bg, #FFFFFF);
        box-shadow: inset 0 0 0 1px var(--pv-border-subtle, #E5E7EB);
      }

      .file .badge {
        flex-shrink: 0;
        padding: 8px 6px;
        border-radius: 8px;
        background: color-mix(in srgb, var(--pv-text, #1A1B1E) 6%, transparent);
        font-size: 0.6875rem;
        font-weight: 700;
      }

      .bar {
        position: sticky;
        /* Flush with the bottom: a sticky box keeps clear of the Settings page's 40 px bottom padding otherwise. */
        bottom: -40px;
        display: flex;
        align-items: center;
        flex-wrap: wrap;
        gap: 12px;
        margin: 20px -20px -40px;
        padding: 14px 20px calc(14px + env(safe-area-inset-bottom, 0px));
        background: var(--pv-card-bg, #FFFFFF);
        border-top: 1px solid var(--pv-border-subtle, #E5E7EB);
        box-shadow: 0 -6px 18px rgba(0, 0, 0, 0.06);
      }

      .bar .text {
        flex: 1;
        min-width: 200px;
      }

      .bar .sub {
        display: block;
        font-size: 0.8125rem;
        color: var(--pv-text-secondary, #6B7280);
      }

      .bar button {
        min-height: 48px;
        min-width: 96px;
      }

      .problems {
        margin: 0 0 16px;
        padding: 12px 16px;
        border-radius: 12px;
        background: color-mix(in srgb, var(--pv-danger, #DC2626) 10%, transparent);
      }

      .problems ul {
        margin: 6px 0 0;
        padding-left: 18px;
      }
    `],e([ue({attribute:!1})],kd.prototype,"hass",void 0),e([ue({attribute:!1})],kd.prototype,"data",void 0),e([ue({attribute:!1})],kd.prototype,"household",void 0),e([ue({type:String,reflect:!0})],kd.prototype,"layout",void 0),e([ue({attribute:!1})],kd.prototype,"pageProps",void 0),e([ue({attribute:!1})],kd.prototype,"services",void 0),e([ue({type:Number})],kd.prototype,"revision",void 0),e([me()],kd.prototype,"_choices",void 0),e([me()],kd.prototype,"_problems",void 0),e([me()],kd.prototype,"_importing",void 0),ge("pv-import-review",kd);const Ed=[{id:"plan",icon:"📋",title:"Start from our household plan",text:"Import a Household Hours plan. You see everything before it's saved."},{id:"common",icon:"✨",title:"Start with some common chores",text:"Pick from a short list. Each comes with a time and who it suits."},{id:"empty",icon:"✏️",title:"Start empty",text:"Add chores yourself when you're ready."}];class Fd extends de{constructor(){super(...arguments),this.household=null,this.services={},this._choice="common",this._message="",this._read=!1}willUpdate(){if(!this._read&&this.household){const e=this.household.setup.start;"plan"!==e&&"common"!==e&&"empty"!==e||(this._choice=e),this._read=!0}}get _chores(){return this.services?.chores}get _on(){return!0===this.household?.modules?.chores?.enabled}async commit(){this._message="";try{return this._on||await(this._chores?.api.enable(!0)),await this.api.saveSetup({start:this._choice}),this.setupPatch={setup:{start:this._choice},modules:{chores:{enabled:!0}}},!0}catch(e){return this._message=$a(e)??"Couldn't turn chores on. Check the connection and try again.",!1}}async secondary(){this._message="";try{return this._on&&await(this._chores?.api.enable(!1)),await this.api.saveSetup({start:"calendar"}),this.setupPatch={setup:{start:"calendar"},modules:{chores:{enabled:!1}}},!0}catch(e){return this._message=$a(e)??"Couldn't save. Check the connection and try again.",!1}}render(){return U`
      <div class="choices" role="radiogroup" aria-label="How chores start">
        ${Ed.map(e=>U`
          <button class="choice" type="button" role="radio" aria-checked=${this._choice===e.id?"true":"false"}
            @click=${()=>{this._choice=e.id}}>
            <span class="icon" aria-hidden="true">${e.icon}</span>
            <span class="text"><span class="title">${e.title}</span><span class="sub">${e.text}</span></span>
            <span class="radio" aria-hidden="true">${this._choice===e.id?"✓":""}</span>
          </button>
        `)}
      </div>
      ${this._message?U`<p class="message" role="alert">${this._message}</p>`:Y}
    `}}Fd.styles=o`
    :host {
      display: block;
    }

    .choices {
      display: grid;
      gap: 10px;
    }

    .choice {
      display: flex;
      align-items: center;
      gap: 14px;
      width: 100%;
      padding: 14px 16px;
      border-radius: 14px;
      border: 1.5px solid var(--pv-border-subtle, #E5E7EB);
      background: var(--pv-card-bg, #FFFFFF);
      color: inherit;
      font: inherit;
      text-align: left;
      cursor: pointer;
    }

    .choice[aria-checked='true'] {
      border-color: var(--pv-accent, #6366F1);
      box-shadow: 0 0 0 2px color-mix(in srgb, var(--pv-accent, #6366F1) 25%, transparent);
    }

    .icon {
      font-size: 1.5rem;
    }

    .text {
      flex: 1;
    }

    .title {
      display: block;
      font-weight: 700;
    }

    .sub {
      font-size: 0.875rem;
      color: var(--pv-text-secondary, #6B7280);
    }

    .radio {
      width: 22px;
      height: 22px;
      border-radius: 50%;
      border: 2px solid var(--pv-border-strong, #9CA3AF);
      display: grid;
      place-items: center;
      color: var(--pv-on-accent, #FFFFFF);
      font-size: 0.75rem;
    }

    .choice[aria-checked='true'] .radio {
      background: var(--pv-accent, #6366F1);
      border-color: var(--pv-accent, #6366F1);
    }

    .message {
      margin: 14px 0 0;
      color: var(--pv-danger, #DC2626);
    }
  `,e([ue({attribute:!1})],Fd.prototype,"household",void 0),e([ue({attribute:!1})],Fd.prototype,"api",void 0),e([ue({attribute:!1})],Fd.prototype,"services",void 0),e([me()],Fd.prototype,"_choice",void 0),e([me()],Fd.prototype,"_message",void 0),ge("pv-setup-chores-choice",Fd);const Cd=[{id:"make_your_bed",name:"Make your bed",icon:"🛏️",category:"personal",rhythm:"daily",days:[],minutes:5,band:"morning",suits:"young_child",picked:!0},{id:"set_the_table",name:"Set the table",icon:"🍴",category:"kitchen",rhythm:"daily",days:[],minutes:10,band:"evening",suits:"young_child",picked:!0},{id:"tidy_toys",name:"Tidy toys",icon:"🧸",category:"cleaning",rhythm:"daily",days:[],minutes:15,band:"evening",suits:"young_child",picked:!0},{id:"unload_the_dishwasher",name:"Unload the dishwasher",icon:"🍽️",category:"kitchen",rhythm:"daily",days:[],minutes:10,band:"morning",suits:"kid",picked:!0},{id:"take_out_the_trash",name:"Take out the trash",icon:"🗑️",category:"home",rhythm:"weekly",days:["tue","fri"],minutes:10,band:"evening",suits:"kid",picked:!0},{id:"feed_the_pet",name:"Feed the pet",icon:"🐾",category:"home",rhythm:"daily",days:[],minutes:5,band:"morning",suits:"kid",picked:!1},{id:"laundry",name:"Laundry",icon:"🧺",category:"cleaning",rhythm:"weekly",days:[],minutes:120,band:null,suits:"adult",picked:!0},{id:"kitchen_cleanup",name:"Kitchen cleanup",icon:"🧽",category:"kitchen",rhythm:"daily",days:[],minutes:30,band:"evening",suits:"adult",picked:!0},{id:"vacuum",name:"Vacuum",icon:"🧹",category:"cleaning",rhythm:"weekly",days:[],minutes:60,band:null,suits:"adult",picked:!1},{id:"clean_the_bathroom",name:"Clean the bathroom",icon:"🛁",category:"cleaning",rhythm:"weekly",days:[],minutes:60,band:null,suits:"teen",picked:!0},{id:"yard_work",name:"Yard work",icon:"🌿",category:"home",rhythm:"weekly",days:[],minutes:60,band:null,suits:"teen",picked:!1},{id:"groceries",name:"Groceries",icon:"🛒",category:"home",rhythm:"weekly",days:[],minutes:90,band:null,suits:"adult",picked:!1}];function Sd(e,t){const s=e.name.toLowerCase();return t.some(e=>!e.finished_at&&e.name.trim().toLowerCase()===s)}function Dd(e){return e.filter(e=>e.on&&e.member&&!e.added)}function Ad(e){return Cd.find(t=>t.id===e)}function Md(e){const t=Ad(e.id),s="weekly"===e.rhythm&&e.days.length?e.days.length:1;return{name:t.name,icon:t.icon,category:t.category,schedule:"plan",assignees:e.member?[e.member]:[],on_board:!0,needs_ok:!1,stars:null,minimum:{hours:e.minutes*s/60,per:"daily"===e.rhythm?"day":"week"},split:"each",times:1,days:"weekly"===e.rhythm?e.days:[],time_of_day:t.band?[t.band]:[]}}class Td extends de{constructor(){super(...arguments),this.household=null,this.services={},this.revision=0,this.picks=[]}render(){const e=this.services?.chores?.board()??null,t=function(e,t,s=[]){return ss(e).map(e=>{const i=t?.members[e.id]?.items??[],a=i.filter(e=>"week"!==e.section).map(e=>e.name),n=i.filter(e=>"week"===e.section).map(e=>e.name);for(const t of s.filter(t=>t.member===e.id)){const e=t.week?n:a;e.includes(t.name)||e.push(t.name)}const o=t?.members[e.id]?.today.done??0,r=a.length?`${o} of ${a.length} today`:n.length?`${n.length} this week`:"Nothing yet";return{member:e,today:a,week:n,summary:r}})}(this.household?.members??[],e,this.picks);return t.length?U`
      <div class="columns">
        ${t.map(e=>U`
          <section class="column" aria-label=${e.member.name}>
            <div class="who">
              <pv-member-avatar .member=${e.member} .hass=${this.hass} size="28"></pv-member-avatar>
              <span><span class="name">${e.member.name}</span><br /><span class="summary">${e.summary}</span></span>
            </div>
            ${e.today.length?U`<ul>${e.today.map(e=>U`<li>${e}</li>`)}</ul>`:Y}
            ${e.week.length?U`
              <div class="week">This week</div>
              <ul>${e.week.map(e=>U`<li>${e}</li>`)}</ul>
            `:Y}
          </section>
        `)}
      </div>
    `:Y}}Td.styles=o`
    :host {
      display: block;
    }

    .columns {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
      gap: 10px;
    }

    .column {
      padding: 10px 12px;
      border-radius: 14px;
      background: var(--pv-card-bg, #FFFFFF);
      box-shadow: inset 0 0 0 1px var(--pv-border-subtle, #E5E7EB);
    }

    .who {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 6px;
    }

    .name {
      font-weight: 700;
    }

    .summary {
      font-size: 0.75rem;
      color: var(--pv-text-secondary, #6B7280);
    }

    ul {
      list-style: none;
      margin: 0;
      padding: 0;
      display: grid;
      gap: 4px;
    }

    li {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 0.8125rem;
    }

    li::before {
      content: '';
      flex-shrink: 0;
      width: 10px;
      height: 10px;
      border-radius: 50%;
      border: 2px solid var(--pv-border-strong, #9CA3AF);
    }

    .week {
      margin: 8px 0 4px;
      font-size: 0.8125rem;
      font-weight: 750;
      color: var(--pv-text-secondary, #6B7280);
    }
  `,e([ue({attribute:!1})],Td.prototype,"hass",void 0),e([ue({attribute:!1})],Td.prototype,"household",void 0),e([ue({attribute:!1})],Td.prototype,"services",void 0),e([ue({type:Number})],Td.prototype,"revision",void 0),e([ue({attribute:!1})],Td.prototype,"picks",void 0),ge("pv-setup-board-preview",Td);const zd=[5,10,15,30,60,90,120];class Pd extends de{constructor(){super(...arguments),this.household=null,this.services={},this.revision=0,this.layout="landscape",this._picks=[],this._editing=null,this._message="",this._built=!1}get _chores(){return this.services?.chores}willUpdate(){const e=this._chores?.board()?.chores??[];if(!this._built&&this.household)this._picks=function(e,t=[]){const s=ss(e),i=new Map;return Cd.map(e=>{const a=s.filter(t=>function(e,t){return"young_child"===t?"young_child"===e.age_group:"kid"===t?"older_child"===e.age_group||"teen"===e.age_group:"teen"===t?"teen"===e.age_group||"older_child"===e.age_group:"adult"===e.age_group}(t,e.suits)),n=i.get(e.suits)??0;i.set(e.suits,n+1);const o=a.length?a[n%a.length].id:null,r=Sd(e,t);return{id:e.id,member:o,rhythm:e.rhythm,days:e.days,minutes:e.minutes,on:!r&&e.picked&&null!==o,added:r}})}(this.household.members,e),this._built=!0;else if(this._built){const t=function(e,t){return e.map(e=>!e.added&&Sd(Ad(e.id),t)?{...e,added:!0,on:!1}:e)}(this._picks,e);t.some((e,t)=>e!==this._picks[t])&&(this._picks=t)}}get primaryLabel(){return function(e){const t=Dd(e).length;return 0===t?e.some(e=>e.added)?"Continue":"Add chores":`Add ${t} ${1===t?"chore":"chores"}`}(this._picks)}get ready(){return Dd(this._picks).length>0||this._picks.some(e=>e.added)}_changed(){this.dispatchEvent(new CustomEvent(Ra,{bubbles:!0,composed:!0}))}async commit(){const e=this._chores;if(!e)return!1;this._message="";try{for(const t of Dd(this._picks))await e.api.saveActivity(Md(t)),this._picks=this._picks.map(e=>e.id===t.id?{...e,added:!0,on:!1}:e);return!0}catch(e){return this._message=$a(e)??"Couldn't add the chores. Check the connection and try again.",!1}}_toggle(e){e.added||(e.member?e.on&&this._editing!==e.id?this._editing=e.id:(this._set(e.id,{on:!e.on}),this._editing=null):this._editing=e.id)}_set(e,t){this._picks=this._picks.map(s=>s.id===e?{...s,...t}:s),this._changed()}render(){const e=ss(this.household?.members??[]),t=Dd(this._picks).map(e=>({member:e.member,name:Ad(e.id).name,week:"weekly"===e.rhythm&&!e.days.length}));return U`
      <div class="layout">
        <div>
          <div class="tiles">
            ${this._picks.map(t=>{const s=Ad(t.id),i=e.find(e=>e.id===t.member);return U`
                <button class="tile ${t.added?"added":""}" type="button" aria-pressed=${t.on?"true":"false"}
                  ?disabled=${t.added} @click=${()=>this._toggle(t)}>
                  ${t.on?U`<span class="check" aria-hidden="true">✓</span>`:Y}
                  <span class="emoji" aria-hidden="true">${s.icon}</span>
                  <span class="name">${s.name}</span>
                  <span class="line">${t.added?"On the board":function(e){const t={mon:"Mon",tue:"Tue",wed:"Wed",thu:"Thu",fri:"Fri",sat:"Sat",sun:"Sun"};return`${"daily"===e.rhythm?"Daily":e.days.length?e.days.map(e=>t[e]).join(", "):"Weekly"} · ${Cr(e.minutes)}`}(t)}</span>
                  ${t.added?Y:i?U`<pv-member-avatar .member=${i} .hass=${this.hass} size="22"></pv-member-avatar>`:U`<span class="line">Pick someone</span>`}
                </button>
                ${this._editing===t.id?this._renderEditor(t):Y}
              `})}
          </div>
          <p class="hint">Suggested by age, so young children get quick, simple ones.</p>
          ${this._message?U`<p class="message" role="alert">${this._message}</p>`:Y}
        </div>
        ${"landscape"===this.layout?U`
          <aside aria-label="Your board">
            <p class="preview-head">Your board fills in as you pick</p>
            <pv-setup-board-preview .hass=${this.hass} .household=${this.household} .services=${this.services}
              .revision=${this.revision} .picks=${t}></pv-setup-board-preview>
          </aside>
        `:Y}
      </div>
    `}_renderEditor(e){const t=ss(this.household?.members??[]),s=Ad(e.id);return U`
      <div class="editor" role="group" aria-label="Change ${s.name}">
        <span>Who</span>
        <div class="chips">
          ${t.map(t=>U`
            <button class="chip" type="button" aria-pressed=${e.member===t.id?"true":"false"}
              @click=${()=>this._set(e.id,{member:t.id,on:!0})}>${t.name}</button>
          `)}
        </div>
        <span>How often</span>
        <div class="chips">
          <button class="chip" type="button" aria-pressed=${"daily"===e.rhythm?"true":"false"}
            @click=${()=>this._set(e.id,{rhythm:"daily",days:[]})}>Every day</button>
          <button class="chip" type="button" aria-pressed=${"weekly"===e.rhythm?"true":"false"}
            @click=${()=>this._set(e.id,{rhythm:"weekly",days:"weekly"===s.rhythm?s.days:[]})}>Every week</button>
        </div>
        <span>About how long${"weekly"===e.rhythm&&e.days.length?", each time":""}</span>
        <div class="chips">
          ${zd.map(t=>U`
            <button class="chip" type="button" aria-pressed=${e.minutes===t?"true":"false"}
              @click=${()=>this._set(e.id,{minutes:t})}>${Cr(t)}</button>
          `)}
        </div>
        <div style="display: flex; gap: 8px; justify-content: flex-end">
          ${e.on?U`<button class="pv-btn pv-btn-secondary" type="button" @click=${()=>{this._set(e.id,{on:!1}),this._editing=null}}>Remove</button>`:Y}
          <button class="pv-btn pv-btn-primary" type="button" @click=${()=>{this._editing=null}}>Done</button>
        </div>
      </div>
    `}}Pd.styles=[$i,lt,ct,pt,o`
      :host {
        display: block;
      }

      .layout {
        display: grid;
        gap: 18px;
      }

      :host([layout='landscape']) .layout {
        grid-template-columns: minmax(0, 1fr) minmax(280px, 380px);
        align-items: start;
      }

      .tiles {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
        gap: 10px;
      }

      .tile {
        position: relative;
        display: grid;
        justify-items: center;
        gap: 4px;
        padding: 14px 8px 10px;
        border-radius: 14px;
        border: 1.5px solid var(--pv-border-subtle, #E5E7EB);
        background: var(--pv-card-bg, #FFFFFF);
        color: inherit;
        font: inherit;
        text-align: center;
        cursor: pointer;
      }

      .tile.added {
        cursor: default;
        opacity: 0.6;
      }

      .tile[aria-pressed='true'] {
        border-color: var(--pv-accent, #6366F1);
        background: color-mix(in srgb, var(--pv-accent, #6366F1) 6%, var(--pv-card-bg, #FFFFFF));
      }

      .tile .check {
        position: absolute;
        top: 8px;
        right: 8px;
        width: 20px;
        height: 20px;
        border-radius: 50%;
        display: grid;
        place-items: center;
        font-size: 0.6875rem;
        background: var(--pv-accent, #6366F1);
        color: var(--pv-on-accent, #FFFFFF);
      }

      .emoji {
        font-size: 1.75rem;
      }

      .name {
        font-weight: 700;
        font-size: 0.875rem;
      }

      .line {
        font-size: 0.75rem;
        color: var(--pv-text-secondary, #6B7280);
      }

      .editor {
        grid-column: 1 / -1;
        display: grid;
        gap: 10px;
        padding: 14px;
        border-radius: 14px;
        background: color-mix(in srgb, var(--pv-text, #1A1B1E) 4%, transparent);
      }




      .hint {
        margin: 10px 0 0;
        font-size: 0.875rem;
        color: var(--pv-text-secondary, #6B7280);
      }

      .preview-head {
        margin: 0 0 8px;
        font-weight: 700;
      }

      .message {
        margin: 12px 0 0;
        color: var(--pv-danger, #DC2626);
      }
    `],e([ue({attribute:!1})],Pd.prototype,"hass",void 0),e([ue({attribute:!1})],Pd.prototype,"household",void 0),e([ue({attribute:!1})],Pd.prototype,"services",void 0),e([ue({type:Number})],Pd.prototype,"revision",void 0),e([ue({type:String,reflect:!0})],Pd.prototype,"layout",void 0),e([me()],Pd.prototype,"_picks",void 0),e([me()],Pd.prototype,"_editing",void 0),e([me()],Pd.prototype,"_message",void 0),ge("pv-setup-common-chores",Pd);class Od extends de{constructor(){super(...arguments),this.household=null,this.services={},this.revision=0,this.layout="landscape",this._text="",this._name="",this._pasting=!1,this._preview=null,this._choices={people:{},on_board:{},assignees:{}},this._problems=[],this._reading=!1,this._choose=()=>{const e=this.renderRoot.querySelector('input[type="file"]');e&&(e.value="",e.click())},this._reset=()=>{this._preview=null,this._choices={people:{},on_board:{},assignees:{}},this._problems=[],this._changed()},this._onFile=async e=>{const t=e.target.files?.[0];t&&await this._read(await t.text(),t.name)}}get _restoring(){return"restore"===this.household?.setup.start}get _chores(){return this.services?.chores}get primaryLabel(){return this._restoring?"Restore":"Import"}get ready(){return!!this._preview&&0===wd(this._preview,this._choices).length}_changed(){this.dispatchEvent(new CustomEvent(Ra,{bubbles:!0,composed:!0}))}async commit(){const e=this._chores;if(!e||!this._preview)return!1;this._problems=[];try{const t=await e.api.importApply(this._text,this._choices);return t.problem?(this._problems=t.problem.problems.length?t.problem.problems:[t.problem.message],!1):(this.setupPatch={modules:{chores:{enabled:!0}}},!0)}catch(e){return this._problems=[$a(e)??"Couldn't import. Check the connection and try again."],!1}}render(){return U`
      <input type="file" accept=".json,application/json,text/plain" @change=${this._onFile} />
      ${this._preview?U`
        <div class="file">
          <span class="text"><strong>${this._name}</strong><span class="sub">${ud(this._preview)}</span></span>
          <button class="pv-btn pv-btn-secondary" type="button" @click=${this._reset}>Choose another</button>
        </div>
      `:U`
        <div class="actions">
          <button class="pv-btn pv-btn-primary" type="button" ?disabled=${this._reading} @click=${this._choose}>Choose a file</button>
          <button class="pv-btn pv-btn-secondary" type="button" @click=${()=>{this._pasting=!this._pasting}}>Paste text</button>
        </div>
        ${this._pasting?U`
          <textarea class="pv-input" aria-label="The file's text" placeholder="Paste the file's text here"
            .value=${this._text} @input=${e=>{this._text=e.target.value}}></textarea>
          <div class="actions" style="margin-top: 8px">
            <button class="pv-btn pv-btn-primary" type="button" ?disabled=${!this._text.trim()||this._reading}
              @click=${()=>this._read(this._text,"Pasted text")}>Review</button>
          </div>
        `:Y}
      `}
      ${this._problems.length?U`
        <div class="problems" role="alert">
          <strong>${this._preview?"This file has problems, so nothing was imported.":"Can't read this file"}</strong>
          <ul>${this._problems.map(e=>U`<li>${e}</li>`)}</ul>
        </div>
      `:Y}
      ${this._preview?U`
        <pv-import-preview .hass=${this.hass} .preview=${this._preview} .members=${ss(this.household?.members??[])}
          .choices=${this._choices} .layout=${this.layout} .timeFormat=${this.data?.display?.time_format??"12h"}
          @pv-import-choices=${e=>{this._choices=e.detail,this._changed()}}></pv-import-preview>
        <p class="summary">${xd(this._preview,this._choices)} ${hd(this._preview)}</p>
      `:Y}
    `}async _read(e,t){const s=this._chores;if(s){this._reading=!0,this._problems=[];try{const i=await s.api.importPreview(e);if(i.problem){const e="unknown_file"===i.problem.code?("Pasted text"===t?"This text":`"${t}"`)+" isn't a plan PlanaVista knows. It reads Household Hours plans (version 1) and files exported from PlanaVista.":i.problem.message;return void(this._problems=[e,...i.problem.problems])}this._text=e,this._name=t,this._preview=i.preview??null,this._choices={people:{},on_board:{},assignees:{}},this._pasting=!1}catch(e){this._problems=[$a(e)??"Couldn't read it. Check the connection and try again."]}finally{this._reading=!1,this._changed()}}}}Od.styles=[lt,ct,pt,o`
      :host {
        display: block;
      }

      .actions {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        margin-bottom: 12px;
      }

      .actions button {
        min-height: 48px;
      }

      textarea {
        width: 100%;
        min-height: 140px;
        box-sizing: border-box;
        font-family: ui-monospace, monospace;
        font-size: 0.8125rem;
      }

      .file {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-bottom: 4px;
        padding: 12px 14px;
        border-radius: 14px;
        background: var(--pv-card-bg, #FFFFFF);
        box-shadow: inset 0 0 0 1px var(--pv-border-subtle, #E5E7EB);
      }

      .file .text {
        flex: 1;
      }

      .file .sub {
        display: block;
        font-size: 0.8125rem;
        color: var(--pv-text-secondary, #6B7280);
      }

      .summary {
        margin: 16px 0 0;
        font-weight: 600;
      }

      .problems {
        margin: 12px 0;
        padding: 12px 16px;
        border-radius: 12px;
        background: color-mix(in srgb, var(--pv-danger, #DC2626) 10%, transparent);
      }

      .problems ul {
        margin: 6px 0 0;
        padding-left: 18px;
      }

      input[type='file'] {
        display: none;
      }
    `],e([ue({attribute:!1})],Od.prototype,"hass",void 0),e([ue({attribute:!1})],Od.prototype,"data",void 0),e([ue({attribute:!1})],Od.prototype,"household",void 0),e([ue({attribute:!1})],Od.prototype,"services",void 0),e([ue({type:Number})],Od.prototype,"revision",void 0),e([ue({type:String})],Od.prototype,"layout",void 0),e([me()],Od.prototype,"_text",void 0),e([me()],Od.prototype,"_name",void 0),e([me()],Od.prototype,"_pasting",void 0),e([me()],Od.prototype,"_preview",void 0),e([me()],Od.prototype,"_choices",void 0),e([me()],Od.prototype,"_problems",void 0),e([me()],Od.prototype,"_reading",void 0),ge("pv-setup-file",Od);const Bd=["1","2","3","4","5","6","7","8","9","0"];function Nd(e,t=Math.random){const s=[...Bd];if(!e)return s;for(let e=s.length-1;e>0;e--){const i=Math.floor(t()*(e+1));[s[e],s[i]]=[s[i],s[e]]}return s}function Rd(e){return{digits:"",length:e??6}}function Id(e){return e.digits.length===e.length}function Ld(e){return e.digits.length>=4}const qd="That PIN is easy to guess: the same digit, a run, or straight down the keypad. Try another.";class Hd extends de{constructor(){super(...arguments),this._backdrop=ta(()=>this._cancel()),this.layout="landscape",this.mode="unlock",this.members=[],this.heading="",this.reason="",this.shuffle=!1,this._step="pick",this._entry=Rd(null),this._first="",this._message="",this._pausedUntil=0,this._now=Date.now(),this._busy=!1,this._shake=!1,this._digits=Nd(!1),this._started=!1,this._sheetMotion=new Zi(this),this._detachDrag=null,this._closing=!1,this._cancel=()=>{this._leave("pv-sheet-close",{})},this._onKey=e=>{"Escape"===e.key?(e.preventDefault(),this._cancel()):/^[0-9]$/.test(e.key)&&"pick"!==this._step?(e.preventDefault(),this._press(e.key)):"Backspace"===e.key&&"pick"!==this._step?(e.preventDefault(),this._delete()):"Enter"===e.key&&"choose"===this._step?(e.preventDefault(),this._next()):Ds(this.shadowRoot,e)}}connectedCallback(){super.connectedCallback(),this.addEventListener("keydown",this._onKey),this.toggleAttribute("reduced","reduced"===vi(this))}disconnectedCallback(){super.disconnectedCallback(),this.removeEventListener("keydown",this._onKey),window.clearInterval(this._ticker),this._detachDrag?.(),this._detachDrag=null}willUpdate(e){this._started||(this._started=!0,this._digits=Nd(this.shuffle),"choose"===this.mode?(this._step="choose",this._entry=Rd(null)):1===this.members.length&&this._enterFor(this.members[0]))}firstUpdated(){this.renderRoot.querySelector(".person, .key")?.focus();const{panel:e,backdrop:t,zone:s}=this._parts();this._sheetMotion.open(e,t),this._detachDrag=this._sheetMotion.attachDrag(s,e,this._cancel)}_parts(){const e=this.renderRoot;return{panel:e.querySelector(".panel"),backdrop:e.querySelector(".backdrop"),zone:e.querySelector(".grab-zone")}}async _leave(e,t){if(this._closing)return;this._closing=!0;const{panel:s,backdrop:i}=this._parts();await this._sheetMotion.close(s,i),this._fire(e,t),requestAnimationFrame(()=>{if(this.isConnected){for(const e of[s,i])e.getAnimations().forEach(e=>e.cancel());s.style.transform="",this._closing=!1}})}render(){return U`
      <div class="backdrop" @pointerdown=${this._backdrop.down} @click=${this._backdrop.click}></div>
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
    `}_renderPad(){const e=this._paused(),t="enter"===this._step?`${this._who?.name??""}, enter your PIN`:"choose"===this._step?`Choose a PIN for ${this.target?.name??""}`:"Enter it again",s=e?`Too many tries. Try again in ${function(e){const t=Math.max(0,Math.ceil(e/1e3));return`${Math.floor(t/60)}:${String(t%60).padStart(2,"0")}`}(this._pausedUntil-this._now)}.`:this._message;return U`
      ${"enter"===this._step&&this.members.length>1?U`<button class="back" type="button" @click=${this._backToPicker}>‹ Someone else</button>`:Y}
      <h2 class="heading" id="pin-heading">${t}</h2>
      ${"choose"===this._step?U`<p class="hint">${i=!!this.target?.parent,i?"4 to 6 digits. 6 is much harder to guess.":"4 to 6 digits."}</p>`:Y}
      ${"enter"===this._step&&this.reason?U`<p class="hint">${this.reason}</p>`:Y}
      <div class="boxes ${this._shake?"shake":""}" aria-hidden="true">
        ${Array.from({length:this._entry.length},(e,t)=>U`
          <span class="box ${t<this._entry.digits.length?"filled":""}"></span>
        `)}
      </div>
      <p class="sr" aria-live="polite">${this._entry.digits.length} of ${this._entry.length} digits entered</p>
      <p class="message" role="alert">${s}</p>
      <div class="keypad">
        ${this._digits.slice(0,9).map(t=>this._renderKey(t,e))}
        <button class="key text" type="button" @click=${this._cancel}>Cancel</button>
        ${this._renderKey(this._digits[9],e)}
        <button class="key text" type="button" aria-label="Delete last digit" ?disabled=${e} @click=${this._delete}>⌫</button>
      </div>
      ${"choose"===this._step?U`
          <button class="pv-btn pv-btn-primary next" type="button"
            ?disabled=${!Ld(this._entry)||this._busy}
            @click=${this._next}>Next</button>
        `:Y}
    `;var i}_renderKey(e,t){return U`
      <button class="key" type="button" ?disabled=${t||this._busy} @click=${()=>this._press(e)}>${e}</button>
    `}_enterFor(e){this._who=e,this._step="enter",this._message="",this._entry=Rd(e.pin_length);const t=e.locked_until?Date.parse(e.locked_until):0;t>Date.now()&&this._pause(t)}_backToPicker(){this._step="pick",this._who=void 0,this._message=""}_paused(){return this._pausedUntil>this._now}_pause(e){this._pausedUntil=e,this._now=Date.now(),window.clearInterval(this._ticker),this._ticker=window.setInterval(()=>{this._now=Date.now(),this._paused()||window.clearInterval(this._ticker)},1e3)}_press(e){this._busy||this._paused()||(this._message="",this._entry=function(e,t){return!/^[0-9]$/.test(t)||e.digits.length>=e.length?e:{...e,digits:e.digits+t}}(this._entry,e),"enter"===this._step&&Id(this._entry)?this._check():("choose"===this._step&&6===this._entry.digits.length||"confirm"===this._step&&Id(this._entry))&&this._next())}_delete(){var e;this._entry=(e=this._entry,{...e,digits:e.digits.slice(0,-1)})}_next(){if("choose"===this._step){if(!Ld(this._entry))return;return function(e){if(1===new Set(e).size)return!0;const t=new Set([...e].slice(1).map((t,s)=>Number(t)-Number(e[s])));return!(1!==t.size||!t.has(1)&&!t.has(-1))||"2580"===e||"0852"===e}(this._entry.digits)?void this._restartChoosing(qd):(this._first=this._entry.digits,this._entry=Rd(this._first.length),void(this._step="confirm"))}"confirm"===this._step&&Id(this._entry)&&(this._entry.digits===this._first?this._save(this._first):this._restartChoosing("Those didn't match. Try again."))}_restartChoosing(e){this._message=e,this._first="",this._entry=Rd(null),this._step="choose",this._shakeBoxes()}async _check(){const e=this._who;if(e){this._busy=!0;try{const t=await this.api.unlock(e.id,this._entry.digits);if(t.ok)return void this._leave("pv-unlocked",{result:t});if(this._entry=Rd(e.pin_length),"paused"===t.reason)this._pause(Date.now()+1e3*(t.retry_after??30));else if("wrong_pin"===t.reason){const s=t.tries_left??0;this._message=`That's not ${e.name}'s PIN. ${1===s?"1 more try":`${s} more tries`} before a short pause.`}else this._message=`${e.name} has no PIN yet.`;this._shakeBoxes()}catch{this._entry=Rd(e.pin_length),this._message="Couldn't check the PIN. Check the connection and try again."}finally{this._busy=!1}}}async _save(e){const t=this.target;if(t){this._busy=!0;try{await this.api.setPin(t.id,e),this._leave("pv-pin-set",{memberId:t.id})}catch(e){this._restartChoosing("easy_pin"===xa(e)?qd:ti(xa(e)))}finally{this._busy=!1}}}_shakeBoxes(){this._shake=!0,window.setTimeout(()=>{this._shake=!1},320)}_fire(e,t){this.dispatchEvent(new CustomEvent(e,{detail:t,bubbles:!0,composed:!0}))}}Hd.styles=[ct,Xi,o`
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

      /* The why line belongs to the title, so it sits on the left under it (review). */
      .hint {
        margin: 0;
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
    `],e([ue({attribute:!1})],Hd.prototype,"hass",void 0),e([ue({attribute:!1})],Hd.prototype,"api",void 0),e([ue({type:String,reflect:!0})],Hd.prototype,"layout",void 0),e([ue({type:String})],Hd.prototype,"mode",void 0),e([ue({attribute:!1})],Hd.prototype,"members",void 0),e([ue({type:String})],Hd.prototype,"heading",void 0),e([ue({type:String})],Hd.prototype,"reason",void 0),e([ue({attribute:!1})],Hd.prototype,"target",void 0),e([ue({type:Boolean})],Hd.prototype,"shuffle",void 0),e([me()],Hd.prototype,"_step",void 0),e([me()],Hd.prototype,"_who",void 0),e([me()],Hd.prototype,"_entry",void 0),e([me()],Hd.prototype,"_first",void 0),e([me()],Hd.prototype,"_message",void 0),e([me()],Hd.prototype,"_pausedUntil",void 0),e([me()],Hd.prototype,"_now",void 0),e([me()],Hd.prototype,"_busy",void 0),e([me()],Hd.prototype,"_shake",void 0),ge("pv-pin-sheet",Hd);class jd extends de{constructor(){super(...arguments),this.layout="landscape",this.shuffle=!1,this.sharedScreens=!1,this._choosing=!1,this._confirmingRemove=!1,this._message="",this._busy=!1}_paused(){return(this.member.locked_until?Date.parse(this.member.locked_until):0)>Date.now()}_status(){return this._paused()?{text:"Paused after too many tries",needs:!1}:this.member.has_pin?{text:"PIN set",needs:!1}:this.member.parent&&this.sharedScreens?{text:"Needs a PIN on a shared screen",needs:!0}:{text:"No PIN",needs:!1}}render(){const e=this._status();return U`
      <div class="row">
        <span class="status ${e.needs?"needs":""}">${e.text}</span>
        <span class="buttons">
          <button class="pv-btn pv-btn-secondary" type="button" ?disabled=${this._busy}
            @click=${()=>{this._message="",this._choosing=!0}}>
            ${this.member.has_pin?"Change PIN":"Set PIN"}
          </button>
          ${this.member.has_pin?U`
            <button class="pv-btn pv-btn-secondary danger" type="button" ?disabled=${this._busy}
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
          .actions=${[{id:"remove",label:`Remove ${this.member.name}'s PIN`,kind:"destructive"},{id:"cancel",label:"Cancel",kind:"secondary"}]}
          @pv-sheet-action=${this._onRemoveChoice}
        ></pv-notice-sheet>
      `:Y}
    `}async _onRemoveChoice(e){e.stopPropagation(),this._confirmingRemove=!1,"remove"===e.detail.id&&await this._remove()}_closeSheet(e){e.stopPropagation(),this._choosing=!1}async _remove(){await this._run(()=>this.api.clearPin(this.member.id))}async _clearPause(){await this._run(()=>this.api.clearPause(this.member.id))}async _run(e){this._busy=!0,this._message="";try{await e()}catch(e){this._message=e?.message||ti(xa(e))}finally{this._busy=!1}}}jd.styles=[ct,o`
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
        min-height: 48px;
      }

      .message {
        margin: 6px 0 0;
        color: var(--pv-danger, #DC2626);
        font-size: 0.875rem;
      }
    `],e([ue({attribute:!1})],jd.prototype,"hass",void 0),e([ue({attribute:!1})],jd.prototype,"api",void 0),e([ue({type:String})],jd.prototype,"layout",void 0),e([ue({attribute:!1})],jd.prototype,"member",void 0),e([ue({type:Boolean})],jd.prototype,"shuffle",void 0),e([ue({type:Boolean})],jd.prototype,"sharedScreens",void 0),e([me()],jd.prototype,"_choosing",void 0),e([me()],jd.prototype,"_confirmingRemove",void 0),e([me()],jd.prototype,"_message",void 0),e([me()],jd.prototype,"_busy",void 0),ge("pv-pin-actions",jd);class Ud extends de{constructor(){super(...arguments),this.household=null,this.layout="landscape",this.session=null,this._shared=null,this._message=""}willUpdate(){null===this._shared&&this.household&&(this._shared="parent"!==this.household.account.kind)}async commit(){const e=this.household;if(!e)return!1;this._message="";const t=!1!==this._shared;if(t&&!e.members.some(e=>e.parent&&e.has_pin))return this._message="Set a PIN for a parent first, so someone can open Settings here.",!1;if(function(e,t,s){return t&&!e.account.shared&&!s?.parent}(e,t,this.session)){const t=e.members.filter(e=>e.parent&&e.has_pin);if(!this.pinGate||!await this.pinGate.ask(t,"Who's finishing setup?"))return!1}try{return t!==e.account.shared&&await this.api.setSharedScreen(t),!0}catch(e){return this._message=$a(e)??"Couldn't save. Check the connection and try again.",!1}}render(){const e=this.household;if(!e)return Y;const t=!1!==this._shared,s=ss(e.members).filter(e=>e.parent);return U`
      <div class="choices" role="radiogroup" aria-label="Is this a shared family screen?">
        <button class="choice" type="button" role="radio" aria-checked=${t?"true":"false"} @click=${()=>{this._shared=!0}}>
          <span class="icon" aria-hidden="true">🏠</span>
          <span class="text"><span class="title">Yes, the whole family uses it</span><span class="sub">Like a tablet on the kitchen wall.</span></span>
        </button>
        <button class="choice" type="button" role="radio" aria-checked=${t?"false":"true"} @click=${()=>{this._shared=!1}}>
          <span class="icon" aria-hidden="true">📱</span>
          <span class="text"><span class="title">No, it's just mine</span><span class="sub">Your own phone or computer. No PINs needed here.</span></span>
        </button>
      </div>
      ${t?U`
        <p class="label">Parents, set your PINs</p>
        ${s.length?U`
          <div class="parents">
            ${s.map(t=>U`
              <div class="parent">
                <pv-member-avatar .member=${t} .hass=${this.hass} size="36"></pv-member-avatar>
                <span class="name">${t.name}</span>
                <pv-pin-actions .hass=${this.hass} .api=${this.api} .layout=${this.layout} .member=${t}
                  .shuffle=${!!e.security.shuffle_keypad} .sharedScreens=${!0}></pv-pin-actions>
              </div>
            `)}
          </div>
        `:U`<p class="hint">No one is a parent yet. Go back to Who lives here? and mark the parents.</p>`}
        <p class="hint">Kids can have a PIN too, so nobody checks off someone else's chores. That's in Settings.</p>
        ${this.hass?.user?.is_admin?U`
          <p class="warning" role="note">
            This screen is signed in with an admin account. A non-admin account is safer for a shared screen, because an
            admin can open Home Assistant's own settings, and a PIN can't guard those. Make a new user in Home Assistant
            (Settings, People, Users) without administrator rights, and sign this screen in with it.
          </p>
        `:Y}
      `:Y}
      ${this._message?U`<p class="message" role="alert">${this._message}</p>`:Y}
    `}}Ud.styles=[lt,ct,o`
      :host {
        display: block;
      }

      .choices {
        display: grid;
        gap: 10px;
        margin-bottom: 20px;
      }

      .choice {
        display: flex;
        align-items: center;
        gap: 14px;
        width: 100%;
        padding: 14px 16px;
        border-radius: 14px;
        border: 1.5px solid var(--pv-border-subtle, #E5E7EB);
        background: var(--pv-card-bg, #FFFFFF);
        color: inherit;
        font: inherit;
        text-align: left;
        cursor: pointer;
      }

      .choice[aria-checked='true'] {
        border-color: var(--pv-accent, #6366F1);
        box-shadow: 0 0 0 2px color-mix(in srgb, var(--pv-accent, #6366F1) 25%, transparent);
      }

      .icon {
        font-size: 1.5rem;
      }

      .text {
        flex: 1;
      }

      .title {
        display: block;
        font-weight: 700;
      }

      .sub {
        font-size: 0.875rem;
        color: var(--pv-text-secondary, #6B7280);
      }

      .label {
        margin: 0 4px 8px;
        font-size: 0.8125rem;
        font-weight: 750;
        color: var(--pv-text-secondary, #6B7280);
      }

      .parents {
        border-radius: 14px;
        background: var(--pv-card-bg, #FFFFFF);
        box-shadow: inset 0 0 0 1px var(--pv-border-subtle, #E5E7EB);
      }

      .parent {
        display: flex;
        align-items: center;
        gap: 12px;
        min-height: 60px;
        padding: 8px 14px;
      }

      .parent + .parent {
        border-top: 1px solid var(--pv-border-subtle, #E5E7EB);
      }

      .parent .name {
        flex: 1;
        font-weight: 600;
      }

      .hint {
        margin: 10px 4px 0;
        font-size: 0.875rem;
        color: var(--pv-text-secondary, #6B7280);
      }

      .warning {
        margin: 16px 0 0;
        padding: 12px 14px;
        border-radius: 12px;
        background: color-mix(in srgb, #F59E0B 16%, transparent);
        line-height: 1.5;
      }

      .message {
        margin: 14px 0 0;
        color: var(--pv-danger, #DC2626);
      }
    `],e([ue({attribute:!1})],Ud.prototype,"hass",void 0),e([ue({attribute:!1})],Ud.prototype,"household",void 0),e([ue({attribute:!1})],Ud.prototype,"api",void 0),e([ue({type:String})],Ud.prototype,"layout",void 0),e([ue({attribute:!1})],Ud.prototype,"pinGate",void 0),e([ue({attribute:!1})],Ud.prototype,"session",void 0),e([me()],Ud.prototype,"_shared",void 0),e([me()],Ud.prototype,"_message",void 0),ge("pv-setup-shared-screen",Ud);class Wd extends de{constructor(){super(...arguments),this.household=null,this.services={},this.revision=0}render(){const e=this.household?.account,t=e?.shared||"other"===e?.kind;return U`
      <p class="lead">Here's your board. It fills in as the day goes.</p>
      <pv-setup-board-preview .hass=${this.hass} .household=${this.household} .services=${this.services}
        .revision=${this.revision}></pv-setup-board-preview>
      <div class="tips">
        <div class="tip">
          <span class="icon" aria-hidden="true">👆</span>
          <span><span class="title">Hold the circle to finish a chore</span><span class="text">Let go early and nothing happens.</span></span>
        </div>
        <div class="tip">
          <span class="icon" aria-hidden="true">⚙️</span>
          <span>
            <span class="title">${t?"Settings needs a parent's PIN":"Change anything in Settings"}</span>
            <span class="text">It's the gear in the bar.</span>
          </span>
        </div>
      </div>
    `}}Wd.styles=o`
    :host {
      display: block;
    }

    .lead {
      margin: -12px 0 16px;
      color: var(--pv-text-secondary, #6B7280);
    }

    .tips {
      display: grid;
      gap: 12px;
      margin-top: 18px;
    }

    .tip {
      display: flex;
      gap: 12px;
      align-items: flex-start;
    }

    .icon {
      flex-shrink: 0;
      width: 40px;
      height: 40px;
      display: grid;
      place-items: center;
      border-radius: 12px;
      background: color-mix(in srgb, var(--pv-text, #1A1B1E) 6%, transparent);
      font-size: 1.25rem;
    }

    .title {
      display: block;
      font-weight: 700;
    }

    .text {
      color: var(--pv-text-secondary, #6B7280);
    }
  `,e([ue({attribute:!1})],Wd.prototype,"hass",void 0),e([ue({attribute:!1})],Wd.prototype,"household",void 0),e([ue({attribute:!1})],Wd.prototype,"services",void 0),e([ue({type:Number})],Wd.prototype,"revision",void 0),ge("pv-setup-done-board",Wd),function(e=Oa){e.register(ol)}(),function(e=La,t=qa,s=ja,i=Ha){for(const t of cl)e.register(t);for(const e of hl)t.register(e);for(const e of ul)s.register(e);for(const e of vl)i.register(e)}();const Vd=Symbol.for(""),Yd=e=>{if(e?.r===Vd)return e?._$litStatic$},Kd=e=>({_$litStatic$:e,r:Vd}),Gd=new Map,Jd=(e=>(t,...s)=>{const i=s.length;let a,n;const o=[],r=[];let l,d=0,c=!1;for(;d<i;){for(l=t[d];d<i&&void 0!==(n=s[d],a=Yd(n));)l+=a+t[++d],c=!0;d!==i&&r.push(n),o.push(l),d++}if(d===i&&o.push(t[i]),c){const e=o.join("$$lit$$");void 0===(t=Gd.get(e))&&(o.raw=o,Gd.set(e,t=o)),s=r}return e(t,...s)})(U),Xd={adding:"add",approving:"approve",asking:"ask",changing:"change",checking:"check",deleting:"delete",doing:"do",excusing:"excuse",finishing:"finish",getting:"get",handing:"hand",opening:"open",planning:"plan",sending:"send",setting:"set",starting:"start",unchecking:"uncheck"},Qd={"Whose day is this?":"To change their My day","Whose goal is this?":"To set their goal"};function Zd(e,t){if(e===t)return!0;if(!e||!t||"object"!=typeof e||"object"!=typeof t)return!1;const s=Object.keys(e),i=Object.keys(t);return s.length===i.length&&s.every(s=>Zd(e[s],t[s]))}class ec{constructor(e=()=>{}){this._changed=e,this._pending={},this._unsent={},this._send=null,this._onError=null,this._tap=null,this._listeners=new Set}subscribe(e){return this._listeners.add(e),()=>{this._listeners.delete(e)}}_notify(){this._changed();for(const e of this._listeners)e()}current(e){return{...e,...this._pending}}reconcile(e){for(const t of Object.keys(this._pending))!(t in this._unsent)&&Zd(e[t],this._pending[t])&&delete this._pending[t]}set(e,t,s,i){Object.assign(this._pending,e),Object.assign(this._unsent,e),this._send=t,this._onError=s,i&&(this._tap={...i,at:Date.now()}),clearTimeout(this._timer),this._timer=setTimeout(()=>this.flush(),400),this._notify()}takeTap(e=Date.now()){const t=this._tap;return this._tap=null,t&&e-t.at<=3e3?{x:t.x,y:t.y}:null}flush(){clearTimeout(this._timer),this._timer=void 0;const e=this._unsent,t=this._send;if(!t||0===Object.keys(e).length)return;this._unsent={};const s=this._onError,i=()=>{for(const t of Object.keys(e))!(t in this._unsent)&&Zd(this._pending[t],e[t])&&delete this._pending[t];this._notify()};t(e).then(()=>setTimeout(i,5e3),e=>{i(),s?.(e)})}}function tc(e){const t=e?.["sun.sun"];if(!t)return null;const s=e=>{const s=t.attributes?.[e];return"string"==typeof s?s:void 0};return{state:t.state,next_rising:s("next_rising"),next_setting:s("next_setting")}}function sc(e){const t="automatic"===e.appearance;return{entities:t&&"sun"===e.appearance_switch?["sun.sun"]:[],haDarkMode:t&&"home_assistant"===e.appearance_switch}}const ic=["light","dark","automatic"],ac=["sun","schedule","home_assistant"],nc=["planavista","minimal","vibrant"],oc=["device","full","reduced"],rc={light:"Light",dark:"Dark",automatic:"Automatic"},lc={planavista:"PlanaVista",minimal:"Minimal",vibrant:"Vibrant"},dc={sun:"At sunset and sunrise",schedule:"On a schedule",home_assistant:"Match Home Assistant"},cc={device:"Follow the device",full:"Full",reduced:"Reduced"},hc=/^([01]\d|2[0-3]):([0-5]\d)$/,pc={planavista:["planavista","light"],light:["planavista","light"],dark:["planavista","dark"],minimal:["minimal","light"],modern:["vibrant","light"],vibrant:["vibrant","light"]};function uc(e,t,s){return t.includes(e)?e:s}function mc(e,t){return"string"==typeof e&&hc.test(e)?e:t}function vc(e){return e&&"object"==typeof e&&!Array.isArray(e)?{...e}:null}function gc(e){const t={};for(const s of["corner_style","shadow_depth","event_style","avatar_border"])e[s]&&(t[s]=e[s]);return"light"===t.avatar_border&&(t.avatar_border="white"),t}function bc(e){const t=e??{},s="string"==typeof t.theme&&t.theme?t.theme:"planavista",[i,a]=pc[s]??pc.planavista,n=vc(t.theme_overrides)??{},o=function(e){const t={};for(const s of["accent","background","now_color"])e[s]&&(t[s]=e[s]);const s=e.header_style;return"custom"===s?e.header_custom&&(t.header=e.header_custom):s&&(t.header=s),t}(n),r=vc(t.colors_light),l=vc(t.colors_dark),d=vc(t.shape);return{appearance:uc(t.appearance,ic,a),appearance_switch:uc(t.appearance_switch,ac,"sun"),light_from:mc(t.light_from,"07:00"),dark_from:mc(t.dark_from,"21:00"),theme_pair:uc(t.theme_pair,nc,i),colors_light:r??("dark"===s?{}:o),colors_dark:l??("dark"===s?o:{}),shape:d??gc(n),motion:uc(t.motion,oc,"device")}}function yc(e){return{pair:e.theme_pair,light:e.colors_light,dark:e.colors_dark,shape:e.shape}}function fc(e){const t=hc.exec(e);return t?60*Number(t[1])+Number(t[2]):0}function _c(e,t){const s=new Date(e);return s.setHours(Math.floor(t/60),t%60,0,0),s.getTime()<=e.getTime()&&(s.setDate(s.getDate()+1),s.setHours(Math.floor(t/60),t%60,0,0)),s}function wc(e,t){const s=fc(e.light_from),i=fc(e.dark_from);if(s===i)return{mode:"light",next:null};const a=60*t.getHours()+t.getMinutes(),n=s<i?a>=s&&a<i:a>=s||a<i;return{mode:n?"light":"dark",next:_c(t,n?i:s)}}function xc(e,t){const s=e?new Date(e):null;return s&&!Number.isNaN(s.getTime())&&s.getTime()>t.getTime()?s:null}function $c(e){const t=e?new Date(e).getTime():Number.NaN;return Number.isNaN(t)?null:t}function kc(e,t){const s="above_horizon"===e.state,i=t.getTime(),a=$c(s?e.next_setting:e.next_rising),n=$c(s?e.next_rising:e.next_setting),[o,r]=s?["light","dark"]:["dark","light"];return null===a||a>i?{mode:o,next:null===a?null:new Date(a)}:null===n||n>i?{mode:r,next:null===n?null:new Date(n)}:{mode:o,next:null}}function Ec(e,t){if("automatic"!==e.appearance)return{mode:e.appearance,next:null,sunMissing:!1};if("home_assistant"===e.appearance_switch)return{mode:t.haDark?"dark":"light",next:null,sunMissing:!1};if("sun"===e.appearance_switch){const s=t.sun;return!s||"above_horizon"!==s.state&&"below_horizon"!==s.state?{...wc(e,t.now),sunMissing:!0}:{...kc(s,t.now),sunMissing:!1}}return{...wc(e,t.now),sunMissing:!1}}function Fc(e,t){const s=String(e.getMinutes()).padStart(2,"0");return"24h"===t?`${String(e.getHours()).padStart(2,"0")}:${s}`:`${e.getHours()%12||12}:${s} ${e.getHours()>=12?"PM":"AM"}`}const Cc="planavista-page-styles",Sc="planavista-transition-styles";function Dc(e,t=document){let s=t.getElementById(Sc);e?(s||(s=t.createElement("style"),s.id=Sc,t.head.appendChild(s)),s.textContent=e):s?.remove()}let Ac=null,Mc=!1;const Tc="root";function zc(e=document){return"function"==typeof e.startViewTransition}const Pc=["pointerdown","keydown","wheel"],Oc={capture:!0,passive:!0};class Bc{constructor(e,t,s,i){this._host=e,this._edits=t,this._source=s,this._settled=i,this.mode="light",this.motion="full",this.settings=bc(void 0),this.look=yc(this.settings),this.sunMissing=!1,this._shown=null,this._lastInteraction=0,this._quietUntil=Number.POSITIVE_INFINITY,this._changing=!1,this._wakeUntil=0,this._onInteraction=()=>{this._lastInteraction=Date.now()},this._onVisibility=()=>{"visible"===document.visibilityState&&(this._wakeUntil=Date.now()+15e3,this._host.requestUpdate())},this._onReducedChange=()=>{this._host.requestUpdate()},e.addController(this)}hostConnected(){for(const e of Pc)document.addEventListener(e,this._onInteraction,Oc);document.addEventListener("visibilitychange",this._onVisibility),this._reduced="function"==typeof matchMedia?matchMedia("(prefers-reduced-motion: reduce)"):void 0,this._reduced?.addEventListener("change",this._onReducedChange)}hostDisconnected(){for(const e of Pc)document.removeEventListener(e,this._onInteraction,Oc);document.removeEventListener("visibilitychange",this._onVisibility),this._reduced?.removeEventListener("change",this._onReducedChange),clearTimeout(this._timer),this._shown=null}hostUpdate(){const e=this._source();e.display&&(this._display=e.display);const t=bc(this._display);this._edits.reconcile(t);const s=function(e,t){switch(t){case"light":case"dark":return{...e,theme_pair:"planavista",appearance:t};case"planavista":case"minimal":return{...e,theme_pair:t};case"vibrant":case"modern":return{...e,theme_pair:"vibrant"};default:return e}}(this._edits.current(t),e.cardTheme),i=Ec(s,{now:new Date,sun:e.sun,haDark:e.haDark});var a,n;this.settings=s,this.look=yc(s),this.sunMissing=i.sunMissing,this.motion=(a=s.motion,n=!!this._reduced?.matches,"full"===a||"reduced"===a?a:n?"reduced":"full"),this._show(i.mode,e.overlayOpen),this._display||(this._shown=null),this._schedule(i.next)}_show(e,t){if(this._quietUntil=Number.POSITIVE_INFINITY,this._changing)return;if(null===this._shown||e===this._shown)return void this._paint(e);const s=this._edits.takeTap(),i="hidden"===document.visibilityState,a=!s&&Date.now()<this._wakeUntil;if(!(s||i||a||function(e,t,s){return!s&&e-t>=1e4}(Date.now(),this._lastInteraction,t)))return this._quietUntil=t?Number.POSITIVE_INFINITY:this._lastInteraction+1e4,void this._paint(this._shown);const n=a?"none":function(e){return null===e.from||e.from===e.to||e.hidden||!e.supported?"none":e.reducedMotion?"fade":e.byHand?"reveal":"dark"===e.to?"dusk":"dawn"}({from:this._shown,to:e,byHand:null!==s,hidden:i,reducedMotion:"reduced"===this.motion,supported:zc()});this._changing=!0,function(e,t,s,i){return"none"===e||Mc||!zc()?s():new Promise((a,n)=>{const o={element:t,apply:()=>s().then(a,n),point:i};Ac&&Ac.kind===e?Ac.changes.push(o):Ac?o.apply():(Ac={kind:e,changes:[o]},setTimeout(()=>{!async function(){const e=Ac;if(Ac=null,!e)return;Mc=!0;const t=document.documentElement;Dc(function(e,t){if(0===e.length||"none"===t)return"";const s=t=>e.map(e=>`html[data-pv-vt]::view-transition-${t}(${e})`).join(","),i=["html[data-pv-vt]::view-transition{pointer-events:none}","html[data-pv-vt]::view-transition-old(root),html[data-pv-vt]::view-transition-new(root){animation:none}",`${s("group")}{animation:none}`,`${s("old")},${s("new")}{animation:none;mix-blend-mode:normal}`];if("dusk"===t||"dawn"===t){const e=`linear-gradient(to ${"dusk"===t?"bottom":"top"},transparent 0%,transparent 47.6%,#000 52.4%,#000 100%)`,a="dusk"===t?"0% 100%":"0% 0%";i.push(`${s("old")}{z-index:2;-webkit-mask-image:${e};mask-image:${e};-webkit-mask-size:100% 210%;mask-size:100% 210%;-webkit-mask-repeat:no-repeat;mask-repeat:no-repeat;-webkit-mask-position:${a};mask-position:${a}}`)}return"reveal"===t&&i.push(`${s("new")}{z-index:2}`),i.join("\n")}([Tc],e.kind)),t.dataset.pvVt=e.kind;let s=[];const i=()=>Promise.all(e.changes.map(e=>e.apply())).then(()=>{});try{const t=document.startViewTransition.bind(document);let a;try{a=t(i)}catch{return void await i()}try{await a.ready,s=function(e,t){const s=document.documentElement,i=`::view-transition-old(${Tc})`,a=`::view-transition-new(${Tc})`;if("dusk"===e||"dawn"===e){const[t,a]="dusk"===e?["0% 100%","0% 0%"]:["0% 0%","0% 100%"];return[s.animate({maskPosition:[t,a],webkitMaskPosition:[t,a]},{duration:2e3,easing:"cubic-bezier(.45,0,.25,1)",fill:"both",pseudoElement:i})]}if("reveal"===e){const e=t.find(e=>e.point)??t[0],i=e.element.getBoundingClientRect(),n=function(e,t,s){return{x:e.x,y:e.y,radius:Math.hypot(Math.max(e.x,t-e.x),Math.max(e.y,s-e.y))}}(e.point??{x:i.left+i.width/2,y:i.top+i.height/2},window.innerWidth,window.innerHeight),o=mi(ci);return[s.animate({clipPath:[`circle(0px at ${n.x}px ${n.y}px)`,`circle(${n.radius}px at ${n.x}px ${n.y}px)`]},{duration:o.duration,easing:o.easing,fill:"both",pseudoElement:a})]}return[s.animate({opacity:[1,0]},{duration:250,easing:"ease",fill:"both",pseudoElement:i}),s.animate({opacity:[0,1]},{duration:250,easing:"ease",fill:"both",pseudoElement:a})]}(e.kind,e.changes)}catch{}await a.finished.catch(()=>{})}finally{for(const e of s)e.cancel();delete t.dataset.pvVt,Dc(""),Mc=!1}}()},0))})}(n,this._host,async()=>{this._paint(e),this._host.requestUpdate(),await this._settled()},s??void 0).finally(()=>{this._changing=!1,this._host.requestUpdate()})}_paint(e){this.mode=e,this._shown=e,function(e,t){const s=JSON.stringify(t),i=ks.get(e);if(i?.key!==s){for(const s of i?.names??[])s in t||e.style.removeProperty(s);for(const[s,i]of Object.entries(t))e.style.setProperty(s,i);ks.set(e,{key:s,names:Object.keys(t)})}}(this._host,{...xs(this.look,e),"--pv-motion":this.motion}),this._host.setAttribute("appearance",e),this._host.setAttribute("motion",this.motion)}_schedule(e){clearTimeout(this._timer);const t=Date.now();this._timer=setTimeout(()=>this._host.requestUpdate(),function(e,t,s){const i=[e+6e4,t?t.getTime()+1e3:Number.NaN,s+50];return Math.min(...i.filter(t=>t>e))}(t,e,this._quietUntil)-t)}}var Nc="1.6.0";function Rc(e,t,s){return`${e} ${1===e?t:s}`}const Ic=[{id:"people",label:"People",group:"people",order:100,tag:"pv-settings-people",applies:({household:e})=>null!==e,summary:({household:e})=>{const t=e?.members.length??0;return 0===t?"No one yet":Rc(t,"person","people")}},{id:"appearance",label:"Appearance",group:"appearance",order:400,tag:"pv-settings-appearance",summary:({data:e})=>{return t=bc(e.display),`${rc[t.appearance]} · ${lc[t.theme_pair]}`;var t},needsALook:({data:e,hass:t})=>{const s=bc(e?.display),{sunMissing:i}=Ec(s,{now:new Date,sun:tc(t?.states)});return i?[{id:"appearance-sun",text:"Automatic appearance follows the sun, but Home Assistant's Sun integration isn't set up. The schedule's times are used until it is."}]:[]}},{id:"pins",label:"PINs and parent mode",group:"security",order:500,tag:"pv-settings-pins",applies:({household:e})=>null!==e,summary:({household:e})=>{const t=e?.members.filter(e=>e.has_pin).length??0,s=e?.account.shared?"This screen: shared family screen":"This screen: not shared";return t>0?`${s} · ${Rc(t,"PIN","PINs")}`:s}},{id:"about",label:"About PlanaVista",group:"about",order:900,tag:"pv-settings-about",summary:()=>`Version ${Nc}`}],Lc=[{id:"welcome",label:"Welcome",order:0,tag:"pv-setup-welcome",heading:"Welcome to PlanaVista",lead:"Your family's calendar and chores, together on one screen.",primary:"Set up",secondary:"Restore from a PlanaVista file"},{id:"people",label:"Who lives here?",order:100,tag:"pv-setup-people",heading:"Who lives here?",lead:"Choose everyone in your home and what they are. People without Home Assistant can be added too."},{id:"look",label:"Look",order:900,tag:"pv-setup-look",heading:"Pick a look",lead:"You can change it any time in Settings."},{id:"done",label:"Done",order:1e3,tag:"pv-setup-done",heading:"You're all set",primary:"Open the calendar"}];class qc{constructor(e){this._host=e,this.view=null,this.ready=!1,this._subscription=new Fa(e=>{this.view=e,this.ready=!0,this._host.requestUpdate()}),e.addController(this)}hostConnected(){this._follow()}hostUpdate(){this._follow()}hostDisconnected(){this._subscription.stop(),this.view=null,this.ready=!1}_follow(){this._subscription.update(this._host.hass?.connection)}}class Hc{constructor(e,t){this._host=e,this._entity=t,this.forecast=[],this._subscription=new Mi(e=>{this.forecast=e,this._host.requestUpdate()}),e.addController(this)}hostConnected(){this._follow()}hostUpdate(){this._follow()}hostDisconnected(){this._subscription.stop(),this.forecast=[]}_follow(){const e=this._entity(),t=this._host.hass;this._subscription.update(t?.connection,e,t?.states?.[e]?.attributes?.forecast)}}function jc(e,t,s){const i=e.reduce((e,t)=>e+t,0)+t*Math.max(0,e.length-1);return i<=s}class Uc{constructor(){this.layout=null,this._box=null,this._beforeKeyboard=null,this._textFocused=!1}focus(e){this._textFocused=e,e&&!this._beforeKeyboard&&(this._beforeKeyboard=this._box)}blur(){this._textFocused=!1}measure(e){const t=this._beforeKeyboard;return this.layout=function(e,t,s,i){if(t&&s&&i&&e.width===s.width&&e.height<s.height)return t;if(e.width<600)return"phone";const a=e.height>0?e.width/e.height:Number.POSITIVE_INFINITY;return a>=.95&&a<=1.05?"portrait"===t||"landscape"===t?t:"landscape":a>1?"landscape":"portrait"}(e,this.layout,t,this._textFocused),t&&(e.width!==t.width||!this._textFocused&&e.height>=t.height)&&(this._beforeKeyboard=null),this._box=e,this.layout}}const Wc=new Set(["INPUT","TEXTAREA","SELECT"]);class Vc{constructor(e){this._host=e,this.layout="landscape",this._tracker=new Uc,this._onFocusIn=e=>{const t=e.composedPath()[0];this._tracker.focus(!!t&&Wc.has(t.tagName))},this._onFocusOut=()=>{this._tracker.blur()},e.addController(this)}hostConnected(){this._host.addEventListener("focusin",this._onFocusIn),this._host.addEventListener("focusout",this._onFocusOut),this._observer=new ResizeObserver(e=>{const t=e[e.length-1]?.contentRect;t&&this._measure({width:t.width,height:t.height})}),this._observer.observe(this._host);const e=this._host.getBoundingClientRect();this._measure({width:e.width,height:e.height})}hostDisconnected(){this._observer?.disconnect(),this._observer=void 0,this._host.removeEventListener("focusin",this._onFocusIn),this._host.removeEventListener("focusout",this._onFocusOut)}_measure(e){if(0===e.width&&0===e.height)return;const t=this._tracker.measure(e);t===this.layout&&this._host.getAttribute("layout")===t||(this.layout=t,this._host.setAttribute("layout",t),this._host.requestUpdate())}}class Yc{constructor(e){this._onDrop=e,this._handle=()=>{this._onDrop()}}follow(e){e!==this._connection&&(this.stop(),this._connection=e,e?.addEventListener("disconnected",this._handle),e?.addEventListener("ready",this._handle))}stop(){this._connection?.removeEventListener("disconnected",this._handle),this._connection?.removeEventListener("ready",this._handle),this._connection=void 0}}const Kc=12e4;function Gc(e){return Math.min(e.lastTouch+e.idleMs,e.capAt)}function Jc(e){return e?{mode:"parent mode",ends:"Parent mode ends in"}:{mode:"unlocked",ends:"Locks in"}}class Xc{constructor(e,t){this._host=e,this._api=t,this.session=null,this._connection=new Yc(()=>this._forget()),this._check=()=>{var e,t;this.session&&(e=this.session,t=Date.now(),0===function(e,t){return Math.max(0,Gc(e)-t)}(e,t))&&this.lock()},this._onActivity=()=>{if(!this.session)return;const{session:e,touch:t}=function(e,t){return t-e.lastTouch<function(e){return Math.min(3e4,e.idleMs/4)}(e)?{session:e,touch:!1}:{session:{...e,lastTouch:t},touch:!0}}(this.session,Date.now());if(!t)return;this.session=e;const s=e.token;this._api().touch(s).catch(()=>{this.session?.token===s&&this._forget()}),this._host.requestUpdate()},this._onVisibility=()=>{"hidden"===document.visibilityState&&this.lock()},e.addController(this)}get token(){return this.session?.token??null}get endsAt(){return this.session?Gc(this.session):null}get spanMs(){return this.session?.idleMs??0}hostConnected(){this._host.addEventListener("pointerdown",this._onActivity,!0),this._host.addEventListener("keydown",this._onActivity,!0),document.addEventListener("visibilitychange",this._onVisibility),this._followConnection()}hostUpdate(){this._followConnection()}hostDisconnected(){this._host.removeEventListener("pointerdown",this._onActivity,!0),this._host.removeEventListener("keydown",this._onActivity,!0),document.removeEventListener("visibilitychange",this._onVisibility),this._connection.stop(),this.lock()}ended(e){this.session?.token===e&&this._forget()}used(e){var t,s;this.session?.token===e&&(this.session=(t=this.session,(s=Date.now())>t.lastTouch?{...t,lastTouch:s}:t),this._host.requestUpdate())}_followConnection(){this._connection.follow(this._host.hass?.connection)}follow(e){if(!this.session||!e)return;const t=function(e,t,s){const i=t?1e3*t:e.idleMs,a=s?e.startedAt+6e4*s:e.capAt;return i===e.idleMs&&a===e.capAt?e:{...e,idleMs:i,capAt:a}}(this.session,e.session_idle_seconds,e.parent_mode_minutes);t!==this.session&&(this.session=t,this._host.requestUpdate())}unlocked(e){e.ok&&e.session&&e.member_id&&(this._forget(),this.session=function(e,t){return{token:e.session,memberId:e.member_id,parent:e.parent,lastTouch:t,startedAt:t,idleMs:e.idle_seconds?1e3*e.idle_seconds:Kc,capAt:t+(e.cap_in?1e3*e.cap_in:6e5),adminParent:!!e.admin_parent}}({session:e.session,member_id:e.member_id,parent:!!e.parent,idle_seconds:e.idle_seconds,cap_in:e.cap_in,admin_parent:e.admin_parent},Date.now()),this._timer=window.setInterval(this._check,1e3),this._host.requestUpdate())}lock(){const e=this.token;this._forget(),e&&this._api().lock(e).catch(()=>{})}_forget(){window.clearInterval(this._timer),this._timer=void 0,this.session&&(this.session=null,this._host.requestUpdate())}}class Qc extends de{constructor(){super(...arguments),this._config={}}setConfig(e){this._config=e}render(){return U`
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
    `}}Qc.styles=o`
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
  `,e([ue({attribute:!1})],Qc.prototype,"hass",void 0),ge("planavista-calendar-card-editor",Qc);class Zc extends de{constructor(){super(...arguments),this.layout="landscape",this.compact=!1,this.shape="landscape",this.timeFormat="12h",this.weather=null,this.weatherEntity="",this.today=null,this.chips=[],this._minute=Math.floor(Date.now()/6e4),this._timer=null}willUpdate(){this.shape="portrait"===this.layout&&this.compact?"phone":this.layout}updated(e){e.has("shape")&&void 0!==e.get("shape")&&this.renderRoot.querySelector(".row")?.animate({opacity:[0,1]},{duration:150,easing:"ease-out"})}connectedCallback(){super.connectedCallback(),this._minute=Math.floor(Date.now()/6e4),this._timer=setInterval(()=>{const e=Math.floor(Date.now()/6e4);e!==this._minute&&(this._minute=e)},1e3)}disconnectedCallback(){super.disconnectedCallback(),this._timer&&clearInterval(this._timer),this._timer=null}render(){const e=new Date,{time:t,ampm:s,date:i}=function(e,t){const s=String(e.getMinutes()).padStart(2,"0"),i=e.toLocaleDateString("en-US",{weekday:"long",month:"long",day:"numeric"});return"24h"===t?{time:`${e.getHours()}:${s}`,ampm:"",date:i}:{time:`${e.getHours()%12||12}:${s}`,ampm:e.getHours()>=12?"PM":"AM",date:i}}(e,this.timeFormat),a=U`<span class="time">${t}${s?U`<span class="ampm muted">${s}</span>`:Y}</span>`,n=this.chips.filter(e=>e.primary);if("portrait"===this.shape)return U`
        <div class="row">
          <div class="clock">${a}<div class="date">${i}</div></div>
          ${this._weather(40,"highlow")}
        </div>
        ${this._chips(this.chips)}
      `;if("phone"===this.shape){const t=e.toLocaleDateString("en-US",{weekday:"short",month:"short",day:"numeric"});return U`
        <div class="row">
          <div class="clock">${a}<span class="date muted">${t}</span></div>
          ${this._weather(24,"none")}
        </div>
        ${this._chips(n)}
      `}return U`
      <div class="row">
        <div class="left">${this._weather(32,"condition")}${this._chips(n)}</div>
        <div class="date">${i}</div>
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
    `}_openChip(e){e.open&&this.dispatchEvent(new CustomEvent("pv-open",{detail:e.open,bubbles:!0,composed:!0}))}_weather(e,t){const s=this.weather;if(!s)return U`<span></span>`;const i=Math.round(Number(s.attributes?.temperature??0)),a=this.today;return U`
      <button class="weather" type="button" aria-label="Weather details" @click=${this._details}>
        ${Ci(s.state||"cloudy",e)}
        <span class="weather-text">
          <span class="temp">${i}°</span>
          ${"condition"===t?U`<span class="condition muted">${(s.state||"").replace(/-/g," ")}</span>`:Y}
          ${"highlow"===t&&a?U`<span class="highlow muted">High ${a.high}°${null!==a.low?` · Low ${a.low}°`:""}</span>`:Y}
        </span>
      </button>
    `}_details(){this.weatherEntity&&this.dispatchEvent(new CustomEvent("hass-more-info",{detail:{entityId:this.weatherEntity},bubbles:!0,composed:!0}))}}Zc.styles=o`
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
    :host([shape='portrait']) .row {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      padding: 16px 20px 12px;
    }

    :host([shape='portrait']) .time {
      font-weight: 700;
      font-size: clamp(40px, 6cqi, 60px);
      line-height: 1;
      letter-spacing: -0.5px;
    }

    :host([shape='portrait']) .ampm {
      font-size: 0.4em;
      letter-spacing: 0;
    }

    :host([shape='portrait']) .date {
      font-size: clamp(16px, 2.2cqi, 22px);
      margin-top: 6px;
    }

    :host([shape='portrait']) .temp {
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

    :host([shape='portrait']) .chips {
      padding: 0 20px 14px;
    }

    :host([shape='phone']) .chips {
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
    :host([shape='phone']) .row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 14px;
    }

    :host([shape='phone']) .clock {
      display: flex;
      align-items: baseline;
      gap: 8px;
    }

    :host([shape='phone']) .time {
      font-weight: 700;
      font-size: 22px;
    }

    :host([shape='phone']) .date {
      font-weight: 700;
      font-size: 14px;
    }

    :host([shape='phone']) .temp {
      font-size: 18px;
    }
  `,e([ue({type:String,reflect:!0})],Zc.prototype,"layout",void 0),e([ue({type:Boolean})],Zc.prototype,"compact",void 0),e([ue({type:String,reflect:!0})],Zc.prototype,"shape",void 0),e([ue({attribute:!1})],Zc.prototype,"timeFormat",void 0),e([ue({attribute:!1})],Zc.prototype,"weather",void 0),e([ue({attribute:!1})],Zc.prototype,"weatherEntity",void 0),e([ue({attribute:!1})],Zc.prototype,"today",void 0),e([ue({attribute:!1})],Zc.prototype,"chips",void 0),e([me()],Zc.prototype,"_minute",void 0),ge("pv-glance-header",Zc);class eh extends de{constructor(){super(...arguments),this.layout="landscape",this._shape="row",this._menuOpen=!1,this._menuLeft=0,this._outside=e=>{e.composedPath().includes(this)||this._closeMenu(!1)},this.modules=[],this.activeModule="",this.views=[],this.activeView="",this.canOpenSettings=!1,this.actions=[]}connectedCallback(){super.connectedCallback(),this._observer=new ResizeObserver(()=>this._measure()),this._observer.observe(this)}disconnectedCallback(){super.disconnectedCallback(),this._observer?.disconnect(),document.removeEventListener("pointerdown",this._outside,!0)}willUpdate(e){this._menuOpen&&(e.has("activeModule")||e.has("_shape")&&"picker"!==this._shape)&&this._closeMenu(!1)}updated(e){super.updated(e),e.has("_shape")||this._measure(),this.toggleAttribute("wrapped","wrapped"===this._shape),e.has("_menuOpen")&&this._menuOpen&&this._showMenu()}_measure(){const e=this.renderRoot.querySelector("nav");if(!e||!e.clientWidth)return;const t=getComputedStyle(e),s=e.clientWidth-(parseFloat(t.paddingLeft)||0)-(parseFloat(t.paddingRight)||0),i=parseFloat(t.columnGap)||12,a=[...this.renderRoot.querySelectorAll(".views .view")],n=a.reduce((e,t)=>e+t.offsetWidth,0)+2*Math.max(0,a.length-1)+(a.length?8:0),o=this.renderRoot.querySelector(".picker"),r=[...e.children].filter(e=>!e.classList.contains("views")&&!e.classList.contains("picker")).map(e=>e.offsetWidth),l=a.length?function(e,t,s,i,a){return jc([...e,t],i,a)?"row":jc([...e,s],i,a)?"picker":"wrapped"}(r,n,o?.offsetWidth??0,i,s):"row";l!==this._shape&&(this._shape=l)}_toggleMenu(){this._menuOpen?this._closeMenu(!0):this._openMenu()}_openMenu(){const e=this.renderRoot.querySelector("button.picker");this._menuLeft=e?.offsetLeft??0,this._menuOpen=!0,document.addEventListener("pointerdown",this._outside,!0)}_closeMenu(e){this._menuOpen&&(this._menuOpen=!1,document.removeEventListener("pointerdown",this._outside,!0),e&&this.updateComplete.then(()=>this.renderRoot.querySelector("button.picker")?.focus()))}_showMenu(){const e=this.renderRoot.querySelector(".menu");if(!e)return;const t=this.clientWidth-8-e.offsetWidth;this._menuLeft>t&&(e.style.left=`${Math.max(8,t)}px`);const s=[...e.querySelectorAll(".item")];(s.find(e=>"true"===e.getAttribute("aria-checked"))??s[0])?.focus();const i="landscape"!==this.layout;if("reduced"===vi(this))e.animate([{opacity:0},{opacity:1}],{duration:120,easing:"ease-out"});else{const t=mi(ci);e.animate([{opacity:0,transform:`translateY(${i?8:-8}px) scale(0.96)`},{opacity:1,transform:"none"}],{duration:t.duration,easing:t.easing})}}_pickerKey(e){this._menuOpen||"ArrowUp"!==e.key&&"ArrowDown"!==e.key||(e.preventDefault(),this._openMenu())}_menuKey(e){const t=[...this.renderRoot.querySelectorAll(".menu .item")],s=this.renderRoot.querySelector(".menu .item:focus"),i=s?t.indexOf(s):0,a=function(e,t,s){if(s<=0)return"Escape"===e||"Tab"===e?"close":null;switch(e){case"ArrowDown":return(t+1)%s;case"ArrowUp":return(t-1+s)%s;case"Home":return 0;case"End":return s-1;case"Enter":case" ":return"choose";case"Escape":case"Tab":return"close";default:return null}}(e.key,i,t.length);if(null!==a){if("close"===a)return"Escape"===e.key&&e.preventDefault(),void this._closeMenu("Escape"===e.key);e.preventDefault(),"choose"===a?t[i]?.click():t[a]?.focus()}}_choose(e){this._closeMenu(!0),e!==this.activeView&&this._fire("pv-view-select",{id:e})}render(){return U`
      <nav aria-label="PlanaVista">
        ${this.modules.length>1?U`
          <div class="pv-seg modules" role="group" aria-label="Modules">
            ${this.modules.map(e=>U`
              <button type="button" aria-pressed=${e.id===this.activeModule?"true":"false"}
                @click=${()=>this._fire("pv-module-select",{id:e.id})}>${e.label}</button>
            `)}
          </div>
        `:Y}
        ${"picker"===this._shape?U`
          <button type="button" class="picker" aria-haspopup="menu" aria-expanded=${this._menuOpen?"true":"false"}
            aria-label=${`View: ${this._currentLabel()}`} @click=${this._toggleMenu} @keydown=${this._pickerKey}>
            <span>${this._currentLabel()}<ha-icon icon="mdi:unfold-more-horizontal" aria-hidden="true"></ha-icon></span>
          </button>
          <div class="views pv-seg measure" aria-hidden="true" inert>
            ${this.views.map(e=>U`<button type="button" class="view" tabindex="-1">${e.label}</button>`)}
          </div>
        `:U`
          <div class="views pv-seg" role="group" aria-label="Views">
            ${this.views.map(e=>U`
              <button type="button" class="view" aria-pressed=${e.id===this.activeView?"true":"false"}
                @click=${()=>this._fire("pv-view-select",{id:e.id})}>${e.label}</button>
            `)}
          </div>
          ${this.views.length?U`
            <span class="picker measure" aria-hidden="true">
              <span>${this._currentLabel()}<ha-icon icon="mdi:unfold-more-horizontal"></ha-icon></span>
            </span>
          `:Y}
        `}
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
      ${this._menuOpen?U`
        <div class="menu" role="menu" aria-label="Views" style=${`left: ${this._menuLeft}px`} @keydown=${this._menuKey}>
          ${this.views.map(e=>U`
            <button type="button" class="item" role="menuitemradio" aria-checked=${e.id===this.activeView?"true":"false"} tabindex="-1"
              @click=${()=>this._choose(e.id)}>
              <span>${e.label}</span>${e.id===this.activeView?U`<ha-icon icon="mdi:check" aria-hidden="true"></ha-icon>`:Y}
            </button>
          `)}
        </div>
      `:Y}
    `}_currentLabel(){return(this.views.find(e=>e.id===this.activeView)??this.views[0])?.label??""}_openSettings(e){e.currentTarget.dispatchEvent(new CustomEvent("pv-open-settings",{bubbles:!0,composed:!0}))}_fire(e,t){this.dispatchEvent(new CustomEvent(e,{detail:t,bubbles:!0,composed:!0}))}}eh.styles=[yi,o`
    :host {
      display: block;
      position: relative;
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
      min-height: 56px;
      gap: 12px;
      padding: 0 20px;
    }

    :host(:not([layout='landscape'])) nav {
      padding: 0 12px var(--safe-area-inset-bottom, env(safe-area-inset-bottom, 0px));
    }

    /* A phone's bar is one row: tighter gaps and switcher segments leave room for a module's buttons. */
    :host([layout='phone']) nav {
      gap: 8px;
    }

    :host([layout='phone']) .modules > button {
      padding: 0 11px;
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





    .actions {
      display: flex;
      align-items: center;
      gap: 6px;
      flex-shrink: 0;
    }

    /* Every bar button is a 48 px target, the short "+" too (review); the pill is drawn inside. */
    .action {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-width: 48px;
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

    /* The pop-up button: a one-segment track showing the current view, like the switcher beside it. */
    .picker {
      display: inline-flex;
      align-items: stretch;
      flex: 0 0 auto;
      height: 48px;
      padding: 0 4px;
      box-sizing: border-box;
      border-radius: 13px;
      background: var(--pv-seg, #ECECE8);
    }

    .picker > span {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      margin: 5px 0;
      padding: 0 8px 0 12px;
      border-radius: 9px;
      background: var(--pv-seg-on, #FFFFFF);
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.12);
      color: var(--pv-text, #1A1B1E);
      font-size: 0.875rem;
      font-weight: 650;
      white-space: nowrap;
      --mdc-icon-size: 18px;
    }

    .picker ha-icon {
      color: var(--pv-text-secondary, #5F6670);
    }

    button.picker:focus-visible {
      border-radius: 13px;
    }

    /* Copies kept only to measure (the segments while folded, the button while not). */
    .measure {
      position: absolute;
      top: 0;
      left: 0;
      visibility: hidden;
      pointer-events: none;
    }

    .menu {
      position: absolute;
      z-index: 5;
      bottom: calc(100% + 6px);
      min-width: 200px;
      padding: 6px;
      box-sizing: border-box;
      border-radius: 14px;
      border: 1px solid var(--pv-border, #E7E7E3);
      background: var(--pv-card-bg, #FFFFFF);
      box-shadow: 0 12px 32px rgba(0, 0, 0, 0.18);
      transform-origin: bottom left;
    }

    :host([layout='landscape']) .menu {
      bottom: auto;
      top: calc(100% + 6px);
      transform-origin: top left;
    }

    .item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      width: 100%;
      min-height: 48px;
      padding: 0 12px;
      box-sizing: border-box;
      border-radius: 9px;
      font-size: 1rem;
      font-weight: 600;
      color: var(--pv-text, #1A1B1E);
      text-align: left;
      --mdc-icon-size: 20px;
    }

    .item:hover,
    .item:focus-visible {
      background: var(--pv-seg, #ECECE8);
    }

    .item:focus-visible {
      outline-offset: -2px;
    }

    .item ha-icon {
      color: var(--pv-accent-ink, var(--pv-accent, #5B5BD6));
    }

    /* Two rows only when even the pop-up button won't fit: the switcher, buttons, and gear, then the views. */
    :host([wrapped]) nav {
      flex-wrap: wrap;
      row-gap: 0;
    }

    :host([wrapped]) .views {
      order: 1;
      flex: 1 0 100%;
      justify-content: space-around;
      overflow-x: visible;
      margin-left: 0;
    }
  `],e([ue({type:String,reflect:!0})],eh.prototype,"layout",void 0),e([me()],eh.prototype,"_shape",void 0),e([me()],eh.prototype,"_menuOpen",void 0),e([me()],eh.prototype,"_menuLeft",void 0),e([ue({attribute:!1})],eh.prototype,"modules",void 0),e([ue({attribute:!1})],eh.prototype,"activeModule",void 0),e([ue({attribute:!1})],eh.prototype,"views",void 0),e([ue({attribute:!1})],eh.prototype,"activeView",void 0),e([ue({type:Boolean})],eh.prototype,"canOpenSettings",void 0),e([ue({attribute:!1})],eh.prototype,"actions",void 0),ge("pv-nav-bar",eh);class th extends de{constructor(){super(...arguments),this.endsAt=0,this.color="currentColor",this.size=28,this.span=Kc,this.parent=!0,this._now=Date.now()}connectedCallback(){super.connectedCallback(),this._timer=window.setInterval(()=>{this._now=Date.now()},1e3)}disconnectedCallback(){super.disconnectedCallback(),window.clearInterval(this._timer)}render(){const e=Math.max(0,this.endsAt-this._now),t=Math.min(1,e/(this.span||Kc)),s=this.size/2,i=(this.size-3)/2,a=2*Math.PI*i,n=`${Jc(this.parent).ends} ${function(e){const t=10*Math.ceil(Math.ceil(Math.max(0,e)/1e3)/10),s=Math.floor(t/60),i=t%60;return s?i?`${s} min ${i} s`:`${s} min`:`${i} s`}(e)}`;return U`
      <svg width=${this.size} height=${this.size} viewBox="0 0 ${this.size} ${this.size}" role="img" aria-label=${n}>
        ${W`
          <circle class="track" cx=${s} cy=${s} r=${i} fill="none"
            stroke=${this.color} stroke-width=${3}></circle>
          <circle cx=${s} cy=${s} r=${i} fill="none" stroke=${this.color}
            stroke-width=${3} stroke-linecap="round"
            stroke-dasharray=${a} stroke-dashoffset=${a*(1-t)}></circle>
        `}
      </svg>
    `}}th.styles=o`
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
  `,e([ue({type:Number})],th.prototype,"endsAt",void 0),e([ue({type:String})],th.prototype,"color",void 0),e([ue({type:Number})],th.prototype,"size",void 0),e([ue({type:Number})],th.prototype,"span",void 0),e([ue({type:Boolean})],th.prototype,"parent",void 0),e([me()],th.prototype,"_now",void 0),ge("pv-session-ring",th);class sh extends de{constructor(){super(...arguments),this.endsAt=0,this.span=Kc,this.parent=!0,this.actions=[],this.kiosk=null}render(){const e=this.member;return e?U`
      <div class="strip" style="--strip-color: ${e.color}">
        <pv-member-avatar .member=${e} .hass=${this.hass} size="28"></pv-member-avatar>
        <span class="who">${e.name} <span class="mode">· ${Jc(this.parent).mode}</span></span>
        <pv-session-ring .endsAt=${this.endsAt} .span=${this.span} .parent=${this.parent} color=${e.color}></pv-session-ring>
        ${(this.parent?this.actions:[]).map(e=>U`
          <button class="pv-btn pv-btn-primary action" type="button" @click=${()=>this._action(e.id)}>
            ${e.glyph?`${e.glyph} `:""}${e.label}
          </button>
        `)}
        ${this.kiosk?U`
          <button class="pv-btn pv-btn-secondary kiosk" type="button" @click=${this._kiosk}>${"back"===this.kiosk?"Back to kiosk mode":"Exit kiosk mode"}</button>
        `:Y}
        <button class="pv-btn pv-btn-ghost lock" type="button" @click=${this._lock}>Lock</button>
      </div>
    `:Y}_action(e){this.dispatchEvent(new CustomEvent("pv-strip-action",{detail:{id:e},bubbles:!0,composed:!0}))}_kiosk(){this.dispatchEvent(new CustomEvent("pv-kiosk",{detail:{action:this.kiosk},bubbles:!0,composed:!0}))}_lock(){this.dispatchEvent(new CustomEvent("pv-lock",{bubbles:!0,composed:!0}))}}function ih(e,t,s){const i=[...e];if(t<0||t>=i.length||s<0||s>=i.length||t===s)return i;const[a]=i.splice(t,1);return i.splice(s,0,a),i}sh.styles=[ct,o`
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

      /* A secondary button on the strip's tint needs the person's color in its edge (review). */
      .kiosk {
        border-color: color-mix(in srgb, var(--strip-color) 55%, var(--pv-border, #E7E7E3));
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
    `],e([ue({attribute:!1})],sh.prototype,"member",void 0),e([ue({attribute:!1})],sh.prototype,"hass",void 0),e([ue({type:Number})],sh.prototype,"endsAt",void 0),e([ue({type:Number})],sh.prototype,"span",void 0),e([ue({type:Boolean})],sh.prototype,"parent",void 0),e([ue({attribute:!1})],sh.prototype,"actions",void 0),e([ue({attribute:!1})],sh.prototype,"kiosk",void 0),ge("pv-parent-strip",sh);class ah extends de{constructor(){super(...arguments),this.household=null,this.layout="landscape",this.mode="settings",this._order=null,this._dragging=null,this._dragMove=e=>{if(!this._dragging||!this._order)return;const t=[...this.renderRoot.querySelectorAll("li")].map(e=>{const t=e.getBoundingClientRect();return{top:t.top,height:t.height}}),s=function(e,t){if(0===t.length)return-1;const s=t.findIndex(t=>e<t.top+t.height/2);return s>=0?s:t.length-1}(e.clientY,t),i=this._order.indexOf(this._dragging);s>=0&&s!==i&&(this._order=ih(this._order,i,s))},this._dragEnd=()=>{if(!this._dragging||!this._order)return;const e=this._order;this._dragging=null,this._saveOrder(e)}}_members(){const e=ss(this.household?.members??[]);if(!this._order)return e;const t=new Map(e.map(e=>[e.id,e]));return this._order.map(e=>t.get(e)).filter(e=>!!e)}render(){const e=this._members(),t=!!this.household?.available;return U`
      <div class="head">
        <p class="lead">This is the order people appear in. Drag ≡ to change it.</p>
        ${t?U`<button class="pv-btn pv-btn-primary add" type="button" @click=${this._add}>+ New person</button>`:Y}
      </div>
      ${0===e.length?U`<p class="empty">No one here yet.</p>`:Y}
      <ul>
        ${e.map((e,s)=>U`
          <li class=${this._dragging===e.id?"dragging":""}>
            ${t?U`
              <button class="handle" type="button" aria-label="Move ${e.name}"
                @pointerdown=${t=>this._dragStart(t,e.id)}
                @pointermove=${this._dragMove}
                @pointerup=${this._dragEnd}
                @pointercancel=${this._dragEnd}
                @keydown=${e=>this._keyMove(e,s)}>≡</button>
            `:Y}
            <button class="open" type="button" @click=${()=>this._open(e)}>
              <pv-member-avatar .member=${e} .hass=${this.hass} size="40"></pv-member-avatar>
              <span class="text">
                <span class="name">${e.name}</span>
                <span class="summary">${function(e,t){const s=e.parent?["Parent",..."adult"===e.age_group?[]:[Jt[e.age_group]]]:[Jt[e.age_group]];e.has_pin&&s.push("PIN on");const i=os(e.id,t);return 0===i.length?s.push("no calendar"):1===i.length?s.push(`${e.name}'s calendar`):s.push(`${i.length} calendars`),s.join(" · ")}(e,this.data?.calendars??[])}</span>
              </span>
              <span class="chevron" aria-hidden="true">›</span>
            </button>
          </li>
        `)}
      </ul>
    `}_push(e){this.dispatchEvent(new CustomEvent(Ks,{detail:e,bubbles:!0,composed:!0}))}_open(e){this._push({tag:"pv-settings-person",title:e.name,back:"People",props:{memberId:e.id}})}_add(){this._push({tag:"pv-settings-person",title:"New person",back:"People",props:{memberId:null}})}_dragStart(e,t){e.currentTarget.setPointerCapture(e.pointerId),this._order=this._members().map(e=>e.id),this._dragging=t}_keyMove(e,t){if("ArrowUp"!==e.key&&"ArrowDown"!==e.key)return;e.preventDefault();const s=this._members().map(e=>e.id),i="ArrowUp"===e.key?t-1:t+1;i<0||i>=s.length||(this._order=ih(s,t,i),this._saveOrder(this._order).then(()=>{this.renderRoot.querySelectorAll(".handle")[i]?.focus()}))}async _saveOrder(e){const t=ss(this.household?.members??[]).map(e=>e.id);if(e.join()!==t.join())try{await this.api.reorder(e)}catch(e){this.dispatchEvent(new CustomEvent(Js,{detail:{message:ti(xa(e))},bubbles:!0,composed:!0}))}this._order=null}}ah.styles=[lt,ct,o`
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
    `],e([ue({attribute:!1})],ah.prototype,"hass",void 0),e([ue({attribute:!1})],ah.prototype,"data",void 0),e([ue({attribute:!1})],ah.prototype,"household",void 0),e([ue({attribute:!1})],ah.prototype,"api",void 0),e([ue({type:String})],ah.prototype,"layout",void 0),e([ue({type:String})],ah.prototype,"mode",void 0),e([me()],ah.prototype,"_order",void 0),e([me()],ah.prototype,"_dragging",void 0),ge("pv-settings-people",ah);const nh=["name","color","picture","age_group","parent","person","needs_ok_for","my_day","stars","goal","away","bedtime","sleep_hours","phones","notify"],oh={young_child:{my_day:"pictures",needs_ok_for:"all",stars:!0},older_child:{my_day:"list",needs_ok_for:"marked",stars:!0},teen:{my_day:"timeline",needs_ok_for:"marked",stars:!0},adult:{my_day:"timeline",needs_ok_for:"none",stars:!1}},rh={requests:!0,reminders:!1};function lh(e,t){return JSON.stringify(e)===JSON.stringify(t)}const dh={timeline:"Timeline",list:"List",pictures:"Pictures"},ch={all:"an OK for every chore",marked:"an OK for chores marked Needs an OK",none:"no OKs"};function hh(e,t,s){if(e){const t=e.notify??{};return{name:e.name,color:e.color,picture:e.picture,age_group:e.age_group,parent:e.parent,person:e.person,needs_ok_for:e.needs_ok_for,my_day:e.my_day,stars:e.stars,goal:e.goal??null,away:Array.isArray(e.away)?e.away:[],bedtime:e.bedtime??null,sleep_hours:e.sleep_hours??null,phones:Array.isArray(e.phones)?e.phones:[],notify:{...rh,...t}}}const i=rs(t),a=s.find(e=>!i.has(e.toUpperCase()))??s[0];return{name:"",color:a,picture:{initial:!0},age_group:"adult",parent:!1,person:null,...oh.adult,goal:null,away:[],bedtime:null,sleep_hours:null,phones:[],notify:{...rh}}}function ph(e,t,s){const i=hh(e,t,s);return{draft:i,start:i,rev:e?e.rev:null}}function uh(e,t){return!lh(e,t)}const mh=Da.PRESETS.map(e=>e.color);class vh extends de{constructor(){super(...arguments),this.household=null,this.layout="landscape",this.mode="settings",this.pageProps={},this.drafts=new Map,this.services={},this.revision=0,this._ageNote=null,this._rev=null,this._problem="",this._saving=!1,this._notice=null,this._loaded=!1,this._onSectionChange=e=>{e.stopPropagation(),this._change(e.detail)},this._announced=""}get _memberId(){return this.pageProps.memberId??null}get _member(){return this.household?.members.find(e=>e.id===this._memberId)??null}get _draftKey(){return this._memberId??"new"}willUpdate(){if(!this._loaded&&this.household){const e=this.drafts.get(this._draftKey);this._use(e??ph(this._member,this.household.members,mh)),this._loaded=!0}}_use(e){this._draft=e.draft,this._start=e.start,this._rev=e.rev}get _record(){return{draft:this._draft,start:this._start,rev:this._rev}}connectedCallback(){super.connectedCallback(),this.addEventListener(Ia,this._onSectionChange)}disconnectedCallback(){super.disconnectedCallback(),this._announced="",this.removeEventListener(Ia,this._onSectionChange)}confirmLeave(){return this._loaded&&uh(this._draft,this._start)?(this._notice="discard",new Promise(e=>{this._leave=e})):Promise.resolve(!0)}updated(){const e=null===this._memberId,t={label:e?"Add":"Save",ready:!(this._saving||!e&&!uh(this._draft,this._start)),save:()=>{this._save()},cancel:()=>this._cancel()},s=`${t.label}|${t.ready}`;s!==this._announced&&(this._announced=s,Qs(this,t))}render(){if(!this._loaded||!this.household)return Y;const e=this._member;if(null!==this._memberId&&!e)return U`<p class="gone">This person was removed on another screen.</p>`;const t=this._draft;return uh(t,this._start),U`
      <div class="top">
        <pv-member-avatar
          .member=${{name:t.name||"?",color:t.color,picture:t.picture,person:t.person}}
          .hass=${this.hass}
          size="64"
        ></pv-member-avatar>
      </div>
      ${this._problem?U`<p class="problem" role="alert">${this._problem}</p>`:Y}
      ${this._renderName()}
      ${this._renderColor()}
      ${this._renderPicture()}
      ${this._renderAgeGroup()}
      ${this._renderParent()}
      ${this._renderSections("role",e)}
      ${this._renderPin(e)}
      ${this._renderSections("pin",e)}
      ${this._renderHomeAssistant()}
      ${this._renderSections("links",e)}
      ${e?U`
        <button class="pv-btn pv-btn-secondary danger apart end-delete" type="button" @click=${()=>{this._notice="remove"}}>Remove from household</button>
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
    `}_renderColor(){const e=rs(this.household.members,this._memberId??void 0);return U`
      <fieldset class="field">
        <legend>Color</legend>
        <div class="swatches">
          ${Da.PRESETS.map(t=>{const s=e.get(t.color.toUpperCase()),i=this._draft.color.toUpperCase()===t.color.toUpperCase();return U`
              <button
                class="swatch"
                type="button"
                style="background:${t.color}"
                aria-pressed=${i?"true":"false"}
                aria-label=${s?`${t.name}, used by ${s.name}`:t.name}
                ?disabled=${!!s}
                @click=${()=>this._change({color:t.color})}
              >${s?is(s.name):""}</button>
            `})}
        </div>
      </fieldset>
    `}_personPicture(){const e=this._draft.person;return e?this.hass?.states?.[e]?.attributes?.entity_picture??null:null}_renderPicture(){const e=this._draft.picture,t="string"==typeof e.emoji?"emoji":e.person?"photo":"initial",s=this._personPicture(),i=!!this._draft.person,a=i&&!!s,n="photo"!==t||a?t:"initial",o=e=>this._change({picture:e});return U`
      <fieldset class="field">
        <legend>Picture</legend>
        <div class="pv-seg stretch" role="group" aria-label="Picture">
          <button type="button" aria-pressed=${"initial"===n?"true":"false"}
            @click=${()=>o({initial:!0})}>Initial</button>
          <button type="button" aria-pressed=${"emoji"===n?"true":"false"}
            @click=${()=>o({emoji:"string"==typeof e.emoji?e.emoji:"🙂"})}>Emoji</button>
          <button type="button" aria-pressed=${"photo"===n?"true":"false"} ?disabled=${!a}
            @click=${()=>o({person:!0})}>Photo</button>
        </div>
        ${"emoji"===t?U`
          <input class="pv-input emoji" type="text" maxlength="16" placeholder="Type or paste an emoji"
            aria-label="Emoji"
            .value=${String(e.emoji??"")}
            @input=${e=>o({emoji:e.target.value})} />
        `:Y}
        ${i?s?Y:U`<p class="hint">Their Home Assistant person has no photo yet. Add one there to use it here.</p>`:U`<p class="hint">Link a Home Assistant person to use their photo.</p>`}
      </fieldset>
    `}get _choresOn(){const e=this.household?.modules?.chores;return!0===e?.enabled}_renderAgeGroup(){return U`
      <fieldset class="field">
        <legend>Age group</legend>
        <div class="pv-choices">
          ${Xt.map(e=>{const t=this._choresOn?Qt[e.id]:e.hint;return U`
              <label class="pv-choice">
                <input type="radio" name="age-group" .checked=${this._draft.age_group===e.id}
                  @change=${()=>this._pickAgeGroup(e.id)} />
                <span class="choice-text"><span class="choice-title">${e.label}</span>${t?U`<span class="choice-sub">${t}</span>`:Y}</span>
                <span class="choice-check" aria-hidden="true">✓</span>
              </label>
            `})}
        </div>
        ${this._choresOn&&this._ageNote?U`<p class="hint" role="status">${this._ageNote}</p>`:Y}
      </fieldset>
    `}_pickAgeGroup(e){const t=function(e,t){return{...e,age_group:t,...oh[t]}}(this._draft,e);this._ageNote=function(e,t){const s=[];return e.my_day!==t.my_day&&s.push(dh[t.my_day]??t.my_day),e.needs_ok_for!==t.needs_ok_for&&s.push(ch[t.needs_ok_for]??t.needs_ok_for),e.stars!==t.stars&&s.push(t.stars?"earns stars":"no stars"),s.length?`Now ${1===s.length?s[0]:`${s.slice(0,-1).join(", ")}, and ${s[s.length-1]}`}.`:null}(this._draft,t),this._changeDraft(t)}_renderSections(e,t){const s={household:this.household,data:this.data,services:this.services};return qa.pages(s).filter(t=>t.slot===e).map(e=>{const s=Kd(e.tag);return Jd`
        <${s}
          .hass=${this.hass}
          .data=${this.data}
          .household=${this.household}
          .member=${t}
          .draft=${this._draft}
          .services=${this.services}
          .revision=${this.revision}
          .layout=${this.layout}
        ></${s}>
      `})}_renderParent(){const e=this._draft.parent,t=()=>this._change({parent:!e});return U`
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
    `}_renderHomeAssistant(){const e=this.household.members,t=new Set(e.filter(e=>e.id!==this._memberId&&e.person).map(e=>e.person)),s=Object.keys(this.hass?.states??{}).filter(e=>e.startsWith("person.")&&!t.has(e)).sort(),i=this._memberId?os(this._memberId,this.data?.calendars??[]):[];return U`
      <fieldset class="field">
        <legend>Home Assistant</legend>
        <label class="field">
          <span class="label">Person</span>
          <select class="pv-input pv-select" .value=${this._draft.person??""}
            @change=${e=>this._linkPerson(e.target.value)}>
            <option value="" ?selected=${!this._draft.person}>None</option>
            ${s.map(e=>U`
              <option value=${e} ?selected=${this._draft.person===e}>${this.hass.states[e]?.attributes?.friendly_name??e}</option>
            `)}
          </select>
        </label>
        <span class="label">Calendars</span>
        ${i.length?U`<ul class="calendars">${i.map(e=>U`<li>${e.display_name}</li>`)}</ul>`:U`<p class="hint">No calendars yet. Choose who each calendar belongs to in Calendars.</p>`}
      </fieldset>
    `}_renderNotice(e){return this._notice?"discard"===this._notice?U`
        <pv-notice-sheet .layout=${this.layout} heading="Discard changes?"
          .actions=${[{id:"discard",label:"Discard changes",kind:"destructive"},{id:"keep",label:"Keep editing",kind:"secondary"}]}
          @pv-sheet-action=${this._onDiscardChoice}></pv-notice-sheet>
      `:"remove"===this._notice&&e?U`
        <pv-notice-sheet .layout=${this.layout} heading="Remove ${e.name}?"
          body="Their calendars stay, and won't belong to anyone."
          .actions=${[{id:"remove",label:`Remove ${e.name}`,kind:"destructive"},{id:"cancel",label:"Cancel",kind:"secondary"}]}
          @pv-sheet-action=${this._onRemoveChoice}></pv-notice-sheet>
      `:U`
      <pv-notice-sheet .layout=${this.layout} heading="This changed on another screen."
        .actions=${[{id:"keep",label:"Keep editing",kind:"secondary"},{id:"load",label:"Load the new version",kind:"primary"}]}
        @pv-sheet-action=${this._onChangedChoice}></pv-notice-sheet>
    `:Y}_change(e){this._changeDraft({...this._draft,...e})}_changeDraft(e){this._draft=e,this._problem="",this.drafts.set(this._draftKey,this._record)}_linkPerson(e){const t=this._draft.picture;this._change({person:e||null,picture:!e&&t.person?{initial:!0}:this._draft.picture})}_pop(){this.dispatchEvent(new CustomEvent(Gs,{bubbles:!0,composed:!0}))}_cancel(){uh(this._draft,this._start)?this._notice="discard":this._pop()}async _save(){const e=function(e,t,s){const i=e.name.trim();if(!i)return"Add a name.";const a=t.filter(e=>e.id!==s);if(a.some(e=>e.name.toLocaleLowerCase()===i.toLocaleLowerCase()))return"Someone already has that name.";const n=a.find(t=>t.color.toUpperCase()===e.color.toUpperCase());return n?`${n.name} already has that color.`:e.away.some(e=>!e.from||!e.to||e.to<e.from)?"Pick the first and last days away.":null}(this._draft,this.household?.members??[],this._memberId);if(e)return void(this._problem=e);const t=this._member;if(null===this._rev||t){this._saving=!0;try{const e=t&&null!==this._rev?{id:t.id,rev:this._rev}:void 0;await this.api.saveMember(function(e){const t={};for(const s of nh)null!==e.rev&&lh(e.draft[s],e.start[s])||(t[s]=e.draft[s]);return"string"==typeof t.name&&(t.name=t.name.trim()),t}(this._record),e),this.drafts.delete(this._draftKey),this._start=this._draft,this._pop()}catch(e){const t=xa(e);"changed"===t?this._notice="changed":this._problem=e?.message||ti(t)}finally{this._saving=!1}}else this._problem="That person was removed on another screen."}_onDiscardChoice(e){e.stopPropagation(),this._notice=null;const t="discard"===e.detail.id;if(t&&(this.drafts.delete(this._draftKey),this._draft=this._start),this._leave){const e=this._leave;this._leave=void 0,e(t)}else t&&this._pop()}async _onRemoveChoice(e){e.stopPropagation(),this._notice=null;const t=this._member;if("remove"===e.detail.id&&t)try{await this.api.deleteMember(t.id),this.drafts.delete(this._draftKey),this._start=this._draft,this._pop()}catch(e){this._problem=e?.message||ti(xa(e))}}_onChangedChoice(e){e.stopPropagation(),this._notice=null;const t=this._member;this.household&&t&&("load"===e.detail.id?(this._use(ph(t,this.household.members,mh)),this.drafts.delete(this._draftKey)):(this._use(function(e,t,s){const i=hh(t,s,mh),a={...i};for(const t of nh)lh(e.draft[t],e.start[t])||(a[t]=e.draft[t]);return{draft:a,start:i,rev:t.rev}}(this._record,t,this.household.members)),this.drafts.set(this._draftKey,this._record)))}}vh.styles=[yi,fi,lt,ct,pt,o`
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
        font-size: 0.8125rem;
        font-weight: 750;
        color: var(--pv-text-secondary, #5F6670);
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





      .emoji {
        margin-top: 10px;
        max-width: 240px;
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

      /* The one delete in place (the sheets' danger button), across the end of the page (review). */
      .end-delete {
        width: 100%;
        margin-top: 24px;
      }

      .gone {
        color: var(--pv-text-secondary, #6B7280);
      }
    `],e([ue({attribute:!1})],vh.prototype,"hass",void 0),e([ue({attribute:!1})],vh.prototype,"data",void 0),e([ue({attribute:!1})],vh.prototype,"household",void 0),e([ue({attribute:!1})],vh.prototype,"api",void 0),e([ue({type:String})],vh.prototype,"layout",void 0),e([ue({type:String})],vh.prototype,"mode",void 0),e([ue({attribute:!1})],vh.prototype,"pageProps",void 0),e([ue({attribute:!1})],vh.prototype,"drafts",void 0),e([ue({attribute:!1})],vh.prototype,"services",void 0),e([ue({type:Number})],vh.prototype,"revision",void 0),e([me()],vh.prototype,"_draft",void 0),e([me()],vh.prototype,"_ageNote",void 0),e([me()],vh.prototype,"_start",void 0),e([me()],vh.prototype,"_problem",void 0),e([me()],vh.prototype,"_saving",void 0),e([me()],vh.prototype,"_notice",void 0),ge("pv-settings-person",vh);const gh={hidden:[".header { display: none !important; }",":host { --header-height: 0px; --pv-under-status-bar: var(--safe-area-inset-top, 0px); }"].join("\n"),tabs:".action-items { display: none !important; }"},bh={hidden:".header",tabs:".action-items"};const yh=[{value:30,label:"30 sec",spoken:"30 seconds"},{value:60,label:"1 min",spoken:"1 minute"},{value:120,label:"2 min",spoken:"2 minutes"},{value:300,label:"5 min",spoken:"5 minutes"}],fh=[{value:"hidden",label:"Hidden",spoken:"Hidden"},{value:"tabs",label:"Tabs only",spoken:"Tabs only"}],_h=[{value:5,label:"5 min",spoken:"5 minutes"},{value:10,label:"10 min",spoken:"10 minutes"},{value:15,label:"15 min",spoken:"15 minutes"},{value:30,label:"30 min",spoken:"30 minutes"}];class wh extends de{constructor(){super(...arguments),this.household=null,this.layout="landscape",this.mode="settings",this.session=null,this._message="",this._busy=!1,this._toggleShared=()=>{this.household&&this._run(()=>this.api.setSharedScreen(!this.household.account.shared))},this._toggleKiosk=()=>{const e=this.household?.security.kiosk;this.household&&this._run(()=>this.api.saveSecurity({kiosk_enabled:!e?.enabled}))},this._toggleShuffle=()=>{this.household&&this._run(()=>this.api.saveSecurity({shuffle_keypad:!this.household.security.shuffle_keypad}))}}render(){const e=this.household;if(!e)return Y;const t=e.account,s=e.security.shared_screens>0,i=e.security.kiosk??{enabled:!1,top_bar:"hidden"},a=function(e,t){return!(!t?.parent||!t.adminParent)||e.is_admin&&!e.shared}(t,this.session);return U`
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

      ${s?U`
        <section>
          <h2>Shared screens</h2>
          ${this._switch("Kiosk mode","kiosk-label",i.enabled,this._toggleKiosk,!a)}
          <p class="hint">
            On shared family screens, PlanaVista hides Home Assistant's menus so the screen stays on
            PlanaVista. A parent who is a Home Assistant admin can exit it in parent mode, and it comes
            back when parent mode ends. It tidies the screen, but it isn't a lock: for that, use
            Guided Access on an iPad or a kiosk browser on Android.
          </p>
          ${a?Y:U`<p class="hint">Only a Home Assistant admin, or a parent who is one, can change kiosk mode.</p>`}
          ${i.enabled?this._choices("Top bar","top-bar-label",fh,i.top_bar,e=>this.api.saveSecurity({kiosk_top_bar:e}),!a):Y}
          ${i.enabled?U`
            <p class="hint">Hidden: PlanaVista fills the screen. Tabs only: the dashboard's tabs stay, for other screens the family uses.</p>
          `:Y}
        </section>
      `:Y}

      <section>
        <h2>PINs</h2>
        ${ss(e.members).map(t=>U`
          <div class="person">
            <pv-member-avatar .member=${t} .hass=${this.hass} size="32"></pv-member-avatar>
            <span class="name">${t.name}</span>
            <pv-pin-actions
              .hass=${this.hass}
              .api=${this.api}
              .layout=${this.layout}
              .member=${t}
              .shuffle=${e.security.shuffle_keypad}
              .sharedScreens=${s}
            ></pv-pin-actions>
          </div>
        `)}
      </section>

      <section>
        ${this._switch("Shuffle the keypad","shuffle-label",e.security.shuffle_keypad,this._toggleShuffle)}
        <p class="hint">The numbers move each time, so smudges and glances don't give a PIN away.</p>
      </section>

      <section>
        ${this._choices("Lock after no touches","idle-label",yh,e.security.session_idle_seconds??120,e=>this.api.saveSecurity({session_idle_seconds:e}))}
        <p class="hint">After a PIN, the screen locks again once nobody has touched it this long.</p>
        ${this._choices("Parent mode ends after","cap-label",_h,e.security.parent_mode_minutes??10,e=>this.api.saveSecurity({parent_mode_minutes:e}))}
        <p class="hint">However busy the screen is, parent mode and a child's unlocked time end this long after the PIN.</p>
      </section>

      <p class="rule">
        After 5 wrong tries, a PIN pauses for 30 seconds, and each pause after that is twice as
        long, up to 15 minutes. A parent can clear a pause here. Forgot every parent's PIN? Sign in
        to Home Assistant with a parent's or an admin's own account and set new ones here.
      </p>
    `}_switch(e,t,s,i,a=!1){const n=a?()=>{}:i;return U`
      <div class="toggle-row">
        <span class="label" id=${t}>${e}</span>
        <div
          class="pv-toggle ${s?"active":""}"
          role="switch"
          tabindex="0"
          aria-checked=${s?"true":"false"}
          aria-labelledby=${t}
          aria-disabled=${this._busy||a?"true":"false"}
          @click=${n}
          @keydown=${e=>{"Enter"!==e.key&&" "!==e.key||(e.preventDefault(),n())}}
        ></div>
      </div>
    `}_choices(e,t,s,i,a,n=!1){const o=(e,t)=>{e!==i&&this._run(()=>a(e)),this.updateComplete.then(()=>t?.querySelector(`[data-value='${e}']`)?.focus())};return U`
      <div class="choice-row">
        <span class="label" id=${t}>${e}</span>
        <div class="pv-seg" role="radiogroup" aria-labelledby=${t} @keydown=${e=>{const t="ArrowRight"===e.key||"ArrowDown"===e.key?1:"ArrowLeft"===e.key||"ArrowUp"===e.key?-1:0;if(!t)return;e.preventDefault();const a=Math.max(0,s.findIndex(e=>e.value===i));o(s[(a+t+s.length)%s.length].value,e.currentTarget)}}>
          ${s.map(e=>U`
            <button type="button" role="radio" data-value=${e.value} aria-label=${e.spoken}
              aria-checked=${e.value===i?"true":"false"}
              tabindex=${e.value===i?"0":"-1"}
              ?disabled=${this._busy||n}
              @click=${()=>o(e.value)}>${e.label}</button>
          `)}
        </div>
      </div>
    `}async _run(e){if(!this._busy){this._busy=!0,this._message="";try{await e()}catch(e){this._message=e?.message||ti(xa(e))}finally{this._busy=!1}}}}wh.styles=[lt,ct,pt,yi,o`
      :host {
        display: block;
        max-width: 640px;
      }

      section {
        margin: 0 0 28px;
      }

      h2 {
        margin: 0 0 10px;
        font-size: 0.8125rem;
        font-weight: 750;
        color: var(--pv-text-secondary, #5F6670);
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

      .choice-row {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        justify-content: space-between;
        gap: 8px 12px;
        min-height: 48px;
        margin-top: 16px;
      }

      .choice-row:first-of-type {
        margin-top: 0;
      }

      .rule {
        font-size: 0.875rem;
        color: var(--pv-text-secondary, #6B7280);
        line-height: 1.6;
      }
    `],e([ue({attribute:!1})],wh.prototype,"hass",void 0),e([ue({attribute:!1})],wh.prototype,"data",void 0),e([ue({attribute:!1})],wh.prototype,"household",void 0),e([ue({attribute:!1})],wh.prototype,"api",void 0),e([ue({type:String})],wh.prototype,"layout",void 0),e([ue({type:String})],wh.prototype,"mode",void 0),e([ue({attribute:!1})],wh.prototype,"session",void 0),e([me()],wh.prototype,"_message",void 0),e([me()],wh.prototype,"_busy",void 0),ge("pv-settings-pins",wh);class xh extends de{render(){return U`
      <p class="name">PlanaVista</p>
      <p class="version">Version ${Nc}</p>
      <ul>
        <li><a href="https://github.com/tavenhall1/planavista" target="_blank" rel="noopener noreferrer">Project on GitHub</a></li>
        <li><a href="https://github.com/tavenhall1/planavista/issues" target="_blank" rel="noopener noreferrer">Report a problem</a></li>
      </ul>
    `}}xh.styles=[lt,o`
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
    `],ge("pv-settings-about",xh);class $h{constructor(e){this._host=e,this._watched=null,this._unsubscribe=null,this._fallback=new ec(()=>e.requestUpdate()),e.addController(this)}get edits(){return this._host.drafts?.get("appearance")??this._fallback}hostConnected(){this._watch()}hostUpdate(){this._watch()}hostDisconnected(){this._unsubscribe?.(),this._unsubscribe=null,this._watched=null,this.edits.flush()}current(){return this.edits.current(bc(this._host.data?.display))}set(e,t){this.edits.set(e,e=>this._host.api.saveConfig({display:e}),e=>this._error(e),function(e){if(!e)return;const t=e;if("number"==typeof t.clientX&&t.detail>0)return{x:t.clientX,y:t.clientY};const s=e.currentTarget;if(!s?.getBoundingClientRect)return;const i=s.getBoundingClientRect();return{x:i.left+i.width/2,y:i.top+i.height/2}}(t))}_watch(){const e=this.edits;e!==this._watched&&(this._unsubscribe?.(),this._watched=e,this._unsubscribe=e.subscribe(()=>this._host.requestUpdate()))}_error(e){this._host.dispatchEvent(new CustomEvent(Js,{detail:{message:ti(xa(e))},bubbles:!0,composed:!0}))}}const kh={background:{min:4.5,message:e=>`Text is hard to read on the ${e} background.`,ratio:e=>Ue(e["--pv-text"],e["--pv-card-bg"]),fix:(e,t)=>et(e["--pv-bg"],e["--pv-text"],t)},accent:{min:3,message:e=>`The ${e} accent is hard to see on this background.`,ratio:e=>Ue(e["--pv-accent"],e["--pv-card-bg"]),fix:(e,t)=>et(e["--pv-accent"],e["--pv-card-bg"],t)},header:{min:4.5,message:e=>`Text on the ${e} header is hard to read.`,ratio:e=>Le(e["--pv-header-gradient"])?Ue(e["--pv-header-text"],e["--pv-header-gradient"]):null,fix:(e,t)=>et(e["--pv-header-gradient"],e["--pv-header-text"],t)},now_color:{min:3,message:e=>`The ${e} now line is hard to see on this background.`,ratio:e=>Ue(e["--pv-now-color"],e["--pv-card-bg"]),fix:(e,t)=>et(e["--pv-now-color"],e["--pv-card-bg"],t)}},Eh=Object.keys(kh);function Fh(e,t){const s=e.ratio(t);return null!==s&&s<e.min}function Ch(e,t,s,i){return{...e,[t]:{...e[t],[s]:i}}}function Sh(e,t){const s="light"===t?e.light:e.dark;return Eh.filter(i=>void 0!==s[i]||"dark"===t&&void 0!==e.light[i])}const Dh=[{key:"accent",label:"Accent",token:"--pv-accent"},{key:"background",label:"Background",token:"--pv-bg"},{key:"header",label:"Header",token:"--pv-header-gradient"},{key:"now_color",label:"Now line",token:"--pv-now-color"}],Ah=[{key:"plain",label:"Plain"},{key:"gradient_purple",label:"Purple"},{key:"gradient_teal",label:"Teal"},{key:"gradient_sunset",label:"Sunset"},{key:"solid_accent",label:"Accent"},{key:"solid_dark",label:"Dark"}],Mh={light:"Light",dark:"Dark"},Th=[{key:"corner_style",label:"Corners",options:[["","Theme"],["sharp","Sharp"],["rounded","Rounded"],["pill","Pill"]]},{key:"shadow_depth",label:"Shadows",options:[["","Theme"],["none","None"],["subtle","Subtle"],["bold","Bold"]]},{key:"event_style",label:"Events",options:[["stripes","Stripes"],["solid","Solid"]]}];class zh extends de{constructor(){super(...arguments),this.household=null,this.layout="landscape",this.mode="settings",this.drafts=new Map,this._open=null,this._confirmReset=!1,this._page=new $h(this),this._onResetChoice=e=>{e.stopPropagation(),this._confirmReset=!1,"reset"===e.detail.id&&(this._open=null,this._page.set({colors_light:{},colors_dark:{}}))}}render(){if(!this.data)return Y;const e=this._page.current(),t=yc(e),s=function(e){const t=[];for(const s of["light","dark"]){const i=xs(e,s);for(const a of Sh(e,s)){const n=kh[a];if(Fh(n,i))for(const o of[0,.5,1,1.5,2,3]){const r=n.fix(i,n.min+o);if(r&&!Fh(n,xs(Ch(e,s,a,r),s))){t.push({mode:s,key:a,message:n.message(s),fix:r});break}}}}return t}(t),i=lc[e.theme_pair],a=Object.keys(e.colors_light).length+Object.keys(e.colors_dark).length>0;return U`
      <section>
        <h2 class="section-heading">Colors</h2>
        <div class="issues" aria-live="polite">${s.map(e=>U`
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
          @click=${()=>{this._confirmReset=!0}}>Reset ${i} to its original colors</button>
      </section>
      ${this._confirmReset?U`
        <pv-notice-sheet
          .layout=${this.layout}
          heading=${`Reset ${i} to its original colors?`}
          body="Your light and dark colors go back to the theme's own. Corners, shadows, and the other shape settings stay."
          .actions=${[{id:"cancel",label:"Cancel",kind:"secondary"},{id:"reset",label:"Reset",kind:"destructive"}]}
          @pv-sheet-action=${this._onResetChoice}
        ></pv-notice-sheet>
      `:Y}
    `}_renderColors(e){const t={light:xs(e,"light"),dark:xs(e,"dark")};return U`
      <table>
        <thead>
          <tr><td></td><th scope="col">Light</th><th scope="col">Dark</th></tr>
        </thead>
        <tbody>
          ${Dh.map(s=>U`
            <tr>
              <th scope="row">${s.label}</th>
              ${["light","dark"].map(i=>{const a=this._open?.key===s.key&&this._open.mode===i,n=this._caption(e,i,s.key);return U`
                  <td>
                    <button class="cell" type="button" aria-expanded=${a?"true":"false"}
                      aria-label=${`${s.label}, ${Mh[i]}: ${n}`}
                      @click=${()=>{this._open=a?null:{key:s.key,mode:i}}}>
                      <span class="swatch" style="background: ${t[i][s.token]}"></span>
                      <span class="caption">${n}</span>
                    </button>
                  </td>
                `})}
            </tr>
            ${this._open?.key===s.key?U`
              <tr>
                <td colspan="3">${this._renderEditor(e,this._open.mode,s.key)}</td>
              </tr>
            `:Y}
          `)}
        </tbody>
      </table>
    `}_caption(e,t,s){const i=e[t][s];if(void 0===i)return"dark"===t&&void 0!==e.light[s]?"Matched":"Original";if("header"===s){const e=Ah.find(e=>e.key===i);if(e)return e.label}return i.toUpperCase()}_renderEditor(e,t,s){const i=e[t][s],a="light"===t?"Original":"Matched",n=i&&i.startsWith("#")?i:"";return U`
      <div class="editor">
        <div class="pv-seg" role="group" aria-label=${`${Dh.find(e=>e.key===s)?.label} for ${Mh[t]}`}>
          <button type="button"
            aria-pressed=${void 0===i?"true":"false"}
            @click=${e=>this._setColor(t,s,void 0,e)}>${a}</button>
          ${"header"===s?Ah.map(e=>U`
            <button type="button"
              aria-pressed=${i===e.key?"true":"false"}
              @click=${i=>this._setColor(t,s,e.key,i)}>${e.label}</button>
          `):Y}
        </div>
        <pv-color-swatch-picker
          .value=${n}
          @color-change=${e=>{e.stopPropagation(),this._setColor(t,s,e.detail.color,e)}}
        ></pv-color-swatch-picker>
      </div>
    `}_renderShape(e){const t=e.avatar_border??"primary",s="primary"!==t&&"white"!==t&&"light"!==t;return U`
      <div class="shape">
        ${Th.map(t=>{const s=e[t.key]??("event_style"===t.key?"stripes":"");return U`
            <div>
              <span class="shape-label">${t.label}</span>
              <div class="pv-seg" role="group" aria-label=${t.label}>
                ${t.options.map(([e,i])=>U`
                  <button type="button"
                    aria-pressed=${s===e?"true":"false"}
                    @click=${s=>this._setShape({[t.key]:e||void 0},s)}>${i}</button>
                `)}
              </div>
            </div>
          `})}
        <div>
          <span class="shape-label">Avatar border</span>
          <div class="pv-seg" role="group" aria-label="Avatar border">
            <button type="button"
              aria-pressed=${"primary"===t?"true":"false"}
              @click=${e=>this._setShape({avatar_border:"primary"},e)}>Their color</button>
            <button type="button"
              aria-pressed=${"white"===t||"light"===t?"true":"false"}
              @click=${e=>this._setShape({avatar_border:"white"},e)}>White</button>
            <button type="button"
              aria-pressed=${s?"true":"false"}
              @click=${e=>this._setShape({avatar_border:s?t:"#4D8FD9"},e)}>Custom</button>
          </div>
          ${s?U`
            <label class="border-custom">
              <input type="color" .value=${t}
                @input=${e=>this._setShape({avatar_border:e.target.value},e)}>
              <span>${t.toUpperCase()}</span>
            </label>
          `:Y}
        </div>
      </div>
    `}_setColor(e,t,s,i){const a=this._page.current(),n={..."light"===e?a.colors_light:a.colors_dark};void 0===s?delete n[t]:n[t]=s,this._page.set("light"===e?{colors_light:n}:{colors_dark:n},i)}_setShape(e,t){this._page.set({shape:{...this._page.current().shape,...e}},t)}}zh.styles=[yi,ct,pt,_a,o`
      :host {
        display: block;
      }

      section + section {
        margin-top: 26px;
      }

      .section-heading {
        margin: 0 0 10px;
        font-size: 0.8125rem;
        font-weight: 750;
        color: var(--pv-text-secondary, #5F6670);
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

      .editor .pv-seg {
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
    `],e([ue({attribute:!1})],zh.prototype,"hass",void 0),e([ue({attribute:!1})],zh.prototype,"data",void 0),e([ue({attribute:!1})],zh.prototype,"household",void 0),e([ue({attribute:!1})],zh.prototype,"api",void 0),e([ue({type:String,reflect:!0})],zh.prototype,"layout",void 0),e([ue({type:String})],zh.prototype,"mode",void 0),e([ue({attribute:!1})],zh.prototype,"drafts",void 0),e([me()],zh.prototype,"_open",void 0),e([me()],zh.prototype,"_confirmReset",void 0),ge("pv-settings-customize",zh);const Ph=["#4D8FD9","#F3722C","#43AA8B"],Oh={sun:"",schedule:"",home_assistant:"Each screen follows its own Home Assistant theme setting. Handy for phones."};function Bh(e,t){const s=[`--p-page: ${e["--pv-bg"]}`,`--p-card: ${e["--pv-card-bg"]}`,`--p-header: ${e["--pv-header-gradient"]}`,`--p-accent: ${e["--pv-accent"]}`,`--p-line: ${e["--pv-border"]}`].join("; ");return U`
    <span class="pic" style=${s}>
      <span class="pic-header"></span>
      <span class="pic-bar"><span class="pic-tab"></span></span>
      <span class="pic-cols">
        ${Ph.map(e=>U`<span class="pic-col" style="--p-person: ${$s(e,void 0,t).color}"></span>`)}
      </span>
    </span>
  `}class Nh extends de{constructor(){super(...arguments),this.household=null,this.layout="landscape",this.mode="settings",this.drafts=new Map,this._page=new $h(this)}render(){if(!this.data)return Y;const e=this._page.current(),t=yc(e);return U`
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
              <span class="row-title">Customize ${lc[e.theme_pair]}</span>
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
    `}_heading(e,t){return U`<h2 class="section-heading" id=${t}>${e}</h2>`}_renderModes(e,t){const s=xs(e,"light"),i=xs(e,"dark");return U`
      <div class="modes" role="radiogroup" aria-label="Appearance"
        @keydown=${e=>this._arrows(e,ic,t,t=>this._page.set({appearance:t},e))}>
        ${ic.map(e=>U`
          <button class="mode-option" type="button" role="radio" data-value=${e}
            aria-checked=${e===t?"true":"false"}
            tabindex=${e===t?"0":"-1"}
            @click=${t=>this._page.set({appearance:e},t)}>
            <span class="frame">
              ${"automatic"===e?U`<span class="pic-pair split">${Bh(s,"light")}<span class="pic-over">${Bh(i,"dark")}</span></span>`:Bh("dark"===e?i:s,"dark"===e?"dark":"light")}
              <span class="badge" aria-hidden="true">✓</span>
            </span>
            <span class="option-label">${rc[e]}</span>
          </button>
        `)}
      </div>
    `}_renderSwitch(e,t,s){const i=tc(this.hass?.states),a="24h"===this.data.display?.time_format?"24h":"12h",n=i?function(e,t,s){if(!e)return null;const i=xc(e.next_rising,t),a=xc(e.next_setting,t);if(!i||!a)return null;if("below_horizon"===e.state)return`Light at ${Fc(i,s)}, dark again at ${Fc(a,s)}.`;const n=function(e,t){return e.getFullYear()===t.getFullYear()&&e.getMonth()===t.getMonth()&&e.getDate()===t.getDate()}(a,t)?" tonight":"";return`Dark at ${Fc(a,s)}${n}, light again at ${Fc(i,s)}.`}(i,new Date,a)??"Uses your home's location in Home Assistant.":"Home Assistant's Sun integration isn't set up, so the schedule's times are used until it is.",o={...Oh,sun:n};return U`
      <div class="pv-choices" role="radiogroup" aria-labelledby="switch-heading">
        ${ac.map(t=>U`
          <label class="pv-choice">
            <input type="radio" name="appearance-switch" .checked=${t===e}
              @change=${e=>this._page.set({appearance_switch:t},e)} />
            <span class="choice-text">
              <span class="choice-title">${dc[t]}</span>
              ${o[t]?U`<span class="choice-sub">${o[t]}</span>`:Y}
            </span>
            <span class="choice-check" aria-hidden="true">✓</span>
          </label>
        `)}
      </div>
      ${"schedule"===e?U`
        <div class="times">
          <label>Light from
            <pv-time-field  .format=${"24h"===this.data.display?.time_format?"24h":"12h"} .value=${t}
              @change=${e=>this._time("light_from",e)}></pv-time-field>
          </label>
          <label>Dark from
            <pv-time-field  .format=${"24h"===this.data.display?.time_format?"24h":"12h"} .value=${s}
              @change=${e=>this._time("dark_from",e)}></pv-time-field>
          </label>
        </div>
      `:Y}
    `}_renderThemes(e){return U`
      <div class="themes" role="radiogroup" aria-labelledby="theme-heading"
        @keydown=${t=>this._arrows(t,nc,e.pair,e=>this._page.set({theme_pair:e},t))}>
        ${nc.map(t=>{const s={...e,pair:t};return U`
            <button class="theme" type="button" role="radio" data-value=${t}
              aria-checked=${t===e.pair?"true":"false"}
              tabindex=${t===e.pair?"0":"-1"}
              @click=${e=>this._page.set({theme_pair:t},e)}>
              <span class="pic-pair halves">
                ${Bh(xs(s,"light"),"light")}
                <span class="pic-over">${Bh(xs(s,"dark"),"dark")}</span>
              </span>
              <span class="option-label">${lc[t]}</span>
              <span class="badge" aria-hidden="true">✓</span>
            </button>
          `})}
      </div>
    `}_renderMotion(e){return U`
      <div class="pv-seg" role="radiogroup" aria-labelledby="motion-heading"
        @keydown=${t=>this._arrows(t,oc,e,e=>this._page.set({motion:e},t))}>
        ${oc.map(t=>U`
          <button type="button" role="radio" data-value=${t}
            aria-checked=${t===e?"true":"false"}
            tabindex=${t===e?"0":"-1"}
            @click=${e=>this._page.set({motion:t},e)}>${cc[t]}</button>
        `)}
      </div>
    `}_arrows(e,t,s,i){if("radio"!==e.target.getAttribute?.("role"))return;const a="ArrowRight"===e.key||"ArrowDown"===e.key?1:"ArrowLeft"===e.key||"ArrowUp"===e.key?-1:0;if(!a)return;e.preventDefault();const n=Math.max(0,t.indexOf(s)),o=t[(n+a+t.length)%t.length];i(o);const r=e.currentTarget;this.updateComplete.then(()=>r.querySelector(`[data-value='${o}']`)?.focus())}_time(e,t){const s=t.target.value.slice(0,5);/^([01]\d|2[0-3]):[0-5]\d$/.test(s)&&this._page.set("light_from"===e?{light_from:s}:{dark_from:s},t)}_customize(e){const t={tag:"pv-settings-customize",title:`Customize ${lc[e]}`,back:"Appearance"};this.dispatchEvent(new CustomEvent(Ks,{detail:t,bubbles:!0,composed:!0}))}}Nh.styles=[fi,yi,ct,pt,_a,o`
      :host {
        display: block;
      }

      section + section {
        margin-top: 28px;
      }

      .section-heading {
        margin: 0 0 10px;
        font-size: 0.8125rem;
        font-weight: 750;
        color: var(--pv-text-secondary, #5F6670);
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



    `],e([ue({attribute:!1})],Nh.prototype,"hass",void 0),e([ue({attribute:!1})],Nh.prototype,"data",void 0),e([ue({attribute:!1})],Nh.prototype,"household",void 0),e([ue({attribute:!1})],Nh.prototype,"api",void 0),e([ue({type:String,reflect:!0})],Nh.prototype,"layout",void 0),e([ue({type:String})],Nh.prototype,"mode",void 0),e([ue({attribute:!1})],Nh.prototype,"drafts",void 0),ge("pv-appearance-editor",Nh);class Rh extends de{constructor(){super(...arguments),this.household=null,this.layout="landscape",this.mode="settings",this.drafts=new Map}render(){return U`
      <pv-appearance-editor
        .hass=${this.hass}
        .data=${this.data}
        .household=${this.household}
        .api=${this.api}
        .layout=${this.layout}
        .drafts=${this.drafts}
        mode="settings"
      ></pv-appearance-editor>
    `}}Rh.styles=o`
    :host {
      display: block;
    }
  `,e([ue({attribute:!1})],Rh.prototype,"hass",void 0),e([ue({attribute:!1})],Rh.prototype,"data",void 0),e([ue({attribute:!1})],Rh.prototype,"household",void 0),e([ue({attribute:!1})],Rh.prototype,"api",void 0),e([ue({type:String})],Rh.prototype,"layout",void 0),e([ue({type:String})],Rh.prototype,"mode",void 0),e([ue({attribute:!1})],Rh.prototype,"drafts",void 0),ge("pv-settings-appearance",Rh);class Ih extends de{constructor(){super(...arguments),this.household=null,this.layout="landscape",this.session=null,this.sessionEndsAt=0,this.sessionSpan=0,this.kioskAction=null,this.parent=null,this.drafts=new Map,this.services={},this.revision=0,this.target=null,this._selected=null,this._stack=[],this._toast="",this._editor=null,this._back=async()=>{await this._mayLeave()&&(this._stack.length>0?this._stack=this._stack.slice(0,-1):this._selected=null)},this._done=async()=>{await this._mayLeave()&&this.dispatchEvent(new CustomEvent("pv-settings-close",{bubbles:!0,composed:!0}))},this._onPush=e=>{e.stopPropagation(),this._stack=[...this._stack,e.detail]},this._onPop=e=>{e.stopPropagation(),this._stack=this._stack.slice(0,-1)},this._onOpen=e=>{e.stopPropagation(),this._openTarget(e.detail)},this._onEditor=e=>{e.stopPropagation(),this._editor=e.detail},this._onError=e=>{e.stopPropagation(),this._toast=e.detail.message,window.clearTimeout(this._toastTimer),this._toastTimer=window.setTimeout(()=>{this._toast=""},4e3)}}connectedCallback(){super.connectedCallback(),this.addEventListener(Ks,this._onPush),this.addEventListener(Gs,this._onPop),this.addEventListener(Js,this._onError),this.addEventListener(Zs,this._onOpen),this.addEventListener(Xs,this._onEditor)}disconnectedCallback(){super.disconnectedCallback(),this.removeEventListener(Ks,this._onPush),this.removeEventListener(Gs,this._onPop),this.removeEventListener(Js,this._onError),this.removeEventListener(Zs,this._onOpen),this.removeEventListener(Xs,this._onEditor),window.clearTimeout(this._toastTimer)}willUpdate(e){if((e.has("_stack")||e.has("_selected"))&&(this._editor=null),e.has("target")&&this.target){const e=(t=La.pages(this._context()),(s=this.target)&&t.some(e=>e.id===s.page)?{selected:s.page,stack:s.stack??[]}:{selected:null,stack:[]});this._selected=e.selected,this._stack=e.stack}var t,s}_context(){return{household:this.household,data:this.data,services:this.services,hass:this.hass}}get _split(){return"landscape"===this.layout}_current(e){return e.find(e=>e.id===this._selected)??(this._split?e[0]:void 0)}render(){const e=La.pages(this._context()),t=this._current(e),s=this._stack[this._stack.length-1],i=!this._split&&t;return U`
      ${this.session?.parent&&this.parent?U`
        <pv-parent-strip .member=${this.parent} .hass=${this.hass} .endsAt=${this.sessionEndsAt} .span=${this.sessionSpan} .kiosk=${this.kioskAction}></pv-parent-strip>
      `:Y}
      <div class="bar">
        ${i&&this._editor?U`<button class="pv-btn pv-btn-ghost cancel" type="button" @click=${()=>this._editor?.cancel()}>Cancel</button>`:i?U`<button class="back" type="button" @click=${this._back}>‹ ${s?s.back:"Settings"}</button>`:U`<h1 class="title">Settings</h1>`}
        ${this._editor?U`
          <div class="editor-actions">
            ${i?Y:U`<button class="pv-btn pv-btn-ghost cancel" type="button" @click=${()=>this._editor?.cancel()}>Cancel</button>`}
            <button class="pv-btn pv-btn-primary save" type="button" ?disabled=${!this._editor.ready}
              @click=${()=>this._editor?.save()}>${this._editor.label}</button>
          </div>
        `:U`<button class="pv-btn pv-btn-ghost done" type="button" @click=${this._done}>Done</button>`}
      </div>
      <div class="body">
        ${this._split||!t?this._renderList(e,t):Y}
        ${t?this._renderPage(t,s):Y}
      </div>
      <pv-toast .toast=${this._toast?{id:this._toast,text:this._toast,tone:"bad"}:null}></pv-toast>
    `}_renderList(e,t){const s=this._context(),i=function(e,t){return e.flatMap(e=>(e.needsALook?.(t)??[]).map(t=>({...t,page:t.page??e.id})))}(e,s);return U`
      <nav class="list" aria-label="Settings">
        ${i.length?U`
          <section class="group">
            <h2 class="group-label">Needs a look</h2>
            ${i.map(e=>U`
              <button class="row look-row" type="button" @click=${()=>this._look(e)}>
                <span class="look-icon" aria-hidden="true">!</span>
                <span class="row-text"><span class="look-text">${e.text}</span></span>
                <span class="chevron" aria-hidden="true">›</span>
              </button>
            `)}
          </section>
        `:Y}
        ${function(e,t=Na){const s=new Set(t.map(e=>e.id)),i=[...new Set(e.map(e=>e.group).filter(e=>!s.has(e)))].map(e=>({id:e,label:null,order:1e3}));return[...t,...i].sort((e,t)=>e.order-t.order).map(t=>({group:t,pages:e.filter(e=>e.group===t.id)})).filter(e=>e.pages.length>0)}(e).map(({group:e,pages:i})=>U`
          <section class="group">
            ${e.label?U`<h2 class="group-label">${e.label}</h2>`:Y}
            ${i.map(e=>{const i=this._split&&t?.id===e.id;return U`
                <button class="row ${i?"row--active":""}" type="button"
                  aria-current=${i?"page":"false"}
                  @click=${()=>this._select(e.id)}>
                  <span class="row-text">
                    <span class="row-label">${e.label}</span>
                    ${e.summary?U`<span class="row-value">${e.summary(s)}</span>`:Y}
                  </span>
                  <span class="chevron" aria-hidden="true">›</span>
                </button>
              `})}
          </section>
        `)}
      </nav>
    `}_renderPage(e,t){const s=Kd(t?t.tag:e.tag),i=t?t.title:e.label,a=[e.id,...this._stack.map(e=>`${e.tag}:${JSON.stringify(e.props??{})}`)].join("/");return U`
      <section class="page" aria-label=${i}>
        ${this._split&&t?U`<button class="back" type="button" @click=${this._back}>‹ ${t.back}</button>`:Y}
        <h1 class="page-heading">${i}</h1>
        ${this.household&&!this.household.available?U`<p class="banner">People and PINs can't be changed until PlanaVista is updated.</p>`:Y}
        ${Ct(a,Jd`
          <${s}
            class="page-el"
            .hass=${this.hass}
            .data=${this.data}
            .household=${this.household}
            .api=${this.api}
            .layout=${this.layout}
            .session=${this.session}
            mode="settings"
            .pageProps=${t?.props??{}}
            .drafts=${this.drafts}
            .services=${this.services}
            .revision=${this.revision}
          ></${s}>
        `)}
      </section>
    `}async _mayLeave(){const e=this.renderRoot.querySelector(".page-el");return!e?.confirmLeave||e.confirmLeave()}async _select(e){e===this._selected&&0===this._stack.length||await this._mayLeave()&&(this._stack=[],this._selected=e)}async _look(e){await this._mayLeave()&&(this._selected=e.page,this._stack=e.stack??[])}async _openTarget(e){await this._mayLeave()&&this.dispatchEvent(new CustomEvent("pv-settings-open-target",{detail:e,bubbles:!0,composed:!0}))}}function Lh(e,t){if(!e||!t.setup&&!t.modules)return e;const s={...e.modules};for(const[e,i]of Object.entries(t.modules??{}))s[e]={...s[e]??{},...i};return{...e,setup:{...e.setup,...t.setup??{}},modules:s}}Ih.styles=[lt,ct,o`
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

      .done,
      .cancel,
      .save {
        min-height: 48px;
        min-width: 88px;
      }

      .done,
      .cancel {
        color: var(--pv-accent-ink, #5B5BD6);
        font-weight: 700;
      }

      .editor-actions {
        display: flex;
        gap: 8px;
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
        margin-bottom: 10px;
      }

      .group-label {
        margin: 8px 12px 4px;
        font-size: 0.8125rem;
        font-weight: 750;
        color: var(--pv-text-secondary, #5F6670);
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

      /* Compact, so the page list fits a landscape screen 800 px tall (milestone 8); the whole list scrolls. */
      .look-row {
        align-items: flex-start;
        min-height: 48px;
        padding: 6px 12px;
        background: color-mix(in srgb, #F59E0B 12%, transparent);
      }

      .look-row:hover {
        background: color-mix(in srgb, #F59E0B 18%, transparent);
      }

      .look-row + .look-row {
        margin-top: 6px;
      }

      .look-icon {
        flex-shrink: 0;
        display: grid;
        place-items: center;
        width: 24px;
        height: 24px;
        margin-top: 1px;
        border-radius: 50%;
        background: #B45309;
        color: #FFFFFF;
        font-size: 0.875rem;
        font-weight: 800;
      }

      .look-text {
        display: -webkit-box;
        -webkit-box-orient: vertical;
        -webkit-line-clamp: 2;
        overflow: hidden;
        font-size: 0.875rem;
        line-height: 1.35;
      }

      .look-row .chevron {
        align-self: center;
      }

      .page {
        flex: 1;
        min-width: 0;
        box-sizing: border-box;
        overflow-y: auto;
        padding: 12px 20px 40px;
      }

      /* Every page the same column (milestone 8): 640 px at most, from the left. */
      .page-el {
        display: block;
        max-width: 640px;
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

    `],e([ue({attribute:!1})],Ih.prototype,"hass",void 0),e([ue({attribute:!1})],Ih.prototype,"data",void 0),e([ue({attribute:!1})],Ih.prototype,"household",void 0),e([ue({attribute:!1})],Ih.prototype,"api",void 0),e([ue({type:String,reflect:!0})],Ih.prototype,"layout",void 0),e([ue({attribute:!1})],Ih.prototype,"session",void 0),e([ue({type:Number})],Ih.prototype,"sessionEndsAt",void 0),e([ue({type:Number})],Ih.prototype,"sessionSpan",void 0),e([ue({attribute:!1})],Ih.prototype,"kioskAction",void 0),e([ue({attribute:!1})],Ih.prototype,"parent",void 0),e([ue({attribute:!1})],Ih.prototype,"drafts",void 0),e([ue({attribute:!1})],Ih.prototype,"services",void 0),e([ue({type:Number})],Ih.prototype,"revision",void 0),e([ue({attribute:!1})],Ih.prototype,"target",void 0),e([me()],Ih.prototype,"_selected",void 0),e([me()],Ih.prototype,"_stack",void 0),e([me()],Ih.prototype,"_toast",void 0),e([me()],Ih.prototype,"_editor",void 0),ge("pv-settings",Ih);const qh=["#F94144","#277DA1","#43AA8B","#F9C74F"],Hh=[["👥","Everyone who lives here","Each person gets a color, even kids without a Home Assistant account."],["📅","Your calendars","Each one belongs to someone, so the day reads at a glance."],["✓","Chores, if you want them","From your household plan, or a few common ones."]];class jh extends de{constructor(){super(...arguments),this.household=null}async secondary(){return await this.api.saveSetup({start:"restore"}),this.setupPatch={setup:{start:"restore"}},!0}async commit(){return"restore"===this.household?.setup.start&&(await this.api.saveSetup({start:null}),this.setupPatch={setup:{start:null}}),!0}render(){const e=2*Math.PI*30;return U`
      <div class="rings" aria-hidden="true">
        ${qh.map(t=>U`
          <svg width=${72} height=${72} viewBox="0 0 ${72} ${72}">
            ${W`
              <circle cx="36" cy="36" r=${30} fill="none" stroke=${t} stroke-width="8" opacity="0.2"></circle>
              <circle cx="36" cy="36" r=${30} fill="none" stroke=${t} stroke-width="8"
                stroke-linecap="round" stroke-dasharray=${e} stroke-dashoffset=${.25*e}></circle>
            `}
          </svg>
        `)}
      </div>
      <ul>
        ${Hh.map(([e,t,s])=>U`
          <li><span class="icon" aria-hidden="true">${e}</span><span><span class="title">${t}</span><span class="text">${s}</span></span></li>
        `)}
      </ul>
      <p class="note">About 5 minutes. Everything can change later in Settings.</p>
    `}}jh.styles=o`
    :host {
      display: block;
    }

    .rings {
      display: flex;
      justify-content: center;
      gap: 18px;
      margin: 8px 0 20px;
    }

    svg {
      transform: rotate(-90deg);
    }

    ul {
      list-style: none;
      margin: 0 0 18px;
      padding: 0;
      display: grid;
      gap: 14px;
    }

    li {
      display: flex;
      gap: 14px;
      align-items: flex-start;
    }

    .icon {
      flex-shrink: 0;
      width: 40px;
      height: 40px;
      display: grid;
      place-items: center;
      border-radius: 12px;
      background: color-mix(in srgb, var(--pv-text, #1A1B1E) 6%, transparent);
      font-size: 1.125rem;
    }

    .title {
      display: block;
      font-weight: 600;
    }

    .text {
      font-size: 0.9375rem;
      color: var(--pv-text-secondary, #6B7280);
    }

    .note {
      margin: 0;
      font-size: 0.875rem;
      color: var(--pv-text-secondary, #6B7280);
      text-align: center;
    }
  `,e([ue({attribute:!1})],jh.prototype,"api",void 0),e([ue({attribute:!1})],jh.prototype,"household",void 0),ge("pv-setup-welcome",jh);class Uh extends de{constructor(){super(...arguments),this.household=null,this.layout="landscape",this.mode="setup",this._rows=[],this._name="",this._message="",this._built=!1,this._added=0,this._add=()=>{var e,t;this._name.trim()&&(this._rows=[...this._rows,(e=this._name,t=this._added++,{key:`new:${t}`,name:e.trim(),person:null,memberId:null,role:"adult",checked:!0})],this._name="")}}willUpdate(){if(!this._built&&this.hass&&this.household){const e=Object.values(this.hass.states).filter(e=>e.entity_id.startsWith("person.")).map(e=>({entity_id:e.entity_id,name:e.attributes.friendly_name??e.entity_id,user_id:e.attributes.user_id??null})).sort((e,t)=>e.name.localeCompare(t.name));this._rows=function(e,t,s){const i=e.map(e=>({key:e.id,name:e.name,person:e.person,memberId:e.id,role:es(e),checked:!0}));for(const a of t){if(e.some(e=>e.person===a.entity_id))continue;const t=!!s&&a.user_id===s;i.push({key:a.entity_id,name:a.name,person:a.entity_id,memberId:null,role:t?"parent":"adult",checked:!0})}return i}(this.household.members,e,this.hass.user?.id??null),this._built=!0}}async commit(){const e=this.household?.members??[],t=function(e,t){const s={add:[],update:[],remove:[]};for(const i of e){const e=i.memberId?t.find(e=>e.id===i.memberId):void 0;e?i.checked?i.role!==es(e)&&s.update.push({id:e.id,changes:ts(i.role)}):s.remove.push(e.id):i.checked&&i.name.trim()&&s.add.push({name:i.name.trim(),...ts(i.role),...i.person?{person:i.person}:{}})}return s}(this._rows,e);this._message="";try{for(const e of t.remove)await this.api.deleteMember(e);for(const{id:s,changes:i}of t.update){const t=e.find(e=>e.id===s);await this.api.saveMember(i,t?{id:s,rev:t.rev}:void 0)}for(const e of t.add)await this.api.saveMember(e);return!0}catch(e){return this._message=e?.message||ti(xa(e)),!1}finally{this._built=!1,this.requestUpdate()}}render(){return U`
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
              ${Zt.map(t=>U`<option value=${t.id} ?selected=${e.role===t.id}>${t.label}</option>`)}
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
        <button class="pv-btn pv-btn-secondary" type="button" ?disabled=${!this._name.trim()} @click=${this._add}>+ New person</button>
      </div>
      ${this._message?U`<p class="message" role="alert">${this._message}</p>`:Y}
    `}_update(e,t){this._rows=this._rows.map((s,i)=>i===e?{...s,...t}:s)}}Uh.styles=[lt,ct,pt,o`
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
        min-height: 48px;
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
    `],e([ue({attribute:!1})],Uh.prototype,"hass",void 0),e([ue({attribute:!1})],Uh.prototype,"data",void 0),e([ue({attribute:!1})],Uh.prototype,"household",void 0),e([ue({attribute:!1})],Uh.prototype,"api",void 0),e([ue({type:String})],Uh.prototype,"layout",void 0),e([ue({type:String})],Uh.prototype,"mode",void 0),e([me()],Uh.prototype,"_rows",void 0),e([me()],Uh.prototype,"_name",void 0),e([me()],Uh.prototype,"_message",void 0),ge("pv-setup-people",Uh);class Wh extends de{constructor(){super(...arguments),this.household=null,this.layout="landscape",this.mode="setup",this.drafts=new Map}render(){return U`
      <pv-appearance-editor
        .hass=${this.hass}
        .data=${this.data}
        .household=${this.household}
        .api=${this.api}
        .layout=${this.layout}
        .drafts=${this.drafts}
        mode="setup"
      ></pv-appearance-editor>
    `}}function Vh(e,t,s){const i={};return"12"===t?.time_format&&(i.time_format="12h"),"24"===t?.time_format&&(i.time_format="24h"),"monday"!==t?.first_weekday&&"sunday"!==t?.first_weekday||(i.first_day=t.first_weekday),!e.weather_entity&&s.length>0&&(i.weather_entity=[...s].sort()[0]),i}Wh.styles=o`
    :host {
      display: block;
    }
  `,e([ue({attribute:!1})],Wh.prototype,"hass",void 0),e([ue({attribute:!1})],Wh.prototype,"data",void 0),e([ue({attribute:!1})],Wh.prototype,"household",void 0),e([ue({attribute:!1})],Wh.prototype,"api",void 0),e([ue({type:String})],Wh.prototype,"layout",void 0),e([ue({type:String})],Wh.prototype,"mode",void 0),e([ue({attribute:!1})],Wh.prototype,"drafts",void 0),ge("pv-setup-look",Wh);class Yh extends de{constructor(){super(...arguments),this.household=null,this.layout="landscape",this.mode="setup",this.services={},this.revision=0,this._message=""}_parts(){return Ha.pages({household:this.household,data:this.data,services:this.services})}get primaryLabel(){return this._parts()[0]?.primary}get openModule(){return this._parts()[0]?.module}async commit(){this._message="";try{const e=Object.keys(this.hass.states).filter(e=>e.startsWith("weather.")),t=this.hass.locale;return await this.api.saveConfig({display:Vh(this.data.display,t,e),onboarding_complete:!0}),await this.api.saveSetup({completed:!0,step:null}),!0}catch(e){return this._message=ti(xa(e)),!1}}render(){const e=this._parts();return U`
      ${e.length?e.map(e=>{const t=Kd(e.tag);return Jd`<${t} .hass=${this.hass} .household=${this.household} .services=${this.services}
          .revision=${this.revision} .layout=${this.layout}></${t}>`}):U`
        <ul>
          <li>Tap the gear to change anything later.</li>
          <li>On a shared screen, Settings asks for a parent's PIN.</li>
        </ul>
      `}
      ${this._message?U`<p class="message" role="alert">${this._message}</p>`:Y}
    `}}Yh.styles=[lt,o`
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
    `],e([ue({attribute:!1})],Yh.prototype,"hass",void 0),e([ue({attribute:!1})],Yh.prototype,"data",void 0),e([ue({attribute:!1})],Yh.prototype,"household",void 0),e([ue({attribute:!1})],Yh.prototype,"api",void 0),e([ue({type:String})],Yh.prototype,"layout",void 0),e([ue({type:String})],Yh.prototype,"mode",void 0),e([ue({attribute:!1})],Yh.prototype,"services",void 0),e([ue({type:Number})],Yh.prototype,"revision",void 0),e([me()],Yh.prototype,"_message",void 0),ge("pv-setup-done",Yh);class Kh extends de{constructor(){super(...arguments),this.household=null,this.layout="landscape",this.drafts=new Map,this.services={},this.revision=0,this.session=null,this.only=null,this.cancelLabel="",this._index=0,this._busy=!1,this._toast="",this._patch={},this._started=!1,this._onStepChange=e=>{e.stopPropagation(),this.requestUpdate()},this._next=async()=>{if(this._busy)return;const e=this._element,t=this._currentId();this._busy=!0;try{if(e?.commit&&!await e.commit())return;this._take(e),this._advance(e,t)}finally{this._busy=!1}},this._leave=async()=>{if(this._busy)return;const e=this._element;this._busy=!0;try{if(e?.secondary&&!await e.secondary())return}finally{this._busy=!1}this.dispatchEvent(new CustomEvent("pv-setup-cancel",{bubbles:!0,composed:!0}))},this._secondary=async()=>{if(this._busy)return;const e=this._element,t=this._currentId();this._busy=!0;try{if(e?.secondary&&!await e.secondary())return;this._take(e),this._advance(e,t)}finally{this._busy=!1}},this._skip=()=>{this._busy||this._advance(this._element,this._currentId())},this._back=()=>{0===this._index||this._busy||(this._index-=1,this._remember(this._steps()[this._index].id))}}connectedCallback(){super.connectedCallback(),this.addEventListener(Ra,this._onStepChange)}disconnectedCallback(){super.disconnectedCallback(),this.removeEventListener(Ra,this._onStepChange),window.clearTimeout(this._toastTimer)}willUpdate(){!this._started&&this.data&&(this.only&&(this._patch={setup:{start:null}}),this._index=this.only?0:function(e,t){const s=t?e.findIndex(e=>e.id===t):-1;return s>=0?s:0}(this._steps(),this.household?.setup.step??null),this._started=!0)}_context(){return{household:Lh(this.household,this._patch),data:this.data,services:this.services}}_steps(){return e=ja.pages(this._context()),(t=this.only)?e.filter(e=>t.includes(e.id)):e;var e,t}get _element(){return this.renderRoot?.querySelector(".step-el")??null}_take(e){e?.setupPatch&&(this._patch=function(e,t){if(!t)return e;const s={...e.modules??{}};for(const[e,i]of Object.entries(t.modules??{}))s[e]={...s[e]??{},...i};return{setup:{...e.setup??{},...t.setup??{}},modules:s}}(this._patch,e.setupPatch))}render(){const e=this._steps();if(0===e.length)return Y;const t=Math.min(this._index,e.length-1),s=e[t],i=t===e.length-1,a=Kd(s.tag),n=this._element,o=!!this.only,{label:r,ready:l}=function(e,t,{last:s,short:i}){const a=t&&t.step===e.id?t:null;return{label:a?.primaryLabel??(i&&s?e.finish:void 0)??e.primary??(s?"Finish":"Next"),ready:!1!==a?.ready}}(s,n?{step:n.dataset.step,primaryLabel:n.primaryLabel,ready:n.ready}:null,{last:i,short:o}),d=this._context(),c=0===t&&o&&!!this.cancelLabel,h=0===t&&!c,p=o?void 0:s.secondary;return U`
      <div class="top">
        <button class="back ${h?"hidden":""}" type="button"
          ?disabled=${h||this._busy}
          aria-hidden=${h?"true":"false"}
          @click=${c?this._leave:this._back}>‹ ${c?this.cancelLabel:"Back"}</button>
        <div class="progress-dots" role="img" aria-label="Step ${t+1} of ${e.length}">
          ${e.map((e,s)=>U`<div class="dot ${s===t?"dot--active":""}"></div>`)}
        </div>
        ${s.skip?U`<button class="skip" type="button" ?disabled=${this._busy} @click=${this._skip}>Skip</button>`:U`<span></span>`}
      </div>
      <div class="content">
        <div class="column ${s.wide?"wide":""}">
          <h1 class="heading">${s.heading}</h1>
          ${s.lead?U`<p class="lead">${s.lead}</p>`:Y}
          ${Ct(s.id,Jd`
            <${a}
              class="step-el"
              data-step=${s.id}
              .hass=${this.hass}
              .data=${this.data}
              .household=${d.household}
              .api=${this.api}
              .layout=${this.layout}
              .drafts=${this.drafts}
              .services=${this.services}
              .revision=${this.revision}
              .pinGate=${this.pinGate}
              .session=${this.session}
              mode="setup"
            ></${a}>
          `)}
        </div>
      </div>
      <div class="bottom">
        <button class="pv-btn pv-btn-primary main" type="button" ?disabled=${this._busy||!l} @click=${this._next}>
          ${r}
        </button>
        ${p?U`
          <button class="second" type="button" ?disabled=${this._busy} @click=${this._secondary}>${p}</button>
        `:Y}
      </div>
      <pv-toast .toast=${this._toast?{id:this._toast,text:this._toast,tone:"bad"}:null}></pv-toast>
    `}updated(){const e=this._element;e&&!e._hostSeen&&(e._hostSeen=!0,this.requestUpdate())}_currentId(){const e=this._steps();return e[Math.min(this._index,e.length-1)]?.id}_advance(e,t){const s=this._steps(),i=function(e,t){const s=Math.max(0,e.findIndex(e=>e.id===t));return s>=e.length-1?null:s+1}(s,t);if(null===i){const i=e?.openModule??s.find(e=>e.id===t)?.module;return void this.dispatchEvent(new CustomEvent("onboarding-complete",{detail:{module:i},bubbles:!0,composed:!0}))}this._index=i,this._remember(s[i].id)}_remember(e){this.only||this.api.saveSetup({step:e}).catch(e=>{this._toast=ti(xa(e)),window.clearTimeout(this._toastTimer),this._toastTimer=window.setTimeout(()=>{this._toast=""},4e3)})}}Kh.styles=[lt,ct,o`
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

      .column.wide {
        max-width: 1040px;
      }

      .bottom {
        flex-direction: column;
        align-items: center;
        gap: 4px;
      }

      .second {
        min-height: 48px;
        border: none;
        background: transparent;
        color: var(--pv-accent-ink, var(--pv-accent, #6366F1));
        font: inherit;
        font-weight: 600;
        cursor: pointer;
      }

      .skip {
        justify-self: end;
        min-height: 48px;
        padding: 0 8px;
        border: none;
        background: transparent;
        color: var(--pv-text-secondary, #6B7280);
        font: inherit;
        cursor: pointer;
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
    `],e([ue({attribute:!1})],Kh.prototype,"hass",void 0),e([ue({attribute:!1})],Kh.prototype,"data",void 0),e([ue({attribute:!1})],Kh.prototype,"household",void 0),e([ue({attribute:!1})],Kh.prototype,"api",void 0),e([ue({type:String,reflect:!0})],Kh.prototype,"layout",void 0),e([ue({attribute:!1})],Kh.prototype,"drafts",void 0),e([ue({attribute:!1})],Kh.prototype,"services",void 0),e([ue({type:Number})],Kh.prototype,"revision",void 0),e([ue({attribute:!1})],Kh.prototype,"pinGate",void 0),e([ue({attribute:!1})],Kh.prototype,"session",void 0),e([ue({attribute:!1})],Kh.prototype,"only",void 0),e([ue({type:String})],Kh.prototype,"cancelLabel",void 0),e([me()],Kh.prototype,"_index",void 0),e([me()],Kh.prototype,"_busy",void 0),e([me()],Kh.prototype,"_toast",void 0),e([me()],Kh.prototype,"_patch",void 0),ge("pv-setup",Kh);const Gh="planavista.place",Jh=36e5;function Xh(e){if(Array.isArray(e))return`[${e.map(Xh).join(",")}]`;if(e&&"object"==typeof e){const t=Object.entries(e).sort(([e],[t])=>e.localeCompare(t));return`{${t.map(([e,t])=>`${JSON.stringify(e)}:${Xh(t)}`).join(",")}}`}return JSON.stringify(e)??"null"}function Qh(e){if(!e)return{};try{const t=JSON.parse(e);return t&&"object"==typeof t&&!Array.isArray(t)?t:{}}catch{return{}}}function Zh(e){if(!e||"object"!=typeof e)return null;const{module:t,views:s,at:i}=e;if("string"!=typeof t||"number"!=typeof i||!s||"object"!=typeof s)return null;const a=Object.fromEntries(Object.entries(s).filter(([,e])=>"string"==typeof e));return{module:t,views:a,at:i}}const ep="100dvh";function tp(e,t,s){if(!s)return()=>{};const i=e.style[t];return e.style[t]=ep,()=>{e.style[t]===ep&&(e.style[t]=i)}}const sp={root:()=>function(){const e=document.querySelector("home-assistant"),t=e?.shadowRoot?.querySelector("home-assistant-main"),s=t?.shadowRoot?.querySelector("ha-panel-lovelace");return s?.shadowRoot?.querySelector("hui-root")?.shadowRoot??null}(),has:(e,t)=>null!==e.querySelector(t),addSheet:(e,t)=>{const s=e,i=new CSSStyleSheet;return i.replaceSync(t),s.adoptedStyleSheets=[...s.adoptedStyleSheets,i],{set:e=>i.replaceSync(e),remove:()=>{s.adoptedStyleSheets=s.adoptedStyleSheets.filter(e=>e!==i)}}},setHaKiosk:e=>window.dispatchEvent(new CustomEvent("hass-kiosk-mode",{detail:{enable:e}})),haKiosk:()=>!0===document.querySelector("home-assistant")?.hass?.kioskMode},ip=new class{constructor(e){this._env=e,this._view=null,this._stepOut=null,this._applied=null,this._haOn=!1,this._last={look:"off",out:!1},this._listeners=new Set}get look(){return function(e){const t=e?.security.kiosk;return e?.account.shared&&t?.enabled?"tabs"===t.top_bar?"tabs":"hidden":"off"}(this._view)}get steppedOut(){return null!==this._stepOut}onChange(e){return this._listeners.add(e),()=>this._listeners.delete(e)}setView(e){this._view=e,"off"===this.look?this._stepOut=null:this._stepOut&&e&&(this._stepOut=function(e,t,s){const i=t?1e3*t:e.idleMs,a=s&&void 0!==e.startedAt?e.startedAt+6e4*s:e.capAt;return i===e.idleMs&&a===e.capAt?e:{...e,idleMs:i,capAt:a}}(this._stepOut,e.security.session_idle_seconds,e.security.parent_mode_minutes)),this.sync()}lift(e,t,s,i){"off"!==this.look&&(this._stepOut=function(e,t,s,i){return{lastTouch:e,idleMs:t,capAt:s,startedAt:i}}(e,t,s,i),this.sync())}restore(){this._stepOut&&(this._stepOut=null,this.sync())}touch(e){this._stepOut&&(this._stepOut=function(e,t){return{...e,lastTouch:t}}(this._stepOut,e))}tick(e){this._stepOut&&function(e,t){return t>=function(e){return Math.min(e.lastTouch+e.idleMs,e.capAt)}(e)}(this._stepOut,e)&&this.restore()}sync(){const e=this.look,t="off"!==e&&!this._stepOut,s=t?this._env.root():null,i=s&&"off"!==e&&this._env.has(s,bh[e])?s:null;if(!this._applied||t&&this._applied.root===i||(this._applied.handle.remove(),this._applied=null),t&&i){const t=gh[e];this._applied?this._applied.css!==t&&(this._applied.handle.set(t),this._applied.css=t):this._applied={root:i,handle:this._env.addSheet(i,t),css:t}}t&&!this._env.haKiosk()&&(this._env.setHaKiosk(!0),this._haOn=!0),!t&&this._haOn&&(this._env.setHaKiosk(!1),this._haOn=!1);const a={look:e,out:!!this._stepOut};a.look===this._last.look&&a.out===this._last.out||(this._last=a,this._listeners.forEach(e=>e()))}}(sp),ap="__planavistaKiosk",np="sensor.planavista_config";class op extends de{constructor(){super(),this.isPanel=!1,this._toast=null,this._wizardOpen=!1,this._onboardingDone=!1,this._settingsOpen=!1,this._settingsTarget=null,this._flow=null,this._sheet=null,this._sheetOpener=null,this._drafts=new Map,this._settingsVia=null,this._views={},this._moduleId=null,this._remembered=null,this._placeKey="",this._placeApplied=!1,this._compactHeader=!1,this._headerHeights=new ji,this._openTarget=null,this._serviceRevision=0,this._household=new qc(this),this._session=new Xc(this,()=>this._api),this._layout=new Vc(this),this._forecast=new Hc(this,()=>this._display().weather_entity),this._appearanceEdits=new ec(()=>this.requestUpdate()),this._moduleOverlay=!1,this._appearance=new Bc(this,this._appearanceEdits,()=>({display:this.hass?.states?.[this._entityId()]?.attributes?.display,cardTheme:this._config?.theme,sun:tc(this.hass?.states),haDark:!!this.hass?.themes?.darkMode,overlayOpen:!!this._sheet||this._settingsOpen||this._wizardOpen||!!this._flow||this._moduleOverlay}),async()=>{await this.updateComplete,await(this.renderRoot.querySelector(".pv-module")?.updateComplete)}),this._api=new Ca({callWS:e=>this.hass.callWS(e)},()=>this._session.token,e=>this._session.ended(e),e=>this._session.used(e)),this._services={},this._pinGate={ask:(e,t,s)=>new Promise(i=>{0===e.length||this._sheet?i(!1):(this._sheetOpener=this.renderRoot?.activeElement??null,this._sheet={kind:"pin",purpose:"module",heading:t,reason:s,members:e,resolve:i})})},this._dataFor=Dt((e,t)=>this.hass?function(e,t="sensor.planavista_config"){const s=e.states[t];if(!s)return null;const i=s.attributes,a=i.events||[];return{calendars:i.calendars||[],events:a,display:i.display||{time_format:"12h",weather_entity:"",first_day:"sunday",default_view:"day",theme:"light"},onboarding_complete:i.onboarding_complete,version:i.version,calendars_configured:"number"==typeof i.calendars_configured?i.calendars_configured:void 0}}(this.hass,t):null),this._displayFor=Dt((e,t)=>function(e,t){const s=t?.display;return{time_format:e?.time_format||s?.time_format||"12h",weather_entity:e?.weather_entity||s?.weather_entity||"",first_day:e?.first_day||s?.first_day||"sunday",default_view:e?.default_view||e?.view||s?.default_view||"week",theme:e?.theme||s?.theme||"light",theme_overrides:s?.theme_overrides,location_autocomplete:!0===s?.location_autocomplete}}(e,t)),this._modulesFor=Dt((e,t,s)=>function(e,t,s={config:void 0,data:null}){const i=e.filter(e=>!e.enabled||e.enabled(s));let a=i;if(Array.isArray(t.modules)){const e=[];for(const s of t.modules){const t="string"==typeof s?i.find(e=>e.id===s):void 0;t&&!e.includes(t)&&e.push(t)}e.length>0&&(a=e)}const n="string"==typeof t.module?a.find(e=>e.id===t.module):void 0;return{shown:a,initial:n??a[0]}}(Oa.list(),e??{},{config:e,data:null,household:this._household.view})),this._onContentScroll=e=>{this._compactHeader=function(e,{top:t,room:s},i){return e?t>=8:t>24&&s-i>24}(this._compactHeader,e.detail,this._headerHeights.change)},this._lockAndKiosk=()=>{this._session.lock(),ip.restore()},this._onKiosk=async()=>{if(ip.steppedOut)return void ip.restore();const e=this._session.session;if(e)try{await this._api.exitKiosk(),ip.lift(Date.now(),e.idleMs,e.capAt,e.startedAt)}catch(e){this._toast={id:`kiosk-${Date.now()}`,text:$a(e)??"Couldn't exit kiosk mode. Try again.",tone:"bad"}}},this._drafts.set("appearance",this._appearanceEdits);for(const e of Oa.list())e.service&&(this._services[e.id]=e.service(this))}get householdView(){return this._household.view}get pinSession(){return this._session.session}get planavistaData(){return this._data()}sessionEnded(e){this._session.ended(e)}sessionUsed(e){this._session.used(e)}serviceChanged(){this._serviceRevision++}shouldUpdate(e){if(1===e.size&&e.has("hass")){const t=e.get("hass"),s=e=>!!e?.themes?.darkMode;return!(!sc(this._appearance.settings).haDarkMode||s(t)===s(this.hass))||!!function(e,t){return e?.connected!==t?.connected||e?.config?.state!==t?.config?.state}(t,this.hass)||function(e,t,s){return e&&t?s.some(s=>e.states[s]!==t.states[s]):e!==t}(t,this.hass,this._watchedEntityIds())}return!0}_starting(){const e=this.hass?.config?.state;return void 0!==e&&"RUNNING"!==e}_entityId(){return this._config?.entity||np}_data(){const e=this._entityId();return this._dataFor(this.hass?.states?.[e],e)}_display(){return this._displayFor(this._config,this._data())}_modules(){const e=this._household.view;return this._modulesFor(this._config,e?.modules,!!e?.available)}_ctx(){return{config:this._config,data:this._data(),household:this._household.view}}_glanceChips(){const e=this._ctx();return Object.values(this._services).flatMap(t=>t.glance?.(e)??[])}_open(e){const t=this._modules().shown.find(t=>t.id===e.module);t&&(this._moduleId=t.id,e.view&&t.views.some(t=>t.id===e.view)&&(this._views={...this._views,[t.id]:e.view}),this._openTarget={...e})}_moduleAction(e){this.renderRoot.querySelector(".pv-module")?.moduleAction?.(e)}_watchedEntityIds(){const e=this._data(),t=[this._entityId(),...sc(this._appearance.settings).entities],s=this._display().weather_entity;s&&t.push(s);for(const s of this._modules().shown)t.push(...s.watchedEntities({config:this._config,data:e}));return t}setConfig(e){this._config={entity:np,...e},this._views={},this._moduleId=null,this._placeKey=function(e,t){return`${e}|${Xh(t)}`}(window.location.pathname,e),this._remembered=function(e,t,s){const i=Zh(Qh(e)[t]);return i&&s-i.at<Jh?i:null}(this._storedPlaces(),this._placeKey,Date.now()),this._placeApplied=!1}_storedPlaces(){try{return window.localStorage.getItem(Gh)}catch{return null}}_savePlace(){const e=this._activeModule();if(this._placeApplied&&e&&this._placeKey)try{window.localStorage.setItem(Gh,function(e,t,s,i){const a={};for(const[t,s]of Object.entries(Qh(e))){const e=Zh(s);e&&i-e.at<Jh&&(a[t]=e)}return a[t]={module:s.module,views:{...s.views},at:i},JSON.stringify(a)}(this._storedPlaces(),this._placeKey,{module:e.id,views:this._views},Date.now()))}catch{}}_activeModule(){const e=this._modules();return e.shown.find(e=>e.id===this._moduleId)??e.initial}willUpdate(e){if(super.willUpdate(e),!this._placeApplied&&this._data()&&this._household.view){this._placeApplied=!0;const e=function(e,t){if(!e||!t.some(t=>t.id===e.module))return null;const s={};for(const i of t){const t=e.views[i.id];t&&i.views.some(e=>e.id===t)&&(s[i.id]=t)}return{module:e.module,views:s}}(this._remembered,this._modules().shown);e&&(this._moduleId=e.module,this._views={...this._views,...e.views})}const t=this._activeModule(),s=this._data();t&&s&&!(t.id in this._views)&&(this._views={...this._views,[t.id]:za(t,{config:this._config,data:s})}),(e.has("_views")||e.has("_moduleId"))&&(this._compactHeader=!1),this._session.follow(this._household.view?.security)}_setView(e){const t=this._activeModule();t&&this._views[t.id]!==e&&(this._views={...this._views,[t.id]:e})}connectedCallback(){super.connectedCallback(),function(e=document,t=import.meta.url){if(e.getElementById(Cc))return;const s=e.createElement("style");s.id=Cc,s.textContent=`@font-face{font-family:'PlanaVista Rounded';src:url('${function(e){const t=new URL(e),s=new URL("fonts/nunito-latin-wght.woff2",t);return s.search=t.search,s.href}(t)}') format('woff2');font-weight:200 1000;font-style:normal;font-display:swap}`,e.head.appendChild(s)}(),this._placeTimer=window.setInterval(()=>{"visible"===document.visibilityState&&this._savePlace()},6e4),this.updateComplete.then(()=>this._fitView()),this._unhearKiosk=ip.onChange(()=>this.requestUpdate())}disconnectedCallback(){super.disconnectedCallback(),window.clearInterval(this._placeTimer),this._savePlace(),this._unfitView?.(),this._unfitView=void 0,this._unhearKiosk?.(),this._unhearKiosk=void 0}updated(e){super.updated(e),e.has("isPanel")&&this._fitView(),(e.has("_moduleId")||e.has("_views"))&&this._savePlace(),this._guardSettings(),this._guardSetup()}_fitView(){if(this._unfitView?.(),this._unfitView=void 0,!this.isPanel||!this.isConnected)return;const e=function(e){let t=e.parentNode??e.host;for(;t;){if("HUI-VIEW-CONTAINER"===t.tagName)return t;t=t.parentNode??t.host}return null}(this);if(!e)return;const t="undefined"!=typeof CSS&&CSS.supports("height",ep),s=[tp(e,"minHeight",t),tp(document.documentElement,"height",t)];this._unfitView=()=>s.forEach(e=>e())}_onOnboardingComplete(e){this._wizardOpen=!1,this._onboardingDone=!0;const t=e?.detail?.module;t&&(this._moduleId=t)}_access(){const e=!!this.hass?.user?.is_admin;return this._household.ready?ns(this._household.view,e):e?"open":"none"}_openSettings(e){this._sheetOpener=e?.composedPath?.()[0]??null;const t=e?.detail;this._settingsTarget=t&&"string"==typeof t.page?t:null;const s=this._access();"open"===s||this._session.session?.parent?(this._settingsVia="open"===s?"access":"session",this._settingsOpen=!0):"pin"===s?this._sheet={kind:"pin",purpose:"settings",heading:"Who's opening Settings?"}:"no_pin"===s&&(this._sheet={kind:"no_pin"})}_beginSetup(e){this._sheetOpener=e?.composedPath?.()[0]??null,"open"===this._access()||this._session.session?.parent?this._wizardOpen=!0:"pin"===this._access()&&(this._sheet={kind:"pin",purpose:"setup",heading:"Who's setting up PlanaVista?"})}_renderSetupCard(){const e=this._access(),t=U`
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
    `}_onUnlocked(e){const t=this._sheet;this._session.unlocked(e.detail.result),this._closeSheet(),"pin"!==t?.kind||"module"!==t.purpose?("pin"!==t?.kind||"settings"!==t.purpose&&"continue"!==t.purpose||(this._settingsVia="session",this._settingsOpen=!0),"pin"===t?.kind&&"setup"===t.purpose&&(this._wizardOpen=!0)):t.resolve(!!this._session.session)}_onSheetCancel(){const e=this._sheet;this._closeSheet(),"pin"===e?.kind&&"settings"===e.purpose&&(this._settingsTarget=null),"pin"===e?.kind&&"module"===e.purpose&&e.resolve(!1),"pin"===e?.kind&&"continue"===e.purpose&&this._onSettingsClose(),"pin"===e?.kind&&"keep_setup"===e.purpose&&(this._wizardOpen=!1,this._flow=null)}_guardSettings(){if(!this._settingsOpen||this._session.session?.parent||this._sheet)return;const e=this._access();"open"!==e&&("access"!==this._settingsVia||"pin"!==e?this._onSettingsClose():this._sheet={kind:"pin",purpose:"continue",heading:"Enter a parent's PIN to keep changing settings"})}_guardSetup(){var e;(this._wizardOpen||this._flow)&&!this._sheet&&this._household.ready&&(e=this._household.view,this._session.session?.parent||"pin"!==ns(e,!1)||(this._sheet={kind:"pin",purpose:"keep_setup",heading:"Enter a parent's PIN to keep setting up"}))}_closeSheet(){this._sheet=null;const e=this._sheetOpener;this._sheetOpener=null,e?.focus?.()}_renderSheet(){const e=this._sheet;if(!e)return Y;const t=this._layout.layout;if("no_pin"===e.kind)return U`
        <pv-notice-sheet
          .layout=${t}
          heading="Settings needs a parent's PIN"
          body="On a shared screen, a parent opens Settings with their PIN, and no parent has one yet. Sign in to Home Assistant with a parent's or an admin's own account, then set one in Settings, PINs and parent mode."
          .actions=${[{id:"ok",label:"OK",kind:"primary"}]}
          @pv-sheet-action=${this._closeSheet}
        ></pv-notice-sheet>
      `;const s=this._household.view;return U`
      <pv-pin-sheet
        .hass=${this.hass}
        .api=${this._api}
        .layout=${t}
        mode="unlock"
        .members=${"module"===e.purpose?e.members:s?as(s.members):[]}
        .heading=${e.heading}
        .reason=${("module"===e.purpose?e.reason:void 0)??function(e){if(Qd[e])return Qd[e];const t=/^Who's (\w+)(.*)\?$/.exec(e);if(t&&Xd[t[1]])return`To ${Xd[t[1]]}${t[2]}`;const s=/\bto (.+?)\.?$/.exec(e);return s?`To ${s[1]}`:null}(e.heading)??""}
        .shuffle=${!!s?.security.shuffle_keypad}
        @pv-unlocked=${this._onUnlocked}
        @pv-sheet-close=${this._onSheetCancel}
      ></pv-pin-sheet>
    `}_renderParentStrip(){const e=this._session.session;if(!e)return Y;const t=this._household.view?.members.find(t=>t.id===e.memberId);if(!t)return Y;const s=this._activeModule(),i=s&&e.parent?this._services[s.id]?.stripActions?.(this._ctx())??[]:[];return U`
      <pv-parent-strip
        .member=${t}
        .hass=${this.hass}
        .endsAt=${this._session.endsAt??0}
        .span=${this._session.spanMs}
        .parent=${e.parent}
        .actions=${i}
        .kiosk=${this._kioskAction()}
        @pv-lock=${this._lockAndKiosk}
        @pv-kiosk=${this._onKiosk}
        @pv-strip-action=${e=>this._moduleAction(e.detail.id)}
      ></pv-parent-strip>
    `}_kioskAction(){const e=this._session.session;return e?function(e,t,s){return"off"===e?null:t?"back":s.parent&&s.adminParent?"exit":null}(ip.look,ip.steppedOut,e):null}_onSettingsClose(){this._settingsOpen=!1,this._settingsVia=null,this._settingsTarget=null}_onRunSetup(e){e.stopPropagation(),this._flow=[...e.detail.steps],this._flowCancel=e.detail.cancel,this._settingsOpen=!1,this._settingsTarget=null}_onFlowComplete(e){e.stopPropagation(),this._flow=null,this._flowCancel=void 0,e.detail?.module&&(this._moduleId=e.detail.module)}async _onFlowCancel(){const e=this._flowCancel;this._flow=null,this._flowCancel=void 0;try{await(e?.())}catch{}this._openSettings(new CustomEvent("pv-open-settings",{detail:{page:"chores-off"}}))}_onSettingsLock(){this._session.lock(),ip.restore(),"open"!==this._access()&&this._onSettingsClose()}_getWeatherEntity(){const e=this._display().weather_entity;return e?this.hass?.states?.[e]:null}render(){if(!this._config||!this.hass)return Y;const e=this._data();if(!e)return U`
        <ha-card>
          ${this._starting()?U`
            <div class="state" role="status">
              <div class="art" aria-hidden="true">⏳</div>
              <h2>Home Assistant is starting</h2>
              <p>The calendar shows up here as soon as it's ready.</p>
            </div>
          `:U`
            <div class="state" role="alert">
              <div class="art" aria-hidden="true">🧩</div>
              <h2>PlanaVista isn't set up yet</h2>
              <p>Add PlanaVista in Settings, Devices and services, then reload this page.</p>
            </div>
          `}
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
              .services=${this._services}
              .revision=${this._serviceRevision}
              .pinGate=${this._pinGate}
              .session=${this._session.session}
              @onboarding-complete=${this._onOnboardingComplete}
            ></pv-setup>
          `:this._renderSetupCard()}
          ${this._renderSheet()}
        </ha-card>
      `;const t=this._display(),s=this._activeModule();return U`
      <ha-card>
        ${this._renderParentStrip()}
        ${i=ip.steppedOut,a=this._session.session,i&&!a?U`
          <div class="banner info kiosk-out" role="status">
            <span class="text">Home Assistant's menus are showing for now.</span>
            <button class="pv-btn pv-btn-secondary" type="button" @click=${()=>ip.restore()}>Back to kiosk mode</button>
          </div>
        `:Y}
        ${this._config.hide_header?Y:this._renderHeader(t)}
        ${s?this._renderModule(s,e,t):Y}
        ${s?this._renderBar(s):Y}
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
              .sessionSpan=${this._session.spanMs}
              .kioskAction=${this._kioskAction()}
              .parent=${this._household.view?.members.find(e=>e.id===this._session.session?.memberId)??null}
              .drafts=${this._drafts}
              .services=${this._services}
              .revision=${this._serviceRevision}
              .target=${this._settingsTarget}
              @pv-settings-close=${this._onSettingsClose}
              @pv-run-setup=${this._onRunSetup}
              @pv-settings-open-target=${e=>{this._onSettingsClose(),this._open(e.detail)}}
              @pv-kiosk=${this._onKiosk}
              @pv-lock=${this._onSettingsLock}
            ></pv-settings>
          </div>
        `:Y}
        ${this._flow?U`
          <div class="pvc-settings-overlay">
            <pv-setup
              .hass=${this.hass}
              .data=${e}
              .household=${this._household.view}
              .api=${this._api}
              .layout=${this._layout.layout}
              .drafts=${this._drafts}
              .services=${this._services}
              .revision=${this._serviceRevision}
              .pinGate=${this._pinGate}
              .session=${this._session.session}
              .only=${this._flow}
              cancelLabel="Settings"
              @onboarding-complete=${this._onFlowComplete}
              @pv-setup-cancel=${this._onFlowCancel}
            ></pv-setup>
          </div>
        `:Y}
        ${this._renderSheet()}
        <div class="toast-anchor"><pv-toast .toast=${this._toast} @pv-toast-gone=${()=>{this._toast=null}}></pv-toast></div>
      </ha-card>
    `;var i,a}_renderModule(e,t,s){const i=Kd(e.tag);return Jd`
      <${i}
        class="pv-module"
        layout=${this._layout.layout}
        .hass=${this.hass}
        .cardConfig=${this._config}
        .data=${t}
        .display=${s}
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
        @pv-content-scroll=${this._onContentScroll}
        @pv-open=${e=>this._open(e.detail)}
        @pv-open-settings=${this._openSettings}
      ></${i}>
    `}_renderHeader(e){const t=this._config?.hide_weather?null:this._getWeatherEntity();return U`
      <pv-glance-header
        ${qi(this._headerHeights.attach)}
        layout=${this._layout.layout}
        ?compact=${"portrait"===this._layout.layout&&this._compactHeader}
        .timeFormat=${e.time_format||"12h"}
        .weather=${t??null}
        .weatherEntity=${e.weather_entity}
        .today=${function(e){const t=Ee(new Date),s=e.find(e=>e.datetime&&Ee(we(e.datetime))===t);return s&&"number"==typeof s.temperature?{high:Math.round(s.temperature),low:"number"==typeof s.templow?Math.round(s.templow):null}:null}(this._forecast.forecast)}
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
    `}static getConfigElement(){return document.createElement("planavista-calendar-card-editor")}static getStubConfig(){return{entity:np}}getCardSize(){return 10}}var rp;op.styles=[lt,ct,dt,mt,vt,o`
      /* Only the space Home Assistant leaves, so the page itself never scrolls:
         on an iPhone its header grows by the status bar and its view pads the
         home indicator, and Safari's 100vh is the screen with its toolbars
         hidden (dvh is the screen as shown). The card runs under the home
         indicator, as iOS's own bars do: the bottom bar pads itself by the
         inset, and in landscape the card pads its own bottom. */
      :host {
        display: block;
        height: calc(100vh - var(--header-height, 56px) - var(--safe-area-inset-top, 0px) + var(--pv-under-status-bar, 0px));
        height: calc(100dvh - var(--header-height, 56px) - var(--safe-area-inset-top, 0px) + var(--pv-under-status-bar, 0px));
        /* Kiosk mode with the top bar hidden: the card runs up under the status bar (milestone 9). */
        margin-top: calc(-1 * var(--pv-under-status-bar, 0px));
        margin-bottom: calc(-1 * var(--safe-area-inset-bottom, 0px));
        overflow: hidden;
        font-family: var(--pv-font-family);
        color: var(--pv-text);
      }

      /* In landscape the bar is at the top: content stays clear of the home indicator, the card's color behind it (review). */
      :host([layout='landscape']) ha-card {
        padding-bottom: var(--safe-area-inset-bottom, 0px);
        box-sizing: border-box;
      }

      ha-card {
        position: relative;
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
        padding-top: var(--pv-under-status-bar, 0px);
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

      /* The card's own toast sits just after the module area: above the bar in
         portrait and on phones, at the bottom in landscape, as the chores
         toasts do (review: it covered the bar). */
      .toast-anchor {
        order: 3;
        position: relative;
        height: 0;
        flex: none;
      }

      :host([layout='landscape']) pv-nav-bar {
        order: 2;
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

    `],e([ue({attribute:!1})],op.prototype,"hass",void 0),e([ue({attribute:!1})],op.prototype,"isPanel",void 0),e([me()],op.prototype,"_toast",void 0),e([me()],op.prototype,"_config",void 0),e([me()],op.prototype,"_wizardOpen",void 0),e([me()],op.prototype,"_onboardingDone",void 0),e([me()],op.prototype,"_settingsOpen",void 0),e([me()],op.prototype,"_settingsTarget",void 0),e([me()],op.prototype,"_flow",void 0),e([me()],op.prototype,"_sheet",void 0),e([me()],op.prototype,"_views",void 0),e([me()],op.prototype,"_moduleId",void 0),e([me()],op.prototype,"_compactHeader",void 0),e([me()],op.prototype,"_openTarget",void 0),e([me()],op.prototype,"_serviceRevision",void 0),e([me()],op.prototype,"_moduleOverlay",void 0),function(e=La,t=ja){for(const t of Ic)e.register(t);for(const e of Lc)t.register(e)}(),ge("planavista-calendar-card",op),rp=op,be(()=>ye("planavista-card",class extends(customElements.get("planavista-calendar-card")??rp){}));const lp=["planavista-calendar-card","planavista-card"];var dp;window.customCards=window.customCards||[],(dp=window.customCards).some(e=>lp.includes(e.type))||dp.push({type:"planavista-card",name:"PlanaVista",description:"Your family's calendar and chores, together on one screen.",preview:!0}),function(){const e=window;if(e[ap])return;e[ap]=!0;const t=new Fa(e=>ip.setView(e)),s=()=>{const e=document.querySelector("home-assistant");t.update(e?.hass?.connection),ip.sync(),ip.tick(Date.now())};window.setInterval(s,1e3),s(),window.addEventListener("location-changed",()=>{window.setTimeout(()=>ip.sync(),50),window.setTimeout(()=>ip.sync(),500)});const i=()=>ip.touch(Date.now());document.addEventListener("pointerdown",i,!0),document.addEventListener("keydown",i,!0),document.addEventListener("visibilitychange",()=>{"hidden"===document.visibilityState&&ip.restore()})}(),console.info(`%c PLANAVISTA %c v${Nc} `,"color: white; background: #6366F1; font-weight: bold; border-radius: 4px 0 0 4px; padding: 2px 6px;","color: #6366F1; background: #EEF2FF; font-weight: bold; border-radius: 0 4px 4px 0; padding: 2px 6px;");
