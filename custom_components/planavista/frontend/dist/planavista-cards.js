function e(e,t,i,r){var a,s=arguments.length,n=s<3?t:null===r?r=Object.getOwnPropertyDescriptor(t,i):r;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)n=Reflect.decorate(e,t,i,r);else for(var o=e.length-1;o>=0;o--)(a=e[o])&&(n=(s<3?a(n):s>3?a(t,i,n):a(t,i))||n);return s>3&&n&&Object.defineProperty(t,i,n),n}"function"==typeof SuppressedError&&SuppressedError;const t=globalThis,i=t.ShadowRoot&&(void 0===t.ShadyCSS||t.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,r=Symbol(),a=new WeakMap;let s=class{constructor(e,t,i){if(this._$cssResult$=!0,i!==r)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=e,this.t=t}get styleSheet(){let e=this.o;const t=this.t;if(i&&void 0===e){const i=void 0!==t&&1===t.length;i&&(e=a.get(t)),void 0===e&&((this.o=e=new CSSStyleSheet).replaceSync(this.cssText),i&&a.set(t,e))}return e}toString(){return this.cssText}};const n=(e,...t)=>{const i=1===e.length?e[0]:t.reduce((t,i,r)=>t+(e=>{if(!0===e._$cssResult$)return e.cssText;if("number"==typeof e)return e;throw Error("Value passed to 'css' function must be a 'css' function result: "+e+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(i)+e[r+1],e[0]);return new s(i,e,r)},o=i?e=>e:e=>e instanceof CSSStyleSheet?(e=>{let t="";for(const i of e.cssRules)t+=i.cssText;return(e=>new s("string"==typeof e?e:e+"",void 0,r))(t)})(e):e,{is:l,defineProperty:d,getOwnPropertyDescriptor:c,getOwnPropertyNames:p,getOwnPropertySymbols:h,getPrototypeOf:v}=Object,g=globalThis,m=g.trustedTypes,u=m?m.emptyScript:"",b=g.reactiveElementPolyfillSupport,y=(e,t)=>e,f={toAttribute(e,t){switch(t){case Boolean:e=e?u:null;break;case Object:case Array:e=null==e?e:JSON.stringify(e)}return e},fromAttribute(e,t){let i=e;switch(t){case Boolean:i=null!==e;break;case Number:i=null===e?null:Number(e);break;case Object:case Array:try{i=JSON.parse(e)}catch(e){i=null}}return i}},x=(e,t)=>!l(e,t),w={attribute:!0,type:String,converter:f,reflect:!1,useDefault:!1,hasChanged:x};Symbol.metadata??=Symbol("metadata"),g.litPropertyMetadata??=new WeakMap;let _=class extends HTMLElement{static addInitializer(e){this._$Ei(),(this.l??=[]).push(e)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(e,t=w){if(t.state&&(t.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(e)&&((t=Object.create(t)).wrapped=!0),this.elementProperties.set(e,t),!t.noAccessor){const i=Symbol(),r=this.getPropertyDescriptor(e,i,t);void 0!==r&&d(this.prototype,e,r)}}static getPropertyDescriptor(e,t,i){const{get:r,set:a}=c(this.prototype,e)??{get(){return this[t]},set(e){this[t]=e}};return{get:r,set(t){const s=r?.call(this);a?.call(this,t),this.requestUpdate(e,s,i)},configurable:!0,enumerable:!0}}static getPropertyOptions(e){return this.elementProperties.get(e)??w}static _$Ei(){if(this.hasOwnProperty(y("elementProperties")))return;const e=v(this);e.finalize(),void 0!==e.l&&(this.l=[...e.l]),this.elementProperties=new Map(e.elementProperties)}static finalize(){if(this.hasOwnProperty(y("finalized")))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(y("properties"))){const e=this.properties,t=[...p(e),...h(e)];for(const i of t)this.createProperty(i,e[i])}const e=this[Symbol.metadata];if(null!==e){const t=litPropertyMetadata.get(e);if(void 0!==t)for(const[e,i]of t)this.elementProperties.set(e,i)}this._$Eh=new Map;for(const[e,t]of this.elementProperties){const i=this._$Eu(e,t);void 0!==i&&this._$Eh.set(i,e)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(e){const t=[];if(Array.isArray(e)){const i=new Set(e.flat(1/0).reverse());for(const e of i)t.unshift(o(e))}else void 0!==e&&t.push(o(e));return t}static _$Eu(e,t){const i=t.attribute;return!1===i?void 0:"string"==typeof i?i:"string"==typeof e?e.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){this._$ES=new Promise(e=>this.enableUpdating=e),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach(e=>e(this))}addController(e){(this._$EO??=new Set).add(e),void 0!==this.renderRoot&&this.isConnected&&e.hostConnected?.()}removeController(e){this._$EO?.delete(e)}_$E_(){const e=new Map,t=this.constructor.elementProperties;for(const i of t.keys())this.hasOwnProperty(i)&&(e.set(i,this[i]),delete this[i]);e.size>0&&(this._$Ep=e)}createRenderRoot(){const e=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return((e,r)=>{if(i)e.adoptedStyleSheets=r.map(e=>e instanceof CSSStyleSheet?e:e.styleSheet);else for(const i of r){const r=document.createElement("style"),a=t.litNonce;void 0!==a&&r.setAttribute("nonce",a),r.textContent=i.cssText,e.appendChild(r)}})(e,this.constructor.elementStyles),e}connectedCallback(){this.renderRoot??=this.createRenderRoot(),this.enableUpdating(!0),this._$EO?.forEach(e=>e.hostConnected?.())}enableUpdating(e){}disconnectedCallback(){this._$EO?.forEach(e=>e.hostDisconnected?.())}attributeChangedCallback(e,t,i){this._$AK(e,i)}_$ET(e,t){const i=this.constructor.elementProperties.get(e),r=this.constructor._$Eu(e,i);if(void 0!==r&&!0===i.reflect){const a=(void 0!==i.converter?.toAttribute?i.converter:f).toAttribute(t,i.type);this._$Em=e,null==a?this.removeAttribute(r):this.setAttribute(r,a),this._$Em=null}}_$AK(e,t){const i=this.constructor,r=i._$Eh.get(e);if(void 0!==r&&this._$Em!==r){const e=i.getPropertyOptions(r),a="function"==typeof e.converter?{fromAttribute:e.converter}:void 0!==e.converter?.fromAttribute?e.converter:f;this._$Em=r;const s=a.fromAttribute(t,e.type);this[r]=s??this._$Ej?.get(r)??s,this._$Em=null}}requestUpdate(e,t,i,r=!1,a){if(void 0!==e){const s=this.constructor;if(!1===r&&(a=this[e]),i??=s.getPropertyOptions(e),!((i.hasChanged??x)(a,t)||i.useDefault&&i.reflect&&a===this._$Ej?.get(e)&&!this.hasAttribute(s._$Eu(e,i))))return;this.C(e,t,i)}!1===this.isUpdatePending&&(this._$ES=this._$EP())}C(e,t,{useDefault:i,reflect:r,wrapped:a},s){i&&!(this._$Ej??=new Map).has(e)&&(this._$Ej.set(e,s??t??this[e]),!0!==a||void 0!==s)||(this._$AL.has(e)||(this.hasUpdated||i||(t=void 0),this._$AL.set(e,t)),!0===r&&this._$Em!==e&&(this._$Eq??=new Set).add(e))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(e){Promise.reject(e)}const e=this.scheduleUpdate();return null!=e&&await e,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??=this.createRenderRoot(),this._$Ep){for(const[e,t]of this._$Ep)this[e]=t;this._$Ep=void 0}const e=this.constructor.elementProperties;if(e.size>0)for(const[t,i]of e){const{wrapped:e}=i,r=this[t];!0!==e||this._$AL.has(t)||void 0===r||this.C(t,void 0,i,r)}}let e=!1;const t=this._$AL;try{e=this.shouldUpdate(t),e?(this.willUpdate(t),this._$EO?.forEach(e=>e.hostUpdate?.()),this.update(t)):this._$EM()}catch(t){throw e=!1,this._$EM(),t}e&&this._$AE(t)}willUpdate(e){}_$AE(e){this._$EO?.forEach(e=>e.hostUpdated?.()),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(e)),this.updated(e)}_$EM(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(e){return!0}update(e){this._$Eq&&=this._$Eq.forEach(e=>this._$ET(e,this[e])),this._$EM()}updated(e){}firstUpdated(e){}};_.elementStyles=[],_.shadowRootOptions={mode:"open"},_[y("elementProperties")]=new Map,_[y("finalized")]=new Map,b?.({ReactiveElement:_}),(g.reactiveElementVersions??=[]).push("2.1.2");const $=globalThis,k=e=>e,F=$.trustedTypes,C=F?F.createPolicy("lit-html",{createHTML:e=>e}):void 0,E="$lit$",D=`lit$${Math.random().toFixed(9).slice(2)}$`,z="?"+D,S=`<${z}>`,A=document,M=()=>A.createComment(""),B=e=>null===e||"object"!=typeof e&&"function"!=typeof e,T=Array.isArray,O="[ \t\n\f\r]",P=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,L=/-->/g,H=/>/g,I=RegExp(`>|${O}(?:([^\\s"'>=/]+)(${O}*=${O}*(?:[^ \t\n\f\r"'\`<>=]|("|')|))|$)`,"g"),j=/'/g,U=/"/g,V=/^(?:script|style|textarea|title)$/i,N=(e,...t)=>({_$litType$:1,strings:e,values:t}),R=Symbol.for("lit-noChange"),W=Symbol.for("lit-nothing"),Y=new WeakMap,q=A.createTreeWalker(A,129);function X(e,t){if(!T(e)||!e.hasOwnProperty("raw"))throw Error("invalid template strings array");return void 0!==C?C.createHTML(t):t}const Q=(e,t)=>{const i=e.length-1,r=[];let a,s=2===t?"<svg>":3===t?"<math>":"",n=P;for(let t=0;t<i;t++){const i=e[t];let o,l,d=-1,c=0;for(;c<i.length&&(n.lastIndex=c,l=n.exec(i),null!==l);)c=n.lastIndex,n===P?"!--"===l[1]?n=L:void 0!==l[1]?n=H:void 0!==l[2]?(V.test(l[2])&&(a=RegExp("</"+l[2],"g")),n=I):void 0!==l[3]&&(n=I):n===I?">"===l[0]?(n=a??P,d=-1):void 0===l[1]?d=-2:(d=n.lastIndex-l[2].length,o=l[1],n=void 0===l[3]?I:'"'===l[3]?U:j):n===U||n===j?n=I:n===L||n===H?n=P:(n=I,a=void 0);const p=n===I&&e[t+1].startsWith("/>")?" ":"";s+=n===P?i+S:d>=0?(r.push(o),i.slice(0,d)+E+i.slice(d)+D+p):i+D+(-2===d?t:p)}return[X(e,s+(e[i]||"<?>")+(2===t?"</svg>":3===t?"</math>":"")),r]};class Z{constructor({strings:e,_$litType$:t},i){let r;this.parts=[];let a=0,s=0;const n=e.length-1,o=this.parts,[l,d]=Q(e,t);if(this.el=Z.createElement(l,i),q.currentNode=this.el.content,2===t||3===t){const e=this.el.content.firstChild;e.replaceWith(...e.childNodes)}for(;null!==(r=q.nextNode())&&o.length<n;){if(1===r.nodeType){if(r.hasAttributes())for(const e of r.getAttributeNames())if(e.endsWith(E)){const t=d[s++],i=r.getAttribute(e).split(D),n=/([.?@])?(.*)/.exec(t);o.push({type:1,index:a,name:n[2],strings:i,ctor:"."===n[1]?te:"?"===n[1]?ie:"@"===n[1]?re:ee}),r.removeAttribute(e)}else e.startsWith(D)&&(o.push({type:6,index:a}),r.removeAttribute(e));if(V.test(r.tagName)){const e=r.textContent.split(D),t=e.length-1;if(t>0){r.textContent=F?F.emptyScript:"";for(let i=0;i<t;i++)r.append(e[i],M()),q.nextNode(),o.push({type:2,index:++a});r.append(e[t],M())}}}else if(8===r.nodeType)if(r.data===z)o.push({type:2,index:a});else{let e=-1;for(;-1!==(e=r.data.indexOf(D,e+1));)o.push({type:7,index:a}),e+=D.length-1}a++}}static createElement(e,t){const i=A.createElement("template");return i.innerHTML=e,i}}function K(e,t,i=e,r){if(t===R)return t;let a=void 0!==r?i._$Co?.[r]:i._$Cl;const s=B(t)?void 0:t._$litDirective$;return a?.constructor!==s&&(a?._$AO?.(!1),void 0===s?a=void 0:(a=new s(e),a._$AT(e,i,r)),void 0!==r?(i._$Co??=[])[r]=a:i._$Cl=a),void 0!==a&&(t=K(e,a._$AS(e,t.values),a,r)),t}class G{constructor(e,t){this._$AV=[],this._$AN=void 0,this._$AD=e,this._$AM=t}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(e){const{el:{content:t},parts:i}=this._$AD,r=(e?.creationScope??A).importNode(t,!0);q.currentNode=r;let a=q.nextNode(),s=0,n=0,o=i[0];for(;void 0!==o;){if(s===o.index){let t;2===o.type?t=new J(a,a.nextSibling,this,e):1===o.type?t=new o.ctor(a,o.name,o.strings,this,e):6===o.type&&(t=new ae(a,this,e)),this._$AV.push(t),o=i[++n]}s!==o?.index&&(a=q.nextNode(),s++)}return q.currentNode=A,r}p(e){let t=0;for(const i of this._$AV)void 0!==i&&(void 0!==i.strings?(i._$AI(e,i,t),t+=i.strings.length-2):i._$AI(e[t])),t++}}class J{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(e,t,i,r){this.type=2,this._$AH=W,this._$AN=void 0,this._$AA=e,this._$AB=t,this._$AM=i,this.options=r,this._$Cv=r?.isConnected??!0}get parentNode(){let e=this._$AA.parentNode;const t=this._$AM;return void 0!==t&&11===e?.nodeType&&(e=t.parentNode),e}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(e,t=this){e=K(this,e,t),B(e)?e===W||null==e||""===e?(this._$AH!==W&&this._$AR(),this._$AH=W):e!==this._$AH&&e!==R&&this._(e):void 0!==e._$litType$?this.$(e):void 0!==e.nodeType?this.T(e):(e=>T(e)||"function"==typeof e?.[Symbol.iterator])(e)?this.k(e):this._(e)}O(e){return this._$AA.parentNode.insertBefore(e,this._$AB)}T(e){this._$AH!==e&&(this._$AR(),this._$AH=this.O(e))}_(e){this._$AH!==W&&B(this._$AH)?this._$AA.nextSibling.data=e:this.T(A.createTextNode(e)),this._$AH=e}$(e){const{values:t,_$litType$:i}=e,r="number"==typeof i?this._$AC(e):(void 0===i.el&&(i.el=Z.createElement(X(i.h,i.h[0]),this.options)),i);if(this._$AH?._$AD===r)this._$AH.p(t);else{const e=new G(r,this),i=e.u(this.options);e.p(t),this.T(i),this._$AH=e}}_$AC(e){let t=Y.get(e.strings);return void 0===t&&Y.set(e.strings,t=new Z(e)),t}k(e){T(this._$AH)||(this._$AH=[],this._$AR());const t=this._$AH;let i,r=0;for(const a of e)r===t.length?t.push(i=new J(this.O(M()),this.O(M()),this,this.options)):i=t[r],i._$AI(a),r++;r<t.length&&(this._$AR(i&&i._$AB.nextSibling,r),t.length=r)}_$AR(e=this._$AA.nextSibling,t){for(this._$AP?.(!1,!0,t);e!==this._$AB;){const t=k(e).nextSibling;k(e).remove(),e=t}}setConnected(e){void 0===this._$AM&&(this._$Cv=e,this._$AP?.(e))}}class ee{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(e,t,i,r,a){this.type=1,this._$AH=W,this._$AN=void 0,this.element=e,this.name=t,this._$AM=r,this.options=a,i.length>2||""!==i[0]||""!==i[1]?(this._$AH=Array(i.length-1).fill(new String),this.strings=i):this._$AH=W}_$AI(e,t=this,i,r){const a=this.strings;let s=!1;if(void 0===a)e=K(this,e,t,0),s=!B(e)||e!==this._$AH&&e!==R,s&&(this._$AH=e);else{const r=e;let n,o;for(e=a[0],n=0;n<a.length-1;n++)o=K(this,r[i+n],t,n),o===R&&(o=this._$AH[n]),s||=!B(o)||o!==this._$AH[n],o===W?e=W:e!==W&&(e+=(o??"")+a[n+1]),this._$AH[n]=o}s&&!r&&this.j(e)}j(e){e===W?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,e??"")}}class te extends ee{constructor(){super(...arguments),this.type=3}j(e){this.element[this.name]=e===W?void 0:e}}class ie extends ee{constructor(){super(...arguments),this.type=4}j(e){this.element.toggleAttribute(this.name,!!e&&e!==W)}}class re extends ee{constructor(e,t,i,r,a){super(e,t,i,r,a),this.type=5}_$AI(e,t=this){if((e=K(this,e,t,0)??W)===R)return;const i=this._$AH,r=e===W&&i!==W||e.capture!==i.capture||e.once!==i.once||e.passive!==i.passive,a=e!==W&&(i===W||r);r&&this.element.removeEventListener(this.name,this,i),a&&this.element.addEventListener(this.name,this,e),this._$AH=e}handleEvent(e){"function"==typeof this._$AH?this._$AH.call(this.options?.host??this.element,e):this._$AH.handleEvent(e)}}class ae{constructor(e,t,i){this.element=e,this.type=6,this._$AN=void 0,this._$AM=t,this.options=i}get _$AU(){return this._$AM._$AU}_$AI(e){K(this,e)}}const se=$.litHtmlPolyfillSupport;se?.(Z,J),($.litHtmlVersions??=[]).push("3.3.2");const ne=globalThis;class oe extends _{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){const e=super.createRenderRoot();return this.renderOptions.renderBefore??=e.firstChild,e}update(e){const t=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(e),this._$Do=((e,t,i)=>{const r=i?.renderBefore??t;let a=r._$litPart$;if(void 0===a){const e=i?.renderBefore??null;r._$litPart$=a=new J(t.insertBefore(M(),e),e,void 0,i??{})}return a._$AI(e),a})(t,this.renderRoot,this.renderOptions)}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(!0)}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(!1)}render(){return R}}oe._$litElement$=!0,oe.finalized=!0,ne.litElementHydrateSupport?.({LitElement:oe});const le=ne.litElementPolyfillSupport;le?.({LitElement:oe}),(ne.litElementVersions??=[]).push("4.2.2");const de=e=>(t,i)=>{void 0!==i?i.addInitializer(()=>{customElements.define(e,t)}):customElements.define(e,t)},ce={attribute:!0,type:String,converter:f,reflect:!1,hasChanged:x},pe=(e=ce,t,i)=>{const{kind:r,metadata:a}=i;let s=globalThis.litPropertyMetadata.get(a);if(void 0===s&&globalThis.litPropertyMetadata.set(a,s=new Map),"setter"===r&&((e=Object.create(e)).wrapped=!0),s.set(i.name,e),"accessor"===r){const{name:r}=i;return{set(i){const a=t.get.call(this);t.set.call(this,i),this.requestUpdate(r,a,e,!0,i)},init(t){return void 0!==t&&this.C(r,void 0,e,t),t}}}if("setter"===r){const{name:r}=i;return function(i){const a=this[r];t.call(this,i),this.requestUpdate(r,a,e,!0,i)}}throw Error("Unsupported decorator location: "+r)};function he(e){return(t,i)=>"object"==typeof i?pe(e,t,i):((e,t,i)=>{const r=t.hasOwnProperty(i);return t.constructor.createProperty(i,e),r?Object.getOwnPropertyDescriptor(t,i):void 0})(e,t,i)}function ve(e){return he({...e,state:!0,attribute:!1})}function ge(e,t){return(t,i,r)=>((e,t,i)=>(i.configurable=!0,i.enumerable=!0,Reflect.decorate&&"object"!=typeof t&&Object.defineProperty(e,t,i),i))(t,i,{get(){return(t=>t.renderRoot?.querySelector(e)??null)(this)}})}const me=n`
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
`,ue=n`
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
`,be=n`
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
`,ye=n`
  .pv-event {
    position: relative;
    padding: 0.375rem 0.5rem 0.375rem 0.75rem;
    border-radius: 4px;
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
    border-radius: 4px;
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
`,fe=n`
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
`,xe=n`
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
    border-radius: 12px;
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
`,we=n`
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
`,_e=n`
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
`,$e=n`
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
`;var ke;let Fe=ke=class extends oe{constructor(){super(...arguments),this.value="",this.valueLight="",this._isCustom=!1}updated(e){if(super.updated(e),e.has("value")&&this.value){const e=ke.PRESETS.some(e=>e.color.toLowerCase()===this.value.toLowerCase());this._isCustom=!e}}_selectPreset(e){this._isCustom=!1,this._emit(e.color,e.light)}_openCustomPicker(){this._colorInput?.click()}_onCustomColorChange(e){const t=e.target.value,i=function(e){let t=e.replace("#","");if(3===t.length&&(t=t.split("").map(e=>e+e).join("")),6!==t.length)return e;const i=parseInt(t.substring(0,2),16),r=parseInt(t.substring(2,4),16),a=parseInt(t.substring(4,6),16);if(isNaN(i)||isNaN(r)||isNaN(a))return e;const s=Math.round(i+.88*(255-i)),n=Math.round(r+.88*(255-r)),o=Math.round(a+.88*(255-a)),l=e=>e.toString(16).padStart(2,"0");return`#${l(s)}${l(n)}${l(o)}`}(t);this._isCustom=!0,this._emit(t,i)}_emit(e,t){this.value=e,this.valueLight=t,this.dispatchEvent(new CustomEvent("color-change",{detail:{color:e,colorLight:t},bubbles:!0,composed:!0}))}_isSelected(e){return this.value.toLowerCase()===e.toLowerCase()}render(){const e=ke.PRESETS,t=this._isCustom?this.value:"",i=this._isCustom&&!!this.value;return N`
      <div class="swatch-grid" role="group" aria-label="Color presets">
        ${e.map(e=>{const t=this._isSelected(e.color);return N`
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
            ${t?"":N`<span aria-hidden="true">+</span>`}
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
    `}};Fe.PRESETS=[{name:"Ocean",color:"#4A90D9",light:"#DCE8F5"},{name:"Fire",color:"#FC6A05",light:"#FEE6D1"},{name:"Sage",color:"#6BA368",light:"#E2F0E1"},{name:"Lavender",color:"#9B8EC4",light:"#EDEBF5"},{name:"Amber",color:"#D9A52B",light:"#F7EDCF"},{name:"Honey",color:"#e4f21c",light:"#FAFDE3"},{name:"Rose",color:"#D4728C",light:"#F5E4EA"},{name:"Teal",color:"#4A9E9E",light:"#DDF0F0"},{name:"Slate",color:"#6B7A8D",light:"#E8EAED"},{name:"Graphite",color:"#505050",light:"#E8E8E8"}],Fe.styles=[me,n`
      :host {
        display: block;
      }

      .swatch-grid {
        display: grid;
        grid-template-columns: repeat(5, 44px);
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

      /* Custom swatch button — same sizing */
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
    `],e([he({type:String})],Fe.prototype,"value",void 0),e([he({type:String})],Fe.prototype,"valueLight",void 0),e([ve()],Fe.prototype,"_isCustom",void 0),e([ge("#custom-color-input")],Fe.prototype,"_colorInput",void 0),Fe=ke=e([de("pv-color-swatch-picker")],Fe);let Ce=class extends oe{constructor(){super(...arguments),this.mode="onboarding",this._page=0,this._timeFormat="12h",this._firstDay="sunday",this._weatherEntity="",this._defaultView="week",this._calendarConfigs=[],this._calendarsInitialized=!1,this._dragIdx=null,this._dragOverIdx=null,this._theme="light",this._themeOverrides={},this._customizeOpen=!1,this._saving=!1,this._saveError="",this._settingsInitialized=!1}firstUpdated(){const e=this.renderRoot.querySelector('button, [href], input, select, [tabindex]:not([tabindex="-1"])');e?.focus()}updated(e){super.updated(e),e.has("hass")&&this.hass&&!this._calendarsInitialized&&this._initCalendars(),"settings"===this.mode&&this.config&&!this._settingsInitialized&&(this._initFromConfig(),this._settingsInitialized=!0)}_initFromConfig(){const e=this.config?.display||{};this._timeFormat=e.time_format||"12h",this._firstDay=e.first_day||"sunday",this._weatherEntity=e.weather_entity||"",this._defaultView=e.default_view||"week",this._theme=e.theme||"light",this._themeOverrides=e.theme_overrides?{...e.theme_overrides}:{},this._customizeOpen=Object.keys(this._themeOverrides).length>0}_initCalendars(){const e=Fe.PRESETS,t=Object.keys(this.hass.states).filter(e=>e.startsWith("calendar.")).sort(),i="settings"===this.mode&&this.config?.calendars?new Map(this.config.calendars.map(e=>[e.entity_id,e])):new Map;this._calendarConfigs=t.map((t,r)=>{const a=i.get(t);if(a)return{entity_id:t,display_name:a.display_name||t,color:a.color||e[r%e.length].color,color_light:a.color_light||e[r%e.length].light,person_entity:a.person_entity||"",include:!0};const s=e[r%e.length],n=this.hass.states[t]?.attributes?.friendly_name;return{entity_id:t,display_name:n||t,color:s.color,color_light:s.light,person_entity:"",include:!1}}),this._calendarsInitialized=!0}get _weatherEntities(){return this.hass?Object.keys(this.hass.states).filter(e=>e.startsWith("weather.")).sort():[]}get _personEntities(){return this.hass?Object.keys(this.hass.states).filter(e=>e.startsWith("person.")).sort():[]}_entityLabel(e){return this.hass?.states[e]?.attributes?.friendly_name||e}_personLabel(e){return this._entityLabel(e)}_goBack(){this._page>0&&(this._page-=1)}async _goNext(){this._page<2?this._page+=1:await this._finish()}async _finish(){this._saving=!0,this._saveError="";try{const e={calendars:this._calendarConfigs.filter(e=>e.include).map(e=>({entity_id:e.entity_id,display_name:e.display_name,color:e.color,color_light:e.color_light,icon:"mdi:calendar",person_entity:e.person_entity,visible:!0})),display:{time_format:this._timeFormat,weather_entity:this._weatherEntity,first_day:this._firstDay,default_view:this._defaultView,theme:this._theme,theme_overrides:Object.keys(this._themeOverrides).length>0?this._themeOverrides:void 0}};"onboarding"===this.mode&&(e.onboarding_complete=!0),await this.hass.callService("planavista","save_config",e);const t="settings"===this.mode?"settings-save":"onboarding-complete";this.dispatchEvent(new CustomEvent(t,{bubbles:!0,composed:!0}))}catch(e){console.error("[pv-onboarding-wizard] save_config failed:",e),this._saveError="settings"===this.mode?"Save failed — please try again.":"Setup failed — please try again."}finally{this._saving=!1}}_cancel(){this.dispatchEvent(new CustomEvent("settings-close",{bubbles:!0,composed:!0}))}_updateCalendar(e,t){const i=[...this._calendarConfigs];i[e]={...i[e],...t},this._calendarConfigs=i}_onCalendarColorChange(e,t){t.stopPropagation(),this._updateCalendar(e,{color:t.detail.color,color_light:t.detail.colorLight})}_dispatchThemePreview(){this.dispatchEvent(new CustomEvent("theme-preview",{detail:{theme:this._theme,overrides:Object.keys(this._themeOverrides).length>0?this._themeOverrides:null},bubbles:!0,composed:!0}))}_setOverride(e,t){if(void 0===t||""===t){const{[e]:t,...i}=this._themeOverrides;this._themeOverrides=i}else this._themeOverrides={...this._themeOverrides,[e]:t};this._dispatchThemePreview()}_resetOverrides(){this._themeOverrides={},this._dispatchThemePreview()}_renderProgressDots(){return N`
      <div class="progress-dots" aria-label="Step ${this._page+1} of 3">
        ${[0,1,2].map(e=>N`
          <div
            class="dot ${e===this._page?"dot--active":""}"
            aria-current="${e===this._page?"step":"false"}"
          ></div>
        `)}
      </div>
    `}_renderPage0(){return N`
      <div class="page-content">
        <h2 class="page-title">Preferences</h2>
        <p class="page-subtitle">Customize how PlanaVista looks and behaves.</p>

        <!-- Time Format -->
        <div class="field-group">
          <label class="pv-label">Time Format</label>
          <div class="pill-group" role="group" aria-label="Time format">
            <button
              class="pill-btn ${"12h"===this._timeFormat?"pill-btn--active":""}"
              type="button"
              @click=${()=>{this._timeFormat="12h"}}
            >12h</button>
            <button
              class="pill-btn ${"24h"===this._timeFormat?"pill-btn--active":""}"
              type="button"
              @click=${()=>{this._timeFormat="24h"}}
            >24h</button>
          </div>
        </div>

        <!-- First Day of Week -->
        <div class="field-group">
          <label class="pv-label">First Day of Week</label>
          <div class="pill-group" role="group" aria-label="First day of week">
            <button
              class="pill-btn ${"sunday"===this._firstDay?"pill-btn--active":""}"
              type="button"
              @click=${()=>{this._firstDay="sunday"}}
            >Sunday</button>
            <button
              class="pill-btn ${"monday"===this._firstDay?"pill-btn--active":""}"
              type="button"
              @click=${()=>{this._firstDay="monday"}}
            >Monday</button>
          </div>
        </div>

        <!-- Weather Entity -->
        <div class="field-group">
          <label class="pv-label" for="weather-select">Weather Entity</label>
          <select
            id="weather-select"
            class="pv-input pv-select"
            .value=${this._weatherEntity}
            @change=${e=>{this._weatherEntity=e.target.value}}
          >
            <option value="">(None)</option>
            ${this._weatherEntities.map(e=>N`
              <option value="${e}" ?selected=${this._weatherEntity===e}>${this._entityLabel(e)}</option>
            `)}
          </select>
        </div>

        <!-- Default View -->
        <div class="field-group">
          <label class="pv-label">Default View</label>
          <div class="view-grid" role="group" aria-label="Default calendar view">
            ${[{key:"day",label:"Day",icon:"M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V9h14v11zm-7-7c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"},{key:"week",label:"Week",icon:"M20 3H4v10c0 2.21 1.79 4 4 4h6c2.21 0 4-1.79 4-4v-3h2c1.11 0 2-.89 2-2V5c0-1.11-.89-2-2-2zm0 5h-2V5h2v3zM4 19h16v2H4z"},{key:"month",label:"Month",icon:"M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zM9 14H7v-2h2v2zm4 0h-2v-2h2v2zm4 0h-2v-2h2v2zm-8 4H7v-2h2v2zm4 0h-2v-2h2v2zm4 0h-2v-2h2v2z"},{key:"agenda",label:"Agenda",icon:"M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zM7 7v2h14V7H7z"}].map(e=>N`
              <button
                class="view-card ${this._defaultView===e.key?"view-card--active":""}"
                type="button"
                aria-pressed="${this._defaultView===e.key}"
                @click=${()=>{this._defaultView=e.key}}
              >
                <svg class="view-icon" viewBox="0 0 24 24" width="24" height="24">
                  <path d="${e.icon}" />
                </svg>
                <span class="view-label">${e.label}</span>
              </button>
            `)}
          </div>
        </div>
      </div>
    `}_renderPage1(){return 0===this._calendarConfigs.length?N`
        <div class="page-content">
          <h2 class="page-title">Calendars</h2>
          <p class="page-subtitle">No calendar entities found in Home Assistant.</p>
          <p class="empty-hint">Add calendar integrations (Google Calendar, CalDAV, etc.) and re-run setup.</p>
        </div>
      `:N`
      <div class="page-content">
        <h2 class="page-title">Calendars</h2>
        <p class="page-subtitle">Check the calendars you want to display, then personalise each one.</p>

        <div class="calendar-list">
          ${this._calendarConfigs.map((e,t)=>this._renderCalendarRow(e,t))}
        </div>
      </div>
    `}_onDragStart(e,t){this._dragIdx=e,t.dataTransfer&&(t.dataTransfer.effectAllowed="move",t.dataTransfer.setData("text/plain",String(e)))}_onDragOver(e,t){t.preventDefault(),t.dataTransfer&&(t.dataTransfer.dropEffect="move"),this._dragOverIdx=e}_onDragLeave(){this._dragOverIdx=null}_onDrop(e,t){if(t.preventDefault(),null!==this._dragIdx&&this._dragIdx!==e){const t=[...this._calendarConfigs],[i]=t.splice(this._dragIdx,1);t.splice(e,0,i),this._calendarConfigs=t}this._dragIdx=null,this._dragOverIdx=null}_onDragEnd(){this._dragIdx=null,this._dragOverIdx=null}_renderCalendarRow(e,t){const i=this._dragIdx===t,r=this._dragOverIdx===t&&this._dragIdx!==t;return N`
      <div class="cal-row ${i?"cal-row--dragging":""} ${r?"cal-row--dragover":""}"
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
              ${e.include?N`
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

        <!-- Expandable details — only shown when included -->
        ${e.include?N`
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
                @input=${e=>this._updateCalendar(t,{display_name:e.target.value})}
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
                ${this._personEntities.map(t=>N`
                  <option value="${t}" ?selected=${e.person_entity===t}>${this._personLabel(t)}</option>
                `)}
              </select>
            </div>
          </div>
        `:""}
      </div>
    `}_renderCustomize(){const e=this._themeOverrides,t=Object.keys(e).length>0;return N`
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

      ${this._customizeOpen?N`
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
                ${e.background?N`
                  <span class="bg-color-hex">${e.background}</span>
                `:""}
              </div>
            </div>
          </div>

          <!-- Header Style -->
          <div class="customize-group">
            <label class="pv-label">Header Style</label>
            <div class="header-style-grid">
              ${[{key:"gradient_purple",label:"Purple",gradient:"linear-gradient(135deg, #667eea, #764ba2)"},{key:"gradient_teal",label:"Teal",gradient:"linear-gradient(135deg, #0D9488, #2563EB)"},{key:"gradient_sunset",label:"Sunset",gradient:"linear-gradient(135deg, #F59E0B, #EF4444)"},{key:"solid_accent",label:"Accent",gradient:e.accent||"#6366F1"},{key:"solid_dark",label:"Dark",gradient:"#1A1B1E"}].map(t=>N`
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
            ${"custom"===e.header_style?N`
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
              ${["sharp","rounded","pill"].map(t=>N`
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
              ${["none","subtle","bold"].map(t=>N`
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
              ${["primary","light"].map(t=>N`
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
              ${e.avatar_border&&"primary"!==e.avatar_border&&"light"!==e.avatar_border?N`
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
                ${e.now_color?N`
                  <span class="bg-color-hex">${e.now_color}</span>
                `:""}
              </div>
            </div>
          </div>

          <!-- Event Style -->
          <div class="customize-group">
            <label class="pv-label">Event Style</label>
            <div class="pill-group">
              ${["stripes","solid"].map(t=>N`
                <button
                  class="pill-btn ${(e.event_style||"stripes")===t?"pill-btn--active":""}"
                  type="button"
                  @click=${()=>this._setOverride("event_style",t)}
                >${"stripes"===t?"Stripes":"Solid"}</button>
              `)}
            </div>
          </div>

          <!-- Reset -->
          ${t?N`
            <button class="reset-btn" type="button" @click=${this._resetOverrides}>
              <svg viewBox="0 0 24 24" width="16" height="16">
                <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z" fill="currentColor"/>
              </svg>
              Reset to Base Theme
            </button>
          `:""}

        </div>
      `:""}
    `}_renderPage2(){return N`
      <div class="page-content">
        <h2 class="page-title">Theme</h2>
        <p class="page-subtitle">Pick a visual style for your calendar.</p>

        <div class="theme-grid">
          ${[{key:"light",name:"Clean Light",description:"White background, subtle shadows",previewBg:"#FFFFFF",previewAccent:"#6366F1",previewText:"#1A1B1E"},{key:"dark",name:"Deep Dark",description:"Dark gray background, glowing accents",previewBg:"#1E1E2E",previewAccent:"#818CF8",previewText:"#E5E7EB"},{key:"minimal",name:"Minimal",description:"Barely-there UI, content first",previewBg:"#FAFAF9",previewAccent:"#374151",previewText:"#374151"},{key:"vibrant",name:"Vibrant",description:"Rich colors, bold personality",previewBg:"#4F46E5",previewAccent:"#F59E0B",previewText:"#FFFFFF"}].map(e=>N`
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
              ${this._theme===e.key?N`
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
    `}render(){const e="settings"===this.mode,t=["Preferences","Calendars","Theme"],i=2===this._page;let r;r=e?this._saving?"Saving…":"Save":i?this._saving?"Saving…":"Finish":"Next";const a=e||i,s=!e&&!i;return N`
      <div class="wizard-container" role="dialog" aria-modal="true"
        aria-label="${e?"PlanaVista Settings":"PlanaVista Setup"} — ${t[this._page]}">

        <div class="wizard-header">

          <!-- Left: Close (settings) or Back (onboarding) -->
          <div class="wizard-nav-left">
            ${e?N`
              <button class="pv-btn pv-btn-secondary back-btn" type="button"
                @click=${this._cancel}>
                <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
                  <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" fill="currentColor"/>
                </svg>
                Close
              </button>
            `:N`
              <button
                class="pv-btn pv-btn-secondary back-btn ${0===this._page?"back-btn--hidden":""}"
                type="button"
                ?disabled=${0===this._page}
                aria-hidden=${0===this._page?"true":W}
                @click=${this._goBack}
              >
                <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
                  <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" fill="currentColor"/>
                </svg>
                Back
              </button>
            `}
          </div>

          <!-- Center: Tabs (settings) or Brand+Dots (onboarding) -->
          <div class="wizard-header-center">
            ${e?N`
              <div class="settings-tabs" role="tablist">
                ${t.map((e,t)=>N`
                  <button
                    class="settings-tab ${this._page===t?"settings-tab--active":""}"
                    role="tab"
                    aria-selected="${this._page===t}"
                    type="button"
                    @click=${()=>{this._page=t}}
                  >${e}</button>
                `)}
              </div>
            `:N`
              <div class="wizard-brand">
                <span class="wizard-logo" aria-hidden="true">
                  <svg viewBox="0 0 24 24" width="18" height="18">
                    <path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V9h14v11zM9 14H7v-2h2v2zm4 0h-2v-2h2v2zm4 0h-2v-2h2v2zm-8 4H7v-2h2v2zm4 0h-2v-2h2v2zm4 0h-2v-2h2v2z" fill="currentColor"/>
                  </svg>
                </span>
                <span class="wizard-title-text">PlanaVista Setup</span>
              </div>
              ${this._renderProgressDots()}
            `}
          </div>

          <!-- Right: Save (settings) or Next/Finish (onboarding) -->
          <div class="wizard-nav-right">
            <button
              class="pv-btn pv-btn-primary next-btn"
              type="button"
              ?disabled=${this._saving}
              @click=${e?()=>this._finish():()=>this._goNext()}
            >
              ${a?N`
                ${this._saving?N`
                  <span class="spinner" aria-hidden="true"></span>
                `:N`
                  <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" fill="currentColor"/>
                  </svg>
                `}
              `:""}
              ${r}
              ${s?N`
                <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
                  <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" fill="currentColor"/>
                </svg>
              `:""}
            </button>
          </div>
        </div>

        ${this._saveError?N`<p class="save-error-banner" role="alert">${this._saveError}</p>`:W}

        <div class="wizard-content">
          ${0===this._page?this._renderPage0():""}
          ${1===this._page?this._renderPage1():""}
          ${2===this._page?this._renderPage2():""}
        </div>

      </div>
    `}};function Ee(e,t="12h"){const i=new Date(e);return"24h"===t?i.toLocaleTimeString("en-US",{hour:"2-digit",minute:"2-digit",hour12:!1}):i.toLocaleTimeString("en-US",{hour:"numeric",minute:"2-digit",hour12:!0})}function De(e,t="medium"){switch(t){case"long":return e.toLocaleDateString("en-US",{weekday:"long",year:"numeric",month:"long",day:"numeric"});case"medium":return e.toLocaleDateString("en-US",{weekday:"short",month:"short",day:"numeric"});case"short":return e.toLocaleDateString("en-US",{month:"numeric",day:"numeric"});case"weekday":return e.toLocaleDateString("en-US",{weekday:"long"})}}function ze(e){const t=new Date;return e.getFullYear()===t.getFullYear()&&e.getMonth()===t.getMonth()&&e.getDate()===t.getDate()}function Se(e,t="sunday"){const i=new Date(e),r=i.getDay(),a="monday"===t?0===r?-6:1-r:-r;return i.setDate(i.getDate()+a),i.setHours(0,0,0,0),i}function Ae(e){return`${e.getFullYear()}-${String(e.getMonth()+1).padStart(2,"0")}-${String(e.getDate()).padStart(2,"0")}`}function Me(e,t){const i=new Map(t.map(e=>[e.entity_id,e])),r=new Map;for(const t of e){const e=`${t.summary}|${t.start}|${t.end}`;if(r.has(e)){const a=r.get(e),s=i.get(t.calendar_entity_id);s&&a.shared_calendars.push({entity_id:s.entity_id,color:s.color,color_light:s.color_light,person_entity:s.person_entity,display_name:s.display_name})}else{const a=i.get(t.calendar_entity_id);r.set(e,{...t,shared_calendars:a?[{entity_id:a.entity_id,color:a.color,color_light:a.color_light,person_entity:a.person_entity,display_name:a.display_name}]:[]})}}return Array.from(r.values())}function Be(e){const t=e.start,i=e.end;if(!t.includes("T")&&!i.includes("T"))return!0;const r=new Date(t),a=new Date(i);return 0===r.getHours()&&0===r.getMinutes()&&0===a.getHours()&&0===a.getMinutes()&&a.getTime()-r.getTime()>=864e5}function Te(e){const t=new Map;for(const i of e){const e=new Date(i.start),r=new Date(i.end),a=new Date(e);a.setHours(0,0,0,0);const s=new Date(r);s.setHours(0,0,0,0);const n=Be(i);for(;n?a<s:a<=s;){const e=Ae(a);t.has(e)||t.set(e,[]),t.get(e).push(i),a.setDate(a.getDate()+1)}}for(const[,e]of t)e.sort((e,t)=>{const i=Be(e),r=Be(t);return i&&!r?-1:!i&&r?1:new Date(e.start).getTime()-new Date(t.start).getTime()});return t}function Oe(e,t,i){return e.filter(e=>{const r=new Date(e.start),a=new Date(e.end);return r<i&&a>t})}function Pe(e,t){return e.filter(e=>!t.has(e.calendar_entity_id))}function Le(e){const t=parseInt(e.slice(1,3),16)/255,i=parseInt(e.slice(3,5),16)/255,r=parseInt(e.slice(5,7),16)/255,a=e=>e<=.03928?e/12.92:Math.pow((e+.055)/1.055,2.4);return.2126*a(t)+.7152*a(i)+.0722*a(r)}function He(e){return Le(e)>.4?"#1A1B1E":"#FFFFFF"}Ce.styles=[me,be,xe,_e,$e,n`
      :host {
        display: flex;
        flex-direction: column;
        width: 100%;
        height: 100%;
        background: var(--pv-card-bg, #FFFFFF);
        color: var(--pv-text, #1A1B1E);
        font-family: var(--pv-font-family, Inter, -apple-system, system-ui, sans-serif);
        overflow: hidden;
      }

      /* ── Wizard shell ───────────────────────────────────────── */

      .wizard-container {
        display: flex;
        flex-direction: column;
        width: 100%;
        height: 100%;
        animation: pv-fadeIn 300ms ease forwards;
      }

      /* ── Header ─────────────────────────────────────────────── */

      .wizard-header {
        display: grid;
        grid-template-columns: 1fr auto 1fr;
        align-items: center;
        padding: 0.625rem 1rem;
        border-bottom: 1px solid var(--pv-border-subtle, #E5E7EB);
        flex-shrink: 0;
        background: var(--pv-card-bg, #FFFFFF);
        gap: 0.5rem;
      }

      .wizard-nav-left {
        justify-self: start;
      }

      .wizard-header-center {
        justify-self: center;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 3px;
      }

      .wizard-nav-right {
        justify-self: end;
      }

      .wizard-brand {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        color: var(--pv-accent, #6366F1);
      }

      .wizard-logo {
        display: flex;
        align-items: center;
        justify-content: center;
        fill: currentColor;
      }

      .wizard-title-text {
        font-size: 0.9375rem;
        font-weight: 600;
        color: var(--pv-text, #1A1B1E);
        letter-spacing: -0.01em;
      }

      /* ── Progress dots ──────────────────────────────────────── */

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

      /* ── Settings tabs (settings mode) ───────────────────────── */

      .settings-tabs {
        display: flex;
        gap: 2px;
        background: var(--pv-border-subtle, #E5E7EB);
        border-radius: 8px;
        padding: 2px;
      }

      .settings-tab {
        padding: 6px 14px;
        border: none;
        border-radius: 6px;
        background: transparent;
        color: var(--pv-text-secondary, #6B7280);
        font-size: 0.8125rem;
        font-weight: 600;
        cursor: pointer;
        transition: all var(--pv-transition, 200ms ease);
        font-family: inherit;
        min-height: 32px;
        -webkit-tap-highlight-color: transparent;
      }

      .settings-tab--active {
        background: var(--pv-card-bg, #FFFFFF);
        color: var(--pv-text, #1A1B1E);
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      }

      .settings-tab:hover:not(.settings-tab--active) {
        color: var(--pv-text, #1A1B1E);
      }

      /* ── Scrollable content ─────────────────────────────────── */

      .wizard-content {
        flex: 1;
        overflow-y: auto;
        padding: 1.5rem;
        -webkit-overflow-scrolling: touch;
      }

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

      .empty-hint {
        font-size: 0.875rem;
        color: var(--pv-text-muted, #9CA3AF);
        margin: 0.5rem 0 0;
      }

      /* ── Field groups ───────────────────────────────────────── */

      .field-group {
        margin-bottom: 1.5rem;
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

      /* ── Save error banner ───────────────────────────────────── */

      .save-error-banner {
        padding: 0.5rem 1.5rem;
        background: color-mix(in srgb, var(--error-color, #EF4444) 10%, transparent);
        color: var(--error-color, #EF4444);
        font-size: 0.8125rem;
        margin: 0;
        text-align: center;
        flex-shrink: 0;
      }

      .back-btn {
        gap: 0.25rem;
        padding: 0.375rem 0.75rem;
        font-size: 0.875rem;
        min-height: 36px;
      }

      .back-btn--hidden {
        visibility: hidden;
        pointer-events: none;
      }

      .next-btn {
        gap: 0.25rem;
        padding: 0.375rem 0.875rem;
        font-size: 0.875rem;
        min-height: 36px;
      }

      /* ── Spinner ─────────────────────────────────────────────── */

      @keyframes pv-spin {
        to { transform: rotate(360deg); }
      }

      .spinner {
        display: inline-block;
        width: 16px;
        height: 16px;
        border: 2px solid color-mix(in srgb, currentColor 30%, transparent);
        border-top-color: currentColor;
        border-radius: 50%;
        animation: pv-spin 0.6s linear infinite;
        flex-shrink: 0;
      }

      /* ═══════════ RESPONSIVE BREAKPOINTS ═══════════ */

      /* xs: phones — compact wizard */
      @media (max-width: 479px) {
        .wizard-header { padding: 0.5rem 0.625rem; gap: 0.25rem; }
        .wizard-title-text { font-size: 0.8125rem; }
        .wizard-content { padding: 1rem; }
        .page-title { font-size: 1.125rem; }
        .page-subtitle { font-size: 0.8125rem; margin-bottom: 1.25rem; }
        .field-group { margin-bottom: 1rem; }
        .pill-btn { padding: 0.375rem 0.875rem; min-height: 38px; font-size: 0.8125rem; }
        .view-grid { grid-template-columns: repeat(2, 1fr); }
        .theme-grid { grid-template-columns: 1fr; }
        .settings-tabs { flex-wrap: wrap; }
        .settings-tab { font-size: 0.75rem; padding: 5px 10px; }
        .back-btn, .next-btn { font-size: 0.75rem; padding: 0.25rem 0.5rem; min-height: 32px; }
      }

      /* sm: large phones */
      @media (min-width: 480px) and (max-width: 767px) {
        .wizard-content { padding: 1.25rem; }
        .page-title { font-size: 1.25rem; }
      }
    `],e([he({attribute:!1})],Ce.prototype,"hass",void 0),e([he({type:String})],Ce.prototype,"mode",void 0),e([he({attribute:!1})],Ce.prototype,"config",void 0),e([ve()],Ce.prototype,"_page",void 0),e([ve()],Ce.prototype,"_timeFormat",void 0),e([ve()],Ce.prototype,"_firstDay",void 0),e([ve()],Ce.prototype,"_weatherEntity",void 0),e([ve()],Ce.prototype,"_defaultView",void 0),e([ve()],Ce.prototype,"_calendarConfigs",void 0),e([ve()],Ce.prototype,"_calendarsInitialized",void 0),e([ve()],Ce.prototype,"_dragIdx",void 0),e([ve()],Ce.prototype,"_dragOverIdx",void 0),e([ve()],Ce.prototype,"_theme",void 0),e([ve()],Ce.prototype,"_themeOverrides",void 0),e([ve()],Ce.prototype,"_customizeOpen",void 0),e([ve()],Ce.prototype,"_saving",void 0),e([ve()],Ce.prototype,"_saveError",void 0),Ce=e([de("pv-onboarding-wizard")],Ce);const Ie={sharp:{radius:"4px",radiusLg:"6px",radiusSm:"2px"},rounded:{radius:"12px",radiusLg:"16px",radiusSm:"8px"},pill:{radius:"20px",radiusLg:"24px",radiusSm:"14px"}},je={none:{shadow:"none",shadowLg:"none",shadowXl:"none"},subtle:{shadow:"0 1px 3px rgba(0, 0, 0, 0.08), 0 1px 2px rgba(0, 0, 0, 0.04)",shadowLg:"0 10px 25px rgba(0, 0, 0, 0.08), 0 4px 10px rgba(0, 0, 0, 0.04)",shadowXl:"0 20px 40px rgba(0, 0, 0, 0.12)"},bold:{shadow:"0 2px 8px rgba(0, 0, 0, 0.15), 0 1px 3px rgba(0, 0, 0, 0.1)",shadowLg:"0 12px 32px rgba(0, 0, 0, 0.18), 0 6px 14px rgba(0, 0, 0, 0.1)",shadowXl:"0 24px 48px rgba(0, 0, 0, 0.24)"}},Ue={gradient_purple:{gradient:"linear-gradient(135deg, #667eea 0%, #764ba2 100%)",text:"#FFFFFF"},gradient_teal:{gradient:"linear-gradient(135deg, #0D9488 0%, #2563EB 100%)",text:"#FFFFFF"},gradient_sunset:{gradient:"linear-gradient(135deg, #F59E0B 0%, #EF4444 100%)",text:"#FFFFFF"},solid_accent:{gradient:"",text:"#FFFFFF"},solid_dark:{gradient:"#1A1B1E",text:"#FFFFFF"}},Ve={light:{"--pv-bg":"#FAFAF8","--pv-card-bg":"#FFFFFF","--pv-card-bg-elevated":"#FFFFFF","--pv-text":"#1A1B1E","--pv-text-secondary":"#6B7280","--pv-text-muted":"#9CA3AF","--pv-border":"#E5E7EB","--pv-border-subtle":"#F3F4F6","--pv-accent":"#6366F1","--pv-accent-text":"#FFFFFF","--pv-today-bg":"rgba(99, 102, 241, 0.06)","--pv-now-color":"#EF4444","--pv-event-hover":"rgba(0, 0, 0, 0.03)","--pv-shadow":"0 1px 3px rgba(0, 0, 0, 0.08), 0 1px 2px rgba(0, 0, 0, 0.04)","--pv-shadow-lg":"0 10px 25px rgba(0, 0, 0, 0.08), 0 4px 10px rgba(0, 0, 0, 0.04)","--pv-shadow-xl":"0 20px 40px rgba(0, 0, 0, 0.12)","--pv-radius":"12px","--pv-radius-lg":"16px","--pv-radius-sm":"8px","--pv-transition":"200ms cubic-bezier(0.4, 0, 0.2, 1)","--pv-font-family":"Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif","--pv-header-gradient":"linear-gradient(135deg, #667eea 0%, #764ba2 100%)","--pv-header-text":"#FFFFFF","--pv-backdrop":"rgba(0, 0, 0, 0.3)"},dark:{"--pv-bg":"#1A1B1E","--pv-card-bg":"#25262B","--pv-card-bg-elevated":"#2C2E33","--pv-text":"#E4E5E7","--pv-text-secondary":"#909296","--pv-text-muted":"#5C5F66","--pv-border":"#373A40","--pv-border-subtle":"#2C2E33","--pv-accent":"#818CF8","--pv-accent-text":"#FFFFFF","--pv-today-bg":"rgba(129, 140, 248, 0.08)","--pv-now-color":"#F87171","--pv-event-hover":"rgba(255, 255, 255, 0.04)","--pv-shadow":"0 1px 3px rgba(0, 0, 0, 0.3), 0 1px 2px rgba(0, 0, 0, 0.2)","--pv-shadow-lg":"0 10px 25px rgba(0, 0, 0, 0.3), 0 4px 10px rgba(0, 0, 0, 0.2)","--pv-shadow-xl":"0 20px 40px rgba(0, 0, 0, 0.4)","--pv-radius":"12px","--pv-radius-lg":"16px","--pv-radius-sm":"8px","--pv-transition":"200ms cubic-bezier(0.4, 0, 0.2, 1)","--pv-font-family":"Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif","--pv-header-gradient":"linear-gradient(135deg, #3730A3 0%, #581C87 100%)","--pv-header-text":"#FFFFFF","--pv-backdrop":"rgba(0, 0, 0, 0.6)"},minimal:{"--pv-bg":"#FFFFFF","--pv-card-bg":"#FFFFFF","--pv-card-bg-elevated":"#FFFFFF","--pv-text":"#111827","--pv-text-secondary":"#6B7280","--pv-text-muted":"#D1D5DB","--pv-border":"#F3F4F6","--pv-border-subtle":"#F9FAFB","--pv-accent":"#111827","--pv-accent-text":"#FFFFFF","--pv-today-bg":"rgba(17, 24, 39, 0.03)","--pv-now-color":"#EF4444","--pv-event-hover":"rgba(0, 0, 0, 0.02)","--pv-shadow":"0 0 0 1px rgba(0, 0, 0, 0.05)","--pv-shadow-lg":"0 4px 12px rgba(0, 0, 0, 0.05)","--pv-shadow-xl":"0 8px 24px rgba(0, 0, 0, 0.08)","--pv-radius":"8px","--pv-radius-lg":"12px","--pv-radius-sm":"6px","--pv-transition":"150ms ease","--pv-font-family":"Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif","--pv-header-gradient":"#111827","--pv-header-text":"#FFFFFF","--pv-backdrop":"rgba(0, 0, 0, 0.2)"},vibrant:{"--pv-bg":"#FAFAF8","--pv-card-bg":"#FFFFFF","--pv-card-bg-elevated":"#FFFFFF","--pv-text":"#1A1B1E","--pv-text-secondary":"#6B7280","--pv-text-muted":"#9CA3AF","--pv-border":"#E5E7EB","--pv-border-subtle":"#F3F4F6","--pv-accent":"#7C3AED","--pv-accent-text":"#FFFFFF","--pv-today-bg":"rgba(124, 58, 237, 0.06)","--pv-now-color":"#F43F5E","--pv-event-hover":"rgba(0, 0, 0, 0.03)","--pv-shadow":"0 1px 3px rgba(124, 58, 237, 0.1), 0 1px 2px rgba(0, 0, 0, 0.04)","--pv-shadow-lg":"0 10px 25px rgba(124, 58, 237, 0.15), 0 4px 10px rgba(0, 0, 0, 0.04)","--pv-shadow-xl":"0 20px 40px rgba(124, 58, 237, 0.2)","--pv-radius":"14px","--pv-radius-lg":"20px","--pv-radius-sm":"10px","--pv-transition":"250ms cubic-bezier(0.34, 1.56, 0.64, 1)","--pv-font-family":"Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif","--pv-header-gradient":"linear-gradient(135deg, #7C3AED 0%, #EC4899 100%)","--pv-header-text":"#FFFFFF","--pv-backdrop":"rgba(124, 58, 237, 0.2)"}},Ne=new WeakMap;function Re(e,t,i){const r=`${t}:${JSON.stringify(i||{})}`;if(Ne.get(e)===r)return;const a={...Ve[t]||Ve.light};if(i){if(i.accent&&(a["--pv-accent"]=i.accent,a["--pv-accent-text"]=He(i.accent),a["--pv-today-bg"]=(s=i.accent,`rgba(${parseInt(s.slice(1,3),16)}, ${parseInt(s.slice(3,5),16)}, ${parseInt(s.slice(5,7),16)}, 0.06)`)),i.background){if(a["--pv-bg"]=i.background,Le(i.background)>.5)a["--pv-card-bg"]="#FFFFFF",a["--pv-card-bg-elevated"]="#FFFFFF";else{const e=parseInt(i.background.slice(1,3),16),t=parseInt(i.background.slice(3,5),16),r=parseInt(i.background.slice(5,7),16),s=(e,t)=>Math.min(255,e+t);a["--pv-card-bg"]=`#${s(e,12).toString(16).padStart(2,"0")}${s(t,12).toString(16).padStart(2,"0")}${s(r,12).toString(16).padStart(2,"0")}`,a["--pv-card-bg-elevated"]=`#${s(e,20).toString(16).padStart(2,"0")}${s(t,20).toString(16).padStart(2,"0")}${s(r,20).toString(16).padStart(2,"0")}`}a["--pv-text"]=He(i.background);const e=Le(a["--pv-text"])>.5?{secondary:"#909296",muted:"#5C5F66"}:{secondary:"#6B7280",muted:"#9CA3AF"};a["--pv-text-secondary"]=e.secondary,a["--pv-text-muted"]=e.muted;const t=Le(i.background)>.5?{border:"#E5E7EB",borderSubtle:"#F3F4F6"}:{border:"#373A40",borderSubtle:"#2C2E33"};a["--pv-border"]=t.border,a["--pv-border-subtle"]=t.borderSubtle,a["--pv-event-hover"]=Le(i.background)>.5?"rgba(0, 0, 0, 0.03)":"rgba(255, 255, 255, 0.04)",a["--pv-backdrop"]=Le(i.background)>.5?"rgba(0, 0, 0, 0.3)":"rgba(0, 0, 0, 0.6)"}if(i.header_style)if("custom"===i.header_style&&i.header_custom)a["--pv-header-gradient"]=i.header_custom,a["--pv-header-text"]=He(i.header_custom);else if("solid_accent"===i.header_style){const e=i.accent||a["--pv-accent"];a["--pv-header-gradient"]=e,a["--pv-header-text"]=He(e)}else{const e=Ue[i.header_style];e&&(a["--pv-header-gradient"]=e.gradient,a["--pv-header-text"]=e.text)}if(i.corner_style&&Ie[i.corner_style]){const e=Ie[i.corner_style];a["--pv-radius"]=e.radius,a["--pv-radius-lg"]=e.radiusLg,a["--pv-radius-sm"]=e.radiusSm}if(i.shadow_depth&&je[i.shadow_depth]){const e=je[i.shadow_depth];a["--pv-shadow"]=e.shadow,a["--pv-shadow-lg"]=e.shadowLg,a["--pv-shadow-xl"]=e.shadowXl}i.avatar_border&&"primary"!==i.avatar_border&&"light"!==i.avatar_border&&(a["--pv-avatar-border"]=i.avatar_border),i.now_color&&(a["--pv-now-color"]=i.now_color)}var s;for(const[t,i]of Object.entries(a))e.style.setProperty(t,i);Ne.set(e,r)}function We(e){Ne.delete(e)}function Ye(e,t){const i=e||t||"light";return"planavista"===i?"light":"modern"===i?"vibrant":i in Ve?i:"light"}async function qe(e,t){const i={summary:t.summary};t.start_date_time&&(i.start_date_time=t.start_date_time),t.end_date_time&&(i.end_date_time=t.end_date_time),t.start_date&&(i.start_date=t.start_date),t.end_date&&(i.end_date=t.end_date),t.description&&(i.description=t.description),t.location&&(i.location=t.location),await e.callService("calendar","create_event",i,{entity_id:t.entity_id})}async function Xe(e,t){const i={entity_id:t.entity_id,uid:t.uid};t.recurrence_id&&(i.recurrence_id=t.recurrence_id),await e.callService("planavista","delete_event",i)}async function Qe(e,t="sensor.planavista_config"){await e.callService("homeassistant","update_entity",{entity_id:t})}function Ze(e,t="sensor.planavista_config"){const i=e.states[t];if(!i)return null;const r=i.attributes,a=r.events||[];if(a.length>0&&!Ze._uidLogged){Ze._uidLogged=!0;const e=a.filter(e=>e.uid),t=a.filter(e=>!e.uid);console.log(`[PlanaVista] Event UID check: ${e.length} with uid, ${t.length} without uid (total ${a.length})`),t.length>0&&console.log("[PlanaVista] Events missing uid:",t.slice(0,3).map(e=>({summary:e.summary,keys:Object.keys(e)})))}return{calendars:r.calendars||[],events:a,display:r.display||{time_format:"12h",weather_entity:"",first_day:"sunday",default_view:"day",theme:"light"},onboarding_complete:r.onboarding_complete,version:r.version}}function Ke(e,t){if(!t)return null;const i=e.states[t];return i?.attributes?.entity_picture||null}function Ge(e,t){if(!t)return"";const i=e.states[t];return i?.attributes?.friendly_name||t.replace("person.","")}let Je=class extends oe{constructor(){super(...arguments),this.calendars=[],this.timeFormat="12h",this.compact=!1,this.showStripes=!0}render(){const e=this.event;if(!e)return W;const t=e.shared_calendars||[],i=t.length>1,r=function(e,t){if(e.organizer){const t=e.shared_calendars.find(t=>t.display_name?.toLowerCase()===e.organizer?.toLowerCase()||t.entity_id===e.organizer);if(t)return t}for(const i of t){const t=e.shared_calendars.find(e=>e.entity_id===i.entity_id);if(t)return t}return e.shared_calendars[0]}(e,this.calendars),a=r?.color||e.calendar_color||"var(--pv-accent)";let s;s=this.showStripes&&i?`background: ${function(e){const t=e.length;if(t<=1)return"";const i=2===t?60:Math.min(50,Math.round(100/t*1.5)),r=(100-i)/(t-1),a=[];let s=0;return e.forEach((e,t)=>{const n=e.color_light||e.color,o=0===t?i:r;a.push(`${n} ${s}%`),s+=o,a.push(`${n} ${s}%`)}),`linear-gradient(135deg, ${a.join(", ")})`}(t)}`:this.showStripes?`background: ${t[0]?.color_light||e.calendar_color_light||e.calendar_color}`:"background: var(--pv-card-bg, #FFFFFF)";const n=this.showStripes?t[0]?.color_light||e.calendar_color_light||e.calendar_color:"#FFFFFF",o=this.showStripes?He(n):"var(--pv-text)",l=this.compact?"chip chip--compact":"chip",d=this.compact?"chip-title chip-title--wrap":"chip-title chip-title--nowrap",c=!e.start.includes("T")||new Date(e.end).getTime()-new Date(e.start).getTime()>=864e5&&e.start.includes("T00:00")&&e.end.includes("T00:00");return N`
      <div
        class="${l}"
        style="${s}; --chip-border-color: ${a}; --chip-text: ${o}"
        @click=${this._onClick}
      >
        <div class="chip-body">
          <div class="${d}">${e.summary}</div>
          ${this.compact?W:N`
            <div class="chip-time">
              ${c?"All day":`${Ee(e.start,this.timeFormat)} – ${Ee(e.end,this.timeFormat)}`}
            </div>
          `}
        </div>
        ${!this.compact&&t.length>0?this._renderAvatars(t):W}
      </div>
    `}_renderAvatars(e){const t=e.slice(0,4),i=e.length-4;return N`
      <div class="chip-avatars">
        ${t.map(e=>{const t=e.person_entity?Ke(this.hass,e.person_entity):null,i=e.person_entity?Ge(this.hass,e.person_entity):e.display_name||"?";return t?N`<img class="chip-avatar" src="${t}" alt="${i}" />`:N`<div class="chip-initial" style="background: ${e.color}">${i[0]?.toUpperCase()||"?"}</div>`})}
        ${i>0?N`<div class="chip-overflow">+${i}</div>`:W}
      </div>
    `}_onClick(){this.dispatchEvent(new CustomEvent("event-click",{detail:{event:this.event},bubbles:!0,composed:!0}))}};Je.styles=[me,n`
      :host { display: block; }

      .chip {
        display: flex;
        align-items: flex-start;
        gap: 0.5rem;
        padding: 0.5rem 0.625rem;
        border-radius: 6px;
        border-left: 3px solid var(--chip-border-color);
        cursor: pointer;
        transition: transform 120ms ease, box-shadow 120ms ease;
        min-height: 0;
        overflow: hidden;
      }

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
        border-radius: 4px;
      }

      .chip--compact .chip-title {
        font-size: 0.6875rem;
        font-weight: 500;
      }

      /* Responsive — small screens */
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

      /* XL screens — ~50% larger for wall displays */
      @media (min-width: 1440px) {
        .chip { padding: 1rem 1.25rem; gap: 0.75rem; border-left-width: 4px; }
        .chip-title { font-size: 1.375rem; }
        .chip-time { font-size: 1.125rem; }
        .chip-avatar, .chip-initial, .chip-overflow { width: 40px; height: 40px; font-size: 0.8125rem; }
        .chip--compact { padding: 0.375rem 0.75rem; border-left-width: 3px; }
        .chip--compact .chip-title { font-size: 1rem; }
      }
    `],e([he({attribute:!1})],Je.prototype,"hass",void 0),e([he({attribute:!1})],Je.prototype,"event",void 0),e([he({attribute:!1})],Je.prototype,"calendars",void 0),e([he({attribute:!1})],Je.prototype,"timeFormat",void 0),e([he({type:Boolean})],Je.prototype,"compact",void 0),e([he({type:Boolean})],Je.prototype,"showStripes",void 0),Je=e([de("pv-event-chip")],Je);class et{constructor(){this.hiddenCalendars=new Set,this.currentView="day",this.currentDate=new Date,this.selectedEvent=null,this.dialogOpen=null,this.createPrefill=null,this.isLoading=!1,this._hosts=new Set,this._autoAdvanceTimer=null,this.startAutoAdvance()}static getInstance(){return et._instance||(et._instance=new et),et._instance}subscribe(e){this._hosts.add(e)}unsubscribe(e){this._hosts.delete(e)}_notify(){for(const e of this._hosts)e.requestUpdate()}toggleCalendar(e){this.hiddenCalendars.has(e)?this.hiddenCalendars.delete(e):this.hiddenCalendars.add(e),this._notify()}setView(e){this.currentView!==e&&(this.currentView=e,this._notify())}navigateDate(e){this.currentDate="today"===e?new Date:function(e,t,i){const r=new Date(e),a="next"===i?1:-1;switch(t){case"day":r.setDate(r.getDate()+a);break;case"week":case"agenda":r.setDate(r.getDate()+7*a);break;case"month":r.setMonth(r.getMonth()+a)}return r}(this.currentDate,this.currentView,e),this._notify()}setDate(e){this.currentDate=new Date(e),this._notify()}selectEvent(e){this.selectedEvent=e,this._notify()}openCreateDialog(e){this.dialogOpen="create",this.createPrefill=e||null,this._notify()}openEditDialog(e){this.dialogOpen="edit",this.selectedEvent=e,this.createPrefill={...e},this._notify()}closeDialog(){this.dialogOpen=null,this.createPrefill=null,this._notify()}async doCreateEvent(e,t){this.isLoading=!0,this._notify();try{await qe(e,t),await Qe(e),this.closeDialog()}catch(e){throw console.error("PlanaVista: Failed to create event",e),e}finally{this.isLoading=!1,this._notify()}}async doDeleteEvent(e,t){this.isLoading=!0,this._notify();try{await Xe(e,t),await Qe(e),this.selectedEvent=null,this.closeDialog()}catch(e){throw console.error("PlanaVista: Failed to delete event",e),e}finally{this.isLoading=!1,this._notify()}}async doEditEvent(e,t,i){this.isLoading=!0,this._notify();let r=!1;try{await Xe(e,t),r=!0,await qe(e,i),await Qe(e),this.selectedEvent=null,this.closeDialog()}catch(e){if(console.error("PlanaVista: Failed to edit event",e),r)throw new Error("The original event was deleted but the replacement could not be created. Please create the event manually. Error: "+(e instanceof Error?e.message:String(e)));throw e}finally{this.isLoading=!1,this._notify()}}startAutoAdvance(){this._autoAdvanceTimer||(this._autoAdvanceTimer=setInterval(()=>{const e=new Date;e.getDate()===this.currentDate.getDate()&&e.getMonth()===this.currentDate.getMonth()&&e.getFullYear()===this.currentDate.getFullYear()||this.currentDate.toDateString()===new Date(Date.now()-6e4).toDateString()&&(this.currentDate=e,this._notify())},6e4))}stopAutoAdvance(){this._autoAdvanceTimer&&(clearInterval(this._autoAdvanceTimer),this._autoAdvanceTimer=null)}}class tt{constructor(e){this.host=e,this._state=et.getInstance(),e.addController(this)}hostConnected(){this._state.subscribe(this.host)}hostDisconnected(){this._state.unsubscribe(this.host)}get state(){return this._state}}function it(e,t=48){return(rt[e]||rt.cloudy)(t)}const rt={sunny:e=>N`
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
    </svg>`,"clear-night":e=>N`
    <svg width="${e}" height="${e}" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M38 14C30 14 23 20 21 28C20 31 20 35 21 38C23 44 28 49 35 50C38 51 41 51 44 50C36 52 27 48 23 40C19 32 21 22 28 16C31 14 34 13 38 14Z" fill="#94A3B8" />
      <circle cx="44" cy="16" r="1.5" fill="#94A3B8" opacity="0.6" />
      <circle cx="50" cy="24" r="1" fill="#94A3B8" opacity="0.4" />
      <circle cx="46" cy="32" r="1.2" fill="#94A3B8" opacity="0.5" />
    </svg>`,cloudy:e=>N`
    <svg width="${e}" height="${e}" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M48 40H18C13.6 40 10 36.4 10 32C10 27.6 13.6 24 18 24C18.2 24 18.5 24 18.7 24C20.2 18.6 25.2 15 31 15C37.9 15 43.5 19.9 44.2 26.5C44.8 26.3 45.4 26.2 46 26.2C49.3 26.2 52 28.9 52 32.2C52 32.2 52 32.2 52 32.3" fill="#CBD5E1" />
      <path d="M48 40H18C13.6 40 10 36.4 10 32C10 27.6 13.6 24 18 24C18.2 24 18.5 24 18.7 24C20.2 18.6 25.2 15 31 15C37.9 15 43.5 19.9 44.2 26.5C44.8 26.3 45.4 26.2 46 26.2C49.3 26.2 52 28.9 52 32.2V40C52 40 50 40 48 40Z" fill="#94A3B8" />
    </svg>`,partlycloudy:e=>N`
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
    </svg>`,rainy:e=>N`
    <svg width="${e}" height="${e}" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M48 34H18C13.6 34 10 30.4 10 26C10 21.6 13.6 18 18 18C18.2 18 18.5 18 18.7 18C20.2 12.6 25.2 9 31 9C37.9 9 43.5 13.9 44.2 20.5C44.8 20.3 45.4 20.2 46 20.2C49.3 20.2 52 22.9 52 26.2V34H48Z" fill="#94A3B8" />
      <g stroke="#60A5FA" stroke-width="2.5" stroke-linecap="round">
        <line x1="22" y1="40" x2="20" y2="48" class="pv-rain-drop" />
        <line x1="32" y1="40" x2="30" y2="48" class="pv-rain-drop" style="animation-delay: 0.3s" />
        <line x1="42" y1="40" x2="40" y2="48" class="pv-rain-drop" style="animation-delay: 0.6s" />
        <line x1="27" y1="48" x2="25" y2="56" class="pv-rain-drop" style="animation-delay: 0.15s" />
        <line x1="37" y1="48" x2="35" y2="56" class="pv-rain-drop" style="animation-delay: 0.45s" />
      </g>
    </svg>`,pouring:e=>N`
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
    </svg>`,snowy:e=>N`
    <svg width="${e}" height="${e}" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M48 32H18C13.6 32 10 28.4 10 24C10 19.6 13.6 16 18 16C18.2 16 18.5 16 18.7 16C20.2 10.6 25.2 7 31 7C37.9 7 43.5 11.9 44.2 18.5C44.8 18.3 45.4 18.2 46 18.2C49.3 18.2 52 20.9 52 24.2V32H48Z" fill="#94A3B8" />
      <circle cx="20" cy="42" r="2.5" fill="#BFDBFE" class="pv-snow-flake" />
      <circle cx="32" cy="40" r="2.5" fill="#BFDBFE" class="pv-snow-flake" style="animation-delay: 0.3s" />
      <circle cx="44" cy="43" r="2.5" fill="#BFDBFE" class="pv-snow-flake" style="animation-delay: 0.6s" />
      <circle cx="25" cy="52" r="2" fill="#BFDBFE" class="pv-snow-flake" style="animation-delay: 0.15s" />
      <circle cx="38" cy="51" r="2" fill="#BFDBFE" class="pv-snow-flake" style="animation-delay: 0.45s" />
    </svg>`,"snowy-rainy":e=>N`
    <svg width="${e}" height="${e}" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M48 32H18C13.6 32 10 28.4 10 24C10 19.6 13.6 16 18 16C18.2 16 18.5 16 18.7 16C20.2 10.6 25.2 7 31 7C37.9 7 43.5 11.9 44.2 18.5C44.8 18.3 45.4 18.2 46 18.2C49.3 18.2 52 20.9 52 24.2V32H48Z" fill="#94A3B8" />
      <g stroke="#60A5FA" stroke-width="2" stroke-linecap="round">
        <line x1="22" y1="38" x2="20" y2="46" class="pv-rain-drop" />
        <line x1="42" y1="38" x2="40" y2="46" class="pv-rain-drop" style="animation-delay: 0.3s" />
      </g>
      <circle cx="32" cy="42" r="2.5" fill="#BFDBFE" class="pv-snow-flake" style="animation-delay: 0.15s" />
      <circle cx="27" cy="52" r="2" fill="#BFDBFE" class="pv-snow-flake" style="animation-delay: 0.45s" />
      <circle cx="37" cy="50" r="2" fill="#BFDBFE" class="pv-snow-flake" style="animation-delay: 0.6s" />
    </svg>`,fog:e=>N`
    <svg width="${e}" height="${e}" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <g stroke="#94A3B8" stroke-width="3" stroke-linecap="round">
        <line x1="12" y1="24" x2="52" y2="24" opacity="0.4" />
        <line x1="16" y1="32" x2="48" y2="32" opacity="0.6" />
        <line x1="12" y1="40" x2="52" y2="40" opacity="0.8" />
        <line x1="18" y1="48" x2="46" y2="48" opacity="0.5" />
      </g>
    </svg>`,hail:e=>N`
    <svg width="${e}" height="${e}" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M48 30H18C13.6 30 10 26.4 10 22C10 17.6 13.6 14 18 14C18.2 14 18.5 14 18.7 14C20.2 8.6 25.2 5 31 5C37.9 5 43.5 9.9 44.2 16.5C44.8 16.3 45.4 16.2 46 16.2C49.3 16.2 52 18.9 52 22.2V30H48Z" fill="#94A3B8" />
      <circle cx="20" cy="40" r="3" fill="#93C5FD" stroke="#60A5FA" stroke-width="1" />
      <circle cx="32" cy="44" r="3" fill="#93C5FD" stroke="#60A5FA" stroke-width="1" />
      <circle cx="44" cy="38" r="3" fill="#93C5FD" stroke="#60A5FA" stroke-width="1" />
      <circle cx="26" cy="52" r="2.5" fill="#93C5FD" stroke="#60A5FA" stroke-width="1" />
      <circle cx="38" cy="54" r="2.5" fill="#93C5FD" stroke="#60A5FA" stroke-width="1" />
    </svg>`,lightning:e=>N`
    <svg width="${e}" height="${e}" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M48 30H18C13.6 30 10 26.4 10 22C10 17.6 13.6 14 18 14C18.2 14 18.5 14 18.7 14C20.2 8.6 25.2 5 31 5C37.9 5 43.5 9.9 44.2 16.5C44.8 16.3 45.4 16.2 46 16.2C49.3 16.2 52 18.9 52 22.2V30H48Z" fill="#64748B" />
      <path d="M34 30L28 42H34L30 56L42 40H36L40 30H34Z" fill="#FBBF24" stroke="#F59E0B" stroke-width="0.5" />
    </svg>`,"lightning-rainy":e=>N`
    <svg width="${e}" height="${e}" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M48 28H18C13.6 28 10 24.4 10 20C10 15.6 13.6 12 18 12C18.2 12 18.5 12 18.7 12C20.2 6.6 25.2 3 31 3C37.9 3 43.5 7.9 44.2 14.5C44.8 14.3 45.4 14.2 46 14.2C49.3 14.2 52 16.9 52 20.2V28H48Z" fill="#64748B" />
      <path d="M34 28L28 40H34L30 52L42 38H36L40 28H34Z" fill="#FBBF24" />
      <g stroke="#60A5FA" stroke-width="2" stroke-linecap="round">
        <line x1="18" y1="36" x2="16" y2="44" class="pv-rain-drop" style="animation-delay: 0.2s" />
        <line x1="48" y1="34" x2="46" y2="42" class="pv-rain-drop" style="animation-delay: 0.5s" />
        <line x1="22" y1="48" x2="20" y2="56" class="pv-rain-drop" style="animation-delay: 0.1s" />
        <line x1="44" y1="46" x2="42" y2="54" class="pv-rain-drop" style="animation-delay: 0.4s" />
      </g>
    </svg>`,windy:e=>N`
    <svg width="${e}" height="${e}" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <g stroke="#94A3B8" stroke-width="3" stroke-linecap="round">
        <path d="M10 24 Q30 24 38 20 Q46 16 48 20 Q50 24 46 24" fill="none" />
        <path d="M8 34 Q28 34 40 30 Q48 28 50 32 Q52 36 48 36" fill="none" />
        <path d="M14 44 Q30 44 36 40 Q42 36 44 40 Q46 44 42 44" fill="none" />
      </g>
    </svg>`,"windy-variant":e=>N`
    <svg width="${e}" height="${e}" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M48 28H22C17.6 28 14 24.4 14 20C14 15.6 17.6 12 22 12C22.2 12 22.5 12 22.7 12C24.2 7 28.8 4 34 4C40.3 4 45.5 8.5 46.2 14.5C46.8 14.3 47.4 14.2 48 14.2C51 14.2 53.5 16.7 53.5 19.7V28H48Z" fill="#CBD5E1" />
      <g stroke="#94A3B8" stroke-width="2.5" stroke-linecap="round">
        <path d="M8 36 Q28 36 36 33 Q44 30 46 34 Q48 38 44 38" fill="none" />
        <path d="M12 46 Q28 46 34 43 Q40 40 42 44 Q44 48 40 48" fill="none" />
      </g>
    </svg>`,exceptional:e=>N`
    <svg width="${e}" height="${e}" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="32" cy="32" r="20" stroke="#F59E0B" stroke-width="3" fill="none" />
      <line x1="32" y1="18" x2="32" y2="34" stroke="#F59E0B" stroke-width="3" stroke-linecap="round" />
      <circle cx="32" cy="42" r="2" fill="#F59E0B" />
    </svg>`};let at=class extends oe{constructor(){super(...arguments),this._config={}}setConfig(e){this._config=e}render(){return N`
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
    `}};at.styles=n`
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
  `,e([he({attribute:!1})],at.prototype,"hass",void 0),at=e([de("planavista-calendar-card-editor")],at);let st=class extends oe{constructor(){super(...arguments),this.events=[],this.calendars=[],this.currentDate=new Date,this.hiddenCalendars=new Set,this.timeFormat="12h",this.hideColumnHeaders=!1,this.avatarBorderMode="primary"}firstUpdated(){this._scrollToNow()}updated(e){super.updated(e),e.has("currentDate")&&this._scrollToNow()}_scrollToNow(){requestAnimationFrame(()=>{const e=this.shadowRoot?.querySelector(".time-grid-wrapper");if(!e)return;this._scrollContainer=e;const t=new Date,i=60*(t.getHours()-0)+t.getMinutes();if(i>0&&i<1440){const t=i/1440*e.scrollHeight-e.clientHeight/3;e.scrollTo({top:Math.max(0,t),behavior:"smooth"})}})}render(){const e=Pe(this.events,this.hiddenCalendars),t=new Date(this.currentDate);t.setHours(0,0,0,0);const i=new Date(this.currentDate);i.setHours(23,59,59,999);const r=Oe(e,t,i),a=r.filter(e=>Be(e)),s=r.filter(e=>!Be(e)),n=this.calendars.filter(e=>!1!==e.visible&&!this.hiddenCalendars.has(e.entity_id)),o=function(e,t){const i=new Map,r=new Map(t.map(e=>[e.entity_id,e]));for(const e of t)if(!1!==e.visible){const t=e.person_entity||e.entity_id;i.has(t)||i.set(t,[])}for(const t of e){const e=r.get(t.calendar_entity_id),a=e?.person_entity||t.calendar_entity_id;i.has(a)||i.set(a,[]),i.get(a).push(t)}return i}(s,n),l=Array.from(o.keys()),d=new Date,c=d.toDateString()===this.currentDate.toDateString(),p=60*(d.getHours()-0)+d.getMinutes(),h=c?p/1440*100:-1;return 0===n.length?N`
        <div class="empty-state">
          <ha-icon icon="mdi:calendar-blank"></ha-icon>
          <p>No calendars visible</p>
        </div>
      `:N`
      <div class="day-container">
        ${a.length>0?N`
          <div class="all-day-section">
            <div class="all-day-gutter">All Day</div>
            <div class="all-day-events">
              ${a.map(e=>N`
                <div
                  class="all-day-chip"
                  style="background: ${e.calendar_color}; color: ${He(e.calendar_color)}"
                  @click=${()=>this._onEventClick(e)}
                >${e.summary}</div>
              `)}
            </div>
          </div>
        `:W}

        ${this.hideColumnHeaders?W:N`
          <div class="column-headers">
            <div class="header-gutter"></div>
            ${l.map(e=>{const t=n.find(t=>(t.person_entity||t.entity_id)===e),i=t?.person_entity?Ke(this.hass,t.person_entity):null,r=t?.person_entity?Ge(this.hass,t.person_entity):t?.display_name||e,a=t?.color||"#6366F1",s=t?.color_light||a,o="light"===this.avatarBorderMode?s:"primary"===this.avatarBorderMode?a:void 0;return N`
                <div class="person-header">
                  ${i?N`<img class="person-avatar" src="${i}" alt="${r}"
                        style="${o?`--pv-avatar-border: ${o}`:""}" />`:N`<div class="person-initial" style="background: ${a}">${r[0]?.toUpperCase()||"?"}</div>`}
                  <span class="person-name">${r}</span>
                </div>
              `})}
          </div>
        `}

        ${c?W:N`
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
              ${h>=0&&h<=100?N`
                <div class="pv-now-line" style="top: ${h}%"></div>
              `:W}
              ${l.map(e=>this._renderColumn(e,o.get(e)||[]))}
            </div>
          </div>
          ${this._renderNextDayFooter()}
        </div>
      </div>
    `}_renderTimeLabels(){const e=[];for(let t=0;t<=24;t++){const i=(t-0)/24*100;let r;if("24h"===this.timeFormat)r=`${String(t%24).padStart(2,"0")}:00`;else{const e=t%24;r=`${e%12||12} ${e>=12?"PM":"AM"}`}e.push(N`
        <div class="time-label" style="top: ${i}%">${r}</div>
      `)}return e}_renderHourLines(){const e=[],t=1/24*100;for(let i=0;i<24;i++){const r=(i-0)/24*100;i%2==1&&e.push(N`
          <div class="hour-band-odd" style="top: ${r}%; height: ${t}%"></div>
        `)}return e}_renderNextDayFooter(){const e=new Date(this.currentDate);e.setDate(e.getDate()+1);const t=e.toLocaleDateString("en-US",{weekday:"long",month:"long",day:"numeric"});return N`
      <div class="next-day-footer" @click=${this._goToNextDay}>
        ${t}
        <ha-icon icon="mdi:arrow-down"></ha-icon>
      </div>
    `}_goToToday(){this.dispatchEvent(new CustomEvent("day-click",{detail:{date:new Date},bubbles:!0,composed:!0}))}_goToNextDay(){const e=new Date(this.currentDate);e.setDate(e.getDate()+1),this.dispatchEvent(new CustomEvent("day-click",{detail:{date:e},bubbles:!0,composed:!0}))}_renderColumn(e,t){const i=function(e){const t=e.filter(e=>!Be(e)).sort((e,t)=>new Date(e.start).getTime()-new Date(t.start).getTime());if(0===t.length)return[];const i=t.map(e=>({event:e,start:new Date(e.start).getTime(),end:new Date(e.end).getTime(),column:0,cluster:0}));let r=0,a=0;for(let e=0;e<i.length;e++){let t=!1;for(let r=a;r<e;r++)if(i[e].start<i[r].end){t=!0;break}if(!t&&e>a){const t=e;let s=0;for(let e=a;e<t;e++)s=Math.max(s,i[e].column+1);for(let e=a;e<t;e++)i[e].cluster=r;r++,a=e}const s=new Set;for(let t=a;t<e;t++)i[e].start<i[t].end&&s.add(i[t].column);let n=0;for(;s.has(n);)n++;i[e].column=n}i.forEach((e,t)=>{t>=a&&(e.cluster=r)});const s=new Map;for(const e of i){const t=s.get(e.cluster)||0;s.set(e.cluster,Math.max(t,e.column+1))}return i.map(e=>({...e.event,column:e.column,totalColumns:s.get(e.cluster)||1}))}(t);return N`
      <div class="person-column">
        ${i.map(e=>{const t=function(e,t=0,i=24){const r=new Date(e.start),a=new Date(e.end),s=60*(i-t);let n,o;return n=Math.max(0,60*(r.getHours()-t)+r.getMinutes()),o=Math.min(s,60*(a.getHours()-t)+a.getMinutes()),a.toDateString()!==r.toDateString()&&o<=0&&(o=s),n=Math.max(0,Math.min(n,s)),o=Math.max(0,Math.min(o,s)),{top:n/s*100,height:Math.max(o-n,15)/s*100}}(e,0,24),i=e.totalColumns>1?`calc(${100/e.totalColumns}% - 6px)`:"calc(100% - 6px)",r=e.totalColumns>1?`calc(${e.column/e.totalColumns*100}% + 3px)`:"3px";return N`
            <div
              class="positioned-event"
              style="
                top: ${t.top}%;
                height: ${t.height}%;
                width: ${i};
                left: ${r};
                --event-color: ${e.calendar_color};
                --event-color-light: ${e.calendar_color_light||""};
                --event-text: ${He(e.calendar_color_light||e.calendar_color)};
              "
              @click=${()=>this._onEventClick(e)}
            >
              <div class="event-title">${e.summary}</div>
              <div class="event-time">${Ee(e.start,this.timeFormat)}</div>
            </div>
          `})}
      </div>
    `}_onEventClick(e){this.dispatchEvent(new CustomEvent("event-click",{detail:{event:e},bubbles:!0,composed:!0}))}};st.styles=[me,ye,we,_e,n`
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

      /* Hour lines — transparent, replaced by alternating bands */
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

      /* Positioned events — light background, accent border */
      .positioned-event {
        position: absolute;
        left: 3px;
        right: 3px;
        padding: 6px 10px;
        border-radius: 4px;
        border-left: 3px solid var(--event-color);
        background: var(--event-color-light, color-mix(in srgb, var(--event-color) 12%, white));
        cursor: pointer;
        overflow: hidden;
        transition: all 200ms ease;
        z-index: 1;
        min-height: 26px;
      }

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

      /* xs: phones — hide column headers, compact events */
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

      /* sm: large phones — hide column headers, narrower gutter */
      @media (min-width: 480px) and (max-width: 767px) {
        .column-headers { display: none; }
        .time-gutter { width: 48px; }
        .all-day-gutter { width: 48px; }
        .positioned-event { padding: 4px 8px; }
        .event-title { font-size: 0.875rem; }
      }

      /* md: tablets — smaller avatars */
      @media (min-width: 768px) and (max-width: 1023px) {
        .person-avatar, .person-initial { width: 48px; height: 48px; font-size: 1.125rem; }
        .person-name { font-size: 0.8125rem; }
      }

      /* short height — compact avatars */
      @media (max-height: 500px) {
        .person-avatar, .person-initial { width: 32px; height: 32px; font-size: 0.875rem; }
        .person-header { padding: 0.375rem 0.25rem; gap: 3px; }
        .person-name { font-size: 0.75rem; }
      }

      /* tall height — larger avatars */
      @media (min-height: 901px) {
        .person-avatar, .person-initial { width: 64px; height: 64px; }
      }

      /* lg: large screens (1024–1439px) — scale up ~20% */
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

      /* xl: wall displays (1440px+) — scale up ~40% */
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
    `],e([he({attribute:!1})],st.prototype,"hass",void 0),e([he({type:Array})],st.prototype,"events",void 0),e([he({type:Array})],st.prototype,"calendars",void 0),e([he({type:Object})],st.prototype,"currentDate",void 0),e([he({type:Object})],st.prototype,"hiddenCalendars",void 0),e([he({attribute:!1})],st.prototype,"timeFormat",void 0),e([he({type:Boolean})],st.prototype,"hideColumnHeaders",void 0),e([he({attribute:!1})],st.prototype,"avatarBorderMode",void 0),st=e([de("pv-view-day")],st);const nt=["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];let ot=class extends oe{constructor(){super(...arguments),this.events=[],this.calendars=[],this.currentDate=new Date,this.hiddenCalendars=new Set,this.timeFormat="12h",this.firstDay="sunday",this.weatherEntity="",this.showStripes=!0,this._forecast=[],this._subscribedEntity=""}_getWeekDays(){const e=Se(this.currentDate,this.firstDay);return Array.from({length:7},(t,i)=>{const r=new Date(e);return r.setDate(r.getDate()+i),r})}_getWeekLabel(e){const t=e[0],i=e[6],r={month:"long",day:"numeric"};return t.getMonth()===i.getMonth()?`${t.toLocaleDateString("en-US",{month:"long"})} ${t.getDate()} – ${i.getDate()}`:`${t.toLocaleDateString("en-US",r)} – ${i.toLocaleDateString("en-US",r)}`}updated(e){super.updated(e),(e.has("weatherEntity")||e.has("hass"))&&this._subscribeWeather()}disconnectedCallback(){super.disconnectedCallback(),this._unsubWeather()}_unsubWeather(){this._weatherUnsub&&(this._weatherUnsub(),this._weatherUnsub=void 0),this._subscribedEntity=""}async _subscribeWeather(){if(!this.weatherEntity||!this.hass?.connection)return this._unsubWeather(),void(this._forecast=[]);if(this._subscribedEntity!==this.weatherEntity||!this._weatherUnsub){this._unsubWeather(),this._subscribedEntity=this.weatherEntity;try{this._weatherUnsub=await this.hass.connection.subscribeMessage(e=>{this._forecast=e.forecast||[]},{type:"weather/subscribe_forecast",forecast_type:"daily",entity_id:this.weatherEntity})}catch{const e=this.hass.states[this.weatherEntity];e?.attributes?.forecast&&(this._forecast=e.attributes.forecast)}}}_getForecastMap(){const e=new Map;for(const t of this._forecast){if(!t.datetime)continue;const i=Ae(new Date(t.datetime));e.set(i,{condition:t.condition||"",tempHigh:t.temperature??0,tempLow:t.templow??t.temperature??0})}return e}render(){const e=Pe(this.events,this.hiddenCalendars),t=this._getWeekDays(),i=new Date(t[0]);i.setHours(0,0,0,0);const r=new Date(t[6]);r.setHours(23,59,59,999);const a=Me(Oe(e,i,r),this.calendars),s=this._getForecastMap();return N`
      <div class="week-container">
        <div class="week-label">${this._getWeekLabel(t)}</div>
        <div class="day-grid">
          ${t.map(e=>this._renderDayCard(e,a,s))}
        </div>
      </div>
    `}_renderDayCard(e,t,i){const r=ze(e),a=Ae(e),s=new Date(e);s.setHours(0,0,0,0);const n=new Date(e);n.setHours(23,59,59,999);const o=t.filter(e=>{const t=new Date(e.start),i=new Date(e.end);return t<n&&i>s}).sort((e,t)=>{const i=Be(e),r=Be(t);return i&&!r?-1:!i&&r?1:new Date(e.start).getTime()-new Date(t.start).getTime()}),l=i.get(a),d=`${nt[e.getDay()]} ${e.getDate()}`,c=o.length;return N`
      <div class="day-card ${r?"day-card--today":""}">
        <div class="day-card-header">
          <div class="day-card-header-left">
            <div class="day-name">${d}</div>
            <div class="day-meta">
              <span>${c} event${1!==c?"s":""}</span>
              <button class="add-event-link" @click=${()=>this._addEvent(e)}>+ Add</button>
            </div>
          </div>
          ${l?N`
            <div class="day-weather">
              ${it(l.condition)}
              <span class="day-weather-temp">${Math.round(l.tempHigh)}°/${Math.round(l.tempLow)}°</span>
            </div>
          `:W}
        </div>
        ${o.length>0?N`
          <div class="day-card-events">
            ${o.map(e=>N`
              <pv-event-chip
                .hass=${this.hass}
                .event=${e}
                .calendars=${this.calendars}
                .timeFormat=${this.timeFormat}
                .showStripes=${this.showStripes}
                @event-click=${e=>this._onEventClick(e.detail.event)}
              ></pv-event-chip>
            `)}
          </div>
        `:N`
          <div class="day-card-empty">No events</div>
        `}
      </div>
    `}_addEvent(e){this.dispatchEvent(new CustomEvent("create-event",{detail:{date:e},bubbles:!0,composed:!0}))}_onEventClick(e){this.dispatchEvent(new CustomEvent("event-click",{detail:{event:e},bubbles:!0,composed:!0}))}};ot.styles=[me,_e,n`
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
        border-radius: var(--pv-radius-md, 12px);
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

      /* MD: tablets — 2 columns */
      @media (max-width: 1023px) {
        .day-grid { grid-template-columns: repeat(2, 1fr); }
      }

      /* SM/XS: phones — 1 column (agenda-like) */
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

      /* XL: wall displays — ~50% larger */
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
    `],e([he({attribute:!1})],ot.prototype,"hass",void 0),e([he({type:Array})],ot.prototype,"events",void 0),e([he({type:Array})],ot.prototype,"calendars",void 0),e([he({type:Object})],ot.prototype,"currentDate",void 0),e([he({type:Object})],ot.prototype,"hiddenCalendars",void 0),e([he({attribute:!1})],ot.prototype,"timeFormat",void 0),e([he({attribute:!1})],ot.prototype,"firstDay",void 0),e([he({attribute:!1})],ot.prototype,"weatherEntity",void 0),e([he({type:Boolean})],ot.prototype,"showStripes",void 0),e([ve()],ot.prototype,"_forecast",void 0),ot=e([de("pv-view-week")],ot);const lt=["Sun","Mon","Tue","Wed","Thu","Fri","Sat"],dt=["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];let ct=class extends oe{constructor(){super(...arguments),this.events=[],this.calendars=[],this.currentDate=new Date,this.hiddenCalendars=new Set,this.firstDay="sunday",this.timeFormat="12h",this.showStripes=!0}render(){const e=Me(Pe(this.events,this.hiddenCalendars),this.calendars),t=function(e,t="sunday"){const i=Se(new Date(e.getFullYear(),e.getMonth(),1),t),r=[];for(let e=0;e<42;e++){const t=new Date(i);t.setDate(i.getDate()+e),r.push(t)}return r}(this.currentDate,this.firstDay),i=Te(e),r=this.currentDate.getMonth(),a="monday"===this.firstDay?dt:lt,s=this.currentDate.toLocaleDateString("en-US",{month:"long",year:"numeric"});return N`
      <div class="month-container">
        <div class="month-name">${s}</div>
        <div class="weekday-header">
          ${a.map(e=>N`<div class="weekday-name">${e}</div>`)}
        </div>
        <div class="month-grid">
          ${t.map(e=>this._renderDayCell(e,r,i))}
        </div>
      </div>
    `}_renderDayCell(e,t,i){const r=Ae(e),a=i.get(r)||[],s=e.getMonth()!==t,n=ze(e),o=a.slice(0,3),l=a.length-3;return N`
      <div
        class="day-cell ${s?"other-month":""} ${n?"today":""}"
        @click=${()=>this._onDayClick(e)}
      >
        <div class="day-number">${e.getDate()}</div>
        <div class="day-events">
          ${o.map(e=>N`
            <pv-event-chip
              .hass=${this.hass}
              .event=${e}
              .calendars=${this.calendars}
              .timeFormat=${this.timeFormat}
              .compact=${!0}
              .showStripes=${this.showStripes}
              @event-click=${e=>{e.stopPropagation(),this._onEventClick(e.detail.event)}}
            ></pv-event-chip>
          `)}
          ${l>0?N`
            <div class="more-events" @click=${t=>{t.stopPropagation(),this._onDayClick(e)}}>
              +${l} more
            </div>
          `:W}
        </div>
      </div>
    `}_onDayClick(e){this.dispatchEvent(new CustomEvent("day-click",{detail:{date:e},bubbles:!0,composed:!0}))}_onEventClick(e){this.dispatchEvent(new CustomEvent("event-click",{detail:{event:e},bubbles:!0,composed:!0}))}};ct.styles=[me,n`
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
        border-radius: 50%;
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

      /* xs: phones — compact day cells */
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

      /* short height — tighter cells */
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
    `],e([he({attribute:!1})],ct.prototype,"hass",void 0),e([he({type:Array})],ct.prototype,"events",void 0),e([he({type:Array})],ct.prototype,"calendars",void 0),e([he({type:Object})],ct.prototype,"currentDate",void 0),e([he({type:Object})],ct.prototype,"hiddenCalendars",void 0),e([he({attribute:!1})],ct.prototype,"firstDay",void 0),e([he({attribute:!1})],ct.prototype,"timeFormat",void 0),e([he({type:Boolean})],ct.prototype,"showStripes",void 0),ct=e([de("pv-view-month")],ct);const pt=["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];let ht=class extends oe{constructor(){super(...arguments),this.events=[],this.calendars=[],this.currentDate=new Date,this.hiddenCalendars=new Set,this.timeFormat="12h",this.weatherEntity="",this.showStripes=!0,this._daysLoaded=14,this._forecast=[],this._subscribedEntity=""}render(){const e=new Date;e.setHours(0,0,0,0);const t=[];for(let i=0;i<this._daysLoaded;i++){const r=new Date(e);r.setDate(r.getDate()+i),t.push(r)}const i=Te(Me(Pe(this.events,this.hiddenCalendars),this.calendars)),r=this._getForecastMap();return N`
      <div class="agenda-container">
        ${t.map(e=>this._renderDayCard(e,i,r))}
        <div class="load-more" @click=${this._loadMore}>
          Load more days
        </div>
      </div>
    `}_renderDayCard(e,t,i){const r=Ae(e),a=t.get(r)||[],s=ze(e),n=i.get(r),o=function(e){if(ze(e))return"Today";if(function(e){const t=new Date;return t.setDate(t.getDate()+1),e.getFullYear()===t.getFullYear()&&e.getMonth()===t.getMonth()&&e.getDate()===t.getDate()}(e))return"Tomorrow";const t=new Date,i=Math.floor((e.getTime()-t.getTime())/864e5);return i<7&&i>=0?e.toLocaleDateString("en-US",{weekday:"long"}):De(e,"medium")}(e),l=De(e,"long"),d=[...a].sort((e,t)=>{const i=Be(e),r=Be(t);return i&&!r?-1:!i&&r?1:e.start.localeCompare(t.start)});return N`
      <div class="day-card ${s?"day-card--today":""}">
        <div class="day-card-header">
          <div class="day-card-header-left">
            <span class="day-name ${s?"day-name--today":""}">
              ${pt[e.getDay()]} ${e.getDate()}
            </span>
            ${o?N`<span class="day-relative">${o}</span>`:N`<span class="day-relative">${l}</span>`}
          </div>
          ${n?N`
            <div class="day-weather">
              ${it(n.condition,20)}
              <span class="day-weather-temps">${Math.round(n.tempHigh)}°/${Math.round(n.tempLow)}°</span>
            </div>
          `:W}
        </div>
        <div class="day-subheader">
          <span>${d.length} event${1!==d.length?"s":""}</span>
          <button class="add-event-link" @click=${()=>this._addEvent(e)}>+ Add event</button>
        </div>
        <div class="day-events">
          ${d.length>0?d.map(e=>N`
                <pv-event-chip
                  .hass=${this.hass}
                  .event=${e}
                  .calendars=${this.calendars}
                  .timeFormat=${this.timeFormat}
                  .showStripes=${this.showStripes}
                  @event-click=${e=>this._onEventClick(e.detail.event)}
                ></pv-event-chip>
              `):N`<div class="empty-day">No events</div>`}
        </div>
      </div>
    `}updated(e){super.updated(e),(e.has("weatherEntity")||e.has("hass"))&&this._subscribeWeather()}disconnectedCallback(){super.disconnectedCallback(),this._unsubWeather()}_unsubWeather(){this._weatherUnsub&&(this._weatherUnsub(),this._weatherUnsub=void 0),this._subscribedEntity=""}async _subscribeWeather(){if(!this.weatherEntity||!this.hass?.connection)return this._unsubWeather(),void(this._forecast=[]);if(this._subscribedEntity!==this.weatherEntity||!this._weatherUnsub){this._unsubWeather(),this._subscribedEntity=this.weatherEntity;try{this._weatherUnsub=await this.hass.connection.subscribeMessage(e=>{this._forecast=e.forecast||[]},{type:"weather/subscribe_forecast",forecast_type:"daily",entity_id:this.weatherEntity})}catch{const e=this.hass.states[this.weatherEntity];e?.attributes?.forecast&&(this._forecast=e.attributes.forecast)}}}_getForecastMap(){const e=new Map;for(const t of this._forecast){if(!t.datetime)continue;const i=Ae(new Date(t.datetime));e.set(i,{condition:t.condition||"",tempHigh:t.temperature??0,tempLow:t.templow??t.temperature??0})}return e}_loadMore(){this._daysLoaded+=14}_addEvent(e){this.dispatchEvent(new CustomEvent("create-event",{detail:{date:e},bubbles:!0,composed:!0}))}_onEventClick(e){this.dispatchEvent(new CustomEvent("event-click",{detail:{event:e},bubbles:!0,composed:!0}))}};ht.styles=[me,_e,n`
      :host { display: block; height: 100%; overflow: hidden; }

      .agenda-container {
        display: flex;
        flex-direction: column;
        height: 100%;
        overflow-y: auto;
        scroll-behavior: smooth;
      }

      .day-card {
        display: flex;
        flex-direction: column;
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

      /* XL: wall displays — ~50% larger */
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
    `],e([he({attribute:!1})],ht.prototype,"hass",void 0),e([he({type:Array})],ht.prototype,"events",void 0),e([he({type:Array})],ht.prototype,"calendars",void 0),e([he({type:Object})],ht.prototype,"currentDate",void 0),e([he({type:Object})],ht.prototype,"hiddenCalendars",void 0),e([he({attribute:!1})],ht.prototype,"timeFormat",void 0),e([he({attribute:!1})],ht.prototype,"weatherEntity",void 0),e([he({type:Boolean})],ht.prototype,"showStripes",void 0),e([ve()],ht.prototype,"_daysLoaded",void 0),e([ve()],ht.prototype,"_forecast",void 0),ht=e([de("pv-view-agenda")],ht);let vt=class extends oe{constructor(){super(...arguments),this.event=null,this.timeFormat="12h",this._confirmDelete=!1,this._deleting=!1,this._deleteError="",this._pv=new tt(this)}render(){if(!this.event)return W;const e=this.event,t=Be(e),i=new Date(e.start);return N`
      <div class="pv-overlay" @click=${this._close}>
        <div class="pv-popup" @click=${e=>e.stopPropagation()} style="position: relative;">
          <button class="pv-btn-icon close-btn" @click=${this._close}>
            <ha-icon icon="mdi:close"></ha-icon>
          </button>

          <div class="popup-header">
            <h3 class="popup-title">${e.summary}</h3>
            <div class="popup-calendar">
              <span class="calendar-indicator" style="background: ${e.calendar_color}"></span>
              ${e.calendar_name}
            </div>
          </div>

          <div class="popup-body">
            <div class="detail-row">
              <ha-icon icon="mdi:clock-outline"></ha-icon>
              <div class="detail-text">
                <div>${De(i,"long")}</div>
                ${t?N`
                  <div style="color: var(--pv-text-secondary); font-size: 0.875rem">All Day</div>
                `:N`
                  <div style="color: var(--pv-text-secondary); font-size: 0.875rem">
                    ${Ee(e.start,this.timeFormat)} – ${Ee(e.end,this.timeFormat)}
                  </div>
                `}
              </div>
            </div>

            ${e.location?N`
              <div class="detail-row">
                <ha-icon icon="mdi:map-marker-outline"></ha-icon>
                <div class="detail-text">${e.location}</div>
              </div>
            `:W}

            ${e.description?N`
              <div class="detail-row">
                <ha-icon icon="mdi:text"></ha-icon>
                <div class="detail-text" style="white-space: pre-wrap;">${e.description}</div>
              </div>
            `:W}
          </div>

          ${this._confirmDelete?N`
            <div class="delete-confirm">
              <div class="delete-confirm-text">
                Delete "${e.summary}"?
              </div>
              ${this._deleteError?N`
                <div style="color: #EF4444; font-size: 0.8125rem; margin-top: 0.5rem;">${this._deleteError}</div>
              `:W}
              <div class="delete-confirm-actions">
                <button class="pv-btn pv-btn-secondary" @click=${()=>{this._confirmDelete=!1,this._deleteError=""}}>
                  Cancel
                </button>
                <button class="pv-btn btn-delete" ?disabled=${this._deleting} @click=${this._delete}>
                  ${this._deleting?"Deleting...":"Delete"}
                </button>
              </div>
            </div>
          `:N`
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
    `}_close(){this._confirmDelete=!1,this._deleting=!1,this._deleteError="",this._pv.state.selectEvent(null)}_edit(){this.event&&this._pv.state.openEditDialog(this.event)}async _delete(){if(this.event?.uid){this._deleting=!0,this._deleteError="";try{const e={entity_id:this.event.calendar_entity_id,uid:this.event.uid,recurrence_id:this.event.recurrence_id};await this._pv.state.doDeleteEvent(this.hass,e)}catch(e){console.error("PlanaVista: Delete failed",e),this._deleteError="Failed to delete event. Please try again.",this._deleting=!1}}else this._deleteError="Cannot delete — this event has no unique ID. Delete it from your calendar app directly."}};vt.styles=[me,be,fe,_e,n`
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
    `],e([he({attribute:!1})],vt.prototype,"hass",void 0),e([he({type:Object})],vt.prototype,"event",void 0),e([he({attribute:!1})],vt.prototype,"timeFormat",void 0),e([ve()],vt.prototype,"_confirmDelete",void 0),e([ve()],vt.prototype,"_deleting",void 0),e([ve()],vt.prototype,"_deleteError",void 0),vt=e([de("pv-event-popup")],vt);const gt=["Su","Mo","Tu","We","Th","Fr","Sa"];let mt=class extends oe{constructor(){super(...arguments),this.calendars=[],this.open=!1,this.mode="create",this.prefill=null,this._title="",this._calendarEntityId="",this._date="",this._startTime="",this._endTime="",this._allDay=!1,this._description="",this._location="",this._showMore=!1,this._saving=!1,this._error="",this._datePickerOpen=!1,this._pickerMonth=0,this._pickerYear=0,this._locationSuggestions=[],this._locationLoading=!1,this._locationFocused=!1,this._locationDebounceTimer=null,this._pv=new tt(this)}updated(e){super.updated(e),e.has("open")&&this.open&&(this._initForm(),this._datePickerOpen=!1,requestAnimationFrame(()=>{this._titleInput?.focus()}))}_initForm(){if(this._error="",this._saving=!1,this._showMore=!1,this._locationSuggestions=[],this._locationFocused=!1,this.prefill){if(this._title=this.prefill.summary||"",this._calendarEntityId=this.prefill.calendar_entity_id||this.calendars[0]?.entity_id||"",this._description=this.prefill.description||"",this._location=this.prefill.location||"",this.prefill.start){const e=new Date(this.prefill.start);this._date=this._toDateStr(e),this._pickerYear=e.getFullYear(),this._pickerMonth=e.getMonth(),!this.prefill.start.includes("T")||0===e.getHours()&&0===e.getMinutes()?(this._allDay=!0,this._startTime="",this._endTime=""):(this._allDay=!1,this._startTime=this._toTimeStr(e),this.prefill.end&&(this._endTime=this._toTimeStr(new Date(this.prefill.end))))}else this._setDefaults();(this._description||this._location)&&(this._showMore=!0)}else this._setDefaults()}_setDefaults(){this._title="",this._calendarEntityId=this.calendars[0]?.entity_id||"";const e=new Date;this._date=this._toDateStr(e),this._pickerYear=e.getFullYear(),this._pickerMonth=e.getMonth();const t=15*Math.ceil(e.getMinutes()/15);e.setMinutes(t,0,0),this._startTime=this._toTimeStr(e);const i=new Date(e);i.setHours(i.getHours()+1),this._endTime=this._toTimeStr(i),this._allDay=!1,this._description="",this._location=""}_toDateStr(e){return`${e.getFullYear()}-${String(e.getMonth()+1).padStart(2,"0")}-${String(e.getDate()).padStart(2,"0")}`}_toTimeStr(e){return`${String(e.getHours()).padStart(2,"0")}:${String(e.getMinutes()).padStart(2,"0")}`}_formatDateDisplay(){if(!this._date)return"Select a date";const[e,t,i]=this._date.split("-").map(Number);return new Date(e,t-1,i).toLocaleDateString("en-US",{weekday:"short",month:"long",day:"numeric",year:"numeric"})}render(){if(!this.open)return W;const e=this.calendars.filter(e=>!1!==e.visible),t="edit"===this.mode,i=t?"Edit Event":"New Event";return N`
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
              ${this._error?N`<div class="error-msg">${this._error}</div>`:W}

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
                <label class="pv-label">Calendar</label>
                <div class="calendar-select">
                  ${e.map(e=>N`
                    <button
                      class="cal-option ${this._calendarEntityId===e.entity_id?"selected":""}"
                      style="${this._calendarEntityId===e.entity_id?`background: ${e.color}; --cal-bg: ${e.color}`:`--cal-bg: ${e.color}`}"
                      @click=${()=>this._calendarEntityId=e.entity_id}
                    >
                      <span class="cal-dot" style="background: ${e.color}"></span>
                      ${e.display_name}
                    </button>
                  `)}
                </div>
              </div>

              <div class="form-field">
                <label class="pv-label">Date</label>
                ${this._renderDatePicker()}
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

              ${this._allDay?W:N`
                <div class="form-row">
                  <div class="form-field">
                    <label class="pv-label">Start Time</label>
                    <input
                      class="pv-input"
                      type="time"
                      .value=${this._startTime}
                      @input=${e=>this._startTime=e.target.value}
                    />
                  </div>
                  <div class="form-field">
                    <label class="pv-label">End Time</label>
                    <input
                      class="pv-input"
                      type="time"
                      .value=${this._endTime}
                      @input=${e=>this._endTime=e.target.value}
                    />
                  </div>
                </div>
              `}

              ${this._showMore?N`
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
              `:N`
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
    `}_renderDatePicker(){return N`
      <div class="date-picker-wrap">
        <div class="date-display" @click=${this._toggleDatePicker}>
          <ha-icon icon="mdi:calendar"></ha-icon>
          ${this._formatDateDisplay()}
        </div>
      </div>
    `}_renderDatePickerDropdown(){if(!this._datePickerOpen)return W;const e=this._dateDisplay;if(!e)return W;const t=e.getBoundingClientRect(),i=window.innerHeight-t.bottom-8<330&&t.top>330?t.top-330-4:t.bottom+4;return N`
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
          ${gt.map(e=>N`<span class="picker-weekday">${e}</span>`)}
        </div>
        <div class="picker-days">
          ${this._getPickerDays().map(e=>{const t=e.getMonth()!==this._pickerMonth,i=this._toDateStr(e)===this._toDateStr(new Date),r=this._toDateStr(e)===this._date;return N`
              <button
                class="picker-day ${t?"other-month":""} ${i?"today":""} ${r?"selected":""}"
                @click=${()=>this._selectPickerDay(e)}
              >${e.getDate()}</button>
            `})}
        </div>
      </div>
    `}_toggleDatePicker(){if(this._datePickerOpen=!this._datePickerOpen,this._datePickerOpen&&this._date){const[e,t]=this._date.split("-").map(Number);this._pickerYear=e,this._pickerMonth=t-1}}_pickerPrevMonth(){this._pickerMonth--,this._pickerMonth<0&&(this._pickerMonth=11,this._pickerYear--)}_pickerNextMonth(){this._pickerMonth++,this._pickerMonth>11&&(this._pickerMonth=0,this._pickerYear++)}_getPickerDays(){const e=new Date(this._pickerYear,this._pickerMonth,1),t=e.getDay(),i=new Date(e);i.setDate(i.getDate()-t);const r=[];for(let e=0;e<42;e++){const t=new Date(i);t.setDate(t.getDate()+e),r.push(t)}return r}_selectPickerDay(e){this._date=this._toDateStr(e),this._datePickerOpen=!1}_renderLocationField(){return N`
      <div class="location-wrap">
        <input
          class="pv-input location-input"
          type="text"
          placeholder="Search for a place or address..."
          .value=${this._location}
          @input=${this._onLocationInput}
          @focus=${()=>this._locationFocused=!0}
          @blur=${()=>{setTimeout(()=>{this._locationFocused=!1},250)}}
        />
      </div>
    `}_renderLocationDropdown(){if(!this._locationFocused||!this._locationSuggestions.length&&!this._locationLoading)return W;const e=this._locationInput;if(!e)return W;const t=e.getBoundingClientRect();return N`
      <div
        class="location-suggestions-fixed"
        style="top: ${t.bottom}px; left: ${t.left}px; width: ${t.width}px;"
      >
        ${this._locationLoading?N`
          <div class="location-loading">Searching...</div>
        `:W}
        ${this._locationSuggestions.map(e=>N`
          <div class="location-suggestion" @mousedown=${()=>this._selectLocation(e.display_name)}>
            <ha-icon icon="mdi:map-marker"></ha-icon>
            <span>${e.display_name}</span>
          </div>
        `)}
        ${this._locationSuggestions.length>0?N`
          <div class="location-powered">Powered by OpenStreetMap</div>
        `:W}
      </div>
    `}_onLocationInput(e){const t=e.target.value;if(this._location=t,this._locationDebounceTimer&&clearTimeout(this._locationDebounceTimer),t.trim().length<3)return this._locationSuggestions=[],void(this._locationLoading=!1);this._locationLoading=!0,this._locationDebounceTimer=setTimeout(()=>{this._searchLocation(t.trim())},350)}async _searchLocation(e){try{const t=this.hass?.config?.latitude,i=this.hass?.config?.longitude;let r=`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(e)}&format=json&addressdetails=1&limit=20`;if(null!=t&&null!=i){const e=2;r+=`&viewbox=${i-e},${t+e},${i+e},${t-e}`,r+="&bounded=0"}const a=await fetch(r,{headers:{"Accept-Language":"en"}});if(!a.ok)throw new Error("Search failed");const s=await a.json();null!=t&&null!=i&&s.sort((e,r)=>this._haversine(t,i,parseFloat(e.lat),parseFloat(e.lon))-this._haversine(t,i,parseFloat(r.lat),parseFloat(r.lon))),this._locationSuggestions=s.slice(0,5).map(e=>({display_name:e.display_name}))}catch{this._locationSuggestions=[]}finally{this._locationLoading=!1}}_haversine(e,t,i,r){const a=(i-e)*Math.PI/180,s=(r-t)*Math.PI/180,n=Math.sin(a/2)*Math.sin(a/2)+Math.cos(e*Math.PI/180)*Math.cos(i*Math.PI/180)*Math.sin(s/2)*Math.sin(s/2);return 12742*Math.atan2(Math.sqrt(n),Math.sqrt(1-n))}_selectLocation(e){this._location=e,this._locationSuggestions=[],this._locationFocused=!1}_onOverlayClick(){this._close()}_close(){this._datePickerOpen=!1,this._locationSuggestions=[],this._pv.state.closeDialog()}async _save(){if(this._title.trim())if(this._calendarEntityId)if(!this._allDay&&this._endTime<=this._startTime)this._error="End time must be after start time";else{this._error="",this._saving=!0;try{const e={entity_id:this._calendarEntityId,summary:this._title.trim()};if(this._allDay){e.start_date=this._date;const t=new Date(this._date);t.setDate(t.getDate()+1),e.end_date=`${t.getFullYear()}-${String(t.getMonth()+1).padStart(2,"0")}-${String(t.getDate()).padStart(2,"0")}`}else e.start_date_time=`${this._date}T${this._startTime}:00`,e.end_date_time=`${this._date}T${this._endTime}:00`;if(this._description.trim()&&(e.description=this._description.trim()),this._location.trim()&&(e.location=this._location.trim()),"edit"===this.mode){if(!this.prefill?.uid)return this._error="Cannot edit — this event has no unique ID. Try deleting it from your calendar app and re-creating it here.",void(this._saving=!1);const t={entity_id:this.prefill.calendar_entity_id,uid:this.prefill.uid,recurrence_id:this.prefill.recurrence_id};await this._pv.state.doEditEvent(this.hass,t,e)}else await this._pv.state.doCreateEvent(this.hass,e)}catch(e){this._error=`Failed to save event: ${e?.message||"Unknown error"}`,this._saving=!1}}else this._error="Please select a calendar";else this._error="Please enter an event title"}};mt.styles=[me,be,xe,fe,_e,n`
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

      /* xs: phones — bottom-sheet dialog */
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

        .form-row { flex-direction: column; gap: 0.5rem; }

        .cal-option { padding: 0.25rem 0.5rem; font-size: 0.75rem; min-height: 36px; }
      }

      /* sm: large phones — slightly wider dialog */
      @media (min-width: 480px) and (max-width: 767px) {
        .pv-dialog { max-width: calc(100% - 1rem); }
        .pv-dialog-header { padding: 1rem 1.25rem; }
        .pv-dialog-body { padding: 1.25rem; }
      }

      @keyframes pv-slideUp {
        from { transform: translateY(100%); }
        to { transform: translateY(0); }
      }
    `],e([he({attribute:!1})],mt.prototype,"hass",void 0),e([he({type:Array})],mt.prototype,"calendars",void 0),e([he({type:Boolean})],mt.prototype,"open",void 0),e([he({type:String})],mt.prototype,"mode",void 0),e([he({type:Object})],mt.prototype,"prefill",void 0),e([ve()],mt.prototype,"_title",void 0),e([ve()],mt.prototype,"_calendarEntityId",void 0),e([ve()],mt.prototype,"_date",void 0),e([ve()],mt.prototype,"_startTime",void 0),e([ve()],mt.prototype,"_endTime",void 0),e([ve()],mt.prototype,"_allDay",void 0),e([ve()],mt.prototype,"_description",void 0),e([ve()],mt.prototype,"_location",void 0),e([ve()],mt.prototype,"_showMore",void 0),e([ve()],mt.prototype,"_saving",void 0),e([ve()],mt.prototype,"_error",void 0),e([ve()],mt.prototype,"_datePickerOpen",void 0),e([ve()],mt.prototype,"_pickerMonth",void 0),e([ve()],mt.prototype,"_pickerYear",void 0),e([ve()],mt.prototype,"_locationSuggestions",void 0),e([ve()],mt.prototype,"_locationLoading",void 0),e([ve()],mt.prototype,"_locationFocused",void 0),e([ge("#title-input")],mt.prototype,"_titleInput",void 0),e([ge(".location-input")],mt.prototype,"_locationInput",void 0),e([ge(".date-display")],mt.prototype,"_dateDisplay",void 0),mt=e([de("pv-event-create-dialog")],mt);let ut=class extends oe{constructor(){super(...arguments),this._currentTime=new Date,this._filterOpen=!1,this._wizardOpen=!1,this._onboardingDone=!1,this._settingsOpen=!1,this._pv=new tt(this),this._clockTimer=null,this._touchStartX=0,this._filterCloseHandler=e=>this._onFilterClickOutside(e)}connectedCallback(){super.connectedCallback(),this._clockTimer=setInterval(()=>{this._currentTime=new Date},1e3)}disconnectedCallback(){super.disconnectedCallback(),this._clockTimer&&(clearInterval(this._clockTimer),this._clockTimer=null),document.removeEventListener("click",this._filterCloseHandler)}setConfig(e){this._config={entity:"sensor.planavista_config",...e};const t=e?.view||e?.default_view;t&&this._pv.state.setView(t)}firstUpdated(){if(!this._config?.view&&!this._config?.default_view){const e=this.hass?Ze(this.hass,this._config?.entity):null;e?.display?.default_view&&this._pv.state.setView(e.display.default_view)}}updated(e){if(super.updated(e),!this._settingsOpen&&(e.has("hass")||e.has("_config")||e.has("_settingsOpen"))){const e=Ze(this.hass,this._config?.entity);Re(this,Ye(this._config?.theme,e?.display?.theme),e?.display?.theme_overrides||null)}}_getData(){return Ze(this.hass,this._config?.entity)}_getWeatherEntity(){const e=this._getData(),t=this._config?.weather_entity||e?.display?.weather_entity;return t?this.hass?.states?.[t]:null}_getWeatherEntityId(){const e=this._getData();return this._config?.weather_entity||e?.display?.weather_entity||null}_resolveDisplay(){const e=this._getData(),t=e?.display,i=this._config;return{time_format:i?.time_format||t?.time_format||"12h",weather_entity:i?.weather_entity||t?.weather_entity||"",first_day:i?.first_day||t?.first_day||"sunday",default_view:i?.default_view||i?.view||t?.default_view||"week",theme:i?.theme||t?.theme||"light"}}_getVisibleCalendars(){const e=this._getData(),t=(e?.calendars||[]).filter(e=>!1!==e.visible),i=this._config?.calendars;return i&&Array.isArray(i)&&i.length>0?t.filter(e=>i.includes(e.entity_id)):t}_onOnboardingComplete(){this._wizardOpen=!1,this._onboardingDone=!0,We(this)}_openSettings(){this._settingsOpen=!0}_onSettingsSave(){this._settingsOpen=!1,We(this)}_onSettingsClose(){this._settingsOpen=!1,We(this);const e=Ze(this.hass,this._config?.entity);Re(this,Ye(this._config?.theme,e?.display?.theme),e?.display?.theme_overrides||null)}_onThemePreview(e){const{theme:t,overrides:i}=e.detail,r=Ye(t);We(this),Re(this,r,i)}_showWeatherDetails(){const e=this._getWeatherEntityId();if(e){const t=new CustomEvent("hass-more-info",{detail:{entityId:e},bubbles:!0,composed:!0});this.dispatchEvent(t)}}render(){if(!this._config||!this.hass)return W;const e=this._getData();if(!e)return N`
        <ha-card>
          <div class="pvc-empty">
            <p>PlanaVista entity not found</p>
            <p style="font-size: 0.8rem;">Check that the PlanaVista integration is configured.</p>
          </div>
        </ha-card>
      `;if(!1===e.onboarding_complete&&!this._onboardingDone)return this._wizardOpen?N`
          <ha-card>
            <pv-onboarding-wizard
              .hass=${this.hass}
              @onboarding-complete=${this._onOnboardingComplete}
            ></pv-onboarding-wizard>
          </ha-card>
        `:N`
        <ha-card>
          <div class="pvc-setup-pending"
            role="button"
            tabindex="0"
            aria-label="Begin PlanaVista setup"
            @click=${()=>{this._wizardOpen=!0}}
            @keydown=${e=>{"Enter"!==e.key&&" "!==e.key||(e.preventDefault(),this._wizardOpen=!0)}}
          >
            <div class="pvc-setup-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" width="48" height="48" fill="currentColor">
                <path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V9h14v11zM9 14H7v-2h2v2zm4 0h-2v-2h2v2zm4 0h-2v-2h2v2zm-8 4H7v-2h2v2zm4 0h-2v-2h2v2zm4 0h-2v-2h2v2z"/>
              </svg>
            </div>
            <p class="pvc-setup-title">PlanaVista</p>
            <p class="pvc-setup-hint">Tap to begin setup</p>
          </div>
        </ha-card>
      `;const t=this._pv.state,i=t.currentView;t.currentDate;const r=this._getVisibleCalendars(),a=e.events||[],s=this._resolveDisplay(),n=!!this._config?.hide_header,o=Pe(a,t.hiddenCalendars);return N`
      <ha-card>
        ${n?W:this._renderHeader(s)}
        ${this._renderToolbar(r,i)}
        <div class="pvc-body"
          @touchstart=${this._onTouchStart}
          @touchend=${this._onTouchEnd}
          @event-click=${this._onEventClick}
          @day-click=${this._onDayClick}
        >
          ${this._renderView(i,o,r,s)}
        </div>

        ${t.selectedEvent?N`
          <pv-event-popup
            .hass=${this.hass}
            .event=${t.selectedEvent}
            .timeFormat=${s?.time_format||"12h"}
          ></pv-event-popup>
        `:W}

        ${t.dialogOpen?N`
          <pv-event-create-dialog
            .hass=${this.hass}
            .calendars=${r}
            .open=${!0}
            .mode=${t.dialogOpen}
            .prefill=${t.createPrefill}
          ></pv-event-create-dialog>
        `:W}

        ${this._settingsOpen?N`
          <div class="pvc-settings-overlay">
            <pv-onboarding-wizard
              .hass=${this.hass}
              mode="settings"
              .config=${e}
              @settings-save=${this._onSettingsSave}
              @settings-close=${this._onSettingsClose}
              @theme-preview=${this._onThemePreview}
            ></pv-onboarding-wizard>
          </div>
        `:W}
      </ha-card>
    `}_renderHeader(e){const t=this._config?.hide_weather?null:this._getWeatherEntity(),i=e?.time_format||"12h",r=this._currentTime,a=r.getHours(),s=String(r.getMinutes()).padStart(2,"0");let n;n="24h"===i?N`<span class="pvc-time-display">${a}:${s}</span>`:N`<span class="pvc-time-display">${a%12||12}:${s}</span><span class="pvc-time-ampm">${a>=12?"PM":"AM"}</span>`;const o=r.toLocaleDateString("en-US",{weekday:"long",month:"long",day:"numeric"});return N`
      <div class="pvc-header">
        ${t?N`
          <div class="pvc-weather" @click=${this._showWeatherDetails}
               title="Click for weather details">
            <div class="pvc-weather-icon">
              ${it(t.state||"cloudy",48)}
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
        `:N`<div class="pvc-no-weather"></div>`}

        <div class="pvc-header-date">${o}</div>

        <div class="pvc-header-time">${n}</div>
      </div>
    `}_getTempUnit(e){return(e.attributes.temperature_unit||"").includes("C")?"C":"F"}_renderToolbar(e,t){const i=e.filter(e=>this._pv.state.hiddenCalendars.has(e.entity_id)).length;return N`
      <div class="pvc-toolbar">
        <div class="pvc-filter-wrap">
          <button
            class="pvc-filter-btn ${i>0?"has-hidden":""}"
            @click=${this._toggleFilterDropdown}
          >
            <ha-icon icon="mdi:filter-variant" style="--mdc-icon-size: 20px"></ha-icon>
            Calendars
            ${i>0?N`<span class="pvc-filter-badge">${e.length-i}/${e.length}</span>`:W}
          </button>

          ${this._filterOpen?N`
            <div class="pvc-filter-panel">
              ${e.map(e=>{const t=!this._pv.state.hiddenCalendars.has(e.entity_id),i=e.person_entity?Ke(this.hass,e.person_entity):null,r=e.display_name||(e.person_entity?Ge(this.hass,e.person_entity):e.entity_id),a=(r||"?")[0].toUpperCase();return N`
                  <div
                    class="pvc-filter-item ${t?"active":""}"
                    style="--item-color: ${e.color}"
                    @click=${()=>this._pv.state.toggleCalendar(e.entity_id)}
                  >
                    <div class="pvc-filter-check">
                      ${t?N`<span class="pvc-filter-check-icon">✓</span>`:W}
                    </div>
                    <div
                      class="pvc-filter-avatar"
                      style="${i?`background-image: url(${i}); background-color: ${e.color}`:`background: ${e.color}`}"
                    >${i?"":a}</div>
                    <span class="pvc-filter-name">${r}</span>
                  </div>
                `})}
            </div>
          `:W}
        </div>

        <!-- Mobile inline calendar chips (shown on xs/sm via CSS) -->
        <div class="pvc-cal-strip">
          ${e.map(e=>{const t=!this._pv.state.hiddenCalendars.has(e.entity_id),i=e.person_entity?Ke(this.hass,e.person_entity):null,r=e.display_name||(e.person_entity?Ge(this.hass,e.person_entity):e.entity_id),a=(r||"?")[0].toUpperCase();return N`
              <button
                class="pvc-cal-chip ${t?"active":""}"
                style="--chip-color: ${e.color}"
                @click=${()=>this._pv.state.toggleCalendar(e.entity_id)}
              >
                <div
                  class="pvc-cal-chip-avatar"
                  style="${i?`background-image: url(${i}); background-color: ${e.color}`:`background: ${e.color}`}"
                >${i?"":a}</div>
                <span class="pvc-cal-chip-name">${r}</span>
              </button>
            `})}
        </div>

        <div class="pvc-controls">
          <button class="pvc-new-btn" @click=${()=>this._pv.state.openCreateDialog()}>
            + New
          </button>

          <div class="pvc-nav">
            <button class="pvc-nav-btn" @click=${()=>this._pv.state.navigateDate("prev")}>
              <ha-icon icon="mdi:chevron-left"></ha-icon>
            </button>
            <button class="pvc-today-btn" @click=${()=>this._pv.state.navigateDate("today")}>
              Today
            </button>
            <button class="pvc-nav-btn" @click=${()=>this._pv.state.navigateDate("next")}>
              <ha-icon icon="mdi:chevron-right"></ha-icon>
            </button>
          </div>

          <div class="pvc-view-tabs">
            ${["day","week","month","agenda"].map(e=>N`
              <button
                class="pvc-view-tab ${t===e?"active":""}"
                @click=${()=>this._pv.state.setView(e)}
              >${e}</button>
            `)}
          </div>

          <button class="pvc-settings-btn" @click=${this._openSettings}
            title="Settings" aria-label="Open settings">
            <ha-icon icon="mdi:cog"></ha-icon>
          </button>
        </div>
      </div>
    `}_toggleFilterDropdown(e){e.stopPropagation(),this._filterOpen=!this._filterOpen,this._filterOpen?requestAnimationFrame(()=>{document.addEventListener("click",this._filterCloseHandler)}):document.removeEventListener("click",this._filterCloseHandler)}_onFilterClickOutside(e){const t=e.composedPath(),i=this.shadowRoot?.querySelector(".pvc-filter-panel"),r=this.shadowRoot?.querySelector(".pvc-filter-btn");i&&!t.includes(i)&&r&&!t.includes(r)&&(this._filterOpen=!1,document.removeEventListener("click",this._filterCloseHandler))}_renderView(e,t,i,r){const a=r?.time_format||"12h",s=r?.first_day||"sunday",n=this._pv.state.currentDate,o=this._pv.state.hiddenCalendars;switch(e){case"day":return N`<pv-view-day
          .hass=${this.hass}
          .events=${t}
          .calendars=${i}
          .currentDate=${n}
          .hiddenCalendars=${o}
          .timeFormat=${a}
          .hideColumnHeaders=${!1}
          .avatarBorderMode=${r?.theme_overrides?.avatar_border||"primary"}
        ></pv-view-day>`;case"week":return N`<pv-view-week
          .hass=${this.hass}
          .events=${t}
          .calendars=${i}
          .currentDate=${n}
          .hiddenCalendars=${o}
          .timeFormat=${a}
          .firstDay=${s}
          .weatherEntity=${r?.weather_entity||""}
          .showStripes=${"stripes"===(r?.theme_overrides?.event_style||"stripes")}
        ></pv-view-week>`;case"month":return N`<pv-view-month
          .hass=${this.hass}
          .events=${t}
          .calendars=${i}
          .currentDate=${n}
          .hiddenCalendars=${o}
          .firstDay=${s}
          .timeFormat=${a}
          .showStripes=${"stripes"===(r?.theme_overrides?.event_style||"stripes")}
        ></pv-view-month>`;case"agenda":return N`<pv-view-agenda
          .hass=${this.hass}
          .events=${t}
          .calendars=${i}
          .currentDate=${n}
          .hiddenCalendars=${o}
          .timeFormat=${a}
          .weatherEntity=${r?.weather_entity||""}
          .showStripes=${"stripes"===(r?.theme_overrides?.event_style||"stripes")}
        ></pv-view-agenda>`;default:return W}}_onEventClick(e){this._pv.state.selectEvent(e.detail.event)}_onDayClick(e){this._pv.state.setDate(e.detail.date),this._pv.state.setView("day")}_onTouchStart(e){this._touchStartX=e.touches[0].clientX}_onTouchEnd(e){const t=e.changedTouches[0].clientX-this._touchStartX;Math.abs(t)>50&&this._pv.state.navigateDate(t>0?"prev":"next")}static getConfigElement(){return document.createElement("planavista-calendar-card-editor")}static getStubConfig(){return{entity:"sensor.planavista_config"}}getCardSize(){return 10}};ut.styles=[me,be,ue,_e,n`
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
      }

      /* ================================================================
         HEADER — weather left, date center, time right
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

      /* ================================================================
         TOOLBAR — avatars left, controls right
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
        border-radius: 9999px;
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
        border-radius: var(--pv-radius-md, 12px);
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
        border-radius: 6px;
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
        border-radius: 9999px;
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
        border-radius: 9999px;
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
        border-radius: 8px;
        padding: 2px;
      }

      .pvc-view-tab {
        padding: 6px 14px;
        border: none;
        border-radius: 6px;
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

      /* Gear (settings) button */
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

      .pvc-settings-btn:hover {
        background: var(--pv-event-hover);
        color: var(--pv-text);
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

      /* ═══════════════════════════════════════════════
         RESPONSIVE BREAKPOINTS
         ═══════════════════════════════════════════════ */

      /* --- Mobile calendar avatar strip (inline in toolbar) --- */
      .pvc-cal-strip {
        display: none; /* hidden on desktop — filter dropdown used instead */
      }

      /* xs: phones (≤479px) — date-only header, avatar strip, compact controls */
      @media (max-width: 479px) {
        /* Header: date only, slim bar */
        .pvc-header {
          padding: 8px 14px;
          justify-content: center;
        }
        .pvc-weather { display: none; }
        .pvc-header-time { display: none; }
        .pvc-header-date { font-size: 0.9375rem; }

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

      /* sm: large phones (480–767px) — compact header, avatar strip */
      @media (min-width: 480px) and (max-width: 767px) {
        .pvc-header {
          padding: 10px 16px;
        }
        .pvc-weather { display: none; }
        .pvc-header-time { display: none; }
        .pvc-header-date { font-size: 1.0625rem; }

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

      /* md: tablets (768–1023px) — single row, slightly compressed */
      @media (min-width: 768px) and (max-width: 1023px) {
        .pvc-weather-icon { --icon-size: 36px; }
        .pvc-weather-temp { font-size: 1.5rem; }
        .pvc-time-display { font-size: 1.75rem; }
      }

      /* short height (landscape phone, etc.) — date-only compact header */
      @media (max-height: 500px) {
        .pvc-header {
          padding: 6px 14px;
          justify-content: center;
        }
        .pvc-weather { display: none; }
        .pvc-header-time { display: none; }
        .pvc-header-date { font-size: 0.875rem; }
      }

      /* lg: large desktops / small wall displays (1024–1439px) — scale up ~20% */
      @media (min-width: 1024px) {
        .pvc-header { padding: 22px 28px; }
        .pvc-weather-temp { font-size: 2rem; }
        .pvc-weather-condition { font-size: 0.9375rem; }
        .pvc-header-date { font-size: 1.5rem; }
        .pvc-time-display { font-size: 2.5rem; }
        .pvc-time-ampm { font-size: 1rem; }

        .pvc-toolbar { padding: 14px 20px; gap: 10px; }
        .pvc-filter-btn { padding: 10px 20px; font-size: 1rem; min-height: 48px; }
        .pvc-new-btn { padding: 11px 22px; font-size: 1.0625rem; min-height: 48px; }
        .pvc-today-btn { padding: 8px 18px; font-size: 1rem; min-height: 44px; }
        .pvc-nav-btn { width: 48px; height: 48px; --mdc-icon-size: 24px; }
        .pvc-view-tab { padding: 8px 16px; font-size: 0.9375rem; min-height: 44px; }
        .pvc-settings-btn { width: 48px; height: 48px; --mdc-icon-size: 24px; }
      }

      /* xl: wall-mounted touch displays (1440px+, 27"+) — scale up ~40% */
      @media (min-width: 1440px) {
        .pvc-header { padding: 26px 36px; }
        .pvc-weather-icon { --icon-size: 56px; }
        .pvc-weather-temp { font-size: 2.375rem; }
        .pvc-weather-condition { font-size: 1.0625rem; }
        .pvc-header-date { font-size: 1.75rem; }
        .pvc-time-display { font-size: 3rem; }
        .pvc-time-ampm { font-size: 1.125rem; }

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
    `],e([he({attribute:!1})],ut.prototype,"hass",void 0),e([ve()],ut.prototype,"_config",void 0),e([ve()],ut.prototype,"_currentTime",void 0),e([ve()],ut.prototype,"_filterOpen",void 0),e([ve()],ut.prototype,"_wizardOpen",void 0),e([ve()],ut.prototype,"_onboardingDone",void 0),e([ve()],ut.prototype,"_settingsOpen",void 0),ut=e([de("planavista-calendar-card")],ut),window.customCards=window.customCards||[],window.customCards.push({type:"planavista-calendar-card",name:"PlanaVista",description:"All-in-one calendar with clock, weather, toggles, and views",preview:!0}),console.info("%c PLANAVISTA %c v1.0.0 ","color: white; background: #6366F1; font-weight: bold; border-radius: 4px 0 0 4px; padding: 2px 6px;","color: #6366F1; background: #EEF2FF; font-weight: bold; border-radius: 0 4px 4px 0; padding: 2px 6px;");
