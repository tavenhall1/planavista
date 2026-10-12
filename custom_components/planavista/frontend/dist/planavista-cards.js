function e(e,t,s,i){var a,n=arguments.length,r=n<3?t:null===i?i=Object.getOwnPropertyDescriptor(t,s):i;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)r=Reflect.decorate(e,t,s,i);else for(var o=e.length-1;o>=0;o--)(a=e[o])&&(r=(n<3?a(r):n>3?a(t,s,r):a(t,s))||r);return n>3&&r&&Object.defineProperty(t,s,r),r}"function"==typeof SuppressedError&&SuppressedError;const t=globalThis,s=t.ShadowRoot&&(void 0===t.ShadyCSS||t.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,i=Symbol(),a=new WeakMap;let n=class{constructor(e,t,s){if(this._$cssResult$=!0,s!==i)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=e,this.t=t}get styleSheet(){let e=this.o;const t=this.t;if(s&&void 0===e){const s=void 0!==t&&1===t.length;s&&(e=a.get(t)),void 0===e&&((this.o=e=new CSSStyleSheet).replaceSync(this.cssText),s&&a.set(t,e))}return e}toString(){return this.cssText}};const r=(e,...t)=>{const s=1===e.length?e[0]:t.reduce((t,s,i)=>t+(e=>{if(!0===e._$cssResult$)return e.cssText;if("number"==typeof e)return e;throw Error("Value passed to 'css' function must be a 'css' function result: "+e+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(s)+e[i+1],e[0]);return new n(s,e,i)},o=s?e=>e:e=>e instanceof CSSStyleSheet?(e=>{let t="";for(const s of e.cssRules)t+=s.cssText;return(e=>new n("string"==typeof e?e:e+"",void 0,i))(t)})(e):e,{is:l,defineProperty:d,getOwnPropertyDescriptor:c,getOwnPropertyNames:p,getOwnPropertySymbols:h,getPrototypeOf:u}=Object,m=globalThis,v=m.trustedTypes,g=v?v.emptyScript:"",b=m.reactiveElementPolyfillSupport,y=(e,t)=>e,f={toAttribute(e,t){switch(t){case Boolean:e=e?g:null;break;case Object:case Array:e=null==e?e:JSON.stringify(e)}return e},fromAttribute(e,t){let s=e;switch(t){case Boolean:s=null!==e;break;case Number:s=null===e?null:Number(e);break;case Object:case Array:try{s=JSON.parse(e)}catch(e){s=null}}return s}},_=(e,t)=>!l(e,t),w={attribute:!0,type:String,converter:f,reflect:!1,useDefault:!1,hasChanged:_};Symbol.metadata??=Symbol("metadata"),m.litPropertyMetadata??=new WeakMap;let x=class extends HTMLElement{static addInitializer(e){this._$Ei(),(this.l??=[]).push(e)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(e,t=w){if(t.state&&(t.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(e)&&((t=Object.create(t)).wrapped=!0),this.elementProperties.set(e,t),!t.noAccessor){const s=Symbol(),i=this.getPropertyDescriptor(e,s,t);void 0!==i&&d(this.prototype,e,i)}}static getPropertyDescriptor(e,t,s){const{get:i,set:a}=c(this.prototype,e)??{get(){return this[t]},set(e){this[t]=e}};return{get:i,set(t){const n=i?.call(this);a?.call(this,t),this.requestUpdate(e,n,s)},configurable:!0,enumerable:!0}}static getPropertyOptions(e){return this.elementProperties.get(e)??w}static _$Ei(){if(this.hasOwnProperty(y("elementProperties")))return;const e=u(this);e.finalize(),void 0!==e.l&&(this.l=[...e.l]),this.elementProperties=new Map(e.elementProperties)}static finalize(){if(this.hasOwnProperty(y("finalized")))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(y("properties"))){const e=this.properties,t=[...p(e),...h(e)];for(const s of t)this.createProperty(s,e[s])}const e=this[Symbol.metadata];if(null!==e){const t=litPropertyMetadata.get(e);if(void 0!==t)for(const[e,s]of t)this.elementProperties.set(e,s)}this._$Eh=new Map;for(const[e,t]of this.elementProperties){const s=this._$Eu(e,t);void 0!==s&&this._$Eh.set(s,e)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(e){const t=[];if(Array.isArray(e)){const s=new Set(e.flat(1/0).reverse());for(const e of s)t.unshift(o(e))}else void 0!==e&&t.push(o(e));return t}static _$Eu(e,t){const s=t.attribute;return!1===s?void 0:"string"==typeof s?s:"string"==typeof e?e.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){this._$ES=new Promise(e=>this.enableUpdating=e),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach(e=>e(this))}addController(e){(this._$EO??=new Set).add(e),void 0!==this.renderRoot&&this.isConnected&&e.hostConnected?.()}removeController(e){this._$EO?.delete(e)}_$E_(){const e=new Map,t=this.constructor.elementProperties;for(const s of t.keys())this.hasOwnProperty(s)&&(e.set(s,this[s]),delete this[s]);e.size>0&&(this._$Ep=e)}createRenderRoot(){const e=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return((e,i)=>{if(s)e.adoptedStyleSheets=i.map(e=>e instanceof CSSStyleSheet?e:e.styleSheet);else for(const s of i){const i=document.createElement("style"),a=t.litNonce;void 0!==a&&i.setAttribute("nonce",a),i.textContent=s.cssText,e.appendChild(i)}})(e,this.constructor.elementStyles),e}connectedCallback(){this.renderRoot??=this.createRenderRoot(),this.enableUpdating(!0),this._$EO?.forEach(e=>e.hostConnected?.())}enableUpdating(e){}disconnectedCallback(){this._$EO?.forEach(e=>e.hostDisconnected?.())}attributeChangedCallback(e,t,s){this._$AK(e,s)}_$ET(e,t){const s=this.constructor.elementProperties.get(e),i=this.constructor._$Eu(e,s);if(void 0!==i&&!0===s.reflect){const a=(void 0!==s.converter?.toAttribute?s.converter:f).toAttribute(t,s.type);this._$Em=e,null==a?this.removeAttribute(i):this.setAttribute(i,a),this._$Em=null}}_$AK(e,t){const s=this.constructor,i=s._$Eh.get(e);if(void 0!==i&&this._$Em!==i){const e=s.getPropertyOptions(i),a="function"==typeof e.converter?{fromAttribute:e.converter}:void 0!==e.converter?.fromAttribute?e.converter:f;this._$Em=i;const n=a.fromAttribute(t,e.type);this[i]=n??this._$Ej?.get(i)??n,this._$Em=null}}requestUpdate(e,t,s,i=!1,a){if(void 0!==e){const n=this.constructor;if(!1===i&&(a=this[e]),s??=n.getPropertyOptions(e),!((s.hasChanged??_)(a,t)||s.useDefault&&s.reflect&&a===this._$Ej?.get(e)&&!this.hasAttribute(n._$Eu(e,s))))return;this.C(e,t,s)}!1===this.isUpdatePending&&(this._$ES=this._$EP())}C(e,t,{useDefault:s,reflect:i,wrapped:a},n){s&&!(this._$Ej??=new Map).has(e)&&(this._$Ej.set(e,n??t??this[e]),!0!==a||void 0!==n)||(this._$AL.has(e)||(this.hasUpdated||s||(t=void 0),this._$AL.set(e,t)),!0===i&&this._$Em!==e&&(this._$Eq??=new Set).add(e))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(e){Promise.reject(e)}const e=this.scheduleUpdate();return null!=e&&await e,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??=this.createRenderRoot(),this._$Ep){for(const[e,t]of this._$Ep)this[e]=t;this._$Ep=void 0}const e=this.constructor.elementProperties;if(e.size>0)for(const[t,s]of e){const{wrapped:e}=s,i=this[t];!0!==e||this._$AL.has(t)||void 0===i||this.C(t,void 0,s,i)}}let e=!1;const t=this._$AL;try{e=this.shouldUpdate(t),e?(this.willUpdate(t),this._$EO?.forEach(e=>e.hostUpdate?.()),this.update(t)):this._$EM()}catch(t){throw e=!1,this._$EM(),t}e&&this._$AE(t)}willUpdate(e){}_$AE(e){this._$EO?.forEach(e=>e.hostUpdated?.()),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(e)),this.updated(e)}_$EM(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(e){return!0}update(e){this._$Eq&&=this._$Eq.forEach(e=>this._$ET(e,this[e])),this._$EM()}updated(e){}firstUpdated(e){}};x.elementStyles=[],x.shadowRootOptions={mode:"open"},x[y("elementProperties")]=new Map,x[y("finalized")]=new Map,b?.({ReactiveElement:x}),(m.reactiveElementVersions??=[]).push("2.1.2");const $=globalThis,k=e=>e,F=$.trustedTypes,E=F?F.createPolicy("lit-html",{createHTML:e=>e}):void 0,C="$lit$",S=`lit$${Math.random().toFixed(9).slice(2)}$`,D="?"+S,A=`<${D}>`,z=document,M=()=>z.createComment(""),T=e=>null===e||"object"!=typeof e&&"function"!=typeof e,P=Array.isArray,B="[ \t\n\f\r]",O=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,R=/-->/g,N=/>/g,I=RegExp(`>|${B}(?:([^\\s"'>=/]+)(${B}*=${B}*(?:[^ \t\n\f\r"'\`<>=]|("|')|))|$)`,"g"),L=/'/g,j=/"/g,H=/^(?:script|style|textarea|title)$/i,q=e=>(t,...s)=>({_$litType$:e,strings:t,values:s}),U=q(1),W=q(2),V=Symbol.for("lit-noChange"),Y=Symbol.for("lit-nothing"),K=new WeakMap,G=z.createTreeWalker(z,129);function X(e,t){if(!P(e)||!e.hasOwnProperty("raw"))throw Error("invalid template strings array");return void 0!==E?E.createHTML(t):t}class J{constructor({strings:e,_$litType$:t},s){let i;this.parts=[];let a=0,n=0;const r=e.length-1,o=this.parts,[l,d]=((e,t)=>{const s=e.length-1,i=[];let a,n=2===t?"<svg>":3===t?"<math>":"",r=O;for(let t=0;t<s;t++){const s=e[t];let o,l,d=-1,c=0;for(;c<s.length&&(r.lastIndex=c,l=r.exec(s),null!==l);)c=r.lastIndex,r===O?"!--"===l[1]?r=R:void 0!==l[1]?r=N:void 0!==l[2]?(H.test(l[2])&&(a=RegExp("</"+l[2],"g")),r=I):void 0!==l[3]&&(r=I):r===I?">"===l[0]?(r=a??O,d=-1):void 0===l[1]?d=-2:(d=r.lastIndex-l[2].length,o=l[1],r=void 0===l[3]?I:'"'===l[3]?j:L):r===j||r===L?r=I:r===R||r===N?r=O:(r=I,a=void 0);const p=r===I&&e[t+1].startsWith("/>")?" ":"";n+=r===O?s+A:d>=0?(i.push(o),s.slice(0,d)+C+s.slice(d)+S+p):s+S+(-2===d?t:p)}return[X(e,n+(e[s]||"<?>")+(2===t?"</svg>":3===t?"</math>":"")),i]})(e,t);if(this.el=J.createElement(l,s),G.currentNode=this.el.content,2===t||3===t){const e=this.el.content.firstChild;e.replaceWith(...e.childNodes)}for(;null!==(i=G.nextNode())&&o.length<r;){if(1===i.nodeType){if(i.hasAttributes())for(const e of i.getAttributeNames())if(e.endsWith(C)){const t=d[n++],s=i.getAttribute(e).split(S),r=/([.?@])?(.*)/.exec(t);o.push({type:1,index:a,name:r[2],strings:s,ctor:"."===r[1]?se:"?"===r[1]?ie:"@"===r[1]?ae:te}),i.removeAttribute(e)}else e.startsWith(S)&&(o.push({type:6,index:a}),i.removeAttribute(e));if(H.test(i.tagName)){const e=i.textContent.split(S),t=e.length-1;if(t>0){i.textContent=F?F.emptyScript:"";for(let s=0;s<t;s++)i.append(e[s],M()),G.nextNode(),o.push({type:2,index:++a});i.append(e[t],M())}}}else if(8===i.nodeType)if(i.data===D)o.push({type:2,index:a});else{let e=-1;for(;-1!==(e=i.data.indexOf(S,e+1));)o.push({type:7,index:a}),e+=S.length-1}a++}}static createElement(e,t){const s=z.createElement("template");return s.innerHTML=e,s}}function Q(e,t,s=e,i){if(t===V)return t;let a=void 0!==i?s._$Co?.[i]:s._$Cl;const n=T(t)?void 0:t._$litDirective$;return a?.constructor!==n&&(a?._$AO?.(!1),void 0===n?a=void 0:(a=new n(e),a._$AT(e,s,i)),void 0!==i?(s._$Co??=[])[i]=a:s._$Cl=a),void 0!==a&&(t=Q(e,a._$AS(e,t.values),a,i)),t}let Z=class{constructor(e,t){this._$AV=[],this._$AN=void 0,this._$AD=e,this._$AM=t}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(e){const{el:{content:t},parts:s}=this._$AD,i=(e?.creationScope??z).importNode(t,!0);G.currentNode=i;let a=G.nextNode(),n=0,r=0,o=s[0];for(;void 0!==o;){if(n===o.index){let t;2===o.type?t=new ee(a,a.nextSibling,this,e):1===o.type?t=new o.ctor(a,o.name,o.strings,this,e):6===o.type&&(t=new ne(a,this,e)),this._$AV.push(t),o=s[++r]}n!==o?.index&&(a=G.nextNode(),n++)}return G.currentNode=z,i}p(e){let t=0;for(const s of this._$AV)void 0!==s&&(void 0!==s.strings?(s._$AI(e,s,t),t+=s.strings.length-2):s._$AI(e[t])),t++}};class ee{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(e,t,s,i){this.type=2,this._$AH=Y,this._$AN=void 0,this._$AA=e,this._$AB=t,this._$AM=s,this.options=i,this._$Cv=i?.isConnected??!0}get parentNode(){let e=this._$AA.parentNode;const t=this._$AM;return void 0!==t&&11===e?.nodeType&&(e=t.parentNode),e}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(e,t=this){e=Q(this,e,t),T(e)?e===Y||null==e||""===e?(this._$AH!==Y&&this._$AR(),this._$AH=Y):e!==this._$AH&&e!==V&&this._(e):void 0!==e._$litType$?this.$(e):void 0!==e.nodeType?this.T(e):(e=>P(e)||"function"==typeof e?.[Symbol.iterator])(e)?this.k(e):this._(e)}O(e){return this._$AA.parentNode.insertBefore(e,this._$AB)}T(e){this._$AH!==e&&(this._$AR(),this._$AH=this.O(e))}_(e){this._$AH!==Y&&T(this._$AH)?this._$AA.nextSibling.data=e:this.T(z.createTextNode(e)),this._$AH=e}$(e){const{values:t,_$litType$:s}=e,i="number"==typeof s?this._$AC(e):(void 0===s.el&&(s.el=J.createElement(X(s.h,s.h[0]),this.options)),s);if(this._$AH?._$AD===i)this._$AH.p(t);else{const e=new Z(i,this),s=e.u(this.options);e.p(t),this.T(s),this._$AH=e}}_$AC(e){let t=K.get(e.strings);return void 0===t&&K.set(e.strings,t=new J(e)),t}k(e){P(this._$AH)||(this._$AH=[],this._$AR());const t=this._$AH;let s,i=0;for(const a of e)i===t.length?t.push(s=new ee(this.O(M()),this.O(M()),this,this.options)):s=t[i],s._$AI(a),i++;i<t.length&&(this._$AR(s&&s._$AB.nextSibling,i),t.length=i)}_$AR(e=this._$AA.nextSibling,t){for(this._$AP?.(!1,!0,t);e!==this._$AB;){const t=k(e).nextSibling;k(e).remove(),e=t}}setConnected(e){void 0===this._$AM&&(this._$Cv=e,this._$AP?.(e))}}class te{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(e,t,s,i,a){this.type=1,this._$AH=Y,this._$AN=void 0,this.element=e,this.name=t,this._$AM=i,this.options=a,s.length>2||""!==s[0]||""!==s[1]?(this._$AH=Array(s.length-1).fill(new String),this.strings=s):this._$AH=Y}_$AI(e,t=this,s,i){const a=this.strings;let n=!1;if(void 0===a)e=Q(this,e,t,0),n=!T(e)||e!==this._$AH&&e!==V,n&&(this._$AH=e);else{const i=e;let r,o;for(e=a[0],r=0;r<a.length-1;r++)o=Q(this,i[s+r],t,r),o===V&&(o=this._$AH[r]),n||=!T(o)||o!==this._$AH[r],o===Y?e=Y:e!==Y&&(e+=(o??"")+a[r+1]),this._$AH[r]=o}n&&!i&&this.j(e)}j(e){e===Y?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,e??"")}}class se extends te{constructor(){super(...arguments),this.type=3}j(e){this.element[this.name]=e===Y?void 0:e}}class ie extends te{constructor(){super(...arguments),this.type=4}j(e){this.element.toggleAttribute(this.name,!!e&&e!==Y)}}class ae extends te{constructor(e,t,s,i,a){super(e,t,s,i,a),this.type=5}_$AI(e,t=this){if((e=Q(this,e,t,0)??Y)===V)return;const s=this._$AH,i=e===Y&&s!==Y||e.capture!==s.capture||e.once!==s.once||e.passive!==s.passive,a=e!==Y&&(s===Y||i);i&&this.element.removeEventListener(this.name,this,s),a&&this.element.addEventListener(this.name,this,e),this._$AH=e}handleEvent(e){"function"==typeof this._$AH?this._$AH.call(this.options?.host??this.element,e):this._$AH.handleEvent(e)}}class ne{constructor(e,t,s){this.element=e,this.type=6,this._$AN=void 0,this._$AM=t,this.options=s}get _$AU(){return this._$AM._$AU}_$AI(e){Q(this,e)}}const re={I:ee},oe=$.litHtmlPolyfillSupport;oe?.(J,ee),($.litHtmlVersions??=[]).push("3.3.2");const le=globalThis;let de=class extends x{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){const e=super.createRenderRoot();return this.renderOptions.renderBefore??=e.firstChild,e}update(e){const t=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(e),this._$Do=((e,t,s)=>{const i=s?.renderBefore??t;let a=i._$litPart$;if(void 0===a){const e=s?.renderBefore??null;i._$litPart$=a=new ee(t.insertBefore(M(),e),e,void 0,s??{})}return a._$AI(e),a})(t,this.renderRoot,this.renderOptions)}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(!0)}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(!1)}render(){return V}};de._$litElement$=!0,de.finalized=!0,le.litElementHydrateSupport?.({LitElement:de});const ce=le.litElementPolyfillSupport;ce?.({LitElement:de}),(le.litElementVersions??=[]).push("4.2.2");const pe={attribute:!0,type:String,converter:f,reflect:!1,hasChanged:_},he=(e=pe,t,s)=>{const{kind:i,metadata:a}=s;let n=globalThis.litPropertyMetadata.get(a);if(void 0===n&&globalThis.litPropertyMetadata.set(a,n=new Map),"setter"===i&&((e=Object.create(e)).wrapped=!0),n.set(s.name,e),"accessor"===i){const{name:i}=s;return{set(s){const a=t.get.call(this);t.set.call(this,s),this.requestUpdate(i,a,e,!0,s)},init(t){return void 0!==t&&this.C(i,void 0,e,t),t}}}if("setter"===i){const{name:i}=s;return function(s){const a=this[i];t.call(this,s),this.requestUpdate(i,a,e,!0,s)}}throw Error("Unsupported decorator location: "+i)};function ue(e){return(t,s)=>"object"==typeof s?he(e,t,s):((e,t,s)=>{const i=t.hasOwnProperty(s);return t.constructor.createProperty(s,e),i?Object.getOwnPropertyDescriptor(t,s):void 0})(e,t,s)}function me(e){return ue({...e,state:!0,attribute:!1})}function ve(e,t){return(t,s,i)=>((e,t,s)=>(s.configurable=!0,s.enumerable=!0,Reflect.decorate&&"object"!=typeof t&&Object.defineProperty(e,t,s),s))(t,s,{get(){return(t=>t.renderRoot?.querySelector(e)??null)(this)}})}function ge(e,t){return be(()=>ye(e,t))}function be(e){return"undefined"==typeof document||null===document.querySelector("home-assistant")||customElements.get("home-assistant")?e():(customElements.whenDefined("home-assistant").then(e),!1)}function ye(e,t){return!customElements.get(e)&&(customElements.define(e,t),!0)}const fe=/^\d{4}-\d{2}-\d{2}$/;function _e(e){return fe.test(e)}function we(e){if(_e(e)){const[t,s,i]=e.split("-").map(Number);return new Date(t,s-1,i)}return new Date(e)}function xe(e,t="12h"){const s=we(e);return"24h"===t?s.toLocaleTimeString("en-US",{hour:"2-digit",minute:"2-digit",hour12:!1}):s.toLocaleTimeString("en-US",{hour:"numeric",minute:"2-digit",hour12:!0})}function $e(e,t="medium"){switch(t){case"long":return e.toLocaleDateString("en-US",{weekday:"long",year:"numeric",month:"long",day:"numeric"});case"medium":return e.toLocaleDateString("en-US",{weekday:"short",month:"short",day:"numeric"});case"short":return e.toLocaleDateString("en-US",{month:"numeric",day:"numeric"});case"weekday":return e.toLocaleDateString("en-US",{weekday:"long"})}}function ke(e){const t=new Date;return e.getFullYear()===t.getFullYear()&&e.getMonth()===t.getMonth()&&e.getDate()===t.getDate()}function Fe(e,t="sunday"){const s=new Date(e),i=s.getDay(),a="monday"===t?0===i?-6:1-i:-i;return s.setDate(s.getDate()+a),s.setHours(0,0,0,0),s}function Ee(e){return`${e.getFullYear()}-${String(e.getMonth()+1).padStart(2,"0")}-${String(e.getDate()).padStart(2,"0")}`}function Ce(e,t){const s=Date.UTC(e.getFullYear(),e.getMonth(),e.getDate()),i=Date.UTC(t.getFullYear(),t.getMonth(),t.getDate());return Math.round((i-s)/864e5)}function Se(e,t){const s=new Map(t.map(e=>[e.entity_id,e])),i=new Map;for(const t of e){const e=`${t.summary}|${t.start}|${t.end}`;if(i.has(e)){const a=i.get(e),n=s.get(t.calendar_entity_id);n&&a.shared_calendars.push({entity_id:n.entity_id,color:n.color,color_light:n.color_light,person_entity:n.person_entity,display_name:n.display_name})}else{const a=s.get(t.calendar_entity_id);i.set(e,{...t,shared_calendars:a?[{entity_id:a.entity_id,color:a.color,color_light:a.color_light,person_entity:a.person_entity,display_name:a.display_name}]:[]})}}return Array.from(i.values())}function De(e){return we(e.end)<new Date}function Ae(e){if(_e(e.start))return!0;const t=we(e.start),s=we(e.end);return 0===t.getHours()&&0===t.getMinutes()&&0===s.getHours()&&0===s.getMinutes()&&Ee(t)!==Ee(s)}function ze(e,t){return new Date(Math.max(we(e.end).getTime()-1,t.getTime()))}function Me(e,t){const s=Ae(e);return s!==Ae(t)?s?-1:1:we(e.start).getTime()-we(t.start).getTime()}function Te(e){const t=new Map;for(const s of e){const e=we(s.start),i=Ee(ze(s,e)),a=new Date(e.getFullYear(),e.getMonth(),e.getDate());for(let e=0;e<1e3;e++){const e=Ee(a);if(t.has(e)||t.set(e,[]),t.get(e).push(s),e===i)break;a.setDate(a.getDate()+1)}}for(const[,e]of t)e.sort(Me);return t}function Pe(e,t,s){return e.filter(e=>{const i=we(e.start),a=we(e.end);return i<s&&a>t})}function Be(e,t){return e.filter(e=>!t.has(e.calendar_entity_id))}const Oe="#FFFFFF",Re="#1A1B1E";function Ne(e){const t=/^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(e.trim());if(!t)return null;const s=3===t[1].length?t[1].split("").map(e=>e+e).join(""):t[1];return[0,2,4].map(e=>parseInt(s.slice(e,e+2),16))}function Ie(e,t,s){const i=e=>Math.round(Math.min(255,Math.max(0,e))).toString(16).padStart(2,"0");return`#${i(e)}${i(t)}${i(s)}`.toUpperCase()}function Le(e){const t=e/255;return t<=.04045?t/12.92:((t+.055)/1.055)**2.4}function je(e){const t=Ne(e);if(!t)return 0;const[s,i,a]=t.map(Le);return.2126*s+.7152*i+.0722*a}function He(e,t){const s=je(e),i=je(t);return(Math.max(s,i)+.05)/(Math.min(s,i)+.05)}function qe(e){return He(e,Oe)>=He(e,Re)?Oe:Re}function Ue(e){const[t,s,i]=(Ne(e)??[0,0,0]).map(Le),a=Math.cbrt(.4122214708*t+.5363325363*s+.0514459929*i),n=Math.cbrt(.2119034982*t+.6806995451*s+.1073969566*i),r=Math.cbrt(.0883024619*t+.2817188376*s+.6299787005*i),o=.2104542553*a+.793617785*n-.0040720468*r,l=1.9779984951*a-2.428592205*n+.4505937099*r,d=.0259040371*a+.7827717662*n-.808675766*r,c=Math.hypot(l,d);return{l:o,c:c,h:c<1e-6?0:(180*Math.atan2(d,l)/Math.PI+360)%360}}function We({l:e,c:t,h:s}){const i=t*Math.cos(s*Math.PI/180),a=t*Math.sin(s*Math.PI/180),n=(e+.3963377774*i+.2158037573*a)**3,r=(e-.1055613458*i-.0638541728*a)**3,o=(e-.0894841775*i-1.291485548*a)**3;return[4.0767416621*n-3.3077115913*r+.2309699292*o,-1.2684380046*n+2.6097574011*r-.3413193965*o,-.0041960863*n-.7034186147*r+1.707614701*o]}function Ve(e){return e.every(e=>e>=-1e-4&&e<=1.0001)}function Ye(e){const t=Math.min(1,Math.max(0,e.l));let s=Math.max(0,e.c);if(!Ve(We({l:t,c:s,h:e.h}))){let i=0,a=s;for(let s=0;s<24;s++){const s=(i+a)/2;Ve(We({l:t,c:s,h:e.h}))?i=s:a=s}s=i}const[i,a,n]=We({l:t,c:s,h:e.h}).map(e=>function(e){return 255*(e<=.0031308?12.92*e:1.055*e**(1/2.4)-.055)}(Math.min(1,Math.max(0,e))));return Ie(i,a,n)}function Ke(e){const{l:t,c:s,h:i}=Ue(e);return Ye({l:Math.min(.9,Math.max(t+.07,.69)),c:s,h:i})}function Ge(e){const{c:t,h:s}=Ue(e);return Ye({l:.255,c:Math.min(t,.037),h:s})}function Xe(e,t){const s=Ue(e);return Ye({...s,l:s.l+t})}function Je(e,t,s,i){const a=Ne(e);if(!a)return null;if(He(e,t)>=s)return Ie(...a);const n=Ue(e),r=i?"lighter"===i?1:0:Ue(t).l<.5?1:0,o=e=>Ye({...n,l:n.l+(r-n.l)*e});if(He(o(1),t)<s)return null;let l=0,d=1;for(let e=0;e<24;e++){const e=(l+d)/2;He(o(e),t)>=s?d=e:l=e}return o(d)}async function Qe(e,t){const s={summary:t.summary};t.start_date_time&&(s.start_date_time=t.start_date_time),t.end_date_time&&(s.end_date_time=t.end_date_time),t.start_date&&(s.start_date=t.start_date),t.end_date&&(s.end_date=t.end_date),t.description&&(s.description=t.description),t.location&&(s.location=t.location),await e.callService("calendar","create_event",s,{entity_id:t.entity_id})}async function Ze(e,t){const s={entity_id:t.entity_id,summary:t.summary};t.start_date_time&&(s.start_date_time=t.start_date_time),t.end_date_time&&(s.end_date_time=t.end_date_time),t.start_date&&(s.start_date=t.start_date),t.end_date&&(s.end_date=t.end_date),t.description&&(s.description=t.description),t.location&&(s.location=t.location),t.attendee_entity_ids?.length&&(s.attendee_entity_ids=t.attendee_entity_ids),await e.callService("planavista","create_event_with_attendees",s)}async function et(e,t){const s={entity_id:t.entity_id,uid:t.uid};t.recurrence_id&&(s.recurrence_id=t.recurrence_id),await e.callService("planavista","delete_event",s)}async function tt(e,t="sensor.planavista_config"){await e.callService("homeassistant","update_entity",{entity_id:t})}async function st(e,t,s){try{const i=await e.callWS({type:"planavista/get_event_organizer",entity_id:t,uid:s});return i?.organizer_entity_id??null}catch{return null}}function it(e,t){if(!t)return null;const s=e.states[t];return s?.attributes?.entity_picture||null}function at(e,t){if(!t)return"";const s=e.states[t];return s?.attributes?.friendly_name||t.replace("person.","")}const nt=r`
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
`,lt=r`
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
`,dt=r`
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
`;class ut extends de{constructor(){super(...arguments),this.calendars=[],this.timeFormat="12h",this.compact=!1,this.showStripes=!0,this.tick=0}render(){const e=this.event;if(!e)return Y;const t=e.shared_calendars||[],s=t.length>1,i=function(e,t){if(e.organizer){const t=e.shared_calendars.find(t=>t.display_name?.toLowerCase()===e.organizer?.toLowerCase()||t.entity_id===e.organizer);if(t)return t}for(const s of t){const t=e.shared_calendars.find(e=>e.entity_id===s.entity_id);if(t)return t}return e.shared_calendars[0]}(e,this.calendars),a=i?.color||e.calendar_color||"var(--pv-accent)";let n;n=this.showStripes&&s?`background: ${function(e){const t=e.length;if(t<=1)return"";const s=2===t?60:Math.min(50,Math.round(100/t*1.5)),i=(100-s)/(t-1),a=[];let n=0;return e.forEach((e,t)=>{const r=e.color_light||e.color,o=0===t?s:i;a.push(`${r} ${n}%`),n+=o,a.push(`${r} ${n}%`)}),`linear-gradient(135deg, ${a.join(", ")})`}(t)}`:this.showStripes?`background: ${t[0]?.color_light||e.calendar_color_light||e.calendar_color}`:"background: var(--pv-card-bg, #FFFFFF)";const r=this.showStripes?t[0]?.color_light||e.calendar_color_light||e.calendar_color:"#FFFFFF",o=this.showStripes?qe(r):"var(--pv-text)",l=De(e)?" past":"",d=(this.compact?"chip chip--compact":"chip")+l,c=Ae(e);return U`
      <div
        class="${d}"
        style="${n}; --chip-border-color: ${a}; --chip-text: ${o}"
        @click=${this._onClick}
      >
        <div class="chip-body">
          <div class="${"chip-title chip-title--nowrap"}">${e.summary}</div>
          ${this.compact?Y:U`
            <div class="chip-time">
              ${c?"All day":`${xe(e.start,this.timeFormat)} – ${xe(e.end,this.timeFormat)}`}
            </div>
          `}
        </div>
        ${!this.compact&&t.length>0?this._renderAvatars(t):Y}
      </div>
    `}_renderAvatars(e){const t=e.slice(0,4),s=e.length-4;return U`
      <div class="chip-avatars">
        ${t.map(e=>{const t=e.person_entity?it(this.hass,e.person_entity):null,s=e.person_entity?at(this.hass,e.person_entity):e.display_name||"?";return t?U`<img class="chip-avatar" src="${t}" alt="${s}" />`:U`<div class="chip-initial" style="background: ${e.color}; color: ${qe(e.color)}">${s[0]?.toUpperCase()||"?"}</div>`})}
        ${s>0?U`<div class="chip-overflow">+${s}</div>`:Y}
      </div>
    `}_onClick(){this.dispatchEvent(new CustomEvent("event-click",{detail:{event:this.event},bubbles:!0,composed:!0}))}}function mt(e,t){return Math.abs(e)<=50||Math.abs(e)<=2*Math.abs(t)?null:e>0?"prev":"next"}function vt(e){let t,s=null;return(...i)=>(s&&s.length===i.length&&i.every((e,t)=>e===s[t])||(t=e(...i),s=i),t)}ut.styles=[nt,r`
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
    `],e([ue({attribute:!1})],ut.prototype,"hass",void 0),e([ue({attribute:!1})],ut.prototype,"event",void 0),e([ue({attribute:!1})],ut.prototype,"calendars",void 0),e([ue({attribute:!1})],ut.prototype,"timeFormat",void 0),e([ue({type:Boolean})],ut.prototype,"compact",void 0),e([ue({type:Boolean})],ut.prototype,"showStripes",void 0),e([ue({type:Number})],ut.prototype,"tick",void 0),ge("pv-event-chip",ut);const gt=/^\d{2}:\d{2}$/;function bt(e){return String(e).padStart(2,"0")}function yt(e){return`${bt(e.getHours())}:${bt(e.getMinutes())}`}function ft(e){const t=-e.getTimezoneOffset(),s=t>=0?"+":"-",i=Math.abs(t);return`${Ee(e)}T${bt(e.getHours())}:${bt(e.getMinutes())}:${bt(e.getSeconds())}${s}${bt(Math.floor(i/60))}:${bt(i%60)}`}function _t(e,t){const[s,i,a]=e.split("-").map(Number);return Ee(new Date(s,i-1,a+t))}function wt(e,t){const[s,i,a]=e.split("-").map(Number),[n,r]=t.split(":").map(Number);return new Date(s,i-1,a,n,r,0,0)}function xt(e){return e.allDay?{start_date:e.date,end_date:_t(e.date,Math.max(1,Math.round(e.spanDays)))}:{start_date_time:ft(wt(e.date,e.startTime)),end_date_time:ft(wt(_t(e.date,e.endDayOffset),e.endTime))}}function $t(e,t=e.calendar_entity_id){if(!e.uid)throw new Error("This event has no unique ID, so it can only be changed in its calendar app.");const s={entity_id:t,uid:e.uid};return e.recurrence_id&&(s.recurrence_id=e.recurrence_id),s}function kt(e,t=e.calendar_entity_id){const s=_e(e.start)?{entity_id:t,summary:e.summary,start_date:e.start,end_date:e.end}:{entity_id:t,summary:e.summary,start_date_time:e.start,end_date_time:e.end};return e.description&&(s.description=e.description),e.location&&(s.location=e.location),s}function Ft(e,t,s){return{deleteData:$t(e,t),createData:{...s,entity_id:t},restoreData:kt(e,t)}}class Et extends Error{constructor(e,t){super(e),this.restored=t,this.name="EditRestoreError"}}function Ct(e){return e instanceof Error?e.message:String(e&&"object"==typeof e&&"message"in e?e.message:e)}async function St(e){await e.remove();try{await e.create()}catch(t){const s=Ct(t);try{await e.restore()}catch(e){throw new Et(`Your changes couldn't be saved (${s}), and the original event couldn't be put back (${Ct(e)}). Please re-create it in your calendar app.`,!1)}throw new Et(`Your changes couldn't be saved (${s}). The original event was restored.`,!0)}}class Dt{constructor(){this.hiddenCalendars=new Set,this.currentView="day",this.currentDate=new Date,this.selectedEvent=null,this.dialogOpen=null,this.createPrefill=null,this.isLoading=!1,this._hosts=new Set,this._autoAdvanceTimer=null,this._todayKey=Ee(new Date),this._onVisibilityChange=()=>{"visible"===document.visibilityState&&this.checkRollover()}}subscribe(e){this._hosts.add(e)}unsubscribe(e){this._hosts.delete(e)}_notify(){for(const e of this._hosts)e.requestUpdate()}toggleCalendar(e){const t=new Set(this.hiddenCalendars);t.has(e)?t.delete(e):t.add(e),this.hiddenCalendars=t,this._notify()}setView(e){this.currentView!==e&&(this.currentView=e,this._notify())}navigateDate(e){this.currentDate="today"===e?new Date:function(e,t,s){const i=new Date(e),a="next"===s?1:-1;switch(t){case"day":i.setDate(i.getDate()+a);break;case"week":case"agenda":i.setDate(i.getDate()+7*a);break;case"month":i.setMonth(i.getMonth()+a)}return i}(this.currentDate,this.currentView,e),this._notify()}setDate(e){this.currentDate=new Date(e),this._notify()}selectEvent(e){this.selectedEvent=e,this._notify()}openCreateDialog(e){this.dialogOpen="create",this.createPrefill=e||null,this._notify()}openEditDialog(e,t){this.dialogOpen="edit",this.selectedEvent=e;const s={...e};t?.removeGuests&&(s._removeGuestsHint=!0),this.createPrefill=s,this._notify()}closeDialog(){this.dialogOpen=null,this.createPrefill=null,this._notify()}async doCreateEvent(e,t){this.isLoading=!0,this._notify();try{await Qe(e,t),await tt(e),this.closeDialog()}catch(e){throw console.error("PlanaVista: Failed to create event",e),e}finally{this.isLoading=!1,this._notify()}}async doDeleteEvent(e,t){this.isLoading=!0,this._notify();try{await et(e,t),await tt(e),this.selectedEvent=null,this.closeDialog()}catch(e){throw console.error("PlanaVista: Failed to delete event",e),e}finally{this.isLoading=!1,this._notify()}}async doEditEvent(e,t,s,i){this.isLoading=!0,this._notify();try{await St({remove:()=>et(e,t),create:()=>Qe(e,s),restore:()=>Qe(e,i)}),await tt(e),this.selectedEvent=null,this.closeDialog()}catch(t){throw console.error("PlanaVista: Failed to edit event",t),await tt(e).catch(()=>{}),t}finally{this.isLoading=!1,this._notify()}}checkRollover(e=new Date){const t=function(e,t,s){return Ee(s)===t?null:Ee(e)===t?new Date(s):null}(this.currentDate,this._todayKey,e);this._todayKey=Ee(e),t&&(this.currentDate=t,this._notify())}get autoAdvancing(){return null!==this._autoAdvanceTimer}startAutoAdvance(){this._autoAdvanceTimer||(this.checkRollover(),this._autoAdvanceTimer=setInterval(()=>this.checkRollover(),6e4),"undefined"!=typeof document&&document.addEventListener("visibilitychange",this._onVisibilityChange))}stopAutoAdvance(){this._autoAdvanceTimer&&(clearInterval(this._autoAdvanceTimer),this._autoAdvanceTimer=null),"undefined"!=typeof document&&document.removeEventListener("visibilitychange",this._onVisibilityChange)}}class At{constructor(e){this.host=e,this.store=new Dt,e.addController(this)}hostConnected(){this.store.subscribe(this.host),this.store.startAutoAdvance()}hostDisconnected(){this.store.unsubscribe(this.host),this.store.stopAutoAdvance()}}class zt{constructor(e,t){this.host=e,this.getStore=t,e.addController(this)}hostConnected(){this._sync()}hostUpdate(){this._sync()}hostDisconnected(){this._store?.unsubscribe(this.host),this._store=void 0}_sync(){const e=this.getStore();e!==this._store&&(this._store?.unsubscribe(this.host),e?.subscribe(this.host),this._store=e)}}function Mt(e,t){const s=(e?.calendars||[]).filter(e=>!1!==e.visible),i=t?.calendars;return Array.isArray(i)&&i.length>0?s.filter(e=>i.includes(e.entity_id)):s}const Tt="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, system-ui, sans-serif",Pt="ui-rounded, 'SF Pro Rounded', 'PlanaVista Rounded', "+Tt,Bt={sharp:{radius:"4px",radiusLg:"6px",radiusSm:"2px"},rounded:{radius:"12px",radiusLg:"16px",radiusSm:"8px"},pill:{radius:"20px",radiusLg:"24px",radiusSm:"14px"}},Ot={none:{shadow:"none",shadowLg:"none",shadowXl:"none"},subtle:{shadow:"0 1px 3px rgba(0, 0, 0, 0.08), 0 1px 2px rgba(0, 0, 0, 0.04)",shadowLg:"0 10px 25px rgba(0, 0, 0, 0.08), 0 4px 10px rgba(0, 0, 0, 0.04)",shadowXl:"0 20px 40px rgba(0, 0, 0, 0.12)"},bold:{shadow:"0 2px 8px rgba(0, 0, 0, 0.15), 0 1px 3px rgba(0, 0, 0, 0.1)",shadowLg:"0 12px 32px rgba(0, 0, 0, 0.18), 0 6px 14px rgba(0, 0, 0, 0.1)",shadowXl:"0 24px 48px rgba(0, 0, 0, 0.24)"}},Rt={gradient_purple:{light:"linear-gradient(135deg, #667eea 0%, #764ba2 100%)",dark:"linear-gradient(135deg, #3730A3 0%, #581C87 100%)"},gradient_teal:{light:"linear-gradient(135deg, #0D9488 0%, #2563EB 100%)",dark:"linear-gradient(135deg, #115E59 0%, #1E3A8A 100%)"},gradient_sunset:{light:"linear-gradient(135deg, #F59E0B 0%, #EF4444 100%)",dark:"linear-gradient(135deg, #92400E 0%, #991B1B 100%)"},solid_accent:{light:"",dark:""},solid_dark:{light:"#1A1B1E",dark:"#0B0C0D"}},Nt={"color-scheme":"light","--pv-bg":"#F8F8F6","--pv-card-bg":"#FFFFFF","--pv-card-bg-elevated":"#FFFFFF","--pv-text":"#1A1B1E","--pv-text-secondary":"#5F6670","--pv-text-muted":"#8E949C","--pv-border":"#E7E7E3","--pv-border-subtle":"#F1F1EE","--pv-track":"#ECECE8","--pv-chip":"#F1F1EE","--pv-seg":"#ECECE8","--pv-seg-on":"#FFFFFF","--pv-accent":"#5B5BD6","--pv-accent-text":"#FFFFFF","--pv-accent-ink":"#5B5BD6","--pv-accent-tint":"#EEEEFC","--pv-accent-tint-ink":"#3B3BB0","--pv-warn-bg":"#FDF1DC","--pv-warn-ink":"#8A5A00","--pv-bad-bg":"#FBE4E4","--pv-bad-ink":"#A12828","--pv-star":"#8A6A00","--pv-danger":"#C62828","--pv-today-bg":"rgba(91, 91, 214, 0.06)","--pv-now-color":"#E5484D","--pv-event-hover":"rgba(0, 0, 0, 0.03)","--pv-shadow":Ot.subtle.shadow,"--pv-shadow-lg":Ot.subtle.shadowLg,"--pv-shadow-xl":Ot.subtle.shadowXl,"--pv-radius":"12px","--pv-radius-lg":"16px","--pv-radius-sm":"8px","--pv-transition":"200ms cubic-bezier(0.4, 0, 0.2, 1)","--pv-font-family":Tt,"--pv-font-heading":Pt,"--pv-header-gradient":"#FFFFFF","--pv-header-text":"#1A1B1E","--pv-header-muted":"#5F6670","--pv-backdrop":"rgba(0, 0, 0, 0.3)"},It={...Nt,"color-scheme":"dark","--pv-bg":"#111214","--pv-card-bg":"#1B1C1F","--pv-card-bg-elevated":"#25272B","--pv-text":"#E9E9E6","--pv-text-secondary":"#A3A7AE","--pv-text-muted":"#6F747C","--pv-border":"#2B2D31","--pv-border-subtle":"#232528","--pv-track":"#2C2E32","--pv-chip":"#25272B","--pv-seg":"#25272B","--pv-seg-on":"#3A3C42","--pv-accent":"#6262DE","--pv-accent-text":"#FFFFFF","--pv-accent-ink":"#8E8EF2","--pv-accent-tint":"#25254A","--pv-accent-tint-ink":"#C5C5FF","--pv-warn-bg":"#382A0F","--pv-warn-ink":"#F0C066","--pv-bad-bg":"#3B1C1F","--pv-bad-ink":"#F3A5A5","--pv-star":"#EFC75E","--pv-danger":"#B93838","--pv-today-bg":"rgba(142, 142, 242, 0.08)","--pv-now-color":"#FE6062","--pv-event-hover":"rgba(255, 255, 255, 0.04)","--pv-shadow":"none","--pv-shadow-lg":"none","--pv-shadow-xl":"none","--pv-header-gradient":"#1B1C1F","--pv-header-text":"#E9E9E6","--pv-header-muted":"#A3A7AE","--pv-backdrop":"rgba(0, 0, 0, 0.6)"},Lt={planavista:{light:Nt,dark:It},minimal:{light:{...Nt,"--pv-bg":"#FFFFFF","--pv-border":"#ECEEF1","--pv-border-subtle":"#F5F6F8","--pv-track":"#F1F2F4","--pv-chip":"#F3F4F6","--pv-seg":"#F1F2F4","--pv-accent":"#111827","--pv-accent-ink":"#111827","--pv-accent-tint":"#F3F4F6","--pv-accent-tint-ink":"#111827","--pv-today-bg":"rgba(17, 24, 39, 0.03)","--pv-shadow":"0 0 0 1px rgba(0, 0, 0, 0.05)","--pv-shadow-lg":"0 4px 12px rgba(0, 0, 0, 0.05)","--pv-shadow-xl":"0 8px 24px rgba(0, 0, 0, 0.08)","--pv-radius":"8px","--pv-radius-lg":"12px","--pv-radius-sm":"6px","--pv-transition":"150ms ease"},dark:{...It,"--pv-bg":"#000000","--pv-card-bg":"#0E0E10","--pv-card-bg-elevated":"#18181B","--pv-text":"#EDEDED","--pv-text-secondary":"#A1A1AA","--pv-text-muted":"#71717A","--pv-border":"#1F2023","--pv-border-subtle":"#161618","--pv-track":"#1F2023","--pv-chip":"#18181B","--pv-seg":"#18181B","--pv-seg-on":"#2A2A2E","--pv-accent":"#EDEDED","--pv-accent-text":"#111214","--pv-accent-ink":"#EDEDED","--pv-accent-tint":"#1F1F23","--pv-accent-tint-ink":"#EDEDED","--pv-today-bg":"rgba(237, 237, 237, 0.05)","--pv-radius":"8px","--pv-radius-lg":"12px","--pv-radius-sm":"6px","--pv-transition":"150ms ease","--pv-header-gradient":"#0E0E10","--pv-header-text":"#EDEDED","--pv-header-muted":"#A1A1AA"}},vibrant:{light:{...Nt,"--pv-bg":"#FAF8FF","--pv-border":"#ECE6FB","--pv-border-subtle":"#F4F0FD","--pv-accent":"#7C3AED","--pv-accent-ink":"#7C3AED","--pv-accent-tint":"#F1EAFE","--pv-accent-tint-ink":"#5B21B6","--pv-today-bg":"rgba(124, 58, 237, 0.06)","--pv-now-color":"#F43F5E","--pv-shadow":"0 1px 3px rgba(124, 58, 237, 0.1), 0 1px 2px rgba(0, 0, 0, 0.04)","--pv-shadow-lg":"0 10px 25px rgba(124, 58, 237, 0.15), 0 4px 10px rgba(0, 0, 0, 0.04)","--pv-shadow-xl":"0 20px 40px rgba(124, 58, 237, 0.2)","--pv-radius":"14px","--pv-radius-lg":"20px","--pv-radius-sm":"10px","--pv-transition":"250ms cubic-bezier(0.34, 1.56, 0.64, 1)","--pv-header-gradient":"linear-gradient(135deg, #7C3AED 0%, #EC4899 100%)","--pv-header-text":"#FFFFFF","--pv-header-muted":"rgba(255, 255, 255, 0.85)","--pv-backdrop":"rgba(124, 58, 237, 0.2)"},dark:{...It,"--pv-bg":"#150E22","--pv-card-bg":"#20172F","--pv-card-bg-elevated":"#2A1F3D","--pv-border":"#2E2442","--pv-border-subtle":"#251B36","--pv-track":"#2E2442","--pv-chip":"#2A1F3D","--pv-seg":"#2A1F3D","--pv-seg-on":"#3A2D52","--pv-accent":"#7C4DEB","--pv-accent-ink":"#B79BFA","--pv-accent-tint":"#2E2050","--pv-accent-tint-ink":"#D9C9FF","--pv-today-bg":"rgba(183, 155, 250, 0.08)","--pv-radius":"14px","--pv-radius-lg":"20px","--pv-radius-sm":"10px","--pv-transition":"250ms cubic-bezier(0.34, 1.56, 0.64, 1)","--pv-header-gradient":"linear-gradient(135deg, #4C1D95 0%, #831843 100%)","--pv-header-text":"#FFFFFF","--pv-header-muted":"rgba(255, 255, 255, 0.85)"}}};function jt(e,t){const[s,i,a]=Ne(e)??[0,0,0];return`rgba(${s}, ${i}, ${a}, ${t})`}function Ht(e){const{c:t,h:s}=Ue(e);return Ye({l:.955,c:Math.min(t,.02),h:s})}function qt(e,t){const{c:s,h:i}=Ue(e);return Ye("light"===t?{l:.43,c:s,h:i}:{l:.84,c:Math.min(s,.09),h:i})}function Ut(e,t,s,i,a){const n=Je(s,e,4.5,a)??t;return{"--pv-text-secondary":n,"--pv-text-muted":Je(i,e,3,a)??n}}function Wt(e,t,s){if("plain"===e)return{"--pv-header-gradient":t["--pv-card-bg"],"--pv-header-text":t["--pv-text"],"--pv-header-muted":t["--pv-text-secondary"]};const i=Rt[e],a="solid_accent"===e?t["--pv-accent"]:i?i[s]:e,n=i&&"solid_accent"!==e?"#FFFFFF":qe(a);return{"--pv-header-gradient":a,"--pv-header-text":n,"--pv-header-muted":"#FFFFFF"===n?"rgba(255, 255, 255, 0.85)":"rgba(26, 27, 30, 0.7)"}}function Vt(e,t){const s={...(Lt[e.pair]??Lt.planavista)[t]},i="light"===t?e.light:e.dark,a=e.light,n=i.background??("dark"===t&&a.background?function(e){const{c:t,h:s}=Ue(e);return Ye({l:.19,c:Math.min(t,.02),h:s})}(a.background):void 0);n&&Ne(n)&&Object.assign(s,function(e){if(Ue(e).l>=.6){const t=Ue(e).l>=.9?"#FFFFFF":Xe(e,.04);return{"color-scheme":"light","--pv-bg":e,"--pv-card-bg":t,"--pv-card-bg-elevated":t,"--pv-text":"#1A1B1E",...Ut(t,"#1A1B1E","#5F6670","#8E949C","darker"),"--pv-border":Xe(e,-.07),"--pv-border-subtle":Xe(e,-.035),"--pv-track":Xe(e,-.06),"--pv-chip":Xe(e,-.04),"--pv-seg":Xe(e,-.06),"--pv-seg-on":t,"--pv-event-hover":"rgba(0, 0, 0, 0.03)","--pv-backdrop":"rgba(0, 0, 0, 0.3)"}}const t=Xe(e,.045);return{"color-scheme":"dark","--pv-bg":e,"--pv-card-bg":t,"--pv-card-bg-elevated":Xe(e,.075),"--pv-text":"#E9E9E6",...Ut(t,"#E9E9E6","#A3A7AE","#6F747C","lighter"),"--pv-border":Xe(e,.115),"--pv-border-subtle":Xe(e,.07),"--pv-track":Xe(e,.12),"--pv-chip":Xe(e,.075),"--pv-seg":Xe(e,.075),"--pv-seg-on":Xe(e,.16),"--pv-event-hover":"rgba(255, 255, 255, 0.04)","--pv-backdrop":"rgba(0, 0, 0, 0.6)"}}(n));const r=i.accent??("dark"===t&&a.accent?Ke(a.accent):void 0);r&&Ne(r)&&Object.assign(s,function(e,t,s){return{"--pv-accent":e,"--pv-accent-text":qe(e),"--pv-accent-ink":Je(e,t,4.5)??qe(t),"--pv-accent-tint":"light"===s?Ht(e):Ge(e),"--pv-accent-tint-ink":qt(e,s),"--pv-today-bg":jt(e,"light"===s?.06:.1)}}(r,s["--pv-card-bg"],t));const o=i.header??("dark"===t&&a.header?a.header.startsWith("#")?function(e){const{l:t,c:s,h:i}=Ue(e);return Ye({l:Math.min(t,.4),c:.8*s,h:i})}(a.header):a.header:void 0);o?Object.assign(s,Wt(o,s,t)):n&&s["--pv-header-gradient"]===Lt[e.pair]?.[t]["--pv-card-bg"]&&Object.assign(s,Wt("plain",s,t));const l=i.now_color??("dark"===t&&a.now_color?Ke(a.now_color):void 0);l&&Ne(l)&&(s["--pv-now-color"]=l);const d=Bt[e.shape.corner_style??""];d&&(s["--pv-radius"]=d.radius,s["--pv-radius-lg"]=d.radiusLg,s["--pv-radius-sm"]=d.radiusSm);const c=Ot[e.shape.shadow_depth??""];c&&(s["--pv-shadow"]=c.shadow,s["--pv-shadow-lg"]=c.shadowLg,s["--pv-shadow-xl"]=c.shadowXl);const p=e.shape.avatar_border;return"white"===p||"light"===p?s["--pv-avatar-border"]="#FFFFFF":p&&Ne(p)&&(s["--pv-avatar-border"]=p),s}function Yt(e,t,s){return"light"!==s&&Ne(e)?{color:Ke(e),colorLight:Ge(e)}:{color:e,colorLight:t||e}}const Kt=new WeakMap;function Gt(e,t){if(!e||"light"===t)return e;const s=new Map,i=(e,i)=>{const a=`${e}|${i??""}`;let n=s.get(a);return n||(n=Yt(e,i,t),s.set(a,n)),n};return{...e,calendars:(e.calendars||[]).map(e=>{const{color:t,colorLight:s}=i(e.color,e.color_light);return{...e,color:t,color_light:s}}),events:(e.events||[]).map(e=>{const{color:t,colorLight:s}=i(e.calendar_color,e.calendar_color_light);return{...e,calendar_color:t,calendar_color_light:s}})}}const Xt={number:28,row:21,more:14};class Jt extends de{constructor(){super(...arguments),this.events=[],this.calendars=[],this.currentDate=new Date,this.hiddenCalendars=new Set,this.timeFormat="12h",this.hideColumnHeaders=!1,this.avatarBorderMode="primary",this.sharedEventMap=new Map,this.tick=0,this.layout="landscape",this.progress=null,this.revision=0,this._hourPx=80,this._measured=null}connectedCallback(){super.connectedCallback(),this.hasUpdated&&this._watchHours()}_openDay(e){this.dispatchEvent(new CustomEvent("pv-open",{detail:{module:"chores",view:"my_day",member:e},bubbles:!0,composed:!0}))}disconnectedCallback(){super.disconnectedCallback(),this._hoursObserver?.disconnect(),this._measured=null}firstUpdated(){this._watchHours(),this._fitHours(),this._scrollToNow()}updated(e){super.updated(e),e.has("currentDate")&&this._scrollToNow(),this._watchHours(),e.has("layout")&&this._fitHours()}_watchHours(){const e=this.shadowRoot?.querySelector(".time-grid-wrapper")??null;e!==this._measured&&(this._hoursObserver?.disconnect(),this._measured=e,e&&"undefined"!=typeof ResizeObserver&&(this._hoursObserver??=new ResizeObserver(()=>this._fitHours()),this._hoursObserver.observe(e)))}_fitHours(){const e=this._measured;if(!e)return;const t=(s=this.layout,i=e.clientHeight,"portrait"===s&&i>0?Math.max(48,Math.min(80,Math.floor(i/14))):80);var s,i;if(t===this._hourPx)return;const a=(n=e.scrollTop,o=t,(r=this._hourPx)>0?Math.round(n*o/r):n);var n,r,o;this._hourPx=t,this.updateComplete.then(()=>{e.scrollTop=a})}_scrollToNow(){requestAnimationFrame(()=>{const e=this.shadowRoot?.querySelector(".time-grid-wrapper");if(!e)return;this._scrollContainer=e;const t=new Date,s=60*(t.getHours()-0)+t.getMinutes();if(s>0&&s<1440){const t=s/1440*e.scrollHeight-e.clientHeight/3;e.scrollTo({top:Math.max(0,t),behavior:"smooth"})}})}render(){const e=Be(this.events,this.hiddenCalendars),t=new Date(this.currentDate);t.setHours(0,0,0,0);const s=new Date(this.currentDate);s.setHours(23,59,59,999);const i=Pe(e,t,s),a=i.filter(e=>Ae(e)),n=i.filter(e=>!Ae(e)),r=this.calendars.filter(e=>!1!==e.visible&&!this.hiddenCalendars.has(e.entity_id)),o=function(e,t){const s=new Map,i=new Map(t.map(e=>[e.entity_id,e]));for(const e of t)if(!1!==e.visible){const t=e.person_entity||e.entity_id;s.has(t)||s.set(t,[])}for(const t of e){const e=i.get(t.calendar_entity_id),a=e?.person_entity||t.calendar_entity_id;s.has(a)||s.set(a,[]),s.get(a).push(t)}return s}(n,r),l=Array.from(o.keys()),d=new Date,c=d.toDateString()===this.currentDate.toDateString(),p=60*(d.getHours()-0)+d.getMinutes(),h=c?p/1440*100:-1;return 0===r.length?U`
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
            ${l.map(e=>{const t=r.find(t=>(t.person_entity||t.entity_id)===e),s=t?.person_entity?it(this.hass,t.person_entity):null,i=t?.person_entity?at(this.hass,t.person_entity):t?.display_name||e,a=t?.color||"#6366F1",n=t?.color_light||a,o="light"===this.avatarBorderMode?n:"primary"===this.avatarBorderMode?a:this.avatarBorderMode,l=s?U`<img class="person-avatar" src="${s}" alt="${i}"
                    style="${o?`--pv-avatar-border: ${o}`:""}" />`:U`<div class="person-initial" style="background: ${a}; color: ${qe(a)}">${i[0]?.toUpperCase()||"?"}</div>`,d=c&&t?.member_id&&this.progress?function(e,t){if(!t||t.due<=0)return null;const s=Math.min(t.due,t.done+t.pending),i=s>=t.due;return{fraction:s/t.due,closed:i,label:i?`${e}, ring closed for today. Open ${e}'s day`:`${e}, ${s} of ${t.due} done today. Open ${e}'s day`}}(i,this.progress(t.member_id)):null;return U`
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
              ${l.map(e=>this._renderColumn(e,o.get(e)||[]))}
            </div>
          </div>
          ${this._renderNextDayFooter()}
        </div>
      </div>
    `}_renderTimeLabels(){const e=[];for(let t=0;t<=24;t++){const s=(t-0)/24*100;let i;if("24h"===this.timeFormat)i=`${String(t%24).padStart(2,"0")}:00`;else{const e=t%24;i=`${e%12||12} ${e>=12?"PM":"AM"}`}e.push(U`
        <div class="time-label" style="top: ${s}%">${i}</div>
      `)}return e}_renderHourLines(){const e=[],t=1/24*100;for(let s=0;s<24;s++){const i=(s-0)/24*100;s%2==1&&e.push(U`
          <div class="hour-band-odd" style="top: ${i}%; height: ${t}%"></div>
        `)}return e}_renderNextDayFooter(){const e=new Date(this.currentDate);e.setDate(e.getDate()+1);const t=e.toLocaleDateString("en-US",{weekday:"long",month:"long",day:"numeric"});return U`
      <div class="next-day-footer" @click=${this._goToNextDay}>
        ${t}
        <ha-icon icon="mdi:arrow-down"></ha-icon>
      </div>
    `}_goToToday(){this.dispatchEvent(new CustomEvent("day-click",{detail:{date:new Date},bubbles:!0,composed:!0}))}_goToNextDay(){const e=new Date(this.currentDate);e.setDate(e.getDate()+1),this.dispatchEvent(new CustomEvent("day-click",{detail:{date:e},bubbles:!0,composed:!0}))}_renderColumn(e,t){const s=function(e){const t=e.filter(e=>!Ae(e)).sort((e,t)=>we(e.start).getTime()-we(t.start).getTime());if(0===t.length)return[];const s=t.map(e=>({event:e,start:we(e.start).getTime(),end:we(e.end).getTime(),column:0,cluster:0}));let i=0,a=0;for(let e=0;e<s.length;e++){let t=!1;for(let i=a;i<e;i++)if(s[e].start<s[i].end){t=!0;break}if(!t&&e>a){const t=e;let n=0;for(let e=a;e<t;e++)n=Math.max(n,s[e].column+1);for(let e=a;e<t;e++)s[e].cluster=i;i++,a=e}const n=new Set;for(let t=a;t<e;t++)s[e].start<s[t].end&&n.add(s[t].column);let r=0;for(;n.has(r);)r++;s[e].column=r}s.forEach((e,t)=>{t>=a&&(e.cluster=i)});const n=new Map;for(const e of s){const t=n.get(e.cluster)||0;n.set(e.cluster,Math.max(t,e.column+1))}return s.map(e=>({...e.event,column:e.column,totalColumns:n.get(e.cluster)||1}))}(t);return U`
      <div class="person-column">
        ${s.map(e=>{const t=function(e,t=0,s=24,i){const a=we(e.start),n=we(e.end),r=60*(s-t),o=i??a,l=new Date(o.getFullYear(),o.getMonth(),o.getDate(),t),d=new Date(o.getFullYear(),o.getMonth(),o.getDate(),s),c=e=>e<=l?0:e>=d?r:60*(e.getHours()-t)+e.getMinutes(),p=c(a),h=c(n),u=Math.max(h-p,15);return{top:p/r*100,height:u/r*100}}(e,0,24,this.currentDate),s=e.totalColumns>1?`calc(${100/e.totalColumns}% - 6px)`:"calc(100% - 6px)",i=e.totalColumns>1?`calc(${e.column/e.totalColumns*100}% + 3px)`:"3px",a=e.uid?this.sharedEventMap.get(e.uid):void 0,n=a&&a.length>1;return U`
            <div
              class="positioned-event${De(e)?" past":""}"
              style="
                top: ${t.top}%;
                height: ${t.height}%;
                width: ${s};
                left: ${i};
                --event-color: ${e.calendar_color};
                --event-color-light: ${e.calendar_color_light||""};
                --event-text: ${qe(e.calendar_color_light||e.calendar_color)};
              "
              @click=${()=>this._onEventClick(e)}
            >
              <div class="event-title">${e.summary}</div>
              <div class="event-time">${xe(e.start,this.timeFormat)}</div>
              ${n?U`
                <div class="event-participants">
                  ${a.map(e=>{const t=e.person_entity?it(this.hass,e.person_entity):null,s=e.person_entity?at(this.hass,e.person_entity):e.calendar_name;return t?U`<img class="event-participant-avatar"
                          src="${t}" alt="${s}"
                          style="--participant-color: ${e.calendar_color}" />`:U`<div class="event-participant-initial"
                          style="background: ${e.calendar_color}; --participant-color: ${e.calendar_color}; color: ${qe(e.calendar_color)}"
                        >${s[0]?.toUpperCase()||"?"}</div>`})}
                </div>
              `:Y}
            </div>
          `})}
      </div>
    `}_onEventClick(e){this.dispatchEvent(new CustomEvent("event-click",{detail:{event:e},bubbles:!0,composed:!0}))}}function Qt(e,t=48){return(Zt[e]||Zt.cloudy)(t)}Jt.styles=[nt,lt,pt,ht,r`
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
    </svg>`};function es(e){try{const t=e();t&&"function"==typeof t.catch&&t.catch(()=>{})}catch{}}function ts(e){return Math.min(3e4,1e3*2**e)}class ss{constructor(e){this._onForecast=e,this._entityId="",this._unsub=null,this._generation=0,this._attempt=0,this._hadForecast=!1,this._onReady=()=>{this._connection&&this._entityId&&(this._generation++,this._unsub=null,this._cancelRetry(),this._subscribe())}}update(e,t,s){if(this._legacy=s,!t||!e){const e=""!==this._entityId;return this.stop(),void(e&&this._onForecast([]))}t===this._entityId&&e===this._connection||(this.stop(),this._entityId=t,this._connection=e,e.addEventListener?.("ready",this._onReady),this._subscribe())}stop(){if(this._generation++,this._cancelRetry(),this._connection?.removeEventListener?.("ready",this._onReady),this._connection=void 0,this._entityId="",this._hadForecast=!1,this._unsub){const e=this._unsub;this._unsub=null,es(e)}}_subscribe(){const e=this._connection;if(!e)return;const t=this._generation;e.subscribeMessage(e=>{t===this._generation&&(this._hadForecast=!0,this._onForecast(e?.forecast||[]))},{type:"weather/subscribe_forecast",forecast_type:"daily",entity_id:this._entityId},{resubscribe:!1}).then(e=>{t===this._generation?(this._unsub=e,this._attempt=0):es(e)}).catch(()=>{if(t!==this._generation)return;const e=this._attempt>=6;!e&&this._hadForecast||this._onForecast(this._legacy||[]),e||(this._retry=setTimeout(()=>{this._retry=void 0,t===this._generation&&this._subscribe()},ts(this._attempt++)))})}_cancelRetry(){void 0!==this._retry&&clearTimeout(this._retry),this._retry=void 0,this._attempt=0}}function is(e){const t=new Map;for(const s of e)s.datetime&&t.set(Ee(we(s.datetime)),{condition:s.condition||"",tempHigh:s.temperature??0,tempLow:s.templow??s.temperature??0});return t}const as=["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];class ns extends de{constructor(){super(...arguments),this.events=[],this.calendars=[],this.currentDate=new Date,this.hiddenCalendars=new Set,this.timeFormat="12h",this.firstDay="sunday",this.forecast=[],this.showStripes=!0,this.tick=0,this.layout="landscape"}_getWeekDays(){const e=Fe(this.currentDate,this.firstDay);return Array.from({length:7},(t,s)=>{const i=new Date(e);return i.setDate(i.getDate()+s),i})}_getWeekLabel(e){const t=e[0],s=e[6],i={month:"long",day:"numeric"};return t.getMonth()===s.getMonth()?`${t.toLocaleDateString("en-US",{month:"long"})} ${t.getDate()} – ${s.getDate()}`:`${t.toLocaleDateString("en-US",i)} – ${s.toLocaleDateString("en-US",i)}`}render(){const e=Be(this.events,this.hiddenCalendars),t=this._getWeekDays(),s=new Date(t[0]);s.setHours(0,0,0,0);const i=new Date(t[6]);i.setHours(23,59,59,999);const a=Se(Pe(e,s,i),this.calendars),n=is(this.forecast);return U`
      <div class="week-container">
        <div class="week-label">${this._getWeekLabel(t)}</div>
        <div class="day-grid">
          ${t.map(e=>this._renderDayCard(e,a,n))}
        </div>
      </div>
    `}_renderDayCard(e,t,s){const i=ke(e),a=Ee(e),n=new Date(e);n.setHours(0,0,0,0);const r=new Date(e);r.setHours(23,59,59,999);const o=Pe(t,n,r).sort(Me),l=s.get(a),d=`${as[e.getDay()]} ${e.getDate()}`,c=o.length;return U`
      <div class="day-card ${i?"day-card--today":""}">
        <div class="day-card-header">
          <div class="day-card-header-left">
            <div class="day-name">${d}</div>
            <div class="day-meta">
              <span>${c} event${1!==c?"s":""}</span>
              <button class="add-event-link" @click=${()=>this._addEvent(e)}>+ Add</button>
            </div>
          </div>
          ${l?U`
            <div class="day-weather">
              ${Qt(l.condition)}
              <span class="day-weather-temp">${Math.round(l.tempHigh)}°/${Math.round(l.tempLow)}°</span>
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
    `}_addEvent(e){this.dispatchEvent(new CustomEvent("create-event",{detail:{date:e},bubbles:!0,composed:!0}))}_onEventClick(e){this.dispatchEvent(new CustomEvent("event-click",{detail:{event:e},bubbles:!0,composed:!0}))}}ns.styles=[nt,ht,r`
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
    `],e([ue({attribute:!1})],ns.prototype,"hass",void 0),e([ue({type:Array})],ns.prototype,"events",void 0),e([ue({type:Array})],ns.prototype,"calendars",void 0),e([ue({type:Object})],ns.prototype,"currentDate",void 0),e([ue({type:Object})],ns.prototype,"hiddenCalendars",void 0),e([ue({attribute:!1})],ns.prototype,"timeFormat",void 0),e([ue({attribute:!1})],ns.prototype,"firstDay",void 0),e([ue({attribute:!1})],ns.prototype,"forecast",void 0),e([ue({type:Boolean})],ns.prototype,"showStripes",void 0),e([ue({type:Number})],ns.prototype,"tick",void 0),e([ue({type:String,reflect:!0})],ns.prototype,"layout",void 0),ge("pv-view-week",ns);const rs=["Sun","Mon","Tue","Wed","Thu","Fri","Sat"],os=["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];class ls extends de{constructor(){super(...arguments),this.events=[],this.calendars=[],this.currentDate=new Date,this.hiddenCalendars=new Set,this.firstDay="sunday",this.timeFormat="12h",this.showStripes=!0,this.tick=0,this.layout="landscape",this._fit={cell:0,normal:Xt,today:Xt}}connectedCallback(){super.connectedCallback(),this.hasUpdated&&this._observeGrid()}disconnectedCallback(){super.disconnectedCallback(),this._gridObserver?.disconnect()}firstUpdated(){this._observeGrid()}updated(){this._measure()}_observeGrid(){const e=this.shadowRoot?.querySelector(".month-grid");e&&"undefined"!=typeof ResizeObserver&&(this._gridObserver??=new ResizeObserver(()=>this._measure()),this._gridObserver.disconnect(),this._gridObserver.observe(e))}_measure(){const e=this.shadowRoot?.querySelector(".month-grid");if(!e||0===e.clientHeight)return;const t=e.querySelector(".day-events"),s=t&&parseFloat(getComputedStyle(t).rowGap)||0,i=e.querySelector("pv-event-chip"),a=e.querySelector(".more-events"),n=i?Math.ceil(i.getBoundingClientRect().height+s):Xt.row,r=a?Math.ceil(a.getBoundingClientRect().height+s):Xt.more,o=e=>{const t=e?.querySelector(".day-events");if(!e||!t)return Xt.number;const s=parseFloat(getComputedStyle(e).borderBottomWidth)||0;return Math.ceil(t.getBoundingClientRect().top-e.getBoundingClientRect().top+s)},l={number:o(e.querySelector(".day-cell:not(.today)")),row:n,more:r},d=e.querySelector(".day-cell.today"),c={cell:Math.floor(e.clientHeight/6),normal:l,today:d?{...l,number:o(d)}:l};JSON.stringify(c)!==JSON.stringify(this._fit)&&(this._fit=c)}render(){const e=Se(Be(this.events,this.hiddenCalendars),this.calendars),t=function(e,t="sunday"){const s=Fe(new Date(e.getFullYear(),e.getMonth(),1),t),i=[];for(let e=0;e<42;e++){const t=new Date(s);t.setDate(s.getDate()+e),i.push(t)}return i}(this.currentDate,this.firstDay),s=Te(e),i=this.currentDate.getMonth(),a="monday"===this.firstDay?os:rs,n=this.currentDate.toLocaleDateString("en-US",{month:"long",year:"numeric"});return U`
      <div class="month-container">
        <div class="month-name">${n}</div>
        <div class="weekday-header">
          ${a.map(e=>U`<div class="weekday-name">${e}</div>`)}
        </div>
        <div class="month-grid">
          ${t.map(e=>this._renderDayCell(e,i,s))}
        </div>
      </div>
    `}_renderDayCell(e,t,s){const i=Ee(e),a=s.get(i)||[],n=e.getMonth()!==t,r=ke(e),{shown:o,more:l}=function(e,t,s=Xt){if(!(t>0)){const t=Math.min(e,3);return{shown:t,more:e-t}}const i=t-s.number;if(e<=Math.floor(i/s.row))return{shown:e,more:0};const a=Math.min(e,Math.max(1,Math.floor((i-s.more)/s.row)));return{shown:a,more:e-a}}(a.length,this._fit.cell,r?this._fit.today:this._fit.normal),d=a.slice(0,o);return U`
      <div
        class="day-cell ${n?"other-month":""} ${r?"today":""}"
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
    `}_onDayClick(e){this.dispatchEvent(new CustomEvent("day-click",{detail:{date:e},bubbles:!0,composed:!0}))}_onEventClick(e){this.dispatchEvent(new CustomEvent("event-click",{detail:{event:e},bubbles:!0,composed:!0}))}}ls.styles=[nt,r`
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
    `],e([ue({attribute:!1})],ls.prototype,"hass",void 0),e([ue({type:Array})],ls.prototype,"events",void 0),e([ue({type:Array})],ls.prototype,"calendars",void 0),e([ue({type:Object})],ls.prototype,"currentDate",void 0),e([ue({type:Object})],ls.prototype,"hiddenCalendars",void 0),e([ue({attribute:!1})],ls.prototype,"firstDay",void 0),e([ue({attribute:!1})],ls.prototype,"timeFormat",void 0),e([ue({type:Boolean})],ls.prototype,"showStripes",void 0),e([ue({type:Number})],ls.prototype,"tick",void 0),e([ue({type:String,reflect:!0})],ls.prototype,"layout",void 0),e([me()],ls.prototype,"_fit",void 0),ge("pv-view-month",ls);const ds=["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];class cs extends de{constructor(){super(...arguments),this.events=[],this.calendars=[],this.currentDate=new Date,this.hiddenCalendars=new Set,this.timeFormat="12h",this.forecast=[],this.showStripes=!0,this.tick=0,this.layout="landscape",this._daysLoaded=14}render(){const e=new Date;e.setHours(0,0,0,0);const t=[];for(let s=0;s<this._daysLoaded;s++){const i=new Date(e);i.setDate(i.getDate()+s),t.push(i)}const s=Te(Se(Be(this.events,this.hiddenCalendars),this.calendars)),i=is(this.forecast);return U`
      <div class="agenda-container">
        ${t.map(e=>this._renderDayCard(e,s,i))}
        <div class="load-more" @click=${this._loadMore}>
          Load more days
        </div>
      </div>
    `}_renderDayCard(e,t,s){const i=Ee(e),a=t.get(i)||[],n=ke(e),r=s.get(i),o=function(e){if(ke(e))return"Today";if(function(e){const t=new Date;return t.setDate(t.getDate()+1),e.getFullYear()===t.getFullYear()&&e.getMonth()===t.getMonth()&&e.getDate()===t.getDate()}(e))return"Tomorrow";const t=new Date,s=Math.floor((e.getTime()-t.getTime())/864e5);return s<7&&s>=0?e.toLocaleDateString("en-US",{weekday:"long"}):$e(e,"medium")}(e),l=$e(e,"long"),d=[...a].sort(Me);return U`
      <div class="day-card ${n?"day-card--today":""}">
        <div class="day-card-header">
          <div class="day-card-header-left">
            <span class="day-name ${n?"day-name--today":""}">
              ${ds[e.getDay()]} ${e.getDate()}
            </span>
            ${o?U`<span class="day-relative">${o}</span>`:U`<span class="day-relative">${l}</span>`}
          </div>
          ${r?U`
            <div class="day-weather">
              ${Qt(r.condition,20)}
              <span class="day-weather-temps">${Math.round(r.tempHigh)}°/${Math.round(r.tempLow)}°</span>
            </div>
          `:Y}
        </div>
        <div class="day-subheader">
          <span>${d.length} event${1!==d.length?"s":""}</span>
          <button class="add-event-link" @click=${()=>this._addEvent(e)}>+ Add event</button>
        </div>
        <div class="day-events">
          ${d.length>0?d.map(e=>U`
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
    `}_loadMore(){this._daysLoaded+=14}_addEvent(e){this.dispatchEvent(new CustomEvent("create-event",{detail:{date:e},bubbles:!0,composed:!0}))}_onEventClick(e){this.dispatchEvent(new CustomEvent("event-click",{detail:{event:e},bubbles:!0,composed:!0}))}}cs.styles=[nt,ht,r`
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
    `],e([ue({attribute:!1})],cs.prototype,"hass",void 0),e([ue({type:Array})],cs.prototype,"events",void 0),e([ue({type:Array})],cs.prototype,"calendars",void 0),e([ue({type:Object})],cs.prototype,"currentDate",void 0),e([ue({type:Object})],cs.prototype,"hiddenCalendars",void 0),e([ue({attribute:!1})],cs.prototype,"timeFormat",void 0),e([ue({attribute:!1})],cs.prototype,"forecast",void 0),e([ue({type:Boolean})],cs.prototype,"showStripes",void 0),e([ue({type:Number})],cs.prototype,"tick",void 0),e([ue({type:String,reflect:!0})],cs.prototype,"layout",void 0),e([me()],cs.prototype,"_daysLoaded",void 0),ge("pv-view-agenda",cs);class ps extends de{constructor(){super(...arguments),this.event=null,this.timeFormat="12h",this._confirmDelete=!1,this._deleteMode=null,this._deleting=!1,this._deleteError="",this._organizerEntityId=null,this._storeSubscription=new zt(this,()=>this.store),this._lastOrganizerUid=""}updated(e){if(super.updated(e),e.has("event")&&this.event){const e=this.event.shared_calendars,t=this.event.uid||"";e&&e.length>1&&t&&t!==this._lastOrganizerUid?(this._lastOrganizerUid=t,this._organizerEntityId=null,this._fetchOrganizer(this.event.calendar_entity_id,t)):(!e||e.length<=1)&&(this._organizerEntityId=null,this._lastOrganizerUid="")}}async _fetchOrganizer(e,t){this._organizerEntityId=await st(this.hass,e,t)}render(){if(!this.event)return Y;const e=this.event,t=Ae(e),s=we(e.start),i=e.shared_calendars,a=i&&i.length>1;return U`
      <div class="pv-overlay" @click=${this._close}>
        <div class="pv-popup" @click=${e=>e.stopPropagation()} style="position: relative;">
          <button class="pv-btn-icon close-btn" @click=${this._close}>
            <ha-icon icon="mdi:close"></ha-icon>
          </button>

          <div class="popup-header">
            <h3 class="popup-title">${e.summary}</h3>
            ${a?U`
              <div class="participants-row">
                ${i.map(e=>U`
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
                <div>${$e(s,"long")}</div>
                ${t?U`
                  <div style="color: var(--pv-text-secondary); font-size: 0.875rem">All Day</div>
                `:U`
                  <div style="color: var(--pv-text-secondary); font-size: 0.875rem">
                    ${xe(e.start,this.timeFormat)} – ${xe(e.end,this.timeFormat)}
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
                  This event is shared across ${i.length} calendars.
                </div>
                <div style="display: flex; flex-direction: column; gap: 0.5rem;">
                  <button class="delete-option" @click=${()=>{this._deleteMode="all"}}>
                    <ha-icon icon="mdi:delete-outline"></ha-icon>
                    <div class="delete-option-text">
                      <div class="delete-option-label">Delete for everyone</div>
                      <div class="delete-option-desc">Removes the event from all ${i.length} calendars</div>
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
                  ${"all"===this._deleteMode&&a?`Delete "${e.summary}" from all ${i.length} calendars?`:"remove-me"===this._deleteMode&&a?`Remove "${e.summary}" from ${e.calendar_name}'s calendar only?`:`Delete "${e.summary}"?`}
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
    `}_close(){this._confirmDelete=!1,this._deleteMode=null,this._deleting=!1,this._deleteError="",this.store.selectEvent(null)}_edit(){this.event&&this.store.openEditDialog(this.event)}_openRemoveGuests(){this.event&&(this._confirmDelete=!1,this._deleteMode=null,this.store.openEditDialog(this.event,{removeGuests:!0}))}async _delete(){if(!this.event?.uid)return void(this._deleteError="Cannot delete this event: it has no unique ID. Delete it from your calendar app directly.");const e=this.event.shared_calendars,t=e&&e.length>1;this._deleting=!0,this._deleteError="";try{if(t&&"all"===this._deleteMode){for(const t of e)try{await et(this.hass,{entity_id:t.entity_id,uid:this.event.uid,recurrence_id:this.event.recurrence_id})}catch(e){console.warn(`[PlanaVista] Failed to delete from ${t.entity_id}:`,e)}await tt(this.hass),this.store.selectEvent(null)}else if(t&&"remove-me"===this._deleteMode){const e=this.event.calendar_entity_id;await et(this.hass,{entity_id:e,uid:this.event.uid,recurrence_id:this.event.recurrence_id}),await tt(this.hass),this.store.selectEvent(null)}else{const e={entity_id:this.event.calendar_entity_id,uid:this.event.uid,recurrence_id:this.event.recurrence_id};await this.store.doDeleteEvent(this.hass,e)}}catch(e){console.error("PlanaVista: Delete failed",e),this._deleteError="Failed to delete event. Please try again.",this._deleting=!1}}}function hs(e){const t=[e.housenumber,e.street].filter(Boolean).join(" "),s=[];for(const i of[e.name,t,e.city,e.state,e.postcode,e.country]){const e=(i||"").trim();e&&!s.some(t=>t.toLowerCase()===e.toLowerCase())&&s.push(e)}return s.join(", ")}ps.styles=[nt,ot,dt,ht,r`
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
    `],e([ue({attribute:!1})],ps.prototype,"hass",void 0),e([ue({type:Object})],ps.prototype,"event",void 0),e([ue({attribute:!1})],ps.prototype,"timeFormat",void 0),e([me()],ps.prototype,"_confirmDelete",void 0),e([me()],ps.prototype,"_deleteMode",void 0),e([me()],ps.prototype,"_deleting",void 0),e([me()],ps.prototype,"_deleteError",void 0),e([me()],ps.prototype,"_organizerEntityId",void 0),e([ue({attribute:!1})],ps.prototype,"store",void 0),ge("pv-event-popup",ps);class us{constructor(e){this._opts=e,this._timer=null,this._abort=null,this._seq=0,this._fetch=e.fetchFn??((e,t)=>fetch(e,t))}input(e,t){this.cancel();const s=e.trim();if(!t||s.length<3)return this._opts.onResults([]),void this._opts.onLoading(!1);this._opts.onLoading(!0);const i=this._seq;this._timer=setTimeout(()=>{this._timer=null,this._run(s,i)},350)}cancel(){this._seq++,this._timer&&(clearTimeout(this._timer),this._timer=null),this._abort&&(this._abort.abort(),this._abort=null)}async _run(e,t){const s=new AbortController;this._abort=s;try{const a=await this._fetch((i=e,`https://photon.komoot.io/api/?q=${encodeURIComponent(i)}&limit=5&lang=en`),{signal:s.signal,credentials:"omit",referrerPolicy:"no-referrer"});if(!a.ok)throw new Error(`Photon HTTP ${a.status}`);const n=await a.json();t===this._seq&&this._opts.onResults(function(e){const t=e?.features;if(!Array.isArray(t))return[];const s=[];for(const e of t){const t=hs(e?.properties||{});if(t&&!s.includes(t)&&s.push(t),5===s.length)break}return s}(n))}catch{t===this._seq&&this._opts.onResults([])}finally{t===this._seq&&(this._abort=null,this._opts.onLoading(!1))}var i}}const ms=["Su","Mo","Tu","We","Th","Fr","Sa"];class vs extends de{constructor(){super(...arguments),this.calendars=[],this.open=!1,this.mode="create",this.prefill=null,this.timeFormat="12h",this.locationAutocomplete=!1,this._title="",this._selectedCalendars=new Set,this._originalCalendars=new Set,this._organizerEntityId="",this._date="",this._startTime="",this._endTime="",this._allDay=!1,this._spanDays=1,this._endDayOffset=0,this._description="",this._location="",this._showMore=!1,this._saving=!1,this._error="",this._removeGuestsHint=!1,this._datePickerOpen=!1,this._pickerMonth=0,this._pickerYear=0,this._activeTimePicker=null,this._locationSuggestions=[],this._locationLoading=!1,this._locationFocused=!1,this._locationSearch=new us({onResults:e=>{this._locationSuggestions=e},onLoading:e=>{this._locationLoading=e}}),this._storeSubscription=new zt(this,()=>this.store)}disconnectedCallback(){super.disconnectedCallback(),this._locationSearch.cancel()}updated(e){super.updated(e),e.has("locationAutocomplete")&&!this.locationAutocomplete&&this._resetLocationSearch(),e.has("open")&&this.open&&(this._initForm(),this._datePickerOpen=!1,requestAnimationFrame(()=>{this._titleInput?.focus()}))}_initForm(){if(this._error="",this._saving=!1,this._showMore=!1,this._resetLocationSearch(),this._locationFocused=!1,this._removeGuestsHint=!!this.prefill?._removeGuestsHint,this.prefill){this._title=this.prefill.summary||"",this._description=this.prefill.description||"",this._location=this.prefill.location||"";const e=this.prefill.shared_calendars;e&&e.length>0?this._selectedCalendars=new Set(e.map(e=>e.entity_id)):this.prefill.calendar_entity_id?this._selectedCalendars=new Set([this.prefill.calendar_entity_id]):this._selectedCalendars=new Set([this.calendars[0]?.entity_id].filter(Boolean)),this._originalCalendars=new Set(this._selectedCalendars),e&&e.length>1&&this.prefill.uid?(this._organizerEntityId="",this._fetchOrganizer(this.prefill.calendar_entity_id||"",this.prefill.uid)):this._organizerEntityId=this.prefill.calendar_entity_id||"",this.prefill.start?this._applyDates(function(e,t){const s=we(e);if(_e(e)){const e=t?we(t):s;return{date:Ee(s),allDay:!0,startTime:"09:00",endTime:"10:00",spanDays:Math.max(1,Ce(s,e)),endDayOffset:0}}const i=t?we(t):new Date(s.getTime()+36e5);return{date:Ee(s),allDay:!1,startTime:yt(s),endTime:yt(i),spanDays:1,endDayOffset:Math.max(0,Ce(s,i))}}(this.prefill.start,this.prefill.end)):this._setDefaults(),(this._description||this._location)&&(this._showMore=!0)}else this._setDefaults()}async _fetchOrganizer(e,t){const s=await st(this.hass,e,t);s&&(this._organizerEntityId=s)}_setDefaults(){this._title="",this._selectedCalendars=new Set,this._originalCalendars=new Set,this._organizerEntityId="",this._applyDates(function(e){const t=new Date(e);t.setMinutes(15*Math.ceil(t.getMinutes()/15),0,0);const s=new Date(t.getTime()+36e5);return{date:Ee(t),allDay:!1,startTime:yt(t),endTime:yt(s),spanDays:1,endDayOffset:Ce(t,s)}}(new Date)),this._description="",this._location=""}get _formDates(){return{date:this._date,allDay:this._allDay,startTime:this._startTime,endTime:this._endTime,spanDays:this._spanDays,endDayOffset:this._endDayOffset}}_applyDates(e){this._date=e.date,this._allDay=e.allDay,this._startTime=e.startTime,this._endTime=e.endTime,this._spanDays=e.spanDays,this._endDayOffset=e.endDayOffset;const[t,s]=e.date.split("-").map(Number);this._pickerYear=t,this._pickerMonth=s-1}_toDateStr(e){return`${e.getFullYear()}-${String(e.getMonth()+1).padStart(2,"0")}-${String(e.getDate()).padStart(2,"0")}`}_renderEndsHint(){const e=this._formDates;if(!(e.allDay?e.spanDays>1:e.endDayOffset>0))return Y;const[t,s,i]=function(e){return e.allDay?_t(e.date,Math.max(1,e.spanDays)-1):_t(e.date,e.endDayOffset)}(e).split("-").map(Number),a=new Date(t,s-1,i).toLocaleDateString("en-US",{weekday:"short",month:"short",day:"numeric"});return U`<div class="ends-hint">${e.allDay?`Through ${a} (${e.spanDays} days)`:`Ends ${a}`}</div>`}_formatDateDisplay(){if(!this._date)return"Select a date";const[e,t,s]=this._date.split("-").map(Number);return new Date(e,t-1,s).toLocaleDateString("en-US",{weekday:"short",month:"long",day:"numeric",year:"numeric"})}render(){if(!this.open)return Y;const e=this.calendars.filter(e=>!1!==e.visible),t="edit"===this.mode,s=t?"Edit Event":"New Event";return U`
      <div class="pv-overlay" @click=${this._onOverlayClick}>
        <div class="pv-dialog" @click=${e=>e.stopPropagation()}>
          <div class="pv-dialog-header">
            <span class="pv-heading-2">${s}</span>
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
                  ${e.map(e=>{const s=this._selectedCalendars.has(e.entity_id),i=e.entity_id===this._organizerEntityId,a=t&&i;return U`
                      <div class="cal-option-wrap">
                        ${i&&s?U`<span class="organizer-badge">Organizer</span>`:Y}
                        <button
                          class="cal-option ${s?"selected":""} ${a?"locked":""}"
                          style="${s?`background: ${e.color}; --cal-bg: ${e.color}; color: ${qe(e.color)}`:`--cal-bg: ${e.color}`}"
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
    `}_renderDatePickerDropdown(){if(!this._datePickerOpen)return Y;const e=this._dateDisplay;if(!e)return Y;const t=e.getBoundingClientRect(),s=window.innerHeight-t.bottom-8<330&&t.top>330?t.top-330-4:t.bottom+4;return U`
      <div
        class="date-picker-dropdown"
        style="top: ${s}px; left: ${t.left}px;"
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
          ${ms.map(e=>U`<span class="picker-weekday">${e}</span>`)}
        </div>
        <div class="picker-days">
          ${this._getPickerDays().map(e=>{const t=e.getMonth()!==this._pickerMonth,s=this._toDateStr(e)===this._toDateStr(new Date),i=this._toDateStr(e)===this._date;return U`
              <button
                class="picker-day ${t?"other-month":""} ${s?"today":""} ${i?"selected":""}"
                @click=${()=>this._selectPickerDay(e)}
              >${e.getDate()}</button>
            `})}
        </div>
      </div>
    `}_toggleDatePicker(){if(this._activeTimePicker=null,this._datePickerOpen=!this._datePickerOpen,this._datePickerOpen&&this._date){const[e,t]=this._date.split("-").map(Number);this._pickerYear=e,this._pickerMonth=t-1}}_pickerPrevMonth(){this._pickerMonth--,this._pickerMonth<0&&(this._pickerMonth=11,this._pickerYear--)}_pickerNextMonth(){this._pickerMonth++,this._pickerMonth>11&&(this._pickerMonth=0,this._pickerYear++)}_getPickerDays(){const e=new Date(this._pickerYear,this._pickerMonth,1),t=e.getDay(),s=new Date(e);s.setDate(s.getDate()-t);const i=[];for(let e=0;e<42;e++){const t=new Date(s);t.setDate(t.getDate()+e),i.push(t)}return i}_selectPickerDay(e){this._date=this._toDateStr(e),this._datePickerOpen=!1}_formatTimeForDisplay(e){if(!e)return"Select time";const[t,s]=e.split(":").map(Number);if("24h"===this.timeFormat)return`${String(t).padStart(2,"0")}:${String(s).padStart(2,"0")}`;const i=t>=12?"PM":"AM";return`${t%12||12}:${String(s).padStart(2,"0")} ${i}`}_getTimeSlots(){const e=[];for(let t=0;t<24;t++)for(let s=0;s<60;s+=15)e.push(`${String(t).padStart(2,"0")}:${String(s).padStart(2,"0")}`);return e}_openTimePicker(e){this._datePickerOpen=!1,this._activeTimePicker=this._activeTimePicker===e?null:e,this._activeTimePicker&&this.updateComplete.then(()=>{const e=this.renderRoot.querySelector(".time-picker-dropdown"),t=e?.querySelector(".time-slot.selected");t&&e&&(e.scrollTop=t.offsetTop-e.clientHeight/2+t.clientHeight/2)})}_selectTime(e){if("start"===this._activeTimePicker){const t=function(e,t){const s={...e,startTime:t};if(0===e.endDayOffset&&e.endTime<=t){const[e,i]=t.split(":").map(Number);s.endTime=`${bt((e+1)%24)}:${bt(i)}`,s.endDayOffset=e+1>=24?1:0}else 1===s.endDayOffset&&s.endTime>t&&(s.endDayOffset=0);return s}(this._formDates,e);this._startTime=t.startTime,this._endTime=t.endTime,this._endDayOffset=t.endDayOffset}else{const t=function(e,t){const s={...e,endTime:t};return 1===e.endDayOffset&&t>e.startTime&&(s.endDayOffset=0),s}(this._formDates,e);this._endTime=t.endTime,this._endDayOffset=t.endDayOffset}this._activeTimePicker=null}_renderTimePickerDropdown(){if(!this._activeTimePicker)return Y;const e="start"===this._activeTimePicker?this._startTimeEl:this._endTimeEl;if(!e)return Y;const t=e.getBoundingClientRect(),s="start"===this._activeTimePicker?this._startTime:this._endTime,i=this._getTimeSlots(),a=window.innerHeight-t.bottom-8<280&&t.top>280?t.top-280-4:t.bottom+4;return U`
      <div
        class="time-picker-dropdown"
        style="top: ${a}px; left: ${t.left}px; width: ${t.width}px;"
      >
        ${i.map(e=>U`
          <div
            class="time-slot ${e===s?"selected":""}"
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
    `}_onLocationInput(e){const t=e.target.value;this._location=t,this._locationSearch.input(t,this.locationAutocomplete)}_selectLocation(e){this._resetLocationSearch(),this._location=e,this._locationFocused=!1}_toggleCalendar(e){if("edit"===this.mode&&e===this._organizerEntityId)return;const t=new Set(this._selectedCalendars);t.has(e)?(t.delete(e),e===this._organizerEntityId&&(this._organizerEntityId=t.size>0?[...t][0]:"")):(t.add(e),this._organizerEntityId||(this._organizerEntityId=e)),this._selectedCalendars=t,this._removeGuestsHint=!1}_onOverlayClick(){this._close()}_close(){this._datePickerOpen=!1,this._activeTimePicker=null,this._resetLocationSearch(),this.store.closeDialog()}async _editFallback(e,t,s){const i=this.prefill?.uid,a=this.prefill?.recurrence_id,n=this.prefill?.calendar_entity_id,r=[...t].filter(e=>!s.has(e)),o=[...s].filter(e=>!t.has(e)),l=[...t].filter(e=>s.has(e));if(n&&l.includes(n)&&i){const t=Ft(this.prefill,n,e);await this.store.doEditEvent(this.hass,t.deleteData,t.createData,t.restoreData)}else n&&o.includes(n)&&i&&await et(this.hass,{entity_id:n,uid:i,recurrence_id:a});for(const t of l)if(t!==n){if(i)try{await et(this.hass,{entity_id:t,uid:i,recurrence_id:a})}catch{}await Qe(this.hass,{...e,entity_id:t})}for(const t of r)await Qe(this.hass,{...e,entity_id:t});for(const e of o)if(e!==n&&i)try{await et(this.hass,{entity_id:e,uid:i,recurrence_id:a})}catch{}await tt(this.hass),this.store.selectedEvent=null,this.store.closeDialog()}async _save(){if(!this._title.trim())return void(this._error="Please enter an event title");if(0===this._selectedCalendars.size)return void(this._error="Please select at least one calendar");const e=function(e){if(!_e(e.date))return"Please pick a date";if(e.allDay)return null;if(!gt.test(e.startTime)||!gt.test(e.endTime))return"Please pick a start and end time";const t=wt(e.date,e.startTime);return wt(_t(e.date,e.endDayOffset),e.endTime)>t?null:"End time must be after start time"}(this._formDates);if(e)this._error=e;else{this._error="",this._saving=!0;try{const e=function(e,t){const s={summary:t.summary.trim(),...xt(e)},i=t.description?.trim(),a=t.location?.trim();return i&&(s.description=i),a&&(s.location=a),s}(this._formDates,{summary:this._title,description:this._description,location:this._location}),t=this._selectedCalendars,s=this._originalCalendars;if("edit"===this.mode){const i=this.prefill?.uid,a=s.size>1,n=this._organizerEntityId||this.prefill?.calendar_entity_id||"";if(a&&i&&n){const a=[...t];try{await async function(e,t){const s={type:"planavista/update_event",entity_id:t.entity_id,uid:t.uid};return void 0!==t.summary&&(s.summary=t.summary),void 0!==t.description&&(s.description=t.description),void 0!==t.location&&(s.location=t.location),t.start_date_time&&(s.start_date_time=t.start_date_time),t.end_date_time&&(s.end_date_time=t.end_date_time),t.start_date&&(s.start_date=t.start_date),t.end_date&&(s.end_date=t.end_date),t.attendee_entity_ids&&(s.attendee_entity_ids=t.attendee_entity_ids),e.callWS(s)}(this.hass,{entity_id:n,uid:i,summary:e.summary,description:e.description||"",location:e.location||"",start_date_time:e.start_date_time,end_date_time:e.end_date_time,start_date:e.start_date,end_date:e.end_date,attendee_entity_ids:a})}catch(i){console.warn("[PlanaVista] update_event WS failed, falling back to delete+recreate:",i),await this._editFallback(e,t,s)}const r=[...t,...s],o=this.hass;this.store.selectedEvent=null,this.store.closeDialog(),setTimeout(async()=>{try{const e=[...new Set(r)];for(const t of e)await o.callService("homeassistant","update_entity",{entity_id:t});await tt(o)}catch{}},3e3)}else if(t.size>1&&i){const s=this.prefill,i=s.calendar_entity_id,a=n||[...t][0],r=[...t].filter(e=>e!==a);try{await St({remove:()=>et(this.hass,$t(s,i)),create:()=>Ze(this.hass,{...e,entity_id:a,attendee_entity_ids:r}),restore:()=>Qe(this.hass,kt(s,i))})}catch(e){throw await tt(this.hass).catch(()=>{}),e}const o=[...t],l=this.hass;this.store.selectedEvent=null,this.store.closeDialog(),setTimeout(async()=>{try{for(const e of o)await l.callService("homeassistant","update_entity",{entity_id:e});await tt(l)}catch{}},3e3)}else{const t=this.prefill?.calendar_entity_id||"",s=Ft(this.prefill,t,e);await this.store.doEditEvent(this.hass,s.deleteData,s.createData,s.restoreData)}}else{const s=[...t];if(s.length>1){const i=this._organizerEntityId||s[0],a=s.filter(e=>e!==i);await Ze(this.hass,{...e,entity_id:i,attendee_entity_ids:a}),this.store.closeDialog();const n=[...t],r=this.hass;setTimeout(async()=>{try{for(const e of n)await r.callService("homeassistant","update_entity",{entity_id:e});await tt(r)}catch{}},3e3)}else{const t={...e,entity_id:s[0]};await this.store.doCreateEvent(this.hass,t)}}}catch(e){this._error=e instanceof Et?e.message:`Failed to save event: ${e?.message||"Unknown error"}`,this._saving=!1}}}}vs.styles=[nt,ot,ct,dt,ht,r`
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
    `],e([ue({attribute:!1})],vs.prototype,"hass",void 0),e([ue({type:Array})],vs.prototype,"calendars",void 0),e([ue({type:Boolean})],vs.prototype,"open",void 0),e([ue({type:String})],vs.prototype,"mode",void 0),e([ue({type:Object})],vs.prototype,"prefill",void 0),e([ue({attribute:!1})],vs.prototype,"timeFormat",void 0),e([ue({attribute:!1})],vs.prototype,"locationAutocomplete",void 0),e([me()],vs.prototype,"_title",void 0),e([me()],vs.prototype,"_selectedCalendars",void 0),e([me()],vs.prototype,"_originalCalendars",void 0),e([me()],vs.prototype,"_organizerEntityId",void 0),e([me()],vs.prototype,"_date",void 0),e([me()],vs.prototype,"_startTime",void 0),e([me()],vs.prototype,"_endTime",void 0),e([me()],vs.prototype,"_allDay",void 0),e([me()],vs.prototype,"_spanDays",void 0),e([me()],vs.prototype,"_endDayOffset",void 0),e([me()],vs.prototype,"_description",void 0),e([me()],vs.prototype,"_location",void 0),e([me()],vs.prototype,"_showMore",void 0),e([me()],vs.prototype,"_saving",void 0),e([me()],vs.prototype,"_error",void 0),e([me()],vs.prototype,"_removeGuestsHint",void 0),e([me()],vs.prototype,"_datePickerOpen",void 0),e([me()],vs.prototype,"_pickerMonth",void 0),e([me()],vs.prototype,"_pickerYear",void 0),e([me()],vs.prototype,"_activeTimePicker",void 0),e([me()],vs.prototype,"_locationSuggestions",void 0),e([me()],vs.prototype,"_locationLoading",void 0),e([me()],vs.prototype,"_locationFocused",void 0),e([ue({attribute:!1})],vs.prototype,"store",void 0),e([ve("#title-input")],vs.prototype,"_titleInput",void 0),e([ve(".location-input")],vs.prototype,"_locationInput",void 0),e([ve(".date-display")],vs.prototype,"_dateDisplay",void 0),e([ve(".start-time-display")],vs.prototype,"_startTimeEl",void 0),e([ve(".end-time-display")],vs.prototype,"_endTimeEl",void 0),ge("pv-event-create-dialog",vs);class gs extends de{constructor(){super(...arguments),this.data=null,this.mode="light",this.shape={},this.forecast=[],this.layout="landscape",this.services={},this.revision=0,this._tick=Math.floor(Date.now()/6e4),this._filterOpen=!1,this._refreshing=!1,this._pv=new At(this),this._progressOf=e=>this.services?.chores?.memberProgress?.(e)??null,this._overlayOpen=!1,this._tickTimer=null,this._touchStart=null,this._filterCloseHandler=e=>this._onFilterClickOutside(e),this._derive=vt((e,t,s,i)=>function(e,t,s){const i=Mt(e,t),a=e?.events||[],n=new Map;for(const e of a){const t=e.uid;if(!t)continue;n.has(t)||n.set(t,[]);const s=n.get(t),a=e.calendar_entity_id;if(!s.some(e=>e.entity_id===a)){const t=i.find(e=>e.entity_id===a);s.push({entity_id:a,calendar_name:e.calendar_name||t?.display_name||"",calendar_color:e.calendar_color||t?.color||"",person_entity:t?.person_entity||""})}}return{calendars:i,visibleEvents:Be(a,s),sharedEventMap:n}}(Gt(e,i),t,s))}connectedCallback(){super.connectedCallback(),this._tick=Math.floor(Date.now()/6e4),this._scheduleTick()}disconnectedCallback(){super.disconnectedCallback(),this._tickTimer&&(clearTimeout(this._tickTimer),this._tickTimer=null),document.removeEventListener("click",this._filterCloseHandler),this._overlayOpen&&(this._overlayOpen=!1,this._fireOverlay(!1))}updated(e){super.updated(e);const t=this._pv.store,s=!(!t.selectedEvent&&!t.dialogOpen);s!==this._overlayOpen&&(this._overlayOpen=s,this._fireOverlay(s))}_fireOverlay(e){this.dispatchEvent(new CustomEvent("pv-overlay-change",{detail:{open:e},bubbles:!0,composed:!0}))}_scheduleTick(){this._tickTimer&&clearTimeout(this._tickTimer),this._tickTimer=setTimeout(()=>{this._tick=Math.floor(Date.now()/6e4),this._scheduleTick()},6e4-Date.now()%6e4+50)}willUpdate(e){e.has("view")&&this.view&&this._pv.store.setView(this.view)}_derived(){return this._derive(this.data,this.cardConfig,this._pv.store.hiddenCalendars,this.mode)}render(){if(!this.hass||!this.display)return Y;const{calendars:e,visibleEvents:t}=this._derived(),s=this._pv.store,i=this.display;return U`
      ${this._renderToolbar(e)}
      <div class="pvc-body"
        @touchstart=${this._onTouchStart}
        @touchend=${this._onTouchEnd}
        @touchcancel=${this._onTouchCancel}
        @event-click=${this._onEventClick}
        @day-click=${this._onDayClick}
        @create-event=${this._onCreateEvent}
      >
        ${this._renderView(s.currentView,t,e,i)}
      </div>

      ${s.selectedEvent?U`
        <pv-event-popup
          .store=${s}
          .hass=${this.hass}
          .event=${s.selectedEvent}
          .timeFormat=${i?.time_format||"12h"}
        ></pv-event-popup>
      `:Y}

      ${s.dialogOpen?U`
        <pv-event-create-dialog
          .store=${s}
          .hass=${this.hass}
          .calendars=${e}
          .open=${!0}
          .mode=${s.dialogOpen}
          .prefill=${s.createPrefill}
          .timeFormat=${i?.time_format||"12h"}
          .locationAutocomplete=${!0===i.location_autocomplete}
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
              ${e.map(e=>{const t=!this._pv.store.hiddenCalendars.has(e.entity_id),s=e.person_entity?it(this.hass,e.person_entity):null,i=e.display_name||(e.person_entity?at(this.hass,e.person_entity):e.entity_id),a=(i||"?")[0].toUpperCase();return U`
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
          ${e.map(e=>{const t=!this._pv.store.hiddenCalendars.has(e.entity_id),s=e.person_entity?it(this.hass,e.person_entity):null,i=e.display_name||(e.person_entity?at(this.hass,e.person_entity):e.entity_id),a=(i||"?")[0].toUpperCase();return U`
              <button
                class="pvc-cal-chip ${t?"active":""}"
                style="--chip-color: ${e.color}; --chip-ink: ${qe(e.color)}"
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
    `}_toggleFilterDropdown(e){e.stopPropagation(),this._filterOpen=!this._filterOpen,this._filterOpen?requestAnimationFrame(()=>{document.addEventListener("click",this._filterCloseHandler)}):document.removeEventListener("click",this._filterCloseHandler)}_onFilterClickOutside(e){const t=e.composedPath(),s=this.shadowRoot?.querySelector(".pvc-filter-panel"),i=this.shadowRoot?.querySelector(".pvc-filter-btn");s&&!t.includes(s)&&i&&!t.includes(i)&&(this._filterOpen=!1,document.removeEventListener("click",this._filterCloseHandler))}_renderView(e,t,s,i){const a=i?.time_format||"12h",n=i?.first_day||"sunday",r=this._pv.store.currentDate,o=this._pv.store.hiddenCalendars,l=this.shape.avatar_border||"primary",d="stripes"===(this.shape.event_style||"stripes");switch(e){case"day":{const{sharedEventMap:e}=this._derived(),i=this._tick;return U`<pv-view-day
          layout=${this.layout}
          .hass=${this.hass}
          .events=${t}
          .calendars=${s}
          .currentDate=${r}
          .hiddenCalendars=${o}
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
          .currentDate=${r}
          .hiddenCalendars=${o}
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
          .currentDate=${r}
          .hiddenCalendars=${o}
          .firstDay=${n}
          .timeFormat=${a}
          .showStripes=${d}
          .tick=${e}
        ></pv-view-month>`}case"agenda":{const e=this._tick;return U`<pv-view-agenda
          layout=${this.layout}
          .hass=${this.hass}
          .events=${t}
          .calendars=${s}
          .currentDate=${r}
          .hiddenCalendars=${o}
          .timeFormat=${a}
          .forecast=${this.forecast}
          .showStripes=${d}
          .tick=${e}
        ></pv-view-agenda>`}default:return Y}}_onEventClick(e){const t=e.detail.event,s=Gt(this.data,this.mode)?.events||[];this._pv.store.selectEvent(function(e,t){if(e.uid){const s=t.filter(t=>t.uid===e.uid&&""!==t.uid),i=new Set,a=s.filter(e=>!i.has(e.calendar_entity_id)&&(i.add(e.calendar_entity_id),!0));if(a.length>1){const t=a.map(e=>({entity_id:e.calendar_entity_id,calendar_name:e.calendar_name,calendar_color:e.calendar_color}));return{...e,shared_calendars:t}}}const s=e.shared_calendars;if(s?.length){const t=s.map(t=>({entity_id:t.entity_id,calendar_name:t.calendar_name??t.display_name??"",calendar_color:t.calendar_color??t.color??e.calendar_color}));return{...e,shared_calendars:t}}return e}(t,s))}_onCreateEvent(e){const t=e.detail?.date,s={};if(t){const e=t.getFullYear(),i=String(t.getMonth()+1).padStart(2,"0"),a=String(t.getDate()).padStart(2,"0");s.start=`${e}-${i}-${a}T09:00:00`,s.end=`${e}-${i}-${a}T10:00:00`}this._pv.store.openCreateDialog(s)}_onDayClick(e){this._pv.store.setDate(e.detail.date),this.dispatchEvent(new CustomEvent("pv-view-change",{detail:{view:"day"},bubbles:!0,composed:!0}))}_onTouchStart(e){this._touchStart=1===e.touches.length?{x:e.touches[0].clientX,y:e.touches[0].clientY}:null}_onTouchEnd(e){const t=this._touchStart;if(this._touchStart=null,!t||e.touches.length>0||1!==e.changedTouches.length)return;const s=e.changedTouches[0],i=mt(s.clientX-t.x,s.clientY-t.y);i&&this._pv.store.navigateDate(i)}_onTouchCancel(){this._touchStart=null}async _refreshCalendars(){if(!this._refreshing){this._refreshing=!0;try{for(const e of this.data?.calendars||[])e.entity_id&&await this.hass.callService("homeassistant","update_entity",{entity_id:e.entity_id});await this.hass.callService("homeassistant","update_entity",{entity_id:this.cardConfig?.entity||"sensor.planavista_config"})}catch{}setTimeout(()=>{this._refreshing=!1},800)}}}gs.styles=[nt,ot,rt,ht,r`
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
    `],e([ue({attribute:!1})],gs.prototype,"hass",void 0),e([ue({attribute:!1})],gs.prototype,"cardConfig",void 0),e([ue({attribute:!1})],gs.prototype,"data",void 0),e([ue({attribute:!1})],gs.prototype,"display",void 0),e([ue({attribute:!1})],gs.prototype,"mode",void 0),e([ue({attribute:!1})],gs.prototype,"shape",void 0),e([ue({attribute:!1})],gs.prototype,"forecast",void 0),e([ue({attribute:!1})],gs.prototype,"view",void 0),e([ue({type:String,reflect:!0})],gs.prototype,"layout",void 0),e([ue({attribute:!1})],gs.prototype,"services",void 0),e([ue({attribute:!1})],gs.prototype,"revision",void 0),e([me()],gs.prototype,"_tick",void 0),e([me()],gs.prototype,"_filterOpen",void 0),e([me()],gs.prototype,"_refreshing",void 0),ge("pv-calendar-module",gs);const bs=r`
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
`;class ys{constructor(e,t,s){this._message=e,this._onEvent=t,this._onStatus=s,this.status="idle",this._unsub=null,this._generation=0,this._attempt=0,this._hadEvent=!1,this._onReady=()=>{this._connection&&(this._generation++,this._unsub=null,this._cancelRetry(),this._subscribe())},this._onDisconnected=()=>{this._connection&&this._setStatus("offline")}}update(e){e!==this._connection&&(this.stop(),this._connection=e,e&&(e.addEventListener("ready",this._onReady),e.addEventListener("disconnected",this._onDisconnected),this._subscribe()))}stop(){if(this._generation++,this._cancelRetry(),this._connection?.removeEventListener("ready",this._onReady),this._connection?.removeEventListener("disconnected",this._onDisconnected),this._connection=void 0,this._hadEvent=!1,this._unsub){const e=this._unsub;this._unsub=null,es(e)}this._setStatus("idle")}retry(){this._connection&&"live"!==this.status&&"connecting"!==this.status&&(this._generation++,this._cancelRetry(),this._subscribe())}_subscribe(){const e=this._connection;if(!e)return;const t=this._generation;"offline"!==this.status&&this._setStatus("connecting"),e.subscribeMessage(e=>{t===this._generation&&(this._hadEvent=!0,this._onEvent(e))},this._message,{resubscribe:!1}).then(e=>{t===this._generation?(this._unsub=e,this._attempt=0,this._setStatus("live")):es(e)}).catch(()=>{t===this._generation&&(this._hadEvent||this._onEvent(null),this._setStatus("offline"),this._retry=setTimeout(()=>{this._retry=void 0,t===this._generation&&this._subscribe()},ts(this._attempt++)))})}_setStatus(e){e!==this.status&&(this.status=e,this._onStatus?.(e))}_cancelRetry(){void 0!==this._retry&&clearTimeout(this._retry),this._retry=void 0,this._attempt=0}}function fs(e){return e&&"object"==typeof e&&"string"==typeof e.code?e.code:"unknown"}function _s(e){return e&&"object"==typeof e&&"string"==typeof e.message?e.message:null}const ws=new Set(["parent_mode_required","pin_required"]);class xs{constructor(e,t,s){this._ws=e,this._session=t,this._onSessionEnded=s}call(e,t,s=!0){const i={type:e,...t},a=s?this._session():null;return a?(i.session=a,this._ws.callWS(i).catch(e=>{throw ws.has(fs(e))&&this._onSessionEnded?.(a),e})):this._ws.callWS(i)}}class $s extends ys{constructor(e){super({type:"planavista/household/subscribe"},e)}}class ks extends xs{saveMember(e,t){const s={member:e};return t&&(s.member_id=t.id,void 0!==t.rev&&(s.rev=t.rev)),this.call("planavista/household/member/save",s)}deleteMember(e){return this.call("planavista/household/member/delete",{member_id:e})}reorder(e){return this.call("planavista/household/member/reorder",{order:e})}setSharedScreen(e){return this.call("planavista/household/shared_screen",{shared:e})}saveSecurity(e){return this.call("planavista/household/settings/save",e)}saveSetup(e){return this.call("planavista/household/setup/save",e)}saveConfig(e){return this.call("planavista/config/save",e)}unlock(e,t){return this.call("planavista/pin/unlock",{member_id:e,pin:t},!1)}setPin(e,t){return this.call("planavista/pin/set",{member_id:e,pin:t})}clearPin(e){return this.call("planavista/pin/clear",{member_id:e})}clearPause(e){return this.call("planavista/pin/clear_lockout",{member_id:e})}lock(e){return this.call("planavista/pin/lock",{session:e},!1)}touch(e){return this.call("planavista/pin/touch",{session:e},!1)}}const Fs="pv-push-page",Es="pv-pop-page",Cs="pv-page-error",Ss="pv-page-open";function Ds(e){switch(e){case"parent_mode_required":return"Parent mode ended. Enter a parent's PIN to keep changing settings.";case"not_allowed":return"Only a parent can change this.";case"unavailable":return"Update PlanaVista to change people and PINs.";default:return"Couldn't save. Check the connection and try again."}}class As extends de{constructor(){super(...arguments),this.household=null,this.layout="landscape",this.mode="settings",this._loaded=!1}willUpdate(){!this._loaded&&this.data?.display&&(this._draft={...this.data.display},this._loaded=!0)}_apply(e){this._draft={...this._draft,...e},this.api.saveConfig({display:e}).catch(e=>this._error(e))}_error(e){this.dispatchEvent(new CustomEvent(Cs,{detail:{message:Ds(fs(e))},bubbles:!0,composed:!0}))}get _weatherEntities(){return this.hass?Object.keys(this.hass.states).filter(e=>e.startsWith("weather.")).sort():[]}_entityLabel(e){return this.hass?.states[e]?.attributes?.friendly_name||e}_toggleLocationAutocomplete(){this._apply({location_autocomplete:!this._draft.location_autocomplete})}_renderPreferences(){return U`
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
    `}render(){return this._loaded?this._renderPreferences():Y}}As.styles=[nt,ot,ct,ht,bs,r`
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
    `],e([ue({attribute:!1})],As.prototype,"hass",void 0),e([ue({attribute:!1})],As.prototype,"data",void 0),e([ue({attribute:!1})],As.prototype,"household",void 0),e([ue({attribute:!1})],As.prototype,"api",void 0),e([ue({attribute:!1})],As.prototype,"layout",void 0),e([ue({type:String})],As.prototype,"mode",void 0),e([me()],As.prototype,"_draft",void 0),ge("pv-calendar-options-page",As);const zs={young_child:"Young child",older_child:"Older child",teen:"Teen",adult:"Adult"},Ms=[{id:"young_child",label:"Young child",hint:"About 4 to 8"},{id:"older_child",label:"Older child",hint:"About 9 to 12"},{id:"teen",label:"Teen",hint:""},{id:"adult",label:"Adult",hint:""}],Ts={young_child:"Pictures and big buttons. Every chore needs an OK.",older_child:"A list with pictures. Chores marked Needs an OK wait for one.",teen:"The full list and a timeline. Chores marked Needs an OK wait for one.",adult:"The full list and a timeline. No OKs needed."},Ps=[{id:"parent",label:"Parent"},{id:"adult",label:"Adult"},{id:"teen",label:"Teen"},{id:"older_child",label:"Older child"},{id:"young_child",label:"Young child"}];function Bs(e){return e.parent?"parent":e.age_group}function Os(e){return"parent"===e?{age_group:"adult",parent:!0}:{age_group:e,parent:!1}}function Rs(e){return[...e].sort((e,t)=>e.order-t.order||e.id.localeCompare(t.id))}function Ns(e){const t=[...e.trim()][0];return t?t.toLocaleUpperCase():"?"}function Is(e){return Rs(e).filter(e=>e.parent&&e.has_pin)}function Ls(e,t){return e&&e.available?e.account.parent_level?"open":"shared"===e.account.kind||"other"===e.account.kind?Is(e.members).length>0?"pin":"no_pin":"none":t?"open":"none"}function js(e,t){return t.filter(t=>t.member_id===e)}function Hs(e,t){const s=new Map;for(const i of e)i.id!==t&&s.set(i.color.toUpperCase(),i);return s}function qs(e,t){return"light"===t?e.color:e.color_dark||Ke(e.color)}class Us extends de{constructor(){super(...arguments),this.value="",this.valueLight="",this._isCustom=!1}updated(e){if(super.updated(e),e.has("value")&&this.value){const e=Us.PRESETS.some(e=>e.color.toLowerCase()===this.value.toLowerCase());this._isCustom=!e}}_selectPreset(e){this._isCustom=!1,this._emit(e.color,e.light)}_openCustomPicker(){this._colorInput?.click()}_onCustomColorChange(e){const t=e.target.value,s=function(e){let t=e.replace("#","");if(3===t.length&&(t=t.split("").map(e=>e+e).join("")),6!==t.length)return e;const s=parseInt(t.substring(0,2),16),i=parseInt(t.substring(2,4),16),a=parseInt(t.substring(4,6),16);if(isNaN(s)||isNaN(i)||isNaN(a))return e;const n=Math.round(s+.65*(255-s)),r=Math.round(i+.65*(255-i)),o=Math.round(a+.65*(255-a)),l=e=>e.toString(16).padStart(2,"0");return`#${l(n)}${l(r)}${l(o)}`}(t);this._isCustom=!0,this._emit(t,s)}_emit(e,t){this.value=e,this.valueLight=t,this.dispatchEvent(new CustomEvent("color-change",{detail:{color:e,colorLight:t},bubbles:!0,composed:!0}))}_isSelected(e){return this.value.toLowerCase()===e.toLowerCase()}render(){const e=Us.PRESETS,t=this._isCustom?this.value:"",s=this._isCustom&&!!this.value;return U`
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
    `}}Us.PRESETS=[{name:"Ink Black",color:"#001219",light:"#A6ACAF"},{name:"Dark Teal",color:"#005F73",light:"#A6C7CE"},{name:"Dark Cyan",color:"#0A9396",light:"#A9D9DA"},{name:"Pearl Aqua",color:"#94D2BD",light:"#DAEFE8"},{name:"Wheat",color:"#E9D8A6",light:"#F7F1E0"},{name:"Golden Orange",color:"#EE9B00",light:"#F9DCA6"},{name:"Burnt Caramel",color:"#CA6702",light:"#ECCAA6"},{name:"Rusty Spice",color:"#BB3E03",light:"#E7BBA7"},{name:"Oxidized Iron",color:"#AE2012",light:"#E3B1AC"},{name:"Brown Red",color:"#9B2226",light:"#DCB2B3"},{name:"Strawberry Red",color:"#F94144",light:"#FDBDBE"},{name:"Pumpkin Spice",color:"#F3722C",light:"#FBCEB5"},{name:"Carrot Orange",color:"#F8961E",light:"#FDDAB0"},{name:"Atomic Tangerine",color:"#F9844A",light:"#FDD4C0"},{name:"Tuscan Sun",color:"#F9C74F",light:"#FDEBC1"},{name:"Willow Green",color:"#90BE6D",light:"#D8E8CC"},{name:"Seaweed",color:"#43AA8B",light:"#BDE1D6"},{name:"Ocean Cyan",color:"#4D908E",light:"#C1D8D7"},{name:"Blue Slate",color:"#577590",light:"#C4CFD8"},{name:"Cerulean",color:"#277DA1",light:"#B3D2DE"}],Us.styles=[nt,r`
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
    `],e([ue({type:String})],Us.prototype,"value",void 0),e([ue({type:String})],Us.prototype,"valueLight",void 0),e([me()],Us.prototype,"_isCustom",void 0),e([ve("#custom-color-input")],Us.prototype,"_colorInput",void 0),ge("pv-color-swatch-picker",Us);const Ws=new Set(["state","attributes"]);class Vs extends de{constructor(){super(...arguments),this.household=null,this.layout="landscape",this.mode="settings",this._rows=[],this._dragIdx=null,this._dragOverIdx=null,this._built=!1}willUpdate(){if(!this._built&&this.hass&&this.data){const e=Object.keys(this.hass.states).filter(e=>e.startsWith("calendar."));this._rows=function(e,t,s,i){const a=[],n=new Set;for(const t of e){const e=i[a.length%i.length];n.add(t.entity_id),a.push({saved:Object.fromEntries(Object.entries(t).filter(([e])=>!Ws.has(e))),entity_id:t.entity_id,display_name:t.display_name||t.entity_id,color:t.color||e.color,color_light:t.color_light||e.light,person_entity:t.person_entity||"",member_id:t.member_id??null,include:!0})}for(const e of t.filter(e=>!n.has(e)).sort()){const t=i[a.length%i.length];a.push({saved:null,entity_id:e,display_name:s(e)||e,color:t.color,color_light:t.light,person_entity:"",member_id:null,include:!1})}return a}(this.data.calendars,e,e=>this.hass.states[e]?.attributes?.friendly_name,Us.PRESETS),this._built=!0}}_save(){var e;this.api.saveConfig({calendars:(e=this._rows,e.filter(e=>e.include).map(e=>({icon:"mdi:calendar",visible:!0,...e.saved??{},entity_id:e.entity_id,display_name:e.display_name,color:e.color,color_light:e.color_light,person_entity:e.person_entity,member_id:e.member_id})))}).catch(e=>this._error(e))}_error(e){this.dispatchEvent(new CustomEvent(Cs,{detail:{message:Ds(fs(e))},bubbles:!0,composed:!0}))}get _personEntities(){return this.hass?Object.keys(this.hass.states).filter(e=>e.startsWith("person.")).sort():[]}_personLabel(e){return this._entityLabel(e)}_entityLabel(e){return this.hass?.states[e]?.attributes?.friendly_name||e}_updateCalendar(e,t,s=!0){const i=[...this._rows];i[e]={...i[e],...t},this._rows=i,s&&this._save()}_onCalendarColorChange(e,t){t.stopPropagation(),this._updateCalendar(e,{color:t.detail.color,color_light:t.detail.colorLight})}_renderCalendars(){return 0===this._rows.length?U`
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
    `}_renderBelongsTo(e,t){if(!this.household?.available)return Y;const s=Rs(this.household.members),i=function(e,t){if(e.person_entity){const s=t.find(t=>t.person===e.person_entity);if(s)return{memberId:s.id,viaPerson:!0}}const s=t.some(t=>t.id===e.member_id)?e.member_id:null;return{memberId:s,viaPerson:!1}}(e,s);return U`
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
    `}render(){return this._built?this._renderCalendars():Y}}function Ys(e,t){const s=e.initialView?.(t);return e.views.some(e=>e.id===s)?s:e.views[0]?.id??""}function Ks(e,t){return e.order-t.order||e.id.localeCompare(t.id)}Vs.styles=[nt,ot,ct,ht,bs,r`
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
    `],e([ue({attribute:!1})],Vs.prototype,"hass",void 0),e([ue({attribute:!1})],Vs.prototype,"data",void 0),e([ue({attribute:!1})],Vs.prototype,"household",void 0),e([ue({attribute:!1})],Vs.prototype,"api",void 0),e([ue({attribute:!1})],Vs.prototype,"layout",void 0),e([ue({type:String})],Vs.prototype,"mode",void 0),e([me()],Vs.prototype,"_rows",void 0),e([me()],Vs.prototype,"_dragIdx",void 0),e([me()],Vs.prototype,"_dragOverIdx",void 0),ge("pv-calendar-calendars-page",Vs);const Gs=new class{constructor(){this._modules=new Map}register(e){this._modules.set(e.id,e)}get(e){return this._modules.get(e)}list(){return[...this._modules.values()].sort(Ks)}};class Xs{constructor(){this._pages=new Map}register(e){this._pages.set(e.id,e)}pages(e){return[...this._pages.values()].filter(t=>!t.applies||t.applies(e)).sort((e,t)=>e.order-t.order||e.id.localeCompare(t.id))}}const Js=[{id:"people",label:null,order:100},{id:"chores",label:"Chores",order:200},{id:"calendar",label:"Calendar",order:300},{id:"appearance",label:null,order:400},{id:"security",label:null,order:500},{id:"data",label:null,order:600},{id:"about",label:null,order:900}],Qs="pv-step-change",Zs="pv-person-change",ei=new Xs,ti=new Xs,si=new Xs,ii=new Xs,ai={id:"calendar",label:"Calendar",icon:"mdi:calendar-month",tag:"pv-calendar-module",order:10,views:[{id:"day",label:"Day"},{id:"week",label:"Week"},{id:"month",label:"Month"},{id:"agenda",label:"Agenda"}],initialView:({config:e,data:t})=>function(e,t){return e?.view||e?.default_view||t?.display?.default_view||void 0}(e,t),watchedEntities:({config:e,data:t})=>Mt(t,e).map(e=>e.person_entity).filter(e=>!!e)},ni={day:"Day",week:"Week",month:"Month",agenda:"Agenda"},ri=[{id:"calendars",label:"Calendars",group:"calendar",order:300,tag:"pv-calendar-calendars-page",summary:({data:e})=>{const t=e.calendars?.length??0;return 0===t?"None yet":`${t} ${1===t?"calendar":"calendars"}`}},{id:"calendar-options",label:"Calendar options",group:"calendar",order:310,tag:"pv-calendar-options-page",summary:({data:e})=>`${ni[e.display?.default_view??"week"]??"Week"} · ${"24h"===e.display?.time_format?"24-hour":"12-hour"}`}],oi=[{id:"calendars",label:"Calendars",order:200,tag:"pv-calendar-calendars-page",heading:"Calendars",lead:"Choose the calendars to show, and who each one belongs to."}];function li(e){return"shared"===e.account.kind||"other"===e.account.kind}function di(e,t,s){if(!e||!e.available)return"no";const i=e.account;if(i.parent_level)return"yes";if("member"===i.kind)return i.member_id===s?"yes":"no";if(!li(e))return"no";if(t&&(t.parent||t.memberId===s))return"yes";const a=e.members.find(e=>e.id===s);return a?a.has_pin?"pin":"yes":"no"}function ci(e,t){return e&&e.available?e.account.parent_level?"yes":li(e)?t?.parent?"yes":Is(e.members).length>0?"pin":"no_pin":"no":"no"}!function(e=Gs){e.register(ai)}(),function(e=ei,t=ii){for(const t of ri)e.register(t);for(const e of oi)t.register(e)}();const pi=r`
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
`,hi=["Sun","Mon","Tue","Wed","Thu","Fri","Sat"],ui=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];function mi(e){const[t,s,i]=e.split("-").map(Number);return new Date(t,s-1,i,12)}function vi(e,t){return Math.round((mi(t).getTime()-mi(e).getTime())/864e5)}function gi(e,t){const s=mi(e);return Math.abs(vi(t,e))<=6?hi[s.getDay()]:`${ui[s.getMonth()]} ${s.getDate()}`}function bi(e,t){switch(e.status){case"done":return null;case"pending":return{words:"Waiting for OK",tone:"act",glyph:"⏳"};case"sent_back":return{words:e.note?`Sent back: ${e.note}`:"Sent back",tone:"bad",glyph:"↩"};case"excused":return{words:"Excused",tone:"muted"};case"away":return{words:"Away",tone:"neutral",glyph:"🧳"}}if(e.overdue_since)return{words:`Overdue since ${gi(e.overdue_since,t.today)}`,tone:"bad",glyph:"•"};if(e.from)return{words:`From ${gi(e.from,t.today)}`,tone:"neutral"};if(e.dated&&e.due_day)return e.due_day===t.today?{words:"Due today",tone:"time"}:{words:`Due ${gi(e.due_day,t.today)}`,tone:"neutral"};if("week"===e.section&&"week"===e.window&&t.remaining>0){if(t.daysLeft<=1)return{words:"Last day",tone:"bad",glyph:"•"};if(t.remaining>=t.daysLeft)return{words:`${t.daysLeft} days left`,tone:"time",glyph:"•"}}return null}function yi(e,t){switch(e){case"done":return{words:"Done",tone:"neutral",glyph:"✓"};case"pending":return{words:"Waiting for OK",tone:"act",glyph:"⏳"};case"missed":return{words:"Missed",tone:"bad",glyph:"×"};case"carried":return{words:"Carried over",tone:"time",glyph:"•"};case"open":return{words:"Not done that day",tone:"time",glyph:"•"};case"excused":return{words:t?`Excused: ${t}`:"Excused",tone:"muted"};default:return{words:e,tone:"neutral"}}}function fi(e){const t=Math.round(e);if(t<60)return`${Math.max(1,t)} min`;const s=t/60;return Number.isInteger(s)?`${s} h`:Number.isInteger(2*s)?`${s.toFixed(1)} h`:`${Math.floor(s)} h ${t%60} min`}function _i(e,t,s){return 0===s?`${e}, nothing due today`:t>=s?`${e}, ring closed for today`:`${e}, ${t} of ${s} done today`}function wi(e,t="12h",s=!1){const i=String(e.getMinutes()).padStart(2,"0");if("24h"===t)return`${e.getHours()}:${i}`;const a=e.getHours()%12||12;return s?`${a}:${i} ${e.getHours()>=12?"PM":"AM"}`:`${a}:${i}`}function xi(e,t,s,i){if(!e)return[];const a=Mt(e,i),n=new Map(a.map(e=>[e.entity_id,e.member_id??null])),r=[];for(const i of e.events??[]){if(!n.has(i.calendar_entity_id))continue;if(!i.start||_e(i.start))continue;const e=we(i.start),a=i.end?we(i.end):e;a<=t||e>=s||r.push({title:i.summary||"Busy",start:e,end:a,calendar:i.calendar_entity_id,member:n.get(i.calendar_entity_id)??null})}return r.sort((e,t)=>e.start.getTime()-t.start.getTime())}const $i=["morning","afternoon","evening"],ki={morning:"Morning",afternoon:"Afternoon",evening:"Evening"},Fi=new Set(["open","sent_back"]);function Ei(e,t){const s=e.completion?.at;if(!s)return!1;const i=new Date(s).getTime();return i>=new Date(t.day.start).getTime()&&i<new Date(t.day.end).getTime()}function Ci(e,t="03:00"){const[s,i]=t.split(":").map(Number),a=60*e.getHours()+e.getMinutes();return a>=60*(Number.isFinite(s)?s:3)+(Number.isFinite(i)?i:0)&&a<720?"morning":a>=720&&a<1020?"afternoon":"evening"}function Si(e,t){return e.band??t}function Di(e,t){const s=$i.indexOf(e),i=$i.indexOf(t);return s<i?"past":s===i?"now":"later"}function Ai(e,t,s,i,a={}){const n=t.activities.get(e.chore),r=a.group?a.group.total-a.group.done:1,o={today:t.today,daysLeft:s.week.days_left,remaining:r};let l,d;if(e.completion&&("done"===e.status||"pending"===e.status)){l=wi(new Date(e.completion.at),t.timeFormat);const s=e.completion.done_by;d=s&&s!==e.member?t.members.find(e=>e.id===s)?.name??s:null}const c="month"===e.window?"this month":function(e,t){const s=fi(e.credit_minutes);return t&&e.stars>0?`${s} · ★ ${e.stars}`:s}(e,i);return{key:e.key,item:e,name:e.name,icon:e.icon,label:n?.label??null,badge:bi(e,o),meta:c,state:e.status,doneAt:l,doneBy:d,...a}}function zi(e){return"overdue"===e.section?null:function(e){return"week"===e.section&&"week"===e.window&&!e.planned&&!e.from&&!e.dated}(e)||"once"===e.window&&"once"===e.period?`${e.section}|${e.chore}|${e.period}`:null}function Mi(e,t){return t.members.filter(t=>e.members[t.id]).map(s=>function(e,t,s,i){const a=Ci(i.now,s.settings?.day_starts),n=!!e.stars,r=[],o=t.items,l=[],d={morning:[],afternoon:[],evening:[]},c={morning:0,afternoon:0,evening:0},p=[],h=[],u=new Map,m=[];for(const e of o){const t=zi(e);if(t)u.set(t,[...u.get(t)??[],e]);else if("overdue"!==e.section){if("today"===e.section){const t=Si(e,a);if("done"===e.status){"past"===Di(t,a)?(c[t]+=1,m.push(Ai(e,i,s,n))):l.push(Ai(e,i,s,n));continue}if("excused"===e.status||"away"===e.status)continue;d[t].push(Ai(e,i,s,n));continue}"done"!==e.status?"excused"!==e.status&&"away"!==e.status&&h.push(Ai(e,i,s,n)):Ei(e,s)&&l.push(Ai(e,i,s,n))}else Fi.has(e.status)||"pending"===e.status?p.push(Ai(e,i,s,n)):"done"===e.status&&Ei(e,s)&&l.push(Ai(e,i,s,n))}for(const[,e]of u){const t=e.filter(e=>"excused"!==e.status&&"away"!==e.status),r=t.length,o=t.filter(e=>"done"===e.status||"pending"===e.status).length,p="today"===e[0].section;for(const e of t){if("done"!==e.status||!Ei(e,s))continue;const t=Si(e,a);p&&"past"===Di(t,a)?(c[t]+=1,m.push(Ai(e,i,s,n))):l.push(Ai(e,i,s,n))}const u=t.find(e=>Fi.has(e.status))??t.find(e=>"pending"===e.status);if(!u)continue;const v={done:o,total:r},g=fi(t.reduce((e,t)=>e+t.credit_minutes,0)),b=Ai(u,i,s,n,{group:v});b.meta=r>1||"week"===u.window?`${g} · ${o} of ${r}`:b.meta,p?d[Si(u,a)].push(b):h.push(b)}if(p.length){r.push({kind:"head",key:"head:overdue",text:"Overdue",tone:"plain"});for(const e of p)r.push({kind:"row",key:e.key,row:e,zone:"overdue"})}const v=[];for(const e of $i){const t=Di(e,a),s=d[e];if("past"===t){if(0===s.length){c[e]>0&&v.push({kind:"credit",key:`credit:${e}`,text:`${ki[e]} · ${c[e]} done`});continue}const t=s.filter(e=>Fi.has(e.state)).length,i=s.length-t,a=[t?`${t} left`:"",i?`${i} waiting for OK`:"",c[e]?`${c[e]} done`:""].filter(Boolean);r.push({kind:"head",key:`head:${e}`,tone:"past",text:`${ki[e]} · ${a.join(", ")}`})}else{if(0===s.length)continue;r.push({kind:"head",key:`head:${e}`,tone:t,text:`${"now"===t?"Now":"Later"} · ${ki[e].toLowerCase()}`})}for(const e of s)r.push({kind:"row",key:e.key,row:e,zone:t})}if(h.length){const e=s.week.days_left;r.push({kind:"head",key:"head:week",text:"This week",right:1===e?"Last day":`${e} days left`,tone:"plain"});for(const e of h)r.push({kind:"row",key:e.key,row:e,zone:"week"})}if(l.length){r.push({kind:"head",key:"head:done",text:"Done today",tone:"plain"});for(const e of l)r.push({kind:"row",key:e.key,row:e,zone:"done"})}r.push(...v);const{due:g,done:b,pending:y}=t.today,f=b+y,_=g>0&&f>=g,w=[{kind:"count",text:g>0?`${Math.min(f,g)} of ${g} today`:"Nothing due today"}];n&&w.push({kind:"stars",text:`★ ${t.stars}`}),t.streak>=2&&w.push({kind:"streak",text:`🔥 ${t.streak} days`});const x=function(e,t,s){const i=function(e,t){return e.filter(e=>e.member===t)}(e,t),a=i.find(e=>e.start>s);return a?{event:a,freeUntil:!i.some(e=>e.start<=s&&e.end>s)&&a.start.getTime()-s.getTime()>=36e5}:null}(i.events,e.id,i.now),$=x?`Next on calendar: ${x.event.title} at ${wi(x.event.start,i.timeFormat)}${x.freeUntil?" · free until then":""}`:null,k=o.filter(e=>e.counted&&Fi.has(e.status)&&"week"!==e.section).length;return{member:e,entry:t,ring:{progress:g>0?Math.min(1,f/g):0,closed:_,label:_i(e.name,Math.min(f,g),g)},line:w.map(e=>e.text).join(" · "),parts:w,next:$,away:t.away?{note:t.away.note??null}:null,pictures:"young_child"===e.age_group,entries:r,doneToday:[...m,...l].sort((e,t)=>(e.item.completion?.at??"").localeCompare(t.item.completion?.at??"")),left:k,empty:0===o.length}}(s,e.members[s.id],e,t))}function Ti(e,t,s){const i=t.settings.evening_check;if(!i)return null;const[a,n]=i.split(":").map(Number),r=new Date(t.day.start),o=new Date(r.getFullYear(),r.getMonth(),r.getDate(),a,n);if(o<r&&o.setDate(o.getDate()+1),s<o||s>=new Date(t.day.end))return null;const l=e.filter(e=>e.left>0&&!e.away);if(0===l.length)return null;const d=l.map((e,t)=>0===t?`${e.member.name} has ${e.left} ${1===e.left?"chore":"chores"} left`:`${e.member.name} has ${e.left}`);return{text:`Evening check: ${1===d.length?d[0]:`${d.slice(0,-1).join(", ")} and ${d[d.length-1]}`}`,members:l.map(e=>e.member.id)}}const Pi=[[/\b(trash|garbage|bins?|recycling)\b/i,"🗑️"],[/\b(dish(es)?|dishwasher)\b/i,"🍽️"],[/\b(laundry|clothes|fold)\b/i,"🧺"],[/\bbeds?\b/i,"🛏️"],[/\btoys?\b/i,"🧸"],[/\bfish\b/i,"🐠"],[/\bcats?\b/i,"🐱"],[/\b(dogs?|walk the dog)\b/i,"🐕"],[/\b(pets?|feed)\b/i,"🐾"],[/\btable\b/i,"🍴"],[/\b(vacuum|sweep|mop|floors?)\b/i,"🧹"],[/\b(bath(room)?|toilet|shower|tub)\b/i,"🛁"],[/\b(leaf|leaves|rake)\b/i,"🍂"],[/\b(yard|garden|lawn|weeds?|mow)\b/i,"🌿"],[/\b(grocer(y|ies)|shopping|shop)\b/i,"🛒"],[/\b(plants?|flowers?)\b/i,"🪴"],[/\bcar\b/i,"🚗"],[/\b(garage|boxes|closet|attic|basement)\b/i,"📦"],[/\b(cook|dinner|lunch|breakfast|meal)\b/i,"🍳"],[/\b(homework|study|reading|read)\b/i,"📚"],[/\b(teeth|toothbrush)\b/i,"🪥"],[/\b(fix|repair|latch)\b/i,"🔨"],[/\bfilters?\b/i,"🔧"],[/\b(budget|bills?|finance|money)\b/i,"💵"],[/\b(windows?|dust|tidy|clean)\b/i,"✨"],[/\b(swim(ming)?|pool)\b/i,"🏊"],[/\b(soccer|football)\b/i,"⚽"],[/\bbasketball\b/i,"🏀"],[/\bbaseball\b/i,"⚾"],[/\b(school|class)\b/i,"🏫"],[/\bdentist\b/i,"🦷"],[/\b(doctor|checkup)\b/i,"🩺"],[/\b(piano|music|guitar|violin|band)\b/i,"🎹"],[/\b(dance|ballet)\b/i,"🩰"],[/\b(birthday|party)\b/i,"🎉"],[/\bpizza\b/i,"🍕"],[/\bmovies?\b/i,"🎬"],[/\b(practice|game|match|training)\b/i,"🏅"],[/\b(meeting|work|standup)\b/i,"💼"],[/\b(trip|travel|flight)\b/i,"🧳"],[/\b(bus)\b/i,"🚌"],[/\b(drop-off|pick-?up)\b/i,"🚗"],[/\b(church|temple|mosque)\b/i,"⛪"],[/\b(study group|tutor)\b/i,"📚"]];function Bi(e,t="⭐"){for(const[t,s]of Pi)if(t.test(e))return s;return t}function Oi(e,t){return e&&!e.startsWith("mdi:")?e:Bi(t)}const Ri={morning:0,afternoon:12,evening:17};function Ni(e,t){return`${wi(e.start,t,"12h"===t)} to ${wi(e.end,t,"12h"===t)}`}function Ii(e,t){const s=[];let i=0;for(const a of t){if("open"!==a.state&&"sent_back"!==a.state)continue;const t=a.item.credit_minutes;if(!(null!==e&&i+t>e)&&(i+=t,s.push(a.name),3===s.length))break}return s}function Li(e,t,s){const i="string"==typeof e.goal?e.goal:null,a=i?s.find(e=>e.id===i):void 0;if(!a)return null;const n=t.stars;return{reward:a,have:n,need:Math.max(0,a.cost-n),progress:a.cost>0?Math.min(1,n/a.cost):1}}const ji=["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"],Hi=["Sun","Mon","Tue","Wed","Thu","Fri","Sat"],qi=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"],Ui=["sun","mon","tue","wed","thu","fri","sat"];function Wi(e,t){const s=mi(e);s.setDate(s.getDate()+t);const i=e=>String(e).padStart(2,"0");return`${s.getFullYear()}-${i(s.getMonth()+1)}-${i(s.getDate())}`}function Vi(e,t){const s=vi(t,e),i=mi(e);return 0===s?"Today":1===s?"Tomorrow":s>1&&s<=6?Hi[i.getDay()]:s>=7&&s<=13?`Next ${Hi[i.getDay()]}`:`${qi[i.getMonth()]} ${i.getDate()}`}function Yi(e,t){const s=vi(t,e),i=mi(e);return 0===s?"today":1===s?"tomorrow":Math.abs(s)<=6?ji[i.getDay()]:`${["January","February","March","April","May","June","July","August","September","October","November","December"][i.getMonth()]} ${i.getDate()}`}function Ki(e){const t=e.map(e=>Hi[Ui.indexOf(e)]??e);return t.length<=1?t.join(""):`${t.slice(0,-1).join(", ")} and ${t[t.length-1]}`}function Gi(e,t,s){if(!e)return"";if("plan"===e.schedule){const t=e.days??[];return"day"===e.minimum?.per?t.length?Ki(t):"Every day":t.length?Ki(t):"Every week"}if("once"===e.schedule){const i=e.once;return i?.on?`Once · on ${Yi(i.on,s)}`:t.dated&&t.due_day?`Once · by ${Yi(t.due_day,s)}`:"Once · any time"}const i=e.repeats?.rrule??"";return i.includes("FREQ=DAILY")?"Repeats daily":i.includes("FREQ=MONTHLY")?"Repeats monthly":"Repeats weekly"}function Xi(e,t){const s=e.due_day&&vi(t,e.due_day)>=0?e.due_day:t;return(e.due_day?[Wi(s,1),Wi(s,7)]:[Wi(t,1),Wi(t,7)]).map(e=>({day:e,label:Vi(e,t)}))}function Ji(e,t){const s=e.due_day&&vi(t,e.due_day)>=0?e.due_day:t;return[Wi(s,1),Wi(s,2),Wi(s,7)].map(e=>({day:e,label:Vi(e,t)}))}function Qi(e){const t=e.map(e=>e.name);return t.length<=1?t.join(""):`${t.slice(0,-1).join(", ")} and ${t[t.length-1]}`}function Zi(e,t,s){const i=e?.created;if(!i?.at)return null;const a=t.find(e=>e.id===i.by)?.name??("automation"===i.by?"an automation":"admin"===i.by?"an admin":null),n=i.at.slice(0,10),r=0===vi(n,s)?"today":`on ${Yi(n,s)}`;return a?`Added by ${a} ${r}`:`Added ${r}`}function ea(e){const{item:t,activity:s,owner:i,members:a,today:n}=e,r=a.filter(e=>e.parent&&e.id!==i.id),o=i.parent,l="pin"===e.member?`🔒 ${i.name}'s PIN`:void 0,d="pin"===e.parent?"🔒 parent":"no_pin"===e.parent?"needs a parent's PIN":void 0,c=t.status,p="open"===c||"sent_back"===c,h=[],u=[],m=t.due_day,v="no"!==e.member;if(p&&v){const e=function(e,t){if(!e.due_day||"day"===e.window)return[];const s=Math.min(vi(t,e.due_day),6),i=[];for(let e=1;e<=s;e++){const s=Wi(t,e);i.push({day:s,label:Vi(s,t)})}return i}(t,n);e.length&&h.push({id:"plan_day",label:"Plan it for a day",tag:l,chips:e,hint:m?`Shows on that day, and it's still due ${Yi(m,n)}.`:"Shows on that day."}),o||!m||t.request||(h.push({id:"more_time",label:"Ask for more time",tag:"needs OK",chips:Ji(t,n),pick:{min:Wi(m,1),max:Wi(n,60)},hint:r.length?`Sends a request to ${Qi(r)}.`:"Sends a request to the parents."}),h.push({id:"skip",label:"Ask to skip this week",tag:"needs OK",hint:"Sick, away, rained out…"})),h.push({id:"done_by",label:"Done by someone else…",tag:l,hint:"They get the credit."})}"done"!==c&&"pending"!==c||!v||(h.push({id:"undo",label:"Uncheck it",tag:l,hint:"It goes back on the list."}),"done"===c&&h.push({id:"done_by",label:"Done by someone else…",tag:l,hint:"Change who gets the credit."})),h.push({id:"history",label:"History",hint:"The streak, recent check-offs, and when it usually gets done."}),"no"!==e.parent&&("pending"===c&&(u.push({id:"approve",label:"Looks good",tag:d,hint:"Approves it, and the stars are earned."}),u.push({id:"send_back",label:"Send back",tag:d,hint:"It goes back on the list with a note."})),p&&(u.push({id:"change_due",label:"Change the due date",tag:d,chips:Xi(t,n),pick:{min:n},hint:m?`Due ${Yi(m,n)} now.`:"It has no due date now."}),u.push({id:"hand_off",label:"Hand it to someone else",tag:d,hint:"Just this time."}),u.push({id:"excuse",label:"Excuse it",tag:d,hint:"A sick day: nothing is missed, and the streak holds."})),u.push({id:"edit",label:"Edit the chore",tag:d,hint:"Opens it in Settings."}),u.push({id:"delete",label:"Delete the chore",tag:d,destructive:!0,hint:"It leaves the board for everyone."}));const g="once"===t.window&&s?.once?s.once.estimate_minutes:t.credit_minutes,b=[i.name,Gi(s,t,n),fi(g)];i.stars&&t.stars>0&&b.push(`★ ${t.stars}`);const y=t.request?"more_time"===t.request.kind&&t.request.until?`Waiting for a parent: more time, until ${Yi(t.request.until,n)}.`:"Waiting for a parent: skip this week.":null;return{title:t.name,meta:b.filter(Boolean).join(" · "),added:Zi(s,a,n),note:"sent_back"===c?t.note?`Sent back: ${t.note}`:"Sent back":y,member:h,parent:u}}const ta={morning:"in the morning",afternoon:"in the afternoon",evening:"in the evening"},sa={mon:"Mondays",tue:"Tuesdays",wed:"Wednesdays",thu:"Thursdays",fri:"Fridays",sat:"Saturdays",sun:"Sundays"};function ia(e,t,s,i){const a=[];e.streak.days&&a.push(`🔥 ${e.streak.days} ${1===e.streak.days?"day":"days"} in a row`),e.streak.weeks&&a.push(`🔥 ${e.streak.weeks} ${1===e.streak.weeks?"week":"weeks"} in a row`),e.weeks.of>0&&void 0===e.streak.days&&a.push(`Done ${e.weeks.done} of the last ${e.weeks.of} ${1===e.weeks.of?"week":"weeks"}`);const n=e.recent[0];if(n){const r=new Date(n.at),o=n.at.slice(0,10),l="24h"===i?`${r.getHours()}:${String(r.getMinutes()).padStart(2,"0")}`:`${r.getHours()%12||12}:${String(r.getMinutes()).padStart(2,"0")} ${r.getHours()>=12?"PM":"AM"}`,d=n.done_by!==e.member?s.find(e=>e.id===n.done_by)?.name:null;a.push(`Last done ${Yi(o,t)} at ${l}${d?` by ${d}`:""}`)}else a.push("Not done yet");const{band:r,day:o}=e.usual;return o&&r?a.push(`Usually ${sa[o]} ${ta[r]}`):r&&a.push(`Usually ${ta[r]}`),a}const aa=["Sun","Mon","Tue","Wed","Thu","Fri","Sat"],na=["January","February","March","April","May","June","July","August","September","October","November","December"];function ra(e){const t=mi(e.week.start);return`Week of ${na[t.getMonth()]} ${t.getDate()}`}function oa(e){const t={date:e.date,kind:e.kind,away:e.away,dashed:"future"===e.kind};if(e.away)return{...t,label:"Away",tone:"muted",progress:0,closed:!1,empty:!1};const s=e.due??0,i=(e.done??0)+(e.pending??0);return"future"===e.kind?{...t,label:s?`${s} due`:"",tone:"muted",progress:0,closed:!1,empty:!s}:null===e.due?{...t,label:"",tone:"muted",progress:0,closed:!1,empty:!0}:0===s?{...t,label:"Nothing due",tone:"muted",progress:0,closed:!1,empty:!0}:"past"===e.kind&&e.missed>0?{...t,label:`${e.missed} missed`,tone:"bad",progress:Math.min(1,i/s),closed:!1,empty:!1}:{...t,label:`${Math.min(i,s)} of ${s}`,tone:"plain",progress:Math.min(1,i/s),closed:!!e.closed||i>=s,empty:!1}}function la(e,t,s){if(0===e.length)return null;const i=e.reduce((e,t)=>e+t.total,0),a=e.reduce((e,t)=>e+t.done,0),n=e.reduce((e,t)=>e+t.pending,0),r=e.filter(e=>e.from&&e.from<s).sort((e,t)=>(e.from??"").localeCompare(t.from??""))[0];let o=null,l="neutral";return r?.from?(o=`${r.name} from ${aa[mi(r.from).getDay()]}`,l="time"):n?(o=`⏳ ${n} waiting`,l="act"):a+n<i&&(o=1===t?"Last day":`${t} days left`),{text:`${a+n} of ${i}`,badge:o,badgeTone:l,progress:i?(a+n)/i:0}}const da=["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];function ca(e){const t=e.map(e=>da[mi(e).getDay()]);return t.length<=1?t.join(""):`${t.slice(0,-1).join(", ")} and ${t[t.length-1]}`}function pa(e,t){return e.rewards.map(s=>{const i=new Set(e.requests.filter(e=>"redemption"===e.kind&&e.reward===s.id).map(e=>e.member)),a=function(e,t){const s=t.filter(e=>e.stars);return e.who.length?s.filter(t=>e.who.includes(t.id)):s}(s,t).map(t=>{const a=e.members[t.id]?.stars??0;return{member:t,afford:a>=s.cost,more:Math.max(0,s.cost-a),asked:i.has(t.id)}});return{reward:s,people:a,goals:t.filter(e=>e.goal===s.id),asked:t.filter(e=>i.has(e.id)),canRedeem:a.some(e=>e.afford&&!e.asked)}})}function ha(e){return e?{name:e.name,icon:e.icon??"🎁",cost:e.cost,needsOk:e.needs_ok,who:[...e.who]}:{name:"",icon:"🎁",cost:20,needsOk:!0,who:[]}}function ua(e){return e.name.trim()?!Number.isInteger(e.cost)||e.cost<1||e.cost>1e4?"A reward costs from 1 to 10,000 stars.":null:"Add a name."}const ma=["🎁","🎬","🎮","🍦","🍕","📱","🌙","💵","🧸","🎨","⚽","🏊","🎟️","🍪"],va=new Set(["open","sent_back"]),ga=new Set(["done","pending"]);function ba(e){const t={due:0,done:0,pending:0,minutes_due:0,minutes_done:0,minutes_pending:0};for(const s of e)s.counted&&"away"!==s.status&&"excused"!==s.status&&(t.due+=1,t.minutes_due+=s.credit_minutes,"done"===s.status?(t.done+=1,t.minutes_done+=s.credit_minutes):"pending"===s.status&&(t.pending+=1,t.minutes_pending+=s.credit_minutes));return t}function ya(e){const t=new Date(e),s=e=>String(Math.abs(e)).padStart(2,"0"),i=-t.getTimezoneOffset(),a=i>=0?"+":"-";return`${t.getFullYear()}-${s(t.getMonth()+1)}-${s(t.getDate())}T${s(t.getHours())}:${s(t.getMinutes())}:${s(t.getSeconds())}${a}${s(Math.trunc(i/60))}:${s(i%60)}`}function fa(e,t){if("complete"===t.op&&va.has(e.status)){const s=t.shows??"done";return{...e,status:s,note:null,completion:{id:`queued:${t.id}`,done_by:t.doneBy??e.member,by:"",at:ya(t.at),source:"tablet",state:s,review:null,stars:e.stars}}}return"undo"===t.op&&ga.has(e.status)?{...e,status:"open",completion:null}:e}function _a(e,t,s){const i=new Date(e),a=e=>String(e).padStart(2,"0"),n=`${i.getFullYear()}-${a(i.getMonth()+1)}-${a(i.getDate())}`,r=wi(i,s,"12h"===s),o=vi(n,t);if(0===o)return`Today at ${r}`;if(1===o)return`Yesterday at ${r}`;const l=Yi(n,t);return`${l[0].toUpperCase()}${l.slice(1)} at ${r}`}function wa(e,t,s){return"completion"===e.kind?t?`${e.what}: looks good.`:`${e.what} went back${s?`: ${s}`:""}.`:"redemption"===e.kind?t?`${e.what} is ${e.member?.name??"theirs"}'s.`:`${e.what}: declined.`:t?`Allowed: ${e.what}.`:`Not this time: ${e.what}.`}function xa(e,t,s){return null!=s?Math.trunc(s):Math.max(1,Math.floor(e/t+.5+1e-9))}const $a=[5,15,30,60,120];function ka(e,t){return e.some(e=>"young_child"===t.find(t=>t.id===e)?.age_group)}function Fa(e){const t=[Wi(e,1)];for(const s of[6,0]){const i=mi(e).getDay(),a=Wi(e,(s-i+7)%7||7);t.includes(a)||t.push(a)}return t.map(t=>{const s=mi(t).getDay(),i=Vi(t,e);return{day:t,label:"Tomorrow"===i?i:6===s?"Saturday":0===s?"Sunday":i}})}const Ea=["SU","MO","TU","WE","TH","FR","SA"],Ca=["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];function Sa(e){const t=e%100;return t>=11&&t<=13?`${e}th`:`${e}${["th","st","nd","rd"][e%10]??"th"}`}function Da(e,t){return e.name.trim()?0===e.who.length?"Pick who does it.":"by"===e.when&&(!e.by||e.by<t)?"Pick a day to finish by.":!Number.isFinite(e.minutes)||e.minutes<1||e.minutes>1440?"About how long is from 1 minute to 24 hours.":null:"Add what needs doing."}function Aa(e,t,s=50){const i=Math.min(.999,Math.max(.05,t)),a=2*Math.PI/e,n=a*Math.sqrt(1-i*i),r=Math.log(1e3)/(i*a),o=[];for(let e=0;e<s;e++){const t=r*e/s,l=1-Math.exp(-i*a*t)*(Math.cos(n*t)+i*a/n*Math.sin(n*t));o.push(l.toFixed(4))}return o.push("1"),{easing:`linear(${o.join(", ")})`,duration:Math.round(1e3*r)}}const za=Aa(.5,.86),Ma=Aa(.45,.55),Ta=Aa(.6,.9);function Pa(e,t=function(){return"undefined"!=typeof CSS&&"function"==typeof CSS.supports&&CSS.supports("animation-timing-function","linear(0, 1)")}()){return t?e:{easing:"cubic-bezier(0.2, 0.8, 0.2, 1)",duration:e.duration}}function Ba(e){const t=getComputedStyle(e).getPropertyValue("--pv-motion").trim();return"reduced"===t||"full"===t?t:"function"==typeof matchMedia&&matchMedia("(prefers-reduced-motion: reduce)").matches?"reduced":"full"}function Oa(e){try{navigator.vibrate?.("tick"===e?12:[18,40,28])}catch{}}let Ra=null;function Na(e=!1){try{const t=window.AudioContext??window.webkitAudioContext;if(!t)return;Ra??=new t;const s=Ra.currentTime;(e?[659.25,783.99,1046.5]:[783.99,1046.5]).forEach((e,t)=>{const i=Ra.createOscillator(),a=Ra.createGain();i.type="sine",i.frequency.value=e;const n=s+.09*t;a.gain.setValueAtTime(0,n),a.gain.linearRampToValueAtTime(.12,n+.02),a.gain.exponentialRampToValueAtTime(1e-4,n+.35),i.connect(a).connect(Ra.destination),i.start(n),i.stop(n+.4)})}catch{}}function Ia(e){return{tag:"pv-chore-editor",title:e.name,back:"Chores",props:{choreId:e.id}}}const La={page:"import-export"};class ja extends de{constructor(){super(...arguments),this.toast=null}disconnectedCallback(){super.disconnectedCallback(),clearTimeout(this._timer)}updated(e){const t=e.get("toast");if(!e.has("toast")||t?.id===this.toast?.id)return;clearTimeout(this._timer);const s=this.toast;if(!s)return;const i=this.renderRoot.querySelector(".toast");if(i)if("reduced"===Ba(this))i.animate({opacity:[0,1]},{duration:150});else{const e=Pa(za);i.animate({transform:["translateY(16px)","translateY(0)"],opacity:[0,1]},{duration:e.duration,easing:e.easing})}this._timer=setTimeout(()=>this._gone(s),s.ms??5e3)}render(){const e=this.toast;return e?U`
      <div class="toast ${"bad"===e.tone?"bad":""}" role="status" aria-live="polite">
        <span class="text">${e.text}</span>
        ${(e.actions??[]).map(t=>U`
          <button type="button" @click=${()=>this._act(e,t)}>${t.label}</button>
        `)}
      </div>
    `:Y}_act(e,t){clearTimeout(this._timer),this.dispatchEvent(new CustomEvent("pv-toast-action",{detail:{toast:e,action:t.id},bubbles:!0,composed:!0}))}_gone(e){this.dispatchEvent(new CustomEvent("pv-toast-gone",{detail:{toast:e},bubbles:!0,composed:!0}))}}ja.styles=r`
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
  `,e([ue({attribute:!1})],ja.prototype,"toast",void 0),ge("pv-toast",ja);const Ha=r`
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
`;function qa(e,t){if("Tab"!==t.key)return;const s=[...e.querySelectorAll('button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])')],i=function(e,t,s){return 0===t?-1:e<0?s?t-1:0:s?(e-1+t)%t:(e+1)%t}(s.indexOf(e.activeElement),s.length,t.shiftKey);i>=0&&(t.preventDefault(),s[i].focus())}function Ua(e){return Math.max(0,e)}class Wa{constructor(e){this._host=e}get _rises(){return"landscape"!==this._host.layout}open(e,t){if(t.animate({opacity:[0,1]},{duration:200,easing:"ease-out"}),"reduced"===Ba(this._host))return void e.animate({opacity:[0,1]},{duration:150,easing:"ease-out"});const s=Pa(za);e.animate(this._rises?{transform:["translateY(105%)","translateY(0)"]}:{transform:["scale(0.96)","scale(1)"],opacity:[0,1]},{duration:s.duration,easing:s.easing})}async close(e,t){const s="reduced"===Ba(this._host),i=getComputedStyle(e).transform,a=i&&"none"!==i?i:"translateY(0)",n=s?e.animate({opacity:[1,0]},{duration:150,easing:"ease-in",fill:"forwards"}):e.animate(this._rises?{transform:[a,"translateY(105%)"]}:{transform:["scale(1)","scale(0.96)"],opacity:[1,0]},{duration:this._rises?240:160,easing:"cubic-bezier(.4,0,1,1)",fill:"forwards"});t.animate({opacity:[1,0]},{duration:s?150:200,easing:"ease-in",fill:"forwards"}),await n.finished.catch(()=>{})}attachDrag(e,t,s){let i=null,a=0;const n=t=>{if(this._rises){i={y:t.clientY,t:performance.now()},a=0;try{e.setPointerCapture(t.pointerId)}catch{}}},r=e=>{i&&(a=Ua(e.clientY-i.y),t.style.transform=`translateY(${a}px)`)},o=()=>{if(!i)return;const e=function(e,t){const s=Ua(e);return s>90||s/Math.max(1,t)>.6?"close":"settle"}(a,performance.now()-i.t);if(i=null,"close"===e)return void s();const n="reduced"===Ba(this._host)?{duration:120,easing:"ease-out"}:Pa(Ma);t.style.transform="",t.animate({transform:[`translateY(${a}px)`,"translateY(0)"]},{duration:n.duration,easing:n.easing})};return e.addEventListener("pointerdown",n),e.addEventListener("pointermove",r),e.addEventListener("pointerup",o),e.addEventListener("pointercancel",o),()=>{e.removeEventListener("pointerdown",n),e.removeEventListener("pointermove",r),e.removeEventListener("pointerup",o),e.removeEventListener("pointercancel",o)}}}class Va extends de{constructor(){super(...arguments),this.heading="",this.body="",this.actions=[],this.layout="landscape",this._sheetMotion=new Wa(this),this._detachDrag=null,this._closing=!1}firstUpdated(){this.renderRoot.querySelector(".actions button")?.focus();const{panel:e,backdrop:t,zone:s}=this._parts();this._sheetMotion.open(e,t),this._detachDrag=this._sheetMotion.attachDrag(s,e,()=>this._choose("cancel"))}disconnectedCallback(){super.disconnectedCallback(),this._detachDrag?.(),this._detachDrag=null}_parts(){const e=this.renderRoot;return{panel:e.querySelector(".panel"),backdrop:e.querySelector(".backdrop"),zone:e.querySelector(".grab-zone")}}render(){return U`
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
    `}_onKey(e){if("Escape"===e.key)return e.preventDefault(),void this._choose("cancel");qa(this.shadowRoot,e)}_choose(e){this._leave(()=>{this.dispatchEvent(new CustomEvent("pv-sheet-action",{detail:{id:e},bubbles:!0,composed:!0}))})}async _leave(e){if(this._closing)return;this._closing=!0;const{panel:t,backdrop:s}=this._parts();await this._sheetMotion.close(t,s),e(),requestAnimationFrame(()=>{if(this.isConnected){for(const e of[t,s])e.getAnimations().forEach(e=>e.cancel());t.style.transform="",this._closing=!1}})}}Va.styles=[ot,Ha,r`
      .destructive {
        background: var(--pv-danger, #DC2626);
        border-color: transparent;
        color: #FFFFFF;
      }
    `],e([ue({type:String})],Va.prototype,"heading",void 0),e([ue({type:String})],Va.prototype,"body",void 0),e([ue({attribute:!1})],Va.prototype,"actions",void 0),e([ue({type:String,reflect:!0})],Va.prototype,"layout",void 0),ge("pv-notice-sheet",Va);const Ya=e=>(...t)=>({_$litDirective$:e,values:t});let Ka=class{constructor(e){}get _$AU(){return this._$AM._$AU}_$AT(e,t,s){this._$Ct=e,this._$AM=t,this._$Ci=s}_$AS(e,t){return this.update(e,t)}update(e,t){return this.render(...t)}};const{I:Ga}=re,Xa=e=>e,Ja=()=>document.createComment(""),Qa=(e,t,s)=>{const i=e._$AA.parentNode,a=void 0===t?e._$AB:t._$AA;if(void 0===s){const t=i.insertBefore(Ja(),a),n=i.insertBefore(Ja(),a);s=new Ga(t,n,e,e.options)}else{const t=s._$AB.nextSibling,n=s._$AM,r=n!==e;if(r){let t;s._$AQ?.(e),s._$AM=e,void 0!==s._$AP&&(t=e._$AU)!==n._$AU&&s._$AP(t)}if(t!==a||r){let e=s._$AA;for(;e!==t;){const t=Xa(e).nextSibling;Xa(i).insertBefore(e,a),e=t}}}return s},Za=(e,t,s=e)=>(e._$AI(t,s),e),en={},tn=(e,t=en)=>e._$AH=t,sn=e=>{e._$AR(),e._$AA.remove()},an=(e,t,s)=>{const i=new Map;for(let a=t;a<=s;a++)i.set(e[a],a);return i},nn=Ya(class extends Ka{constructor(e){if(super(e),2!==e.type)throw Error("repeat() can only be used in text expressions")}dt(e,t,s){let i;void 0===s?s=t:void 0!==t&&(i=t);const a=[],n=[];let r=0;for(const t of e)a[r]=i?i(t,r):r,n[r]=s(t,r),r++;return{values:n,keys:a}}render(e,t,s){return this.dt(e,t,s).values}update(e,[t,s,i]){const a=(e=>e._$AH)(e),{values:n,keys:r}=this.dt(t,s,i);if(!Array.isArray(a))return this.ut=r,n;const o=this.ut??=[],l=[];let d,c,p=0,h=a.length-1,u=0,m=n.length-1;for(;p<=h&&u<=m;)if(null===a[p])p++;else if(null===a[h])h--;else if(o[p]===r[u])l[u]=Za(a[p],n[u]),p++,u++;else if(o[h]===r[m])l[m]=Za(a[h],n[m]),h--,m--;else if(o[p]===r[m])l[m]=Za(a[p],n[m]),Qa(e,l[m+1],a[p]),p++,m--;else if(o[h]===r[u])l[u]=Za(a[h],n[u]),Qa(e,a[p],a[h]),h--,u++;else if(void 0===d&&(d=an(r,u,m),c=an(o,p,h)),d.has(o[p]))if(d.has(o[h])){const t=c.get(r[u]),s=void 0!==t?a[t]:null;if(null===s){const t=Qa(e,a[p]);Za(t,n[u]),l[u]=t}else l[u]=Za(s,n[u]),Qa(e,a[p],s),a[t]=null;u++}else sn(a[h]),h--;else sn(a[p]),p++;for(;u<=m;){const t=Qa(e,l[m+1]);Za(t,n[u]),l[u++]=t}for(;p<=h;){const e=a[p++];null!==e&&sn(e)}return this.ut=r,tn(e,l),V}}),rn=Ya(class extends Ka{constructor(){super(...arguments),this.key=Y}render(e,t){return this.key=e,t}update(e,[t,s]){return t!==this.key&&(tn(e),this.key=t),s}});class on extends de{constructor(){super(...arguments),this.size=58,this.progress=0,this.color="currentColor",this.closed=!1,this.dashed=!1,this.label="",this.celebrate=0}get _stroke(){return this.size>=100?8:this.size>=50?4:3}firstUpdated(){this._setEasing()}updated(e){e.has("celebrate")&&this.celebrate&&void 0!==e.get("celebrate")&&this._play()}_setEasing(){if("reduced"===Ba(this))return this.style.setProperty("--pv-ring-ms","180ms"),void this.style.setProperty("--pv-ring-ease","linear");const e=Pa(Ta);this.style.setProperty("--pv-ring-ms",`${e.duration}ms`),this.style.setProperty("--pv-ring-ease",e.easing)}_play(){const e=this.renderRoot.querySelector(".glow");if(!e)return;if("reduced"===Ba(this))return void e.animate({opacity:[0,.5,0]},{duration:500,easing:"ease-out"});e.animate({opacity:[0,.7,0],transform:["scale(0.9)","scale(1.15)","scale(1.25)"]},{duration:900,easing:"ease-out"});const t=Pa(Ma);this.animate({transform:["scale(1)","scale(1.08)","scale(1)"]},{duration:t.duration,easing:t.easing});const s=[...this.renderRoot.querySelectorAll(".spark")],i=.75*this.size;s.forEach((e,t)=>{const a=t/s.length*Math.PI*2-Math.PI/2,n=Math.cos(a)*i,r=Math.sin(a)*i;e.animate({opacity:[0,1,0],transform:["translate(0, 0) scale(0.6)",`translate(${.7*n}px, ${.7*r}px) scale(1)`,`translate(${n}px, ${r}px) scale(0.4)`]},{duration:800,delay:18*t,easing:"cubic-bezier(0.2, 0.8, 0.2, 1)"})})}render(){const e=this.size,t=this._stroke,s=e/2,i=(e-t)/2,a=2*Math.PI*i,n=this.closed?1:Math.min(1,Math.max(0,this.progress)),r=e-2*t-2*Math.max(2,Math.round(.06*e)),o=Math.max(14,Math.round(.32*e));return U`
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
    `}}on.styles=r`
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
  `,e([ue({type:Number})],on.prototype,"size",void 0),e([ue({type:Number})],on.prototype,"progress",void 0),e([ue({type:String})],on.prototype,"color",void 0),e([ue({type:Boolean,reflect:!0})],on.prototype,"closed",void 0),e([ue({type:Boolean,reflect:!0})],on.prototype,"dashed",void 0),e([ue({type:String})],on.prototype,"label",void 0),e([ue({type:Number})],on.prototype,"celebrate",void 0),ge("pv-ring",on);class ln extends de{constructor(){super(...arguments),this.size=40}render(){const e=this.member;if(!e)return Y;const t=function(e,t){const s=e.picture;if(s&&"string"==typeof s.emoji&&s.emoji)return{kind:"emoji",text:s.emoji};if(s&&!0===s.person&&e.person){const s=t(e.person);if(s)return{kind:"photo",url:s}}return{kind:"initial",text:Ns(e.name)}}(e,e=>this.hass?.states?.[e]?.attributes?.entity_picture??null),s=Math.round(this.size*("emoji"===t.kind?.55:.42)),i=`width:${this.size}px;height:${this.size}px;font-size:${s}px;background:${e.color};color:${qe(e.color)}`;return U`
      <div class="avatar" role="img" aria-label=${e.name} style=${i}>
        ${"photo"===t.kind?U`<img src=${t.url} alt="" />`:t.text}
      </div>
    `}}ln.styles=r`
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
  `,e([ue({attribute:!1})],ln.prototype,"member",void 0),e([ue({attribute:!1})],ln.prototype,"hass",void 0),e([ue({type:Number})],ln.prototype,"size",void 0),ge("pv-member-avatar",ln);class dn{constructor(e,t=550){this._callbacks=e,this._holdMs=t,this._start=null,this._fill=0}get holding(){return null!==this._start}down(e,t,s){this._start={x:e,y:t,t:s},this._fill=0,this._callbacks.progress(0)}frame(e){this._start&&(this._fill=Math.min(1,Math.max(0,(e-this._start.t)/this._holdMs)),this._callbacks.progress(this._fill),this._fill>=1&&(this._start=null,this._callbacks.complete()))}move(e,t){this._start&&Math.hypot(e-this._start.x,t-this._start.y)>12&&this._stop(!1)}up(e){this._start&&this._stop(e-this._start.t<200)}cancel(){this._start&&this._stop(!1)}key(e){return(" "===e||"Enter"===e)&&(this._start=null,this._fill=1,this._callbacks.progress(1),this._callbacks.complete(),!0)}_stop(e){this._start=null,this._callbacks.rewind(this._fill),e&&this._callbacks.tap()}}function cn(e,t){return e?e.key!==t.key?"reset":e.state!==t.state?"answered":"none":"none"}const pn=11.5,hn=2*Math.PI*pn;class un extends de{constructor(){super(...arguments),this.color="#5B5BD6",this.highlight=!1,this.narrow=!1,this.locked=!1,this.dim=!1,this._fill=0,this._held=!1,this._frame=0,this._rewindFrame=0,this._hintPress=null,this._gesture=new dn({progress:e=>{this._fill=e},complete:()=>this._finish(),rewind:e=>this._rewind(e),tap:()=>this._fire("pv-hint",{row:this.row})}),this._celebrate=!1,this._down=e=>{if(e.button>0)return;if(!this._holdable)return void(this._hintPress={x:e.clientX,y:e.clientY,t:performance.now()});if(this._held)return;cancelAnimationFrame(this._rewindFrame);const t=e.currentTarget;try{t.setPointerCapture(e.pointerId)}catch{}this._gesture.down(e.clientX,e.clientY,performance.now());const s=e=>{this._gesture.frame(e),this._gesture.holding&&(this._frame=requestAnimationFrame(s))};this._frame=requestAnimationFrame(s)},this._move=e=>{this._gesture.move(e.clientX,e.clientY)},this._up=e=>{const t=this._hintPress;if(t)return this._hintPress=null,void(!!e&&performance.now()-t.t<550&&Math.hypot(e.clientX-t.x,e.clientY-t.y)<=12&&this._fire("pv-hint",{row:this.row}));cancelAnimationFrame(this._frame),this._gesture.up(performance.now())},this._cancel=()=>{this._hintPress=null,cancelAnimationFrame(this._frame),this._gesture.cancel()},this._lost=()=>{this._gesture.holding&&this._up()},this._key=e=>{" "!==e.key&&"Enter"!==e.key||(e.preventDefault(),this._holdable&&!this._held?this._gesture.key(e.key):this._fire("pv-hint",{row:this.row}))},this._options=()=>{this._fire("pv-row-options",{row:this.row})},this._context=e=>{e.preventDefault(),this._options()}}willUpdate(e){if(e.has("row")){const t=cn(e.get("row"),this.row);this.dataset.state=this.row.state,"none"!==t&&(this._held=!1,this._fill=0),"answered"!==t||"done"!==this.row.state&&"pending"!==this.row.state||(this._celebrate=!0)}}updated(){if(!this._celebrate)return;this._celebrate=!1;const e="reduced"===Ba(this),t=this.renderRoot.querySelector(".check"),s=this.renderRoot.querySelector(".mark"),i=this.renderRoot.querySelector(".strike");if(e)return void t?.animate({opacity:[0,1]},{duration:150});const a=Pa(Ma);t?.animate({transform:["scale(0.55)","scale(1)"]},{duration:a.duration,easing:a.easing}),s?.animate({strokeDashoffset:[24,0]},{duration:320,delay:60,easing:"cubic-bezier(0.3, 0.7, 0.2, 1)",fill:"backwards"}),i?.animate({transform:["scaleX(0)","scaleX(1)"]},{duration:300,delay:120,easing:"ease-out",fill:"backwards"}),this.renderRoot.querySelector(".sparkles")?.animate({opacity:[0,1,0],transform:["translateY(4px)","translateY(-6px)"]},{duration:700,easing:"ease-out"})}disconnectedCallback(){super.disconnectedCallback(),cancelAnimationFrame(this._frame),cancelAnimationFrame(this._rewindFrame)}get _done(){return"done"===this.row.state}get _holdable(){return!this.locked&&("open"===this.row.state||"sent_back"===this.row.state||"done"===this.row.state)}_finish(){this._held=!0,this._fill=1;const e=this.renderRoot.querySelector(".circle")?.getBoundingClientRect()??new DOMRect,t={row:this.row,from:e,settle:e=>{e||this._rewind(1)}};this._fire(this._done?"pv-hold-undo":"pv-hold-done",t)}_rewind(e){if(this._held=!1,e<=0||"reduced"===Ba(this))return void(this._fill=0);const t=performance.now(),s=220*e,i=a=>{const n=Math.min(1,(a-t)/s);this._fill=e*(1-n),n<1&&!this._gesture.holding&&(this._rewindFrame=requestAnimationFrame(i))};cancelAnimationFrame(this._rewindFrame),this._rewindFrame=requestAnimationFrame(i)}_fire(e,t){this.dispatchEvent(new CustomEvent(e,{detail:t,bubbles:!0,composed:!0}))}render(){const e=this.row;if(!e)return Y;const t=this.color,s=e.state,i="done"===s,a="pending"===s,n=this._held?1:this._fill,r=i?`Hold to uncheck ${e.name}`:`Hold to complete ${e.name}`,o=U`
      ${e.badge?U`
        <span class="badge ${e.badge.tone}">${e.badge.glyph?U`<span aria-hidden="true">${e.badge.glyph}</span>`:Y}${e.badge.words}</span>
      `:Y}
      ${e.badge||!e.meta||i?Y:U`<span class="meta">${e.meta}</span>`}
      ${i&&e.doneAt?U`<span class="meta">${e.doneBy?`${e.doneBy} · `:""}${e.doneAt}</span>`:Y}
    `;return U`
      <div class="row" style="--member:${t}">
        <div class="sweep" style="transform: scaleX(${i?0:n})"></div>
        <button class="circle" type="button" aria-label=${r} aria-disabled=${this.locked?"true":"false"}
          @pointerdown=${this._down} @pointermove=${this._move} @pointerup=${this._up}
          @pointercancel=${this._cancel} @lostpointercapture=${this._lost} @keydown=${this._key}
          @contextmenu=${e=>e.preventDefault()}>
          <svg width=${26} height=${26} viewBox="0 0 26 26" aria-hidden="true">
            ${i?W`
              <g class="check" style="transform-origin: 13px 13px">
                <circle cx="13" cy="13" r="12.5" fill=${t}></circle>
                <path class="mark" d="M7.5 13.4l3.6 3.6 7.4-7.6" fill="none" stroke=${qe(t)} stroke-width="2.6"
                  stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="24"></path>
              </g>
              <circle cx="13" cy="13" r="15.5" fill="none" stroke=${t} stroke-width="2.4" stroke-linecap="round"
                stroke-dasharray=${2*Math.PI*15.5} stroke-dashoffset=${2*Math.PI*15.5*(1-n)}
                transform="rotate(-90 13 13)" opacity=${n>0?.55:0}></circle>
            `:W`
              <circle cx="13" cy="13" r=${pn} fill="none" stroke=${t} stroke-width="2.4"
                stroke-dasharray=${a?"3.2 3.2":"none"} opacity=${a?.9:1}></circle>
              ${a?W`<text x="13" y="17.2" text-anchor="middle" font-size="11">⏳</text>`:Y}
              <circle cx="13" cy="13" r=${pn} fill="none" stroke=${t} stroke-width="3.4" stroke-linecap="round"
                stroke-dasharray=${hn} stroke-dashoffset=${hn*(1-n)}
                transform="rotate(-90 13 13)" opacity=${n>0?1:0}></circle>
            `}
          </svg>
        </button>
        <button class="about ${l=e.badge,d=this.narrow,l&&(d||l.words.length>14)?"below":""}" type="button"
          @click=${this._options} @contextmenu=${this._context}
          aria-label=${`${e.name}${e.badge?`, ${e.badge.words}`:""}. Options`}>
          <span class="name"><span class="text">${e.name}<span class="strike"></span></span>${e.label?U`<span class="label">${e.label}</span>`:Y}</span>
          <span class="end">${o}</span>
        </button>
        <span class="sparkles" aria-hidden="true">✦ ✧ ✦</span>
      </div>
    `;var l,d}}function mn(e){return e&&!e.startsWith("mdi:")?e:"⭐"}un.styles=[pi,r`
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
    `],e([ue({attribute:!1})],un.prototype,"row",void 0),e([ue({type:String})],un.prototype,"color",void 0),e([ue({type:Boolean,reflect:!0})],un.prototype,"highlight",void 0),e([ue({type:Boolean,reflect:!0})],un.prototype,"narrow",void 0),e([ue({type:Boolean})],un.prototype,"locked",void 0),e([ue({type:Boolean,reflect:!0})],un.prototype,"dim",void 0),e([me()],un.prototype,"_fill",void 0),e([me()],un.prototype,"_held",void 0),ge("pv-chore-item",un);class vn extends de{constructor(){super(...arguments),this.color="#5B5BD6",this.now=!1,this.large=!1,this.locked=!1,this.stars=0,this._fill=0,this._held=!1,this._frame=0,this._celebrate=!1,this._gesture=new dn({progress:e=>{this._fill=e},complete:()=>this._finish(),rewind:()=>{this._held=!1,this._fill=0},tap:()=>this._fire("pv-hint",{row:this.row})}),this._hintPress=null,this._down=e=>{if(e.button>0)return;if(!this._holdable)return void(this._hintPress={x:e.clientX,y:e.clientY,t:performance.now()});if(this._held)return;try{e.currentTarget.setPointerCapture(e.pointerId)}catch{}this._gesture.down(e.clientX,e.clientY,performance.now());const t=e=>{this._gesture.frame(e),this._gesture.holding&&(this._frame=requestAnimationFrame(t))};this._frame=requestAnimationFrame(t)},this._up=e=>{const t=this._hintPress;if(t)return this._hintPress=null,void(!!e&&performance.now()-t.t<550&&Math.hypot(e.clientX-t.x,e.clientY-t.y)<=12&&this._fire("pv-hint",{row:this.row}));cancelAnimationFrame(this._frame),this._gesture.up(performance.now())},this._key=e=>{" "!==e.key&&"Enter"!==e.key||(e.preventDefault(),this._holdable&&!this._held&&this._gesture.key(e.key))}}willUpdate(e){if(e.has("row")){const t=cn(e.get("row"),this.row);"none"!==t&&(this._held=!1,this._fill=0),"answered"!==t||"done"!==this.row.state&&"pending"!==this.row.state||(this._celebrate=!0)}}updated(){if(!this._celebrate)return;this._celebrate=!1;const e=this.renderRoot.querySelector(".tile");if("reduced"===Ba(this))return void e?.animate({opacity:[.5,1]},{duration:160});const t=Pa(Ma);e?.animate({transform:["scale(0.94)","scale(1)"]},{duration:t.duration,easing:t.easing})}disconnectedCallback(){super.disconnectedCallback(),cancelAnimationFrame(this._frame)}get _holdable(){const e=this.row.state;return!this.locked&&("open"===e||"sent_back"===e||"done"===e)}_finish(){this._held=!0,this._fill=1;const e=this.renderRoot.querySelector(".picture")?.getBoundingClientRect()??new DOMRect,t={row:this.row,from:e,settle:e=>{e||(this._held=!1,this._fill=0)}};this._fire("done"===this.row.state?"pv-hold-undo":"pv-hold-done",t)}_fire(e,t){this.dispatchEvent(new CustomEvent(e,{detail:t,bubbles:!0,composed:!0}))}render(){const e=this.row;if(!e)return Y;const t=e.state,s="done"===t,i="pending"===t,a=this._held?1:this._fill,n=this.large?132:84;return U`
      <div class="tile ${i?"pending":""} ${s?"done":""}" style="--member:${this.color}">
        <div class="hold" role="button" tabindex=${this.locked?-1:0} aria-disabled=${this.locked?"true":"false"}
          aria-label=${s?`${e.name}, done. Hold to uncheck`:i?`${e.name}, waiting for OK`:`Hold to complete ${e.name}`}
          @pointerdown=${this._down} @pointermove=${e=>this._gesture.move(e.clientX,e.clientY)}
          @pointerup=${this._up} @pointercancel=${()=>{this._hintPress=null,this._gesture.cancel()}} @keydown=${this._key}
          @contextmenu=${e=>e.preventDefault()}>
        ${s?U`
          <span class="tick" style="background:${this.color};color:${qe(this.color)}" aria-hidden="true">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5"></path></svg>
          </span>
        `:Y}
        <pv-ring size=${n} .progress=${a} color=${this.color}>
          <span class="picture" aria-hidden="true">${Oi(e.icon,e.name)}</span>
        </pv-ring>
        <span class="name">${e.name}</span>
        ${i?U`<span class="waiting">⏳ Waiting for OK</span>`:U`<span class="hint">${a>0&&!s?U`Keep holding… ${this.stars>0?`⭐ +${this.stars}`:""}`:this.large&&!s?"Hold me":""}</span>`}
        </div>
        <button class="more" type="button" aria-label=${`Options for ${e.name}`}
          @click=${()=>this._fire("pv-row-options",{row:e})}>
          <span aria-hidden="true">⋯</span>
        </button>
      </div>
    `}}vn.styles=r`
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
  `,e([ue({attribute:!1})],vn.prototype,"row",void 0),e([ue({type:String})],vn.prototype,"color",void 0),e([ue({type:Boolean,reflect:!0})],vn.prototype,"now",void 0),e([ue({type:Boolean,reflect:!0})],vn.prototype,"large",void 0),e([ue({type:Boolean})],vn.prototype,"locked",void 0),e([ue({type:Number})],vn.prototype,"stars",void 0),e([me()],vn.prototype,"_fill",void 0),e([me()],vn.prototype,"_held",void 0),ge("pv-chore-tile",vn);class gn extends de{constructor(){super(...arguments),this.color="#5B5BD6",this.narrow=!1,this.locked=!1,this.celebrate=0,this.pulse=0,this.member="",this._before=null}willUpdate(e){e.has("color")&&this.style.setProperty("--member",this.color),e.has("model")&&e.get("model")&&(this._before=function(e){const t=new Map;for(const s of e){const e=s.dataset.key;e&&t.set(e,s.getBoundingClientRect())}return t}(this.renderRoot.querySelectorAll("[data-key]")))}updated(e){this._before&&(function(e,t,s){const i="reduced"===Ba(s),a=Pa(za);for(const s of e){const e=s.dataset.key,n=e?t.get(e):void 0;if(!n)continue;const r=s.getBoundingClientRect(),o=n.left-r.left,l=n.top-r.top;Math.abs(o)<1&&Math.abs(l)<1||(i?s.animate({opacity:[.4,1]},{duration:160,easing:"ease-out"}):s.animate({transform:[`translate(${o}px, ${l}px)`,"translate(0, 0)"]},{duration:a.duration,easing:a.easing}))}}(this.renderRoot.querySelectorAll("[data-key]"),this._before,this),this._before=null),e.has("pulse")&&this.pulse&&void 0!==e.get("pulse")&&this._pulse()}_pulse(){"reduced"!==Ba(this)&&this.animate({boxShadow:["0 0 0 0 transparent",`0 0 0 6px color-mix(in srgb, ${this.color} 35%, transparent)`,"0 0 0 0 transparent"]},{duration:1400,easing:"ease-in-out"})}flyStars(e,t){const s=this.renderRoot.querySelector(".layer"),i=this.renderRoot.querySelector(".stars");s&&(function(e,t,s,i,a){if(a<=0)return;const n=t.getBoundingClientRect(),r=document.createElement("span");r.textContent=`+${a} ★`,r.setAttribute("aria-hidden","true"),Object.assign(r.style,{position:"absolute",left:s.left-n.left+s.width/2+"px",top:s.top-n.top+"px",transform:"translate(-50%, 0)",font:"800 15px var(--pv-font-heading, ui-rounded, system-ui, sans-serif)",color:"var(--pv-star, #8A6A00)",pointerEvents:"none",zIndex:"30",whiteSpace:"nowrap"}),t.appendChild(r);const o=()=>r.remove();if("reduced"===Ba(e)||!i)return void r.animate({opacity:[0,1,0]},{duration:700,easing:"ease-out"}).finished.then(o,o);const l=i.left+i.width/2-(s.left+s.width/2),d=i.top-s.top,c=Pa(za);r.animate([{transform:"translate(-50%, 0) scale(0.8)",opacity:0},{transform:"translate(-50%, -14px) scale(1.1)",opacity:1,offset:.25},{transform:`translate(calc(-50% + ${l}px), ${d}px) scale(0.7)`,opacity:.2}],{duration:Math.max(650,c.duration),easing:"cubic-bezier(0.3, 0.7, 0.2, 1)"}).finished.then(o,o)}(this,s,e,i?.getBoundingClientRect()??null,t),window.setTimeout(()=>function(e,t){if(!e||"reduced"===Ba(t))return;const s=Pa(Ma);e.animate({transform:["scale(1)","scale(1.18)","scale(1)"]},{duration:s.duration,easing:s.easing})}(this.renderRoot.querySelector(".stars"),this),600))}_open(){this.dispatchEvent(new CustomEvent("pv-member-open",{detail:{member:this.model.member.id},bubbles:!0,composed:!0}))}render(){const e=this.model;if(!e)return Y;const t=e.member;return U`
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
    `}_next(e){const t=/^Next on calendar: (.*?)( · free until then)?$/.exec(e);return t?U`Next on calendar: <strong>${t[1]}</strong>${t[2]??""}`:e}_list(e){return nn(e.entries,e=>e.key,e=>this._entry(e))}_entry(e){return"head"===e.kind?U`
        <div class="head-row ${e.tone}" data-key=${e.key}>
          <span class="text">${e.text}</span>${e.right?U`<span>${e.right}</span>`:Y}
        </div>
      `:"credit"===e.kind?U`<div class="credit" data-key=${e.key}>${e.text}</div>`:U`
      <pv-chore-item data-key=${e.key} .row=${e.row} color=${this.color} ?narrow=${this.narrow}
        ?highlight=${"now"===e.zone} ?dim=${"later"===e.zone} ?locked=${this.locked}></pv-chore-item>
    `}_tiles(e){const t=[];let s=!0;for(const i of e.entries)"row"===i.kind&&"done"!==i.zone&&(t.push({row:i.row,now:s&&"pending"!==i.row.state}),"pending"!==i.row.state&&(s=!1));const i=e.entries.flatMap(e=>"row"===e.kind&&"done"===e.zone?[e.row]:[]),a=e.entry.week_stars;return U`
      <div class="tiles">
        ${nn(t,e=>e.row.key,t=>U`
          <pv-chore-tile .row=${t.row} color=${this.color} ?now=${t.now} ?locked=${this.locked}
            .stars=${e.member.stars?t.row.item.stars:0}></pv-chore-tile>
        `)}
        ${nn(i,e=>e.key,e=>U`<pv-chore-tile .row=${e} color=${this.color} ?locked=${this.locked}></pv-chore-tile>`)}
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
    `}}gn.styles=[pi,r`
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
    `],e([ue({attribute:!1})],gn.prototype,"model",void 0),e([ue({attribute:!1})],gn.prototype,"hass",void 0),e([ue({type:String})],gn.prototype,"color",void 0),e([ue({type:Boolean,reflect:!0})],gn.prototype,"narrow",void 0),e([ue({type:Boolean})],gn.prototype,"locked",void 0),e([ue({type:Number})],gn.prototype,"celebrate",void 0),e([ue({type:Number})],gn.prototype,"pulse",void 0),e([ue({type:String,reflect:!0})],gn.prototype,"member",void 0),ge("pv-chores-column",gn);const bn=12;class yn extends de{constructor(){super(...arguments),this.household=null,this.session=null,this.data=null,this.timeFormat="12h",this.mode="light",this.layout="landscape",this.minute=0,this._width=0,this._phoneIndex=0,this._celebrate={},this._pulse={},this._family=!1,this._closed=new Map,this._evening=!1,this._celebrated=new Set,this._familyDay=null,this._touch=null,this._columnsFor=vt((e,t,s,i,a,n)=>{const r=t?Rs(t.members):[],o=new Date;return Mi(e,{today:e.today,now:o,events:xi(s,new Date(e.day.start),new Date(e.day.end),i),timeFormat:a,activities:new Map(e.chores.map(e=>[e.id,e])),members:r})}),this._touchStart=e=>{this._touch=1===e.touches.length?{x:e.touches[0].clientX,y:e.touches[0].clientY}:null}}connectedCallback(){super.connectedCallback(),this._observer=new ResizeObserver(e=>{const t=Math.round(e[0]?.contentRect.width??0);Math.abs(t-this._width)>=1&&(this._width=t)}),this._observer.observe(this)}disconnectedCallback(){super.disconnectedCallback(),this._observer?.disconnect()}_columns(){return this._columnsFor(this.board,this.household,this.data,this.cardConfig,this.timeFormat,this.minute)}willUpdate(e){if(!e.has("board")&&!e.has("minute"))return;const t=this._columns(),s=void 0!==e.get("board")||this._closed.size>0,i={...this._celebrate},a=this.board.today,n=s?function(e,t,s,i){const a=[];for(const n of e){const e=n.member.id;!1===t.get(e)&&n.ring.closed&&!s.has(`${e}|${i}`)&&(s.add(`${e}|${i}`),a.push(e))}return a}(t,this._closed,this._celebrated,a):[];for(const e of n)i[e]=(i[e]??0)+1;const r=n.length>0;for(const e of t)this._closed.set(e.member.id,e.ring.closed);const o=function(e){const t=e.filter(e=>e.entry.today.due>0);return t.length>0&&t.every(e=>e.ring.closed)}(t);if(o&&s&&r&&this._familyDay!==a){this._familyDay=a,this._family=!0;for(const e of t)e.entry.today.due>0&&(i[e.member.id]=(i[e.member.id]??0)+1);window.setTimeout(()=>{this._family=!1},6e3)}r&&(this._celebrate=i,Oa("ring"),this.board.settings.sound&&Na(!0));const l=Ti(t,this.board,new Date);if(l&&!this._evening&&this._closed.size>0){const e={...this._pulse};for(const t of l.members)e[t]=(e[t]??0)+1;this._pulse=e}this._evening=!!l}flyStars(e,t,s){const i=this.renderRoot.querySelector(`pv-chores-column[member="${e}"]`);i?.flyStars(t,s)}render(){if(!this.board)return Y;const e=this._columns(),t=Ti(e,this.board,new Date),s=U`
      ${this._family?U`<div class="celebrate" role="status">🎉 Everyone closed their ring today. What a team.</div>`:Y}
      ${t?U`<div class="banner info" role="status"><span class="text">${t.text}</span></div>`:Y}
    `;if("phone"===this.layout)return U`${s}${this._phone(e)}`;const i=Math.max(0,this._width-24),a=function(e,t,s=12,i=240){if(e<=0)return[];const a=Math.max(1,Math.floor((t+s)/(i+s)));if(e<=a)return[e];const n=Math.ceil(e/a),r=Math.ceil(e/n),o=[];let l=e;for(;l>0;)o.push(Math.min(r,l)),l-=r;return o}(e.length,i||1200,bn),n=Math.max(...a,1),r=i>0&&(i-bn*(n-1))/n<300;let o=0;return U`
      ${s}
      <div class="rows">
        ${a.map(t=>{const s=e.slice(o,o+t);return o+=t,U`<div class="row">${nn(s,e=>e.member.id,e=>this._column(e,r))}</div>`})}
      </div>
    `}_column(e,t){const s=e.member.id;return U`
      <pv-chores-column member=${s} .model=${e} .hass=${this.hass} color=${qs(e.member,this.mode)}
        ?narrow=${t} ?locked=${"no"===di(this.household,this.session,s)}
        .celebrate=${this._celebrate[s]??0} .pulse=${this._pulse[s]??0}></pv-chores-column>
    `}_phone(e){if(0===e.length)return Y;const t=Math.min(this._phoneIndex,e.length-1),s=e[t];return U`
      <div class="people" role="tablist" aria-label="Whose chores">
        ${e.map((e,s)=>U`
          <button type="button" class="person ${s===t?"on":""}" role="tab" aria-selected=${s===t?"true":"false"}
            @click=${()=>this._show(s)}>
            <pv-ring size="40" .progress=${e.ring.progress} ?closed=${e.ring.closed} color=${qs(e.member,this.mode)}>
              <pv-member-avatar .member=${{...e.member,color:qs(e.member,this.mode)}} .hass=${this.hass} size="28"></pv-member-avatar>
            </pv-ring>
            ${e.member.name}
          </button>
        `)}
      </div>
      <div class="phone" @touchstart=${this._touchStart} @touchend=${t=>this._touchEnd(t,e.length)}>
        ${rn(s.member.id,this._column(s,!0))}
      </div>
    `}_show(e){const t=this._phoneIndex;this._phoneIndex=e,t!==e&&"reduced"!==Ba(this)&&this.updateComplete.then(()=>{const s=this.renderRoot.querySelector(".phone pv-chores-column");s?.animate({transform:[`translateX(${e>t?24:-24}px)`,"translateX(0)"],opacity:[.4,1]},{duration:220,easing:"ease-out"})})}_touchEnd(e,t){const s=this._touch;this._touch=null;const i=e.changedTouches[0];if(!s||!i)return;const a=mt(i.clientX-s.x,i.clientY-s.y);"next"===a&&this._phoneIndex<t-1&&this._show(this._phoneIndex+1),"prev"===a&&this._phoneIndex>0&&this._show(this._phoneIndex-1)}}yn.styles=[pi,r`
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
        gap: ${bn}px;
        padding: ${bn}px;
      }

      .row {
        flex: 1 1 0;
        min-height: 0;
        display: flex;
        gap: ${bn}px;
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
        padding: ${bn}px;
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
    `],e([ue({attribute:!1})],yn.prototype,"board",void 0),e([ue({attribute:!1})],yn.prototype,"household",void 0),e([ue({attribute:!1})],yn.prototype,"session",void 0),e([ue({attribute:!1})],yn.prototype,"data",void 0),e([ue({attribute:!1})],yn.prototype,"cardConfig",void 0),e([ue({attribute:!1})],yn.prototype,"hass",void 0),e([ue({attribute:!1})],yn.prototype,"timeFormat",void 0),e([ue({attribute:!1})],yn.prototype,"mode",void 0),e([ue({type:String,reflect:!0})],yn.prototype,"layout",void 0),e([ue({attribute:!1})],yn.prototype,"minute",void 0),e([me()],yn.prototype,"_width",void 0),e([me()],yn.prototype,"_phoneIndex",void 0),e([me()],yn.prototype,"_celebrate",void 0),e([me()],yn.prototype,"_pulse",void 0),e([me()],yn.prototype,"_family",void 0),ge("pv-chores-board",yn);class fn extends de{constructor(){super(...arguments),this.layout="landscape",this.heading="",this.body="",this.people=[],this.colorOf=e=>e.color,this._motion=new Wa(this),this._detach=null,this._closing=!1,this._key=e=>{if("Escape"===e.key)return e.preventDefault(),void this._pick(null);qa(this.shadowRoot,e)}}firstUpdated(){const e=this.renderRoot.querySelector(".panel"),t=this.renderRoot.querySelector(".backdrop");this._motion.open(e,t),this._detach=this._motion.attachDrag(this.renderRoot.querySelector(".grab-zone"),e,()=>this._pick(null)),this.renderRoot.querySelector(".face")?.focus()}disconnectedCallback(){super.disconnectedCallback(),this._detach?.()}render(){return U`
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
    `}async _pick(e){if(this._closing)return;this._closing=!0;const t=this.renderRoot.querySelector(".panel"),s=this.renderRoot.querySelector(".backdrop");await this._motion.close(t,s),this.dispatchEvent(new CustomEvent("pv-person-pick",{detail:{member:e},bubbles:!0,composed:!0}))}}fn.styles=[ot,Ha,r`
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
    `],e([ue({type:String,reflect:!0})],fn.prototype,"layout",void 0),e([ue({type:String})],fn.prototype,"heading",void 0),e([ue({type:String})],fn.prototype,"body",void 0),e([ue({attribute:!1})],fn.prototype,"people",void 0),e([ue({attribute:!1})],fn.prototype,"hass",void 0),e([ue({attribute:!1})],fn.prototype,"colorOf",void 0),ge("pv-chores-people-sheet",fn);const _n={plan_day:"📅",more_time:"⏰",skip:"🛌",done_by:"🙋",history:"📜",undo:"↩️",change_due:"🗓️",hand_off:"🔁",excuse:"🤒",edit:"✏️",delete:"🗑️",approve:"✅",send_back:"↩️"},wn=["Not finished","Missed a spot","Do it again"];class xn extends de{constructor(){super(...arguments),this.layout="landscape",this.color="#5B5BD6",this.history=null,this.busy=!1,this._open=null,this._note="",this._motion=new Wa(this),this._detach=null,this._closing=!1,this._key=e=>{if("Escape"===e.key)return e.preventDefault(),void this.close();qa(this.shadowRoot,e)}}firstUpdated(){this.style.setProperty("--member",this.color);const e=this.renderRoot.querySelector(".panel"),t=this.renderRoot.querySelector(".backdrop");this._motion.open(e,t),this._detach=this._motion.attachDrag(this.renderRoot.querySelector(".grab-zone"),e,()=>{this.close()}),this.renderRoot.querySelector(".option > button")?.focus()}disconnectedCallback(){super.disconnectedCallback(),this._detach?.()}async close(){if(this._closing)return;this._closing=!0;const e=this.renderRoot.querySelector(".panel"),t=this.renderRoot.querySelector(".backdrop");await this._motion.close(e,t),this.dispatchEvent(new CustomEvent("pv-sheet-close",{bubbles:!0,composed:!0}))}render(){const e=this.model;return e?U`
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
    `:Y}_option(e){const t=this._open===e.id,s=!!e.chips?.length||!!e.pick||"history"===e.id||"send_back"===e.id;return U`
      <div class="option ${e.destructive?"destructive":""}">
        <button type="button" ?disabled=${e.disabled||this.busy} aria-expanded=${s?t?"true":"false":Y}
          @click=${()=>this._tap(e,s)}>
          <span class="icon" aria-hidden="true">${_n[e.id]}</span>
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
          ${wn.map(t=>U`
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
            @change=${t=>{const s=t.target.value;s&&this._choose(e.id,s)}} />
        `:Y}
      </div>
    `}_tap(e,t){if(t)return this._open=this._open===e.id?null:e.id,void("history"===e.id&&"history"===this._open&&this._choose("history"));this._choose(e.id)}_choose(e,t){this.dispatchEvent(new CustomEvent("pv-option",{detail:{id:e,value:t},bubbles:!0,composed:!0}))}}xn.styles=[ot,Ha,pi,r`
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
    `],e([ue({type:String,reflect:!0})],xn.prototype,"layout",void 0),e([ue({attribute:!1})],xn.prototype,"model",void 0),e([ue({type:String})],xn.prototype,"color",void 0),e([ue({attribute:!1})],xn.prototype,"history",void 0),e([ue({type:Boolean})],xn.prototype,"busy",void 0),e([me()],xn.prototype,"_open",void 0),e([me()],xn.prototype,"_note",void 0),ge("pv-chore-options",xn);class $n extends de{constructor(){super(...arguments),this.layout="landscape",this.colorOf=e=>e.color,this.busy=new Set,this._sendingBack=null,this._note="",this._motion=new Wa(this),this._detach=null,this._closing=!1,this._key=e=>{if("Escape"===e.key)return e.preventDefault(),void this.close();"landscape"!==this.layout&&qa(this.shadowRoot,e)}}firstUpdated(){const e=this.renderRoot.querySelector(".panel"),t=this.renderRoot.querySelector(".backdrop");if("landscape"===this.layout)if("reduced"===Ba(this))e.animate({opacity:[0,1]},{duration:150});else{const t=Pa(za);e.animate({transform:["translateX(100%)","translateX(0)"]},{duration:t.duration,easing:t.easing})}else this._motion.open(e,t),this._detach=this._motion.attachDrag(this.renderRoot.querySelector(".grab-zone"),e,()=>{this.close()});this.renderRoot.querySelector(".answers button, .done")?.focus()}updated(e){e.has("groups")&&this._sendingBack&&!this._all().some(e=>e.id===this._sendingBack)&&(this._sendingBack=null)}disconnectedCallback(){super.disconnectedCallback(),this._detach?.()}async close(){if(this._closing)return;this._closing=!0;const e=this.renderRoot.querySelector(".panel"),t=this.renderRoot.querySelector(".backdrop");if("landscape"===this.layout){const t="reduced"===Ba(this)?e.animate({opacity:[1,0]},{duration:120,fill:"forwards"}):e.animate({transform:["translateX(0)","translateX(100%)"]},{duration:220,easing:"cubic-bezier(.4,0,1,1)",fill:"forwards"});await t.finished.catch(()=>{})}else await this._motion.close(e,t);this.dispatchEvent(new CustomEvent("pv-sheet-close",{bubbles:!0,composed:!0}))}_all(){const e=this.groups;return e?[...e.chores,...e.requests,...e.rewards]:[]}render(){const e=this.groups;return e?U`
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
          <button class="pv-btn pv-btn-primary" type="button" ?disabled=${t||e.blocked}
            @click=${()=>this._review(e,!0)}>${t?"Saving…":e.allow}</button>
        </div>
      </div>
      ${this._sendingBack===e.id?U`
        <div class="reasons">
          <span class="lead">Sending back: what should change?</span>
          ${wn.map(t=>U`<button class="chip" type="button" @click=${()=>this._review(e,!1,t)}>${t}</button>`)}
          <input type="text" maxlength="60" placeholder="Write a note…" aria-label="Write a note" .value=${this._note}
            @input=${e=>{this._note=e.target.value}}
            @keydown=${t=>{"Enter"===t.key&&this._review(e,!1,this._note.trim()||null)}} />
          <button class="chip" type="button" @click=${()=>this._review(e,!1,this._note.trim()||null)}>Send back</button>
        </div>
      `:Y}
    `}_decline(e){if("completion"===e.kind)return this._sendingBack=this._sendingBack===e.id?null:e.id,void(this._note="");this._review(e,!1)}_review(e,t,s){this._sendingBack=null,this.dispatchEvent(new CustomEvent("pv-review",{detail:{row:e,allow:t,note:s},bubbles:!0,composed:!0}))}}$n.styles=[ot,Ha,r`
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
    `],e([ue({type:String,reflect:!0})],$n.prototype,"layout",void 0),e([ue({attribute:!1})],$n.prototype,"groups",void 0),e([ue({attribute:!1})],$n.prototype,"hass",void 0),e([ue({attribute:!1})],$n.prototype,"colorOf",void 0),e([ue({attribute:!1})],$n.prototype,"busy",void 0),e([me()],$n.prototype,"_sendingBack",void 0),e([me()],$n.prototype,"_note",void 0),ge("pv-chores-inbox",$n);class kn extends de{constructor(){super(...arguments),this.layout="landscape",this.people=[],this.colorOf=e=>e.color,this.today="",this.minutesPerStar=15,this.busy=!1,this._draft={name:"",who:[],when:"today",by:null,every:"weekly",minutes:15,needsOk:!1,needsOkSet:!1,stars:null},this._problem=null,this._other=!1,this._changeStars=!1,this._motion=new Wa(this),this._detach=null,this._closing=!1,this._add=()=>{const e=Da(this._draft,this.today);this._problem=e,e||this.dispatchEvent(new CustomEvent("pv-quick-add",{detail:{draft:this._draft},bubbles:!0,composed:!0}))},this._key=e=>{if("Escape"===e.key)return e.preventDefault(),void this.close();qa(this.shadowRoot,e)}}firstUpdated(){const e=this.renderRoot.querySelector(".panel"),t=this.renderRoot.querySelector(".backdrop");this._motion.open(e,t),this._detach=this._motion.attachDrag(this.renderRoot.querySelector(".grab-zone"),e,()=>{this.close()}),this.renderRoot.querySelector("#name")?.focus()}disconnectedCallback(){super.disconnectedCallback(),this._detach?.()}async close(){if(this._closing)return;this._closing=!0;const e=this.renderRoot.querySelector(".panel"),t=this.renderRoot.querySelector(".backdrop");await this._motion.close(e,t),this.dispatchEvent(new CustomEvent("pv-sheet-close",{bubbles:!0,composed:!0}))}_set(e){this._draft={...this._draft,...e},this._problem&&(this._problem=Da(this._draft,this.today))}_toggle(e){const t=this._draft.who.includes(e.id)?this._draft.who.filter(t=>t!==e.id):[...this._draft.who,e.id];this._draft=function(e,t,s){return{...e,who:t,needsOk:e.needsOkSet?e.needsOk:ka(t,s)}}(this._draft,t,this.people),this._problem&&(this._problem=Da(this._draft,this.today))}render(){const e=this._draft;return U`
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
              ${Fa(this.today).map(t=>U`
                <button class="chip" type="button" aria-pressed=${e.by===t.day?"true":"false"} @click=${()=>this._set({by:t.day})}>${t.label}</button>
              `)}
              <input type="date" aria-label="Pick a date" min=${this.today} .value=${e.by&&!Fa(this.today).some(t=>t.day===e.by)?e.by:""}
                @change=${e=>this._set({by:e.target.value||null})} />
            </div>
          `:Y}
          ${"repeats"===e.when?U`
            <div class="chips">
              ${function(e){const t=mi(e);return[{id:"daily",label:"Every day"},{id:"weekly",label:`Every ${Ca[t.getDay()]}`},{id:"monthly",label:`Every month on the ${Sa(Math.min(28,t.getDate()))}`}]}(this.today).map(t=>U`
                <button class="chip" type="button" aria-pressed=${e.every===t.id?"true":"false"} @click=${()=>this._set({every:t.id})}>${t.label}</button>
              `)}
            </div>
          `:Y}
        </section>
        <section>
          <span class="title">About how long?</span>
          <div class="chips">
            ${$a.map(t=>U`
              <button class="chip" type="button" aria-pressed=${this._other||e.minutes!==t?"false":"true"}
                @click=${()=>{this._other=!1,this._set({minutes:t})}}>${fi(t)}</button>
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
          <span class="worth">${function(e,t){const s=xa(e.minutes,t,e.stars);return null!==e.stars?`Earns ★ ${s} each time`:`Earns ★ ${s} (${function(e){return 1===e?"1 per minute":`1 per ${e} minutes`}(t)})`}(e,this.minutesPerStar)}</span>
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
    `}}kn.styles=[ot,Ha,r`
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
    `],e([ue({type:String,reflect:!0})],kn.prototype,"layout",void 0),e([ue({attribute:!1})],kn.prototype,"people",void 0),e([ue({attribute:!1})],kn.prototype,"hass",void 0),e([ue({attribute:!1})],kn.prototype,"colorOf",void 0),e([ue({type:String})],kn.prototype,"today",void 0),e([ue({type:Number})],kn.prototype,"minutesPerStar",void 0),e([ue({type:Boolean})],kn.prototype,"busy",void 0),e([me()],kn.prototype,"_draft",void 0),e([me()],kn.prototype,"_problem",void 0),e([me()],kn.prototype,"_other",void 0),e([me()],kn.prototype,"_changeStars",void 0),ge("pv-chores-quick-add",kn);const Fn=[{id:"timeline",label:"Timeline"},{id:"list",label:"List"},{id:"pictures",label:"Pictures"}];class En extends de{constructor(){super(...arguments),this.columns=[],this.events=[],this.colorOf=e=>e.color,this.goal=null,this.shares=[],this.bedtime=null,this.timeFormat="12h",this.layout="landscape",this.locked=!1,this.minute=0}willUpdate(){this.column&&this.style.setProperty("--member",this.colorOf(this.column.member))}_style(){const e=this.column.member.my_day;return"list"===e||"pictures"===e?e:"timeline"}render(){const e=this.column;if(!e)return Y;const t=e.member,s=this._style();return U`
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
              ${Fn.map(e=>U`
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
          <span>Goal: ${mn(e.reward.icon)} ${e.reward.name}</span>
          <span class="num">${e.need>0?`${e.have} of ${e.reward.cost} ★ · ${e.need} more`:"Enough stars!"}</span>
        </div>
        <div class="bar" role="progressbar" aria-valuemin="0" aria-valuemax=${e.reward.cost} aria-valuenow=${e.have}
          aria-label=${`${e.reward.name}: ${e.have} of ${e.reward.cost} stars`}><span style="width:${Math.round(100*e.progress)}%"></span></div>
      </div>
    `}_row(e,t="now"){return U`<pv-chore-item .row=${e} color=${this.colorOf(this.column.member)} ?highlight=${"now"===t} ?locked=${this.locked}></pv-chore-item>`}_timeline(){const e=function(e,t){const s=t.now,i=Ci(s,t.dayStarts),a=e.entries.flatMap(e=>"row"===e.kind?[{row:e.row,zone:e.zone}]:[]),n=a.filter(e=>"overdue"===e.zone||"past"===e.zone).map(e=>e.row),r=a.filter(e=>"now"===e.zone||"later"===e.zone).map(e=>e.row),o=e.doneToday,l=a.filter(e=>"week"===e.zone).map(e=>e.row),d=t.events.filter(t=>t.member===e.member.id),c=[],p=t.bedtime;for(const e of $i){const a=Di(e,i),h=d.filter(s=>Ci(s.start,t.dayStarts)===e&&(!p||s.start<p)),u="past"===a?[]:[..."now"===a?n:[],...r.filter(t=>(t.item.band??i)===e)],m=o.filter(s=>s.item.completion&&Ci(new Date(s.item.completion.at),t.dayStarts)===e),v=[];for(const e of h)v.push({at:e.start.getTime(),entry:{kind:"event",key:`event:${e.calendar}:${e.start.getTime()}:${e.title}`,time:wi(e.start,t.timeFormat),title:e.title,range:Ni(e,t.timeFormat),past:e.end<=s,picture:Bi(e.title,"📅")}});for(const e of m){const s=new Date(e.item.completion.at);v.push({at:s.getTime(),entry:{kind:"chore",key:e.key,time:wi(s,t.timeFormat),row:e}})}if("now"===a){const e=s.getTime(),i=d.find(e=>e.start>s),a=i?Math.round((i.start.getTime()-e)/6e4):p?Math.round((p.getTime()-e)/6e4):null;v.push({at:e,entry:{kind:"now",key:"now",time:wi(s,t.timeFormat)}});const o=d.some(e=>e.start<=s&&e.end>s);!o&&(null===a||a>=15)&&v.push({at:e+1,entry:{kind:"free",key:"free",until:i?wi(i.start,t.timeFormat):null,span:null!==a?fi(a):null,fits:Ii(a,[...n,...r,...l])}}),u.forEach((t,s)=>v.push({at:e+2+s,entry:{kind:"chore",key:t.key,time:null,row:t}}))}else if("later"===a){const t=h.reduce((e,t)=>Math.max(e,t.end.getTime()),0),i=Math.max(t,new Date(s.getFullYear(),s.getMonth(),s.getDate(),Ri[e]).getTime());u.forEach((e,t)=>v.push({at:i+t,entry:{kind:"chore",key:e.key,time:null,row:e}}))}0!==v.length&&(c.push({kind:"band",key:`band:${e}`,band:e,label:ki[e]}),c.push(...v.sort((e,t)=>e.at-t.at).map(e=>e.entry)))}return p&&p>s&&c.push({kind:"bedtime",key:"bedtime",time:wi(p,t.timeFormat,"12h"===t.timeFormat)}),c}(this.column,{now:new Date,events:this.events,timeFormat:this.timeFormat,bedtime:this.bedtime,dayStarts:this.board?.settings?.day_starts});return 0===e.length?U`<p class="meta" style="margin-top:12px">Nothing on today's timeline.</p>`:U`<div class="tl">${nn(e,e=>e.key,e=>this._entry(e))}</div>${this._weekRows()}`}_entry(e){switch(e.kind){case"band":return U`<div class="tl-band">${e.label}</div>`;case"event":return U`
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
      ${nn(e,e=>e.key,e=>this._row(e,"week"))}
    `}_list(){const e=this.column,t=e.entries.flatMap(e=>"row"===e.kind&&"week"!==e.zone&&"done"!==e.zone?[e.row]:[]),s=e.entries.flatMap(e=>"row"===e.kind&&"week"===e.zone?[e.row]:[]),i=function(e,t,s,i){const a=e.filter(e=>e.member===t&&e.start>s);if(0===a.length)return null;const[n,...r]=a,o=wi(n.start,i,"12h"===i);return 0===r.length?`Next: ${n.title} at ${o} · then nothing until tomorrow`:`Next: ${n.title} at ${o}`}(this.events,e.member.id,new Date,this.timeFormat);return U`
      ${i?U`<div class="next">📅 ${i}</div>`:Y}
      <div class="section-head"><span>Today</span></div>
      ${t.length||e.doneToday.length?Y:U`<p class="meta">Nothing due today.</p>`}
      ${nn(t,e=>e.key,e=>this._row(e))}
      ${nn(e.doneToday,e=>e.key,e=>this._row(e,"done"))}
      ${s.length&&"landscape"!==this.layout?U`
        <div class="section-head"><span>This week</span><span class="right">${this.board.week.days_left} days left</span></div>
        ${nn(s,e=>e.key,e=>this._row(e,"week"))}
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
    `}_pictures(){const e=function(e,t,s,i){const a=e.entries.flatMap(e=>"row"===e.kind?[{row:e.row,zone:e.zone}]:[]),n=a.filter(e=>"done"!==e.zone&&("open"===e.row.state||"sent_back"===e.row.state)),r=["overdue","now","past","later","week"];n.sort((e,t)=>r.indexOf(e.zone)-r.indexOf(t.zone));const[o,...l]=n.map(e=>e.row),d=[],c=t.find(t=>t.member===e.member.id&&t.start>s);return c&&d.push({kind:"event",picture:Bi(c.title,"📅"),text:`${c.title} at ${wi(c.start,i)}`}),l[0]&&d.push({kind:"chore",row:l[0]}),{now:o??null,next:d,waiting:a.filter(e=>"pending"===e.row.state).map(e=>e.row),done:e.doneToday,later:l.slice(1)}}(this.column,this.events,new Date,this.timeFormat),t=this.column.member.stars?this.column.entry.week_stars:0,s=this.colorOf(this.column.member);return U`
      ${e.now?U`
        <div class="now-tile">
          <div class="label" style="text-align:center;margin-top:0;color:${s}">NOW</div>
          ${rn(e.now.key,U`<pv-chore-tile large now .row=${e.now} color=${s} ?locked=${this.locked}
            .stars=${this.column.member.stars?e.now.item.stars:0}></pv-chore-tile>`)}
        </div>
      `:U`<div class="label" style="text-align:center">All done for now 🎉</div>`}
      ${e.next.length?U`
        <div class="pictures-next">
        <div class="label">Next</div>
        <div class="steps">
          ${nn(e.next,e=>"event"===e.kind?`event:${e.text}`:e.row.key,e=>"event"===e.kind?U`<div class="step"><span class="picture" aria-hidden="true">${e.picture}</span>${e.text}</div>`:U`<pv-chore-tile .row=${e.row} color=${s} ?locked=${this.locked}></pv-chore-tile>`)}
        </div>
        </div>
      `:Y}
      ${e.waiting.length||e.later.length||e.done.length?U`
        <div class="label">Later, waiting, and done</div>
        <div class="tiles">
          ${nn([...e.later,...e.waiting,...e.done],e=>e.key,e=>U`
            <pv-chore-tile .row=${e} color=${s} ?locked=${this.locked}></pv-chore-tile>
          `)}
        </div>
      `:Y}
      ${this.column.member.stars?U`
        <div class="label">Stickers this week${this.goal?U` → ${mn(this.goal.reward.icon)} ${this.goal.reward.name} at ${this.goal.reward.cost}`:Y}</div>
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
          ${t.length?nn(t,e=>e.key,e=>this._row(e,"week")):U`<p class="meta">Nothing more this week.</p>`}
        </div>
      </aside>
    `}_fire(e,t){this.dispatchEvent(new CustomEvent(e,{detail:t,bubbles:!0,composed:!0}))}}En.styles=[pi,r`
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
    `],e([ue({attribute:!1})],En.prototype,"column",void 0),e([ue({attribute:!1})],En.prototype,"columns",void 0),e([ue({attribute:!1})],En.prototype,"board",void 0),e([ue({attribute:!1})],En.prototype,"events",void 0),e([ue({attribute:!1})],En.prototype,"hass",void 0),e([ue({attribute:!1})],En.prototype,"colorOf",void 0),e([ue({attribute:!1})],En.prototype,"goal",void 0),e([ue({attribute:!1})],En.prototype,"shares",void 0),e([ue({attribute:!1})],En.prototype,"bedtime",void 0),e([ue({attribute:!1})],En.prototype,"timeFormat",void 0),e([ue({type:String,reflect:!0})],En.prototype,"layout",void 0),e([ue({type:Boolean})],En.prototype,"locked",void 0),e([ue({attribute:!1})],En.prototype,"minute",void 0),ge("pv-chores-my-day",En);class Cn extends de{constructor(){super(...arguments),this.view=null,this.rows=[],this.highlights=[],this.shares=[],this.colorOf=e=>e.color,this.layout="landscape",this.canExcuse=!1,this.current=!0,this.failed=!1,this._touch=null,this._touchStart=e=>{this._touch=1===e.touches.length?{x:e.touches[0].clientX,y:e.touches[0].clientY}:null},this._touchEnd=e=>{const t=this._touch;this._touch=null;const s=e.changedTouches[0];if(!t||!s)return;const i=mt(s.clientX-t.x,s.clientY-t.y);i&&this._nav("next"===i?1:-1)}}render(){const e=this.view,t="landscape"===this.layout?"landscape":"phone"===this.layout?"phone":"portrait";return U`
      <div class="wrap" @touchstart=${this._touchStart} @touchend=${this._touchEnd}>
        <div class="top">
          <button class="nav" type="button" aria-label="Last week" @click=${()=>this._nav(-1)}>‹</button>
          <h2>${e?ra(e):"This week"}</h2>
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
    `}_grid(e,t){const s=function(e){const t=[];for(let s=0;s<7;s++){const i=Wi(e.week.start,s);if(i>=e.week.end)break;t.push({date:i,label:aa[mi(i).getDay()],today:i===e.today})}return t}(e);return U`
      <div class="card">
        <div class="grid ${t}" role="grid" aria-label=${ra(e)}>
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
    `:Y}_nav(e){this._fire("pv-week-nav",{offset:e})}_fire(e,t){this.dispatchEvent(new CustomEvent(e,{detail:t,bubbles:!0,composed:!0}))}}Cn.styles=[ot,pi,r`
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
    `],e([ue({attribute:!1})],Cn.prototype,"view",void 0),e([ue({attribute:!1})],Cn.prototype,"rows",void 0),e([ue({attribute:!1})],Cn.prototype,"highlights",void 0),e([ue({attribute:!1})],Cn.prototype,"shares",void 0),e([ue({attribute:!1})],Cn.prototype,"hass",void 0),e([ue({attribute:!1})],Cn.prototype,"colorOf",void 0),e([ue({type:String,reflect:!0})],Cn.prototype,"layout",void 0),e([ue({type:Boolean})],Cn.prototype,"canExcuse",void 0),e([ue({type:Boolean})],Cn.prototype,"current",void 0),e([ue({type:Boolean})],Cn.prototype,"failed",void 0),ge("pv-chores-week",Cn);const Sn=["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"],Dn=["January","February","March","April","May","June","July","August","September","October","November","December"];function An(e){return!("section"in e)}class zn extends de{constructor(){super(...arguments),this.layout="landscape",this.date="",this.today="",this.day=null,this.failed=!1,this.canExcuse=!1,this.names=e=>e,this._motion=new Wa(this),this._detach=null,this._closing=!1,this._key=e=>{if("Escape"===e.key)return e.preventDefault(),void this.close();qa(this.shadowRoot,e)}}firstUpdated(){const e=this.renderRoot.querySelector(".panel"),t=this.renderRoot.querySelector(".backdrop");this._motion.open(e,t),this._detach=this._motion.attachDrag(this.renderRoot.querySelector(".grab-zone"),e,()=>{this.close()}),this.renderRoot.querySelector(".actions button")?.focus()}disconnectedCallback(){super.disconnectedCallback(),this._detach?.()}async close(){if(this._closing)return;this._closing=!0;const e=this.renderRoot.querySelector(".panel"),t=this.renderRoot.querySelector(".backdrop");await this._motion.close(e,t),this.dispatchEvent(new CustomEvent("pv-sheet-close",{bubbles:!0,composed:!0}))}_badge(e){if(An(e)){const t=yi(e.status);return"done"===e.status&&e.done_by&&e.done_by!==this.member.id?{...t,words:`Done by ${this.names(e.done_by)}`}:t}return bi(e,{today:this.today,daysLeft:7,remaining:0})??("done"===e.status?yi("done"):null)}render(){const e=this.day?.members[this.member?.id??""],t=e?.summary,s=this.day?e?.away?"Away: nothing was due, and the streak keeps.":t?t.closed?`Ring closed: ${t.done+t.pending} of ${t.due} done.`:`${t.done+t.pending} of ${t.due} done.`:"future"===this.day.kind?"Still to come.":"":"";return U`
      <div class="backdrop" @click=${()=>{this.close()}}></div>
      <div class="panel" role="dialog" aria-modal="true" aria-labelledby="day-title" @keydown=${this._key}>
        <div class="grab-zone" aria-hidden="true"><div class="grab"></div></div>
        <h2 class="heading" id="day-title">${this.member?.name} · ${function(e){const[t,s,i]=e.split("-").map(Number),a=new Date(t,s-1,i,12);return`${Sn[a.getDay()]}, ${Dn[a.getMonth()]} ${a.getDate()}`}(this.date)}</h2>
        ${s?U`<p class="sub">${s}</p>`:Y}
        ${this.failed?U`<p class="sub">Couldn't load this day. Try again in a moment.</p>`:this.day?e&&e.items.length?U`
          <ul>
            ${e.items.map(e=>{const t=this._badge(e);return U`
                <li>
                  <span class="pic" aria-hidden="true">${Oi(e.icon,e.name)}</span>
                  <span class="name">${e.name}</span>
                  ${t?U`<span class="badge ${t.tone}">${t.glyph?`${t.glyph} `:""}${t.words}</span>`:Y}
                  ${An(e)&&"missed"===e.status&&this.canExcuse?U`
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
    `}_excuse(e){this.dispatchEvent(new CustomEvent("pv-day-excuse",{detail:{occurrence:e.key,name:e.name},bubbles:!0,composed:!0}))}}zn.styles=[ot,Ha,pi,r`
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
    `],e([ue({type:String,reflect:!0})],zn.prototype,"layout",void 0),e([ue({attribute:!1})],zn.prototype,"member",void 0),e([ue({type:String})],zn.prototype,"date",void 0),e([ue({type:String})],zn.prototype,"today",void 0),e([ue({attribute:!1})],zn.prototype,"day",void 0),e([ue({type:Boolean})],zn.prototype,"failed",void 0),e([ue({type:Boolean})],zn.prototype,"canExcuse",void 0),e([ue({attribute:!1})],zn.prototype,"names",void 0),ge("pv-chores-day-sheet",zn);class Mn extends de{constructor(){super(...arguments),this.balances=[],this.cards=[],this.recent=null,this.colorOf=e=>e.color,this.layout="landscape",this.canEdit=!1}render(){return U`
      <div class="wrap">
        ${this.balances.length?U`
          <div class="balances">
            ${this.balances.map(e=>U`
              <div class="balance" style="--c:${this.colorOf(e.member)}">
                <pv-member-avatar .member=${{...e.member,color:this.colorOf(e.member)}} .hass=${this.hass} size="40"></pv-member-avatar>
                <span class="stars num" aria-label=${`${e.member.name}: ${e.stars} stars`}>★ ${e.stars}</span>
                <div class="goal">
                  ${e.goal?U`
                    Goal: ${mn(e.goal.reward.icon)} ${e.goal.reward.name} · ${e.goal.need>0?`${e.goal.need} more`:"enough stars!"}
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
    `}_card(e){const t=e.reward,s=e.asked.length;return U`
      <div class="card">
        ${e.goals.length?U`<span class="tag goal-tag">${e.goals.map(e=>`${e.name}'s goal`).join(", ")}</span>`:Y}
        <button class="open" type="button" @click=${()=>this._fire("pv-reward-open",{reward:t.id})}>
          <span class="icon" aria-hidden="true">${mn(t.icon)}</span>
          <span class="name">${t.name}</span>
          <span class="cost num">★ ${t.cost}</span>
        </button>
        <div class="tags">
          ${e.people.map(e=>U`<span class="tag ${e.afford?"ok":""}">${e.member.name}${e.afford?" ✓":`: ${e.more} more`}</span>`)}
          ${s?U`<span class="badge act">⏳ ${e.asked.map(e=>e.name).join(", ")} · Waiting for OK</span>`:Y}
        </div>
        ${e.canRedeem?U`<button class="pv-btn pv-btn-primary action" type="button" @click=${()=>this._fire("pv-reward-redeem",{reward:t.id})}>Redeem</button>`:U`<button class="pv-btn pv-btn-secondary action" type="button" disabled>${s?"Requested":"Not enough stars yet"}</button>`}
      </div>
    `}_fire(e,t){this.dispatchEvent(new CustomEvent(e,{detail:t,bubbles:!0,composed:!0}))}}Mn.styles=[ot,pi,r`
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
    `],e([ue({attribute:!1})],Mn.prototype,"balances",void 0),e([ue({attribute:!1})],Mn.prototype,"cards",void 0),e([ue({attribute:!1})],Mn.prototype,"recent",void 0),e([ue({attribute:!1})],Mn.prototype,"hass",void 0),e([ue({attribute:!1})],Mn.prototype,"colorOf",void 0),e([ue({type:String,reflect:!0})],Mn.prototype,"layout",void 0),e([ue({type:Boolean})],Mn.prototype,"canEdit",void 0),ge("pv-chores-rewards",Mn);class Tn extends de{constructor(){super(...arguments),this.layout="landscape",this.card=null,this.people=[],this.colorOf=e=>e.color,this.canEdit=!1,this.busy=!1,this._editing=!1,this._draft=ha(),this._problem=null,this._motion=new Wa(this),this._detach=null,this._closing=!1,this._started=!1,this._save=()=>{this._problem=ua(this._draft),this._problem||this._fire("pv-reward-save",{draft:this._draft})},this._key=e=>{if("Escape"===e.key)return e.preventDefault(),void this.close();qa(this.shadowRoot,e)}}willUpdate(){this._started||(this._started=!0,this._editing=!this.card,this._draft=ha(this.card?.reward))}firstUpdated(){const e=this.renderRoot.querySelector(".panel"),t=this.renderRoot.querySelector(".backdrop");this._motion.open(e,t),this._detach=this._motion.attachDrag(this.renderRoot.querySelector(".grab-zone"),e,()=>{this.close()}),this.renderRoot.querySelector("input, button")?.focus()}disconnectedCallback(){super.disconnectedCallback(),this._detach?.()}async close(){if(this._closing)return;this._closing=!0;const e=this.renderRoot.querySelector(".panel"),t=this.renderRoot.querySelector(".backdrop");await this._motion.close(e,t),this.dispatchEvent(new CustomEvent("pv-sheet-close",{bubbles:!0,composed:!0}))}render(){return U`
      <div class="backdrop" @click=${()=>{this.close()}}></div>
      <div class="panel" role="dialog" aria-modal="true" aria-labelledby="reward-title" @keydown=${this._key}>
        <div class="grab-zone" aria-hidden="true"><div class="grab"></div></div>
        ${this._editing?this._form():this._view()}
      </div>
    `}_view(){const e=this.card;if(!e)return Y;const t=e.reward;return U`
      <div class="icon" aria-hidden="true">${mn(t.icon)}</div>
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
    `}_set(e){this._draft={...this._draft,...e},this._problem&&(this._problem=ua(this._draft))}_form(){const e=this._draft,t=!!this.card;return U`
      <h2 class="heading" id="reward-title">${t?"Edit reward":"Add a reward"}</h2>
      <span class="title">Picture</span>
      <div class="pictures">
        ${ma.map(t=>U`<button type="button" aria-pressed=${e.icon===t?"true":"false"} aria-label=${t} @click=${()=>this._set({icon:t})}>${t}</button>`)}
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
    `}_fire(e,t){this.dispatchEvent(new CustomEvent(e,{detail:t,bubbles:!0,composed:!0}))}}Tn.styles=[ot,Ha,r`
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
    `],e([ue({type:String,reflect:!0})],Tn.prototype,"layout",void 0),e([ue({attribute:!1})],Tn.prototype,"card",void 0),e([ue({attribute:!1})],Tn.prototype,"people",void 0),e([ue({attribute:!1})],Tn.prototype,"hass",void 0),e([ue({attribute:!1})],Tn.prototype,"colorOf",void 0),e([ue({type:Boolean})],Tn.prototype,"canEdit",void 0),e([ue({type:Boolean})],Tn.prototype,"busy",void 0),e([me()],Tn.prototype,"_editing",void 0),e([me()],Tn.prototype,"_draft",void 0),e([me()],Tn.prototype,"_problem",void 0),ge("pv-chores-reward-sheet",Tn);class Pn extends de{constructor(){super(...arguments),this.data=null,this.mode="light",this.layout="landscape",this.household=null,this.session=null,this.services={},this.revision=0,this.openTarget=null,this._sheet=null,this._toast=null,this._minute=Math.floor(Date.now()/6e4),this._weekOffset=0,this._week=null,this._weekFailed=!1,this._weekAsked=null,this._weekRevision=-1,this._myDayMember=null,this._reviewing=new Set,this._overlayOpen=!1,this._opener=null,this._last=null,this._watching=null,this._columnsFor=vt((e,t,s,i,a,n)=>Mi(e,{today:e.today,now:new Date,events:xi(s,new Date(e.day.start),new Date(e.day.end),i),timeFormat:a,activities:new Map(e.chores.map(e=>[e.id,e])),members:t?Rs(t.members):[]})),this._colorOf=e=>qs(e,this.mode),this._askStartOver=async()=>{await this.asParent("Who's starting over?")&&(this._sheet={kind:"start_over"})},this._onToastAction=e=>{this._toast=null,this.onToastAction(e.detail.toast,e.detail.action)}}get service(){return this.services?.chores}_watch(){const e=this.isConnected?this.service:void 0;this._watching?.service!==e&&(this._watching?.stop(),this._watching=e?{service:e,stop:e.watch()}:null)}moduleAction(e){"inbox"===e&&this._openInbox(),"add"===e&&this._openQuickAdd()}async _openInbox(){await this.asParent("Who's approving?")&&(this._sheet={kind:"inbox"})}async _openQuickAdd(){await this.asParent("Who's adding a chore?")&&(this._sheet={kind:"quick_add",busy:!1})}async _review(e){const{row:t,allow:s,note:i}=e,a=this.service?.api;if(!a||!await this.asParent("Who's approving?"))return!1;this._reviewing=new Set([...this._reviewing,t.id]);try{return await a.review(t.id,s?"allow":"decline",i??null),this.showToast({id:`review-${t.id}`,text:wa(t,s,i)}),!0}catch(e){return this.showToast({id:`review-${t.id}-${Date.now()}`,text:_s(e)??"That didn't save. Try again.",tone:"bad"}),!1}finally{const e=new Set(this._reviewing);e.delete(t.id),this._reviewing=e}}async _approveAll(e){let t=0;for(const s of e){if(!await this._review({row:s,allow:!0}))break;t+=1}t>1&&this.showToast({id:`approved-${Date.now()}`,text:`Approved ${t} chores.`})}async _quickAdd(e){const t=this.service?.board(),s=this.service?.api;if(t&&s&&"quick_add"===this._sheet?.kind&&await this.asParent("Who's adding a chore?")){this._sheet={kind:"quick_add",busy:!0};try{await s.saveActivity(function(e,t){const s=e.name.trim(),i={name:s,icon:Bi(s),category:"other",assignees:[...e.who],on_board:!0,needs_ok:e.needsOk,stars:e.stars},a=Math.round(e.minutes);if("repeats"===e.when){const s=mi(t),n="daily"===e.every?"FREQ=DAILY":"weekly"===e.every?`FREQ=WEEKLY;BYDAY=${Ea[s.getDay()]}`:`FREQ=MONTHLY;BYMONTHDAY=${Math.min(28,s.getDate())}`;return{...i,schedule:"repeats",repeats:{rrule:n,start:t,window:"day",estimate_minutes:a}}}return{...i,schedule:"once",once:{on:"today"===e.when?t:null,by:"by"===e.when?e.by:null,by_time:null,sessions:1,estimate_minutes:a}}}(e,t.today)),this._sheet=null,this.showToast({id:`added-${Date.now()}`,text:`Added ${e.name.trim()}.`})}catch(e){this._sheet={kind:"quick_add",busy:!1},this.showToast({id:`add-${Date.now()}`,text:_s(e)??"That didn't save. Try again.",tone:"bad"})}}}willUpdate(e){super.willUpdate(e),e.has("_sheet")&&!e.get("_sheet")&&this._sheet&&(this._opener=function(){let e=document.activeElement;for(;e?.shadowRoot?.activeElement;)e=e.shadowRoot.activeElement;return e instanceof HTMLElement?e:null}()),e.has("openTarget")&&this.openTarget?.member&&(this._myDayMember=this.openTarget.member),this._watch();const t=this.service?.takeNotices()??[],s=t[t.length-1];s&&(this._toast={id:s.id,text:s.text,tone:"bad",ms:7e3})}updated(e){if(super.updated(e),"week"===this.view&&this._loadWeek(),e.has("_sheet")&&e.get("_sheet")&&!this._sheet){const e=this._opener;this._opener=null,e?.isConnected&&e.focus()}const t=null!==this._sheet;t!==this._overlayOpen&&(this._overlayOpen=t,this.dispatchEvent(new CustomEvent("pv-overlay-change",{detail:{open:t},bubbles:!0,composed:!0})))}connectedCallback(){super.connectedCallback(),this._clock=setInterval(()=>{const e=Math.floor(Date.now()/6e4);e!==this._minute&&(this._minute=e)},5e3)}disconnectedCallback(){super.disconnectedCallback(),clearInterval(this._clock),this._watching?.stop(),this._watching=null,this._overlayOpen&&(this._overlayOpen=!1,this.dispatchEvent(new CustomEvent("pv-overlay-change",{detail:{open:!1},bubbles:!0,composed:!0})))}render(){const e=this.service;return e?U`
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
      `:"offline"===e.status?this._unreachable(e):this._skeleton()}_myDayColumn(e){const t=this._myDayMember??this.household?.account.member_id??null;return e.find(e=>e.member.id===t)??e[0]}_openMyDay(e){this._myDayMember=e,this.dispatchEvent(new CustomEvent("pv-view-change",{detail:{view:"my_day"},bubbles:!0,composed:!0}))}async _setStyle(e,t){const s=this.service?.api;if(s&&await this.asMember(e,"Whose day is this?"))try{await s.savePrefs(e,{my_day:t})}catch(e){this.showToast({id:`style-${Date.now()}`,text:_s(e)??"That didn't save. Try again.",tone:"bad"})}}_renderMyDay(e){const t=this.display?.time_format??"12h",s=this._columnsFor(e,this.household,this.data,this.cardConfig,t,this._minute),i=this._myDayColumn(s);if(!i)return Y;const a=i.member;return U`
      <pv-chores-my-day .column=${i} .columns=${s} .board=${e} .hass=${this.hass} layout=${this.layout}
        .events=${xi(this.data,new Date(e.day.start),new Date(e.day.end),this.cardConfig)}
        .colorOf=${this._colorOf} .timeFormat=${t} .minute=${this._minute}
        .goal=${Li(a,i.entry,e.rewards)} .shares=${function(e,t){const s=t.map(t=>({member:t,minutes:e.members[t.id]?.contribution.shared_minutes??0})),i=s.reduce((e,t)=>e+t.minutes,0);return i<=0?[]:s.filter(e=>e.minutes>0).map(e=>({...e,percent:Math.round(100*e.minutes/i)}))}(e,Rs(this.household?.members??[]))}
        .bedtime=${function(e,t){const s=e.bedtime,i=(5===t.getDay()||6===t.getDay()?s?.weekend:s?.weeknight)??s?.weeknight;if(!i||!/^\d{1,2}:\d{2}$/.test(i))return null;const[a,n]=i.split(":").map(Number);return new Date(t.getFullYear(),t.getMonth(),t.getDate(),a,n)}(a,new Date)}
        ?locked=${"no"===di(this.household,this.session,a.id)}
        @pv-my-day-member=${e=>{this._myDayMember=e.detail.member}}
        @pv-my-day-style=${e=>{this._setStyle(e.detail.member,e.detail.style)}}
        @pv-hold-done=${e=>this._complete(e.detail)}
        @pv-hold-undo=${e=>this._uncheck(e.detail)}
        @pv-hint=${e=>this._hint(e.detail.row)}
        @pv-row-options=${e=>this._openOptions(e.detail.row)}></pv-chores-my-day>
    `}_loadWeek(e=!1){const t=this.service?.board(),s=this.service?.api;if(!t||!s)return;const i=0===this._weekOffset?t.week.start:Wi(t.week.start,7*this._weekOffset),a=0===this._weekOffset&&this._weekRevision!==this.revision;(e||this._weekAsked!==i||a)&&(this._weekAsked=i,this._weekRevision=this.revision,this._week?.week.start!==i&&(this._week=null),this._weekFailed=!1,s.week(i).then(e=>{this._weekAsked===i&&(this._week=e)},()=>{this._weekAsked===i&&(this._weekFailed=!0)}))}_renderWeek(e){const t=Rs(this.household?.members??[]),s=this._week;return U`
      <pv-chores-week .view=${s} .rows=${s?function(e,t,s){return t.filter(t=>e.members[t.id]).map(t=>{const i=e.members[t.id];return{member:t,cells:i.days.map(oa),weekly:la(i.weekly,s,e.today)}})}(s,t,e.week.days_left):[]}
        .highlights=${s?function(e,t,s=3){const i=[];for(const s of t){const t=e.members[s.id];if(!t)continue;const a=t.days.filter(e=>"future"!==e.kind&&!e.away&&(e.due??0)>0);a.length>=2&&a.some(e=>"past"===e.kind)&&a.every(e=>oa(e).closed)&&i.push({key:`closed:${s.id}`,member:s,text:`${s.name} has closed every ring this week.`})}for(const s of t){const t=e.members[s.id];if(t)for(const a of t.days)for(const t of a.missed_items??[])i.push({key:`missed:${t.key}`,member:s,text:`${s.name} missed ${t.name} on ${Yi(a.date,e.today)}.`,excuse:{occurrence:t.key,name:t.name,day:a.date}})}for(const s of t){const t=e.members[s.id],a=t?.days.filter(e=>e.away).map(e=>e.date)??[];a.length&&i.push({key:`away:${s.id}`,member:s,text:`${s.name} is away ${ca(a)}.`})}return i.slice(0,s)}(s,t):[]} .shares=${s?function(e,t){const s=t.filter(t=>e.members[t.id]).map(t=>({member:t,minutes:e.members[t.id].contribution.shared_minutes})),i=s.reduce((e,t)=>e+t.minutes,0);return i<=0?[]:s.filter(e=>e.minutes>0).map(e=>({...e,text:`${e.member.name} ${fi(e.minutes)}`,percent:100*e.minutes/i}))}(s,t):[]}
        .hass=${this.hass} .colorOf=${this._colorOf} layout=${this.layout} ?current=${0===this._weekOffset}
        ?failed=${this._weekFailed} ?canExcuse=${"no"!==ci(this.household,this.session)}
        @pv-week-nav=${e=>this._navWeek(e.detail.offset)}
        @pv-week-day=${e=>this._openDay(e.detail.member,e.detail.date)}
        @pv-week-excuse=${e=>{this._excuseMissed(e.detail.occurrence,e.detail.name,e.detail.member)}}>
      </pv-chores-week>
    `}_navWeek(e){this._weekOffset=0===e?0:this._weekOffset+e,this._loadWeek(0===e&&this._weekFailed)}_openDay(e,t){const s=this.service?.api;if(!s)return;const i={kind:"day",member:e,date:t,day:null,failed:!1};this._sheet=i,s.day(t).then(e=>{"day"===this._sheet?.kind&&this._sheet.date===t&&(this._sheet={...this._sheet,day:e})},()=>{"day"===this._sheet?.kind&&this._sheet.date===t&&(this._sheet={...this._sheet,failed:!0})})}async _excuseMissed(e,t,s){const i=this.service?.api;if(i&&await this.asParent(`Who's excusing ${t}?`))try{await i.excuseMissed(e);const a=this._member(s)?.name;this.showToast({id:`excused-${e}`,text:`Excused ${t}.${a?` ${a}'s streak holds.`:""}`}),this._loadWeek(!0),"day"===this._sheet?.kind&&this._openDay(this._sheet.member,this._sheet.date)}catch(e){this.showToast({id:`excuse-${Date.now()}`,text:_s(e)??"That didn't save. Try again.",tone:"bad"})}}_renderRewards(e){const t=Rs(this.household?.members??[]);return U`
      <pv-chores-rewards .balances=${function(e,t){return t.filter(t=>t.stars&&e.members[t.id]).map(t=>({member:t,stars:e.members[t.id].stars,goal:Li(t,e.members[t.id],e.rewards)}))}(e,t)} .cards=${pa(e,t)}
        .recent=${function(e,t){const s=e.recent_redemptions[0];if(!s)return null;const i=e=>e?t.find(t=>t.id===e)?.name??null:null,a=i(s.member)??s.member,n="auto"===s.by?null:i(s.by);return`Recently: ${a} redeemed ${s.name} ${"today"===Yi(s.at.slice(0,10),e.today)?"today":`on ${Yi(s.at.slice(0,10),e.today)}`}${n?`, approved by ${n}`:""}.`}(e,t)} .hass=${this.hass} .colorOf=${this._colorOf} layout=${this.layout}
        ?canEdit=${"no"!==ci(this.household,this.session)}
        @pv-reward-redeem=${e=>this._redeem(e.detail.reward)}
        @pv-reward-open=${e=>{this._openReward(e.detail.reward)}}></pv-chores-rewards>
    `}_redeem(e){const t=this.service?.board();if(!t)return;const s=pa(t,Rs(this.household?.members??[])).find(t=>t.reward.id===e);if(!s)return;const i=s.people.filter(e=>e.afford&&!e.asked).map(e=>e.member),a=async t=>{const i=this.service?.api;if(i&&await this.asMember(t.id,`Who's getting ${s.reward.name}?`))try{const a=await i.redeem(t.id,e);this.showToast({id:`redeem-${Date.now()}`,text:"given"===a.result?`${s.reward.name} is ${t.name}'s!`:`Asked for ${s.reward.name}. A parent will answer.`})}catch(e){this.showToast({id:`redeem-${Date.now()}`,text:_s(e)??"That didn't save. Try again.",tone:"bad"})}};1!==i.length?this._sheet={kind:"people",heading:`Who's getting ${s.reward.name}?`,people:i,body:`It costs ★ ${s.reward.cost}.`,pick:e=>{e&&a(e)}}:a(i[0])}async _openReward(e){(null!==e||await this.asParent("Who's adding a reward?"))&&(this._sheet={kind:"reward",id:e,busy:!1})}async _saveReward(e,t){const s=this.service?.api;if(s&&await this.asParent(e?"Who's changing this reward?":"Who's adding a reward?")){this._sheet={kind:"reward",id:e,busy:!0};try{await s.saveReward(function(e){return{name:e.name.trim(),icon:e.icon.trim()||null,cost:e.cost,needs_ok:e.needsOk,who:[...e.who]}}(t),e??void 0),this._sheet=null,this.showToast({id:`reward-${Date.now()}`,text:e?`Saved ${t.name.trim()}.`:`Added ${t.name.trim()}.`})}catch(t){this._sheet={kind:"reward",id:e,busy:!1},this.showToast({id:`reward-${Date.now()}`,text:_s(t)??"That didn't save. Try again.",tone:"bad"})}}}async _setGoal(e,t){const s=this.service?.api,i=this._member(e);if(!s||!i||!await this.asMember(e,"Whose goal is this?"))return;const a=this.service?.board()?.rewards.find(e=>e.id===t);try{await s.savePrefs(e,{goal:t}),this.showToast({id:`goal-${Date.now()}`,text:a?`${i.name} is saving up for ${a.name}.`:`${i.name} has no goal now.`})}catch(e){this.showToast({id:`goal-${Date.now()}`,text:_s(e)??"That didn't save. Try again.",tone:"bad"})}}renderView(){const e=this.service?.board();return e?0===e.chores.length?this._empty():"my_day"===this.view?this._renderMyDay(e):"week"===this.view?this._renderWeek(e):"rewards"===this.view?this._renderRewards(e):U`
      <pv-chores-board .board=${e} .household=${this.household} .session=${this.session} .data=${this.data}
        .cardConfig=${this.cardConfig}
        .hass=${this.hass} .timeFormat=${this.display?.time_format??"12h"} .mode=${this.mode} layout=${this.layout}
        .minute=${this._minute}
        @pv-hold-done=${e=>this._complete(e.detail)}
        @pv-hold-undo=${e=>this._uncheck(e.detail)}
        @pv-hint=${e=>this._hint(e.detail.row)}
        @pv-row-options=${e=>this._openOptions(e.detail.row)}
        @pv-member-open=${e=>this._openMyDay(e.detail.member)}></pv-chores-board>
    `:Y}_empty(){const e=ci(this.household,this.session);return U`
      <div class="state">
        <div class="art" aria-hidden="true">🧺</div>
        <h2>No chores yet</h2>
        <p>Add your family's chores, or import a plan you already agreed on.</p>
        ${"no"!==e?U`
          <div class="buttons">
            <button class="pv-btn pv-btn-primary" type="button" @click=${()=>this.moduleAction("add")}>Add chores</button>
            <button class="pv-btn pv-btn-secondary" type="button" @click=${()=>this._openSettings(La)}>Import a plan</button>
          </div>
        `:Y}
      </div>
    `}_member(e){return this.household?.members.find(t=>t.id===e)}async asMember(e,t){const s=di(this.household,this.session,e);return"yes"===s||!("no"===s||!this.pinGate)&&this.pinGate.ask(function(e,t){if(!e)return[];const s=e.members.find(e=>e.id===t),i=Is(e.members).filter(e=>e.id!==t);return s?.has_pin?[s,...i]:i}(this.household,e),t)}async _complete(e){const{row:t}=e,s=this.service,i=s?.board();if(!s||!i)return void e.settle(!1);const a=t.item.member;await this.asMember(a,`Who's checking off ${t.name}?`)?(this._checkOff(t,a,i,void 0,e.from),e.settle(!0)):e.settle(!1)}_checkOff(e,t,s,i,a){const n=this.service,r=this._member(i??t),o=s.chores.find(t=>t.id===e.item.chore),l=function(e,t){if(!e||e.parent)return!1;if(t?.needs_ok_always)return!0;const s=e.needs_ok_for??"none";return"all"===s||"marked"===s&&!!t?.needs_ok}(r,o);n.enqueue({op:"complete",occurrence:e.key,member:t,name:e.name,doneBy:i,shows:l?"pending":"done"}),Oa("tick"),s.settings.sound&&Na();const d=`done-${e.key}-${Date.now()}`;this._last={row:e,member:t,toast:d};const c=i&&i!==t?this._member(i)?.name:null;this.showToast({id:d,text:l?`${e.name}: waiting for OK`:c?`Done by ${c}`:"Done",actions:[{id:"undo",label:"Undo"},...i?[]:[{id:"someone",label:"Someone else did it?"}]],ms:6e3});const p=this._member(i??t);a&&p?.stars&&!l&&this.updateComplete.then(()=>{this.renderRoot.querySelector("pv-chores-board")?.flyStars(t,a,e.item.stars)})}async _uncheck(e){const{row:t}=e,s=t.item.member;this.service&&await this.asMember(s,`Who's unchecking ${t.name}?`)?(this.service.enqueue({op:"undo",occurrence:t.key,member:s,name:t.name}),e.settle(!0),this.showToast({id:`undo-${t.key}-${Date.now()}`,text:`${t.name} is open again.`})):e.settle(!1)}_hint(e){const t="no"===di(this.household,this.session,e.item.member),s=this._member(e.item.member)?.name??"its owner",i=t?`Only ${s} or a parent can check this off here.`:"done"===e.state?"Hold the check to uncheck it.":"pending"===e.state?"This is waiting for a parent's OK.":"Hold the circle to finish a chore. Let go early and nothing happens.";this.showToast({id:`hint-${Date.now()}`,text:i,ms:3500})}_itemRow(e){const t=this.service?.board();if(!t)return null;for(const s of Object.values(t.members)){const t=s.items.find(t=>t.key===e);if(t)return{key:e,item:t,name:t.name,icon:t.icon,label:null,badge:null,meta:"",state:t.status}}return null}_openOptions(e){this._sheet={kind:"options",key:e.key,history:null,busy:!1}}_optionsModel(e){const t=this.service?.board(),s=this._itemRow(e),i=s?this._member(s.item.member):void 0;return t&&s&&i?{row:s,owner:i,model:ea({item:s.item,activity:t.chores.find(e=>e.id===s.item.chore),owner:i,members:Rs(this.household?.members??[]),today:t.today,member:di(this.household,this.session,i.id),parent:ci(this.household,this.session)})}:null}async _run(e,t){try{return await e(),this._sheet=null,this.showToast({id:`ok-${Date.now()}`,text:t}),!0}catch(e){return this.showToast({id:`err-${Date.now()}`,text:_s(e)??"That didn't save. Try again.",tone:"bad",ms:6e3}),"options"===this._sheet?.kind&&(this._sheet={...this._sheet,busy:!1}),!1}}async _option(e,t){const s=this.service,i=this._optionsModel(e),a=s?.board();if(!s||!i||!a)return;const{row:n,owner:r}=i,o=n.item,l=s.api,d=a.today,c=n.name;switch(t.id){case"history":try{const t=await l.history(o.chore,o.member);"options"===this._sheet?.kind&&this._sheet.key===e&&(this._sheet={...this._sheet,history:ia(t,d,this.household?.members??[],this.display?.time_format??"12h")})}catch{"options"===this._sheet?.kind&&(this._sheet={...this._sheet,history:["History isn't available right now."]})}return;case"plan_day":{if(!t.value||!await this.asMember(r.id,`Who's planning ${c}?`))return;const s=o.due_day?` It's still due ${Yi(o.due_day,d)}.`:"";return void await this._run(()=>l.override(e,{planned_day:t.value}),`${c} shows on ${Yi(t.value,d)}.${s}`)}case"more_time":if(!t.value||!await this.asMember(r.id,"Who's asking for more time?"))return;return void await this._run(()=>l.request("more_time",e,t.value),"Asked for more time. A parent will answer.");case"skip":if(!await this.asMember(r.id,`Who's asking to skip ${c}?`))return;return void await this._run(()=>l.request("skip",e),"Asked to skip this week. A parent will answer.");case"undo":if(!await this.asMember(r.id,`Who's unchecking ${c}?`))return;return s.enqueue({op:"undo",occurrence:e,member:r.id,name:c}),this._sheet=null,void this.showToast({id:`undo-${e}-${Date.now()}`,text:`${c} is open again.`});case"done_by":{const t=Rs(this.household?.members??[]).filter(e=>e.id!==r.id);return void(this._sheet={kind:"people",heading:"Who did it?",people:t,body:`They get the credit for ${c}.`,pick:async t=>{if(!t||!await this.asMember(r.id,`Who's checking off ${c}?`))return;const i=this.service?.board();i&&("done"!==o.status&&"pending"!==o.status||s.enqueue({op:"undo",occurrence:e,member:r.id,name:c}),this._checkOff(n,r.id,i,t.id))}})}case"change_due":if(!t.value||!await this.asParent(`Who's changing ${c}?`))return;return void await this._run(()=>l.override(e,{due:t.value}),`${c} is due ${Yi(t.value,d)} now.`);case"hand_off":{const t=Rs(this.household?.members??[]).filter(e=>e.id!==r.id);return void(this._sheet={kind:"people",heading:`Who's doing ${c}?`,people:t,body:"Just this time. It comes back next time.",pick:async t=>{t&&await this.asParent(`Who's handing ${c} over?`)&&await this._run(()=>l.override(e,{assignee:t.id}),`${c} is ${t.name}'s this time.`)}})}case"excuse":if(!await this.asParent(`Who's excusing ${c}?`))return;return void await this._run(()=>l.override(e,{excused:!0}),`${c} is excused. Nothing is missed.`);case"approve":case"send_back":{const e=o.completion?.id;if(!e||!await this.asParent("approve"===t.id?"Who's approving?":"Who's sending it back?"))return;const s="approve"===t.id;return void await this._run(()=>l.review(e,s?"allow":"decline",s?null:t.value??null),s?`${c}: looks good.`:`${c} went back${t.value?`: ${t.value}`:""}.`)}case"edit":if(!await this.asParent(`Who's changing ${c}?`))return;return this._sheet=null,void this._openSettings((p={id:o.chore,name:a.chores.find(e=>e.id===o.chore)?.name??c},{page:"chores",stack:[Ia(p)]}));case"delete":if(!await this.asParent(`Who's deleting ${c}?`))return;return void(this._sheet={kind:"delete",row:n})}var p}_openSettings(e){this.dispatchEvent(new CustomEvent("pv-open-settings",{detail:e,bubbles:!0,composed:!0}))}_someoneElse(e){const t=Rs(this.household?.members??[]).filter(t=>t.id!==e.member);this._sheet={kind:"people",heading:"Who did it?",body:`They get the credit${t.some(e=>e.stars)?" and the stars":""} for ${e.row.name}.`,people:t,pick:t=>{const s=this.service?.board();t&&s&&this.service&&(this.service.enqueue({op:"undo",occurrence:e.row.key,member:e.member,name:e.row.name}),this._checkOff(e.row,e.member,s,t.id))}}}_skeleton(){const e=Math.max(1,Math.min(4,this.household?.members.length??3));return U`
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
    `}_needsALook(){const e=ci(this.household,this.session);return U`
      <div class="state" role="alert">
        <div class="art" aria-hidden="true">🧰</div>
        <h2>Chores need a look</h2>
        <p>Some chores data couldn't be read, so nothing is shown or saved until a parent decides. To get it back,
          restore a Home Assistant backup from before it went missing (Settings, System, Backups), or a PlanaVista
          file you exported. Or start over with no chores.</p>
        ${"no"!==e?U`
          <div class="buttons">
            <button class="pv-btn pv-btn-primary" type="button" @click=${()=>this._openSettings(La)}>Restore from a file</button>
            <button class="pv-btn pv-btn-secondary" type="button" @click=${this._askStartOver}>Start over</button>
          </div>
        `:Y}
      </div>
    `}async asParent(e){const t=ci(this.household,this.session);if("yes"===t)return!0;if("no_pin"===t)return this._sheet={kind:"no_pin",heading:"This needs a parent's PIN"},!1;if("no"===t||!this.pinGate||!this.household)return!1;const s=this.household.members.filter(e=>e.parent&&e.has_pin);return this.pinGate.ask(s,e)}showToast(e){this._toast=e}onToastAction(e,t){const s=this._last;s&&s.toast===e.id&&this.service&&("undo"===t?(this.service.enqueue({op:"undo",occurrence:s.row.key,member:s.member,name:s.row.name}),this._last=null):"someone"===t&&this._someoneElse(s))}renderSheet(){return Y}_renderSheet(){const e=this._sheet;if(!e)return this.renderSheet();if("day"===e.kind){const t=this._member(e.member),s=this.service?.board();return t&&s?U`
        <pv-chores-day-sheet .layout=${this.layout} .member=${t} date=${e.date} today=${s.today}
          .day=${e.day} ?failed=${e.failed} ?canExcuse=${"no"!==ci(this.household,this.session)}
          .names=${e=>this._member(e)?.name??e}
          @pv-day-excuse=${t=>{this._excuseMissed(t.detail.occurrence,t.detail.name,e.member)}}
          @pv-sheet-close=${()=>{"day"===this._sheet?.kind&&(this._sheet=null)}}></pv-chores-day-sheet>
      `:Y}if("reward"===e.kind){const t=this.service?.board();if(!t)return Y;const s=Rs(this.household?.members??[]),i=e.id?pa(t,s).find(t=>t.reward.id===e.id)??null:null;return e.id&&!i?(queueMicrotask(()=>{this._sheet===e&&(this._sheet=null)}),Y):U`
        <pv-chores-reward-sheet .layout=${this.layout} .card=${i} .people=${s} .hass=${this.hass} .colorOf=${this._colorOf}
          ?canEdit=${"no"!==ci(this.household,this.session)} ?busy=${e.busy}
          @pv-reward-goal=${e=>{this._setGoal(e.detail.member,e.detail.reward)}}
          @pv-reward-save=${t=>{this._saveReward(e.id,t.detail.draft)}}
          @pv-reward-delete=${()=>{i&&(this._sheet={kind:"delete_reward",id:i.reward.id,name:i.reward.name})}}
          @pv-sheet-close=${()=>{"reward"===this._sheet?.kind&&(this._sheet=null)}}></pv-chores-reward-sheet>
      `}if("delete_reward"===e.kind)return U`
        <pv-notice-sheet .layout=${this.layout} heading=${`Delete ${e.name}?`}
          body="It leaves the catalog. Rewards already given stay in history, and nobody loses stars."
          .actions=${[{id:"delete",label:`Delete ${e.name}`,kind:"destructive"},{id:"cancel",label:"Cancel",kind:"secondary"}]}
          @pv-sheet-action=${t=>{this._confirmDeleteReward(e.id,e.name,t.detail.id)}}></pv-notice-sheet>
      `;if("inbox"===e.kind){const t=this.service?.board();if(!t)return Y;const s=function(e,t,s,i){const a=new Map(t.map(e=>[e.id,e])),n={chores:[],requests:[],rewards:[],count:e.length};for(const t of e){const e=a.get(t.member)??null,r=e?.name??t.member;if("completion"===t.kind){const o=t.done_by&&t.done_by!==t.member?a.get(t.done_by)?.name??t.done_by:null,l=t.stars?` · ★ ${t.stars}`:"";n.chores.push({id:t.id,kind:t.kind,member:e,lead:o?`${o} finished`:`${r} finished`,what:t.name,tail:o?` for ${r}`:"",detail:`${_a(t.at,s,i)}${l}`,allow:"Looks good",decline:"Send back",blocked:!1})}else if("more_time"===t.kind||"skip"===t.kind){const i="more_time"===t.kind;n.requests.push({id:t.id,kind:t.kind,member:e,lead:i?`${r} asks for more time on`:`${r} asks to skip`,what:t.name,tail:i?"":" this week",detail:i&&t.until?`Move the due date to ${Yi(t.until,s)}`:"It would be excused, so nothing is missed.",allow:"Allow",decline:"Not this time",blocked:!1})}else{const s=t.cost??0,i=t.balance??0;n.rewards.push({id:t.id,kind:t.kind,member:e,lead:`${r} wants`,what:t.name,tail:"",detail:i>=s?`★ ${s} of ${i}`:`★ ${s}, and ${r} has ${i}: not enough stars yet`,allow:"Approve",decline:"Decline",blocked:i<s})}}return n}(t.requests,Rs(this.household?.members??[]),t.today,this.display?.time_format??"12h");return U`
        <pv-chores-inbox .layout=${this.layout} .groups=${s} .hass=${this.hass} .colorOf=${this._colorOf} .busy=${this._reviewing}
          @pv-review=${e=>{this._review(e.detail)}}
          @pv-approve-all=${()=>{this._approveAll(s.chores)}}
          @pv-sheet-close=${()=>{this._sheet===e&&(this._sheet=null)}}></pv-chores-inbox>
      `}if("quick_add"===e.kind){const t=this.service?.board();return t?U`
        <pv-chores-quick-add .layout=${this.layout} .people=${Rs(this.household?.members??[])} .hass=${this.hass}
          .colorOf=${this._colorOf} today=${t.today} .minutesPerStar=${t.settings.minutes_per_star} ?busy=${e.busy}
          @pv-quick-add=${e=>{this._quickAdd(e.detail.draft)}}
          @pv-sheet-close=${()=>{"quick_add"===this._sheet?.kind&&(this._sheet=null)}}></pv-chores-quick-add>
      `:Y}if("options"===e.kind){const t=this._optionsModel(e.key);return t?U`
        <pv-chore-options .layout=${this.layout} .model=${t.model} color=${qs(t.owner,this.mode)}
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
    `}async _confirmDelete(e,t){this._sheet=null,"delete"===t&&this.service&&await this._run(()=>this.service.api.deleteActivity(e.item.chore),`Deleted ${e.name}.`)}async _confirmDeleteReward(e,t,s){this._sheet=null,"delete"===s&&this.service&&await this.asParent(`Who's deleting ${t}?`)&&await this._run(()=>this.service.api.deleteReward(e),`Deleted ${t}.`)}async _onStartOver(e){if(this._sheet=null,"start_over"===e)try{await(this.service?.api.startOver()),this.showToast({id:`start-over-${Date.now()}`,text:"Chores started over."})}catch{this.showToast({id:`start-over-${Date.now()}`,text:"Couldn't start over. Try again.",tone:"bad"})}}}Pn.styles=[ot,pi,r`
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
    `],e([ue({attribute:!1})],Pn.prototype,"hass",void 0),e([ue({attribute:!1})],Pn.prototype,"data",void 0),e([ue({attribute:!1})],Pn.prototype,"cardConfig",void 0),e([ue({attribute:!1})],Pn.prototype,"display",void 0),e([ue({attribute:!1})],Pn.prototype,"mode",void 0),e([ue({attribute:!1})],Pn.prototype,"view",void 0),e([ue({type:String,reflect:!0})],Pn.prototype,"layout",void 0),e([ue({attribute:!1})],Pn.prototype,"household",void 0),e([ue({attribute:!1})],Pn.prototype,"session",void 0),e([ue({attribute:!1})],Pn.prototype,"services",void 0),e([ue({attribute:!1})],Pn.prototype,"revision",void 0),e([ue({attribute:!1})],Pn.prototype,"pinGate",void 0),e([ue({attribute:!1})],Pn.prototype,"openTarget",void 0),e([me()],Pn.prototype,"_sheet",void 0),e([me()],Pn.prototype,"_toast",void 0),e([me()],Pn.prototype,"_minute",void 0),e([me()],Pn.prototype,"_weekOffset",void 0),e([me()],Pn.prototype,"_week",void 0),e([me()],Pn.prototype,"_weekFailed",void 0),e([me()],Pn.prototype,"_myDayMember",void 0),e([me()],Pn.prototype,"_reviewing",void 0),ge("pv-chores-module",Pn);const Bn=["MO","TU","WE","TH","FR","SA","SU"],On={MO:"Mon",TU:"Tue",WE:"Wed",TH:"Thu",FR:"Fri",SA:"Sat",SU:"Sun"},Rn={MO:"Monday",TU:"Tuesday",WE:"Wednesday",TH:"Thursday",FR:"Friday",SA:"Saturday",SU:"Sunday"},Nn=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];function In(e){const t=new Map;for(const s of e.replace(/^RRULE:/i,"").split(";")){const[e,i]=s.split("=");if(!e||void 0===i||t.has(e.toUpperCase()))return null;t.set(e.toUpperCase(),i.toUpperCase())}const s=t.get("FREQ");if("DAILY"!==s&&"WEEKLY"!==s&&"MONTHLY"!==s)return null;const i=t.has("INTERVAL")?Number(t.get("INTERVAL")):1,a=t.get("BYDAY")?.split(",")??[];if(!Number.isInteger(i)||i<1||a.some(e=>!Bn.includes(e)))return null;if(a.length&&"WEEKLY"!==s)return null;const n=t.has("BYMONTHDAY")?Number(t.get("BYMONTHDAY")):null;if(null!==n&&("MONTHLY"!==s||!Number.isInteger(n)||n<1||n>31))return null;const r=t.has("COUNT")?Number(t.get("COUNT")):null;if(null!==r&&(!Number.isInteger(r)||r<1))return null;const o=t.get("UNTIL")?.match(/^(\d{4})(\d{2})(\d{2})(T\d{6}Z?)?$/);if(t.has("UNTIL")&&!o)return null;if(null!==r&&o)return null;const l=new Set(["FREQ","INTERVAL","BYDAY","BYMONTHDAY","COUNT","UNTIL"]);return[...t.keys()].some(e=>!l.has(e))?null:{freq:s,interval:i,byday:Bn.filter(e=>a.includes(e)),bymonthday:n,count:r,until:o?`${o[1]}-${o[2]}-${o[3]}`:null}}function Ln(e,t=!0){return 1===e.length?t?`${Rn[e[0]]}s`:Rn[e[0]]:e.map(e=>On[e]).join(", ")}function jn(e){const t=e%100;return t>=11&&t<=13?`${e}th`:`${e}${["th","st","nd","rd"][e%10]??"th"}`}function Hn(e){const[,t,s]=e.split("-").map(Number);return`${Nn[t-1]} ${s}`}const qn=["January","February","March","April","May","June","July","August","September","October","November","December"];function Un(e){const[t,s,i]=e.split("-").map(Number);return new Date(Date.UTC(t,s-1,i))}function Wn(e){return e.toISOString().slice(0,10)}function Vn(e){return(Un(e).getUTCDay()+6)%7}function Yn(e){return Bn[Vn(e)]}function Kn(e,t){const s=Un(e);return s.setUTCDate(s.getUTCDate()+t),Wn(s)}function Gn(e){const[,t,s]=e.split("-").map(Number);return`${qn[t-1]} ${s}`}function Xn(e){const t=[`FREQ=${e.freq}`];return e.interval>1&&t.push(`INTERVAL=${e.interval}`),"WEEKLY"===e.freq&&e.byday.length&&t.push(`BYDAY=${Bn.filter(t=>e.byday.includes(t)).join(",")}`),"MONTHLY"===e.freq&&e.bymonthday&&t.push(`BYMONTHDAY=${e.bymonthday}`),"count"===e.ends&&t.push(`COUNT=${e.count}`),"until"===e.ends&&t.push(`UNTIL=${e.until.replace(/-/g,"")}`),t.join(";")}function Jn(e,t){return new Date(Date.UTC(e,t+1,0)).getUTCDate()}function Qn(e,t,s,i=1e3){const a=[],n=e.until&&e.until<s?e.until:s,r=t=>!(t>n||null!==e.count&&a.length>=e.count||a.length>=i||(a.push(t),0));if("DAILY"===e.freq){for(let s=t;s<=n&&r(s);s=Kn(s,e.interval));return a}if("WEEKLY"===e.freq){const s=e.byday.length?e.byday.map(e=>Bn.indexOf(e)):[Vn(t)];s.sort((e,t)=>e-t);for(let i=Kn(t,-Vn(t));i<=n;i=Kn(i,7*e.interval))for(const e of s){const s=Kn(i,e);if(s>=t&&!r(s))return a}return a}const o=e.bymonthday??Un(t).getUTCDate(),l=Un(t);for(let s=0;;s+=e.interval){const e=l.getUTCFullYear()+Math.floor((l.getUTCMonth()+s)/12),i=(l.getUTCMonth()+s)%12;if(Wn(new Date(Date.UTC(e,i,1)))>n)return a;if(o<=Jn(e,i)){const s=Wn(new Date(Date.UTC(e,i,o)));if(s>=t&&!r(s))return a}}}function Zn(e,t){if("once"===e.schedule){const t=e.once;return(t?.estimate_minutes??15)/Math.max(1,t?.sessions??1)}if("repeats"===e.schedule)return e.repeats?.estimate_minutes??15;const s=e.minimum??{hours:0,per:"week"},i="shared"===e.split?e.shares:null,a=t??e.assignees?.[0],n=i&&a&&a in i?i[a]:s.hours,r=Math.max(1,e.times??1),o=e.days?.length??0;return 60*n/("week"===s.per&&o>0?o*r:r)}function er(e,t,s){return xa(Zn(e,s),t,e.stars)}const tr={every_day:"Every day",every_week:"Every week",schedule:"On a schedule",once:"One time",off_board:"Not on the board"},sr=["every_day","every_week","schedule","once","off_board"];function ir(e){return!(!1===e.on_board||!e.assignees?.length||e.finished_at||"plan"===e.schedule&&e.set_time)}function ar(e){return"plan"===e.schedule&&(!1===e.on_board||!!e.set_time)}function nr(e){const t=Math.max(1,Math.round(e));if(t<60)return`${t} min`;const s=Math.floor(t/60),i=t%60;return i?`${s} h ${i} min`:`${s} h`}const rr={mon:"Mon",tue:"Tue",wed:"Wed",thu:"Thu",fri:"Fri",sat:"Sat",sun:"Sun"},or={morning:"mornings",afternoon:"afternoons",evening:"evenings"};function lr(e){const t=e.join();return"mon,tue,wed,thu,fri"===t?"school days":"sat,sun"===t?"weekends":e.map(e=>rr[e]??e).join(", ")}function dr(e){return 1===e.length?or[e[0]]:e.join(" and ")}function cr(e,t){const[s,i]=e.split(":").map(Number);return"24h"===t?e:`${s%12||12}:${String(i).padStart(2,"0")} ${s<12?"AM":"PM"}`}function pr(e,t){const s=Math.round((Date.parse(`${e}T12:00:00`)-Date.parse(`${t}T12:00:00`))/864e5);return 0===s?"today":1===s?"tomorrow":s>1&&s<7?new Date(`${e}T12:00:00`).toLocaleDateString("en-US",{weekday:"long"}):Hn(e)}function hr(e,t,s="12h"){if("once"===e.schedule){const s=e.once,i=s?.on?pr(s.on,t):null,a=i?"today"===i||"tomorrow"===i?i[0].toUpperCase()+i.slice(1):`On ${i}`:s?.by?`By ${pr(s.by,t)}`:"Any time";return s&&s.sessions>1?`${a} · ${s.sessions} sessions`:a}if("repeats"===e.schedule){const t=e.repeats?In(e.repeats.rrule):null;return t?function(e,t="day"){let s;if("DAILY"===e.freq)s=1===e.interval?"Every day":`Every ${e.interval} days`;else if("WEEKLY"===e.freq){const i=e.byday;if(1===e.interval)s="period"===t||0===i.length?"Weekly · any time that week":Ln(i);else{const a=`Every ${e.interval} weeks`;s="period"===t||0===i.length?`${a} · any time that week`:`${a} · ${Ln(i,!1)}`}}else{const i=1===e.interval?"Monthly":`Every ${e.interval} months`;s="period"===t||null===e.bymonthday?`${i} · any time that month`:`${i} on the ${jn(e.bymonthday)}`}return e.until?`${s} until ${Hn(e.until)}`:e.count?`${s}, ${e.count} ${1===e.count?"time":"times"}`:s}(t,e.repeats.window):"On a schedule"}const i=e.minimum??{hours:0,per:"week"},a=e.days??[],n=e.time_of_day??[];if(e.set_time)return`${a.length?`${lr(a)} at `:"At "}${cr(e.set_time,s)} · set time`;const r=[`${nr(60*i.hours)} a ${i.per}`];"day"===i.per&&(e.times??1)>1&&r.push(`${e.times} times`),"shared"===e.split&&r.push("split"),e.label&&r.push(e.label);let o="";return a.length?o=n.length?`${lr(a)} ${dr(n)}`:lr(a):n.length?o=dr(n):"week"===i.per&&(o="any day"),o?`${r.join(", ")} · ${o}`:r.join(", ")}const ur=r`
  :host {
    display: block;
  }

  .section-label {
    margin: 22px 4px 8px;
    font-size: 0.75rem;
    font-weight: 700;
    letter-spacing: 0.06em;
    text-transform: uppercase;
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

  .tag {
    flex-shrink: 0;
    padding: 3px 9px;
    border-radius: 999px;
    font-size: 0.75rem;
    font-weight: 600;
    white-space: nowrap;
    background: color-mix(in srgb, var(--pv-accent, #6366F1) 12%, transparent);
    color: var(--pv-accent-ink, var(--pv-accent, #6366F1));
  }

  .tag--muted {
    background: color-mix(in srgb, var(--pv-text, #1A1B1E) 7%, transparent);
    color: var(--pv-text-secondary, #6B7280);
  }

  .tag--attention {
    background: color-mix(in srgb, #F59E0B 18%, transparent);
    color: var(--pv-text, #1A1B1E);
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

  .chips {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  .chip {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    min-height: 40px;
    padding: 0 14px 0 6px;
    border-radius: 999px;
    border: 1px solid var(--pv-border-subtle, #E5E7EB);
    background: var(--pv-card-bg, #FFFFFF);
    color: inherit;
    font: inherit;
    cursor: pointer;
  }

  .chip--plain {
    padding: 0 14px;
  }

  .chip[aria-pressed='true'] {
    border-color: var(--pv-accent, #6366F1);
    background: color-mix(in srgb, var(--pv-accent, #6366F1) 12%, var(--pv-card-bg, #FFFFFF));
    font-weight: 600;
  }

  .segmented {
    display: flex;
    gap: 4px;
    padding: 4px;
    border-radius: 12px;
    background: color-mix(in srgb, var(--pv-text, #1A1B1E) 6%, transparent);
  }

  .row > .segmented {
    flex: 1;
  }

  .segmented button {
    flex: 1;
    min-height: 44px;
    padding: 0 12px;
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
    width: 44px;
    height: 40px;
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

  .destructive {
    width: 100%;
    min-height: 52px;
    margin-top: 24px;
    border-radius: 14px;
    border: none;
    background: var(--pv-card-bg, #FFFFFF);
    box-shadow: inset 0 0 0 1px var(--pv-border-subtle, #E5E7EB);
    color: var(--pv-danger, #DC2626);
    font: inherit;
    font-weight: 600;
    cursor: pointer;
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
`;class mr extends de{constructor(){super(...arguments),this.household=null,this.layout="landscape",this.services={},this.revision=0,this._member=null,this._search="",this._showFinished=!1}get _chores(){return this.services?.chores}render(){const e=this._chores?.board(),t=Rs(this.household?.members??[]);if(!e)return U`<div class="skeleton"></div><div class="skeleton"></div><div class="skeleton"></div>`;const s=function(e,t,s,i){const a=(i.search??"").trim().toLocaleLowerCase(),n=e.filter(e=>(!i.member||e.assignees?.includes(i.member))&&(!a||e.name.toLocaleLowerCase().includes(a))),r=e.filter(e=>!e.finished_at),o=e=>function(e,t,s,i,a="12h"){const n=[];return ar(e)?n.push("Plan only"):e.assignees?.length||n.push("No one yet"),ar(e)||!e.needs_ok&&!e.needs_ok_always||n.push("Needs an OK"),{id:e.id,name:e.name,picture:Oi(e.icon,e.name),rhythm:hr(e,i,a),tags:n,stars:ar(e)?null:er(e,s.minutes_per_star),people:t.filter(t=>e.assignees?.includes(t.id))}}(e,t,s,i.today,i.timeFormat),l=sr.map(e=>({id:e,label:tr[e],rows:n.filter(t=>{return!t.finished_at&&(ar(s=t)?"off_board":"once"===s.schedule?"once":"repeats"===s.schedule?"schedule":"day"===s.minimum?.per?"every_day":"every_week")===e;var s}).map(o)})).filter(e=>e.rows.length>0);return{total:r.length,onBoard:r.filter(ir).length,groups:l,finished:n.filter(e=>e.finished_at).map(o)}}(e.chores,t,e.settings,{member:this._member,search:this._search,today:e.today,timeFormat:this.data?.display?.time_format}),i=t.find(e=>e.id===this._member)??null;return U`
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
              ${e.tags.map(e=>U`<span class="tag ${"Plan only"===e?"tag--muted":"No one yet"===e?"tag--attention":""}">${e}</span>`)}
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
    `}_open(e){const t=e?Ia(e):{tag:"pv-chore-editor",title:"New chore",back:"Chores",props:{choreId:null,assignees:this._member?[this._member]:[]}};this.dispatchEvent(new CustomEvent(Fs,{detail:t,bubbles:!0,composed:!0}))}_openDay(e){this.dispatchEvent(new CustomEvent(Ss,{detail:{module:"chores",view:"my_day",member:e.id},bubbles:!0,composed:!0}))}}mr.styles=[nt,ot,ct,ur,r`
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
        min-height: 44px;
      }
    `],e([ue({attribute:!1})],mr.prototype,"hass",void 0),e([ue({attribute:!1})],mr.prototype,"data",void 0),e([ue({attribute:!1})],mr.prototype,"household",void 0),e([ue({type:String,reflect:!0})],mr.prototype,"layout",void 0),e([ue({attribute:!1})],mr.prototype,"services",void 0),e([ue({type:Number})],mr.prototype,"revision",void 0),e([me()],mr.prototype,"_member",void 0),e([me()],mr.prototype,"_search",void 0),e([me()],mr.prototype,"_showFinished",void 0),ge("pv-chores-list-page",mr);class vr extends ys{constructor(e,t){super({type:"planavista/chores/subscribe"},e,t)}}class gr extends xs{complete(e,t){return this.call("planavista/chores/complete",t?{occurrence:e,done_by:t}:{occurrence:e})}undo(e){return this.call("planavista/chores/undo",{occurrence:e})}request(e,t,s){return this.call("planavista/chores/request",s?{kind:e,occurrence:t,until:s}:{kind:e,occurrence:t})}review(e,t,s){return this.call("planavista/chores/review",s?{request:e,decision:t,note:s}:{request:e,decision:t})}override(e,t){return this.call("planavista/chores/override",{occurrence:e,...t})}excuseMissed(e,t){return this.call("planavista/chores/excuse_missed",t?{occurrence:e,note:t}:{occurrence:e})}saveActivity(e,t){const s={activity:e};return t&&(s.activity_id=t.id,void 0!==t.rev&&(s.rev=t.rev)),this.call("planavista/chores/activity/save",s)}deleteActivity(e){return this.call("planavista/chores/activity/delete",{activity_id:e})}saveSettings(e){return this.call("planavista/chores/settings/save",{settings:e})}saveReward(e,t){return this.call("planavista/rewards/save",t?{reward:e,reward_id:t}:{reward:e})}deleteReward(e){return this.call("planavista/rewards/delete",{reward_id:e})}redeem(e,t){return this.call("planavista/rewards/redeem",{member:e,reward:t})}awardStars(e,t,s){return this.call("planavista/stars/award",{member:e,stars:t,reason:s})}starHistory(e){return this.call("planavista/stars/history",{member:e},!1)}week(e){return this.call("planavista/chores/week",e?{date:e}:{},!1)}day(e){return this.call("planavista/chores/day",{date:e},!1)}history(e,t){return this.call("planavista/chores/history",{chore:e,member:t},!1)}savePrefs(e,t){return this.call("planavista/household/member/prefs",{member_id:e,...t})}startOver(){return this.call("planavista/chores/start_over",{})}importPreview(e){return this.call("planavista/import/preview",{text:e})}importApply(e,t){return this.call("planavista/import/apply",{text:e,choices:t})}exportHousehold(){return this.call("planavista/export",{})}enable(e){return this.call("planavista/chores/enable",{enabled:e})}}function br(e,t=null){const s=fs(e);return"unknown"===s?{kind:"wait"}:{kind:"refused",code:s,message:t}}let yr=0;function fr(e=Date.now()){return yr=(yr+1)%1e6,`${e.toString(36)}-${yr.toString(36)}-${Math.floor(1e6*Math.random()).toString(36)}`}class _r{constructor(e,t,s){this._storage=e,this._send=t,this._listener=s,this._flushing=!1,this._again=!1,this._sending=null,this._entries=e.load()}get entries(){return this._entries}get waiting(){return this._entries.length>0}latestFor(e){for(let t=this._entries.length-1;t>=0;t--)if(this._entries[t].occurrence===e)return this._entries[t]}add(e){const t=this.latestFor(e.occurrence);if("undo"===e.op&&"complete"===t?.op&&!this._isSending(t))return this._entries=this._entries.filter(e=>e!==t),this._persist(),null;const s={...e,id:e.id??fr(),at:e.at??Date.now()};return this._entries=[...this._entries,s],this._persist(),s}async flush(){if(this._flushing)this._again=!0;else{this._flushing=!0;try{do{for(this._again=!1;this._entries.length>0;){const e=this._entries[0];let t;this._sending=e;try{t=await this._send(e)}catch(e){t=br(e)}if(this._sending=null,"wait"===t.kind)return;this._entries=this._entries.filter(t=>t!==e),this._persist(),"refused"===t.kind&&this._listener.refused(e,t.code,t.message)}}while(this._again)}finally{this._sending=null,this._flushing=!1}}}_isSending(e){return this._sending===e}_persist(){this._storage.save(this._entries),this._listener.changed()}}const wr="planavista.checkoffs";function xr(e){return e?[{id:"next",text:`Next: ${e.title} at ${e.time}${e.who?` · ${e.who}`:""}`,open:{module:"calendar"}}]:[]}function $r(e){const t=e.household?.modules;return!!e.household?.available&&!0===t?.chores?.enabled}function kr(e,t){return"period_closed"===t?`Couldn't save "${e.name}": the day had ended.`:"pin_required"===t||"parent_mode_required"===t?`Couldn't save "${e.name}". The PIN timed out, so hold it again.`:`Couldn't save "${e.name}". Try again.`}const Fr=new Set;let Er=null,Cr=0;const Sr=Math.random().toString(36).slice(2,8);let Dr=[];class Ar{constructor(e){this._host=e,this.id=`card${++Cr}-${Sr}`,this.feed=null,this.status="idle",this.notices=[],this._following=!1,this._watchers=0,this._boardFor={feed:null,entries:[],board:null},this.api=new gr({callWS:e=>this._host.hass.callWS(e)},()=>this._host.pinSession?.token??null,e=>this._host.sessionEnded(e)),this.queue=(Er||(Er=new _r(function(e=Date.now){return{load(){try{const t=globalThis.localStorage?.getItem(wr),s=t?JSON.parse(t):[];return Array.isArray(s)?s.filter(t=>!!t&&"object"==typeof t&&"string"==typeof t.occurrence&&("complete"===t.op||"undo"===t.op)&&"number"==typeof t.at&&e()-t.at<1728e5):[]}catch{return[]}},save(e){try{0===e.length?globalThis.localStorage?.removeItem(wr):globalThis.localStorage?.setItem(wr,JSON.stringify(e))}catch{}}}}(),e=>{const t=[...Fr].find(t=>t.id===e.card)??[...Fr].find(e=>e.connected);return t?t.send(e):Promise.resolve({kind:"wait"})},{changed:()=>Fr.forEach(e=>e.requestUpdate()),refused:(e,t)=>{const s=[...Fr],i=s.find(t=>t.id===e.card),a=(i?.watched?i:void 0)??s.find(e=>e.watched),n={id:e.id,text:kr(e,t),entry:e};a?a.notify(n):(Dr=[...Dr,n],s.forEach(e=>e.requestUpdate()))}})),Er),this._subscription=new vr(e=>{this.feed=e,this.requestUpdate()},e=>{this.status=e,"live"===e&&this.queue.flush(),this.requestUpdate()}),e.addController(this)}get connected(){return"live"===this.status}hostConnected(){Fr.add(this),this._follow(),this._resend=setInterval(()=>{this.queue.waiting&&this.connected&&this.queue.flush()},15e3)}hostUpdate(){this._follow()}hostDisconnected(){Fr.delete(this),clearInterval(this._resend),this._resend=void 0,this._subscription.stop(),this._following=!1,this.feed=null}requestUpdate(){this._host.serviceChanged()}_follow(){$r({household:this._host.householdView})?(this._following=!0,this._subscription.update(this._host.hass?.connection)):this._following&&(this._subscription.stop(),this._following=!1,this.feed=null)}retry(){this._subscription.retry(),this.queue.flush()}board(){const e=this.feed,t=this.queue.entries;if(this._boardFor.feed===e&&this._boardFor.entries===t)return this._boardFor.board;const s="ok"===e?.state&&e.board?function(e,t){if(0===t.length)return e;const s={...e.members},i=new Set;for(const e of t){const t=s[e.member];if(!t)continue;const a=t.items.findIndex(t=>t.key===e.occurrence);if(a<0)continue;const n=fa(t.items[a],e);if(n===t.items[a])continue;const r=[...t.items];r[a]=n,s[e.member]={...t,items:r},i.add(e.member)}if(0===i.size)return e;const a={due:0,done:0,pending:0};for(const[e,t]of Object.entries(s)){const n=i.has(e)?ba(t.items):t.today;i.has(e)&&(s[e]={...t,today:n}),a.due+=n.due,a.done+=n.done,a.pending+=n.pending}return{...e,members:s,household:a}}(e.board,t):null;return this._boardFor={feed:e,entries:t,board:s},s}enqueue(e){const t=this.queue.add({...e,card:this.id});return this.connected&&this.queue.flush(),t}async send(e){if(!this.connected)return{kind:"wait"};try{return"complete"===e.op?await this.api.complete(e.occurrence,e.doneBy):await this.api.undo(e.occurrence),{kind:"sent"}}catch(e){return br(e,_s(e))}}watch(){this._watchers+=1;let e=!1;return()=>{e||(e=!0,this._watchers-=1)}}get watched(){return this._watchers>0}notify(e){this.notices=[...this.notices,e],this.requestUpdate()}takeNotices(){const e=this.watched&&Dr.length?[...this.notices,...Dr]:this.notices;return this.watched&&(Dr=[]),this.notices.length&&(this.notices=[]),e}glance(e){if(!$r(e))return[];const t=this.board(),s=function(e){if(!e)return[];const{due:t,done:s,pending:i}=e.household;if(0===t)return[];const a=Math.min(t,s+i);return[{id:"chores",text:a>=t?`All ${t} chores done today`:`${a} of ${t} chores done today`,progress:a/t,primary:!0,open:{module:"chores",view:"board"}}]}(t);if(!t)return s;const i=this._host.planavistaData,a=new Date,n=function(e,t,s,a){const n=e.find(e=>e.start>s);if(!n)return null;const r=n.member?t.find(e=>e.id===n.member)?.name??null:null;return{title:n.title,time:wi(n.start,a),who:r??(o=n.calendar,function(e,t){return e?.calendars?.find(e=>e.entity_id===t)?.display_name??null}(i,o))};var o}(xi(i,new Date(t.day.start),new Date(t.day.end),e.config),e.household?.members??[],a,i?.display?.time_format??"12h");return[...s,...xr(n)]}barActions(e){return function(e,t,s){if(!e)return[];const i=[],a=e.requests.length;return a>0&&function(e){return"no"!==ci(e,null)}(t)&&i.push({id:"inbox",label:`${a} waiting for OK`,short:String(a),glyph:"⏳",tone:"act"}),"no"===ci(t,s)||s?.parent||i.push({id:"add",label:"Add chore",short:"",glyph:"+"}),i}(this.board(),e.household??null,this._host.pinSession)}stripActions(){return this.board()?[{id:"add",label:"Add chore",glyph:"+"}]:[]}memberProgress(e){const t=this.board()?.members[e];return t?{done:t.today.done,pending:t.today.pending,due:t.today.due}:null}}function zr(e){const t=e.notify??{};return{requests:t.requests??!0,reminders:t.reminders??!1}}function Mr(e){return Array.isArray(e.phones)?e.phones:[]}function Tr(e){const t=e.replace(/^notify\./,"").replace(/^mobile_app_/,"").replace(/_/g," ").trim();return t?t[0].toUpperCase()+t.slice(1):e}function Pr(e){const t=e.map(e=>e.name);return t.length<=2?t.join(" and "):`${t.slice(0,-1).join(", ")}, and ${t[t.length-1]}`}const Br=[{id:"make_up",label:"Make it up within the week",short:"Make it up",description:"Missed on its day? It moves to This week, and only counts as missed if the week ends first."},{id:"strict",label:"Strict days",short:"Strict days",description:"A chore not done on its day is missed."},{id:"carry_over",label:"Carry it over until done",short:"Carry it over",description:"Nothing is missed. It stays on the board, marked overdue, until it's done or excused."}];function Or(e,t){return t?Math.min(240,e<60?5*Math.floor(e/5)+5:e+15):Math.max(5,e<=60?5*Math.ceil(e/5)-5:e-15)}const Rr={id:"chores",label:"Chores",icon:"mdi:checkbox-marked-circle-outline",tag:"pv-chores-module",order:20,views:[{id:"board",label:"Board"},{id:"week",label:"Week"},{id:"my_day",label:"My day"},{id:"rewards",label:"Rewards"}],watchedEntities:()=>[],enabled:e=>$r(e),service:e=>new Ar(e)};function Nr(e){return e.services?.chores?.board()??null}function Ir(e){return e.services?.chores?.feed??null}function Lr(e,t,s){return`${e} ${1===e?t:s}`}const jr=[{id:"chores",label:"Chores",group:"chores",order:200,tag:"pv-chores-list-page",applies:({household:e})=>$r({household:e}),summary:e=>{const t=Nr(e);return t?Lr(t.chores.filter(e=>!e.finished_at).length,"chore","chores"):""},needsALook:e=>{return t=Ir(e),s=Nr(e),"needs_a_look"===t?.state?[{id:"chores-data",text:"Some chores data couldn't be read, so the board waits for a parent. Restore a PlanaVista file, or start over.",page:"import-export"}]:(s?.needs_a_look??[]).filter(e=>"unassigned"===e.kind).map(e=>({id:`unassigned:${e.chore}`,text:`No one is assigned to ${e.name}. It waits off the board until someone is.`,stack:[Ia({id:e.chore,name:e.name})]}));var t,s}},{id:"chores-off",label:"Chores",group:"chores",order:200,tag:"pv-chores-off-page",applies:({household:e})=>!!e?.available&&!$r({household:e}),summary:()=>"Off"},{id:"rewards",label:"Rewards",group:"chores",order:210,tag:"pv-rewards-page",applies:({household:e})=>$r({household:e}),summary:e=>{const t=Nr(e);return t?Lr(t.rewards.length,"reward","rewards"):""}},{id:"rules",label:"Rules",group:"chores",order:220,tag:"pv-rules-page",applies:({household:e})=>$r({household:e}),summary:e=>{const t=Nr(e);return t?(s=t.settings,Br.find(e=>e.id===s.missed)?.short??Br[0].short):"";var s}},{id:"reminders",label:"Reminders",group:"chores",order:230,tag:"pv-reminders-page",applies:({household:e})=>$r({household:e}),summary:e=>{const t=Nr(e);return t?function(e,t="12h"){return e.evening_check?cr(e.evening_check,t):"Off"}(t.settings,e.data?.display?.time_format):""},needsALook:e=>{return t=Ir(e),s=e.household?.members??[],(t?.notify_problems??[]).flatMap(e=>{const t=s.find(t=>t.id===e.member);return t&&Array.isArray(t.phones)&&t.phones.includes(e.phone)?[{id:`phone:${e.phone}`,text:`${t.name}'s phone, ${Tr(e.phone)}, isn't in Home Assistant anymore, so nothing is sent to it.`,page:"people",stack:[{tag:"pv-settings-person",title:t.name,back:"People",props:{memberId:t.id}}]}]:[]});var t,s}},{id:"import-export",label:"Import and export",group:"data",order:600,tag:"pv-import-export-page",applies:({household:e})=>!!e?.available}],Hr=[{id:"chores",label:"Chores",order:100,slot:"role",tag:"pv-person-chores",applies:({household:e})=>$r({household:e})},{id:"sleep",label:"Sleep",order:200,slot:"pin",tag:"pv-person-sleep",applies:({household:e})=>$r({household:e})},{id:"phones",label:"Phones",order:300,slot:"links",tag:"pv-person-phones",applies:({household:e})=>$r({household:e})}];function qr(e){return e.household?.setup.start??null}const Ur=[{id:"restore",label:"Restore",order:50,tag:"pv-setup-file",heading:"Restore from a PlanaVista file",lead:"Choose the file, or paste its text. You see everything in it before anything is saved.",wide:!0,applies:e=>"restore"===qr(e)},{id:"chores",label:"Chores",order:300,tag:"pv-setup-chores-choice",heading:"Do you want chores too?",lead:"Chores sit next to the calendar. Kids hold a chore's circle to finish it and earn stars.",primary:"Continue",secondary:"Not now, just the calendar",applies:e=>!!e.household?.available&&"restore"!==qr(e)},{id:"chores-common",label:"Common chores",order:310,tag:"pv-setup-common-chores",heading:"Pick some to start with",lead:"Each comes with a person, how often, and about how long. Tap a picked chore to change those.",skip:!0,wide:!0,applies:e=>"common"===qr(e)},{id:"chores-plan",label:"Household plan",order:320,tag:"pv-setup-file",heading:"Start from your household plan",lead:"Choose the plan file, or paste its text. You see where everything goes before anything is saved.",wide:!0,applies:e=>"plan"===qr(e)},{id:"shared-screen",label:"Shared screen",order:400,tag:"pv-setup-shared-screen",heading:"Is this a shared family screen?",lead:"On a shared screen, parents use a PIN for grown-up things like approving chores and changing settings.",primary:"Continue",finish:"Open the board",module:"chores",applies:({household:e})=>$r({household:e})}],Wr=["people","chores","chores-common","chores-plan","shared-screen"],Vr=[{id:"chores-board",label:"Your board",order:100,tag:"pv-setup-done-board",primary:"Open the board",module:"chores",applies:({household:e})=>$r({household:e})}],Yr=[["🧺","One board for everyone","Today's chores in a column for each person, with a ring that closes when they're done."],["⭐","Stars and rewards","If your family wants them. Kids save up for what they pick."],["📋","Start any way you like","From a few common chores, your household plan, or nothing at all."]];class Kr extends de{constructor(){super(...arguments),this.layout="landscape",this.services={},this._start=()=>{const e=(t=this.services?.chores,{steps:Wr,cancel:async()=>{await(t?.api.enable(!1))}});var t;this.dispatchEvent(new CustomEvent("pv-run-setup",{detail:e,bubbles:!0,composed:!0}))}}render(){return U`
      <p class="lead">Chores sit next to the calendar. Kids hold a chore's circle to finish it and earn stars.</p>
      <ul class="group">
        ${Yr.map(([e,t,s])=>U`
          <li><span class="icon" aria-hidden="true">${e}</span><span><span class="title">${t}</span><span class="text">${s}</span></span></li>
        `)}
      </ul>
      <button class="pv-btn pv-btn-primary start" type="button" @click=${this._start}>Set up chores</button>
      <p class="note">A few questions. The calendar stays as it is.</p>
    `}}async function Gr(e){try{if(navigator.clipboard&&window.isSecureContext)return await navigator.clipboard.writeText(e),!0}catch{}const t=document.createElement("textarea");t.value=e,t.setAttribute("readonly",""),t.style.position="fixed",t.style.opacity="0",document.body.appendChild(t),t.select();let s=!1;try{s=document.execCommand("copy")}catch{s=!1}return t.remove(),s}Kr.styles=[nt,ot,ur,r`
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
    `],e([ue({type:String})],Kr.prototype,"layout",void 0),e([ue({attribute:!1})],Kr.prototype,"services",void 0),ge("pv-chores-off-page",Kr);const Xr=[{id:"kitchen",label:"Kitchen"},{id:"cleaning",label:"Cleaning"},{id:"home",label:"Home and yard"},{id:"personal",label:"Personal"},{id:"school",label:"School"},{id:"work",label:"Work"},{id:"family",label:"Family"},{id:"other",label:"Other"}],Jr=["mon","tue","wed","thu","fri","sat","sun"];function Qr(e,t){return JSON.stringify(e)===JSON.stringify(t)}function Zr(e,t){if(!e.length)return{};const s=t/e.length>=5?5:1,i=Math.floor(t/e.length/s)*s,a={};for(const t of e)a[t]=i;return a[e[0]]+=t-i*e.length,a}function eo(e,t,s=[]){const i={name:"",icon:null,category:"other",schedule:"plan",assignees:s,on_board:!0,needs_ok:!1,needs_ok_always:!1,stars:null,label:"",minutes:15,per:"day",split:"each",shares:{},times:1,days:[],time_of_day:[],once_when:"by",date:t,by_time:null,sessions:1,estimate:30,recurrence:function(e,t){const s=e?In(e):null,i=Kn(t,56);return s?{freq:s.freq,interval:s.interval,byday:s.byday,bymonthday:s.bymonthday,ends:s.count?"count":s.until?"until":"never",count:s.count??4,until:s.until??i,start:t}:{freq:"WEEKLY",interval:1,byday:[Yn(t)],bymonthday:null,ends:"never",count:4,until:i,start:t}}(e?.repeats?.rrule??null,e?.repeats?.start??t),window:"day"};return e?(i.name=e.name,i.icon=e.icon,i.category=e.category||"other",i.schedule=e.schedule,i.assignees=[...e.assignees??[]],i.on_board=!1!==e.on_board,i.needs_ok=!!e.needs_ok,i.needs_ok_always=!!e.needs_ok_always,i.stars=e.stars??null,i.label=e.label??"",e.minimum&&(i.minutes=Math.round(60*e.minimum.hours),i.per=e.minimum.per),i.split="shared"===e.split?"shared":"each",e.shares&&(i.shares=Object.fromEntries(Object.entries(e.shares).map(([e,t])=>[e,Math.round(60*t)]))),i.times=e.times??1,i.days=[...e.days??[]],i.time_of_day=[...e.time_of_day??[]],e.once&&(i.once_when=e.once.on?"on":e.once.by?"by":"any",i.date=e.once.on??e.once.by??t,i.by_time=e.once.by_time,i.sessions=e.once.sessions,i.estimate=e.once.estimate_minutes),e.repeats&&(i.window=e.repeats.window,i.estimate=e.repeats.estimate_minutes),i):i}function to(e,t,s=[]){const i=eo(e,t,s);return{draft:i,start:i,rev:e?e.rev??1:null}}function so(e){return!Qr(e.draft,e.start)}function io(e){const t=e.draft,s="shared"===t.split&&t.assignees.length>1,i={name:t.name.trim(),icon:t.icon,category:t.category,schedule:t.schedule,assignees:t.assignees,needs_ok:t.needs_ok,stars:t.stars,label:t.label.trim()||null};return e.start.needs_ok_always&&!t.needs_ok_always&&(i.needs_ok_always=!1),"plan"===t.schedule?Object.assign(i,{on_board:t.on_board,minimum:{hours:t.minutes/60,per:t.per},split:s?"shared":"each",shares:s?Object.fromEntries(t.assignees.map(e=>[e,(t.shares[e]??0)/60])):null,times:t.times,days:Jr.filter(e=>t.days.includes(e)),time_of_day:["morning","afternoon","evening"].filter(e=>t.time_of_day.includes(e))}):"once"===t.schedule?(i.on_board=!0,i.once={on:"on"===t.once_when?t.date:null,by:"by"===t.once_when?t.date:null,by_time:"by"===t.once_when?t.by_time:null,sessions:t.sessions,estimate_minutes:t.estimate}):(i.on_board=!0,i.repeats={rrule:Xn(t.recurrence),start:t.recurrence.start,window:"DAILY"===t.recurrence.freq?"day":t.window,estimate_minutes:t.estimate}),i}function ao(e){if(e.assignees.some(t=>(e.shares[t]??0)<=0))return{ok:!1,text:"Give everyone some of the time."};const t=e.assignees.reduce((t,s)=>t+(e.shares[s]??0),0),s=e.minutes-t;return 0===s?{ok:!0,text:`✓ The shares add up to ${nr(e.minutes)}.`}:s>0?{ok:!1,text:`${nr(s)} still unassigned.`}:{ok:!1,text:`${nr(-s)} over the time.`}}function no(e){return e.length<=1?e.join(""):`${e.slice(0,-1).join(", ")} and ${e[e.length-1]}`}function ro(e){return io({draft:e,start:e})}function oo(e,t,s){const i=ro(e),a="once"===e.schedule?e.sessions>1?"Each session is":"It's":"repeats"===e.schedule?"Each time is":"Each check-off is",n=(e.assignees.length?e.assignees:[void 0]).map(s=>(s=>{const a=Zn(i,s);return`${nr(a)} and ★ ${xa(a,t.minutes_per_star,e.stars)}`})(s));if(new Set(n).size<=1)return`${a} worth about ${n[0]}.`;const r=e.assignees.map((e,t)=>`${n[t]} for ${s.find(t=>t.id===e)?.name??e}`);return`${a} worth about ${no(r)}.`}function lo(e){return"week"!==e.per||e.days.length||e.time_of_day.length?"week"===e.per&&e.days.length>1?`${nr(e.minutes)} split across ${e.days.length} days.`:"day"===e.per&&e.days.length?"Only on the days picked.":"":"No days or times picked, so any time this week works. It waits under This week on the board."}const co={make_up:"make it up within the week",strict:"strict days, so it counts as missed",carry_over:"carry it over until done"},po=[{label:"To-do list",domain:"todo",name:"Chores",suffix:"chores"},{label:"Chores left today",domain:"sensor",name:"Chores left",suffix:"chores_left"},{label:"Stars",domain:"sensor",name:"Stars",suffix:"stars"},{label:"Done for today",domain:"binary_sensor",name:"Chores done",suffix:"chores_done"},{label:"Events",domain:"event",name:"Chores",suffix:"chores"}];function ho(e,t){const s=Object.keys(e??{});return po.map(({label:i,domain:a,name:n,suffix:r})=>{const o=`${t.name} ${n}`.toLocaleLowerCase();return{label:i,entity_id:s.find(t=>t.startsWith(`${a}.`)&&String(e?.[t]?.attributes?.friendly_name??"").toLocaleLowerCase()===o)??`${a}.${t.id}_${r}`}})}const uo={MO:["M","Monday"],TU:["T","Tuesday"],WE:["W","Wednesday"],TH:["T","Thursday"],FR:["F","Friday"],SA:["S","Saturday"],SU:["S","Sunday"]},mo={DAILY:["day","days"],WEEKLY:["week","weeks"],MONTHLY:["month","months"]};class vo extends de{render(){const e=this.value;if(!e)return Y;const[t,s]=mo[e.freq];return U`
      <div class="group">
        <div class="row">
          <div class="segmented" role="group" aria-label="Repeats">
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
              ${Bn.map(t=>U`
                <button class="day" type="button" aria-label=${uo[t][1]}
                  aria-pressed=${e.byday.includes(t)?"true":"false"} @click=${()=>this._toggleDay(t)}>
                  ${uo[t][0]}
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
                <option value=${String(t)} ?selected=${(e.bymonthday??Number(e.start.slice(8,10)))===t}>${jn(t)}</option>
              `)}
            </select>
          </div>
        `:Y}
        <div class="row">
          <label class="label" for="start">Starts</label>
          <input id="start" type="date" .value=${e.start}
            @change=${e=>this._start(e.target.value)} />
        </div>
        <div class="row">
          <span class="label">Ends</span>
          <div class="segmented" role="group" aria-label="Ends">
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
            <input id="until" type="date" .value=${e.until} min=${e.start}
              @change=${t=>this._set({until:t.target.value||e.until})} />
          </div>
        `:Y}
      </div>
      <p class="summary" aria-live="polite">${function(e){const t=In(Xn(e));if(!t)return"";let s;if("DAILY"===t.freq)s=1===t.interval?"Every day":`Every ${t.interval} days`;else if("WEEKLY"===t.freq){const a=(i=(t.byday.length?t.byday:[Yn(e.start)]).map(e=>Rn[e])).length<=1?i.join(""):`${i.slice(0,-1).join(", ")} and ${i[i.length-1]}`;s=1===t.interval?`Every ${a}`:`Every ${t.interval} weeks on ${a}`}else{const i=jn(t.bymonthday??Un(e.start).getUTCDate());s=1===t.interval?`Every month on the ${i}`:`Every ${t.interval} months on the ${i}`}var i;const a=e=>`${e} ${1===e?"time":"times"}`;if(t.until){const i=Qn(t,e.start,t.until).length;return i?`${s} until ${Gn(t.until)}: ${a(i)}.`:"This never happens. Pick a later end date."}if(t.count){const i=Qn(t,e.start,Kn(e.start,10980));return i.length?`${s}, ${a(i.length)}, ending ${Gn(i[i.length-1])}.`:""}return`${s}, from ${Gn(e.start)}.`}(e)}</p>
    `}_set(e){this.value={...this.value,...e},this.dispatchEvent(new CustomEvent("pv-recurrence-change",{detail:this.value,bubbles:!0,composed:!0}))}_freq(e){const t=this.value;e!==t.freq&&this._set({freq:e,byday:"WEEKLY"===e?t.byday.length?t.byday:[Yn(t.start)]:[],bymonthday:"MONTHLY"===e?t.bymonthday??Number(t.start.slice(8,10)):null})}_toggleDay(e){const t=this.value.byday.includes(e)?this.value.byday.filter(t=>t!==e):[...this.value.byday,e];this._set({byday:Bn.filter(e=>t.includes(e))})}_start(e){e&&this._set({start:e,until:this.value.until<e?e:this.value.until})}}vo.styles=r`
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

    .segmented {
      display: flex;
      flex: 1 1 100%;
      gap: 4px;
      padding: 4px;
      border-radius: 12px;
      background: color-mix(in srgb, var(--pv-text, #1A1B1E) 6%, transparent);
    }

    .segmented button {
      flex: 1;
      min-height: 44px;
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
      width: 44px;
      height: 44px;
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
      min-height: 44px;
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
  `,e([ue({attribute:!1})],vo.prototype,"value",void 0),ge("pv-recurrence-picker",vo);const go={plan:"Part of the household plan: a set amount of time each day or each week.",once:"One time, on a day or by a date.",repeats:"On a schedule, like every Saturday or once a month."},bo={mon:["M","Monday"],tue:["T","Tuesday"],wed:["W","Wednesday"],thu:["T","Thursday"],fri:["F","Friday"],sat:["S","Saturday"],sun:["S","Sunday"]},yo=[["morning","Morning"],["afternoon","Afternoon"],["evening","Evening"]],fo=[15,30,60,120,240],_o=["🍽️","🧽","🧺","🛏️","🧸","🐠","🐱","🐕","🐾","🍴","🧹","🛁","🍂","🌿","🛒","🪴","🚗","📦","🍳","📚","🪥","🔨","🔧","💵","✨","🗑️","🧼","🪣","🛋️","🌀"];function wo(e,t){return t?e<60?e+5:e+15:e<=60?Math.max(5,e-5):e-15}class xo extends de{constructor(){super(...arguments),this.household=null,this.layout="landscape",this.pageProps={},this.drafts=new Map,this.services={},this.revision=0,this._problem="",this._saving=!1,this._notice=null,this._pictures=!1,this._otherEstimate=!1,this._copied="",this._loaded=!1}get _chores(){return this.services?.chores}get _board(){return this._chores?.board()??null}get _choreId(){return this.pageProps.choreId??null}get _activity(){return this._board?.chores.find(e=>e.id===this._choreId)??null}get _draftKey(){return`chore:${this._choreId??"new"}`}get _draft(){return this._record.draft}willUpdate(){const e=this._board;if(!this._loaded&&e&&(null===this._choreId||this._activity)){const t=this.drafts.get(this._draftKey);this._record=t??to(this._activity,e.today,this.pageProps.assignees??[]),this._loaded=!0}}confirmLeave(){return this._loaded&&so(this._record)?(this._notice="discard",new Promise(e=>{this._leave=e})):Promise.resolve(!0)}render(){const e=this._board;if(!e)return U`<div class="skeleton"></div><div class="skeleton"></div>`;if(null!==this._choreId&&!this._activity)return U`<p class="gone">This chore was deleted on another screen.</p>`;if(!this._loaded)return Y;const t=this._draft,s=Rs(this.household?.members??[]),i=null===this._choreId;return U`
      <div class="top">
        <button class="picture-button" type="button" aria-expanded=${this._pictures?"true":"false"}
          @click=${()=>{this._pictures=!this._pictures}}>
          <span class="big" aria-hidden="true">${t.icon||Bi(t.name||"chore")}</span>Change picture
        </button>
        <div class="actions">
          <button class="pv-btn pv-btn-secondary" type="button" @click=${this._cancel}>Cancel</button>
          <button class="pv-btn pv-btn-primary" type="button" ?disabled=${this._saving||!i&&!so(this._record)}
            @click=${this._save}>${i?"Add":"Save"}</button>
        </div>
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
      <div class="segmented" role="group" aria-label="Schedule" style="margin-top: 14px">
        ${["plan","once","repeats"].map(e=>U`
          <button type="button" aria-pressed=${t.schedule===e?"true":"false"}
            @click=${()=>this._change({schedule:e})}>${"plan"===e?"Plan":"once"===e?"Once":"Repeats"}</button>
        `)}
      </div>
      <p class="hint">${go[t.schedule]}</p>
      ${this._renderWho(s)}
      ${"plan"===t.schedule?this._renderPlan(e):"once"===t.schedule?this._renderOnce(e):this._renderRepeats(e)}
      ${this._renderBoard(e,s)}
      ${this._activity?this._renderAutomations(this._activity,s):Y}
      ${this._activity?U`
        <button class="destructive" type="button" @click=${()=>{this._notice="delete"}}>Delete ${this._activity.name}…</button>
      `:Y}
      ${this._renderNotice()}
    `}_renderPictures(){const e=this._draft;return U`
      <div class="group">
        <div class="pictures" role="group" aria-label="Pictures">
          <button type="button" aria-pressed=${null===e.icon?"true":"false"} aria-label="From the name"
            title="From the name" @click=${()=>this._pick(null)}>${Bi(e.name||"chore")}</button>
          ${_o.map(t=>U`
            <button type="button" aria-pressed=${e.icon===t?"true":"false"} @click=${()=>this._pick(t)}>${t}</button>
          `)}
        </div>
        <label class="row">
          <span class="row-text">Another emoji</span>
          <input class="pv-input other" type="text" maxlength="8" placeholder="🦖" aria-label="Another emoji"
            .value=${e.icon&&!_o.includes(e.icon)?e.icon:""}
            @input=${e=>{const t=e.target.value.trim();this._change({icon:t||null})}} />
        </label>
      </div>
    `}_pick(e){this._change({icon:e}),this._pictures=!1}_renderWho(e){const t=this._draft,s="plan"===t.schedule&&t.assignees.length>1;return U`
      <h2 class="section-label">Who</h2>
      <div class="group">
        <div class="people" role="group" aria-label="Who">
          ${e.map(e=>{const s=t.assignees.includes(e.id);return U`
              <button class="person" type="button" aria-pressed=${s?"true":"false"} @click=${()=>this._toggleMember(e.id)}>
                <pv-member-avatar .member=${e} .hass=${this.hass} size="44"></pv-member-avatar>
                ${s?U`<span class="check" aria-hidden="true">✓</span>`:Y}
                <span class="name">${e.name}</span>
              </button>
            `})}
        </div>
        ${s?U`
          <div class="row">
            <div class="segmented" role="group" aria-label="How the time is shared">
              <button type="button" aria-pressed=${"shared"===t.split?"true":"false"}
                @click=${()=>this._change({split:"shared",shares:Zr(t.assignees,t.minutes)})}>Split the time</button>
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
      ${s&&"shared"===t.split?U`<p class="hint ${ao(t).ok?"ok":""}">${ao(t).text}</p>`:Y}
      ${t.assignees.length?Y:U`<p class="hint">No one yet: it waits off the board until someone is picked.</p>`}
      ${"plan"!==t.schedule&&t.assignees.length>1?U`<p class="hint">With two or more people, each one gets their own check-off.</p>`:Y}
    `}_stepper(e,t,s,i=5,a=nr(e)){return U`
      <span class="stepper">
        <output>${0===e?"0 min":a}</output>
        <button type="button" aria-label="Less: ${s}" ?disabled=${e<=i} @click=${()=>t(Math.max(i,wo(e,!1)))}>−</button>
        <button type="button" aria-label="More: ${s}" @click=${()=>t(wo(e,!0))}>+</button>
      </span>
    `}_counter(e,t,s,i,a,n){return U`
      <span class="stepper">
        <output>${i}</output>
        <button type="button" aria-label="Fewer: ${s}" ?disabled=${e<=a} @click=${()=>t(e-1)}>−</button>
        <button type="button" aria-label="More: ${s}" ?disabled=${e>=n} @click=${()=>t(e+1)}>+</button>
      </span>
    `}_renderPlan(e){const t=this._draft,s=Rs(this.household?.members??[]),i="day"===t.per?"day":"week";return U`
      <h2 class="section-label">How much</h2>
      <div class="group">
        <div class="row">
          <span class="row-text">Time</span>
          ${this._stepper(t.minutes,e=>this._setMinutes(e),"time")}
        </div>
        <div class="row">
          <div class="segmented" role="group" aria-label="Each day or each week">
            <button type="button" aria-pressed=${"day"===t.per?"true":"false"} @click=${()=>this._change({per:"day"})}>Each day</button>
            <button type="button" aria-pressed=${"week"===t.per?"true":"false"} @click=${()=>this._change({per:"week"})}>Each week</button>
          </div>
        </div>
        <div class="row">
          <span class="row-text">Check off</span>
          ${this._counter(t.times,e=>this._change({times:e}),"check-offs",`${t.times} ${1===t.times?"time":"times"} a ${"week"===t.per&&t.days.length?"day picked":i}`,1,12)}
        </div>
      </div>
      <p class="hint">${oo(t,e.settings,s)}</p>
      <h2 class="section-label">When</h2>
      <div class="group">
        <div class="row">
          <div class="stack">
            <span>Days</span>
            <div class="days" role="group" aria-label="Days">
              ${Jr.map(e=>U`
                <button class="day" type="button" aria-label=${bo[e][1]} aria-pressed=${t.days.includes(e)?"true":"false"}
                  @click=${()=>this._change({days:t.days.includes(e)?t.days.filter(t=>t!==e):[...t.days,e]})}>
                  ${bo[e][0]}
                </button>
              `)}
            </div>
          </div>
        </div>
        <div class="row">
          <div class="stack">
            <span>Time of day</span>
            <div class="chips" role="group" aria-label="Time of day">
              ${yo.map(([e,s])=>U`
                <button class="chip chip--plain" type="button" aria-pressed=${t.time_of_day.includes(e)?"true":"false"}
                  @click=${()=>this._change({time_of_day:t.time_of_day.includes(e)?t.time_of_day.filter(t=>t!==e):[...t.time_of_day,e]})}>${s}</button>
              `)}
            </div>
          </div>
        </div>
      </div>
      ${lo(t)?U`<p class="hint">${lo(t)}</p>`:Y}
    `}_renderEstimate(e,t){const s=this._draft,i=Rs(this.household?.members??[]),a=this._otherEstimate||!fo.includes(s.estimate);return U`
      <h2 class="section-label">How long</h2>
      <div class="group">
        <div class="row">
          <div class="stack">
            <span>${t}</span>
            <div class="chips" role="group" aria-label=${t}>
              ${fo.map(e=>U`
                <button class="chip chip--plain" type="button" aria-pressed=${a||s.estimate!==e?"false":"true"}
                  @click=${()=>{this._otherEstimate=!1,this._change({estimate:e})}}>${nr(e)}</button>
              `)}
              <button class="chip chip--plain" type="button" aria-pressed=${a?"true":"false"}
                @click=${()=>{this._otherEstimate=!0}}>Other…</button>
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
      <p class="hint">${oo(s,e.settings,i)}</p>
    `}_renderOnce(e){const t=this._draft;return U`
      <h2 class="section-label">When</h2>
      <div class="group">
        <div class="row">
          <div class="segmented" role="group" aria-label="When">
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
            <input class="pv-input" type="date" min=${e.today} .value=${t.date}
              @change=${e=>this._change({date:e.target.value})} />
          </label>
        `:Y}
        ${"by"===t.once_when?U`
          <label class="row">
            <span class="row-text">By<span class="row-sub">Leave it empty for the end of the day.</span></span>
            <input class="pv-input" type="time" .value=${t.by_time??""}
              @change=${e=>this._change({by_time:e.target.value||null})} />
          </label>
        `:Y}
        <div class="row">
          <span class="row-text">Sessions</span>
          ${this._counter(t.sessions,e=>this._change({sessions:e}),"sessions",String(t.sessions),1,20)}
        </div>
      </div>
      <p class="hint">${function(e,t){const s=e.sessions>1?" Each session is its own check-off.":"";return"on"===e.once_when?`On the board on ${Gn(e.date)}.${s}`:"by"===e.once_when?e.date===t?`On the board today.${s}`:`On the board from today until ${pr(e.date,t)}.${s}`:`On the board until it's done.${s}`}(t,e.today)}</p>
      ${this._renderEstimate(e,"About how long, in all")}
    `}_renderRepeats(e){const t=this._draft,s=t.recurrence.freq;return U`
      <h2 class="section-label">Repeats</h2>
      <pv-recurrence-picker .value=${t.recurrence}
        @pv-recurrence-change=${e=>this._change({recurrence:e.detail})}></pv-recurrence-picker>
      ${"DAILY"!==s?U`
        <h2 class="section-label">Each time</h2>
        <div class="segmented" role="group" aria-label="Each time">
          <button type="button" aria-pressed=${"day"===t.window?"true":"false"} @click=${()=>this._change({window:"day"})}>On the day</button>
          <button type="button" aria-pressed=${"period"===t.window?"true":"false"} @click=${()=>this._change({window:"period"})}>
            ${"MONTHLY"===s?"Any time that month":"Any time that week"}
          </button>
        </div>
        <p class="hint">${"day"===t.window?(i=e.settings.missed,`Not done on the day? The house rule decides. Right now that's: ${co[i]??co.make_up}.`):"It waits under This week on the board until it's done."}</p>
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
    `}_renderBoard(e,t){const s=this._draft,i=s.needs_ok||s.needs_ok_always,a=er({...ro(s),stars:null},e.settings.minutes_per_star);return U`
      <h2 class="section-label">On the board</h2>
      <div class="group">
        ${"plan"===s.schedule?this._toggle(s.on_board,"Show on the board",()=>this._change({on_board:!s.on_board}),s.on_board?void 0:"Plan only: part of the household plan, but not checked off."):Y}
        ${this._toggle(i,"Needs a parent's OK",()=>this._change(i?{needs_ok:!1,needs_ok_always:!1}:{needs_ok:!0}),function(e,t){const s=t.filter(t=>e.assignees.includes(t.id)),i=e.needs_ok||e.needs_ok_always;if(!s.length)return i?"Check-offs wait for an OK for people whose setting is marked chores.":"";const a=t=>!t.parent&&(e.needs_ok_always||"all"===t.needs_ok_for||"marked"===t.needs_ok_for&&e.needs_ok),n=s.filter(a).map(e=>e.name);if(!i)return n.length?1===n.length?`${n[0]}'s check-offs still wait for an OK: every chore of ${n[0]}'s needs one.`:`Check-offs by ${no(n)} still wait for an OK: every chore of theirs needs one.`:"";const r=s.filter(e=>e.parent).map(e=>e.name),o=s.filter(e=>!e.parent&&!a(e)).map(e=>e.name),l=[];return 1===n.length?l.push(`${n[0]}'s check-offs wait for an OK.`):n.length&&l.push(`Check-offs by ${no(n)} wait for an OK.`),1===r.length?l.push(`${r[0]} is a parent, so ${r[0]}'s count right away.`):r.length&&l.push(`${no(r)} are parents, so theirs count right away.`),o.length&&l.push(`Check-offs by ${no(o)} count right away.`),l.join(" ")}(s,t)||void 0)}
        <div class="row">
          <span class="row-text">Stars<span class="row-sub">${null===s.stars?`★ ${a} each, from the time`:`★ ${s.stars} each`}</span></span>
          <div class="segmented" role="group" aria-label="Stars" style="flex: 0 1 260px">
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
            ${Xr.map(e=>U`<option value=${e.id} ?selected=${s.category===e.id}>${e.label}</option>`)}
          </select>
        </label>
      </div>
    `}_renderAutomations(e,t){const s=t.find(t=>e.assignees.includes(t.id)),i=(a=e.id,n=s?.id,`action: planavista.complete_chore\ndata:\n  member: ${n??"casey"}\n  chore: ${a}`);var a,n;const r=s?ho(this.hass?.states,s)[0].entity_id:null;return U`
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
      <p class="hint">${r?`Or check it off on ${r}. `:""}The ID stays the same even if the chore is renamed.</p>
    `}async _copy(e,t){await Gr(e)?(this._copied=t,window.setTimeout(()=>{this._copied===t&&(this._copied="")},2e3)):this._error("Couldn't copy. Select the text and copy it instead.")}_renderNotice(){return this._notice?"discard"===this._notice?U`
        <pv-notice-sheet .layout=${this.layout} heading="Discard changes?"
          .actions=${[{id:"keep",label:"Keep editing",kind:"secondary"},{id:"discard",label:"Discard",kind:"destructive"}]}
          @pv-sheet-action=${this._onDiscardChoice}></pv-notice-sheet>
      `:"delete"===this._notice&&this._activity?U`
        <pv-notice-sheet .layout=${this.layout} heading="Delete ${this._activity.name}?"
          body="It leaves the board at once. Past weeks still show what was done, and stars stay earned."
          .actions=${[{id:"cancel",label:"Cancel",kind:"secondary"},{id:"delete",label:"Delete",kind:"destructive"}]}
          @pv-sheet-action=${this._onDeleteChoice}></pv-notice-sheet>
      `:U`
      <pv-notice-sheet .layout=${this.layout} heading="This changed on another screen."
        .actions=${[{id:"keep",label:"Keep editing",kind:"secondary"},{id:"load",label:"Load the new version",kind:"primary"}]}
        @pv-sheet-action=${this._onChangedChoice}></pv-notice-sheet>
    `:Y}_change(e){const t={...this._draft,...e};this._record={...this._record,draft:t},this._problem="",this.drafts.set(this._draftKey,this._record)}_setMinutes(e){const t=this._draft,s="shared"===t.split&&t.assignees.length>1?Zr(t.assignees,e):t.shares;this._change({minutes:e,shares:s})}_toggleMember(e){const t=this._draft,s=Rs(this.household?.members??[]).map(e=>e.id),i=s.filter(s=>s===e?!t.assignees.includes(e):t.assignees.includes(s));this._change({assignees:i,shares:"shared"===t.split?Zr(i,t.minutes):t.shares})}_pop(){this.dispatchEvent(new CustomEvent(Es,{bubbles:!0,composed:!0}))}_error(e){this.dispatchEvent(new CustomEvent(Cs,{detail:{message:e},bubbles:!0,composed:!0}))}_cancel(){so(this._record)?this._notice="discard":this._pop()}async _save(){const e=this._board,t=this._chores;if(!e||!t)return;const s=this._activity?.once?.on??this._activity?.once?.by??null,i=function(e,t,s=null){if(!e.name.trim())return"Add a name.";if("plan"===e.schedule){if(e.minutes<=0)return"Add how long it takes.";if("shared"===e.split&&e.assignees.length>1){if(e.assignees.some(t=>(e.shares[t]??0)<=0))return"Give everyone some of the time, or pick Each does it all.";if(!ao(e).ok)return"Everyone's share has to add up to the time."}}if("once"===e.schedule&&"any"!==e.once_when){if(!e.date)return"Pick a date.";if(e.date<t&&e.date!==s)return"Pick today or a later day."}return"plan"!==e.schedule&&e.estimate<=0?"Add about how long it takes.":"repeats"!==e.schedule||function(e){const t=In(Xn(e));return!!t&&Qn(t,e.start,Kn(e.start,1830),1).length>0}(e.recurrence)?null:"This never happens. Pick another day or a later end date."}(this._draft,e.today,s);if(i)this._problem=i;else if(null===this._choreId||this._activity){this._saving=!0;try{const e=null!==this._choreId&&null!==this._record.rev?{id:this._choreId,rev:this._record.rev}:void 0;await t.api.saveActivity(io(this._record),e),this.drafts.delete(this._draftKey),this._record={...this._record,start:this._record.draft},this._pop()}catch(e){"changed"===fs(e)?this._notice="changed":this._problem=_s(e)??"Couldn't save. Check the connection and try again."}finally{this._saving=!1}}else this._problem="This chore was deleted on another screen."}_onDiscardChoice(e){e.stopPropagation(),this._notice=null;const t="discard"===e.detail.id;if(t&&(this.drafts.delete(this._draftKey),this._record={...this._record,draft:this._record.start}),this._leave){const e=this._leave;this._leave=void 0,e(t)}else t&&this._pop()}async _onDeleteChoice(e){e.stopPropagation(),this._notice=null;const t=this._activity;if("delete"===e.detail.id&&t&&this._chores)try{await this._chores.api.deleteActivity(t.id),this.drafts.delete(this._draftKey),this._record={...this._record,start:this._record.draft},this._pop()}catch(e){this._problem=_s(e)??"Couldn't delete. Check the connection and try again."}}_onChangedChoice(e){e.stopPropagation(),this._notice=null;const t=this._activity,s=this._board;t&&s&&("load"===e.detail.id?(this._record=to(t,s.today),this.drafts.delete(this._draftKey)):(this._record=function(e,t,s){const i=eo(t,s),a={...i};for(const t of Object.keys(e.draft))Qr(e.draft[t],e.start[t])||(a[t]=e.draft[t]);return{draft:a,start:i,rev:t.rev??1}}(this._record,t,s.today),this.drafts.set(this._draftKey,this._record)))}}function $o(e){return JSON.stringify(e.draft)!==JSON.stringify(e.start)}function ko(e,t){return t?Math.min(1e4,e<20?e+1:e+5):Math.max(1,e<=20?e-1:e-5)}function Fo(e,t){return e.length?t.filter(t=>e.includes(t.id)).map(e=>e.name).join(", "):"Everyone who earns stars"}xo.styles=[nt,ot,ct,ur,r`
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
        min-height: 44px;
      }

      .name-row input:focus {
        outline: none;
      }

      .people {
        display: flex;
        flex-wrap: wrap;
        gap: 14px;
        padding: 12px 14px;
      }

      .person {
        position: relative;
        display: grid;
        justify-items: center;
        gap: 4px;
        min-width: 56px;
        border: none;
        background: transparent;
        color: inherit;
        font: inherit;
        font-size: 0.8125rem;
        cursor: pointer;
      }

      .person[aria-pressed='false'] pv-member-avatar {
        opacity: 0.4;
      }

      .person[aria-pressed='true'] .name {
        font-weight: 700;
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
        width: 44px;
        height: 44px;
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
        min-height: 40px;
        margin-left: auto;
      }

      code {
        font-size: 0.875rem;
      }

      .gone {
        color: var(--pv-text-secondary, #6B7280);
      }
    `],e([ue({attribute:!1})],xo.prototype,"hass",void 0),e([ue({attribute:!1})],xo.prototype,"data",void 0),e([ue({attribute:!1})],xo.prototype,"household",void 0),e([ue({type:String,reflect:!0})],xo.prototype,"layout",void 0),e([ue({attribute:!1})],xo.prototype,"pageProps",void 0),e([ue({attribute:!1})],xo.prototype,"drafts",void 0),e([ue({attribute:!1})],xo.prototype,"services",void 0),e([ue({type:Number})],xo.prototype,"revision",void 0),e([me()],xo.prototype,"_record",void 0),e([me()],xo.prototype,"_problem",void 0),e([me()],xo.prototype,"_saving",void 0),e([me()],xo.prototype,"_notice",void 0),e([me()],xo.prototype,"_pictures",void 0),e([me()],xo.prototype,"_otherEstimate",void 0),e([me()],xo.prototype,"_copied",void 0),ge("pv-chore-editor",xo);class Eo extends de{constructor(){super(...arguments),this.household=null,this.layout="landscape",this.services={},this.revision=0}render(){const e=this.services?.chores?.board();if(!e)return U`<div class="skeleton"></div><div class="skeleton"></div>`;const t=Rs(this.household?.members??[]),s=e.rewards;return U`
      <div class="head">
        <p class="count">${s.length} ${1===s.length?"reward":"rewards"}</p>
        <button class="pv-btn pv-btn-primary new" type="button" @click=${()=>this._open(null)}>+ New reward</button>
      </div>
      ${s.length?U`
        <ul class="group">
          ${s.map(e=>U`
            <li>
              <button class="row" type="button" @click=${()=>this._open(e)}>
                <span class="picture" aria-hidden="true">${e.icon||Bi(e.name,"🎁")}</span>
                <span class="row-text">
                  <span class="row-title">${e.name}</span>
                  <span class="row-sub">${function(e,t){const s=[`★ ${e.cost}`];return e.needs_ok&&s.push("needs an OK"),s.push(Fo(e.who,t)),s.join(" · ")}(e,t)}</span>
                </span>
                <span class="chevron" aria-hidden="true">›</span>
              </button>
            </li>
          `)}
        </ul>
      `:U`<p class="empty">No rewards yet. Add a few things worth saving stars for, like a movie night pick or 30 minutes of screen time.</p>`}
      ${s.length?U`<p class="hint">Kids see these in Rewards on the board and can pin one as what they're saving up for.</p>`:Y}
    `}_open(e){this.dispatchEvent(new CustomEvent(Fs,{detail:{tag:"pv-reward-editor",title:e?e.name:"New reward",back:"Rewards",props:{rewardId:e?.id??null}},bubbles:!0,composed:!0}))}}Eo.styles=[nt,ot,ur,r`
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
    `],e([ue({attribute:!1})],Eo.prototype,"hass",void 0),e([ue({attribute:!1})],Eo.prototype,"data",void 0),e([ue({attribute:!1})],Eo.prototype,"household",void 0),e([ue({type:String})],Eo.prototype,"layout",void 0),e([ue({attribute:!1})],Eo.prototype,"services",void 0),e([ue({type:Number})],Eo.prototype,"revision",void 0),ge("pv-rewards-page",Eo);const Co=["🎬","🎮","📺","🍦","🍕","🌙","💵","🍽️","🎨","📚","⚽","🎁","🛝","🧁","🎟️","🏊"];class So extends de{constructor(){super(...arguments),this.household=null,this.layout="landscape",this.pageProps={},this.drafts=new Map,this.services={},this.revision=0,this._problem="",this._saving=!1,this._notice=null,this._loaded=!1}get _chores(){return this.services?.chores}get _rewardId(){return this.pageProps.rewardId??null}get _reward(){return this._chores?.board()?.rewards.find(e=>e.id===this._rewardId)??null}get _key(){return`reward:${this._rewardId??"new"}`}willUpdate(){this._loaded||!this._chores?.board()||null!==this._rewardId&&!this._reward||(this._record=this.drafts.get(this._key)??function(e){const t=function(e){return e?{name:e.name,icon:e.icon,cost:e.cost,needs_ok:e.needs_ok,who:[...e.who]}:{name:"",icon:null,cost:20,needs_ok:!0,who:[]}}(e);return{draft:t,start:t}}(this._reward),this._loaded=!0)}confirmLeave(){return this._loaded&&$o(this._record)?(this._notice="discard",new Promise(e=>{this._leave=e})):Promise.resolve(!0)}render(){if(null!==this._rewardId&&this._chores?.board()&&!this._reward)return U`<p class="gone">This reward was removed on another screen.</p>`;if(!this._loaded)return U`<div class="skeleton"></div>`;const e=this._record.draft,t=null===this._rewardId,s=Rs(this.household?.members??[]).filter(e=>e.stars);return U`
      <div class="top">
        <span class="big" aria-hidden="true">${e.icon||Bi(e.name||"reward","🎁")}</span>
        <div class="actions">
          <button class="pv-btn pv-btn-secondary" type="button" @click=${this._cancel}>Cancel</button>
          <button class="pv-btn pv-btn-primary" type="button" ?disabled=${this._saving||!t&&!$o(this._record)}
            @click=${this._save}>${t?"Add":"Save"}</button>
        </div>
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
          ${Co.map(t=>U`
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
            <button type="button" aria-label="Fewer stars" ?disabled=${e.cost<=1} @click=${()=>this._change({cost:ko(e.cost,!1)})}>−</button>
            <button type="button" aria-label="More stars" ?disabled=${e.cost>=1e4} @click=${()=>this._change({cost:ko(e.cost,!0)})}>+</button>
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
        <div class="people chips" role="group" aria-label="Who can get it">
          <button class="chip chip--plain" type="button" aria-pressed=${0===e.who.length?"true":"false"}
            @click=${()=>this._change({who:[]})}>Everyone</button>
          ${s.map(t=>U`
            <button class="chip" type="button" aria-pressed=${e.who.includes(t.id)?"true":"false"}
              @click=${()=>this._change({who:e.who.includes(t.id)?e.who.filter(e=>e!==t.id):[...e.who,t.id]})}>
              <pv-member-avatar .member=${t} .hass=${this.hass} size="28"></pv-member-avatar>${t.name}
            </button>
          `)}
        </div>
      </div>
      <p class="hint">${Fo(e.who,s)}. People earn stars when Stars is on for them on their page.</p>
      ${this._reward?U`<button class="destructive" type="button" @click=${()=>{this._notice="delete"}}>Delete ${this._reward.name}…</button>`:Y}
      ${this._renderNotice()}
    `}_renderNotice(){return"discard"===this._notice?U`
        <pv-notice-sheet .layout=${this.layout} heading="Discard changes?"
          .actions=${[{id:"keep",label:"Keep editing",kind:"secondary"},{id:"discard",label:"Discard",kind:"destructive"}]}
          @pv-sheet-action=${this._onDiscard}></pv-notice-sheet>
      `:"delete"===this._notice&&this._reward?U`
        <pv-notice-sheet .layout=${this.layout} heading="Delete ${this._reward.name}?"
          body="Rewards already given stay in everyone's history."
          .actions=${[{id:"cancel",label:"Cancel",kind:"secondary"},{id:"delete",label:"Delete",kind:"destructive"}]}
          @pv-sheet-action=${this._onDelete}></pv-notice-sheet>
      `:Y}_change(e){this._record={...this._record,draft:{...this._record.draft,...e}},this._problem="",this.drafts.set(this._key,this._record)}_pop(){this.dispatchEvent(new CustomEvent(Es,{bubbles:!0,composed:!0}))}_cancel(){$o(this._record)?this._notice="discard":this._pop()}async _save(){const e=(t=this._record.draft).name.trim()?!Number.isInteger(t.cost)||t.cost<1||t.cost>1e4?"A reward costs from 1 to 10,000 stars.":null:"Add a name.";var t;if(e)return void(this._problem=e);const s=this._chores;if(s){this._saving=!0;try{await s.api.saveReward(function(e){return{name:e.name.trim(),icon:e.icon,cost:e.cost,needs_ok:e.needs_ok,who:e.who}}(this._record.draft),this._rewardId??void 0),this.drafts.delete(this._key),this._record={...this._record,start:this._record.draft},this._pop()}catch(e){this._problem=_s(e)??"Couldn't save. Check the connection and try again."}finally{this._saving=!1}}}_onDiscard(e){e.stopPropagation(),this._notice=null;const t="discard"===e.detail.id;if(t&&(this.drafts.delete(this._key),this._record={...this._record,draft:this._record.start}),this._leave){const e=this._leave;this._leave=void 0,e(t)}else t&&this._pop()}async _onDelete(e){e.stopPropagation(),this._notice=null;const t=this._reward;if("delete"===e.detail.id&&t&&this._chores)try{await this._chores.api.deleteReward(t.id),this.drafts.delete(this._key),this._record={...this._record,start:this._record.draft},this._pop()}catch(e){this._problem=_s(e)??"Couldn't delete. Check the connection and try again."}}}So.styles=[nt,ot,ct,ur,r`
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
        min-height: 44px;
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
    `],e([ue({attribute:!1})],So.prototype,"hass",void 0),e([ue({attribute:!1})],So.prototype,"data",void 0),e([ue({attribute:!1})],So.prototype,"household",void 0),e([ue({type:String})],So.prototype,"layout",void 0),e([ue({attribute:!1})],So.prototype,"pageProps",void 0),e([ue({attribute:!1})],So.prototype,"drafts",void 0),e([ue({attribute:!1})],So.prototype,"services",void 0),e([ue({type:Number})],So.prototype,"revision",void 0),e([me()],So.prototype,"_record",void 0),e([me()],So.prototype,"_problem",void 0),e([me()],So.prototype,"_saving",void 0),e([me()],So.prototype,"_notice",void 0),ge("pv-reward-editor",So);class Do extends de{constructor(){super(...arguments),this.household=null,this.layout="landscape",this.services={},this.revision=0,this._pending={}}get _chores(){return this.services?.chores}render(){const e=this._chores?.board();if(!e)return U`<div class="skeleton"></div><div class="skeleton"></div>`;const t={...e.settings,...this._pending},s=this.data?.display?.time_format??"12h",i="sunday"===this.data?.display?.first_day?"Sunday":"Monday";return U`
      <h2 class="section-label">If a chore is missed</h2>
      <div class="group" role="radiogroup" aria-label="If a chore is missed">
        ${Br.map(e=>U`
          <label class="row radio">
            <input type="radio" name="missed" .checked=${t.missed===e.id}
              @change=${()=>this._save({missed:e.id})} />
            <span class="row-text">
              <span class="row-title">${e.label}</span>
              <span class="row-sub">${e.description}</span>
            </span>
          </label>
        `)}
      </div>
      <p class="hint">A change starts with the next chore day. A parent can excuse a sick day under any rule.</p>

      <h2 class="section-label">Days and weeks</h2>
      <div class="group">
        <label class="row">
          <span class="row-text">A chore day starts at</span>
          <select class="pv-input pv-select" .value=${t.day_starts}
            @change=${e=>this._save({day_starts:e.target.value})}>
            ${function(e="12h"){const t=[];for(let s=0;s<=12;s++){const i=`${String(Math.floor(s/2)).padStart(2,"0")}:${s%2?"30":"00"}`;t.push({value:i,label:cr(i,e)})}return t}(s).map(e=>U`<option value=${e.value} ?selected=${t.day_starts===e.value}>${e.label}</option>`)}
          </select>
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
              @click=${()=>this._save({minutes_per_star:Or(t.minutes_per_star,!1)})}>−</button>
            <button type="button" aria-label="More minutes per star" ?disabled=${t.minutes_per_star>=240}
              @click=${()=>this._save({minutes_per_star:Or(t.minutes_per_star,!0)})}>+</button>
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
    `}async _save(e){const t=this._chores;if(t){this._pending={...this._pending,...e};try{await t.api.saveSettings(e)}catch(e){this.dispatchEvent(new CustomEvent(Cs,{detail:{message:_s(e)??"Couldn't save. Check the connection and try again."},bubbles:!0,composed:!0}))}finally{const t={...this._pending};for(const s of Object.keys(e))delete t[s];this._pending=t}}}}Do.styles=[nt,ot,ct,ur,r`
      :host {
        max-width: 640px;
      }

      .radio {
        display: flex;
        align-items: flex-start;
        gap: 12px;
        cursor: pointer;
      }

      .radio input {
        width: 20px;
        height: 20px;
        margin-top: 2px;
        accent-color: var(--pv-accent, #6366F1);
      }

      .row .pv-select {
        max-width: 160px;
        margin-left: auto;
      }
    `],e([ue({attribute:!1})],Do.prototype,"hass",void 0),e([ue({attribute:!1})],Do.prototype,"data",void 0),e([ue({attribute:!1})],Do.prototype,"household",void 0),e([ue({type:String})],Do.prototype,"layout",void 0),e([ue({attribute:!1})],Do.prototype,"services",void 0),e([ue({type:Number})],Do.prototype,"revision",void 0),e([me()],Do.prototype,"_pending",void 0),ge("pv-rules-page",Do);class Ao extends de{constructor(){super(...arguments),this.household=null,this.layout="landscape",this.services={},this.revision=0,this._evening=void 0}get _chores(){return this.services?.chores}render(){const e=this._chores?.board();if(!e)return U`<div class="skeleton"></div><div class="skeleton"></div>`;const t=Rs(this.household?.members??[]),s=this.data?.display?.time_format??"12h",i=void 0!==this._evening?this._evening:e.settings.evening_check,a=i?cr(i,s):null,n=function(e){const t=e.filter(e=>Mr(e).length).map(e=>({member:e,phones:Mr(e),on:zr(e).reminders}));return{rows:t,noPhone:e.filter(e=>!Mr(e).length&&!!e.person)}}(t),r=function(e){const t=e.filter(e=>e.parent);return{rows:t.filter(e=>Mr(e).length).map(e=>({member:e,phones:Mr(e),on:zr(e).requests})),noPhone:t.filter(e=>!Mr(e).length)}}(t);return U`
      <h2 class="section-label">Evening check</h2>
      <div class="group">
        <div class="row toggle-row">
          <span class="row-text">Evening check on the screen</span>
          ${this._switch(!!i,"Evening check on the screen",()=>this._saveEvening(i?null:"19:00"))}
        </div>
        ${i?U`
          <label class="row">
            <span class="row-text">At</span>
            <select class="pv-input pv-select" .value=${i}
              @change=${e=>this._saveEvening(e.target.value)}>
              ${function(e,t="12h"){const s=[];for(let e=32;e<=44;e++){const i=`${String(Math.floor(e/2)).padStart(2,"0")}:${e%2?"30":"00"}`;s.push({value:i,label:cr(i,t)})}return e&&!s.some(t=>t.value===e)&&(s.push({value:e,label:cr(e,t)}),s.sort((e,t)=>e.value.localeCompare(t.value))),s}(i,s).map(e=>U`<option value=${e.value} ?selected=${e.value===i}>${e.label}</option>`)}
            </select>
          </label>
        `:Y}
      </div>
      <p class="hint">${a?`At ${a}, the board says who still has chores, like "Casey has 2 chores left", and their column pulses once.`:"Turn it on to have the board say who still has chores in the evening."}</p>

      <h2 class="section-label">Phone reminders</h2>
      ${n.rows.length?U`
        <div class="group">${n.rows.map(e=>this._phoneRow(e,a?`At ${a}, only if chores are left`:"Turn on the evening check to send reminders","reminders",!!a))}</div>
      `:Y}
      ${n.noPhone.length?U`
        <p class="hint">No phone yet for ${Pr(n.noPhone)}. Add one on their page in People.</p>
      `:Y}
      ${n.rows.length||n.noPhone.length?Y:U`
        <p class="hint">Phones are set on each person's page, for people linked to a Home Assistant person.</p>
      `}

      <h2 class="section-label">Waiting for OK requests</h2>
      ${r.rows.length?U`
        <div class="group">${r.rows.map(e=>this._phoneRow(e,"Requests come with Looks good and Send back buttons","requests",!0))}</div>
      `:Y}
      ${r.noPhone.length?U`
        <p class="hint">No phone yet for ${Pr(r.noPhone)}. Add one on their page in People.</p>
      `:Y}
      <p class="hint">Without a phone, requests wait in Waiting for OK on the screen${"day_end"===e.settings.auto_approve?", and anything still waiting is approved at the end of the day":""}.</p>
    `}_switch(e,t,s,i=!1){return U`
      <div class="pv-toggle ${e?"active":""}" role="switch" tabindex=${i?"-1":"0"}
        aria-checked=${e?"true":"false"} aria-disabled=${i?"true":"false"} aria-label=${t}
        style=${i?"opacity: 0.45; pointer-events: none":""}
        @click=${s}
        @keydown=${e=>{"Enter"!==e.key&&" "!==e.key||(e.preventDefault(),s())}}></div>
    `}_phoneRow(e,t,s,i){const a=`${e.member.name}: ${"reminders"===s?"reminders":"requests"} on ${e.phones.map(e=>Tr(e)).join(", ")}`;return U`
      <div class="row toggle-row">
        <pv-member-avatar .member=${e.member} .hass=${this.hass} size="36"></pv-member-avatar>
        <span class="row-text">
          <span class="row-title">${e.member.name} · ${e.phones.map(e=>Tr(e)).join(", ")}</span>
          <span class="row-sub">${t}</span>
        </span>
        ${this._switch(e.on&&i,a,()=>this._saveNotify(e.member,s,!e.on),!i)}
      </div>
    `}_error(e){this.dispatchEvent(new CustomEvent(Cs,{detail:{message:_s(e)??"Couldn't save. Check the connection and try again."},bubbles:!0,composed:!0}))}async _saveEvening(e){const t=this._chores;if(t){this._evening=e;try{await t.api.saveSettings({evening_check:e})}catch(e){this._error(e)}finally{this._evening=void 0}}}async _saveNotify(e,t,s){try{await this.api.saveMember({notify:{...zr(e),[t]:s}},{id:e.id})}catch(e){this._error(e)}}}function zo(e){const t=e.from===e.to?Hn(e.from):`${Hn(e.from)} to ${Hn(e.to)}`;return e.note?`${t} · ${e.note}`:t}function Mo(e){const t=Math.floor(e),s=Math.round(60*(e-t));return s?`${t} h ${s} min`:`${t} h`}Ao.styles=[nt,ot,ct,ur,r`
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
    `],e([ue({attribute:!1})],Ao.prototype,"hass",void 0),e([ue({attribute:!1})],Ao.prototype,"data",void 0),e([ue({attribute:!1})],Ao.prototype,"household",void 0),e([ue({attribute:!1})],Ao.prototype,"api",void 0),e([ue({type:String})],Ao.prototype,"layout",void 0),e([ue({attribute:!1})],Ao.prototype,"services",void 0),e([ue({type:Number})],Ao.prototype,"revision",void 0),e([me()],Ao.prototype,"_evening",void 0),ge("pv-reminders-page",Ao);const To=[["all","Every chore"],["marked","Marked chores"],["none","No chores"]],Po=[["timeline","Timeline"],["list","List"],["pictures","Pictures"]];class Bo extends de{constructor(){super(...arguments),this.household=null,this.member=null,this.services={},this.revision=0,this.layout="landscape",this._adding=null,this._addAway=()=>{const e=this._adding;if(!e)return;const t=e.note?.trim()||null,s=[...this.draft.away,{from:e.from,to:e.to,note:t}].sort((e,t)=>e.from.localeCompare(t.from));this._change({away:s}),this._adding=null},this._openStars=()=>{this.member&&this.dispatchEvent(new CustomEvent(Fs,{detail:{tag:"pv-person-stars",title:`${this.member.name}'s stars`,back:this.member.name,props:{memberId:this.member.id}},bubbles:!0,composed:!0}))}}_change(e){this.dispatchEvent(new CustomEvent(Zs,{detail:e,bubbles:!0,composed:!0}))}render(){const e=this.draft;if(!e)return Y;const t=this.services?.chores?.board(),s=this.member&&t?t.members[this.member.id]?.stars??0:null,i=(a=t?.rewards??[],n=this.member?.id??"",a.filter(e=>!e.who.length||e.who.includes(n)));var a,n;return U`
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
              <div class="segmented" role="group" aria-label="Needs an OK for">
                ${To.map(([t,s])=>U`
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
            <div class="segmented" role="group" aria-label="My day">
              ${Po.map(([t,s])=>U`
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
      <p class="hint">These start from the ${zs[e.age_group].toLocaleLowerCase()} defaults.</p>
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
          <span class="row-text">${zo(t)}</span>
          <button class="pv-btn pv-btn-secondary remove" type="button" aria-label="Remove ${zo(t)}"
            @click=${()=>this._change({away:e.away.filter((e,t)=>t!==s)})}>Remove</button>
        </div>
      `)}
      ${this._adding?U`
        <div class="row">
          <div class="stack">
            <div class="away-form">
              <label>From <input class="pv-input" type="date" .value=${this._adding.from}
                @change=${e=>{this._adding={...this._adding,from:e.target.value}}} /></label>
              <label>To <input class="pv-input" type="date" .value=${this._adding.to} min=${this._adding.from}
                @change=${e=>{this._adding={...this._adding,to:e.target.value}}} /></label>
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
    `}}Bo.styles=[nt,ot,ct,ur,r`
      :host {
        margin: 0 0 22px;
      }

      .legend {
        display: block;
        margin-bottom: 8px;
        font-weight: 600;
        font-size: 0.9375rem;
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
        min-height: 40px;
        margin-left: auto;
      }
    `],e([ue({attribute:!1})],Bo.prototype,"hass",void 0),e([ue({attribute:!1})],Bo.prototype,"household",void 0),e([ue({attribute:!1})],Bo.prototype,"member",void 0),e([ue({attribute:!1})],Bo.prototype,"draft",void 0),e([ue({attribute:!1})],Bo.prototype,"services",void 0),e([ue({type:Number})],Bo.prototype,"revision",void 0),e([ue({type:String})],Bo.prototype,"layout",void 0),e([me()],Bo.prototype,"_adding",void 0),ge("pv-person-chores",Bo);class Oo extends de{_change(e){this.dispatchEvent(new CustomEvent(Zs,{detail:e,bubbles:!0,composed:!0}))}_bedtime(e,t){const s=this.draft.bedtime;if(!t)return void this._change({bedtime:"weeknight"===e?null:s?{...s,weekend:s.weeknight}:null});const i="weeknight"===e?t:s?.weeknight??t,a="weekend"===e?t:s?.weekend??t;this._change({bedtime:{weeknight:i,weekend:a}})}render(){const e=this.draft;if(!e)return Y;const t=e.sleep_hours;return U`
      <span class="legend">Sleep</span>
      <div class="group">
        <label class="row">
          <span class="row-text">Bedtime, weeknights</span>
          <input class="pv-input" type="time" .value=${e.bedtime?.weeknight??""}
            @change=${e=>this._bedtime("weeknight",e.target.value)} />
        </label>
        <label class="row">
          <span class="row-text">Bedtime, weekends<span class="row-sub">Friday and Saturday nights</span></span>
          <input class="pv-input" type="time" .value=${e.bedtime?.weekend??""} ?disabled=${!e.bedtime}
            @change=${e=>this._bedtime("weekend",e.target.value)} />
        </label>
        <div class="row">
          <span class="row-text">Sleep</span>
          <span class="stepper">
            <output>${null===t?"Not set":Mo(t)}</output>
            <button type="button" aria-label="Less sleep" ?disabled=${null!==t&&t<=1}
              @click=${()=>this._change({sleep_hours:null===t?8:Math.max(1,t-.5)})}>−</button>
            <button type="button" aria-label="More sleep" ?disabled=${null!==t&&t>=16}
              @click=${()=>this._change({sleep_hours:null===t?8:Math.min(16,t+.5)})}>+</button>
          </span>
        </div>
      </div>
      <p class="hint">My day starts after sleep and ends at bedtime.</p>
    `}}Oo.styles=[nt,ct,ur,r`
      :host {
        margin: 0 0 22px;
      }

      .legend {
        display: block;
        margin-bottom: 8px;
        font-weight: 600;
        font-size: 0.9375rem;
      }

      .row .pv-input {
        max-width: 160px;
        margin-left: auto;
      }
    `],e([ue({attribute:!1})],Oo.prototype,"draft",void 0),ge("pv-person-sleep",Oo);class Ro extends de{constructor(){super(...arguments),this.household=null,this.member=null,this.services={},this.revision=0,this._copied=!1}_change(e){this.dispatchEvent(new CustomEvent(Zs,{detail:e,bubbles:!0,composed:!0}))}_togglePhone(e){const t=this.draft.phones.includes(e)?this.draft.phones.filter(t=>t!==e):[...this.draft.phones,e].slice(0,5);this._change({phones:t})}render(){const e=this.draft;if(!e)return Y;const t=function(e,t){const s=Object.keys(e?.services?.notify??{}).filter(e=>e.startsWith("mobile_app_")),i=t.person?e?.states?.[t.person]?.attributes?.device_trackers:void 0,a=new Set((Array.isArray(i)?i:[]).map(e=>String(e).replace(/^device_tracker\./,""))),n=Array.isArray(t.phones)?t.phones:[];return[...new Set([...s.map(e=>`notify.${e}`),...n])].map(e=>{const t=e.replace(/^notify\.mobile_app_/,"");return{service:e,label:Tr(e),suggested:a.has(t)}}).sort((e,t)=>Number(t.suggested)-Number(e.suggested)||e.label.localeCompare(t.label))}(this.hass,{person:e.person,phones:e.phones}),s=this.services?.chores?.board(),i=s?.settings.evening_check??null,a=this.data?.display?.time_format??"12h";return U`
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
          ${this._toggle(e.notify.reminders,"Evening reminders",i?`At ${cr(i,a)}, only if chores are left`:"Turn on the evening check in Reminders",()=>this._change({notify:{...e.notify,reminders:!e.notify.reminders}}))}
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
        ${ho(this.hass?.states,e).map(e=>U`
          <div class="row">
            <span class="row-text">${e.label}<code>${e.entity_id}</code></span>
          </div>
        `)}
      </div>
      <p class="hint">
        These names stay the same even if ${e.name} is renamed.
        ${s?U`<a href="/config/devices/device/${s}" target="_top">Open ${e.name} in Home Assistant ↗</a>`:Y}
      </p>
    `}async _copy(e){this._copied=await Gr(e),window.setTimeout(()=>{this._copied=!1},2e3)}}Ro.styles=[nt,ot,ct,ur,r`
      :host {
        margin: 0 0 22px;
      }

      .legend {
        display: block;
        margin: 0 0 8px;
        font-weight: 600;
        font-size: 0.9375rem;
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
        min-height: 40px;
        margin-left: auto;
      }

      a {
        color: var(--pv-accent-ink, var(--pv-accent, #6366F1));
      }
    `],e([ue({attribute:!1})],Ro.prototype,"hass",void 0),e([ue({attribute:!1})],Ro.prototype,"data",void 0),e([ue({attribute:!1})],Ro.prototype,"household",void 0),e([ue({attribute:!1})],Ro.prototype,"member",void 0),e([ue({attribute:!1})],Ro.prototype,"draft",void 0),e([ue({attribute:!1})],Ro.prototype,"services",void 0),e([ue({type:Number})],Ro.prototype,"revision",void 0),e([me()],Ro.prototype,"_copied",void 0),ge("pv-person-phones",Ro);class No extends de{constructor(){super(...arguments),this.household=null,this.layout="landscape",this.pageProps={},this.services={},this.revision=0,this._history=null,this._balance=0,this._give=!0,this._amount=5,this._reason="",this._problem="",this._saving=!1,this._award=async()=>{const e=this._reason.trim();if(!e)return void(this._problem="Add a reason.");const t=this._chores;if(t){this._saving=!0;try{const s=await t.api.awardStars(this._memberId,this._give?this._amount:-this._amount,e);this._balance=s.balance,this._reason="",await this._load()}catch(e){this._problem=_s(e)??"Couldn't save. Check the connection and try again."}finally{this._saving=!1}}}}get _memberId(){return String(this.pageProps.memberId??"")}get _chores(){return this.services?.chores}connectedCallback(){super.connectedCallback(),this._load()}async _load(){try{const e=await(this._chores?.api.starHistory(this._memberId));e&&(this._history=e.history,this._balance=e.balance)}catch(e){this._problem=_s(e)??"Couldn't load the history. Check the connection and try again.",this._history=[]}}render(){const e=this.household?.members??[],t=Object.fromEntries(e.map(e=>[e.id,e.name])),s=this._chores?.board()?.members[this._memberId]?.stars??this._balance;return U`
      <p class="balance" aria-label="${s} stars">★ ${s}</p>
      ${this._problem?U`<p class="problem" role="alert">${this._problem}</p>`:Y}
      <h2 class="section-label">Give or take</h2>
      <div class="group">
        <div class="row">
          <div class="segmented" role="group" aria-label="Give or take">
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
    `}}No.styles=[nt,ot,ct,ur,r`
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
    `],e([ue({attribute:!1})],No.prototype,"hass",void 0),e([ue({attribute:!1})],No.prototype,"data",void 0),e([ue({attribute:!1})],No.prototype,"household",void 0),e([ue({type:String})],No.prototype,"layout",void 0),e([ue({attribute:!1})],No.prototype,"pageProps",void 0),e([ue({attribute:!1})],No.prototype,"services",void 0),e([ue({type:Number})],No.prototype,"revision",void 0),e([me()],No.prototype,"_history",void 0),e([me()],No.prototype,"_balance",void 0),e([me()],No.prototype,"_give",void 0),e([me()],No.prototype,"_amount",void 0),e([me()],No.prototype,"_reason",void 0),e([me()],No.prototype,"_problem",void 0),e([me()],No.prototype,"_saving",void 0),ge("pv-person-stars",No);const Io="Pasted text";class Lo extends de{constructor(){super(...arguments),this.household=null,this.layout="landscape",this.services={},this.revision=0,this._pasting=null,this._text="",this._reading=!1,this._problem=null,this._exported=null,this._copied=!1,this._confirming=!1,this._mode="import",this._onStartOver=async e=>{if(e.stopPropagation(),this._confirming=!1,"start_over"===e.detail.id&&this._chores)try{await this._chores.api.startOver()}catch(e){const t=_s(e)??"Couldn't start over. Try again.";this.dispatchEvent(new CustomEvent(Cs,{detail:{message:t},bubbles:!0,composed:!0}))}},this._onFile=async e=>{const t=e.target.files?.[0];if(!t)return;const s=await t.text();await this._read(s,t.name,this._mode)},this._export=async()=>{const e=this._chores;if(e)try{const{file:t,name:s}=await e.api.exportHousehold(),i=JSON.stringify(t,null,2);this._exported={text:i,name:s};const a=URL.createObjectURL(new Blob([i],{type:"application/json"})),n=document.createElement("a");n.href=a,n.download=s,n.click(),window.setTimeout(()=>URL.revokeObjectURL(a),1e4)}catch(e){this._problem={name:"Export",mode:"import",problem:{code:"error",message:_s(e)??"Couldn't export. Check the connection and try again.",problems:[]}}}},this._copy=async()=>{this._exported&&(this._copied=await Gr(this._exported.text),window.setTimeout(()=>{this._copied=!1},2e3))}}get _chores(){return this.services?.chores}render(){const e="needs_a_look"===this._chores?.feed?.state;return U`
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
        <button class="pv-btn pv-btn-primary" type="button" ?disabled=${this._reading} @click=${()=>this._choose(e)}>Choose a file</button>
        <button class="pv-btn pv-btn-secondary" type="button" @click=${()=>{this._pasting=this._pasting===e?null:e,this._problem=null}}>
          Paste text</button>
      </div>
      ${this._pasting===e?U`
        <div class="paste">
          <textarea class="pv-input" aria-label="The file's text" placeholder="Paste the file's text here"
            .value=${this._text} @input=${e=>{this._text=e.target.value}}></textarea>
          <button class="pv-btn pv-btn-primary" type="button" ?disabled=${!this._text.trim()||this._reading}
            @click=${()=>this._read(this._text,Io,e)}>Review</button>
        </div>
      `:Y}
    `}_renderProblem(){const{name:e,problem:t}=this._problem;return U`
      <div class="error" role="alert">
        <h3><span class="mark" aria-hidden="true">!</span>Can't read this file</h3>
        <div>${"unknown_file"===t.code?(e===Io?"This text":`"${e}"`)+" isn't a plan PlanaVista knows. It reads Household Hours plans (version 1) and files exported from PlanaVista.":t.message}</div>
        ${t.problems.length?U`<ul>${t.problems.map(e=>U`<li>${e}</li>`)}</ul>`:Y}
        <div class="actions" style="padding: 12px 0 0">
          <button class="pv-btn pv-btn-secondary" type="button" @click=${()=>{this._pasting=this._problem.mode,this._problem=null}}>Paste text instead</button>
          <button class="pv-btn pv-btn-primary" type="button" @click=${()=>this._choose(this._problem.mode)}>Choose another file</button>
        </div>
      </div>
    `}_choose(e){this._mode=e;const t=this.renderRoot.querySelector('input[type="file"]');t&&(t.value="",t.click())}async _read(e,t,s){const i=this._chores;if(i){this._reading=!0,this._problem=null;try{const a=await i.api.importPreview(e);if(a.problem)return void(this._problem={name:t,problem:a.problem,mode:s});this._pasting=null,this._text="",this.dispatchEvent(new CustomEvent(Fs,{detail:{tag:"pv-import-review",title:"Review the import",back:"Import and export",props:{text:e,name:t,preview:a.preview}},bubbles:!0,composed:!0}))}catch(e){this._problem={name:t,mode:s,problem:{code:"error",message:_s(e)??"Couldn't read it. Check the connection and try again.",problems:[]}}}finally{this._reading=!1}}}}Lo.styles=[nt,ot,ct,ur,r`
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
    `],e([ue({attribute:!1})],Lo.prototype,"hass",void 0),e([ue({attribute:!1})],Lo.prototype,"data",void 0),e([ue({attribute:!1})],Lo.prototype,"household",void 0),e([ue({type:String})],Lo.prototype,"layout",void 0),e([ue({attribute:!1})],Lo.prototype,"services",void 0),e([ue({type:Number})],Lo.prototype,"revision",void 0),e([me()],Lo.prototype,"_pasting",void 0),e([me()],Lo.prototype,"_text",void 0),e([me()],Lo.prototype,"_reading",void 0),e([me()],Lo.prototype,"_problem",void 0),e([me()],Lo.prototype,"_exported",void 0),e([me()],Lo.prototype,"_copied",void 0),e([me()],Lo.prototype,"_confirming",void 0),ge("pv-import-export-page",Lo);const jo="planavista.household/v1";function Ho(e){return e.fills_in?"Nothing is deleted. The file fills in what couldn't be read, and stars and history that could still be read stay.":e.file.format===jo?"Nothing is deleted. The file's chores, rewards, and rules update the ones here, and stars and history stay.":"Nothing is deleted. Stars, rewards, and history stay as they are."}function qo(e){return e.length<=2?e.join(" and "):`${e.slice(0,-1).join(", ")}, and ${e[e.length-1]}`}function Uo(e){return e.file.exported?`${e.file.label} · exported ${Gn(e.file.exported)}`:e.file.label}function Wo(e,t){const s=t.people[e.ref];return s&&"match"in s?s.match??null:e.match}function Vo(e,t){return t.people[e.ref]?.age_group??e.age_group}function Yo(e,t){return"set_time"!==e.kind&&(t.on_board[e.ref]??e.on_board)}const Ko={kitchen:"🍽️",cleaning:"🧽",home:"🌿",personal:"🙂",school:"📚",work:"💼",family:"👪",other:"📋"};function Go(e){const t=[...e.people_added];e.activities_added&&t.push(`${e.activities_added} ${1===e.activities_added?"activity":"activities"}`),e.rewards_added&&t.push(`${e.rewards_added} ${1===e.rewards_added?"reward":"rewards"}`);const s=[];return t.length&&s.push(`${qo(t)} added`),e.activities_updated&&s.push(`${e.activities_updated} updated`),s.length?`Imported: ${s.join(", ")}.`:"Imported. Nothing needed changing."}function Xo(e){return Xr.map(t=>({category:t.id,label:t.label,items:e.filter(e=>(e.category||"other")===t.id)})).concat([{category:"",label:"Other",items:e.filter(e=>!Xr.some(t=>t.id===e.category))}]).filter(e=>e.items.length>0)}function Jo(e,t){const s=e.activities.filter(e=>Yo(e,t)),i=e.activities.filter(e=>"set_time"!==e.kind&&!Yo(e,t)),a=e.activities.filter(e=>"set_time"===e.kind);return{board:s,planOnly:i,setTimes:a}}function Qo(e,t){return e.people.filter(e=>!Wo(e,t)&&!Vo(e,t))}function Zo(e,t){const s=e.people.filter(e=>!Wo(e,t)).map(e=>e.name),i=e.activities.filter(e=>!e.match).length,a=e.activities.filter(e=>e.match).length,n=[...s];i&&n.push(`${i} ${1===i?"activity":"activities"}`);const r=e.rewards.filter(e=>!e.match).length;r&&n.push(`${r} ${1===r?"reward":"rewards"}`);const o=[];return n.length&&o.push(`Adds ${qo(n)}`),a&&o.push(`${o.length?"and updates":"Updates"} ${a}`),o.length?`${o.join(", ")}.`:"Nothing new to add."}class el extends de{constructor(){super(...arguments),this.members=[],this.choices={people:{},on_board:{},assignees:{}},this.layout="landscape",this.timeFormat="12h",this._open=new Set,this._assigning=null,this._showUpdates=!1}_set(e){this.choices=e,this.dispatchEvent(new CustomEvent("pv-import-choices",{detail:e,bubbles:!0,composed:!0}))}_pickPerson(e,t){const s=""===t?{match:null}:{match:t};this._set({...this.choices,people:{...this.choices.people,[e]:{...this.choices.people[e],...s}}})}_pickAge(e,t){this._set({...this.choices,people:{...this.choices.people,[e]:{...this.choices.people[e],age_group:t}}})}_switch(e){this._set({...this.choices,on_board:{...this.choices.on_board,[e.ref]:!Yo(e,this.choices)}})}_toggleOpen(e){const t=new Set(this._open);t.has(e)?t.delete(e):t.add(e),this._open=t}render(){const e=this.preview;if(!e)return Y;const t=Jo(e,this.choices),s=e.file.format===jo;return U`
      ${e.fills_in?U`<p class="warning" role="note">Chores need a look, so this restore fills in the chores files that couldn't be read. What could still be read, such as stars and history, stays.</p>`:Y}
      <div class="tiles">
        ${function(e,t){const s=Jo(e,t);return[{value:e.people.length,label:1===e.people.length?"person":"people"},{value:s.board.length,label:"on the board"},{value:s.planOnly.length,label:"plan only"},{value:s.setTimes.length,label:1===s.setTimes.length?"set time":"set times"}]}(e,this.choices).map(e=>U`<div class="tile"><strong>${e.value}</strong><span>${e.label}</span></div>`)}
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
    `}_renderPeople(){const e=this.preview,t=new Set(e.people.map(e=>Wo(e,this.choices)).filter(Boolean));return U`
      <h2 class="section-label">People · ${e.people.length}</h2>
      <div class="group">
        ${e.people.map(e=>{const s=Wo(e,this.choices),i=!s,a=Vo(e,this.choices);return U`
            <div class="row">
              <div class="stack">
                <div style="display: flex; align-items: center; gap: 12px">
                  <span class="dot" style="background:${e.color??"#8E949C"}" aria-hidden="true">${e.name[0]?.toUpperCase()}</span>
                  <span class="row-text">
                    <span class="row-title">${e.name}</span>
                    <span class="row-sub">${function(e,t,s,i="12h"){const a=Wo(e,t),n=[a?`Matches ${s.find(e=>e.id===a)?.name??e.match_name??a}`:"New person"];return!a&&e.bedtime&&n.push(`bedtime ${cr(e.bedtime.weeknight,i)}`),e.sleep_hours&&n.push(`sleeps ${Mo(e.sleep_hours)}`),n.join(" · ")}(e,this.choices,this.members,this.timeFormat)}</span>
                  </span>
                  ${i?U`<span class="tag">New</span>`:Y}
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
                    ${Ms.map(t=>U`
                      <button class="chip chip--plain" type="button" aria-pressed=${a===t.id?"true":"false"}
                        @click=${()=>this._pickAge(e.ref,t.id)}>${t.label}</button>
                    `)}
                  </div>
                `:Y}
              </div>
            </div>
          `})}
      </div>
      <p class="hint">${s=this.preview.file.format,`Matched by name; pick someone else to change it. Bedtimes and sleep come from ${s===jo?"the file":"the plan"}.`}</p>
    `;var s}_renderLook(){const e=this.preview.needs_a_look.map(e=>{if("unassigned"===e.kind)return{kind:e.kind,ref:e.ref,title:`No one is assigned to ${e.name}.`,detail:"It waits in Chores, off the board, until someone is."};if("shares"===e.kind)return{kind:e.kind,ref:e.ref,title:`The shares of ${e.name} add up to ${nr(60*e.hours)}, not ${nr(60*e.planned)}.`,detail:`It comes in with ${nr(60*e.hours)} a ${e.per}, what everyone's share adds up to.`};const t=e.names.length;return{kind:e.kind,title:`${t} ${1===t?"is":"are"} already in your chores.`,detail:`${t>3?`${e.names.slice(0,3).join(", ")}, and ${t-3} more`:qo(e.names)} get the plan's times.`}});if(!e.length)return Y;const t=this.preview.needs_a_look.find(e=>"updates"===e.kind);return U`
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
    `}_renderActivity(e,t=!0){const s=Yo(e,this.choices);return U`
      <div class="row toggle-row nested">
        <span class="picture" aria-hidden="true">${e.icon||Bi(e.name)}</span>
        <span class="row-text">
          <span class="row-title">${e.name}</span>
          <span class="row-sub">${function(e,t,s,i="12h"){const a=(s.assignees[e.ref]??e.assignees).map(e=>t.find(t=>t.ref===e)?.name??e),n=[a.length?a.join(", "):"No one yet"];return e.set_time?n.push(`at ${cr(e.set_time,i)}`):e.minimum&&n.push(`${nr(60*e.minimum.hours)} a ${e.minimum.per}`),e.match&&n.push("updates yours"),n.join(" · ")}(e,this.preview.people,this.choices,this.timeFormat)}</span>
        </span>
        ${t?U`
          <div class="pv-toggle ${s?"active":""}" role="switch" tabindex="0" aria-checked=${s?"true":"false"}
            aria-label="${e.name} on the board" @click=${()=>this._switch(e)}
            @keydown=${t=>{"Enter"!==t.key&&" "!==t.key||(t.preventDefault(),this._switch(e))}}></div>
        `:Y}
      </div>
    `}_renderGroups(e,t){return Xo(e).map(e=>{const s=`${t}:${e.category}`,i=this._open.has(s);return U`
        <button class="row" type="button" aria-expanded=${i?"true":"false"} @click=${()=>this._toggleOpen(s)}>
          <span class="picture" aria-hidden="true">${Ko[e.category]??"📋"}</span>
          <span class="row-text"><span class="row-title">${e.label}</span></span>
          <span class="row-value">${e.items.length}</span>
          <span class="chevron" aria-hidden="true">${i?"⌄":"›"}</span>
        </button>
        ${i?e.items.map(e=>this._renderActivity(e)):Y}
      `})}_renderBoard(e){return U`
      <h2 class="section-label">On the board · ${e.length}</h2>
      ${e.length?U`<div class="group">${this._renderGroups(e,"board")}</div>`:U`<p class="hint">Nothing goes on the board yet. Turn on an activity under Plan only.</p>`}
    `}_renderPlanOnly(e){if(!e.length)return Y;const t=Xo(e).map(e=>`${e.label} ${e.items.length}`).join(" · ");return U`
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
    `}}el.styles=[nt,ot,ct,ur,r`
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
        min-height: 40px;
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
    `],e([ue({attribute:!1})],el.prototype,"hass",void 0),e([ue({attribute:!1})],el.prototype,"preview",void 0),e([ue({attribute:!1})],el.prototype,"members",void 0),e([ue({attribute:!1})],el.prototype,"choices",void 0),e([ue({type:String,reflect:!0})],el.prototype,"layout",void 0),e([ue({type:String})],el.prototype,"timeFormat",void 0),e([me()],el.prototype,"_open",void 0),e([me()],el.prototype,"_assigning",void 0),e([me()],el.prototype,"_showUpdates",void 0),ge("pv-import-preview",el);class tl extends de{constructor(){super(...arguments),this.household=null,this.layout="landscape",this.pageProps={},this.services={},this.revision=0,this._choices={people:{},on_board:{},assignees:{}},this._problems=[],this._importing=!1,this._pop=()=>{this.dispatchEvent(new CustomEvent(Es,{bubbles:!0,composed:!0}))},this._import=async()=>{const e=this.services?.chores;if(e){this._importing=!0,this._problems=[];try{const t=await e.api.importApply(String(this.pageProps.text??""),this._choices);if(t.problem)return void(this._problems=t.problem.problems.length?t.problem.problems:[t.problem.message]);t.summary&&this.dispatchEvent(new CustomEvent(Cs,{detail:{message:Go(t.summary)},bubbles:!0,composed:!0})),this._pop()}catch(e){this._problems=[_s(e)??"Couldn't import. Check the connection and try again."]}finally{this._importing=!1}}}}get _preview(){return this.pageProps.preview}render(){const e=this._preview;if(!e)return Y;const t=String(this.pageProps.name??"Pasted text"),s=Qo(e,this._choices);return U`
      <div class="file">
        <span class="badge" aria-hidden="true">JSON</span>
        <span class="row-text"><span class="row-title">${t}</span><span class="row-sub">${Uo(e)}</span></span>
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
        .members=${Rs(this.household?.members??[])}
        .choices=${this._choices}
        .layout=${this.layout}
        .timeFormat=${this.data?.display?.time_format??"12h"}
        @pv-import-choices=${e=>{this._choices=e.detail}}
      ></pv-import-preview>
      <div class="bar">
        <span class="text">
          ${s.length?`Pick an age group for ${s.map(e=>e.name).join(" and ")} to import.`:Zo(e,this._choices)}
          <span class="sub">${Ho(e)}</span>
        </span>
        <button class="pv-btn pv-btn-secondary" type="button" @click=${this._pop}>Cancel</button>
        <button class="pv-btn pv-btn-primary" type="button" ?disabled=${this._importing||s.length>0}
          @click=${this._import}>Import</button>
      </div>
    `}}tl.styles=[nt,ot,ur,r`
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
    `],e([ue({attribute:!1})],tl.prototype,"hass",void 0),e([ue({attribute:!1})],tl.prototype,"data",void 0),e([ue({attribute:!1})],tl.prototype,"household",void 0),e([ue({type:String,reflect:!0})],tl.prototype,"layout",void 0),e([ue({attribute:!1})],tl.prototype,"pageProps",void 0),e([ue({attribute:!1})],tl.prototype,"services",void 0),e([ue({type:Number})],tl.prototype,"revision",void 0),e([me()],tl.prototype,"_choices",void 0),e([me()],tl.prototype,"_problems",void 0),e([me()],tl.prototype,"_importing",void 0),ge("pv-import-review",tl);const sl=[{id:"plan",icon:"📋",title:"Start from our household plan",text:"Import a Household Hours plan. You see everything before it's saved."},{id:"common",icon:"✨",title:"Start with some common chores",text:"Pick from a short list. Each comes with a time and who it suits."},{id:"empty",icon:"✏️",title:"Start empty",text:"Add chores yourself when you're ready."}];class il extends de{constructor(){super(...arguments),this.household=null,this.services={},this._choice="common",this._message="",this._read=!1}willUpdate(){if(!this._read&&this.household){const e=this.household.setup.start;"plan"!==e&&"common"!==e&&"empty"!==e||(this._choice=e),this._read=!0}}get _chores(){return this.services?.chores}get _on(){return!0===this.household?.modules?.chores?.enabled}async commit(){this._message="";try{return this._on||await(this._chores?.api.enable(!0)),await this.api.saveSetup({start:this._choice}),this.setupPatch={setup:{start:this._choice},modules:{chores:{enabled:!0}}},!0}catch(e){return this._message=_s(e)??"Couldn't turn chores on. Check the connection and try again.",!1}}async secondary(){this._message="";try{return this._on&&await(this._chores?.api.enable(!1)),await this.api.saveSetup({start:"calendar"}),this.setupPatch={setup:{start:"calendar"},modules:{chores:{enabled:!1}}},!0}catch(e){return this._message=_s(e)??"Couldn't save. Check the connection and try again.",!1}}render(){return U`
      <div class="choices" role="radiogroup" aria-label="How chores start">
        ${sl.map(e=>U`
          <button class="choice" type="button" role="radio" aria-checked=${this._choice===e.id?"true":"false"}
            @click=${()=>{this._choice=e.id}}>
            <span class="icon" aria-hidden="true">${e.icon}</span>
            <span class="text"><span class="title">${e.title}</span><span class="sub">${e.text}</span></span>
            <span class="radio" aria-hidden="true">${this._choice===e.id?"✓":""}</span>
          </button>
        `)}
      </div>
      ${this._message?U`<p class="message" role="alert">${this._message}</p>`:Y}
    `}}il.styles=r`
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
  `,e([ue({attribute:!1})],il.prototype,"household",void 0),e([ue({attribute:!1})],il.prototype,"api",void 0),e([ue({attribute:!1})],il.prototype,"services",void 0),e([me()],il.prototype,"_choice",void 0),e([me()],il.prototype,"_message",void 0),ge("pv-setup-chores-choice",il);const al=[{id:"make_your_bed",name:"Make your bed",icon:"🛏️",category:"personal",rhythm:"daily",days:[],minutes:5,band:"morning",suits:"young_child",picked:!0},{id:"set_the_table",name:"Set the table",icon:"🍴",category:"kitchen",rhythm:"daily",days:[],minutes:10,band:"evening",suits:"young_child",picked:!0},{id:"tidy_toys",name:"Tidy toys",icon:"🧸",category:"cleaning",rhythm:"daily",days:[],minutes:15,band:"evening",suits:"young_child",picked:!0},{id:"unload_the_dishwasher",name:"Unload the dishwasher",icon:"🍽️",category:"kitchen",rhythm:"daily",days:[],minutes:10,band:"morning",suits:"kid",picked:!0},{id:"take_out_the_trash",name:"Take out the trash",icon:"🗑️",category:"home",rhythm:"weekly",days:["tue","fri"],minutes:10,band:"evening",suits:"kid",picked:!0},{id:"feed_the_pet",name:"Feed the pet",icon:"🐾",category:"home",rhythm:"daily",days:[],minutes:5,band:"morning",suits:"kid",picked:!1},{id:"laundry",name:"Laundry",icon:"🧺",category:"cleaning",rhythm:"weekly",days:[],minutes:120,band:null,suits:"adult",picked:!0},{id:"kitchen_cleanup",name:"Kitchen cleanup",icon:"🧽",category:"kitchen",rhythm:"daily",days:[],minutes:30,band:"evening",suits:"adult",picked:!0},{id:"vacuum",name:"Vacuum",icon:"🧹",category:"cleaning",rhythm:"weekly",days:[],minutes:60,band:null,suits:"adult",picked:!1},{id:"clean_the_bathroom",name:"Clean the bathroom",icon:"🛁",category:"cleaning",rhythm:"weekly",days:[],minutes:60,band:null,suits:"teen",picked:!0},{id:"yard_work",name:"Yard work",icon:"🌿",category:"home",rhythm:"weekly",days:[],minutes:60,band:null,suits:"teen",picked:!1},{id:"groceries",name:"Groceries",icon:"🛒",category:"home",rhythm:"weekly",days:[],minutes:90,band:null,suits:"adult",picked:!1}];function nl(e,t){const s=e.name.toLowerCase();return t.some(e=>!e.finished_at&&e.name.trim().toLowerCase()===s)}function rl(e){return e.filter(e=>e.on&&e.member&&!e.added)}function ol(e){return al.find(t=>t.id===e)}function ll(e){const t=ol(e.id),s="weekly"===e.rhythm&&e.days.length?e.days.length:1;return{name:t.name,icon:t.icon,category:t.category,schedule:"plan",assignees:e.member?[e.member]:[],on_board:!0,needs_ok:!1,stars:null,minimum:{hours:e.minutes*s/60,per:"daily"===e.rhythm?"day":"week"},split:"each",times:1,days:"weekly"===e.rhythm?e.days:[],time_of_day:t.band?[t.band]:[]}}class dl extends de{constructor(){super(...arguments),this.household=null,this.services={},this.revision=0,this.picks=[]}render(){const e=this.services?.chores?.board()??null,t=function(e,t,s=[]){return Rs(e).map(e=>{const i=t?.members[e.id]?.items??[],a=i.filter(e=>"week"!==e.section).map(e=>e.name),n=i.filter(e=>"week"===e.section).map(e=>e.name);for(const t of s.filter(t=>t.member===e.id)){const e=t.week?n:a;e.includes(t.name)||e.push(t.name)}const r=t?.members[e.id]?.today.done??0,o=a.length?`${r} of ${a.length} today`:n.length?`${n.length} this week`:"Nothing yet";return{member:e,today:a,week:n,summary:o}})}(this.household?.members??[],e,this.picks);return t.length?U`
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
    `:Y}}dl.styles=r`
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
      font-size: 0.6875rem;
      font-weight: 700;
      letter-spacing: 0.05em;
      text-transform: uppercase;
      color: var(--pv-text-secondary, #6B7280);
    }
  `,e([ue({attribute:!1})],dl.prototype,"hass",void 0),e([ue({attribute:!1})],dl.prototype,"household",void 0),e([ue({attribute:!1})],dl.prototype,"services",void 0),e([ue({type:Number})],dl.prototype,"revision",void 0),e([ue({attribute:!1})],dl.prototype,"picks",void 0),ge("pv-setup-board-preview",dl);const cl=[5,10,15,30,60,90,120];class pl extends de{constructor(){super(...arguments),this.household=null,this.services={},this.revision=0,this.layout="landscape",this._picks=[],this._editing=null,this._message="",this._built=!1}get _chores(){return this.services?.chores}willUpdate(){const e=this._chores?.board()?.chores??[];if(!this._built&&this.household)this._picks=function(e,t=[]){const s=Rs(e),i=new Map;return al.map(e=>{const a=s.filter(t=>function(e,t){return"young_child"===t?"young_child"===e.age_group:"kid"===t?"older_child"===e.age_group||"teen"===e.age_group:"teen"===t?"teen"===e.age_group||"older_child"===e.age_group:"adult"===e.age_group}(t,e.suits)),n=i.get(e.suits)??0;i.set(e.suits,n+1);const r=a.length?a[n%a.length].id:null,o=nl(e,t);return{id:e.id,member:r,rhythm:e.rhythm,days:e.days,minutes:e.minutes,on:!o&&e.picked&&null!==r,added:o}})}(this.household.members,e),this._built=!0;else if(this._built){const t=function(e,t){return e.map(e=>!e.added&&nl(ol(e.id),t)?{...e,added:!0,on:!1}:e)}(this._picks,e);t.some((e,t)=>e!==this._picks[t])&&(this._picks=t)}}get primaryLabel(){return function(e){const t=rl(e).length;return 0===t?e.some(e=>e.added)?"Continue":"Add chores":`Add ${t} ${1===t?"chore":"chores"}`}(this._picks)}get ready(){return rl(this._picks).length>0||this._picks.some(e=>e.added)}_changed(){this.dispatchEvent(new CustomEvent(Qs,{bubbles:!0,composed:!0}))}async commit(){const e=this._chores;if(!e)return!1;this._message="";try{for(const t of rl(this._picks))await e.api.saveActivity(ll(t)),this._picks=this._picks.map(e=>e.id===t.id?{...e,added:!0,on:!1}:e);return!0}catch(e){return this._message=_s(e)??"Couldn't add the chores. Check the connection and try again.",!1}}_toggle(e){e.added||(e.member?e.on&&this._editing!==e.id?this._editing=e.id:(this._set(e.id,{on:!e.on}),this._editing=null):this._editing=e.id)}_set(e,t){this._picks=this._picks.map(s=>s.id===e?{...s,...t}:s),this._changed()}render(){const e=Rs(this.household?.members??[]),t=rl(this._picks).map(e=>({member:e.member,name:ol(e.id).name,week:"weekly"===e.rhythm&&!e.days.length}));return U`
      <div class="layout">
        <div>
          <div class="tiles">
            ${this._picks.map(t=>{const s=ol(t.id),i=e.find(e=>e.id===t.member);return U`
                <button class="tile ${t.added?"added":""}" type="button" aria-pressed=${t.on?"true":"false"}
                  ?disabled=${t.added} @click=${()=>this._toggle(t)}>
                  ${t.on?U`<span class="check" aria-hidden="true">✓</span>`:Y}
                  <span class="emoji" aria-hidden="true">${s.icon}</span>
                  <span class="name">${s.name}</span>
                  <span class="line">${t.added?"On the board":function(e){const t={mon:"Mon",tue:"Tue",wed:"Wed",thu:"Thu",fri:"Fri",sat:"Sat",sun:"Sun"};return`${"daily"===e.rhythm?"Daily":e.days.length?e.days.map(e=>t[e]).join(", "):"Weekly"} · ${nr(e.minutes)}`}(t)}</span>
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
    `}_renderEditor(e){const t=Rs(this.household?.members??[]),s=ol(e.id);return U`
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
          ${cl.map(t=>U`
            <button class="chip" type="button" aria-pressed=${e.minutes===t?"true":"false"}
              @click=${()=>this._set(e.id,{minutes:t})}>${nr(t)}</button>
          `)}
        </div>
        <div style="display: flex; gap: 8px; justify-content: flex-end">
          ${e.on?U`<button class="pv-btn pv-btn-secondary" type="button" @click=${()=>{this._set(e.id,{on:!1}),this._editing=null}}>Remove</button>`:Y}
          <button class="pv-btn pv-btn-primary" type="button" @click=${()=>{this._editing=null}}>Done</button>
        </div>
      </div>
    `}}pl.styles=[nt,ot,ct,r`
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

      .chips {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
      }

      .chip {
        min-height: 40px;
        padding: 0 12px;
        border-radius: 999px;
        border: 1px solid var(--pv-border-subtle, #E5E7EB);
        background: var(--pv-card-bg, #FFFFFF);
        color: inherit;
        font: inherit;
        cursor: pointer;
      }

      .chip[aria-pressed='true'] {
        border-color: var(--pv-accent, #6366F1);
        background: color-mix(in srgb, var(--pv-accent, #6366F1) 12%, var(--pv-card-bg, #FFFFFF));
        font-weight: 600;
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
    `],e([ue({attribute:!1})],pl.prototype,"hass",void 0),e([ue({attribute:!1})],pl.prototype,"household",void 0),e([ue({attribute:!1})],pl.prototype,"services",void 0),e([ue({type:Number})],pl.prototype,"revision",void 0),e([ue({type:String,reflect:!0})],pl.prototype,"layout",void 0),e([me()],pl.prototype,"_picks",void 0),e([me()],pl.prototype,"_editing",void 0),e([me()],pl.prototype,"_message",void 0),ge("pv-setup-common-chores",pl);class hl extends de{constructor(){super(...arguments),this.household=null,this.services={},this.revision=0,this.layout="landscape",this._text="",this._name="",this._pasting=!1,this._preview=null,this._choices={people:{},on_board:{},assignees:{}},this._problems=[],this._reading=!1,this._choose=()=>{const e=this.renderRoot.querySelector('input[type="file"]');e&&(e.value="",e.click())},this._reset=()=>{this._preview=null,this._choices={people:{},on_board:{},assignees:{}},this._problems=[],this._changed()},this._onFile=async e=>{const t=e.target.files?.[0];t&&await this._read(await t.text(),t.name)}}get _restoring(){return"restore"===this.household?.setup.start}get _chores(){return this.services?.chores}get primaryLabel(){return this._restoring?"Restore":"Import"}get ready(){return!!this._preview&&0===Qo(this._preview,this._choices).length}_changed(){this.dispatchEvent(new CustomEvent(Qs,{bubbles:!0,composed:!0}))}async commit(){const e=this._chores;if(!e||!this._preview)return!1;this._problems=[];try{const t=await e.api.importApply(this._text,this._choices);return t.problem?(this._problems=t.problem.problems.length?t.problem.problems:[t.problem.message],!1):(this.setupPatch={modules:{chores:{enabled:!0}}},!0)}catch(e){return this._problems=[_s(e)??"Couldn't import. Check the connection and try again."],!1}}render(){return U`
      <input type="file" accept=".json,application/json,text/plain" @change=${this._onFile} />
      ${this._preview?U`
        <div class="file">
          <span class="text"><strong>${this._name}</strong><span class="sub">${Uo(this._preview)}</span></span>
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
        <pv-import-preview .hass=${this.hass} .preview=${this._preview} .members=${Rs(this.household?.members??[])}
          .choices=${this._choices} .layout=${this.layout} .timeFormat=${this.data?.display?.time_format??"12h"}
          @pv-import-choices=${e=>{this._choices=e.detail,this._changed()}}></pv-import-preview>
        <p class="summary">${Zo(this._preview,this._choices)} ${Ho(this._preview)}</p>
      `:Y}
    `}async _read(e,t){const s=this._chores;if(s){this._reading=!0,this._problems=[];try{const i=await s.api.importPreview(e);if(i.problem){const e="unknown_file"===i.problem.code?("Pasted text"===t?"This text":`"${t}"`)+" isn't a plan PlanaVista knows. It reads Household Hours plans (version 1) and files exported from PlanaVista.":i.problem.message;return void(this._problems=[e,...i.problem.problems])}this._text=e,this._name=t,this._preview=i.preview??null,this._choices={people:{},on_board:{},assignees:{}},this._pasting=!1}catch(e){this._problems=[_s(e)??"Couldn't read it. Check the connection and try again."]}finally{this._reading=!1,this._changed()}}}}hl.styles=[nt,ot,ct,r`
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
    `],e([ue({attribute:!1})],hl.prototype,"hass",void 0),e([ue({attribute:!1})],hl.prototype,"data",void 0),e([ue({attribute:!1})],hl.prototype,"household",void 0),e([ue({attribute:!1})],hl.prototype,"services",void 0),e([ue({type:Number})],hl.prototype,"revision",void 0),e([ue({type:String})],hl.prototype,"layout",void 0),e([me()],hl.prototype,"_text",void 0),e([me()],hl.prototype,"_name",void 0),e([me()],hl.prototype,"_pasting",void 0),e([me()],hl.prototype,"_preview",void 0),e([me()],hl.prototype,"_choices",void 0),e([me()],hl.prototype,"_problems",void 0),e([me()],hl.prototype,"_reading",void 0),ge("pv-setup-file",hl);const ul=["1","2","3","4","5","6","7","8","9","0"];function ml(e,t=Math.random){const s=[...ul];if(!e)return s;for(let e=s.length-1;e>0;e--){const i=Math.floor(t()*(e+1));[s[e],s[i]]=[s[i],s[e]]}return s}function vl(e){return{digits:"",length:e??6}}function gl(e){return e.digits.length===e.length}function bl(e){return e.digits.length>=4}class yl extends de{constructor(){super(...arguments),this.layout="landscape",this.mode="unlock",this.members=[],this.heading="",this.shuffle=!1,this._step="pick",this._entry=vl(null),this._first="",this._message="",this._pausedUntil=0,this._now=Date.now(),this._busy=!1,this._shake=!1,this._digits=ml(!1),this._started=!1,this._sheetMotion=new Wa(this),this._detachDrag=null,this._closing=!1,this._cancel=()=>{this._leave("pv-sheet-close",{})},this._onKey=e=>{"Escape"===e.key?(e.preventDefault(),this._cancel()):/^[0-9]$/.test(e.key)&&"pick"!==this._step?(e.preventDefault(),this._press(e.key)):"Backspace"===e.key&&"pick"!==this._step?(e.preventDefault(),this._delete()):"Enter"===e.key&&"choose"===this._step?(e.preventDefault(),this._next()):qa(this.shadowRoot,e)}}connectedCallback(){super.connectedCallback(),this.addEventListener("keydown",this._onKey),this.toggleAttribute("reduced","reduced"===Ba(this))}disconnectedCallback(){super.disconnectedCallback(),this.removeEventListener("keydown",this._onKey),window.clearInterval(this._ticker),this._detachDrag?.(),this._detachDrag=null}willUpdate(e){this._started||(this._started=!0,this._digits=ml(this.shuffle),"choose"===this.mode?(this._step="choose",this._entry=vl(null)):1===this.members.length&&this._enterFor(this.members[0]))}firstUpdated(){this.renderRoot.querySelector(".person, .key")?.focus();const{panel:e,backdrop:t,zone:s}=this._parts();this._sheetMotion.open(e,t),this._detachDrag=this._sheetMotion.attachDrag(s,e,this._cancel)}_parts(){const e=this.renderRoot;return{panel:e.querySelector(".panel"),backdrop:e.querySelector(".backdrop"),zone:e.querySelector(".grab-zone")}}async _leave(e,t){if(this._closing)return;this._closing=!0;const{panel:s,backdrop:i}=this._parts();await this._sheetMotion.close(s,i),this._fire(e,t),requestAnimationFrame(()=>{if(this.isConnected){for(const e of[s,i])e.getAnimations().forEach(e=>e.cancel());s.style.transform="",this._closing=!1}})}render(){return U`
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
    `}_renderPad(){const e=this._paused(),t="enter"===this._step?`${this._who?.name??""}, enter your PIN`:"choose"===this._step?`Choose a PIN for ${this.target?.name??""}`:"Enter it again",s=e?`Too many tries. Try again in ${function(e){const t=Math.max(0,Math.ceil(e/1e3));return`${Math.floor(t/60)}:${String(t%60).padStart(2,"0")}`}(this._pausedUntil-this._now)}.`:this._message;return U`
      ${"enter"===this._step&&this.members.length>1?U`<button class="back" type="button" @click=${this._backToPicker}>‹ Someone else</button>`:Y}
      <h2 class="heading" id="pin-heading">${t}</h2>
      ${"choose"===this._step?U`<p class="hint">4 to 6 digits.</p>`:Y}
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
            ?disabled=${!bl(this._entry)||this._busy}
            @click=${this._next}>Next</button>
        `:Y}
    `}_renderKey(e,t){return U`
      <button class="key" type="button" ?disabled=${t||this._busy} @click=${()=>this._press(e)}>${e}</button>
    `}_enterFor(e){this._who=e,this._step="enter",this._message="",this._entry=vl(e.pin_length);const t=e.locked_until?Date.parse(e.locked_until):0;t>Date.now()&&this._pause(t)}_backToPicker(){this._step="pick",this._who=void 0,this._message=""}_paused(){return this._pausedUntil>this._now}_pause(e){this._pausedUntil=e,this._now=Date.now(),window.clearInterval(this._ticker),this._ticker=window.setInterval(()=>{this._now=Date.now(),this._paused()||window.clearInterval(this._ticker)},1e3)}_press(e){this._busy||this._paused()||(this._message="",this._entry=function(e,t){return!/^[0-9]$/.test(t)||e.digits.length>=e.length?e:{...e,digits:e.digits+t}}(this._entry,e),"enter"===this._step&&gl(this._entry)?this._check():("choose"===this._step&&6===this._entry.digits.length||"confirm"===this._step&&gl(this._entry))&&this._next())}_delete(){var e;this._entry=(e=this._entry,{...e,digits:e.digits.slice(0,-1)})}_next(){if("choose"===this._step){if(!bl(this._entry))return;return this._first=this._entry.digits,this._entry=vl(this._first.length),void(this._step="confirm")}"confirm"===this._step&&gl(this._entry)&&(this._entry.digits===this._first?this._save(this._first):this._restartChoosing("Those didn't match. Try again."))}_restartChoosing(e){this._message=e,this._first="",this._entry=vl(null),this._step="choose",this._shakeBoxes()}async _check(){const e=this._who;if(e){this._busy=!0;try{const t=await this.api.unlock(e.id,this._entry.digits);if(t.ok)return void this._leave("pv-unlocked",{result:t});if(this._entry=vl(e.pin_length),"paused"===t.reason)this._pause(Date.now()+1e3*(t.retry_after??30));else if("wrong_pin"===t.reason){const s=t.tries_left??0;this._message=`That's not ${e.name}'s PIN. ${1===s?"1 more try":`${s} more tries`} before a short pause.`}else this._message=`${e.name} has no PIN yet.`;this._shakeBoxes()}catch{this._entry=vl(e.pin_length),this._message="Couldn't check the PIN. Check the connection and try again."}finally{this._busy=!1}}}async _save(e){const t=this.target;if(t){this._busy=!0;try{await this.api.setPin(t.id,e),this._leave("pv-pin-set",{memberId:t.id})}catch(e){this._restartChoosing(Ds(fs(e)))}finally{this._busy=!1}}}_shakeBoxes(){this._shake=!0,window.setTimeout(()=>{this._shake=!1},320)}_fire(e,t){this.dispatchEvent(new CustomEvent(e,{detail:t,bubbles:!0,composed:!0}))}}yl.styles=[ot,Ha,r`
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
    `],e([ue({attribute:!1})],yl.prototype,"hass",void 0),e([ue({attribute:!1})],yl.prototype,"api",void 0),e([ue({type:String,reflect:!0})],yl.prototype,"layout",void 0),e([ue({type:String})],yl.prototype,"mode",void 0),e([ue({attribute:!1})],yl.prototype,"members",void 0),e([ue({type:String})],yl.prototype,"heading",void 0),e([ue({attribute:!1})],yl.prototype,"target",void 0),e([ue({type:Boolean})],yl.prototype,"shuffle",void 0),e([me()],yl.prototype,"_step",void 0),e([me()],yl.prototype,"_who",void 0),e([me()],yl.prototype,"_entry",void 0),e([me()],yl.prototype,"_first",void 0),e([me()],yl.prototype,"_message",void 0),e([me()],yl.prototype,"_pausedUntil",void 0),e([me()],yl.prototype,"_now",void 0),e([me()],yl.prototype,"_busy",void 0),e([me()],yl.prototype,"_shake",void 0),ge("pv-pin-sheet",yl);class fl extends de{constructor(){super(...arguments),this.layout="landscape",this.shuffle=!1,this.sharedScreens=!1,this._choosing=!1,this._confirmingRemove=!1,this._message="",this._busy=!1}_paused(){return(this.member.locked_until?Date.parse(this.member.locked_until):0)>Date.now()}_status(){return this._paused()?{text:"Paused after too many tries",needs:!1}:this.member.has_pin?{text:"PIN set",needs:!1}:this.member.parent&&this.sharedScreens?{text:"Needs a PIN on a shared screen",needs:!0}:{text:"No PIN",needs:!1}}render(){const e=this._status();return U`
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
    `}async _onRemoveChoice(e){e.stopPropagation(),this._confirmingRemove=!1,"remove"===e.detail.id&&await this._remove()}_closeSheet(e){e.stopPropagation(),this._choosing=!1}async _remove(){await this._run(()=>this.api.clearPin(this.member.id))}async _clearPause(){await this._run(()=>this.api.clearPause(this.member.id))}async _run(e){this._busy=!0,this._message="";try{await e()}catch(e){this._message=e?.message||Ds(fs(e))}finally{this._busy=!1}}}fl.styles=[ot,r`
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
    `],e([ue({attribute:!1})],fl.prototype,"hass",void 0),e([ue({attribute:!1})],fl.prototype,"api",void 0),e([ue({type:String})],fl.prototype,"layout",void 0),e([ue({attribute:!1})],fl.prototype,"member",void 0),e([ue({type:Boolean})],fl.prototype,"shuffle",void 0),e([ue({type:Boolean})],fl.prototype,"sharedScreens",void 0),e([me()],fl.prototype,"_choosing",void 0),e([me()],fl.prototype,"_confirmingRemove",void 0),e([me()],fl.prototype,"_message",void 0),e([me()],fl.prototype,"_busy",void 0),ge("pv-pin-actions",fl);class _l extends de{constructor(){super(...arguments),this.household=null,this.layout="landscape",this.session=null,this._shared=null,this._message=""}willUpdate(){null===this._shared&&this.household&&(this._shared="parent"!==this.household.account.kind)}async commit(){const e=this.household;if(!e)return!1;this._message="";const t=!1!==this._shared;if(t&&!e.members.some(e=>e.parent&&e.has_pin))return this._message="Set a PIN for a parent first, so someone can open Settings here.",!1;if(function(e,t,s){return t&&!e.account.shared&&!s?.parent}(e,t,this.session)){const t=e.members.filter(e=>e.parent&&e.has_pin);if(!this.pinGate||!await this.pinGate.ask(t,"Who's finishing setup?"))return!1}try{return t!==e.account.shared&&await this.api.setSharedScreen(t),!0}catch(e){return this._message=_s(e)??"Couldn't save. Check the connection and try again.",!1}}render(){const e=this.household;if(!e)return Y;const t=!1!==this._shared,s=Rs(e.members).filter(e=>e.parent);return U`
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
    `}}_l.styles=[nt,ot,r`
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
        font-size: 0.75rem;
        font-weight: 700;
        letter-spacing: 0.06em;
        text-transform: uppercase;
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
    `],e([ue({attribute:!1})],_l.prototype,"hass",void 0),e([ue({attribute:!1})],_l.prototype,"household",void 0),e([ue({attribute:!1})],_l.prototype,"api",void 0),e([ue({type:String})],_l.prototype,"layout",void 0),e([ue({attribute:!1})],_l.prototype,"pinGate",void 0),e([ue({attribute:!1})],_l.prototype,"session",void 0),e([me()],_l.prototype,"_shared",void 0),e([me()],_l.prototype,"_message",void 0),ge("pv-setup-shared-screen",_l);class wl extends de{constructor(){super(...arguments),this.household=null,this.services={},this.revision=0}render(){const e=this.household?.account,t=e?.shared||"other"===e?.kind;return U`
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
    `}}wl.styles=r`
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
  `,e([ue({attribute:!1})],wl.prototype,"hass",void 0),e([ue({attribute:!1})],wl.prototype,"household",void 0),e([ue({attribute:!1})],wl.prototype,"services",void 0),e([ue({type:Number})],wl.prototype,"revision",void 0),ge("pv-setup-done-board",wl),function(e=Gs){e.register(Rr)}(),function(e=ei,t=ti,s=ii,i=si){for(const t of jr)e.register(t);for(const e of Hr)t.register(e);for(const e of Ur)s.register(e);for(const e of Vr)i.register(e)}();const xl=Symbol.for(""),$l=e=>{if(e?.r===xl)return e?._$litStatic$},kl=e=>({_$litStatic$:e,r:xl}),Fl=new Map,El=(e=>(t,...s)=>{const i=s.length;let a,n;const r=[],o=[];let l,d=0,c=!1;for(;d<i;){for(l=t[d];d<i&&void 0!==(n=s[d],a=$l(n));)l+=a+t[++d],c=!0;d!==i&&o.push(n),r.push(l),d++}if(d===i&&r.push(t[i]),c){const e=r.join("$$lit$$");void 0===(t=Fl.get(e))&&(r.raw=r,Fl.set(e,t=r)),s=o}return e(t,...s)})(U);function Cl(e,t){if(e===t)return!0;if(!e||!t||"object"!=typeof e||"object"!=typeof t)return!1;const s=Object.keys(e),i=Object.keys(t);return s.length===i.length&&s.every(s=>Cl(e[s],t[s]))}class Sl{constructor(e=()=>{}){this._changed=e,this._pending={},this._unsent={},this._send=null,this._onError=null,this._tap=null,this._listeners=new Set}subscribe(e){return this._listeners.add(e),()=>{this._listeners.delete(e)}}_notify(){this._changed();for(const e of this._listeners)e()}current(e){return{...e,...this._pending}}reconcile(e){for(const t of Object.keys(this._pending))!(t in this._unsent)&&Cl(e[t],this._pending[t])&&delete this._pending[t]}set(e,t,s,i){Object.assign(this._pending,e),Object.assign(this._unsent,e),this._send=t,this._onError=s,i&&(this._tap={...i,at:Date.now()}),clearTimeout(this._timer),this._timer=setTimeout(()=>this.flush(),400),this._notify()}takeTap(e=Date.now()){const t=this._tap;return this._tap=null,t&&e-t.at<=3e3?{x:t.x,y:t.y}:null}flush(){clearTimeout(this._timer),this._timer=void 0;const e=this._unsent,t=this._send;if(!t||0===Object.keys(e).length)return;this._unsent={};const s=this._onError,i=()=>{for(const t of Object.keys(e))!(t in this._unsent)&&Cl(this._pending[t],e[t])&&delete this._pending[t];this._notify()};t(e).then(()=>setTimeout(i,5e3),e=>{i(),s?.(e)})}}function Dl(e){const t=e?.["sun.sun"];if(!t)return null;const s=e=>{const s=t.attributes?.[e];return"string"==typeof s?s:void 0};return{state:t.state,next_rising:s("next_rising"),next_setting:s("next_setting")}}function Al(e){const t="automatic"===e.appearance;return{entities:t&&"sun"===e.appearance_switch?["sun.sun"]:[],haDarkMode:t&&"home_assistant"===e.appearance_switch}}const zl=["light","dark","automatic"],Ml=["sun","schedule","home_assistant"],Tl=["planavista","minimal","vibrant"],Pl=["device","full","reduced"],Bl={light:"Light",dark:"Dark",automatic:"Automatic"},Ol={planavista:"PlanaVista",minimal:"Minimal",vibrant:"Vibrant"},Rl={sun:"At sunset and sunrise",schedule:"On a schedule",home_assistant:"Match Home Assistant"},Nl={device:"Follow the device",full:"Full",reduced:"Reduced"},Il=/^([01]\d|2[0-3]):([0-5]\d)$/,Ll={planavista:["planavista","light"],light:["planavista","light"],dark:["planavista","dark"],minimal:["minimal","light"],modern:["vibrant","light"],vibrant:["vibrant","light"]};function jl(e,t,s){return t.includes(e)?e:s}function Hl(e,t){return"string"==typeof e&&Il.test(e)?e:t}function ql(e){return e&&"object"==typeof e&&!Array.isArray(e)?{...e}:null}function Ul(e){const t={};for(const s of["corner_style","shadow_depth","event_style","avatar_border"])e[s]&&(t[s]=e[s]);return"light"===t.avatar_border&&(t.avatar_border="white"),t}function Wl(e){const t=e??{},s="string"==typeof t.theme&&t.theme?t.theme:"planavista",[i,a]=Ll[s]??Ll.planavista,n=ql(t.theme_overrides)??{},r=function(e){const t={};for(const s of["accent","background","now_color"])e[s]&&(t[s]=e[s]);const s=e.header_style;return"custom"===s?e.header_custom&&(t.header=e.header_custom):s&&(t.header=s),t}(n),o=ql(t.colors_light),l=ql(t.colors_dark),d=ql(t.shape);return{appearance:jl(t.appearance,zl,a),appearance_switch:jl(t.appearance_switch,Ml,"sun"),light_from:Hl(t.light_from,"07:00"),dark_from:Hl(t.dark_from,"21:00"),theme_pair:jl(t.theme_pair,Tl,i),colors_light:o??("dark"===s?{}:r),colors_dark:l??("dark"===s?r:{}),shape:d??Ul(n),motion:jl(t.motion,Pl,"device")}}function Vl(e){return{pair:e.theme_pair,light:e.colors_light,dark:e.colors_dark,shape:e.shape}}function Yl(e){const t=Il.exec(e);return t?60*Number(t[1])+Number(t[2]):0}function Kl(e,t){const s=new Date(e);return s.setHours(Math.floor(t/60),t%60,0,0),s.getTime()<=e.getTime()&&(s.setDate(s.getDate()+1),s.setHours(Math.floor(t/60),t%60,0,0)),s}function Gl(e,t){const s=Yl(e.light_from),i=Yl(e.dark_from);if(s===i)return{mode:"light",next:null};const a=60*t.getHours()+t.getMinutes(),n=s<i?a>=s&&a<i:a>=s||a<i;return{mode:n?"light":"dark",next:Kl(t,n?i:s)}}function Xl(e,t){const s=e?new Date(e):null;return s&&!Number.isNaN(s.getTime())&&s.getTime()>t.getTime()?s:null}function Jl(e){const t=e?new Date(e).getTime():Number.NaN;return Number.isNaN(t)?null:t}function Ql(e,t){const s="above_horizon"===e.state,i=t.getTime(),a=Jl(s?e.next_setting:e.next_rising),n=Jl(s?e.next_rising:e.next_setting),[r,o]=s?["light","dark"]:["dark","light"];return null===a||a>i?{mode:r,next:null===a?null:new Date(a)}:null===n||n>i?{mode:o,next:null===n?null:new Date(n)}:{mode:r,next:null}}function Zl(e,t){if("automatic"!==e.appearance)return{mode:e.appearance,next:null,sunMissing:!1};if("home_assistant"===e.appearance_switch)return{mode:t.haDark?"dark":"light",next:null,sunMissing:!1};if("sun"===e.appearance_switch){const s=t.sun;return!s||"above_horizon"!==s.state&&"below_horizon"!==s.state?{...Gl(e,t.now),sunMissing:!0}:{...Ql(s,t.now),sunMissing:!1}}return{...Gl(e,t.now),sunMissing:!1}}function ed(e,t){const s=String(e.getMinutes()).padStart(2,"0");return"24h"===t?`${String(e.getHours()).padStart(2,"0")}:${s}`:`${e.getHours()%12||12}:${s} ${e.getHours()>=12?"PM":"AM"}`}const td="planavista-page-styles",sd="planavista-transition-styles";function id(e,t=document){let s=t.getElementById(sd);e?(s||(s=t.createElement("style"),s.id=sd,t.head.appendChild(s)),s.textContent=e):s?.remove()}let ad=null,nd=!1;const rd="root";function od(e=document){return"function"==typeof e.startViewTransition}const ld=["pointerdown","keydown","wheel"],dd={capture:!0,passive:!0};class cd{constructor(e,t,s,i){this._host=e,this._edits=t,this._source=s,this._settled=i,this.mode="light",this.motion="full",this.settings=Wl(void 0),this.look=Vl(this.settings),this.sunMissing=!1,this._shown=null,this._lastInteraction=0,this._quietUntil=Number.POSITIVE_INFINITY,this._changing=!1,this._wakeUntil=0,this._onInteraction=()=>{this._lastInteraction=Date.now()},this._onVisibility=()=>{"visible"===document.visibilityState&&(this._wakeUntil=Date.now()+15e3,this._host.requestUpdate())},this._onReducedChange=()=>{this._host.requestUpdate()},e.addController(this)}hostConnected(){for(const e of ld)document.addEventListener(e,this._onInteraction,dd);document.addEventListener("visibilitychange",this._onVisibility),this._reduced="function"==typeof matchMedia?matchMedia("(prefers-reduced-motion: reduce)"):void 0,this._reduced?.addEventListener("change",this._onReducedChange)}hostDisconnected(){for(const e of ld)document.removeEventListener(e,this._onInteraction,dd);document.removeEventListener("visibilitychange",this._onVisibility),this._reduced?.removeEventListener("change",this._onReducedChange),clearTimeout(this._timer),this._shown=null}hostUpdate(){const e=this._source();e.display&&(this._display=e.display);const t=Wl(this._display);this._edits.reconcile(t);const s=function(e,t){switch(t){case"light":case"dark":return{...e,theme_pair:"planavista",appearance:t};case"planavista":case"minimal":return{...e,theme_pair:t};case"vibrant":case"modern":return{...e,theme_pair:"vibrant"};default:return e}}(this._edits.current(t),e.cardTheme),i=Zl(s,{now:new Date,sun:e.sun,haDark:e.haDark});var a,n;this.settings=s,this.look=Vl(s),this.sunMissing=i.sunMissing,this.motion=(a=s.motion,n=!!this._reduced?.matches,"full"===a||"reduced"===a?a:n?"reduced":"full"),this._show(i.mode,e.overlayOpen),this._display||(this._shown=null),this._schedule(i.next)}_show(e,t){if(this._quietUntil=Number.POSITIVE_INFINITY,this._changing)return;if(null===this._shown||e===this._shown)return void this._paint(e);const s=this._edits.takeTap(),i="hidden"===document.visibilityState,a=!s&&Date.now()<this._wakeUntil;if(!(s||i||a||function(e,t,s){return!s&&e-t>=1e4}(Date.now(),this._lastInteraction,t)))return this._quietUntil=t?Number.POSITIVE_INFINITY:this._lastInteraction+1e4,void this._paint(this._shown);const n=a?"none":function(e){return null===e.from||e.from===e.to||e.hidden||!e.supported?"none":e.reducedMotion?"fade":e.byHand?"reveal":"dark"===e.to?"dusk":"dawn"}({from:this._shown,to:e,byHand:null!==s,hidden:i,reducedMotion:"reduced"===this.motion,supported:od()});this._changing=!0,function(e,t,s,i){return"none"===e||nd||!od()?s():new Promise((a,n)=>{const r={element:t,apply:()=>s().then(a,n),point:i};ad&&ad.kind===e?ad.changes.push(r):ad?r.apply():(ad={kind:e,changes:[r]},setTimeout(()=>{!async function(){const e=ad;if(ad=null,!e)return;nd=!0;const t=document.documentElement;id(function(e,t){if(0===e.length||"none"===t)return"";const s=t=>e.map(e=>`html[data-pv-vt]::view-transition-${t}(${e})`).join(","),i=["html[data-pv-vt]::view-transition-old(root),html[data-pv-vt]::view-transition-new(root){animation:none}",`${s("group")}{animation:none}`,`${s("old")},${s("new")}{animation:none;mix-blend-mode:normal}`];if("dusk"===t||"dawn"===t){const e=`linear-gradient(to ${"dusk"===t?"bottom":"top"},transparent 0%,transparent 47.6%,#000 52.4%,#000 100%)`,a="dusk"===t?"0% 100%":"0% 0%";i.push(`${s("old")}{z-index:2;-webkit-mask-image:${e};mask-image:${e};-webkit-mask-size:100% 210%;mask-size:100% 210%;-webkit-mask-repeat:no-repeat;mask-repeat:no-repeat;-webkit-mask-position:${a};mask-position:${a}}`)}return"reveal"===t&&i.push(`${s("new")}{z-index:2}`),i.join("\n")}([rd],e.kind)),t.dataset.pvVt=e.kind;let s=[];const i=()=>Promise.all(e.changes.map(e=>e.apply())).then(()=>{});try{const t=document.startViewTransition.bind(document);let a;try{a=t(i)}catch{return void await i()}try{await a.ready,s=function(e,t){const s=document.documentElement,i=`::view-transition-old(${rd})`,a=`::view-transition-new(${rd})`;if("dusk"===e||"dawn"===e){const[t,a]="dusk"===e?["0% 100%","0% 0%"]:["0% 0%","0% 100%"];return[s.animate({maskPosition:[t,a],webkitMaskPosition:[t,a]},{duration:2e3,easing:"cubic-bezier(.45,0,.25,1)",fill:"both",pseudoElement:i})]}if("reveal"===e){const e=t.find(e=>e.point)??t[0],i=e.element.getBoundingClientRect(),n=function(e,t,s){return{x:e.x,y:e.y,radius:Math.hypot(Math.max(e.x,t-e.x),Math.max(e.y,s-e.y))}}(e.point??{x:i.left+i.width/2,y:i.top+i.height/2},window.innerWidth,window.innerHeight),r=Pa(za);return[s.animate({clipPath:[`circle(0px at ${n.x}px ${n.y}px)`,`circle(${n.radius}px at ${n.x}px ${n.y}px)`]},{duration:r.duration,easing:r.easing,fill:"both",pseudoElement:a})]}return[s.animate({opacity:[1,0]},{duration:250,easing:"ease",fill:"both",pseudoElement:i}),s.animate({opacity:[0,1]},{duration:250,easing:"ease",fill:"both",pseudoElement:a})]}(e.kind,e.changes)}catch{}await a.finished.catch(()=>{})}finally{for(const e of s)e.cancel();delete t.dataset.pvVt,id(""),nd=!1}}()},0))})}(n,this._host,async()=>{this._paint(e),this._host.requestUpdate(),await this._settled()},s??void 0).finally(()=>{this._changing=!1,this._host.requestUpdate()})}_paint(e){this.mode=e,this._shown=e,function(e,t){const s=JSON.stringify(t),i=Kt.get(e);if(i?.key!==s){for(const s of i?.names??[])s in t||e.style.removeProperty(s);for(const[s,i]of Object.entries(t))e.style.setProperty(s,i);Kt.set(e,{key:s,names:Object.keys(t)})}}(this._host,{...Vt(this.look,e),"--pv-motion":this.motion}),this._host.setAttribute("appearance",e),this._host.setAttribute("motion",this.motion)}_schedule(e){clearTimeout(this._timer);const t=Date.now();this._timer=setTimeout(()=>this._host.requestUpdate(),function(e,t,s){const i=[e+6e4,t?t.getTime()+1e3:Number.NaN,s+50];return Math.min(...i.filter(t=>t>e))}(t,e,this._quietUntil)-t)}}var pd="1.3.0";function hd(e,t,s){return`${e} ${1===e?t:s}`}const ud=[{id:"people",label:"People",group:"people",order:100,tag:"pv-settings-people",applies:({household:e})=>null!==e,summary:({household:e})=>{const t=e?.members.length??0;return 0===t?"No one yet":hd(t,"person","people")}},{id:"appearance",label:"Appearance",group:"appearance",order:400,tag:"pv-settings-appearance",summary:({data:e})=>{return t=Wl(e.display),`${Bl[t.appearance]} · ${Ol[t.theme_pair]}`;var t},needsALook:({data:e,hass:t})=>{const s=Wl(e?.display),{sunMissing:i}=Zl(s,{now:new Date,sun:Dl(t?.states)});return i?[{id:"appearance-sun",text:"Automatic appearance follows the sun, but Home Assistant's Sun integration isn't set up. The schedule's times are used until it is."}]:[]}},{id:"pins",label:"PINs and parent mode",group:"security",order:500,tag:"pv-settings-pins",applies:({household:e})=>null!==e,summary:({household:e})=>{const t=e?.members.filter(e=>e.has_pin).length??0,s=e?.account.shared?"Shared screen":"Not a shared screen";return t>0?`${s} · ${hd(t,"PIN","PINs")}`:s}},{id:"about",label:"About PlanaVista",group:"about",order:900,tag:"pv-settings-about",summary:()=>`Version ${pd}`}],md=[{id:"welcome",label:"Welcome",order:0,tag:"pv-setup-welcome",heading:"Welcome to PlanaVista",lead:"Your family's calendar and chores, together on one screen.",primary:"Set up",secondary:"Restore from a PlanaVista file"},{id:"people",label:"Who lives here?",order:100,tag:"pv-setup-people",heading:"Who lives here?",lead:"Choose everyone in your home and what they are. People without Home Assistant can be added too."},{id:"look",label:"Look",order:900,tag:"pv-setup-look",heading:"Pick a look",lead:"You can change it any time in Settings."},{id:"done",label:"Done",order:1e3,tag:"pv-setup-done",heading:"You're all set",primary:"Open the calendar"}];class vd{constructor(e){this._host=e,this.view=null,this.ready=!1,this._subscription=new $s(e=>{this.view=e,this.ready=!0,this._host.requestUpdate()}),e.addController(this)}hostConnected(){this._follow()}hostUpdate(){this._follow()}hostDisconnected(){this._subscription.stop(),this.view=null,this.ready=!1}_follow(){this._subscription.update(this._host.hass?.connection)}}class gd{constructor(e,t){this._host=e,this._entity=t,this.forecast=[],this._subscription=new ss(e=>{this.forecast=e,this._host.requestUpdate()}),e.addController(this)}hostConnected(){this._follow()}hostUpdate(){this._follow()}hostDisconnected(){this._subscription.stop(),this.forecast=[]}_follow(){const e=this._entity(),t=this._host.hass;this._subscription.update(t?.connection,e,t?.states?.[e]?.attributes?.forecast)}}class bd{constructor(){this.layout=null,this._box=null,this._beforeKeyboard=null,this._textFocused=!1}focus(e){this._textFocused=e,e&&!this._beforeKeyboard&&(this._beforeKeyboard=this._box)}blur(){this._textFocused=!1}measure(e){const t=this._beforeKeyboard;return this.layout=function(e,t,s,i){if(t&&s&&i&&e.width===s.width&&e.height<s.height)return t;if(e.width<600)return"phone";const a=e.height>0?e.width/e.height:Number.POSITIVE_INFINITY;return a>=.95&&a<=1.05?"portrait"===t||"landscape"===t?t:"landscape":a>1?"landscape":"portrait"}(e,this.layout,t,this._textFocused),t&&(e.width!==t.width||!this._textFocused&&e.height>=t.height)&&(this._beforeKeyboard=null),this._box=e,this.layout}}const yd=new Set(["INPUT","TEXTAREA","SELECT"]);class fd{constructor(e){this._host=e,this.layout="landscape",this._tracker=new bd,this._onFocusIn=e=>{const t=e.composedPath()[0];this._tracker.focus(!!t&&yd.has(t.tagName))},this._onFocusOut=()=>{this._tracker.blur()},e.addController(this)}hostConnected(){this._host.addEventListener("focusin",this._onFocusIn),this._host.addEventListener("focusout",this._onFocusOut),this._observer=new ResizeObserver(e=>{const t=e[e.length-1]?.contentRect;t&&this._measure({width:t.width,height:t.height})}),this._observer.observe(this._host);const e=this._host.getBoundingClientRect();this._measure({width:e.width,height:e.height})}hostDisconnected(){this._observer?.disconnect(),this._observer=void 0,this._host.removeEventListener("focusin",this._onFocusIn),this._host.removeEventListener("focusout",this._onFocusOut)}_measure(e){if(0===e.width&&0===e.height)return;const t=this._tracker.measure(e);t===this.layout&&this._host.getAttribute("layout")===t||(this.layout=t,this._host.setAttribute("layout",t),this._host.requestUpdate())}}class _d{constructor(e){this._onDrop=e,this._handle=()=>{this._onDrop()}}follow(e){e!==this._connection&&(this.stop(),this._connection=e,e?.addEventListener("disconnected",this._handle),e?.addEventListener("ready",this._handle))}stop(){this._connection?.removeEventListener("disconnected",this._handle),this._connection?.removeEventListener("ready",this._handle),this._connection=void 0}}const wd=12e4;class xd{constructor(e,t){this._host=e,this._api=t,this.session=null,this._connection=new _d(()=>this._forget()),this._check=()=>{var e,t;this.session&&(e=this.session,t=Date.now(),0===function(e,t){return Math.max(0,e.lastTouch+wd-t)}(e,t))&&this.lock()},this._onActivity=()=>{if(!this.session)return;const{session:e,touch:t}=function(e,t){return t-e.lastTouch<3e4?{session:e,touch:!1}:{session:{...e,lastTouch:t},touch:!0}}(this.session,Date.now());if(!t)return;this.session=e;const s=e.token;this._api().touch(s).catch(()=>{this.session?.token===s&&this._forget()}),this._host.requestUpdate()},this._onVisibility=()=>{"hidden"===document.visibilityState&&this.lock()},e.addController(this)}get token(){return this.session?.token??null}get endsAt(){return this.session?this.session.lastTouch+wd:null}hostConnected(){this._host.addEventListener("pointerdown",this._onActivity,!0),this._host.addEventListener("keydown",this._onActivity,!0),document.addEventListener("visibilitychange",this._onVisibility),this._followConnection()}hostUpdate(){this._followConnection()}hostDisconnected(){this._host.removeEventListener("pointerdown",this._onActivity,!0),this._host.removeEventListener("keydown",this._onActivity,!0),document.removeEventListener("visibilitychange",this._onVisibility),this._connection.stop(),this.lock()}ended(e){this.session?.token===e&&this._forget()}_followConnection(){this._connection.follow(this._host.hass?.connection)}unlocked(e){e.ok&&e.session&&e.member_id&&(this._forget(),this.session=function(e,t){return{token:e.session,memberId:e.member_id,parent:e.parent,lastTouch:t}}({session:e.session,member_id:e.member_id,parent:!!e.parent},Date.now()),this._timer=window.setInterval(this._check,1e3),this._host.requestUpdate())}lock(){const e=this.token;this._forget(),e&&this._api().lock(e).catch(()=>{})}_forget(){window.clearInterval(this._timer),this._timer=void 0,this.session&&(this.session=null,this._host.requestUpdate())}}class $d extends de{constructor(){super(...arguments),this._config={}}setConfig(e){this._config=e}render(){return U`
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
    `}}$d.styles=r`
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
  `,e([ue({attribute:!1})],$d.prototype,"hass",void 0),ge("planavista-calendar-card-editor",$d);class kd extends de{constructor(){super(...arguments),this.layout="landscape",this.timeFormat="12h",this.weather=null,this.weatherEntity="",this.today=null,this.chips=[],this._minute=Math.floor(Date.now()/6e4),this._timer=null}connectedCallback(){super.connectedCallback(),this._minute=Math.floor(Date.now()/6e4),this._timer=setInterval(()=>{const e=Math.floor(Date.now()/6e4);e!==this._minute&&(this._minute=e)},1e3)}disconnectedCallback(){super.disconnectedCallback(),this._timer&&clearInterval(this._timer),this._timer=null}render(){const e=new Date,{time:t,ampm:s,date:i}=function(e,t){const s=String(e.getMinutes()).padStart(2,"0"),i=e.toLocaleDateString("en-US",{weekday:"long",month:"long",day:"numeric"});return"24h"===t?{time:`${e.getHours()}:${s}`,ampm:"",date:i}:{time:`${e.getHours()%12||12}:${s}`,ampm:e.getHours()>=12?"PM":"AM",date:i}}(e,this.timeFormat),a=U`<span class="time">${t}${s?U`<span class="ampm muted">${s}</span>`:Y}</span>`,n=this.chips.filter(e=>e.primary);if("portrait"===this.layout)return U`
        <div class="row">
          <div class="clock">${a}<div class="date">${i}</div></div>
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
        ${Qt(s.state||"cloudy",e)}
        <span class="weather-text">
          <span class="temp">${i}°</span>
          ${"condition"===t?U`<span class="condition muted">${(s.state||"").replace(/-/g," ")}</span>`:Y}
          ${"highlow"===t&&a?U`<span class="highlow muted">High ${a.high}°${null!==a.low?` · Low ${a.low}°`:""}</span>`:Y}
        </span>
      </button>
    `}_details(){this.weatherEntity&&this.dispatchEvent(new CustomEvent("hass-more-info",{detail:{entityId:this.weatherEntity},bubbles:!0,composed:!0}))}}kd.styles=r`
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
  `,e([ue({type:String,reflect:!0})],kd.prototype,"layout",void 0),e([ue({attribute:!1})],kd.prototype,"timeFormat",void 0),e([ue({attribute:!1})],kd.prototype,"weather",void 0),e([ue({attribute:!1})],kd.prototype,"weatherEntity",void 0),e([ue({attribute:!1})],kd.prototype,"today",void 0),e([ue({attribute:!1})],kd.prototype,"chips",void 0),e([me()],kd.prototype,"_minute",void 0),ge("pv-glance-header",kd);class Fd extends de{constructor(){super(...arguments),this.layout="landscape",this._wrapped=!1,this.modules=[],this.activeModule="",this.views=[],this.activeView="",this.canOpenSettings=!1,this.actions=[]}connectedCallback(){super.connectedCallback(),this._observer=new ResizeObserver(()=>this._measure()),this._observer.observe(this)}disconnectedCallback(){super.disconnectedCallback(),this._observer?.disconnect()}updated(e){super.updated(e),e.has("_wrapped")||this._measure(),this.toggleAttribute("wrapped",this._wrapped)}_measure(){const e=this.renderRoot.querySelector("nav");if(!e||!e.clientWidth)return;const t=getComputedStyle(e),s=e.clientWidth-(parseFloat(t.paddingLeft)||0)-(parseFloat(t.paddingRight)||0),i=parseFloat(t.columnGap)||12,a=[...this.renderRoot.querySelectorAll(".views .view")],n=a.reduce((e,t)=>e+t.offsetWidth,0)+2*Math.max(0,a.length-1),r=!function(e,t,s){const i=e.reduce((e,t)=>e+t,0)+t*Math.max(0,e.length-1);return i<=s}([...[...e.children].filter(e=>!e.classList.contains("views")).map(e=>e.offsetWidth),n],i,s);r!==this._wrapped&&(this._wrapped=r)}render(){return U`
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
    `}_openSettings(e){e.currentTarget.dispatchEvent(new CustomEvent("pv-open-settings",{bubbles:!0,composed:!0}))}_fire(e,t){this.dispatchEvent(new CustomEvent(e,{detail:t,bubbles:!0,composed:!0}))}}Fd.styles=r`
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

    /* Two rows when one won't hold everything: the switcher, buttons, and gear, then the views. */
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
  `,e([ue({type:String,reflect:!0})],Fd.prototype,"layout",void 0),e([me()],Fd.prototype,"_wrapped",void 0),e([ue({attribute:!1})],Fd.prototype,"modules",void 0),e([ue({attribute:!1})],Fd.prototype,"activeModule",void 0),e([ue({attribute:!1})],Fd.prototype,"views",void 0),e([ue({attribute:!1})],Fd.prototype,"activeView",void 0),e([ue({type:Boolean})],Fd.prototype,"canOpenSettings",void 0),e([ue({attribute:!1})],Fd.prototype,"actions",void 0),ge("pv-nav-bar",Fd);class Ed extends de{constructor(){super(...arguments),this.endsAt=0,this.color="currentColor",this.size=28,this._now=Date.now()}connectedCallback(){super.connectedCallback(),this._timer=window.setInterval(()=>{this._now=Date.now()},1e3)}disconnectedCallback(){super.disconnectedCallback(),window.clearInterval(this._timer)}render(){const e=Math.max(0,this.endsAt-this._now),t=Math.min(1,e/wd),s=this.size/2,i=(this.size-3)/2,a=2*Math.PI*i,n=10*Math.ceil(Math.ceil(e/1e3)/10),r=`Parent mode ends in ${Math.floor(n/60)} min ${n%60} s`;return U`
      <svg width=${this.size} height=${this.size} viewBox="0 0 ${this.size} ${this.size}" role="img" aria-label=${r}>
        ${W`
          <circle class="track" cx=${s} cy=${s} r=${i} fill="none"
            stroke=${this.color} stroke-width=${3}></circle>
          <circle cx=${s} cy=${s} r=${i} fill="none" stroke=${this.color}
            stroke-width=${3} stroke-linecap="round"
            stroke-dasharray=${a} stroke-dashoffset=${a*(1-t)}></circle>
        `}
      </svg>
    `}}Ed.styles=r`
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
  `,e([ue({type:Number})],Ed.prototype,"endsAt",void 0),e([ue({type:String})],Ed.prototype,"color",void 0),e([ue({type:Number})],Ed.prototype,"size",void 0),e([me()],Ed.prototype,"_now",void 0),ge("pv-session-ring",Ed);class Cd extends de{constructor(){super(...arguments),this.endsAt=0,this.actions=[]}render(){const e=this.member;return e?U`
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
    `:Y}_action(e){this.dispatchEvent(new CustomEvent("pv-strip-action",{detail:{id:e},bubbles:!0,composed:!0}))}_lock(){this.dispatchEvent(new CustomEvent("pv-lock",{bubbles:!0,composed:!0}))}}function Sd(e,t,s){const i=[...e];if(t<0||t>=i.length||s<0||s>=i.length||t===s)return i;const[a]=i.splice(t,1);return i.splice(s,0,a),i}Cd.styles=[ot,r`
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
    `],e([ue({attribute:!1})],Cd.prototype,"member",void 0),e([ue({attribute:!1})],Cd.prototype,"hass",void 0),e([ue({type:Number})],Cd.prototype,"endsAt",void 0),e([ue({attribute:!1})],Cd.prototype,"actions",void 0),ge("pv-parent-strip",Cd);class Dd extends de{constructor(){super(...arguments),this.household=null,this.layout="landscape",this.mode="settings",this._order=null,this._dragging=null,this._dragMove=e=>{if(!this._dragging||!this._order)return;const t=[...this.renderRoot.querySelectorAll("li")].map(e=>{const t=e.getBoundingClientRect();return{top:t.top,height:t.height}}),s=function(e,t){if(0===t.length)return-1;const s=t.findIndex(t=>e<t.top+t.height/2);return s>=0?s:t.length-1}(e.clientY,t),i=this._order.indexOf(this._dragging);s>=0&&s!==i&&(this._order=Sd(this._order,i,s))},this._dragEnd=()=>{if(!this._dragging||!this._order)return;const e=this._order;this._dragging=null,this._saveOrder(e)}}_members(){const e=Rs(this.household?.members??[]);if(!this._order)return e;const t=new Map(e.map(e=>[e.id,e]));return this._order.map(e=>t.get(e)).filter(e=>!!e)}render(){const e=this._members(),t=!!this.household?.available;return U`
      <div class="head">
        <p class="lead">This is the order people appear in. Drag ≡ to change it.</p>
        ${t?U`<button class="pv-btn pv-btn-secondary add" type="button" @click=${this._add}>+ Add someone</button>`:Y}
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
                <span class="summary">${function(e,t){const s=[e.parent?"Parent":zs[e.age_group]];e.has_pin&&s.push("PIN on");const i=js(e.id,t);return 0===i.length?s.push("no calendar"):1===i.length?s.push(`${e.name}'s calendar`):s.push(`${i.length} calendars`),s.join(" · ")}(e,this.data?.calendars??[])}</span>
              </span>
              <span class="chevron" aria-hidden="true">›</span>
            </button>
          </li>
        `)}
      </ul>
      ${t&&e.length>0?U`<button class="pv-btn pv-btn-secondary add" type="button" @click=${this._add}>+ Add someone</button>`:Y}
    `}_push(e){this.dispatchEvent(new CustomEvent(Fs,{detail:e,bubbles:!0,composed:!0}))}_open(e){this._push({tag:"pv-settings-person",title:e.name,back:"People",props:{memberId:e.id}})}_add(){this._push({tag:"pv-settings-person",title:"New person",back:"People",props:{memberId:null}})}_dragStart(e,t){e.currentTarget.setPointerCapture(e.pointerId),this._order=this._members().map(e=>e.id),this._dragging=t}_keyMove(e,t){if("ArrowUp"!==e.key&&"ArrowDown"!==e.key)return;e.preventDefault();const s=this._members().map(e=>e.id),i="ArrowUp"===e.key?t-1:t+1;i<0||i>=s.length||(this._order=Sd(s,t,i),this._saveOrder(this._order).then(()=>{this.renderRoot.querySelectorAll(".handle")[i]?.focus()}))}async _saveOrder(e){const t=Rs(this.household?.members??[]).map(e=>e.id);if(e.join()!==t.join())try{await this.api.reorder(e)}catch(e){this.dispatchEvent(new CustomEvent(Cs,{detail:{message:Ds(fs(e))},bubbles:!0,composed:!0}))}this._order=null}}Dd.styles=[nt,ot,r`
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
    `],e([ue({attribute:!1})],Dd.prototype,"hass",void 0),e([ue({attribute:!1})],Dd.prototype,"data",void 0),e([ue({attribute:!1})],Dd.prototype,"household",void 0),e([ue({attribute:!1})],Dd.prototype,"api",void 0),e([ue({type:String})],Dd.prototype,"layout",void 0),e([ue({type:String})],Dd.prototype,"mode",void 0),e([me()],Dd.prototype,"_order",void 0),e([me()],Dd.prototype,"_dragging",void 0),ge("pv-settings-people",Dd);const Ad=["name","color","picture","age_group","parent","person","needs_ok_for","my_day","stars","goal","away","bedtime","sleep_hours","phones","notify"],zd={young_child:{my_day:"pictures",needs_ok_for:"all",stars:!0},older_child:{my_day:"list",needs_ok_for:"marked",stars:!0},teen:{my_day:"timeline",needs_ok_for:"marked",stars:!0},adult:{my_day:"timeline",needs_ok_for:"none",stars:!1}},Md={requests:!0,reminders:!1};function Td(e,t){return JSON.stringify(e)===JSON.stringify(t)}function Pd(e,t,s){if(e){const t=e.notify??{};return{name:e.name,color:e.color,picture:e.picture,age_group:e.age_group,parent:e.parent,person:e.person,needs_ok_for:e.needs_ok_for,my_day:e.my_day,stars:e.stars,goal:e.goal??null,away:Array.isArray(e.away)?e.away:[],bedtime:e.bedtime??null,sleep_hours:e.sleep_hours??null,phones:Array.isArray(e.phones)?e.phones:[],notify:{...Md,...t}}}const i=Hs(t),a=s.find(e=>!i.has(e.toUpperCase()))??s[0];return{name:"",color:a,picture:{initial:!0},age_group:"adult",parent:!1,person:null,...zd.adult,goal:null,away:[],bedtime:null,sleep_hours:null,phones:[],notify:{...Md}}}function Bd(e,t,s){const i=Pd(e,t,s);return{draft:i,start:i,rev:e?e.rev:null}}function Od(e,t){return!Td(e,t)}const Rd=Us.PRESETS.map(e=>e.color);class Nd extends de{constructor(){super(...arguments),this.household=null,this.layout="landscape",this.mode="settings",this.pageProps={},this.drafts=new Map,this.services={},this.revision=0,this._rev=null,this._problem="",this._saving=!1,this._notice=null,this._loaded=!1,this._onSectionChange=e=>{e.stopPropagation(),this._change(e.detail)}}get _memberId(){return this.pageProps.memberId??null}get _member(){return this.household?.members.find(e=>e.id===this._memberId)??null}get _draftKey(){return this._memberId??"new"}willUpdate(){if(!this._loaded&&this.household){const e=this.drafts.get(this._draftKey);this._use(e??Bd(this._member,this.household.members,Rd)),this._loaded=!0}}_use(e){this._draft=e.draft,this._start=e.start,this._rev=e.rev}get _record(){return{draft:this._draft,start:this._start,rev:this._rev}}connectedCallback(){super.connectedCallback(),this.addEventListener(Zs,this._onSectionChange)}disconnectedCallback(){super.disconnectedCallback(),this.removeEventListener(Zs,this._onSectionChange)}confirmLeave(){return this._loaded&&Od(this._draft,this._start)?(this._notice="discard",new Promise(e=>{this._leave=e})):Promise.resolve(!0)}render(){if(!this._loaded||!this.household)return Y;const e=this._member,t=null===this._memberId;if(!t&&!e)return U`<p class="gone">This person was removed on another screen.</p>`;const s=this._draft,i=Od(s,this._start);return U`
      <div class="top">
        <pv-member-avatar
          .member=${{name:s.name||"?",color:s.color,picture:s.picture,person:s.person}}
          .hass=${this.hass}
          size="64"
        ></pv-member-avatar>
        <div class="actions">
          <button class="pv-btn pv-btn-secondary" type="button" @click=${this._cancel}>Cancel</button>
          <button class="pv-btn pv-btn-primary" type="button"
            ?disabled=${this._saving||!t&&!i}
            @click=${this._save}>${t?"Add":"Save"}</button>
        </div>
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
    `}_renderColor(){const e=Hs(this.household.members,this._memberId??void 0);return U`
      <fieldset class="field">
        <legend>Color</legend>
        <div class="swatches">
          ${Us.PRESETS.map(t=>{const s=e.get(t.color.toUpperCase()),i=this._draft.color.toUpperCase()===t.color.toUpperCase();return U`
              <button
                class="swatch"
                type="button"
                style="background:${t.color}"
                aria-pressed=${i?"true":"false"}
                aria-label=${s?`${t.name}, used by ${s.name}`:t.name}
                ?disabled=${!!s}
                @click=${()=>this._change({color:t.color})}
              >${s?Ns(s.name):""}</button>
            `})}
        </div>
      </fieldset>
    `}_personPicture(){const e=this._draft.person;return e?this.hass?.states?.[e]?.attributes?.entity_picture??null:null}_renderPicture(){const e=this._draft.picture,t="string"==typeof e.emoji?"emoji":e.person?"photo":"initial",s=this._personPicture(),i=!!this._draft.person,a=e=>this._change({picture:e});return U`
      <fieldset class="field">
        <legend>Picture</legend>
        <div class="segmented" role="group" aria-label="Picture">
          <button type="button" aria-pressed=${"initial"===t?"true":"false"}
            @click=${()=>a({initial:!0})}>Initial</button>
          <button type="button" aria-pressed=${"emoji"===t?"true":"false"}
            @click=${()=>a({emoji:"string"==typeof e.emoji?e.emoji:"🙂"})}>Emoji</button>
          <button type="button" aria-pressed=${"photo"===t?"true":"false"} ?disabled=${!i}
            @click=${()=>a({person:!0})}>Photo</button>
        </div>
        ${"emoji"===t?U`
          <input class="pv-input emoji" type="text" maxlength="16" placeholder="Type or paste an emoji"
            aria-label="Emoji"
            .value=${String(e.emoji??"")}
            @input=${e=>a({emoji:e.target.value})} />
        `:Y}
        ${i?"photo"!==t||s?Y:U`<p class="hint">Their Home Assistant person has no photo yet, so their initial shows.</p>`:U`<p class="hint">Link a Home Assistant person to use their photo.</p>`}
      </fieldset>
    `}get _choresOn(){const e=this.household?.modules?.chores;return!0===e?.enabled}_renderAgeGroup(){return U`
      <fieldset class="field">
        <legend>Age group</legend>
        <div class="radios">
          ${Ms.map(e=>{const t=this._choresOn?Ts[e.id]:e.hint;return U`
              <label class="radio">
                <input type="radio" name="age-group" .checked=${this._draft.age_group===e.id}
                  @change=${()=>{return this._changeDraft((t=this._draft,s=e.id,{...t,age_group:s,...zd[s]}));var t,s}} />
                <span>${e.label}</span>
                ${t?U`<span class="age-hint">${t}</span>`:Y}
              </label>
            `})}
        </div>
      </fieldset>
    `}_renderSections(e,t){const s={household:this.household,data:this.data,services:this.services};return ti.pages(s).filter(t=>t.slot===e).map(e=>{const s=kl(e.tag);return El`
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
    `}_renderHomeAssistant(){const e=this.household.members,t=new Set(e.filter(e=>e.id!==this._memberId&&e.person).map(e=>e.person)),s=Object.keys(this.hass?.states??{}).filter(e=>e.startsWith("person.")&&!t.has(e)).sort(),i=this._memberId?js(this._memberId,this.data?.calendars??[]):[];return U`
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
    `:Y}_change(e){this._changeDraft({...this._draft,...e})}_changeDraft(e){this._draft=e,this._problem="",this.drafts.set(this._draftKey,this._record)}_linkPerson(e){const t=this._draft.picture;this._change({person:e||null,picture:!e&&t.person?{initial:!0}:this._draft.picture})}_pop(){this.dispatchEvent(new CustomEvent(Es,{bubbles:!0,composed:!0}))}_cancel(){Od(this._draft,this._start)?this._notice="discard":this._pop()}async _save(){const e=function(e,t,s){const i=e.name.trim();if(!i)return"Add a name.";const a=t.filter(e=>e.id!==s);if(a.some(e=>e.name.toLocaleLowerCase()===i.toLocaleLowerCase()))return"Someone already has that name.";const n=a.find(t=>t.color.toUpperCase()===e.color.toUpperCase());return n?`${n.name} already has that color.`:e.away.some(e=>!e.from||!e.to||e.to<e.from)?"Pick the first and last days away.":null}(this._draft,this.household?.members??[],this._memberId);if(e)return void(this._problem=e);const t=this._member;if(null===this._rev||t){this._saving=!0;try{const e=t&&null!==this._rev?{id:t.id,rev:this._rev}:void 0;await this.api.saveMember(function(e){const t={};for(const s of Ad)null!==e.rev&&Td(e.draft[s],e.start[s])||(t[s]=e.draft[s]);return"string"==typeof t.name&&(t.name=t.name.trim()),t}(this._record),e),this.drafts.delete(this._draftKey),this._start=this._draft,this._pop()}catch(e){const t=fs(e);"changed"===t?this._notice="changed":this._problem=e?.message||Ds(t)}finally{this._saving=!1}}else this._problem="That person was removed on another screen."}_onDiscardChoice(e){e.stopPropagation(),this._notice=null;const t="discard"===e.detail.id;if(t&&(this.drafts.delete(this._draftKey),this._draft=this._start),this._leave){const e=this._leave;this._leave=void 0,e(t)}else t&&this._pop()}async _onRemoveChoice(e){e.stopPropagation(),this._notice=null;const t=this._member;if("remove"===e.detail.id&&t)try{await this.api.deleteMember(t.id),this.drafts.delete(this._draftKey),this._start=this._draft,this._pop()}catch(e){this._problem=e?.message||Ds(fs(e))}}_onChangedChoice(e){e.stopPropagation(),this._notice=null;const t=this._member;this.household&&t&&("load"===e.detail.id?(this._use(Bd(t,this.household.members,Rd)),this.drafts.delete(this._draftKey)):(this._use(function(e,t,s){const i=Pd(t,s,Rd),a={...i};for(const t of Ad)Td(e.draft[t],e.start[t])||(a[t]=e.draft[t]);return{draft:a,start:i,rev:t.rev}}(this._record,t,this.household.members)),this.drafts.set(this._draftKey,this._record)))}}Nd.styles=[nt,ot,ct,r`
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
    `],e([ue({attribute:!1})],Nd.prototype,"hass",void 0),e([ue({attribute:!1})],Nd.prototype,"data",void 0),e([ue({attribute:!1})],Nd.prototype,"household",void 0),e([ue({attribute:!1})],Nd.prototype,"api",void 0),e([ue({type:String})],Nd.prototype,"layout",void 0),e([ue({type:String})],Nd.prototype,"mode",void 0),e([ue({attribute:!1})],Nd.prototype,"pageProps",void 0),e([ue({attribute:!1})],Nd.prototype,"drafts",void 0),e([ue({attribute:!1})],Nd.prototype,"services",void 0),e([ue({type:Number})],Nd.prototype,"revision",void 0),e([me()],Nd.prototype,"_draft",void 0),e([me()],Nd.prototype,"_start",void 0),e([me()],Nd.prototype,"_problem",void 0),e([me()],Nd.prototype,"_saving",void 0),e([me()],Nd.prototype,"_notice",void 0),ge("pv-settings-person",Nd);class Id extends de{constructor(){super(...arguments),this.household=null,this.layout="landscape",this.mode="settings",this._message="",this._busy=!1,this._toggleShared=()=>{this.household&&this._run(()=>this.api.setSharedScreen(!this.household.account.shared))},this._toggleShuffle=()=>{this.household&&this._run(()=>this.api.saveSecurity({shuffle_keypad:!this.household.security.shuffle_keypad}))}}render(){const e=this.household;if(!e)return Y;const t=e.account,s=e.security.shared_screens>0;return U`
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
        ${Rs(e.members).map(t=>U`
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

      <p class="rule">
        After 5 wrong tries, a PIN pauses for 30 seconds, and each pause after that is twice as
        long, up to 15 minutes. A parent can clear a pause here. Forgot every parent's PIN? Sign in
        to Home Assistant with a parent's or an admin's own account and set new ones here.
      </p>
    `}_switch(e,t,s,i){return U`
      <div class="toggle-row">
        <span class="label" id=${t}>${e}</span>
        <div
          class="pv-toggle ${s?"active":""}"
          role="switch"
          tabindex="0"
          aria-checked=${s?"true":"false"}
          aria-labelledby=${t}
          aria-disabled=${this._busy?"true":"false"}
          @click=${i}
          @keydown=${e=>{"Enter"!==e.key&&" "!==e.key||(e.preventDefault(),i())}}
        ></div>
      </div>
    `}async _run(e){if(!this._busy){this._busy=!0,this._message="";try{await e()}catch(e){this._message=e?.message||Ds(fs(e))}finally{this._busy=!1}}}}Id.styles=[nt,ot,ct,r`
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
    `],e([ue({attribute:!1})],Id.prototype,"hass",void 0),e([ue({attribute:!1})],Id.prototype,"data",void 0),e([ue({attribute:!1})],Id.prototype,"household",void 0),e([ue({attribute:!1})],Id.prototype,"api",void 0),e([ue({type:String})],Id.prototype,"layout",void 0),e([ue({type:String})],Id.prototype,"mode",void 0),e([me()],Id.prototype,"_message",void 0),e([me()],Id.prototype,"_busy",void 0),ge("pv-settings-pins",Id);class Ld extends de{render(){return U`
      <p class="name">PlanaVista</p>
      <p class="version">Version ${pd}</p>
      <ul>
        <li><a href="https://github.com/tavenhall1/planavista" target="_blank" rel="noopener noreferrer">Project on GitHub</a></li>
        <li><a href="https://github.com/tavenhall1/planavista/issues" target="_blank" rel="noopener noreferrer">Report a problem</a></li>
      </ul>
    `}}Ld.styles=[nt,r`
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
    `],ge("pv-settings-about",Ld);class jd{constructor(e){this._host=e,this._watched=null,this._unsubscribe=null,this._fallback=new Sl(()=>e.requestUpdate()),e.addController(this)}get edits(){return this._host.drafts?.get("appearance")??this._fallback}hostConnected(){this._watch()}hostUpdate(){this._watch()}hostDisconnected(){this._unsubscribe?.(),this._unsubscribe=null,this._watched=null,this.edits.flush()}current(){return this.edits.current(Wl(this._host.data?.display))}set(e,t){this.edits.set(e,e=>this._host.api.saveConfig({display:e}),e=>this._error(e),function(e){if(!e)return;const t=e;if("number"==typeof t.clientX&&t.detail>0)return{x:t.clientX,y:t.clientY};const s=e.currentTarget;if(!s?.getBoundingClientRect)return;const i=s.getBoundingClientRect();return{x:i.left+i.width/2,y:i.top+i.height/2}}(t))}_watch(){const e=this.edits;e!==this._watched&&(this._unsubscribe?.(),this._watched=e,this._unsubscribe=e.subscribe(()=>this._host.requestUpdate()))}_error(e){this._host.dispatchEvent(new CustomEvent(Cs,{detail:{message:Ds(fs(e))},bubbles:!0,composed:!0}))}}const Hd={background:{min:4.5,message:e=>`Text is hard to read on the ${e} background.`,ratio:e=>He(e["--pv-text"],e["--pv-card-bg"]),fix:(e,t)=>Je(e["--pv-bg"],e["--pv-text"],t)},accent:{min:3,message:e=>`The ${e} accent is hard to see on this background.`,ratio:e=>He(e["--pv-accent"],e["--pv-card-bg"]),fix:(e,t)=>Je(e["--pv-accent"],e["--pv-card-bg"],t)},header:{min:4.5,message:e=>`Text on the ${e} header is hard to read.`,ratio:e=>Ne(e["--pv-header-gradient"])?He(e["--pv-header-text"],e["--pv-header-gradient"]):null,fix:(e,t)=>Je(e["--pv-header-gradient"],e["--pv-header-text"],t)},now_color:{min:3,message:e=>`The ${e} now line is hard to see on this background.`,ratio:e=>He(e["--pv-now-color"],e["--pv-card-bg"]),fix:(e,t)=>Je(e["--pv-now-color"],e["--pv-card-bg"],t)}},qd=Object.keys(Hd);function Ud(e,t){const s=e.ratio(t);return null!==s&&s<e.min}function Wd(e,t,s,i){return{...e,[t]:{...e[t],[s]:i}}}function Vd(e,t){const s="light"===t?e.light:e.dark;return qd.filter(i=>void 0!==s[i]||"dark"===t&&void 0!==e.light[i])}const Yd=[{key:"accent",label:"Accent",token:"--pv-accent"},{key:"background",label:"Background",token:"--pv-bg"},{key:"header",label:"Header",token:"--pv-header-gradient"},{key:"now_color",label:"Now line",token:"--pv-now-color"}],Kd=[{key:"plain",label:"Plain"},{key:"gradient_purple",label:"Purple"},{key:"gradient_teal",label:"Teal"},{key:"gradient_sunset",label:"Sunset"},{key:"solid_accent",label:"Accent"},{key:"solid_dark",label:"Dark"}],Gd={light:"Light",dark:"Dark"},Xd=[{key:"corner_style",label:"Corners",options:[["sharp","Sharp"],["rounded","Rounded"],["pill","Pill"]]},{key:"shadow_depth",label:"Shadows",options:[["none","None"],["subtle","Subtle"],["bold","Bold"]]},{key:"event_style",label:"Events",options:[["stripes","Stripes"],["solid","Solid"]]}];class Jd extends de{constructor(){super(...arguments),this.household=null,this.layout="landscape",this.mode="settings",this.drafts=new Map,this._open=null,this._confirmReset=!1,this._page=new jd(this),this._onResetChoice=e=>{e.stopPropagation(),this._confirmReset=!1,"reset"===e.detail.id&&(this._open=null,this._page.set({colors_light:{},colors_dark:{}}))}}render(){if(!this.data)return Y;const e=this._page.current(),t=Vl(e),s=function(e){const t=[];for(const s of["light","dark"]){const i=Vt(e,s);for(const a of Vd(e,s)){const n=Hd[a];if(Ud(n,i))for(const r of[0,.5,1,1.5,2,3]){const o=n.fix(i,n.min+r);if(o&&!Ud(n,Vt(Wd(e,s,a,o),s))){t.push({mode:s,key:a,message:n.message(s),fix:o});break}}}}return t}(t),i=Ol[e.theme_pair],a=Object.keys(e.colors_light).length+Object.keys(e.colors_dark).length>0;return U`
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
    `}_renderColors(e){const t={light:Vt(e,"light"),dark:Vt(e,"dark")};return U`
      <table>
        <thead>
          <tr><td></td><th scope="col">Light</th><th scope="col">Dark</th></tr>
        </thead>
        <tbody>
          ${Yd.map(s=>U`
            <tr>
              <th scope="row">${s.label}</th>
              ${["light","dark"].map(i=>{const a=this._open?.key===s.key&&this._open.mode===i,n=this._caption(e,i,s.key);return U`
                  <td>
                    <button class="cell" type="button" aria-expanded=${a?"true":"false"}
                      aria-label=${`${s.label}, ${Gd[i]}: ${n}`}
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
    `}_caption(e,t,s){const i=e[t][s];if(void 0===i)return"dark"===t&&void 0!==e.light[s]?"Matched":"Original";if("header"===s){const e=Kd.find(e=>e.key===i);if(e)return e.label}return i.toUpperCase()}_renderEditor(e,t,s){const i=e[t][s],a="light"===t?"Original":"Matched",n=i&&i.startsWith("#")?i:"";return U`
      <div class="editor" aria-label=${`${Yd.find(e=>e.key===s)?.label} for ${Gd[t]}`} role="group">
        <div class="pill-group">
          <button class="pill-btn ${void 0===i?"pill-btn--active":""}" type="button"
            aria-pressed=${void 0===i?"true":"false"}
            @click=${e=>this._setColor(t,s,void 0,e)}>${a}</button>
          ${"header"===s?Kd.map(e=>U`
            <button class="pill-btn ${i===e.key?"pill-btn--active":""}" type="button"
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
        ${Xd.map(t=>{const s=e[t.key]??("event_style"===t.key?"stripes":void 0);return U`
            <div role="group" aria-label=${t.label}>
              <span class="shape-label">${t.label}</span>
              <div class="pill-group">
                ${t.options.map(([e,i])=>U`
                  <button class="pill-btn ${s===e?"pill-btn--active":""}" type="button"
                    aria-pressed=${s===e?"true":"false"}
                    @click=${s=>this._setShape({[t.key]:e},s)}>${i}</button>
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
            <button class="pill-btn ${s?"pill-btn--active":""}" type="button"
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
    `}_setColor(e,t,s,i){const a=this._page.current(),n={..."light"===e?a.colors_light:a.colors_dark};void 0===s?delete n[t]:n[t]=s,this._page.set("light"===e?{colors_light:n}:{colors_dark:n},i)}_setShape(e,t){this._page.set({shape:{...this._page.current().shape,...e}},t)}}Jd.styles=[ot,ct,bs,r`
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
    `],e([ue({attribute:!1})],Jd.prototype,"hass",void 0),e([ue({attribute:!1})],Jd.prototype,"data",void 0),e([ue({attribute:!1})],Jd.prototype,"household",void 0),e([ue({attribute:!1})],Jd.prototype,"api",void 0),e([ue({type:String,reflect:!0})],Jd.prototype,"layout",void 0),e([ue({type:String})],Jd.prototype,"mode",void 0),e([ue({attribute:!1})],Jd.prototype,"drafts",void 0),e([me()],Jd.prototype,"_open",void 0),e([me()],Jd.prototype,"_confirmReset",void 0),ge("pv-settings-customize",Jd);const Qd=["#4D8FD9","#F3722C","#43AA8B"],Zd={sun:"",schedule:"",home_assistant:"Each screen follows its own Home Assistant theme setting. Handy for phones."};function ec(e,t){const s=[`--p-page: ${e["--pv-bg"]}`,`--p-card: ${e["--pv-card-bg"]}`,`--p-header: ${e["--pv-header-gradient"]}`,`--p-accent: ${e["--pv-accent"]}`,`--p-line: ${e["--pv-border"]}`].join("; ");return U`
    <span class="pic" style=${s}>
      <span class="pic-header"></span>
      <span class="pic-bar"><span class="pic-tab"></span></span>
      <span class="pic-cols">
        ${Qd.map(e=>U`<span class="pic-col" style="--p-person: ${Yt(e,void 0,t).color}"></span>`)}
      </span>
    </span>
  `}class tc extends de{constructor(){super(...arguments),this.household=null,this.layout="landscape",this.mode="settings",this.drafts=new Map,this._page=new jd(this)}render(){if(!this.data)return Y;const e=this._page.current(),t=Vl(e);return U`
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
              <span class="row-title">Customize ${Ol[e.theme_pair]}</span>
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
    `}_heading(e,t){return U`<h2 class="section-heading" id=${t}>${e}</h2>`}_renderModes(e,t){const s=Vt(e,"light"),i=Vt(e,"dark");return U`
      <div class="modes" role="radiogroup" aria-label="Appearance"
        @keydown=${e=>this._arrows(e,zl,t,t=>this._page.set({appearance:t},e))}>
        ${zl.map(e=>U`
          <button class="mode-option" type="button" role="radio" data-value=${e}
            aria-checked=${e===t?"true":"false"}
            tabindex=${e===t?"0":"-1"}
            @click=${t=>this._page.set({appearance:e},t)}>
            <span class="frame">
              ${"automatic"===e?U`<span class="pic-pair split">${ec(s,"light")}<span class="pic-over">${ec(i,"dark")}</span></span>`:ec("dark"===e?i:s,"dark"===e?"dark":"light")}
              <span class="badge" aria-hidden="true">✓</span>
            </span>
            <span class="option-label">${Bl[e]}</span>
          </button>
        `)}
      </div>
    `}_renderSwitch(e,t,s){const i=Dl(this.hass?.states),a="24h"===this.data.display?.time_format?"24h":"12h",n=i?function(e,t,s){if(!e)return null;const i=Xl(e.next_rising,t),a=Xl(e.next_setting,t);if(!i||!a)return null;if("below_horizon"===e.state)return`Light at ${ed(i,s)}, dark again at ${ed(a,s)}.`;const n=function(e,t){return e.getFullYear()===t.getFullYear()&&e.getMonth()===t.getMonth()&&e.getDate()===t.getDate()}(a,t)?" tonight":"";return`Dark at ${ed(a,s)}${n}, light again at ${ed(i,s)}.`}(i,new Date,a)??"Uses your home's location in Home Assistant.":"Home Assistant's Sun integration isn't set up, so the schedule's times are used until it is.",r={...Zd,sun:n};return U`
      <div class="rows" role="radiogroup" aria-labelledby="switch-heading"
        @keydown=${t=>this._arrows(t,Ml,e,e=>this._page.set({appearance_switch:e},t))}>
        ${Ml.map(i=>U`
          <button class="row" type="button" role="radio" data-value=${i}
            aria-checked=${i===e?"true":"false"}
            tabindex=${i===e?"0":"-1"}
            @click=${e=>this._page.set({appearance_switch:i},e)}>
            <span class="dot" aria-hidden="true"></span>
            <span class="row-text">
              <span class="row-title">${Rl[i]}</span>
              ${r[i]?U`<span class="row-help">${r[i]}</span>`:Y}
            </span>
          </button>
          ${"schedule"===i&&"schedule"===e?U`
            <div class="times">
              <label>Light from
                <input class="pv-input" type="time" .value=${t}
                  @change=${e=>this._time("light_from",e)}>
              </label>
              <label>Dark from
                <input class="pv-input" type="time" .value=${s}
                  @change=${e=>this._time("dark_from",e)}>
              </label>
            </div>
          `:Y}
        `)}
      </div>
    `}_renderThemes(e){return U`
      <div class="themes" role="radiogroup" aria-labelledby="theme-heading"
        @keydown=${t=>this._arrows(t,Tl,e.pair,e=>this._page.set({theme_pair:e},t))}>
        ${Tl.map(t=>{const s={...e,pair:t};return U`
            <button class="theme" type="button" role="radio" data-value=${t}
              aria-checked=${t===e.pair?"true":"false"}
              tabindex=${t===e.pair?"0":"-1"}
              @click=${e=>this._page.set({theme_pair:t},e)}>
              <span class="pic-pair halves">
                ${ec(Vt(s,"light"),"light")}
                <span class="pic-over">${ec(Vt(s,"dark"),"dark")}</span>
              </span>
              <span class="option-label">${Ol[t]}</span>
              <span class="badge" aria-hidden="true">✓</span>
            </button>
          `})}
      </div>
    `}_renderMotion(e){return U`
      <div class="seg" role="radiogroup" aria-labelledby="motion-heading"
        @keydown=${t=>this._arrows(t,Pl,e,e=>this._page.set({motion:e},t))}>
        ${Pl.map(t=>U`
          <button class="seg-btn" type="button" role="radio" data-value=${t}
            aria-checked=${t===e?"true":"false"}
            tabindex=${t===e?"0":"-1"}
            @click=${e=>this._page.set({motion:t},e)}>${Nl[t]}</button>
        `)}
      </div>
    `}_arrows(e,t,s,i){if("radio"!==e.target.getAttribute?.("role"))return;const a="ArrowRight"===e.key||"ArrowDown"===e.key?1:"ArrowLeft"===e.key||"ArrowUp"===e.key?-1:0;if(!a)return;e.preventDefault();const n=Math.max(0,t.indexOf(s)),r=t[(n+a+t.length)%t.length];i(r);const o=e.currentTarget;this.updateComplete.then(()=>o.querySelector(`[data-value='${r}']`)?.focus())}_time(e,t){const s=t.target.value.slice(0,5);/^([01]\d|2[0-3]):[0-5]\d$/.test(s)&&this._page.set("light_from"===e?{light_from:s}:{dark_from:s},t)}_customize(e){const t={tag:"pv-settings-customize",title:`Customize ${Ol[e]}`,back:"Appearance"};this.dispatchEvent(new CustomEvent(Fs,{detail:t,bubbles:!0,composed:!0}))}}tc.styles=[ot,ct,bs,r`
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
    `],e([ue({attribute:!1})],tc.prototype,"hass",void 0),e([ue({attribute:!1})],tc.prototype,"data",void 0),e([ue({attribute:!1})],tc.prototype,"household",void 0),e([ue({attribute:!1})],tc.prototype,"api",void 0),e([ue({type:String,reflect:!0})],tc.prototype,"layout",void 0),e([ue({type:String})],tc.prototype,"mode",void 0),e([ue({attribute:!1})],tc.prototype,"drafts",void 0),ge("pv-appearance-editor",tc);class sc extends de{constructor(){super(...arguments),this.household=null,this.layout="landscape",this.mode="settings",this.drafts=new Map}render(){return U`
      <pv-appearance-editor
        .hass=${this.hass}
        .data=${this.data}
        .household=${this.household}
        .api=${this.api}
        .layout=${this.layout}
        .drafts=${this.drafts}
        mode="settings"
      ></pv-appearance-editor>
    `}}sc.styles=r`
    :host {
      display: block;
    }
  `,e([ue({attribute:!1})],sc.prototype,"hass",void 0),e([ue({attribute:!1})],sc.prototype,"data",void 0),e([ue({attribute:!1})],sc.prototype,"household",void 0),e([ue({attribute:!1})],sc.prototype,"api",void 0),e([ue({type:String})],sc.prototype,"layout",void 0),e([ue({type:String})],sc.prototype,"mode",void 0),e([ue({attribute:!1})],sc.prototype,"drafts",void 0),ge("pv-settings-appearance",sc);class ic extends de{constructor(){super(...arguments),this.household=null,this.layout="landscape",this.session=null,this.sessionEndsAt=0,this.parent=null,this.drafts=new Map,this.services={},this.revision=0,this.target=null,this._selected=null,this._stack=[],this._toast="",this._back=async()=>{await this._mayLeave()&&(this._stack.length>0?this._stack=this._stack.slice(0,-1):this._selected=null)},this._done=async()=>{await this._mayLeave()&&this.dispatchEvent(new CustomEvent("pv-settings-close",{bubbles:!0,composed:!0}))},this._onPush=e=>{e.stopPropagation(),this._stack=[...this._stack,e.detail]},this._onPop=e=>{e.stopPropagation(),this._stack=this._stack.slice(0,-1)},this._onOpen=e=>{e.stopPropagation(),this._openTarget(e.detail)},this._onError=e=>{e.stopPropagation(),this._toast=e.detail.message,window.clearTimeout(this._toastTimer),this._toastTimer=window.setTimeout(()=>{this._toast=""},4e3)}}connectedCallback(){super.connectedCallback(),this.addEventListener(Fs,this._onPush),this.addEventListener(Es,this._onPop),this.addEventListener(Cs,this._onError),this.addEventListener(Ss,this._onOpen)}disconnectedCallback(){super.disconnectedCallback(),this.removeEventListener(Fs,this._onPush),this.removeEventListener(Es,this._onPop),this.removeEventListener(Cs,this._onError),this.removeEventListener(Ss,this._onOpen),window.clearTimeout(this._toastTimer)}willUpdate(e){if(e.has("target")&&this.target){const e=(t=ei.pages(this._context()),(s=this.target)&&t.some(e=>e.id===s.page)?{selected:s.page,stack:s.stack??[]}:{selected:null,stack:[]});this._selected=e.selected,this._stack=e.stack}var t,s}_context(){return{household:this.household,data:this.data,services:this.services,hass:this.hass}}get _split(){return"landscape"===this.layout}_current(e){return e.find(e=>e.id===this._selected)??(this._split?e[0]:void 0)}render(){const e=ei.pages(this._context()),t=this._current(e),s=this._stack[this._stack.length-1],i=!this._split&&t;return U`
      ${this.session?.parent&&this.parent?U`
        <pv-parent-strip .member=${this.parent} .hass=${this.hass} .endsAt=${this.sessionEndsAt}></pv-parent-strip>
      `:Y}
      <div class="bar">
        ${i?U`<button class="back" type="button" @click=${this._back}>‹ ${s?s.back:"Settings"}</button>`:U`<h1 class="title">Settings</h1>`}
        <button class="pv-btn pv-btn-primary done" type="button" @click=${this._done}>Done</button>
      </div>
      <div class="body">
        ${this._split||!t?this._renderList(e,t):Y}
        ${t?this._renderPage(t,s):Y}
      </div>
      ${this._toast?U`<div class="toast" role="status">${this._toast}</div>`:Y}
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
        ${function(e,t=Js){const s=new Set(t.map(e=>e.id)),i=[...new Set(e.map(e=>e.group).filter(e=>!s.has(e)))].map(e=>({id:e,label:null,order:1e3}));return[...t,...i].sort((e,t)=>e.order-t.order).map(t=>({group:t,pages:e.filter(e=>e.group===t.id)})).filter(e=>e.pages.length>0)}(e).map(({group:e,pages:i})=>U`
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
    `}_renderPage(e,t){const s=kl(t?t.tag:e.tag),i=t?t.title:e.label,a=[e.id,...this._stack.map(e=>`${e.tag}:${JSON.stringify(e.props??{})}`)].join("/");return U`
      <section class="page" aria-label=${i}>
        ${this._split&&t?U`<button class="back" type="button" @click=${this._back}>‹ ${t.back}</button>`:Y}
        <h1 class="page-heading">${i}</h1>
        ${this.household&&!this.household.available?U`<p class="banner">People and PINs can't be changed until PlanaVista is updated.</p>`:Y}
        ${rn(a,El`
          <${s}
            class="page-el"
            .hass=${this.hass}
            .data=${this.data}
            .household=${this.household}
            .api=${this.api}
            .layout=${this.layout}
            mode="settings"
            .pageProps=${t?.props??{}}
            .drafts=${this.drafts}
            .services=${this.services}
            .revision=${this.revision}
          ></${s}>
        `)}
      </section>
    `}async _mayLeave(){const e=this.renderRoot.querySelector(".page-el");return!e?.confirmLeave||e.confirmLeave()}async _select(e){e===this._selected&&0===this._stack.length||await this._mayLeave()&&(this._stack=[],this._selected=e)}async _look(e){await this._mayLeave()&&(this._selected=e.page,this._stack=e.stack??[])}async _openTarget(e){await this._mayLeave()&&this.dispatchEvent(new CustomEvent("pv-settings-open-target",{detail:e,bubbles:!0,composed:!0}))}}function ac(e,t){if(!e||!t.setup&&!t.modules)return e;const s={...e.modules};for(const[e,i]of Object.entries(t.modules??{}))s[e]={...s[e]??{},...i};return{...e,setup:{...e.setup,...t.setup??{}},modules:s}}ic.styles=[nt,ot,r`
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

      .look-row {
        align-items: flex-start;
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
        font-size: 0.9375rem;
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
    `],e([ue({attribute:!1})],ic.prototype,"hass",void 0),e([ue({attribute:!1})],ic.prototype,"data",void 0),e([ue({attribute:!1})],ic.prototype,"household",void 0),e([ue({attribute:!1})],ic.prototype,"api",void 0),e([ue({type:String,reflect:!0})],ic.prototype,"layout",void 0),e([ue({attribute:!1})],ic.prototype,"session",void 0),e([ue({type:Number})],ic.prototype,"sessionEndsAt",void 0),e([ue({attribute:!1})],ic.prototype,"parent",void 0),e([ue({attribute:!1})],ic.prototype,"drafts",void 0),e([ue({attribute:!1})],ic.prototype,"services",void 0),e([ue({type:Number})],ic.prototype,"revision",void 0),e([ue({attribute:!1})],ic.prototype,"target",void 0),e([me()],ic.prototype,"_selected",void 0),e([me()],ic.prototype,"_stack",void 0),e([me()],ic.prototype,"_toast",void 0),ge("pv-settings",ic);const nc=["#F94144","#277DA1","#43AA8B","#F9C74F"],rc=[["👥","Everyone who lives here","Each person gets a color, even kids without a Home Assistant account."],["📅","Your calendars","Each one belongs to someone, so the day reads at a glance."],["✓","Chores, if you want them","From your household plan, or a few common ones."]];class oc extends de{constructor(){super(...arguments),this.household=null}async secondary(){return await this.api.saveSetup({start:"restore"}),this.setupPatch={setup:{start:"restore"}},!0}async commit(){return"restore"===this.household?.setup.start&&(await this.api.saveSetup({start:null}),this.setupPatch={setup:{start:null}}),!0}render(){const e=2*Math.PI*30;return U`
      <div class="rings" aria-hidden="true">
        ${nc.map(t=>U`
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
        ${rc.map(([e,t,s])=>U`
          <li><span class="icon" aria-hidden="true">${e}</span><span><span class="title">${t}</span><span class="text">${s}</span></span></li>
        `)}
      </ul>
      <p class="note">About 5 minutes. Everything can change later in Settings.</p>
    `}}oc.styles=r`
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
  `,e([ue({attribute:!1})],oc.prototype,"api",void 0),e([ue({attribute:!1})],oc.prototype,"household",void 0),ge("pv-setup-welcome",oc);class lc extends de{constructor(){super(...arguments),this.household=null,this.layout="landscape",this.mode="setup",this._rows=[],this._name="",this._message="",this._built=!1,this._added=0,this._add=()=>{var e,t;this._name.trim()&&(this._rows=[...this._rows,(e=this._name,t=this._added++,{key:`new:${t}`,name:e.trim(),person:null,memberId:null,role:"adult",checked:!0})],this._name="")}}willUpdate(){if(!this._built&&this.hass&&this.household){const e=Object.values(this.hass.states).filter(e=>e.entity_id.startsWith("person.")).map(e=>({entity_id:e.entity_id,name:e.attributes.friendly_name??e.entity_id,user_id:e.attributes.user_id??null})).sort((e,t)=>e.name.localeCompare(t.name));this._rows=function(e,t,s){const i=e.map(e=>({key:e.id,name:e.name,person:e.person,memberId:e.id,role:Bs(e),checked:!0}));for(const a of t){if(e.some(e=>e.person===a.entity_id))continue;const t=!!s&&a.user_id===s;i.push({key:a.entity_id,name:a.name,person:a.entity_id,memberId:null,role:t?"parent":"adult",checked:!0})}return i}(this.household.members,e,this.hass.user?.id??null),this._built=!0}}async commit(){const e=this.household?.members??[],t=function(e,t){const s={add:[],update:[],remove:[]};for(const i of e){const e=i.memberId?t.find(e=>e.id===i.memberId):void 0;e?i.checked?i.role!==Bs(e)&&s.update.push({id:e.id,changes:Os(i.role)}):s.remove.push(e.id):i.checked&&i.name.trim()&&s.add.push({name:i.name.trim(),...Os(i.role),...i.person?{person:i.person}:{}})}return s}(this._rows,e);this._message="";try{for(const e of t.remove)await this.api.deleteMember(e);for(const{id:s,changes:i}of t.update){const t=e.find(e=>e.id===s);await this.api.saveMember(i,t?{id:s,rev:t.rev}:void 0)}for(const e of t.add)await this.api.saveMember(e);return!0}catch(e){return this._message=e?.message||Ds(fs(e)),!1}finally{this._built=!1,this.requestUpdate()}}render(){return U`
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
              ${Ps.map(t=>U`<option value=${t.id} ?selected=${e.role===t.id}>${t.label}</option>`)}
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
    `}_update(e,t){this._rows=this._rows.map((s,i)=>i===e?{...s,...t}:s)}}lc.styles=[nt,ot,ct,r`
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
    `],e([ue({attribute:!1})],lc.prototype,"hass",void 0),e([ue({attribute:!1})],lc.prototype,"data",void 0),e([ue({attribute:!1})],lc.prototype,"household",void 0),e([ue({attribute:!1})],lc.prototype,"api",void 0),e([ue({type:String})],lc.prototype,"layout",void 0),e([ue({type:String})],lc.prototype,"mode",void 0),e([me()],lc.prototype,"_rows",void 0),e([me()],lc.prototype,"_name",void 0),e([me()],lc.prototype,"_message",void 0),ge("pv-setup-people",lc);class dc extends de{constructor(){super(...arguments),this.household=null,this.layout="landscape",this.mode="setup",this.drafts=new Map}render(){return U`
      <pv-appearance-editor
        .hass=${this.hass}
        .data=${this.data}
        .household=${this.household}
        .api=${this.api}
        .layout=${this.layout}
        .drafts=${this.drafts}
        mode="setup"
      ></pv-appearance-editor>
    `}}function cc(e,t,s){const i={};return"12"===t?.time_format&&(i.time_format="12h"),"24"===t?.time_format&&(i.time_format="24h"),"monday"!==t?.first_weekday&&"sunday"!==t?.first_weekday||(i.first_day=t.first_weekday),!e.weather_entity&&s.length>0&&(i.weather_entity=[...s].sort()[0]),i}dc.styles=r`
    :host {
      display: block;
    }
  `,e([ue({attribute:!1})],dc.prototype,"hass",void 0),e([ue({attribute:!1})],dc.prototype,"data",void 0),e([ue({attribute:!1})],dc.prototype,"household",void 0),e([ue({attribute:!1})],dc.prototype,"api",void 0),e([ue({type:String})],dc.prototype,"layout",void 0),e([ue({type:String})],dc.prototype,"mode",void 0),e([ue({attribute:!1})],dc.prototype,"drafts",void 0),ge("pv-setup-look",dc);class pc extends de{constructor(){super(...arguments),this.household=null,this.layout="landscape",this.mode="setup",this.services={},this.revision=0,this._message=""}_parts(){return si.pages({household:this.household,data:this.data,services:this.services})}get primaryLabel(){return this._parts()[0]?.primary}get openModule(){return this._parts()[0]?.module}async commit(){this._message="";try{const e=Object.keys(this.hass.states).filter(e=>e.startsWith("weather.")),t=this.hass.locale;return await this.api.saveConfig({display:cc(this.data.display,t,e),onboarding_complete:!0}),await this.api.saveSetup({completed:!0,step:null}),!0}catch(e){return this._message=Ds(fs(e)),!1}}render(){const e=this._parts();return U`
      ${e.length?e.map(e=>{const t=kl(e.tag);return El`<${t} .hass=${this.hass} .household=${this.household} .services=${this.services}
          .revision=${this.revision} .layout=${this.layout}></${t}>`}):U`
        <ul>
          <li>Tap the gear to change anything later.</li>
          <li>On a shared screen, Settings asks for a parent's PIN.</li>
        </ul>
      `}
      ${this._message?U`<p class="message" role="alert">${this._message}</p>`:Y}
    `}}pc.styles=[nt,r`
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
    `],e([ue({attribute:!1})],pc.prototype,"hass",void 0),e([ue({attribute:!1})],pc.prototype,"data",void 0),e([ue({attribute:!1})],pc.prototype,"household",void 0),e([ue({attribute:!1})],pc.prototype,"api",void 0),e([ue({type:String})],pc.prototype,"layout",void 0),e([ue({type:String})],pc.prototype,"mode",void 0),e([ue({attribute:!1})],pc.prototype,"services",void 0),e([ue({type:Number})],pc.prototype,"revision",void 0),e([me()],pc.prototype,"_message",void 0),ge("pv-setup-done",pc);class hc extends de{constructor(){super(...arguments),this.household=null,this.layout="landscape",this.drafts=new Map,this.services={},this.revision=0,this.session=null,this.only=null,this.cancelLabel="",this._index=0,this._busy=!1,this._toast="",this._patch={},this._started=!1,this._onStepChange=e=>{e.stopPropagation(),this.requestUpdate()},this._next=async()=>{if(this._busy)return;const e=this._element,t=this._currentId();this._busy=!0;try{if(e?.commit&&!await e.commit())return;this._take(e),this._advance(e,t)}finally{this._busy=!1}},this._leave=async()=>{if(this._busy)return;const e=this._element;this._busy=!0;try{if(e?.secondary&&!await e.secondary())return}finally{this._busy=!1}this.dispatchEvent(new CustomEvent("pv-setup-cancel",{bubbles:!0,composed:!0}))},this._secondary=async()=>{if(this._busy)return;const e=this._element,t=this._currentId();this._busy=!0;try{if(e?.secondary&&!await e.secondary())return;this._take(e),this._advance(e,t)}finally{this._busy=!1}},this._skip=()=>{this._busy||this._advance(this._element,this._currentId())},this._back=()=>{0===this._index||this._busy||(this._index-=1,this._remember(this._steps()[this._index].id))}}connectedCallback(){super.connectedCallback(),this.addEventListener(Qs,this._onStepChange)}disconnectedCallback(){super.disconnectedCallback(),this.removeEventListener(Qs,this._onStepChange),window.clearTimeout(this._toastTimer)}willUpdate(){!this._started&&this.data&&(this.only&&(this._patch={setup:{start:null}}),this._index=this.only?0:function(e,t){const s=t?e.findIndex(e=>e.id===t):-1;return s>=0?s:0}(this._steps(),this.household?.setup.step??null),this._started=!0)}_context(){return{household:ac(this.household,this._patch),data:this.data,services:this.services}}_steps(){return e=ii.pages(this._context()),(t=this.only)?e.filter(e=>t.includes(e.id)):e;var e,t}get _element(){return this.renderRoot?.querySelector(".step-el")??null}_take(e){e?.setupPatch&&(this._patch=function(e,t){if(!t)return e;const s={...e.modules??{}};for(const[e,i]of Object.entries(t.modules??{}))s[e]={...s[e]??{},...i};return{setup:{...e.setup??{},...t.setup??{}},modules:s}}(this._patch,e.setupPatch))}render(){const e=this._steps();if(0===e.length)return Y;const t=Math.min(this._index,e.length-1),s=e[t],i=t===e.length-1,a=kl(s.tag),n=this._element,r=!!this.only,{label:o,ready:l}=function(e,t,{last:s,short:i}){const a=t&&t.step===e.id?t:null;return{label:a?.primaryLabel??(i&&s?e.finish:void 0)??e.primary??(s?"Finish":"Next"),ready:!1!==a?.ready}}(s,n?{step:n.dataset.step,primaryLabel:n.primaryLabel,ready:n.ready}:null,{last:i,short:r}),d=this._context(),c=0===t&&r&&!!this.cancelLabel,p=0===t&&!c,h=r?void 0:s.secondary;return U`
      <div class="top">
        <button class="back ${p?"hidden":""}" type="button"
          ?disabled=${p||this._busy}
          aria-hidden=${p?"true":"false"}
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
          ${rn(s.id,El`
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
          ${o}
        </button>
        ${h?U`
          <button class="second" type="button" ?disabled=${this._busy} @click=${this._secondary}>${h}</button>
        `:Y}
      </div>
      ${this._toast?U`<div class="toast" role="status">${this._toast}</div>`:Y}
    `}updated(){const e=this._element;e&&!e._hostSeen&&(e._hostSeen=!0,this.requestUpdate())}_currentId(){const e=this._steps();return e[Math.min(this._index,e.length-1)]?.id}_advance(e,t){const s=this._steps(),i=function(e,t){const s=Math.max(0,e.findIndex(e=>e.id===t));return s>=e.length-1?null:s+1}(s,t);if(null===i){const i=e?.openModule??s.find(e=>e.id===t)?.module;return void this.dispatchEvent(new CustomEvent("onboarding-complete",{detail:{module:i},bubbles:!0,composed:!0}))}this._index=i,this._remember(s[i].id)}_remember(e){this.only||this.api.saveSetup({step:e}).catch(e=>{this._toast=Ds(fs(e)),window.clearTimeout(this._toastTimer),this._toastTimer=window.setTimeout(()=>{this._toast=""},4e3)})}}hc.styles=[nt,ot,r`
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
        min-height: 44px;
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
    `],e([ue({attribute:!1})],hc.prototype,"hass",void 0),e([ue({attribute:!1})],hc.prototype,"data",void 0),e([ue({attribute:!1})],hc.prototype,"household",void 0),e([ue({attribute:!1})],hc.prototype,"api",void 0),e([ue({type:String,reflect:!0})],hc.prototype,"layout",void 0),e([ue({attribute:!1})],hc.prototype,"drafts",void 0),e([ue({attribute:!1})],hc.prototype,"services",void 0),e([ue({type:Number})],hc.prototype,"revision",void 0),e([ue({attribute:!1})],hc.prototype,"pinGate",void 0),e([ue({attribute:!1})],hc.prototype,"session",void 0),e([ue({attribute:!1})],hc.prototype,"only",void 0),e([ue({type:String})],hc.prototype,"cancelLabel",void 0),e([me()],hc.prototype,"_index",void 0),e([me()],hc.prototype,"_busy",void 0),e([me()],hc.prototype,"_toast",void 0),e([me()],hc.prototype,"_patch",void 0),ge("pv-setup",hc);const uc="sensor.planavista_config";class mc extends de{constructor(){super(),this._wizardOpen=!1,this._onboardingDone=!1,this._settingsOpen=!1,this._settingsTarget=null,this._flow=null,this._sheet=null,this._sheetOpener=null,this._drafts=new Map,this._settingsVia=null,this._views={},this._moduleId=null,this._openTarget=null,this._serviceRevision=0,this._household=new vd(this),this._session=new xd(this,()=>this._api),this._layout=new fd(this),this._forecast=new gd(this,()=>this._display().weather_entity),this._appearanceEdits=new Sl(()=>this.requestUpdate()),this._moduleOverlay=!1,this._appearance=new cd(this,this._appearanceEdits,()=>({display:this.hass?.states?.[this._entityId()]?.attributes?.display,cardTheme:this._config?.theme,sun:Dl(this.hass?.states),haDark:!!this.hass?.themes?.darkMode,overlayOpen:!!this._sheet||this._settingsOpen||this._wizardOpen||!!this._flow||this._moduleOverlay}),async()=>{await this.updateComplete,await(this.renderRoot.querySelector(".pv-module")?.updateComplete)}),this._api=new ks({callWS:e=>this.hass.callWS(e)},()=>this._session.token,e=>this._session.ended(e)),this._services={},this._pinGate={ask:(e,t)=>new Promise(s=>{0===e.length||this._sheet?s(!1):(this._sheetOpener=this.renderRoot?.activeElement??null,this._sheet={kind:"pin",purpose:"module",heading:t,members:e,resolve:s})})},this._dataFor=vt((e,t)=>this.hass?function(e,t="sensor.planavista_config"){const s=e.states[t];if(!s)return null;const i=s.attributes,a=i.events||[];return{calendars:i.calendars||[],events:a,display:i.display||{time_format:"12h",weather_entity:"",first_day:"sunday",default_view:"day",theme:"light"},onboarding_complete:i.onboarding_complete,version:i.version}}(this.hass,t):null),this._displayFor=vt((e,t)=>function(e,t){const s=t?.display;return{time_format:e?.time_format||s?.time_format||"12h",weather_entity:e?.weather_entity||s?.weather_entity||"",first_day:e?.first_day||s?.first_day||"sunday",default_view:e?.default_view||e?.view||s?.default_view||"week",theme:e?.theme||s?.theme||"light",theme_overrides:s?.theme_overrides,location_autocomplete:!0===s?.location_autocomplete}}(e,t)),this._modulesFor=vt((e,t,s)=>function(e,t,s={config:void 0,data:null}){const i=e.filter(e=>!e.enabled||e.enabled(s));let a=i;if(Array.isArray(t.modules)){const e=[];for(const s of t.modules){const t="string"==typeof s?i.find(e=>e.id===s):void 0;t&&!e.includes(t)&&e.push(t)}e.length>0&&(a=e)}const n="string"==typeof t.module?a.find(e=>e.id===t.module):void 0;return{shown:a,initial:n??a[0]}}(Gs.list(),e??{},{config:e,data:null,household:this._household.view})),this._drafts.set("appearance",this._appearanceEdits);for(const e of Gs.list())e.service&&(this._services[e.id]=e.service(this))}get householdView(){return this._household.view}get pinSession(){return this._session.session}get planavistaData(){return this._data()}sessionEnded(e){this._session.ended(e)}serviceChanged(){this._serviceRevision++}shouldUpdate(e){if(1===e.size&&e.has("hass")){const t=e.get("hass"),s=e=>!!e?.themes?.darkMode;return!(!Al(this._appearance.settings).haDarkMode||s(t)===s(this.hass))||function(e,t,s){return e&&t?s.some(s=>e.states[s]!==t.states[s]):e!==t}(t,this.hass,this._watchedEntityIds())}return!0}_entityId(){return this._config?.entity||uc}_data(){const e=this._entityId();return this._dataFor(this.hass?.states?.[e],e)}_display(){return this._displayFor(this._config,this._data())}_modules(){const e=this._household.view;return this._modulesFor(this._config,e?.modules,!!e?.available)}_ctx(){return{config:this._config,data:this._data(),household:this._household.view}}_glanceChips(){const e=this._ctx();return Object.values(this._services).flatMap(t=>t.glance?.(e)??[])}_open(e){const t=this._modules().shown.find(t=>t.id===e.module);t&&(this._moduleId=t.id,e.view&&t.views.some(t=>t.id===e.view)&&(this._views={...this._views,[t.id]:e.view}),this._openTarget={...e})}_moduleAction(e){this.renderRoot.querySelector(".pv-module")?.moduleAction?.(e)}_watchedEntityIds(){const e=this._data(),t=[this._entityId(),...Al(this._appearance.settings).entities],s=this._display().weather_entity;s&&t.push(s);for(const s of this._modules().shown)t.push(...s.watchedEntities({config:this._config,data:e}));return t}setConfig(e){this._config={entity:uc,...e},this._views={},this._moduleId=null}_activeModule(){const e=this._modules();return e.shown.find(e=>e.id===this._moduleId)??e.initial}willUpdate(e){super.willUpdate(e);const t=this._activeModule(),s=this._data();t&&s&&!(t.id in this._views)&&(this._views={...this._views,[t.id]:Ys(t,{config:this._config,data:s})})}_setView(e){const t=this._activeModule();t&&this._views[t.id]!==e&&(this._views={...this._views,[t.id]:e})}connectedCallback(){super.connectedCallback(),function(e=document,t=import.meta.url){if(e.getElementById(td))return;const s=e.createElement("style");s.id=td,s.textContent=`@font-face{font-family:'PlanaVista Rounded';src:url('${function(e){const t=new URL(e),s=new URL("fonts/nunito-latin-wght.woff2",t);return s.search=t.search,s.href}(t)}') format('woff2');font-weight:200 1000;font-style:normal;font-display:swap}`,e.head.appendChild(s)}()}updated(e){super.updated(e),this._guardSettings(),this._guardSetup()}_onOnboardingComplete(e){this._wizardOpen=!1,this._onboardingDone=!0;const t=e?.detail?.module;t&&(this._moduleId=t)}_access(){const e=!!this.hass?.user?.is_admin;return this._household.ready?Ls(this._household.view,e):e?"open":"none"}_openSettings(e){this._sheetOpener=e?.composedPath?.()[0]??null;const t=e?.detail;this._settingsTarget=t&&"string"==typeof t.page?t:null;const s=this._access();"open"===s||this._session.session?.parent?(this._settingsVia="open"===s?"access":"session",this._settingsOpen=!0):"pin"===s?this._sheet={kind:"pin",purpose:"settings",heading:"Who's opening Settings?"}:"no_pin"===s&&(this._sheet={kind:"no_pin"})}_beginSetup(e){this._sheetOpener=e?.composedPath?.()[0]??null,"open"===this._access()||this._session.session?.parent?this._wizardOpen=!0:"pin"===this._access()&&(this._sheet={kind:"pin",purpose:"setup",heading:"Who's setting up PlanaVista?"})}_renderSetupCard(){const e=this._access(),t=U`
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
    `}_onUnlocked(e){const t=this._sheet;this._session.unlocked(e.detail.result),this._closeSheet(),"pin"!==t?.kind||"module"!==t.purpose?("pin"!==t?.kind||"settings"!==t.purpose&&"continue"!==t.purpose||(this._settingsVia="session",this._settingsOpen=!0),"pin"===t?.kind&&"setup"===t.purpose&&(this._wizardOpen=!0)):t.resolve(!!this._session.session)}_onSheetCancel(){const e=this._sheet;this._closeSheet(),"pin"===e?.kind&&"settings"===e.purpose&&(this._settingsTarget=null),"pin"===e?.kind&&"module"===e.purpose&&e.resolve(!1),"pin"===e?.kind&&"continue"===e.purpose&&this._onSettingsClose(),"pin"===e?.kind&&"keep_setup"===e.purpose&&(this._wizardOpen=!1,this._flow=null)}_guardSettings(){if(!this._settingsOpen||this._session.session?.parent||this._sheet)return;const e=this._access();"open"!==e&&("access"!==this._settingsVia||"pin"!==e?this._onSettingsClose():this._sheet={kind:"pin",purpose:"continue",heading:"Enter a parent's PIN to keep changing settings"})}_guardSetup(){var e;(this._wizardOpen||this._flow)&&!this._sheet&&this._household.ready&&(e=this._household.view,this._session.session?.parent||"pin"!==Ls(e,!1)||(this._sheet={kind:"pin",purpose:"keep_setup",heading:"Enter a parent's PIN to keep setting up"}))}_closeSheet(){this._sheet=null;const e=this._sheetOpener;this._sheetOpener=null,e?.focus?.()}_renderSheet(){const e=this._sheet;if(!e)return Y;const t=this._layout.layout;if("no_pin"===e.kind)return U`
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
        .members=${"module"===e.purpose?e.members:s?Is(s.members):[]}
        .heading=${e.heading}
        .shuffle=${!!s?.security.shuffle_keypad}
        @pv-unlocked=${this._onUnlocked}
        @pv-sheet-close=${this._onSheetCancel}
      ></pv-pin-sheet>
    `}_renderParentStrip(){const e=this._session.session;if(!e?.parent)return Y;const t=this._household.view?.members.find(t=>t.id===e.memberId);if(!t)return Y;const s=this._activeModule(),i=s?this._services[s.id]?.stripActions?.(this._ctx())??[]:[];return U`
      <pv-parent-strip
        .member=${t}
        .hass=${this.hass}
        .endsAt=${this._session.endsAt??0}
        .actions=${i}
        @pv-lock=${()=>this._session.lock()}
        @pv-strip-action=${e=>this._moduleAction(e.detail.id)}
      ></pv-parent-strip>
    `}_onSettingsClose(){this._settingsOpen=!1,this._settingsVia=null,this._settingsTarget=null}_onRunSetup(e){e.stopPropagation(),this._flow=[...e.detail.steps],this._flowCancel=e.detail.cancel,this._settingsOpen=!1,this._settingsTarget=null}_onFlowComplete(e){e.stopPropagation(),this._flow=null,this._flowCancel=void 0,e.detail?.module&&(this._moduleId=e.detail.module)}async _onFlowCancel(){const e=this._flowCancel;this._flow=null,this._flowCancel=void 0;try{await(e?.())}catch{}this._openSettings(new CustomEvent("pv-open-settings",{detail:{page:"chores-off"}}))}_onSettingsLock(){this._session.lock(),"open"!==this._access()&&this._onSettingsClose()}_getWeatherEntity(){const e=this._display().weather_entity;return e?this.hass?.states?.[e]:null}render(){if(!this._config||!this.hass)return Y;const e=this._data();if(!e)return U`
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
              .parent=${this._household.view?.members.find(e=>e.id===this._session.session?.memberId)??null}
              .drafts=${this._drafts}
              .services=${this._services}
              .revision=${this._serviceRevision}
              .target=${this._settingsTarget}
              @pv-settings-close=${this._onSettingsClose}
              @pv-run-setup=${this._onRunSetup}
              @pv-settings-open-target=${e=>{this._onSettingsClose(),this._open(e.detail)}}
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
      </ha-card>
    `}_renderModule(e,t,s){const i=kl(e.tag);return El`
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
        @pv-open=${e=>this._open(e.detail)}
        @pv-open-settings=${this._openSettings}
      ></${i}>
    `}_renderHeader(e){const t=this._config?.hide_weather?null:this._getWeatherEntity();return U`
      <pv-glance-header
        layout=${this._layout.layout}
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
    `}static getConfigElement(){return document.createElement("planavista-calendar-card-editor")}static getStubConfig(){return{entity:uc}}getCardSize(){return 10}}var vc;mc.styles=[nt,ot,rt,ht,r`
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

    `],e([ue({attribute:!1})],mc.prototype,"hass",void 0),e([me()],mc.prototype,"_config",void 0),e([me()],mc.prototype,"_wizardOpen",void 0),e([me()],mc.prototype,"_onboardingDone",void 0),e([me()],mc.prototype,"_settingsOpen",void 0),e([me()],mc.prototype,"_settingsTarget",void 0),e([me()],mc.prototype,"_flow",void 0),e([me()],mc.prototype,"_sheet",void 0),e([me()],mc.prototype,"_views",void 0),e([me()],mc.prototype,"_moduleId",void 0),e([me()],mc.prototype,"_openTarget",void 0),e([me()],mc.prototype,"_serviceRevision",void 0),e([me()],mc.prototype,"_moduleOverlay",void 0),function(e=ei,t=ii){for(const t of ud)e.register(t);for(const e of md)t.register(e)}(),ge("planavista-calendar-card",mc),vc=mc,be(()=>ye("planavista-card",class extends(customElements.get("planavista-calendar-card")??vc){}));const gc=["planavista-calendar-card","planavista-card"];var bc;window.customCards=window.customCards||[],(bc=window.customCards).some(e=>gc.includes(e.type))||bc.push({type:"planavista-card",name:"PlanaVista",description:"Your family's calendar and chores, together on one screen.",preview:!0}),console.info(`%c PLANAVISTA %c v${pd} `,"color: white; background: #6366F1; font-weight: bold; border-radius: 4px 0 0 4px; padding: 2px 6px;","color: #6366F1; background: #EEF2FF; font-weight: bold; border-radius: 0 4px 4px 0; padding: 2px 6px;");
