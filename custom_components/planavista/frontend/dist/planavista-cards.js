function e(e,t,i,a){var r,n=arguments.length,s=n<3?t:null===a?a=Object.getOwnPropertyDescriptor(t,i):a;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)s=Reflect.decorate(e,t,i,a);else for(var o=e.length-1;o>=0;o--)(r=e[o])&&(s=(n<3?r(s):n>3?r(t,i,s):r(t,i))||s);return n>3&&s&&Object.defineProperty(t,i,s),s}"function"==typeof SuppressedError&&SuppressedError;const t=globalThis,i=t.ShadowRoot&&(void 0===t.ShadyCSS||t.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,a=Symbol(),r=new WeakMap;let n=class{constructor(e,t,i){if(this._$cssResult$=!0,i!==a)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=e,this.t=t}get styleSheet(){let e=this.o;const t=this.t;if(i&&void 0===e){const i=void 0!==t&&1===t.length;i&&(e=r.get(t)),void 0===e&&((this.o=e=new CSSStyleSheet).replaceSync(this.cssText),i&&r.set(t,e))}return e}toString(){return this.cssText}};const s=e=>new n("string"==typeof e?e:e+"",void 0,a),o=(e,...t)=>{const i=1===e.length?e[0]:t.reduce((t,i,a)=>t+(e=>{if(!0===e._$cssResult$)return e.cssText;if("number"==typeof e)return e;throw Error("Value passed to 'css' function must be a 'css' function result: "+e+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(i)+e[a+1],e[0]);return new n(i,e,a)},l=i?e=>e:e=>e instanceof CSSStyleSheet?(e=>{let t="";for(const i of e.cssRules)t+=i.cssText;return s(t)})(e):e,{is:c,defineProperty:d,getOwnPropertyDescriptor:p,getOwnPropertyNames:h,getOwnPropertySymbols:v,getPrototypeOf:g}=Object,u=globalThis,m=u.trustedTypes,f=m?m.emptyScript:"",y=u.reactiveElementPolyfillSupport,b=(e,t)=>e,x={toAttribute(e,t){switch(t){case Boolean:e=e?f:null;break;case Object:case Array:e=null==e?e:JSON.stringify(e)}return e},fromAttribute(e,t){let i=e;switch(t){case Boolean:i=null!==e;break;case Number:i=null===e?null:Number(e);break;case Object:case Array:try{i=JSON.parse(e)}catch(e){i=null}}return i}},w=(e,t)=>!c(e,t),_={attribute:!0,type:String,converter:x,reflect:!1,useDefault:!1,hasChanged:w};Symbol.metadata??=Symbol("metadata"),u.litPropertyMetadata??=new WeakMap;let $=class extends HTMLElement{static addInitializer(e){this._$Ei(),(this.l??=[]).push(e)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(e,t=_){if(t.state&&(t.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(e)&&((t=Object.create(t)).wrapped=!0),this.elementProperties.set(e,t),!t.noAccessor){const i=Symbol(),a=this.getPropertyDescriptor(e,i,t);void 0!==a&&d(this.prototype,e,a)}}static getPropertyDescriptor(e,t,i){const{get:a,set:r}=p(this.prototype,e)??{get(){return this[t]},set(e){this[t]=e}};return{get:a,set(t){const n=a?.call(this);r?.call(this,t),this.requestUpdate(e,n,i)},configurable:!0,enumerable:!0}}static getPropertyOptions(e){return this.elementProperties.get(e)??_}static _$Ei(){if(this.hasOwnProperty(b("elementProperties")))return;const e=g(this);e.finalize(),void 0!==e.l&&(this.l=[...e.l]),this.elementProperties=new Map(e.elementProperties)}static finalize(){if(this.hasOwnProperty(b("finalized")))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(b("properties"))){const e=this.properties,t=[...h(e),...v(e)];for(const i of t)this.createProperty(i,e[i])}const e=this[Symbol.metadata];if(null!==e){const t=litPropertyMetadata.get(e);if(void 0!==t)for(const[e,i]of t)this.elementProperties.set(e,i)}this._$Eh=new Map;for(const[e,t]of this.elementProperties){const i=this._$Eu(e,t);void 0!==i&&this._$Eh.set(i,e)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(e){const t=[];if(Array.isArray(e)){const i=new Set(e.flat(1/0).reverse());for(const e of i)t.unshift(l(e))}else void 0!==e&&t.push(l(e));return t}static _$Eu(e,t){const i=t.attribute;return!1===i?void 0:"string"==typeof i?i:"string"==typeof e?e.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){this._$ES=new Promise(e=>this.enableUpdating=e),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach(e=>e(this))}addController(e){(this._$EO??=new Set).add(e),void 0!==this.renderRoot&&this.isConnected&&e.hostConnected?.()}removeController(e){this._$EO?.delete(e)}_$E_(){const e=new Map,t=this.constructor.elementProperties;for(const i of t.keys())this.hasOwnProperty(i)&&(e.set(i,this[i]),delete this[i]);e.size>0&&(this._$Ep=e)}createRenderRoot(){const e=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return((e,a)=>{if(i)e.adoptedStyleSheets=a.map(e=>e instanceof CSSStyleSheet?e:e.styleSheet);else for(const i of a){const a=document.createElement("style"),r=t.litNonce;void 0!==r&&a.setAttribute("nonce",r),a.textContent=i.cssText,e.appendChild(a)}})(e,this.constructor.elementStyles),e}connectedCallback(){this.renderRoot??=this.createRenderRoot(),this.enableUpdating(!0),this._$EO?.forEach(e=>e.hostConnected?.())}enableUpdating(e){}disconnectedCallback(){this._$EO?.forEach(e=>e.hostDisconnected?.())}attributeChangedCallback(e,t,i){this._$AK(e,i)}_$ET(e,t){const i=this.constructor.elementProperties.get(e),a=this.constructor._$Eu(e,i);if(void 0!==a&&!0===i.reflect){const r=(void 0!==i.converter?.toAttribute?i.converter:x).toAttribute(t,i.type);this._$Em=e,null==r?this.removeAttribute(a):this.setAttribute(a,r),this._$Em=null}}_$AK(e,t){const i=this.constructor,a=i._$Eh.get(e);if(void 0!==a&&this._$Em!==a){const e=i.getPropertyOptions(a),r="function"==typeof e.converter?{fromAttribute:e.converter}:void 0!==e.converter?.fromAttribute?e.converter:x;this._$Em=a;const n=r.fromAttribute(t,e.type);this[a]=n??this._$Ej?.get(a)??n,this._$Em=null}}requestUpdate(e,t,i,a=!1,r){if(void 0!==e){const n=this.constructor;if(!1===a&&(r=this[e]),i??=n.getPropertyOptions(e),!((i.hasChanged??w)(r,t)||i.useDefault&&i.reflect&&r===this._$Ej?.get(e)&&!this.hasAttribute(n._$Eu(e,i))))return;this.C(e,t,i)}!1===this.isUpdatePending&&(this._$ES=this._$EP())}C(e,t,{useDefault:i,reflect:a,wrapped:r},n){i&&!(this._$Ej??=new Map).has(e)&&(this._$Ej.set(e,n??t??this[e]),!0!==r||void 0!==n)||(this._$AL.has(e)||(this.hasUpdated||i||(t=void 0),this._$AL.set(e,t)),!0===a&&this._$Em!==e&&(this._$Eq??=new Set).add(e))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(e){Promise.reject(e)}const e=this.scheduleUpdate();return null!=e&&await e,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??=this.createRenderRoot(),this._$Ep){for(const[e,t]of this._$Ep)this[e]=t;this._$Ep=void 0}const e=this.constructor.elementProperties;if(e.size>0)for(const[t,i]of e){const{wrapped:e}=i,a=this[t];!0!==e||this._$AL.has(t)||void 0===a||this.C(t,void 0,i,a)}}let e=!1;const t=this._$AL;try{e=this.shouldUpdate(t),e?(this.willUpdate(t),this._$EO?.forEach(e=>e.hostUpdate?.()),this.update(t)):this._$EM()}catch(t){throw e=!1,this._$EM(),t}e&&this._$AE(t)}willUpdate(e){}_$AE(e){this._$EO?.forEach(e=>e.hostUpdated?.()),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(e)),this.updated(e)}_$EM(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(e){return!0}update(e){this._$Eq&&=this._$Eq.forEach(e=>this._$ET(e,this[e])),this._$EM()}updated(e){}firstUpdated(e){}};$.elementStyles=[],$.shadowRootOptions={mode:"open"},$[b("elementProperties")]=new Map,$[b("finalized")]=new Map,y?.({ReactiveElement:$}),(u.reactiveElementVersions??=[]).push("2.1.2");const k=globalThis,C=e=>e,F=k.trustedTypes,D=F?F.createPolicy("lit-html",{createHTML:e=>e}):void 0,E="$lit$",A=`lit$${Math.random().toFixed(9).slice(2)}$`,S="?"+A,z=`<${S}>`,M=document,T=()=>M.createComment(""),B=e=>null===e||"object"!=typeof e&&"function"!=typeof e,H=Array.isArray,P="[ \t\n\f\r]",L=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,O=/-->/g,V=/>/g,j=RegExp(`>|${P}(?:([^\\s"'>=/]+)(${P}*=${P}*(?:[^ \t\n\f\r"'\`<>=]|("|')|))|$)`,"g"),U=/'/g,I=/"/g,N=/^(?:script|style|textarea|title)$/i,R=(e,...t)=>({_$litType$:1,strings:e,values:t}),Y=Symbol.for("lit-noChange"),W=Symbol.for("lit-nothing"),q=new WeakMap,Q=M.createTreeWalker(M,129);function X(e,t){if(!H(e)||!e.hasOwnProperty("raw"))throw Error("invalid template strings array");return void 0!==D?D.createHTML(t):t}const Z=(e,t)=>{const i=e.length-1,a=[];let r,n=2===t?"<svg>":3===t?"<math>":"",s=L;for(let t=0;t<i;t++){const i=e[t];let o,l,c=-1,d=0;for(;d<i.length&&(s.lastIndex=d,l=s.exec(i),null!==l);)d=s.lastIndex,s===L?"!--"===l[1]?s=O:void 0!==l[1]?s=V:void 0!==l[2]?(N.test(l[2])&&(r=RegExp("</"+l[2],"g")),s=j):void 0!==l[3]&&(s=j):s===j?">"===l[0]?(s=r??L,c=-1):void 0===l[1]?c=-2:(c=s.lastIndex-l[2].length,o=l[1],s=void 0===l[3]?j:'"'===l[3]?I:U):s===I||s===U?s=j:s===O||s===V?s=L:(s=j,r=void 0);const p=s===j&&e[t+1].startsWith("/>")?" ":"";n+=s===L?i+z:c>=0?(a.push(o),i.slice(0,c)+E+i.slice(c)+A+p):i+A+(-2===c?t:p)}return[X(e,n+(e[i]||"<?>")+(2===t?"</svg>":3===t?"</math>":"")),a]};class G{constructor({strings:e,_$litType$:t},i){let a;this.parts=[];let r=0,n=0;const s=e.length-1,o=this.parts,[l,c]=Z(e,t);if(this.el=G.createElement(l,i),Q.currentNode=this.el.content,2===t||3===t){const e=this.el.content.firstChild;e.replaceWith(...e.childNodes)}for(;null!==(a=Q.nextNode())&&o.length<s;){if(1===a.nodeType){if(a.hasAttributes())for(const e of a.getAttributeNames())if(e.endsWith(E)){const t=c[n++],i=a.getAttribute(e).split(A),s=/([.?@])?(.*)/.exec(t);o.push({type:1,index:r,name:s[2],strings:i,ctor:"."===s[1]?ie:"?"===s[1]?ae:"@"===s[1]?re:te}),a.removeAttribute(e)}else e.startsWith(A)&&(o.push({type:6,index:r}),a.removeAttribute(e));if(N.test(a.tagName)){const e=a.textContent.split(A),t=e.length-1;if(t>0){a.textContent=F?F.emptyScript:"";for(let i=0;i<t;i++)a.append(e[i],T()),Q.nextNode(),o.push({type:2,index:++r});a.append(e[t],T())}}}else if(8===a.nodeType)if(a.data===S)o.push({type:2,index:r});else{let e=-1;for(;-1!==(e=a.data.indexOf(A,e+1));)o.push({type:7,index:r}),e+=A.length-1}r++}}static createElement(e,t){const i=M.createElement("template");return i.innerHTML=e,i}}function K(e,t,i=e,a){if(t===Y)return t;let r=void 0!==a?i._$Co?.[a]:i._$Cl;const n=B(t)?void 0:t._$litDirective$;return r?.constructor!==n&&(r?._$AO?.(!1),void 0===n?r=void 0:(r=new n(e),r._$AT(e,i,a)),void 0!==a?(i._$Co??=[])[a]=r:i._$Cl=r),void 0!==r&&(t=K(e,r._$AS(e,t.values),r,a)),t}class J{constructor(e,t){this._$AV=[],this._$AN=void 0,this._$AD=e,this._$AM=t}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(e){const{el:{content:t},parts:i}=this._$AD,a=(e?.creationScope??M).importNode(t,!0);Q.currentNode=a;let r=Q.nextNode(),n=0,s=0,o=i[0];for(;void 0!==o;){if(n===o.index){let t;2===o.type?t=new ee(r,r.nextSibling,this,e):1===o.type?t=new o.ctor(r,o.name,o.strings,this,e):6===o.type&&(t=new ne(r,this,e)),this._$AV.push(t),o=i[++s]}n!==o?.index&&(r=Q.nextNode(),n++)}return Q.currentNode=M,a}p(e){let t=0;for(const i of this._$AV)void 0!==i&&(void 0!==i.strings?(i._$AI(e,i,t),t+=i.strings.length-2):i._$AI(e[t])),t++}}class ee{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(e,t,i,a){this.type=2,this._$AH=W,this._$AN=void 0,this._$AA=e,this._$AB=t,this._$AM=i,this.options=a,this._$Cv=a?.isConnected??!0}get parentNode(){let e=this._$AA.parentNode;const t=this._$AM;return void 0!==t&&11===e?.nodeType&&(e=t.parentNode),e}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(e,t=this){e=K(this,e,t),B(e)?e===W||null==e||""===e?(this._$AH!==W&&this._$AR(),this._$AH=W):e!==this._$AH&&e!==Y&&this._(e):void 0!==e._$litType$?this.$(e):void 0!==e.nodeType?this.T(e):(e=>H(e)||"function"==typeof e?.[Symbol.iterator])(e)?this.k(e):this._(e)}O(e){return this._$AA.parentNode.insertBefore(e,this._$AB)}T(e){this._$AH!==e&&(this._$AR(),this._$AH=this.O(e))}_(e){this._$AH!==W&&B(this._$AH)?this._$AA.nextSibling.data=e:this.T(M.createTextNode(e)),this._$AH=e}$(e){const{values:t,_$litType$:i}=e,a="number"==typeof i?this._$AC(e):(void 0===i.el&&(i.el=G.createElement(X(i.h,i.h[0]),this.options)),i);if(this._$AH?._$AD===a)this._$AH.p(t);else{const e=new J(a,this),i=e.u(this.options);e.p(t),this.T(i),this._$AH=e}}_$AC(e){let t=q.get(e.strings);return void 0===t&&q.set(e.strings,t=new G(e)),t}k(e){H(this._$AH)||(this._$AH=[],this._$AR());const t=this._$AH;let i,a=0;for(const r of e)a===t.length?t.push(i=new ee(this.O(T()),this.O(T()),this,this.options)):i=t[a],i._$AI(r),a++;a<t.length&&(this._$AR(i&&i._$AB.nextSibling,a),t.length=a)}_$AR(e=this._$AA.nextSibling,t){for(this._$AP?.(!1,!0,t);e!==this._$AB;){const t=C(e).nextSibling;C(e).remove(),e=t}}setConnected(e){void 0===this._$AM&&(this._$Cv=e,this._$AP?.(e))}}class te{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(e,t,i,a,r){this.type=1,this._$AH=W,this._$AN=void 0,this.element=e,this.name=t,this._$AM=a,this.options=r,i.length>2||""!==i[0]||""!==i[1]?(this._$AH=Array(i.length-1).fill(new String),this.strings=i):this._$AH=W}_$AI(e,t=this,i,a){const r=this.strings;let n=!1;if(void 0===r)e=K(this,e,t,0),n=!B(e)||e!==this._$AH&&e!==Y,n&&(this._$AH=e);else{const a=e;let s,o;for(e=r[0],s=0;s<r.length-1;s++)o=K(this,a[i+s],t,s),o===Y&&(o=this._$AH[s]),n||=!B(o)||o!==this._$AH[s],o===W?e=W:e!==W&&(e+=(o??"")+r[s+1]),this._$AH[s]=o}n&&!a&&this.j(e)}j(e){e===W?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,e??"")}}class ie extends te{constructor(){super(...arguments),this.type=3}j(e){this.element[this.name]=e===W?void 0:e}}class ae extends te{constructor(){super(...arguments),this.type=4}j(e){this.element.toggleAttribute(this.name,!!e&&e!==W)}}class re extends te{constructor(e,t,i,a,r){super(e,t,i,a,r),this.type=5}_$AI(e,t=this){if((e=K(this,e,t,0)??W)===Y)return;const i=this._$AH,a=e===W&&i!==W||e.capture!==i.capture||e.once!==i.once||e.passive!==i.passive,r=e!==W&&(i===W||a);a&&this.element.removeEventListener(this.name,this,i),r&&this.element.addEventListener(this.name,this,e),this._$AH=e}handleEvent(e){"function"==typeof this._$AH?this._$AH.call(this.options?.host??this.element,e):this._$AH.handleEvent(e)}}class ne{constructor(e,t,i){this.element=e,this.type=6,this._$AN=void 0,this._$AM=t,this.options=i}get _$AU(){return this._$AM._$AU}_$AI(e){K(this,e)}}const se=k.litHtmlPolyfillSupport;se?.(G,ee),(k.litHtmlVersions??=[]).push("3.3.2");const oe=globalThis;class le extends ${constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){const e=super.createRenderRoot();return this.renderOptions.renderBefore??=e.firstChild,e}update(e){const t=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(e),this._$Do=((e,t,i)=>{const a=i?.renderBefore??t;let r=a._$litPart$;if(void 0===r){const e=i?.renderBefore??null;a._$litPart$=r=new ee(t.insertBefore(T(),e),e,void 0,i??{})}return r._$AI(e),r})(t,this.renderRoot,this.renderOptions)}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(!0)}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(!1)}render(){return Y}}le._$litElement$=!0,le.finalized=!0,oe.litElementHydrateSupport?.({LitElement:le});const ce=oe.litElementPolyfillSupport;ce?.({LitElement:le}),(oe.litElementVersions??=[]).push("4.2.2");const de=e=>(t,i)=>{void 0!==i?i.addInitializer(()=>{customElements.define(e,t)}):customElements.define(e,t)},pe={attribute:!0,type:String,converter:x,reflect:!1,hasChanged:w},he=(e=pe,t,i)=>{const{kind:a,metadata:r}=i;let n=globalThis.litPropertyMetadata.get(r);if(void 0===n&&globalThis.litPropertyMetadata.set(r,n=new Map),"setter"===a&&((e=Object.create(e)).wrapped=!0),n.set(i.name,e),"accessor"===a){const{name:a}=i;return{set(i){const r=t.get.call(this);t.set.call(this,i),this.requestUpdate(a,r,e,!0,i)},init(t){return void 0!==t&&this.C(a,void 0,e,t),t}}}if("setter"===a){const{name:a}=i;return function(i){const r=this[a];t.call(this,i),this.requestUpdate(a,r,e,!0,i)}}throw Error("Unsupported decorator location: "+a)};function ve(e){return(t,i)=>"object"==typeof i?he(e,t,i):((e,t,i)=>{const a=t.hasOwnProperty(i);return t.constructor.createProperty(i,e),a?Object.getOwnPropertyDescriptor(t,i):void 0})(e,t,i)}function ge(e){return ve({...e,state:!0,attribute:!1})}function ue(e,t){return(t,i,a)=>((e,t,i)=>(i.configurable=!0,i.enumerable=!0,Reflect.decorate&&"object"!=typeof t&&Object.defineProperty(e,t,i),i))(t,i,{get(){return(t=>t.renderRoot?.querySelector(e)??null)(this)}})}const me=o`
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
`,fe=o`
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
`,ye=o`
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
`,be=o`
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
    color: var(--pv-text);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .pv-event-time {
    font-size: 0.6875rem;
    color: var(--pv-text-secondary);
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
    color: var(--pv-text);
    font-size: 0.6875rem;
    font-weight: 500;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 100%;
  }
`,xe=o`
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
`,we=o`
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
`,_e=o`
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
`,$e=o`
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
`,ke=o`
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
`;var Ce;let Fe=Ce=class extends le{constructor(){super(...arguments),this.value="",this.valueLight="",this._isCustom=!1}updated(e){if(super.updated(e),e.has("value")&&this.value){const e=Ce.PRESETS.some(e=>e.color.toLowerCase()===this.value.toLowerCase());this._isCustom=!e}}_selectPreset(e){this._isCustom=!1,this._emit(e.color,e.light)}_openCustomPicker(){this._colorInput?.click()}_onCustomColorChange(e){const t=e.target.value,i=function(e){let t=e.replace("#","");if(3===t.length&&(t=t.split("").map(e=>e+e).join("")),6!==t.length)return e;const i=parseInt(t.substring(0,2),16),a=parseInt(t.substring(2,4),16),r=parseInt(t.substring(4,6),16);if(isNaN(i)||isNaN(a)||isNaN(r))return e;const n=Math.round(i+.88*(255-i)),s=Math.round(a+.88*(255-a)),o=Math.round(r+.88*(255-r)),l=e=>e.toString(16).padStart(2,"0");return`#${l(n)}${l(s)}${l(o)}`}(t);this._isCustom=!0,this._emit(t,i)}_emit(e,t){this.value=e,this.valueLight=t,this.dispatchEvent(new CustomEvent("color-change",{detail:{color:e,colorLight:t},bubbles:!0,composed:!0}))}_isSelected(e){return this.value.toLowerCase()===e.toLowerCase()}render(){const e=Ce.PRESETS,t=this._isCustom?this.value:"",i=this._isCustom&&!!this.value;return R`
      <div class="swatch-grid" role="group" aria-label="Color presets">
        ${e.map(e=>{const t=this._isSelected(e.color);return R`
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
            ${t?"":R`<span aria-hidden="true">+</span>`}
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
    `}};Fe.PRESETS=[{name:"Ocean",color:"#4A90D9",light:"#DCE8F5"},{name:"Fire",color:"#FC6A05",light:"#FEE6D1"},{name:"Sage",color:"#6BA368",light:"#E2F0E1"},{name:"Lavender",color:"#9B8EC4",light:"#EDEBF5"},{name:"Amber",color:"#D9A52B",light:"#F7EDCF"},{name:"Honey",color:"#CDCB2E",light:"#F3F3DA"},{name:"Rose",color:"#D4728C",light:"#F5E4EA"},{name:"Teal",color:"#4A9E9E",light:"#DDF0F0"},{name:"Slate",color:"#6B7A8D",light:"#E8EAED"},{name:"Graphite",color:"#505050",light:"#E8E8E8"}],Fe.styles=[me,o`
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
    `],e([ve({type:String})],Fe.prototype,"value",void 0),e([ve({type:String})],Fe.prototype,"valueLight",void 0),e([ge()],Fe.prototype,"_isCustom",void 0),e([ue("#custom-color-input")],Fe.prototype,"_colorInput",void 0),Fe=Ce=e([de("pv-color-swatch-picker")],Fe);let De=class extends le{constructor(){super(...arguments),this._page=0,this._timeFormat="12h",this._firstDay="sunday",this._weatherEntity="",this._defaultView="week",this._calendarConfigs=[],this._calendarsInitialized=!1,this._theme="light",this._saving=!1,this._saveError=""}firstUpdated(){const e=this.renderRoot.querySelector('button, [href], input, select, [tabindex]:not([tabindex="-1"])');e?.focus()}updated(e){super.updated(e),e.has("hass")&&this.hass&&!this._calendarsInitialized&&this._initCalendars()}_initCalendars(){const e=Fe.PRESETS,t=Object.keys(this.hass.states).filter(e=>e.startsWith("calendar.")).sort();this._calendarConfigs=t.map((t,i)=>{const a=e[i%e.length],r=this.hass.states[t]?.attributes?.friendly_name;return{entity_id:t,display_name:r||t,color:a.color,color_light:a.light,person_entity:"",include:!1}}),this._calendarsInitialized=!0}get _weatherEntities(){return this.hass?Object.keys(this.hass.states).filter(e=>e.startsWith("weather.")).sort():[]}get _personEntities(){return this.hass?Object.keys(this.hass.states).filter(e=>e.startsWith("person.")).sort():[]}_personLabel(e){return this.hass?.states[e]?.attributes?.friendly_name||e}_goBack(){this._page>0&&(this._page-=1)}async _goNext(){this._page<2?this._page+=1:await this._finish()}async _finish(){this._saving=!0,this._saveError="";try{await this.hass.callService("planavista","save_config",{calendars:this._calendarConfigs.filter(e=>e.include).map(e=>({entity_id:e.entity_id,display_name:e.display_name,color:e.color,color_light:e.color_light,icon:"mdi:calendar",person_entity:e.person_entity,visible:!0})),display:{time_format:this._timeFormat,weather_entity:this._weatherEntity,first_day:this._firstDay,default_view:this._defaultView,theme:this._theme},onboarding_complete:!0}),this.dispatchEvent(new CustomEvent("onboarding-complete",{bubbles:!0,composed:!0}))}catch(e){console.error("[pv-onboarding-wizard] save_config failed:",e),this._saveError="Setup failed — please try again."}finally{this._saving=!1}}_updateCalendar(e,t){const i=[...this._calendarConfigs];i[e]={...i[e],...t},this._calendarConfigs=i}_onCalendarColorChange(e,t){t.stopPropagation(),this._updateCalendar(e,{color:t.detail.color,color_light:t.detail.colorLight})}_renderProgressDots(){return R`
      <div class="progress-dots" aria-label="Step ${this._page+1} of 3">
        ${[0,1,2].map(e=>R`
          <div
            class="dot ${e===this._page?"dot--active":""}"
            aria-current="${e===this._page?"step":"false"}"
          ></div>
        `)}
      </div>
    `}_renderPage0(){return R`
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
            ${this._weatherEntities.map(e=>R`
              <option value="${e}" ?selected=${this._weatherEntity===e}>${e}</option>
            `)}
          </select>
        </div>

        <!-- Default View -->
        <div class="field-group">
          <label class="pv-label">Default View</label>
          <div class="view-grid" role="group" aria-label="Default calendar view">
            ${[{key:"day",label:"Day",icon:"M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V9h14v11zm-7-7c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"},{key:"week",label:"Week",icon:"M20 3H4v10c0 2.21 1.79 4 4 4h6c2.21 0 4-1.79 4-4v-3h2c1.11 0 2-.89 2-2V5c0-1.11-.89-2-2-2zm0 5h-2V5h2v3zM4 19h16v2H4z"},{key:"month",label:"Month",icon:"M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zM9 14H7v-2h2v2zm4 0h-2v-2h2v2zm4 0h-2v-2h2v2zm-8 4H7v-2h2v2zm4 0h-2v-2h2v2zm4 0h-2v-2h2v2z"},{key:"agenda",label:"Agenda",icon:"M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zM7 7v2h14V7H7z"}].map(e=>R`
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
    `}_renderPage1(){return 0===this._calendarConfigs.length?R`
        <div class="page-content">
          <h2 class="page-title">Calendars</h2>
          <p class="page-subtitle">No calendar entities found in Home Assistant.</p>
          <p class="empty-hint">Add calendar integrations (Google Calendar, CalDAV, etc.) and re-run setup.</p>
        </div>
      `:R`
      <div class="page-content">
        <h2 class="page-title">Calendars</h2>
        <p class="page-subtitle">Check the calendars you want to display, then personalise each one.</p>

        <div class="calendar-list">
          ${this._calendarConfigs.map((e,t)=>this._renderCalendarRow(e,t))}
        </div>
      </div>
    `}_renderCalendarRow(e,t){return R`
      <div class="cal-row ${e.include?"":"cal-row--excluded"}">
        <!-- Include checkbox -->
        <label class="cal-checkbox-wrap" title="${e.include?"Exclude this calendar":"Include this calendar"}">
          <input
            type="checkbox"
            class="cal-checkbox"
            .checked=${e.include}
            @change=${e=>this._updateCalendar(t,{include:e.target.checked})}
          />
          <span class="cal-checkbox-visual" aria-hidden="true">
            ${e.include?R`
              <svg viewBox="0 0 24 24" width="14" height="14">
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" fill="currentColor"/>
              </svg>
            `:""}
          </span>
        </label>

        <!-- Calendar details -->
        <div class="cal-details">
          <!-- Entity ID badge -->
          <span class="cal-entity-id">${e.entity_id}</span>

          <!-- Display name input -->
          <div class="cal-field">
            <label class="pv-label" for="cal-name-${t}">Display Name</label>
            <input
              id="cal-name-${t}"
              type="text"
              class="pv-input cal-name-input"
              .value=${e.display_name}
              placeholder="Calendar name"
              ?disabled=${!e.include}
              @input=${e=>this._updateCalendar(t,{display_name:e.target.value})}
            />
          </div>

          <!-- Color picker -->
          <div class="cal-field">
            <label class="pv-label">Color</label>
            <pv-color-swatch-picker
              .value=${e.color}
              .valueLight=${e.color_light}
              ?disabled=${!e.include}
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
              ?disabled=${!e.include}
              @change=${e=>this._updateCalendar(t,{person_entity:e.target.value})}
            >
              <option value="">(None)</option>
              ${this._personEntities.map(t=>R`
                <option value="${t}" ?selected=${e.person_entity===t}>${this._personLabel(t)}</option>
              `)}
            </select>
          </div>
        </div>
      </div>
    `}_renderPage2(){return R`
      <div class="page-content">
        <h2 class="page-title">Theme</h2>
        <p class="page-subtitle">Pick a visual style for your calendar.</p>

        <div class="theme-grid">
          ${[{key:"light",name:"Clean Light",description:"White background, subtle shadows",previewBg:"#FFFFFF",previewAccent:"#6366F1",previewText:"#1A1B1E"},{key:"dark",name:"Deep Dark",description:"Dark gray background, glowing accents",previewBg:"#1E1E2E",previewAccent:"#818CF8",previewText:"#E5E7EB"},{key:"minimal",name:"Minimal",description:"Barely-there UI, content first",previewBg:"#FAFAF9",previewAccent:"#374151",previewText:"#374151"},{key:"vibrant",name:"Vibrant",description:"Rich colors, bold personality",previewBg:"#4F46E5",previewAccent:"#F59E0B",previewText:"#FFFFFF"}].map(e=>R`
            <button
              class="theme-card ${this._theme===e.key?"theme-card--active":""}"
              type="button"
              aria-pressed="${this._theme===e.key}"
              @click=${()=>{this._theme=e.key}}
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
              ${this._theme===e.key?R`
                <div class="theme-check" aria-hidden="true">
                  <svg viewBox="0 0 24 24" width="16" height="16">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" fill="currentColor"/>
                  </svg>
                </div>
              `:""}
            </button>
          `)}
        </div>
      </div>
    `}_renderFooter(){const e=2===this._page,t=e?this._saving?"Saving…":"Finish":"Next";return R`
      <div class="wizard-footer">
        ${this._saveError?R`<p class="save-error" role="alert">${this._saveError}</p>`:W}
        <!-- Back button (hidden on page 0) -->
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

        <!-- Next / Finish button -->
        <button
          class="pv-btn pv-btn-primary next-btn"
          type="button"
          ?disabled=${this._saving}
          @click=${this._goNext}
        >
          ${e?R`
            ${this._saving?R`
              <span class="spinner" aria-hidden="true"></span>
            `:R`
              <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" fill="currentColor"/>
              </svg>
            `}
          `:""}
          ${t}
          ${e?"":R`
            <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
              <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" fill="currentColor"/>
            </svg>
          `}
        </button>
      </div>
    `}render(){return R`
      <div class="wizard-container" role="dialog" aria-modal="true" aria-label="PlanaVista Setup — ${["Preferences","Calendars","Theme"][this._page]}">
        <!-- Header with progress -->
        <div class="wizard-header">
          <div class="wizard-brand">
            <span class="wizard-logo" aria-hidden="true">
              <svg viewBox="0 0 24 24" width="20" height="20">
                <path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V9h14v11zM9 14H7v-2h2v2zm4 0h-2v-2h2v2zm4 0h-2v-2h2v2zm-8 4H7v-2h2v2zm4 0h-2v-2h2v2zm4 0h-2v-2h2v2z" fill="currentColor"/>
              </svg>
            </span>
            <span class="wizard-title-text">PlanaVista Setup</span>
          </div>
          ${this._renderProgressDots()}
        </div>

        <!-- Scrollable content area -->
        <div class="wizard-content">
          ${0===this._page?this._renderPage0():""}
          ${1===this._page?this._renderPage1():""}
          ${2===this._page?this._renderPage2():""}
        </div>

        <!-- Fixed footer -->
        ${this._renderFooter()}
      </div>
    `}};async function Ee(e,t){const i={summary:t.summary};t.start_date_time&&(i.start_date_time=t.start_date_time),t.end_date_time&&(i.end_date_time=t.end_date_time),t.start_date&&(i.start_date=t.start_date),t.end_date&&(i.end_date=t.end_date),t.description&&(i.description=t.description),t.location&&(i.location=t.location),await e.callService("calendar","create_event",i,{entity_id:t.entity_id})}async function Ae(e,t){const i={uid:t.uid};t.recurrence_id&&(i.recurrence_id=t.recurrence_id),await e.callService("calendar","delete_event",i,{entity_id:t.entity_id})}async function Se(e,t="sensor.planavista_config"){await e.callService("homeassistant","update_entity",{entity_id:t})}function ze(e,t="sensor.planavista_config"){const i=e.states[t];if(!i)return null;const a=i.attributes;return{calendars:a.calendars||[],events:a.events||[],display:a.display||{time_format:"12h",weather_entity:"",first_day:"sunday",default_view:"day",theme:"light"},onboarding_complete:a.onboarding_complete,version:a.version}}function Me(e,t){if(!t)return null;const i=e.states[t];return i?.attributes?.entity_picture||null}function Te(e,t){if(!t)return"";const i=e.states[t];return i?.attributes?.friendly_name||t.replace("person.","")}function Be(e,t="12h"){const i=new Date(e);return"24h"===t?i.toLocaleTimeString("en-US",{hour:"2-digit",minute:"2-digit",hour12:!1}):i.toLocaleTimeString("en-US",{hour:"numeric",minute:"2-digit",hour12:!0})}function He(e,t="medium"){switch(t){case"long":return e.toLocaleDateString("en-US",{weekday:"long",year:"numeric",month:"long",day:"numeric"});case"medium":return e.toLocaleDateString("en-US",{weekday:"short",month:"short",day:"numeric"});case"short":return e.toLocaleDateString("en-US",{month:"numeric",day:"numeric"});case"weekday":return e.toLocaleDateString("en-US",{weekday:"long"})}}function Pe(e){const t=new Date;return e.getFullYear()===t.getFullYear()&&e.getMonth()===t.getMonth()&&e.getDate()===t.getDate()}function Le(e,t="sunday"){const i=new Date(e),a=i.getDay(),r="monday"===t?0===a?-6:1-a:-a;return i.setDate(i.getDate()+r),i.setHours(0,0,0,0),i}function Oe(e){return`${e.getFullYear()}-${String(e.getMonth()+1).padStart(2,"0")}-${String(e.getDate()).padStart(2,"0")}`}De.styles=[me,ye,we,$e,ke,o`
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
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 1rem 1.5rem;
        border-bottom: 1px solid var(--pv-border-subtle, #E5E7EB);
        flex-shrink: 0;
        background: var(--pv-card-bg, #FFFFFF);
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
        gap: 1rem;
      }

      .cal-row {
        display: flex;
        gap: 1rem;
        align-items: flex-start;
        padding: 1rem;
        border: 1px solid var(--pv-border-subtle, #E5E7EB);
        border-radius: var(--pv-radius, 12px);
        background: var(--pv-card-bg, #FFFFFF);
        transition: opacity var(--pv-transition, 200ms ease),
                    border-color var(--pv-transition, 200ms ease);
      }

      .cal-row--excluded {
        opacity: 0.5;
      }

      /* Custom checkbox */
      .cal-checkbox-wrap {
        display: flex;
        align-items: center;
        cursor: pointer;
        flex-shrink: 0;
        margin-top: 0.125rem;
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

      .cal-details {
        flex: 1;
        min-width: 0;
        display: flex;
        flex-direction: column;
        gap: 0.875rem;
      }

      .cal-entity-id {
        font-size: 0.75rem;
        color: var(--pv-text-muted, #9CA3AF);
        font-family: monospace;
        letter-spacing: 0.01em;
        word-break: break-all;
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

      /* ── Footer ─────────────────────────────────────────────── */

      .wizard-footer {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 1rem 1.5rem;
        border-top: 1px solid var(--pv-border-subtle, #E5E7EB);
        flex-shrink: 0;
        background: var(--pv-card-bg, #FFFFFF);
        gap: 1rem;
      }

      .save-error {
        flex: 1;
        font-size: 0.8125rem;
        color: var(--error-color, #EF4444);
        margin: 0;
      }

      .back-btn {
        gap: 0.25rem;
        padding-left: 0.875rem;
      }

      .back-btn--hidden {
        visibility: hidden;
        pointer-events: none;
      }

      .next-btn {
        gap: 0.25rem;
        padding-right: 0.875rem;
        margin-left: auto;
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
    `],e([ve({attribute:!1})],De.prototype,"hass",void 0),e([ge()],De.prototype,"_page",void 0),e([ge()],De.prototype,"_timeFormat",void 0),e([ge()],De.prototype,"_firstDay",void 0),e([ge()],De.prototype,"_weatherEntity",void 0),e([ge()],De.prototype,"_defaultView",void 0),e([ge()],De.prototype,"_calendarConfigs",void 0),e([ge()],De.prototype,"_calendarsInitialized",void 0),e([ge()],De.prototype,"_theme",void 0),e([ge()],De.prototype,"_saving",void 0),e([ge()],De.prototype,"_saveError",void 0),De=e([de("pv-onboarding-wizard")],De);class Ve{constructor(){this.hiddenCalendars=new Set,this.currentView="day",this.currentDate=new Date,this.selectedEvent=null,this.dialogOpen=null,this.createPrefill=null,this.isLoading=!1,this._hosts=new Set,this._autoAdvanceTimer=null,this.startAutoAdvance()}static getInstance(){return Ve._instance||(Ve._instance=new Ve),Ve._instance}subscribe(e){this._hosts.add(e)}unsubscribe(e){this._hosts.delete(e)}_notify(){for(const e of this._hosts)e.requestUpdate()}toggleCalendar(e){this.hiddenCalendars.has(e)?this.hiddenCalendars.delete(e):this.hiddenCalendars.add(e),this._notify()}setView(e){this.currentView!==e&&(this.currentView=e,this._notify())}navigateDate(e){this.currentDate="today"===e?new Date:function(e,t,i){const a=new Date(e),r="next"===i?1:-1;switch(t){case"day":a.setDate(a.getDate()+r);break;case"week":case"agenda":a.setDate(a.getDate()+7*r);break;case"month":a.setMonth(a.getMonth()+r)}return a}(this.currentDate,this.currentView,e),this._notify()}setDate(e){this.currentDate=new Date(e),this._notify()}selectEvent(e){this.selectedEvent=e,this._notify()}openCreateDialog(e){this.dialogOpen="create",this.createPrefill=e||null,this._notify()}openEditDialog(e){this.dialogOpen="edit",this.selectedEvent=e,this.createPrefill={...e},this._notify()}closeDialog(){this.dialogOpen=null,this.createPrefill=null,this._notify()}async doCreateEvent(e,t){this.isLoading=!0,this._notify();try{await Ee(e,t),await Se(e),this.closeDialog()}catch(e){throw console.error("PlanaVista: Failed to create event",e),e}finally{this.isLoading=!1,this._notify()}}async doDeleteEvent(e,t){this.isLoading=!0,this._notify();try{await Ae(e,t),await Se(e),this.selectedEvent=null,this.closeDialog()}catch(e){throw console.error("PlanaVista: Failed to delete event",e),e}finally{this.isLoading=!1,this._notify()}}async doEditEvent(e,t,i){this.isLoading=!0,this._notify();let a=!1;try{await Ae(e,t),a=!0,await Ee(e,i),await Se(e),this.selectedEvent=null,this.closeDialog()}catch(e){if(console.error("PlanaVista: Failed to edit event",e),a)throw new Error("The original event was deleted but the replacement could not be created. Please create the event manually. Error: "+(e instanceof Error?e.message:String(e)));throw e}finally{this.isLoading=!1,this._notify()}}startAutoAdvance(){this._autoAdvanceTimer||(this._autoAdvanceTimer=setInterval(()=>{const e=new Date;e.getDate()===this.currentDate.getDate()&&e.getMonth()===this.currentDate.getMonth()&&e.getFullYear()===this.currentDate.getFullYear()||this.currentDate.toDateString()===new Date(Date.now()-6e4).toDateString()&&(this.currentDate=e,this._notify())},6e4))}stopAutoAdvance(){this._autoAdvanceTimer&&(clearInterval(this._autoAdvanceTimer),this._autoAdvanceTimer=null)}}class je{constructor(e){this.host=e,this._state=Ve.getInstance(),e.addController(this)}hostConnected(){this._state.subscribe(this.host)}hostDisconnected(){this._state.unsubscribe(this.host)}get state(){return this._state}}const Ue={light:{"--pv-bg":"#FAFAF8","--pv-card-bg":"#FFFFFF","--pv-card-bg-elevated":"#FFFFFF","--pv-text":"#1A1B1E","--pv-text-secondary":"#6B7280","--pv-text-muted":"#9CA3AF","--pv-border":"#E5E7EB","--pv-border-subtle":"#F3F4F6","--pv-accent":"#6366F1","--pv-accent-text":"#FFFFFF","--pv-today-bg":"rgba(99, 102, 241, 0.06)","--pv-now-color":"#EF4444","--pv-event-hover":"rgba(0, 0, 0, 0.03)","--pv-shadow":"0 1px 3px rgba(0, 0, 0, 0.08), 0 1px 2px rgba(0, 0, 0, 0.04)","--pv-shadow-lg":"0 10px 25px rgba(0, 0, 0, 0.08), 0 4px 10px rgba(0, 0, 0, 0.04)","--pv-shadow-xl":"0 20px 40px rgba(0, 0, 0, 0.12)","--pv-radius":"12px","--pv-radius-lg":"16px","--pv-radius-sm":"8px","--pv-transition":"200ms cubic-bezier(0.4, 0, 0.2, 1)","--pv-font-family":"Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif","--pv-header-gradient":"linear-gradient(135deg, #667eea 0%, #764ba2 100%)","--pv-header-text":"#FFFFFF","--pv-backdrop":"rgba(0, 0, 0, 0.3)"},dark:{"--pv-bg":"#1A1B1E","--pv-card-bg":"#25262B","--pv-card-bg-elevated":"#2C2E33","--pv-text":"#E4E5E7","--pv-text-secondary":"#909296","--pv-text-muted":"#5C5F66","--pv-border":"#373A40","--pv-border-subtle":"#2C2E33","--pv-accent":"#818CF8","--pv-accent-text":"#FFFFFF","--pv-today-bg":"rgba(129, 140, 248, 0.08)","--pv-now-color":"#F87171","--pv-event-hover":"rgba(255, 255, 255, 0.04)","--pv-shadow":"0 1px 3px rgba(0, 0, 0, 0.3), 0 1px 2px rgba(0, 0, 0, 0.2)","--pv-shadow-lg":"0 10px 25px rgba(0, 0, 0, 0.3), 0 4px 10px rgba(0, 0, 0, 0.2)","--pv-shadow-xl":"0 20px 40px rgba(0, 0, 0, 0.4)","--pv-radius":"12px","--pv-radius-lg":"16px","--pv-radius-sm":"8px","--pv-transition":"200ms cubic-bezier(0.4, 0, 0.2, 1)","--pv-font-family":"Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif","--pv-header-gradient":"linear-gradient(135deg, #3730A3 0%, #581C87 100%)","--pv-header-text":"#FFFFFF","--pv-backdrop":"rgba(0, 0, 0, 0.6)"},minimal:{"--pv-bg":"#FFFFFF","--pv-card-bg":"#FFFFFF","--pv-card-bg-elevated":"#FFFFFF","--pv-text":"#111827","--pv-text-secondary":"#6B7280","--pv-text-muted":"#D1D5DB","--pv-border":"#F3F4F6","--pv-border-subtle":"#F9FAFB","--pv-accent":"#111827","--pv-accent-text":"#FFFFFF","--pv-today-bg":"rgba(17, 24, 39, 0.03)","--pv-now-color":"#EF4444","--pv-event-hover":"rgba(0, 0, 0, 0.02)","--pv-shadow":"0 0 0 1px rgba(0, 0, 0, 0.05)","--pv-shadow-lg":"0 4px 12px rgba(0, 0, 0, 0.05)","--pv-shadow-xl":"0 8px 24px rgba(0, 0, 0, 0.08)","--pv-radius":"8px","--pv-radius-lg":"12px","--pv-radius-sm":"6px","--pv-transition":"150ms ease","--pv-font-family":"Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif","--pv-header-gradient":"#111827","--pv-header-text":"#FFFFFF","--pv-backdrop":"rgba(0, 0, 0, 0.2)"},vibrant:{"--pv-bg":"#FAFAF8","--pv-card-bg":"#FFFFFF","--pv-card-bg-elevated":"#FFFFFF","--pv-text":"#1A1B1E","--pv-text-secondary":"#6B7280","--pv-text-muted":"#9CA3AF","--pv-border":"#E5E7EB","--pv-border-subtle":"#F3F4F6","--pv-accent":"#7C3AED","--pv-accent-text":"#FFFFFF","--pv-today-bg":"rgba(124, 58, 237, 0.06)","--pv-now-color":"#F43F5E","--pv-event-hover":"rgba(0, 0, 0, 0.03)","--pv-shadow":"0 1px 3px rgba(124, 58, 237, 0.1), 0 1px 2px rgba(0, 0, 0, 0.04)","--pv-shadow-lg":"0 10px 25px rgba(124, 58, 237, 0.15), 0 4px 10px rgba(0, 0, 0, 0.04)","--pv-shadow-xl":"0 20px 40px rgba(124, 58, 237, 0.2)","--pv-radius":"14px","--pv-radius-lg":"20px","--pv-radius-sm":"10px","--pv-transition":"250ms cubic-bezier(0.34, 1.56, 0.64, 1)","--pv-font-family":"Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif","--pv-header-gradient":"linear-gradient(135deg, #7C3AED 0%, #EC4899 100%)","--pv-header-text":"#FFFFFF","--pv-backdrop":"rgba(124, 58, 237, 0.2)"}},Ie=new WeakMap;function Ne(e,t="light"){if(Ie.get(e)===t)return;const i=Ue[t]||Ue.light;for(const[t,a]of Object.entries(i))e.style.setProperty(t,a);Ie.set(e,t)}function Re(e,t){const i=e||t||"light";return"planavista"===i?"light":"modern"===i?"vibrant":i in Ue?i:"light"}function Ye(e){const t=e.start,i=e.end;if(!t.includes("T")&&!i.includes("T"))return!0;const a=new Date(t),r=new Date(i);return 0===a.getHours()&&0===a.getMinutes()&&0===r.getHours()&&0===r.getMinutes()&&r.getTime()-a.getTime()>=864e5}function We(e){const t=new Map;for(const i of e){const e=new Date(i.start),a=new Date(i.end),r=new Date(e);r.setHours(0,0,0,0);const n=new Date(a);n.setHours(0,0,0,0);const s=Ye(i);for(;s?r<n:r<=n;){const e=Oe(r);t.has(e)||t.set(e,[]),t.get(e).push(i),r.setDate(r.getDate()+1)}}for(const[,e]of t)e.sort((e,t)=>{const i=Ye(e),a=Ye(t);return i&&!a?-1:!i&&a?1:new Date(e.start).getTime()-new Date(t.start).getTime()});return t}function qe(e,t,i){return e.filter(e=>{const a=new Date(e.start),r=new Date(e.end);return a<i&&r>t})}function Qe(e,t=0,i=24,a){const r=new Date(e.start),n=new Date(e.end),s=60*(i-t);let o,l;return o=Math.max(0,60*(r.getHours()-t)+r.getMinutes()),l=Math.min(s,60*(n.getHours()-t)+n.getMinutes()),n.toDateString()!==r.toDateString()&&l<=0&&(l=s),o=Math.max(0,Math.min(o,s)),l=Math.max(0,Math.min(l,s)),{top:o/s*100,height:Math.max(l-o,15)/s*100}}function Xe(e){const t=e.filter(e=>!Ye(e)).sort((e,t)=>new Date(e.start).getTime()-new Date(t.start).getTime());if(0===t.length)return[];const i=t.map(e=>({event:e,start:new Date(e.start).getTime(),end:new Date(e.end).getTime(),column:0,cluster:0}));let a=0,r=0;for(let e=0;e<i.length;e++){let t=!1;for(let a=r;a<e;a++)if(i[e].start<i[a].end){t=!0;break}if(!t&&e>r){const t=e;let n=0;for(let e=r;e<t;e++)n=Math.max(n,i[e].column+1);for(let e=r;e<t;e++)i[e].cluster=a;a++,r=e}const n=new Set;for(let t=r;t<e;t++)i[e].start<i[t].end&&n.add(i[t].column);let s=0;for(;n.has(s);)s++;i[e].column=s}i.forEach((e,t)=>{t>=r&&(e.cluster=a)});const n=new Map;for(const e of i){const t=n.get(e.cluster)||0;n.set(e.cluster,Math.max(t,e.column+1))}return i.map(e=>({...e.event,column:e.column,totalColumns:n.get(e.cluster)||1}))}function Ze(e,t){return e.filter(e=>!t.has(e.calendar_entity_id))}function Ge(e,t=48){return(Ke[e]||Ke.cloudy)(t)}const Ke={sunny:e=>R`
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
    </svg>`,"clear-night":e=>R`
    <svg width="${e}" height="${e}" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M38 14C30 14 23 20 21 28C20 31 20 35 21 38C23 44 28 49 35 50C38 51 41 51 44 50C36 52 27 48 23 40C19 32 21 22 28 16C31 14 34 13 38 14Z" fill="#94A3B8" />
      <circle cx="44" cy="16" r="1.5" fill="#94A3B8" opacity="0.6" />
      <circle cx="50" cy="24" r="1" fill="#94A3B8" opacity="0.4" />
      <circle cx="46" cy="32" r="1.2" fill="#94A3B8" opacity="0.5" />
    </svg>`,cloudy:e=>R`
    <svg width="${e}" height="${e}" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M48 40H18C13.6 40 10 36.4 10 32C10 27.6 13.6 24 18 24C18.2 24 18.5 24 18.7 24C20.2 18.6 25.2 15 31 15C37.9 15 43.5 19.9 44.2 26.5C44.8 26.3 45.4 26.2 46 26.2C49.3 26.2 52 28.9 52 32.2C52 32.2 52 32.2 52 32.3" fill="#CBD5E1" />
      <path d="M48 40H18C13.6 40 10 36.4 10 32C10 27.6 13.6 24 18 24C18.2 24 18.5 24 18.7 24C20.2 18.6 25.2 15 31 15C37.9 15 43.5 19.9 44.2 26.5C44.8 26.3 45.4 26.2 46 26.2C49.3 26.2 52 28.9 52 32.2V40C52 40 50 40 48 40Z" fill="#94A3B8" />
    </svg>`,partlycloudy:e=>R`
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
    </svg>`,rainy:e=>R`
    <svg width="${e}" height="${e}" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M48 34H18C13.6 34 10 30.4 10 26C10 21.6 13.6 18 18 18C18.2 18 18.5 18 18.7 18C20.2 12.6 25.2 9 31 9C37.9 9 43.5 13.9 44.2 20.5C44.8 20.3 45.4 20.2 46 20.2C49.3 20.2 52 22.9 52 26.2V34H48Z" fill="#94A3B8" />
      <g stroke="#60A5FA" stroke-width="2.5" stroke-linecap="round">
        <line x1="22" y1="40" x2="20" y2="48" class="pv-rain-drop" />
        <line x1="32" y1="40" x2="30" y2="48" class="pv-rain-drop" style="animation-delay: 0.3s" />
        <line x1="42" y1="40" x2="40" y2="48" class="pv-rain-drop" style="animation-delay: 0.6s" />
        <line x1="27" y1="48" x2="25" y2="56" class="pv-rain-drop" style="animation-delay: 0.15s" />
        <line x1="37" y1="48" x2="35" y2="56" class="pv-rain-drop" style="animation-delay: 0.45s" />
      </g>
    </svg>`,pouring:e=>R`
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
    </svg>`,snowy:e=>R`
    <svg width="${e}" height="${e}" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M48 32H18C13.6 32 10 28.4 10 24C10 19.6 13.6 16 18 16C18.2 16 18.5 16 18.7 16C20.2 10.6 25.2 7 31 7C37.9 7 43.5 11.9 44.2 18.5C44.8 18.3 45.4 18.2 46 18.2C49.3 18.2 52 20.9 52 24.2V32H48Z" fill="#94A3B8" />
      <circle cx="20" cy="42" r="2.5" fill="#BFDBFE" class="pv-snow-flake" />
      <circle cx="32" cy="40" r="2.5" fill="#BFDBFE" class="pv-snow-flake" style="animation-delay: 0.3s" />
      <circle cx="44" cy="43" r="2.5" fill="#BFDBFE" class="pv-snow-flake" style="animation-delay: 0.6s" />
      <circle cx="25" cy="52" r="2" fill="#BFDBFE" class="pv-snow-flake" style="animation-delay: 0.15s" />
      <circle cx="38" cy="51" r="2" fill="#BFDBFE" class="pv-snow-flake" style="animation-delay: 0.45s" />
    </svg>`,"snowy-rainy":e=>R`
    <svg width="${e}" height="${e}" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M48 32H18C13.6 32 10 28.4 10 24C10 19.6 13.6 16 18 16C18.2 16 18.5 16 18.7 16C20.2 10.6 25.2 7 31 7C37.9 7 43.5 11.9 44.2 18.5C44.8 18.3 45.4 18.2 46 18.2C49.3 18.2 52 20.9 52 24.2V32H48Z" fill="#94A3B8" />
      <g stroke="#60A5FA" stroke-width="2" stroke-linecap="round">
        <line x1="22" y1="38" x2="20" y2="46" class="pv-rain-drop" />
        <line x1="42" y1="38" x2="40" y2="46" class="pv-rain-drop" style="animation-delay: 0.3s" />
      </g>
      <circle cx="32" cy="42" r="2.5" fill="#BFDBFE" class="pv-snow-flake" style="animation-delay: 0.15s" />
      <circle cx="27" cy="52" r="2" fill="#BFDBFE" class="pv-snow-flake" style="animation-delay: 0.45s" />
      <circle cx="37" cy="50" r="2" fill="#BFDBFE" class="pv-snow-flake" style="animation-delay: 0.6s" />
    </svg>`,fog:e=>R`
    <svg width="${e}" height="${e}" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <g stroke="#94A3B8" stroke-width="3" stroke-linecap="round">
        <line x1="12" y1="24" x2="52" y2="24" opacity="0.4" />
        <line x1="16" y1="32" x2="48" y2="32" opacity="0.6" />
        <line x1="12" y1="40" x2="52" y2="40" opacity="0.8" />
        <line x1="18" y1="48" x2="46" y2="48" opacity="0.5" />
      </g>
    </svg>`,hail:e=>R`
    <svg width="${e}" height="${e}" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M48 30H18C13.6 30 10 26.4 10 22C10 17.6 13.6 14 18 14C18.2 14 18.5 14 18.7 14C20.2 8.6 25.2 5 31 5C37.9 5 43.5 9.9 44.2 16.5C44.8 16.3 45.4 16.2 46 16.2C49.3 16.2 52 18.9 52 22.2V30H48Z" fill="#94A3B8" />
      <circle cx="20" cy="40" r="3" fill="#93C5FD" stroke="#60A5FA" stroke-width="1" />
      <circle cx="32" cy="44" r="3" fill="#93C5FD" stroke="#60A5FA" stroke-width="1" />
      <circle cx="44" cy="38" r="3" fill="#93C5FD" stroke="#60A5FA" stroke-width="1" />
      <circle cx="26" cy="52" r="2.5" fill="#93C5FD" stroke="#60A5FA" stroke-width="1" />
      <circle cx="38" cy="54" r="2.5" fill="#93C5FD" stroke="#60A5FA" stroke-width="1" />
    </svg>`,lightning:e=>R`
    <svg width="${e}" height="${e}" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M48 30H18C13.6 30 10 26.4 10 22C10 17.6 13.6 14 18 14C18.2 14 18.5 14 18.7 14C20.2 8.6 25.2 5 31 5C37.9 5 43.5 9.9 44.2 16.5C44.8 16.3 45.4 16.2 46 16.2C49.3 16.2 52 18.9 52 22.2V30H48Z" fill="#64748B" />
      <path d="M34 30L28 42H34L30 56L42 40H36L40 30H34Z" fill="#FBBF24" stroke="#F59E0B" stroke-width="0.5" />
    </svg>`,"lightning-rainy":e=>R`
    <svg width="${e}" height="${e}" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M48 28H18C13.6 28 10 24.4 10 20C10 15.6 13.6 12 18 12C18.2 12 18.5 12 18.7 12C20.2 6.6 25.2 3 31 3C37.9 3 43.5 7.9 44.2 14.5C44.8 14.3 45.4 14.2 46 14.2C49.3 14.2 52 16.9 52 20.2V28H48Z" fill="#64748B" />
      <path d="M34 28L28 40H34L30 52L42 38H36L40 28H34Z" fill="#FBBF24" />
      <g stroke="#60A5FA" stroke-width="2" stroke-linecap="round">
        <line x1="18" y1="36" x2="16" y2="44" class="pv-rain-drop" style="animation-delay: 0.2s" />
        <line x1="48" y1="34" x2="46" y2="42" class="pv-rain-drop" style="animation-delay: 0.5s" />
        <line x1="22" y1="48" x2="20" y2="56" class="pv-rain-drop" style="animation-delay: 0.1s" />
        <line x1="44" y1="46" x2="42" y2="54" class="pv-rain-drop" style="animation-delay: 0.4s" />
      </g>
    </svg>`,windy:e=>R`
    <svg width="${e}" height="${e}" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <g stroke="#94A3B8" stroke-width="3" stroke-linecap="round">
        <path d="M10 24 Q30 24 38 20 Q46 16 48 20 Q50 24 46 24" fill="none" />
        <path d="M8 34 Q28 34 40 30 Q48 28 50 32 Q52 36 48 36" fill="none" />
        <path d="M14 44 Q30 44 36 40 Q42 36 44 40 Q46 44 42 44" fill="none" />
      </g>
    </svg>`,"windy-variant":e=>R`
    <svg width="${e}" height="${e}" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M48 28H22C17.6 28 14 24.4 14 20C14 15.6 17.6 12 22 12C22.2 12 22.5 12 22.7 12C24.2 7 28.8 4 34 4C40.3 4 45.5 8.5 46.2 14.5C46.8 14.3 47.4 14.2 48 14.2C51 14.2 53.5 16.7 53.5 19.7V28H48Z" fill="#CBD5E1" />
      <g stroke="#94A3B8" stroke-width="2.5" stroke-linecap="round">
        <path d="M8 36 Q28 36 36 33 Q44 30 46 34 Q48 38 44 38" fill="none" />
        <path d="M12 46 Q28 46 34 43 Q40 40 42 44 Q44 48 40 48" fill="none" />
      </g>
    </svg>`,exceptional:e=>R`
    <svg width="${e}" height="${e}" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="32" cy="32" r="20" stroke="#F59E0B" stroke-width="3" fill="none" />
      <line x1="32" y1="18" x2="32" y2="34" stroke="#F59E0B" stroke-width="3" stroke-linecap="round" />
      <circle cx="32" cy="42" r="2" fill="#F59E0B" />
    </svg>`};let Je=class extends le{constructor(){super(...arguments),this._config={}}setConfig(e){this._config=e}render(){return R`
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
    `}};Je.styles=o`
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
  `,e([ve({attribute:!1})],Je.prototype,"hass",void 0),Je=e([de("planavista-calendar-card-editor")],Je);let et=class extends le{constructor(){super(...arguments),this.events=[],this.calendars=[],this.currentDate=new Date,this.hiddenCalendars=new Set,this.timeFormat="12h",this.hideColumnHeaders=!1}firstUpdated(){this._scrollToNow()}updated(e){super.updated(e),e.has("currentDate")&&this._scrollToNow()}_scrollToNow(){requestAnimationFrame(()=>{const e=this.shadowRoot?.querySelector(".time-grid-wrapper");if(!e)return;this._scrollContainer=e;const t=new Date,i=60*(t.getHours()-0)+t.getMinutes();if(i>0&&i<1440){const t=i/1440*e.scrollHeight-e.clientHeight/3;e.scrollTo({top:Math.max(0,t),behavior:"smooth"})}})}render(){const e=Ze(this.events,this.hiddenCalendars),t=new Date(this.currentDate);t.setHours(0,0,0,0);const i=new Date(this.currentDate);i.setHours(23,59,59,999);const a=qe(e,t,i),r=a.filter(e=>Ye(e)),n=a.filter(e=>!Ye(e)),s=this.calendars.filter(e=>!1!==e.visible&&!this.hiddenCalendars.has(e.entity_id)),o=function(e,t){const i=new Map,a=new Map(t.map(e=>[e.entity_id,e]));for(const e of t)if(!1!==e.visible){const t=e.person_entity||e.entity_id;i.has(t)||i.set(t,[])}for(const t of e){const e=a.get(t.calendar_entity_id),r=e?.person_entity||t.calendar_entity_id;i.has(r)||i.set(r,[]),i.get(r).push(t)}return i}(n,s),l=Array.from(o.keys()),c=new Date,d=c.toDateString()===this.currentDate.toDateString(),p=60*(c.getHours()-0)+c.getMinutes(),h=d?p/1440*100:-1;return 0===s.length?R`
        <div class="empty-state">
          <ha-icon icon="mdi:calendar-blank"></ha-icon>
          <p>No calendars visible</p>
        </div>
      `:R`
      <div class="day-container">
        ${r.length>0?R`
          <div class="all-day-section">
            <div class="all-day-gutter">All Day</div>
            <div class="all-day-events">
              ${r.map(e=>R`
                <div
                  class="all-day-chip"
                  style="background: ${e.calendar_color}"
                  @click=${()=>this._onEventClick(e)}
                >${e.summary}</div>
              `)}
            </div>
          </div>
        `:W}

        ${this.hideColumnHeaders?W:R`
          <div class="column-headers">
            <div class="header-gutter"></div>
            ${l.map(e=>{const t=s.find(t=>(t.person_entity||t.entity_id)===e),i=t?.person_entity?Me(this.hass,t.person_entity):null,a=t?.person_entity?Te(this.hass,t.person_entity):t?.display_name||e;return R`
                <div class="person-header">
                  ${i?R`<img class="person-avatar" src="${i}" alt="${a}" />`:R`<div class="person-initial" style="background: ${t?.color||"#6366F1"}">${a[0]?.toUpperCase()||"?"}</div>`}
                  <span class="person-name">${a}</span>
                </div>
              `})}
          </div>
        `}

        ${d?W:R`
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
              ${h>=0&&h<=100?R`
                <div class="pv-now-line" style="top: ${h}%"></div>
              `:W}
              ${l.map(e=>this._renderColumn(e,o.get(e)||[]))}
            </div>
          </div>
          ${this._renderNextDayFooter()}
        </div>
      </div>
    `}_renderTimeLabels(){const e=[];for(let t=0;t<=24;t++){const i=(t-0)/24*100;let a;if("24h"===this.timeFormat)a=`${String(t%24).padStart(2,"0")}:00`;else{const e=t%24;a=`${e%12||12} ${e>=12?"PM":"AM"}`}e.push(R`
        <div class="time-label" style="top: ${i}%">${a}</div>
      `)}return e}_renderHourLines(){const e=[],t=1/24*100;for(let i=0;i<24;i++){const a=(i-0)/24*100;i%2==1&&e.push(R`
          <div class="hour-band-odd" style="top: ${a}%; height: ${t}%"></div>
        `)}return e}_renderNextDayFooter(){const e=new Date(this.currentDate);e.setDate(e.getDate()+1);const t=e.toLocaleDateString("en-US",{weekday:"long",month:"long",day:"numeric"});return R`
      <div class="next-day-footer" @click=${this._goToNextDay}>
        ${t}
        <ha-icon icon="mdi:arrow-down"></ha-icon>
      </div>
    `}_goToToday(){this.dispatchEvent(new CustomEvent("day-click",{detail:{date:new Date},bubbles:!0,composed:!0}))}_goToNextDay(){const e=new Date(this.currentDate);e.setDate(e.getDate()+1),this.dispatchEvent(new CustomEvent("day-click",{detail:{date:e},bubbles:!0,composed:!0}))}_renderColumn(e,t){const i=Xe(t);return R`
      <div class="person-column">
        ${i.map(e=>{const t=Qe(e,0,24),i=e.totalColumns>1?`calc(${100/e.totalColumns}% - 6px)`:"calc(100% - 6px)",a=e.totalColumns>1?`calc(${e.column/e.totalColumns*100}% + 3px)`:"3px";return R`
            <div
              class="positioned-event"
              style="
                top: ${t.top}%;
                height: ${t.height}%;
                width: ${i};
                left: ${a};
                --event-color: ${e.calendar_color};
                --event-color-light: ${e.calendar_color_light||""};
              "
              @click=${()=>this._onEventClick(e)}
            >
              <div class="event-title">${e.summary}</div>
              <div class="event-time">${Be(e.start,this.timeFormat)}</div>
            </div>
          `})}
      </div>
    `}_onEventClick(e){this.dispatchEvent(new CustomEvent("event-click",{detail:{event:e},bubbles:!0,composed:!0}))}};et.styles=[me,be,_e,$e,o`
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
        border: 3px solid var(--pv-border-subtle);
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
        font-size: 0.8125rem;
        font-weight: 600;
        line-height: 1.25;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        color: var(--pv-text);
      }

      .positioned-event .event-time {
        font-size: 0.6875rem;
        color: var(--pv-text-secondary);
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
    `],e([ve({attribute:!1})],et.prototype,"hass",void 0),e([ve({type:Array})],et.prototype,"events",void 0),e([ve({type:Array})],et.prototype,"calendars",void 0),e([ve({type:Object})],et.prototype,"currentDate",void 0),e([ve({type:Object})],et.prototype,"hiddenCalendars",void 0),e([ve({attribute:!1})],et.prototype,"timeFormat",void 0),e([ve({type:Boolean})],et.prototype,"hideColumnHeaders",void 0),et=e([de("pv-view-day")],et);let tt=class extends le{constructor(){super(...arguments),this.events=[],this.calendars=[],this.currentDate=new Date,this.hiddenCalendars=new Set,this.timeFormat="12h",this.firstDay="sunday"}firstUpdated(){this._scrollToNow()}_scrollToNow(){requestAnimationFrame(()=>{const e=this.shadowRoot?.querySelector(".time-grid-wrapper");if(!e)return;const t=new Date,i=60*(t.getHours()-0)+t.getMinutes();if(i>0&&i<1440){const t=i/1440*e.scrollHeight-e.clientHeight/3;e.scrollTo({top:Math.max(0,t),behavior:"smooth"})}})}_getWeekDays(){const e=Le(this.currentDate,this.firstDay);return Array.from({length:7},(t,i)=>{const a=new Date(e);return a.setDate(a.getDate()+i),a})}render(){const e=Ze(this.events,this.hiddenCalendars),t=this._getWeekDays(),i=new Date(t[0]);i.setHours(0,0,0,0);const a=new Date(t[6]);a.setHours(23,59,59,999);const r=function(e,t){const i=new Map(t.map(e=>[e.entity_id,e])),a=new Map;for(const t of e){const e=`${t.summary}|${t.start}|${t.end}`;if(a.has(e)){const r=a.get(e),n=i.get(t.calendar_entity_id);n&&r.shared_calendars.push({entity_id:n.entity_id,color:n.color,color_light:n.color_light,person_entity:n.person_entity,display_name:n.display_name})}else{const r=i.get(t.calendar_entity_id);a.set(e,{...t,shared_calendars:r?[{entity_id:r.entity_id,color:r.color,color_light:r.color_light,person_entity:r.person_entity,display_name:r.display_name}]:[]})}}return Array.from(a.values())}(qe(e,i,a),this.calendars),n=(new Date).toDateString();return R`
      <div class="week-container">
        <div class="day-headers">
          <div class="header-gutter"></div>
          ${t.map(e=>{const t=e.toDateString()===n;return R`
              <div class="day-header ${t?"today":""}">
                <div class="day-header-weekday">${e.toLocaleDateString("en-US",{weekday:"short"})}</div>
                <div class="day-header-date">${e.getDate()}</div>
              </div>
            `})}
        </div>

        ${this._renderAllDayBanner(t,r)}

        <div class="time-grid-wrapper">
          <div class="time-grid">
            <div class="time-gutter">
              ${this._renderTimeLabels()}
            </div>
            <div class="days-area">
              ${this._renderHourLines()}
              ${t.map(e=>this._renderDayColumn(e,r,n))}
            </div>
          </div>
        </div>
      </div>
    `}_renderAllDayBanner(e,t){const i=t.filter(e=>Ye(e));return 0===i.length?W:R`
      <div class="all-day-banner">
        <div class="all-day-gutter">All Day</div>
        ${e.map(e=>{const t=new Date(e);t.setHours(0,0,0,0);const a=new Date(e);a.setHours(23,59,59,999);const r=i.filter(e=>{const i=new Date(e.start),r=new Date(e.end);return i<a&&r>t});return R`
            <div class="all-day-column">
              ${r.map(e=>R`
                <div
                  class="all-day-event"
                  style="background: ${e.calendar_color}"
                  @click=${()=>this._onEventClick(e)}
                >${e.summary}</div>
              `)}
            </div>
          `})}
      </div>
    `}_renderTimeLabels(){const e=[];for(let t=0;t<=24;t++){const i=(t-0)/24*100;let a;if("24h"===this.timeFormat)a=`${String(t%24).padStart(2,"0")}:00`;else{const e=t%24;a=`${e%12||12} ${e>=12?"PM":"AM"}`}e.push(R`<div class="time-label" style="top: ${i}%">${a}</div>`)}return e}_renderHourLines(){const e=[],t=1/24*100;for(let i=0;i<24;i++){const a=(i-0)/24*100;i%2==1&&e.push(R`<div class="hour-band-odd" style="top: ${a}%; height: ${t}%"></div>`)}return e}_renderDayColumn(e,t,i){const a=e.toDateString()===i,r=new Date(e);r.setHours(0,0,0,0);const n=new Date(e);n.setHours(24,0,0,0);const s=t.filter(t=>{if(Ye(t))return!1;const i=new Date(t.start),a=new Date(t.end);return i<n&&a>r&&i.toDateString()===e.toDateString()}),o=Xe(s),l=new Date,c=60*(l.getHours()-0)+l.getMinutes(),d=a?c/1440*100:-1;return R`
      <div class="day-column ${a?"today":""}">
        ${d>=0&&d<=100?R`
          <div class="pv-now-line" style="top: ${d}%"></div>
        `:W}
        ${o.map(e=>{const t=Qe(e,0,24),i=e.totalColumns>1?`calc(${100/e.totalColumns}% - 3px)`:"calc(100% - 4px)",a=e.totalColumns>1?`calc(${e.column/e.totalColumns*100}% + 2px)`:"2px";return R`
            <div
              class="positioned-event"
              style="top:${t.top}%;height:${t.height}%;width:${i};left:${a};--event-color:${e.calendar_color};--event-color-light:${e.calendar_color_light||""}"
              @click=${()=>this._onEventClick(e)}
            >
              <div class="event-title">${e.summary}</div>
              <div class="event-time">${Be(e.start,this.timeFormat)}</div>
              ${e.shared_calendars?.length>1?R`
                <div class="shared-avatars">
                  ${e.shared_calendars.slice(0,3).map(e=>{const t=e.person_entity?Me(this.hass,e.person_entity):null;return t?R`<img class="shared-avatar" src="${t}" alt="${e.display_name}" />`:R`<div class="shared-avatar-initial" style="background: ${e.color}">${e.display_name[0]||"?"}</div>`})}
                  ${e.shared_calendars.length>3?R`
                    <span class="shared-more">+${e.shared_calendars.length-3}</span>
                  `:W}
                </div>
              `:W}
            </div>
          `})}
      </div>
    `}_onEventClick(e){this.dispatchEvent(new CustomEvent("event-click",{detail:{event:e},bubbles:!0,composed:!0}))}};tt.styles=[me,be,_e,o`
      :host { display: block; height: 100%; overflow: hidden; }

      .week-container {
        display: flex;
        flex-direction: column;
        height: 100%;
        overflow: hidden;
      }

      /* Day headers */
      .day-headers {
        display: flex;
        border-bottom: 1px solid var(--pv-border);
        flex-shrink: 0;
      }

      .header-gutter {
        width: 54px;
        flex-shrink: 0;
      }

      .day-header {
        flex: 1;
        text-align: center;
        padding: 0.5rem 0.25rem;
        min-width: 0;
      }

      .day-header-weekday {
        font-size: 0.6875rem;
        font-weight: 500;
        text-transform: uppercase;
        letter-spacing: 0.04em;
        color: var(--pv-text-muted);
      }

      .day-header-date {
        font-size: 1.25rem;
        font-weight: 300;
        margin-top: 0.125rem;
        color: var(--pv-text);
      }

      .day-header.today .day-header-date {
        width: 32px;
        height: 32px;
        border-radius: 50%;
        background: var(--pv-accent);
        color: var(--pv-accent-text);
        display: inline-flex;
        align-items: center;
        justify-content: center;
        font-weight: 500;
      }

      .day-header.today .day-header-weekday {
        color: var(--pv-accent);
        font-weight: 600;
      }

      /* All-day banner */
      .all-day-banner {
        display: flex;
        border-bottom: 1px solid var(--pv-border);
        min-height: 28px;
        flex-shrink: 0;
      }

      .all-day-gutter {
        width: 54px;
        flex-shrink: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 0.625rem;
        color: var(--pv-text-muted);
        text-transform: uppercase;
        font-weight: 500;
      }

      .all-day-column {
        flex: 1;
        padding: 0.25rem 2px;
        display: flex;
        flex-direction: column;
        gap: 2px;
        border-left: 1px solid var(--pv-border-subtle);
        min-width: 0;
      }

      .all-day-event {
        padding: 0.125rem 0.375rem;
        border-radius: 4px;
        font-size: 0.6875rem;
        font-weight: 500;
        color: white;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        cursor: pointer;
        transition: opacity 150ms;
      }

      .all-day-event:hover { opacity: 0.85; }

      /* Time grid */
      .time-grid-wrapper {
        flex: 1;
        overflow-y: auto;
        overflow-x: hidden;
        scrollbar-width: none;
        -ms-overflow-style: none;
      }

      .time-grid-wrapper::-webkit-scrollbar {
        display: none;
      }

      .time-grid {
        display: flex;
        position: relative;
        height: ${1920}px;
        flex-shrink: 0;
      }

      .time-gutter {
        width: 54px;
        flex-shrink: 0;
        position: relative;
      }

      .time-label {
        position: absolute;
        right: 0.375rem;
        font-size: 0.625rem;
        color: var(--pv-text-muted);
        transform: translateY(-50%);
        font-variant-numeric: tabular-nums;
      }

      .days-area {
        flex: 1;
        display: flex;
        position: relative;
      }

      .day-column {
        flex: 1;
        position: relative;
        margin-left: 2px;
        min-width: 0;
        overflow: hidden;
      }

      .day-column:first-child {
        margin-left: 0;
      }

      .day-column.today {
        background: var(--pv-today-bg);
      }

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

      /* Events */
      .positioned-event {
        position: absolute;
        left: 2px;
        right: 2px;
        padding: 0.125rem 0.25rem;
        border-radius: 4px;
        border-left: 3px solid var(--event-color);
        background: var(--event-color-light, color-mix(in srgb, var(--event-color) 12%, white));
        cursor: pointer;
        overflow: hidden;
        transition: all var(--pv-transition);
        z-index: 1;
        font-size: 0.6875rem;
        min-height: 18px;
      }

      .positioned-event:hover {
        z-index: 5;
        background: color-mix(in srgb, var(--event-color) 16%, white);
        transform: translateY(-1px);
      }

      .positioned-event .event-title {
        font-weight: 500;
        line-height: 1.2;
        color: var(--pv-text);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .positioned-event .event-time {
        font-size: 0.5625rem;
        color: var(--pv-text-secondary);
      }

      .shared-avatars {
        position: absolute;
        bottom: 3px;
        right: 4px;
        display: flex;
        align-items: center;
      }

      .shared-avatar {
        width: 16px;
        height: 16px;
        border-radius: 50%;
        border: 1px solid var(--pv-card-bg, #fff);
        object-fit: cover;
        margin-left: -4px;
      }

      .shared-avatar:first-child {
        margin-left: 0;
      }

      .shared-avatar-initial {
        width: 16px;
        height: 16px;
        border-radius: 50%;
        border: 1px solid var(--pv-card-bg, #fff);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 0.5rem;
        font-weight: 700;
        color: white;
        margin-left: -4px;
      }

      .shared-avatar-initial:first-child {
        margin-left: 0;
      }

      .shared-more {
        font-size: 0.5rem;
        font-weight: 600;
        color: var(--pv-text-muted);
        margin-left: 2px;
      }
    `],e([ve({attribute:!1})],tt.prototype,"hass",void 0),e([ve({type:Array})],tt.prototype,"events",void 0),e([ve({type:Array})],tt.prototype,"calendars",void 0),e([ve({type:Object})],tt.prototype,"currentDate",void 0),e([ve({type:Object})],tt.prototype,"hiddenCalendars",void 0),e([ve({attribute:!1})],tt.prototype,"timeFormat",void 0),e([ve({attribute:!1})],tt.prototype,"firstDay",void 0),tt=e([de("pv-view-week")],tt);const it=["Sun","Mon","Tue","Wed","Thu","Fri","Sat"],at=["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];let rt=class extends le{constructor(){super(...arguments),this.events=[],this.calendars=[],this.currentDate=new Date,this.hiddenCalendars=new Set,this.firstDay="sunday"}render(){const e=Ze(this.events,this.hiddenCalendars),t=function(e,t="sunday"){const i=Le(new Date(e.getFullYear(),e.getMonth(),1),t),a=[];for(let e=0;e<42;e++){const t=new Date(i);t.setDate(i.getDate()+e),a.push(t)}return a}(this.currentDate,this.firstDay),i=We(e),a=this.currentDate.getMonth(),r="monday"===this.firstDay?at:it;return R`
      <div class="month-container">
        <div class="weekday-header">
          ${r.map(e=>R`<div class="weekday-name">${e}</div>`)}
        </div>
        <div class="month-grid">
          ${t.map(e=>this._renderDayCell(e,a,i))}
        </div>
      </div>
    `}_renderDayCell(e,t,i){const a=Oe(e),r=i.get(a)||[],n=e.getMonth()!==t,s=Pe(e),o=r.slice(0,3),l=r.length-3;return R`
      <div
        class="day-cell ${n?"other-month":""} ${s?"today":""}"
        @click=${()=>this._onDayClick(e)}
      >
        <div class="day-number">${e.getDate()}</div>
        <div class="day-events">
          ${o.map(e=>R`
            <div
              class="month-event-pill"
              style="--event-color: ${e.calendar_color}; --event-color-light: ${e.calendar_color_light||""}"
              @click=${t=>{t.stopPropagation(),this._onEventClick(e)}}
            >${e.summary}</div>
          `)}
          ${l>0?R`
            <div class="more-events" @click=${t=>{t.stopPropagation(),this._onDayClick(e)}}>
              +${l} more
            </div>
          `:W}
        </div>
      </div>
    `}_onDayClick(e){this.dispatchEvent(new CustomEvent("day-click",{detail:{date:e},bubbles:!0,composed:!0}))}_onEventClick(e){this.dispatchEvent(new CustomEvent("event-click",{detail:{event:e},bubbles:!0,composed:!0}))}};rt.styles=[me,be,o`
      :host { display: block; height: 100%; overflow: hidden; }

      .month-container {
        display: flex;
        flex-direction: column;
        height: 100%;
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

      .month-event-pill {
        padding: 0.0625rem 0.375rem;
        border-radius: 3px;
        border-left: 2px solid var(--event-color, var(--pv-accent));
        background: var(--event-color-light, color-mix(in srgb, var(--event-color, var(--pv-accent)) 12%, white));
        font-size: 0.625rem;
        font-weight: 500;
        color: var(--pv-text);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        cursor: pointer;
        line-height: 1.4;
        transition: all 150ms;
      }

      .month-event-pill:hover {
        background: color-mix(in srgb, var(--event-color, var(--pv-accent)) 16%, white);
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
    `],e([ve({attribute:!1})],rt.prototype,"hass",void 0),e([ve({type:Array})],rt.prototype,"events",void 0),e([ve({type:Array})],rt.prototype,"calendars",void 0),e([ve({type:Object})],rt.prototype,"currentDate",void 0),e([ve({type:Object})],rt.prototype,"hiddenCalendars",void 0),e([ve({attribute:!1})],rt.prototype,"firstDay",void 0),rt=e([de("pv-view-month")],rt);let nt=class extends le{constructor(){super(...arguments),this.events=[],this.calendars=[],this.currentDate=new Date,this.hiddenCalendars=new Set,this.timeFormat="12h",this.maxEvents=20,this.daysAhead=14,this.showCalendarName=!0,this.showEndTime=!1}render(){const e=Ze(this.events,this.hiddenCalendars),t=new Date(this.currentDate);t.setHours(0,0,0,0);const i=new Date(this.currentDate);i.setDate(i.getDate()+this.daysAhead),i.setHours(23,59,59,999);const a=qe(e,t,i),r=We(a),n=Array.from(r.keys()).sort();let s=0;const o=this.maxHeight?`max-height: ${this.maxHeight}`:"";return 0===a.length?R`
        <div class="empty-state">
          <ha-icon icon="mdi:calendar-check"></ha-icon>
          <p>No upcoming events</p>
        </div>
      `:R`
      <div class="agenda-container" style="${o}">
        ${n.map(e=>{if(s>=this.maxEvents)return W;const t=r.get(e)||[],i=new Date(e+"T00:00:00"),a=function(e){if(Pe(e))return"Today";if(function(e){const t=new Date;return t.setDate(t.getDate()+1),e.getFullYear()===t.getFullYear()&&e.getMonth()===t.getMonth()&&e.getDate()===t.getDate()}(e))return"Tomorrow";const t=new Date,i=Math.floor((e.getTime()-t.getTime())/864e5);return i<7&&i>=0?e.toLocaleDateString("en-US",{weekday:"long"}):He(e,"medium")}(i),n=He(i,"medium"),o=Pe(i),l=function(e){const t=new Date;t.setHours(0,0,0,0);const i=new Date(e);return i.setHours(0,0,0,0),i<t}(i)&&!o;return R`
            <div class="date-group" style="${l?"opacity: 0.6":""}">
              <div class="date-header ${o?"today":""}">
                <span class="date-header-relative">${a}</span>
                ${a!==n?R`<span class="date-header-full">${n}</span>`:W}
              </div>
              ${t.map(e=>s>=this.maxEvents?W:(s++,this._renderEvent(e)))}
            </div>
          `})}
      </div>
    `}_renderEvent(e){const t=Ye(e),i=t?null:Be(e.start,this.timeFormat),a=t||!this.showEndTime?null:Be(e.end,this.timeFormat);return R`
      <div class="agenda-event" style="--event-color: ${e.calendar_color}; --event-color-light: ${e.calendar_color_light||""}" @click=${()=>this._onEventClick(e)}>
        <div class="event-color-bar" style="background: ${e.calendar_color}"></div>
        <div class="event-content">
          <div class="event-title">${e.summary}</div>
          <div class="event-meta">
            ${t?R`<span class="all-day-label">All Day</span>`:R`
                <span class="event-time-text">
                  ${i}${a?R` – ${a}`:W}
                </span>
              `}
            ${this.showCalendarName?R`
              <span class="event-calendar-name">
                <span class="calendar-dot" style="background: ${e.calendar_color}"></span>
                ${e.calendar_name}
              </span>
            `:W}
          </div>
          ${e.location?R`
            <div class="event-location">
              <ha-icon icon="mdi:map-marker-outline"></ha-icon>
              ${e.location}
            </div>
          `:W}
        </div>
      </div>
    `}_onEventClick(e){this.dispatchEvent(new CustomEvent("event-click",{detail:{event:e},bubbles:!0,composed:!0}))}};nt.styles=[me,be,$e,o`
      :host { display: block; height: 100%; overflow: hidden; }

      .agenda-container {
        display: flex;
        flex-direction: column;
        height: 100%;
        overflow-y: auto;
      }

      .date-group {
        animation: pv-fadeIn 200ms ease;
      }

      .date-header {
        position: sticky;
        top: 0;
        z-index: 2;
        padding: 0.625rem 1rem;
        font-size: 0.8125rem;
        font-weight: 600;
        color: var(--pv-text);
        background: var(--pv-card-bg, #fff);
        border-bottom: 1px solid var(--pv-border-subtle);
      }

      .date-header.today {
        color: var(--pv-accent);
      }

      .date-header-relative {
        font-weight: 600;
      }

      .date-header-full {
        font-weight: 400;
        color: var(--pv-text-secondary);
        margin-left: 0.5rem;
      }

      .agenda-event {
        display: flex;
        align-items: flex-start;
        gap: 0.75rem;
        padding: 0.75rem 1rem;
        cursor: pointer;
        transition: background var(--pv-transition, 200ms ease);
        border-bottom: 1px solid var(--pv-border-subtle);
      }

      .agenda-event:hover {
        background: var(--event-color-light, var(--pv-event-hover));
      }

      .agenda-event:active {
        background: color-mix(in srgb, var(--pv-event-hover) 150%, transparent);
      }

      .event-color-bar {
        width: 4px;
        min-height: 36px;
        border-radius: 2px;
        flex-shrink: 0;
        align-self: stretch;
      }

      .event-content {
        flex: 1;
        min-width: 0;
      }

      .event-title {
        font-size: 0.9375rem;
        font-weight: 500;
        line-height: 1.3;
        color: var(--pv-text);
      }

      .event-meta {
        display: flex;
        gap: 0.75rem;
        margin-top: 0.25rem;
        font-size: 0.8125rem;
        color: var(--pv-text-secondary);
      }

      .event-time-text {
        display: flex;
        align-items: center;
        gap: 0.25rem;
      }

      .event-calendar-name {
        display: flex;
        align-items: center;
        gap: 0.25rem;
      }

      .calendar-dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        flex-shrink: 0;
      }

      .event-location {
        display: flex;
        align-items: center;
        gap: 0.25rem;
        font-size: 0.75rem;
        color: var(--pv-text-muted);
        margin-top: 0.25rem;
      }

      .event-location ha-icon {
        --mdc-icon-size: 14px;
      }

      .empty-state {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 3rem 1rem;
        color: var(--pv-text-muted);
        text-align: center;
      }

      .empty-state ha-icon {
        --mdc-icon-size: 48px;
        opacity: 0.3;
        margin-bottom: 1rem;
      }

      .all-day-label {
        font-weight: 500;
        color: var(--pv-accent);
        font-size: 0.75rem;
      }
    `],e([ve({attribute:!1})],nt.prototype,"hass",void 0),e([ve({type:Array})],nt.prototype,"events",void 0),e([ve({type:Array})],nt.prototype,"calendars",void 0),e([ve({type:Object})],nt.prototype,"currentDate",void 0),e([ve({type:Object})],nt.prototype,"hiddenCalendars",void 0),e([ve({attribute:!1})],nt.prototype,"timeFormat",void 0),e([ve({type:Number})],nt.prototype,"maxEvents",void 0),e([ve({type:Number})],nt.prototype,"daysAhead",void 0),e([ve({type:Boolean})],nt.prototype,"showCalendarName",void 0),e([ve({type:Boolean})],nt.prototype,"showEndTime",void 0),e([ve({attribute:!1})],nt.prototype,"maxHeight",void 0),nt=e([de("pv-view-agenda")],nt);let st=class extends le{constructor(){super(...arguments),this.event=null,this.timeFormat="12h",this._confirmDelete=!1,this._deleting=!1,this._pv=new je(this)}render(){if(!this.event)return W;const e=this.event,t=Ye(e),i=new Date(e.start);return R`
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
                <div>${He(i,"long")}</div>
                ${t?R`
                  <div style="color: var(--pv-text-secondary); font-size: 0.875rem">All Day</div>
                `:R`
                  <div style="color: var(--pv-text-secondary); font-size: 0.875rem">
                    ${Be(e.start,this.timeFormat)} – ${Be(e.end,this.timeFormat)}
                  </div>
                `}
              </div>
            </div>

            ${e.location?R`
              <div class="detail-row">
                <ha-icon icon="mdi:map-marker-outline"></ha-icon>
                <div class="detail-text">${e.location}</div>
              </div>
            `:W}

            ${e.description?R`
              <div class="detail-row">
                <ha-icon icon="mdi:text"></ha-icon>
                <div class="detail-text" style="white-space: pre-wrap;">${e.description}</div>
              </div>
            `:W}
          </div>

          ${this._confirmDelete?R`
            <div class="delete-confirm">
              <div class="delete-confirm-text">
                Delete "${e.summary}"?
              </div>
              <div class="delete-confirm-actions">
                <button class="pv-btn pv-btn-secondary" @click=${()=>this._confirmDelete=!1}>
                  Cancel
                </button>
                <button class="pv-btn btn-delete" ?disabled=${this._deleting} @click=${this._delete}>
                  ${this._deleting?"Deleting...":"Delete"}
                </button>
              </div>
            </div>
          `:R`
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
    `}_close(){this._confirmDelete=!1,this._deleting=!1,this._pv.state.selectEvent(null)}_edit(){this.event&&this._pv.state.openEditDialog(this.event)}async _delete(){if(this.event?.uid){this._deleting=!0;try{const e={entity_id:this.event.calendar_entity_id,uid:this.event.uid,recurrence_id:this.event.recurrence_id};await this._pv.state.doDeleteEvent(this.hass,e)}catch(e){console.error("PlanaVista: Delete failed",e),this._deleting=!1}}else console.warn("PlanaVista: Cannot delete event without UID")}};st.styles=[me,ye,xe,$e,o`
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
    `],e([ve({attribute:!1})],st.prototype,"hass",void 0),e([ve({type:Object})],st.prototype,"event",void 0),e([ve({attribute:!1})],st.prototype,"timeFormat",void 0),e([ge()],st.prototype,"_confirmDelete",void 0),e([ge()],st.prototype,"_deleting",void 0),st=e([de("pv-event-popup")],st);const ot=["Su","Mo","Tu","We","Th","Fr","Sa"];let lt=class extends le{constructor(){super(...arguments),this.calendars=[],this.open=!1,this.mode="create",this.prefill=null,this._title="",this._calendarEntityId="",this._date="",this._startTime="",this._endTime="",this._allDay=!1,this._description="",this._location="",this._showMore=!1,this._saving=!1,this._error="",this._datePickerOpen=!1,this._pickerMonth=0,this._pickerYear=0,this._locationSuggestions=[],this._locationLoading=!1,this._locationFocused=!1,this._locationDebounceTimer=null,this._pv=new je(this)}updated(e){super.updated(e),e.has("open")&&this.open&&(this._initForm(),this._datePickerOpen=!1,requestAnimationFrame(()=>{this._titleInput?.focus()}))}_initForm(){if(this._error="",this._saving=!1,this._showMore=!1,this._locationSuggestions=[],this._locationFocused=!1,this.prefill){if(this._title=this.prefill.summary||"",this._calendarEntityId=this.prefill.calendar_entity_id||this.calendars[0]?.entity_id||"",this._description=this.prefill.description||"",this._location=this.prefill.location||"",this.prefill.start){const e=new Date(this.prefill.start);this._date=this._toDateStr(e),this._pickerYear=e.getFullYear(),this._pickerMonth=e.getMonth(),!this.prefill.start.includes("T")||0===e.getHours()&&0===e.getMinutes()?(this._allDay=!0,this._startTime="",this._endTime=""):(this._allDay=!1,this._startTime=this._toTimeStr(e),this.prefill.end&&(this._endTime=this._toTimeStr(new Date(this.prefill.end))))}else this._setDefaults();(this._description||this._location)&&(this._showMore=!0)}else this._setDefaults()}_setDefaults(){this._title="",this._calendarEntityId=this.calendars[0]?.entity_id||"";const e=new Date;this._date=this._toDateStr(e),this._pickerYear=e.getFullYear(),this._pickerMonth=e.getMonth();const t=15*Math.ceil(e.getMinutes()/15);e.setMinutes(t,0,0),this._startTime=this._toTimeStr(e);const i=new Date(e);i.setHours(i.getHours()+1),this._endTime=this._toTimeStr(i),this._allDay=!1,this._description="",this._location=""}_toDateStr(e){return`${e.getFullYear()}-${String(e.getMonth()+1).padStart(2,"0")}-${String(e.getDate()).padStart(2,"0")}`}_toTimeStr(e){return`${String(e.getHours()).padStart(2,"0")}:${String(e.getMinutes()).padStart(2,"0")}`}_formatDateDisplay(){if(!this._date)return"Select a date";const[e,t,i]=this._date.split("-").map(Number);return new Date(e,t-1,i).toLocaleDateString("en-US",{weekday:"short",month:"long",day:"numeric",year:"numeric"})}render(){if(!this.open)return W;const e=this.calendars.filter(e=>!1!==e.visible),t="edit"===this.mode,i=t?"Edit Event":"New Event";return R`
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
              ${this._error?R`<div class="error-msg">${this._error}</div>`:W}

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
                  ${e.map(e=>R`
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

              ${this._allDay?W:R`
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

              ${this._showMore?R`
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
              `:R`
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
    `}_renderDatePicker(){return R`
      <div class="date-picker-wrap">
        <div class="date-display" @click=${this._toggleDatePicker}>
          <ha-icon icon="mdi:calendar"></ha-icon>
          ${this._formatDateDisplay()}
        </div>
      </div>
    `}_renderDatePickerDropdown(){if(!this._datePickerOpen)return W;const e=this._dateDisplay;if(!e)return W;const t=e.getBoundingClientRect(),i=window.innerHeight-t.bottom-8<330&&t.top>330?t.top-330-4:t.bottom+4;return R`
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
          ${ot.map(e=>R`<span class="picker-weekday">${e}</span>`)}
        </div>
        <div class="picker-days">
          ${this._getPickerDays().map(e=>{const t=e.getMonth()!==this._pickerMonth,i=this._toDateStr(e)===this._toDateStr(new Date),a=this._toDateStr(e)===this._date;return R`
              <button
                class="picker-day ${t?"other-month":""} ${i?"today":""} ${a?"selected":""}"
                @click=${()=>this._selectPickerDay(e)}
              >${e.getDate()}</button>
            `})}
        </div>
      </div>
    `}_toggleDatePicker(){if(this._datePickerOpen=!this._datePickerOpen,this._datePickerOpen&&this._date){const[e,t]=this._date.split("-").map(Number);this._pickerYear=e,this._pickerMonth=t-1}}_pickerPrevMonth(){this._pickerMonth--,this._pickerMonth<0&&(this._pickerMonth=11,this._pickerYear--)}_pickerNextMonth(){this._pickerMonth++,this._pickerMonth>11&&(this._pickerMonth=0,this._pickerYear++)}_getPickerDays(){const e=new Date(this._pickerYear,this._pickerMonth,1),t=e.getDay(),i=new Date(e);i.setDate(i.getDate()-t);const a=[];for(let e=0;e<42;e++){const t=new Date(i);t.setDate(t.getDate()+e),a.push(t)}return a}_selectPickerDay(e){this._date=this._toDateStr(e),this._datePickerOpen=!1}_renderLocationField(){return R`
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
    `}_renderLocationDropdown(){if(!this._locationFocused||!this._locationSuggestions.length&&!this._locationLoading)return W;const e=this._locationInput;if(!e)return W;const t=e.getBoundingClientRect();return R`
      <div
        class="location-suggestions-fixed"
        style="top: ${t.bottom}px; left: ${t.left}px; width: ${t.width}px;"
      >
        ${this._locationLoading?R`
          <div class="location-loading">Searching...</div>
        `:W}
        ${this._locationSuggestions.map(e=>R`
          <div class="location-suggestion" @mousedown=${()=>this._selectLocation(e.display_name)}>
            <ha-icon icon="mdi:map-marker"></ha-icon>
            <span>${e.display_name}</span>
          </div>
        `)}
        ${this._locationSuggestions.length>0?R`
          <div class="location-powered">Powered by OpenStreetMap</div>
        `:W}
      </div>
    `}_onLocationInput(e){const t=e.target.value;if(this._location=t,this._locationDebounceTimer&&clearTimeout(this._locationDebounceTimer),t.trim().length<3)return this._locationSuggestions=[],void(this._locationLoading=!1);this._locationLoading=!0,this._locationDebounceTimer=setTimeout(()=>{this._searchLocation(t.trim())},350)}async _searchLocation(e){try{const t=this.hass?.config?.latitude,i=this.hass?.config?.longitude;let a=`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(e)}&format=json&addressdetails=1&limit=20`;if(null!=t&&null!=i){const e=2;a+=`&viewbox=${i-e},${t+e},${i+e},${t-e}`,a+="&bounded=0"}const r=await fetch(a,{headers:{"Accept-Language":"en"}});if(!r.ok)throw new Error("Search failed");const n=await r.json();null!=t&&null!=i&&n.sort((e,a)=>this._haversine(t,i,parseFloat(e.lat),parseFloat(e.lon))-this._haversine(t,i,parseFloat(a.lat),parseFloat(a.lon))),this._locationSuggestions=n.slice(0,5).map(e=>({display_name:e.display_name}))}catch{this._locationSuggestions=[]}finally{this._locationLoading=!1}}_haversine(e,t,i,a){const r=(i-e)*Math.PI/180,n=(a-t)*Math.PI/180,s=Math.sin(r/2)*Math.sin(r/2)+Math.cos(e*Math.PI/180)*Math.cos(i*Math.PI/180)*Math.sin(n/2)*Math.sin(n/2);return 12742*Math.atan2(Math.sqrt(s),Math.sqrt(1-s))}_selectLocation(e){this._location=e,this._locationSuggestions=[],this._locationFocused=!1}_onOverlayClick(){this._close()}_close(){this._datePickerOpen=!1,this._locationSuggestions=[],this._pv.state.closeDialog()}async _save(){if(this._title.trim())if(this._calendarEntityId)if(!this._allDay&&this._endTime<=this._startTime)this._error="End time must be after start time";else if("edit"!==this.mode||this.prefill?.uid){this._error="",this._saving=!0;try{const e={entity_id:this._calendarEntityId,summary:this._title.trim()};if(this._allDay){e.start_date=this._date;const t=new Date(this._date);t.setDate(t.getDate()+1),e.end_date=`${t.getFullYear()}-${String(t.getMonth()+1).padStart(2,"0")}-${String(t.getDate()).padStart(2,"0")}`}else e.start_date_time=`${this._date}T${this._startTime}:00`,e.end_date_time=`${this._date}T${this._endTime}:00`;if(this._description.trim()&&(e.description=this._description.trim()),this._location.trim()&&(e.location=this._location.trim()),"edit"===this.mode&&this.prefill?.uid){const t={entity_id:this.prefill.calendar_entity_id,uid:this.prefill.uid,recurrence_id:this.prefill.recurrence_id};await this._pv.state.doEditEvent(this.hass,t,e)}else await this._pv.state.doCreateEvent(this.hass,e)}catch(e){this._error=`Failed to save event: ${e?.message||"Unknown error"}`,this._saving=!1}}else this._error="Cannot edit this event (no unique ID). Try deleting and recreating it.";else this._error="Please select a calendar";else this._error="Please enter an event title"}};lt.styles=[me,ye,we,xe,$e,o`
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
    `],e([ve({attribute:!1})],lt.prototype,"hass",void 0),e([ve({type:Array})],lt.prototype,"calendars",void 0),e([ve({type:Boolean})],lt.prototype,"open",void 0),e([ve({type:String})],lt.prototype,"mode",void 0),e([ve({type:Object})],lt.prototype,"prefill",void 0),e([ge()],lt.prototype,"_title",void 0),e([ge()],lt.prototype,"_calendarEntityId",void 0),e([ge()],lt.prototype,"_date",void 0),e([ge()],lt.prototype,"_startTime",void 0),e([ge()],lt.prototype,"_endTime",void 0),e([ge()],lt.prototype,"_allDay",void 0),e([ge()],lt.prototype,"_description",void 0),e([ge()],lt.prototype,"_location",void 0),e([ge()],lt.prototype,"_showMore",void 0),e([ge()],lt.prototype,"_saving",void 0),e([ge()],lt.prototype,"_error",void 0),e([ge()],lt.prototype,"_datePickerOpen",void 0),e([ge()],lt.prototype,"_pickerMonth",void 0),e([ge()],lt.prototype,"_pickerYear",void 0),e([ge()],lt.prototype,"_locationSuggestions",void 0),e([ge()],lt.prototype,"_locationLoading",void 0),e([ge()],lt.prototype,"_locationFocused",void 0),e([ue("#title-input")],lt.prototype,"_titleInput",void 0),e([ue(".location-input")],lt.prototype,"_locationInput",void 0),e([ue(".date-display")],lt.prototype,"_dateDisplay",void 0),lt=e([de("pv-event-create-dialog")],lt);let ct=class extends le{constructor(){super(...arguments),this._currentTime=new Date,this._filterOpen=!1,this._pv=new je(this),this._clockTimer=null,this._touchStartX=0,this._filterCloseHandler=e=>this._onFilterClickOutside(e)}connectedCallback(){super.connectedCallback(),this._clockTimer=setInterval(()=>{this._currentTime=new Date},1e3)}disconnectedCallback(){super.disconnectedCallback(),this._clockTimer&&(clearInterval(this._clockTimer),this._clockTimer=null),document.removeEventListener("click",this._filterCloseHandler)}setConfig(e){this._config={entity:"sensor.planavista_config",view:"day",...e},e?.view&&this._pv.state.setView(e.view)}firstUpdated(){if(!this._config?.view){const e=this.hass?ze(this.hass,this._config?.entity):null;e?.display?.default_view&&this._pv.state.setView(e.display.default_view)}}updated(e){if(super.updated(e),e.has("hass")||e.has("_config")){const e=ze(this.hass,this._config?.entity);Ne(this,Re(this._config?.theme,e?.display?.theme))}}_getData(){return ze(this.hass,this._config?.entity)}_getWeatherEntity(){const e=this._getData(),t=this._config?.weather_entity||e?.display?.weather_entity;return t?this.hass?.states?.[t]:null}_getWeatherEntityId(){const e=this._getData();return this._config?.weather_entity||e?.display?.weather_entity||null}_onOnboardingComplete(){}_showWeatherDetails(){const e=this._getWeatherEntityId();if(e){const t=new CustomEvent("hass-more-info",{detail:{entityId:e},bubbles:!0,composed:!0});this.dispatchEvent(t)}}render(){if(!this._config||!this.hass)return W;const e=this._getData();if(!e)return R`
        <ha-card>
          <div class="pvc-empty">
            <p>PlanaVista entity not found</p>
            <p style="font-size: 0.8rem;">Check that the PlanaVista integration is configured.</p>
          </div>
        </ha-card>
      `;if(!1===e.onboarding_complete)return R`
        <ha-card>
          <pv-onboarding-wizard
            .hass=${this.hass}
            @onboarding-complete=${this._onOnboardingComplete}
          ></pv-onboarding-wizard>
        </ha-card>
      `;const t=this._pv.state,i=t.currentView;t.currentDate;const a=(e.calendars||[]).filter(e=>!1!==e.visible),r=e.events||[],n=e.display,s=Ze(r,t.hiddenCalendars);return R`
      <ha-card>
        ${this._renderHeader(n)}
        ${this._renderToolbar(a,i)}
        <div class="pvc-body"
          @touchstart=${this._onTouchStart}
          @touchend=${this._onTouchEnd}
          @event-click=${this._onEventClick}
          @day-click=${this._onDayClick}
        >
          ${this._renderView(i,s,a,n)}
        </div>

        ${t.selectedEvent?R`
          <pv-event-popup
            .hass=${this.hass}
            .event=${t.selectedEvent}
            .timeFormat=${n?.time_format||"12h"}
          ></pv-event-popup>
        `:W}

        ${t.dialogOpen?R`
          <pv-event-create-dialog
            .hass=${this.hass}
            .calendars=${a}
            .open=${!0}
            .mode=${t.dialogOpen}
            .prefill=${t.createPrefill}
          ></pv-event-create-dialog>
        `:W}
      </ha-card>
    `}_renderHeader(e){const t=this._getWeatherEntity(),i=e?.time_format||"12h",a=this._currentTime,r=a.getHours(),n=String(a.getMinutes()).padStart(2,"0");let s;s="24h"===i?R`<span class="pvc-time-display">${r}:${n}</span>`:R`<span class="pvc-time-display">${r%12||12}:${n}</span><span class="pvc-time-ampm">${r>=12?"PM":"AM"}</span>`;const o=a.toLocaleDateString("en-US",{weekday:"long",month:"long",day:"numeric"});return R`
      <div class="pvc-header">
        ${t?R`
          <div class="pvc-weather" @click=${this._showWeatherDetails}
               title="Click for weather details">
            <div class="pvc-weather-icon">
              ${Ge(t.state||"cloudy",48)}
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
        `:R`<div class="pvc-no-weather"></div>`}

        <div class="pvc-header-date">${o}</div>

        <div class="pvc-header-time">${s}</div>
      </div>
    `}_getTempUnit(e){return(e.attributes.temperature_unit||"").includes("C")?"C":"F"}_renderToolbar(e,t){const i=e.filter(e=>this._pv.state.hiddenCalendars.has(e.entity_id)).length;return R`
      <div class="pvc-toolbar">
        <div class="pvc-filter-wrap">
          <button
            class="pvc-filter-btn ${i>0?"has-hidden":""}"
            @click=${this._toggleFilterDropdown}
          >
            <ha-icon icon="mdi:filter-variant" style="--mdc-icon-size: 20px"></ha-icon>
            Calendars
            ${i>0?R`<span class="pvc-filter-badge">${e.length-i}/${e.length}</span>`:W}
          </button>

          ${this._filterOpen?R`
            <div class="pvc-filter-panel">
              ${e.map(e=>{const t=!this._pv.state.hiddenCalendars.has(e.entity_id),i=e.person_entity?Me(this.hass,e.person_entity):null,a=e.display_name||(e.person_entity?Te(this.hass,e.person_entity):e.entity_id),r=(a||"?")[0].toUpperCase();return R`
                  <div
                    class="pvc-filter-item ${t?"active":""}"
                    style="--item-color: ${e.color}"
                    @click=${()=>this._pv.state.toggleCalendar(e.entity_id)}
                  >
                    <div class="pvc-filter-check">
                      ${t?R`<span class="pvc-filter-check-icon">✓</span>`:W}
                    </div>
                    <div
                      class="pvc-filter-avatar"
                      style="${i?`background-image: url(${i}); background-color: ${e.color}`:`background: ${e.color}`}"
                    >${i?"":r}</div>
                    <span class="pvc-filter-name">${a}</span>
                  </div>
                `})}
            </div>
          `:W}
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
            ${["day","week","month","agenda"].map(e=>R`
              <button
                class="pvc-view-tab ${t===e?"active":""}"
                @click=${()=>this._pv.state.setView(e)}
              >${e}</button>
            `)}
          </div>
        </div>
      </div>
    `}_toggleFilterDropdown(e){e.stopPropagation(),this._filterOpen=!this._filterOpen,this._filterOpen?requestAnimationFrame(()=>{document.addEventListener("click",this._filterCloseHandler)}):document.removeEventListener("click",this._filterCloseHandler)}_onFilterClickOutside(e){const t=e.composedPath(),i=this.shadowRoot?.querySelector(".pvc-filter-panel"),a=this.shadowRoot?.querySelector(".pvc-filter-btn");i&&!t.includes(i)&&a&&!t.includes(a)&&(this._filterOpen=!1,document.removeEventListener("click",this._filterCloseHandler))}_renderView(e,t,i,a){const r=a?.time_format||"12h",n=a?.first_day||"sunday",s=this._pv.state.currentDate,o=this._pv.state.hiddenCalendars;switch(e){case"day":return R`<pv-view-day
          .hass=${this.hass}
          .events=${t}
          .calendars=${i}
          .currentDate=${s}
          .hiddenCalendars=${o}
          .timeFormat=${r}
          .hideColumnHeaders=${!1}
        ></pv-view-day>`;case"week":return R`<pv-view-week
          .hass=${this.hass}
          .events=${t}
          .calendars=${i}
          .currentDate=${s}
          .hiddenCalendars=${o}
          .timeFormat=${r}
          .firstDay=${n}
        ></pv-view-week>`;case"month":return R`<pv-view-month
          .hass=${this.hass}
          .events=${t}
          .calendars=${i}
          .currentDate=${s}
          .hiddenCalendars=${o}
          .firstDay=${n}
        ></pv-view-month>`;case"agenda":return R`<pv-view-agenda
          .hass=${this.hass}
          .events=${t}
          .calendars=${i}
          .currentDate=${s}
          .hiddenCalendars=${o}
          .timeFormat=${r}
        ></pv-view-agenda>`;default:return W}}_onEventClick(e){this._pv.state.selectEvent(e.detail.event)}_onDayClick(e){this._pv.state.setDate(e.detail.date),this._pv.state.setView("day")}_onTouchStart(e){this._touchStartX=e.touches[0].clientX}_onTouchEnd(e){const t=e.changedTouches[0].clientX-this._touchStartX;Math.abs(t)>50&&this._pv.state.navigateDate(t>0?"prev":"next")}static getConfigElement(){return document.createElement("planavista-calendar-card-editor")}static getStubConfig(){return{entity:"sensor.planavista_config",view:"day"}}getCardSize(){return 10}};ct.styles=[me,ye,fe,$e,o`
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

      /* Placeholder when no weather configured */
      .pvc-no-weather {
        padding: 6px 10px;
        opacity: 0.6;
        font-size: 0.875rem;
      }

      /* Responsive: stack controls on narrow screens */
      @media (max-width: 600px) {
        .pvc-toolbar {
          flex-wrap: wrap;
          justify-content: center;
        }

        .pvc-controls {
          width: 100%;
          justify-content: center;
          flex-wrap: wrap;
        }
      }
    `],e([ve({attribute:!1})],ct.prototype,"hass",void 0),e([ge()],ct.prototype,"_config",void 0),e([ge()],ct.prototype,"_currentTime",void 0),e([ge()],ct.prototype,"_filterOpen",void 0),ct=e([de("planavista-calendar-card")],ct);let dt=class extends le{constructor(){super(...arguments),this._pv=new je(this),this._touchStartX=0}setConfig(e){this._config={entity:"sensor.planavista_config",...e},e.view&&this._pv.state.setView(e.view)}connectedCallback(){if(super.connectedCallback(),!this._config?.view){const e=this.hass?ze(this.hass,this._config?.entity):null;e?.display?.default_view&&this._pv.state.setView(e.display.default_view)}}updated(e){if(super.updated(e),e.has("hass")||e.has("_config")){const e=ze(this.hass,this._config?.entity);Ne(this,Re(this._config?.theme,e?.display?.theme))}}_getData(){return ze(this.hass,this._config?.entity)}render(){if(!this._config||!this.hass)return W;const e=this._getData();if(!e)return R`
        <ha-card>
          <div style="padding: 2rem; text-align: center; color: var(--pv-text-muted);">
            <p>PlanaVista entity not found</p>
          </div>
        </ha-card>
      `;const t=this._pv.state,i=t.currentView,a=t.currentDate,r=e.calendars||[],n=e.events||[],s=e.display,o=Ze(n,t.hiddenCalendars);let l="";switch(i){case"day":l=He(a,"long");break;case"week":l=He(a,"medium");break;case"month":l=a.toLocaleDateString("en-US",{month:"long",year:"numeric"});break;case"agenda":l="Upcoming"}return R`
      <ha-card>
        <div class="nav-header">
          <div class="nav-left">
            <button class="nav-btn" @click=${()=>t.navigateDate("prev")}>
              <ha-icon icon="mdi:chevron-left"></ha-icon>
            </button>
            <button class="today-btn" @click=${()=>t.navigateDate("today")}>Today</button>
            <button class="nav-btn" @click=${()=>t.navigateDate("next")}>
              <ha-icon icon="mdi:chevron-right"></ha-icon>
            </button>
          </div>

          <span class="nav-title">${l}</span>

          <div class="view-tabs">
            ${["day","week","month"].map(e=>R`
              <button
                class="view-tab ${i===e?"active":""}"
                @click=${()=>t.setView(e)}
              >${e}</button>
            `)}
          </div>
        </div>

        <div class="view-container"
          @touchstart=${this._onTouchStart}
          @touchend=${this._onTouchEnd}
          @event-click=${this._onEventClick}
          @day-click=${this._onDayClick}
        >
          ${this._renderView(i,o,r,s)}
        </div>

        ${t.selectedEvent?R`
          <pv-event-popup
            .hass=${this.hass}
            .event=${t.selectedEvent}
            .timeFormat=${s?.time_format||"12h"}
          ></pv-event-popup>
        `:W}

        ${t.dialogOpen?R`
          <pv-event-create-dialog
            .hass=${this.hass}
            .calendars=${r}
            .open=${!0}
            .mode=${t.dialogOpen}
            .prefill=${t.createPrefill}
          ></pv-event-create-dialog>
        `:W}
      </ha-card>
    `}_renderView(e,t,i,a){const r=a?.time_format||"12h",n=a?.first_day||"sunday",s=this._pv.state.currentDate,o=this._pv.state.hiddenCalendars;switch(e){case"day":return R`<pv-view-day
          .hass=${this.hass}
          .events=${t}
          .calendars=${i}
          .currentDate=${s}
          .hiddenCalendars=${o}
          .timeFormat=${r}
        ></pv-view-day>`;case"week":return R`<pv-view-week
          .hass=${this.hass}
          .events=${t}
          .calendars=${i}
          .currentDate=${s}
          .hiddenCalendars=${o}
          .timeFormat=${r}
          .firstDay=${n}
        ></pv-view-week>`;case"month":return R`<pv-view-month
          .hass=${this.hass}
          .events=${t}
          .calendars=${i}
          .currentDate=${s}
          .hiddenCalendars=${o}
          .firstDay=${n}
        ></pv-view-month>`;case"agenda":return R`<pv-view-agenda
          .hass=${this.hass}
          .events=${t}
          .calendars=${i}
          .currentDate=${s}
          .hiddenCalendars=${o}
          .timeFormat=${r}
        ></pv-view-agenda>`;default:return W}}_onEventClick(e){this._pv.state.selectEvent(e.detail.event)}_onDayClick(e){this._pv.state.setDate(e.detail.date),this._pv.state.setView("day")}_onTouchStart(e){this._touchStartX=e.touches[0].clientX}_onTouchEnd(e){const t=e.changedTouches[0].clientX-this._touchStartX;Math.abs(t)>50&&this._pv.state.navigateDate(t>0?"prev":"next")}getCardSize(){return 8}static getStubConfig(){return{entity:"sensor.planavista_config",view:"day"}}};dt.styles=[me,ye,fe,$e,o`
      :host { display: block; }

      ha-card {
        display: flex;
        flex-direction: column;
        overflow: hidden;
        height: 100%;
      }

      /* Navigation header */
      .nav-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0.75rem 1rem;
        border-bottom: 1px solid var(--pv-border);
        flex-shrink: 0;
        gap: 0.5rem;
      }

      .nav-left {
        display: flex;
        align-items: center;
        gap: 0.25rem;
      }

      .nav-title {
        font-size: 1.125rem;
        font-weight: 600;
        color: var(--pv-text);
        min-width: 0;
        white-space: nowrap;
      }

      .nav-btn {
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
        transition: all var(--pv-transition);
        font-family: inherit;
        -webkit-tap-highlight-color: transparent;
      }

      .nav-btn:hover {
        background: var(--pv-event-hover);
        color: var(--pv-text);
      }

      .today-btn {
        padding: 0.25rem 0.75rem;
        border: 1px solid var(--pv-border);
        border-radius: 9999px;
        background: transparent;
        color: var(--pv-text-secondary);
        font-size: 0.75rem;
        font-weight: 600;
        cursor: pointer;
        transition: all var(--pv-transition);
        font-family: inherit;
        min-height: 36px;
      }

      .today-btn:hover {
        background: var(--pv-accent);
        color: var(--pv-accent-text);
        border-color: var(--pv-accent);
      }

      .view-tabs {
        display: flex;
        gap: 2px;
        background: var(--pv-border-subtle);
        border-radius: 8px;
        padding: 2px;
      }

      .view-tab {
        padding: 0.25rem 0.625rem;
        border: none;
        border-radius: 6px;
        background: transparent;
        color: var(--pv-text-secondary);
        font-size: 0.6875rem;
        font-weight: 500;
        cursor: pointer;
        transition: all var(--pv-transition);
        font-family: inherit;
        text-transform: capitalize;
        min-height: 32px;
      }

      .view-tab.active {
        background: var(--pv-card-bg);
        color: var(--pv-text);
        box-shadow: var(--pv-shadow);
      }

      .view-tab:hover:not(.active) {
        color: var(--pv-text);
      }

      /* View container */
      .view-container {
        flex: 1;
        overflow: hidden;
        position: relative;
        min-height: 400px;
      }

      .view-container > * {
        height: 100%;
      }
    `],e([ve({attribute:!1})],dt.prototype,"hass",void 0),e([ge()],dt.prototype,"_config",void 0),dt=e([de("planavista-grid-card")],dt);let pt=class extends le{constructor(){super(...arguments),this._pv=new je(this)}setConfig(e){this._config={entity:"sensor.planavista_config",max_events:10,days_ahead:7,show_calendar_name:!0,show_end_time:!1,...e}}updated(e){if(super.updated(e),e.has("hass")||e.has("_config")){const e=ze(this.hass,this._config?.entity);Ne(this,Re(this._config?.theme,e?.display?.theme))}}render(){if(!this._config||!this.hass)return W;const e=ze(this.hass,this._config.entity);if(!e)return R`<ha-card><div style="padding:1rem;text-align:center;color:var(--pv-text-muted)">No data</div></ha-card>`;const t=Ze(e.events||[],this._pv.state.hiddenCalendars),i=this._config.time_format||e.display?.time_format||"12h";return R`
      <ha-card>
        <div class="agenda-header">
          <span class="agenda-title">Upcoming</span>
          <span class="event-count">${t.length} events</span>
        </div>
        <pv-view-agenda
          .hass=${this.hass}
          .events=${t}
          .calendars=${e.calendars||[]}
          .currentDate=${new Date}
          .hiddenCalendars=${this._pv.state.hiddenCalendars}
          .timeFormat=${i}
          .maxEvents=${this._config.max_events||10}
          .daysAhead=${this._config.days_ahead||7}
          .showCalendarName=${!1!==this._config.show_calendar_name}
          .showEndTime=${!0===this._config.show_end_time}
          .maxHeight=${this._config.max_height||""}
          @event-click=${this._onEventClick}
        ></pv-view-agenda>

        ${this._pv.state.selectedEvent?R`
          <pv-event-popup
            .hass=${this.hass}
            .event=${this._pv.state.selectedEvent}
            .timeFormat=${i}
          ></pv-event-popup>
        `:W}
      </ha-card>
    `}_onEventClick(e){this._pv.state.selectEvent(e.detail.event)}getCardSize(){return 4}static getStubConfig(){return{entity:"sensor.planavista_config",max_events:10,days_ahead:7}}};pt.styles=[me,o`
      :host { display: block; }

      ha-card {
        overflow: hidden;
      }

      .agenda-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0.875rem 1rem;
        border-bottom: 1px solid var(--pv-border-subtle);
      }

      .agenda-title {
        font-size: 0.9375rem;
        font-weight: 600;
        color: var(--pv-text);
      }

      .event-count {
        font-size: 0.75rem;
        color: var(--pv-text-muted);
        font-weight: 500;
      }
    `],e([ve({attribute:!1})],pt.prototype,"hass",void 0),e([ge()],pt.prototype,"_config",void 0),pt=e([de("planavista-agenda-card")],pt);let ht=class extends le{constructor(){super(...arguments),this._time="",this._date=""}setConfig(e){this._config={entity:"sensor.planavista_config",size:"large",show_date:!0,show_seconds:!1,time_format:void 0,align:"center",...e}}connectedCallback(){super.connectedCallback(),this._updateTime(),this._timer=setInterval(()=>this._updateTime(),1e3)}disconnectedCallback(){super.disconnectedCallback(),this._timer&&(clearInterval(this._timer),this._timer=void 0)}_updateTime(){const e=new Date,t=this._config?.time_format||this._getDisplayConfig()?.time_format||"12h",i=this._config?.show_seconds||!1;if("24h"===t){const t=String(e.getHours()).padStart(2,"0"),a=String(e.getMinutes()).padStart(2,"0"),r=String(e.getSeconds()).padStart(2,"0");this._time=i?`${t}:${a}:${r}`:`${t}:${a}`}else{let t=e.getHours();const a=t>=12?"PM":"AM";t=t%12||12;const r=String(e.getMinutes()).padStart(2,"0"),n=String(e.getSeconds()).padStart(2,"0"),s=i?`${t}:${r}:${n}`:`${t}:${r}`;this._time=`${s}|${a}`}!1!==this._config?.show_date&&(this._date=He(e,"long"))}_getDisplayConfig(){if(!this.hass)return;const e=ze(this.hass,this._config?.entity);return e?.display}updated(e){if(super.updated(e),e.has("hass")||e.has("_config")){const e=this._getDisplayConfig();Ne(this,Re(this._config?.theme,e?.theme))}}render(){if(!this._config)return W;const e=this._config.size||"large",t=this._config.align||"center",i=`${this._config.background?`background: ${this._config.background};`:""}${this._config.text_color?`color: ${this._config.text_color};`:""}`,a=this._time.split("|"),r=a[0],n=a[1]||"";return R`
      <ha-card style="${i}">
        <div class="clock-container align-${t}">
          <div class="time size-${e}">
            ${r}${n?R`<span class="period">${n}</span>`:W}
          </div>
          ${!1!==this._config.show_date?R`<div class="date">${this._date}</div>`:W}
        </div>
      </ha-card>
    `}getCardSize(){const e=this._config?.size||"large";return"small"===e?2:"medium"===e?3:4}static getConfigElement(){return document.createElement("planavista-clock-card-editor")}static getStubConfig(){return{entity:"sensor.planavista_config",size:"large",show_date:!0}}};ht.styles=[me,o`
      :host {
        display: block;
      }

      ha-card {
        padding: 1.5rem;
        overflow: hidden;
        display: flex;
        flex-direction: column;
        justify-content: center;
      }

      .clock-container {
        display: flex;
        flex-direction: column;
      }

      .clock-container.align-left { text-align: left; }
      .clock-container.align-center { text-align: center; }
      .clock-container.align-right { text-align: right; }

      .time {
        font-weight: 300;
        line-height: 1.1;
        letter-spacing: -0.03em;
        font-variant-numeric: tabular-nums;
      }

      .time.size-small { font-size: 2rem; }
      .time.size-medium { font-size: 3.5rem; }
      .time.size-large { font-size: 5rem; }

      .time .period {
        font-size: 0.35em;
        font-weight: 400;
        letter-spacing: 0.02em;
        opacity: 0.7;
        margin-left: 0.15em;
        vertical-align: super;
      }

      .date {
        font-size: 1rem;
        font-weight: 400;
        margin-top: 0.5rem;
        opacity: 0.85;
      }

      .time.size-large + .date { font-size: 1.25rem; margin-top: 0.75rem; }
      .time.size-small + .date { font-size: 0.875rem; margin-top: 0.25rem; }
    `],e([ve({attribute:!1})],ht.prototype,"hass",void 0),e([ge()],ht.prototype,"_config",void 0),e([ge()],ht.prototype,"_time",void 0),e([ge()],ht.prototype,"_date",void 0),ht=e([de("planavista-clock-card")],ht);let vt=class extends le{setConfig(e){this._config=e}render(){return this._config?R`
      <div class="editor">
        <div class="row">
          <label>Size</label>
          <select @change=${e=>this._changed("size",e.target.value)}>
            <option value="small" ?selected=${"small"===this._config.size}>Small</option>
            <option value="medium" ?selected=${"medium"===this._config.size}>Medium</option>
            <option value="large" ?selected=${"large"===this._config.size}>Large</option>
          </select>
        </div>
        <div class="row">
          <label>Time Format</label>
          <select @change=${e=>this._changed("time_format",e.target.value)}>
            <option value="" ?selected=${!this._config.time_format}>Auto</option>
            <option value="12h" ?selected=${"12h"===this._config.time_format}>12h</option>
            <option value="24h" ?selected=${"24h"===this._config.time_format}>24h</option>
          </select>
        </div>
        <div class="row">
          <label>Alignment</label>
          <select @change=${e=>this._changed("align",e.target.value)}>
            <option value="left" ?selected=${"left"===this._config.align}>Left</option>
            <option value="center" ?selected=${"center"===this._config.align}>Center</option>
            <option value="right" ?selected=${"right"===this._config.align}>Right</option>
          </select>
        </div>
        <div class="row">
          <label>Show Date</label>
          <input type="checkbox" ?checked=${!1!==this._config.show_date}
            @change=${e=>this._changed("show_date",e.target.checked)} />
        </div>
        <div class="row">
          <label>Show Seconds</label>
          <input type="checkbox" ?checked=${!0===this._config.show_seconds}
            @change=${e=>this._changed("show_seconds",e.target.checked)} />
        </div>
        <div class="row">
          <label>Background</label>
          <input type="text" .value=${this._config.background||""}
            placeholder="e.g. linear-gradient(...)"
            @input=${e=>this._changed("background",e.target.value)} />
        </div>
        <div class="row">
          <label>Text Color</label>
          <input type="text" .value=${this._config.text_color||""}
            placeholder="e.g. #ffffff"
            @input=${e=>this._changed("text_color",e.target.value)} />
        </div>
      </div>
    `:W}_changed(e,t){const i={...this._config,[e]:t};""!==t&&void 0!==t||delete i[e],this._config=i,this.dispatchEvent(new CustomEvent("config-changed",{detail:{config:i},bubbles:!0,composed:!0}))}};vt.styles=o`
    .editor {
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    .row {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    label {
      font-size: 14px;
      font-weight: 500;
    }
    select, input {
      padding: 8px;
      border: 1px solid var(--divider-color, #e0e0e0);
      border-radius: 4px;
      background: var(--card-background-color, #fff);
      color: var(--primary-text-color, #000);
    }
  `,e([ve({attribute:!1})],vt.prototype,"hass",void 0),e([ge()],vt.prototype,"_config",void 0),vt=e([de("planavista-clock-card-editor")],vt);const gt={sunny:"linear-gradient(135deg, #FBBF24 0%, #F97316 100%)","clear-night":"linear-gradient(135deg, #1E3A5F 0%, #0F172A 100%)",cloudy:"linear-gradient(135deg, #94A3B8 0%, #64748B 100%)",partlycloudy:"linear-gradient(135deg, #60A5FA 0%, #818CF8 100%)",rainy:"linear-gradient(135deg, #475569 0%, #334155 100%)",pouring:"linear-gradient(135deg, #334155 0%, #1E293B 100%)",snowy:"linear-gradient(135deg, #CBD5E1 0%, #94A3B8 100%)",fog:"linear-gradient(135deg, #94A3B8 0%, #CBD5E1 100%)",lightning:"linear-gradient(135deg, #475569 0%, #1E293B 100%)",windy:"linear-gradient(135deg, #60A5FA 0%, #3B82F6 100%)",default:"linear-gradient(135deg, #667eea 0%, #764ba2 100%)"};let ut=class extends le{setConfig(e){this._config={entity:"sensor.planavista_config",show_details:!0,show_forecast:!1,layout:"horizontal",...e}}updated(e){if(super.updated(e),e.has("hass")||e.has("_config")){const e=this._getDisplayConfig();Ne(this,Re(this._config?.theme,e?.theme))}}_getDisplayConfig(){if(this.hass)return ze(this.hass,this._config?.entity)?.display}_getWeatherEntity(){const e=this._config?.weather_entity||this._getDisplayConfig()?.weather_entity;return e?this.hass?.states?.[e]:null}render(){if(!this._config||!this.hass)return W;const e=this._getWeatherEntity();if(!e)return R`
        <ha-card>
          <div class="no-weather">
            <ha-icon icon="mdi:weather-cloudy-alert"></ha-icon>
            <p>No weather entity configured</p>
          </div>
        </ha-card>
      `;const t=e.state||"cloudy",i=Math.round(e.attributes.temperature??0),a=e.attributes.humidity,r=e.attributes.wind_speed,n=e.attributes.temperature_unit||"°F",s=e.attributes.wind_speed_unit||"mph",o=!1!==this._config.show_details,l=!0===this._config.show_forecast,c=e.attributes.forecast||[],d=this._config.layout||"horizontal",p=this._config.background||gt[t]||gt.default,h=this._config.text_color||"white";return R`
      <ha-card style="${`background: ${p}; color: ${h};`}">
        <div class="weather-main ${"vertical"===d?"vertical":""}">
          <div class="weather-icon">
            ${Ge(t,56)}
          </div>
          <div class="weather-info">
            <div class="weather-temp">
              ${i}<span class="unit">${n}</span>
            </div>
            <div class="weather-condition">
              ${t.replace(/-/g," ")}
            </div>
          </div>
        </div>

        ${o?R`
          <div class="weather-details">
            ${null!=a?R`
              <div class="weather-detail">
                <ha-icon icon="mdi:water-percent"></ha-icon>
                <span>${a}%</span>
              </div>
            `:W}
            ${null!=r?R`
              <div class="weather-detail">
                <ha-icon icon="mdi:weather-windy"></ha-icon>
                <span>${r} ${s}</span>
              </div>
            `:W}
          </div>
        `:W}

        ${l&&c.length>0?R`
          <div class="forecast">
            ${c.slice(0,5).map(e=>{const t=new Date(e.datetime).toLocaleDateString("en-US",{weekday:"short"});return R`
                <div class="forecast-day">
                  <div class="forecast-day-name">${t}</div>
                  <div class="forecast-icon">
                    ${Ge(e.condition,28)}
                  </div>
                  <div class="forecast-temps">
                    <span class="forecast-high">${Math.round(e.temperature)}\u00B0</span>
                    ${null!=e.templow?R`<span class="forecast-low"> / ${Math.round(e.templow)}\u00B0</span>`:W}
                  </div>
                </div>
              `})}
          </div>
        `:W}
      </ha-card>
    `}getCardSize(){return this._config?.show_forecast?4:2}static getStubConfig(){return{entity:"sensor.planavista_config",show_details:!0,show_forecast:!1}}};ut.styles=[me,fe,o`
      ${s("\n  @keyframes pv-rain-fall {\n    0% { transform: translateY(0); opacity: 1; }\n    100% { transform: translateY(8px); opacity: 0; }\n  }\n\n  @keyframes pv-snow-fall {\n    0% { transform: translateY(0) rotate(0deg); opacity: 1; }\n    100% { transform: translateY(10px) rotate(180deg); opacity: 0; }\n  }\n\n  @keyframes pv-sun-spin {\n    from { transform-origin: center; transform: rotate(0deg); }\n    to { transform-origin: center; transform: rotate(360deg); }\n  }\n\n  .pv-rain-drop {\n    animation: pv-rain-fall 1s ease-in infinite;\n  }\n\n  .pv-snow-flake {\n    animation: pv-snow-fall 2s ease-in-out infinite;\n  }\n\n  .pv-sun-ray {\n    animation: pv-sun-spin 20s linear infinite;\n    transform-origin: 32px 32px;\n  }\n")}

      :host { display: block; }

      ha-card {
        padding: 1.5rem;
        color: white;
        transition: all var(--pv-transition, 200ms ease);
      }

      .weather-main {
        display: flex;
        align-items: center;
        gap: 1rem;
      }

      .weather-main.vertical {
        flex-direction: column;
        text-align: center;
      }

      .weather-icon {
        flex-shrink: 0;
        line-height: 1;
      }

      .weather-info {
        flex: 1;
        min-width: 0;
      }

      .weather-temp {
        font-size: 2.75rem;
        font-weight: 300;
        line-height: 1;
        letter-spacing: -0.02em;
      }

      .weather-temp .unit {
        font-size: 0.4em;
        font-weight: 400;
        opacity: 0.7;
        vertical-align: super;
      }

      .weather-condition {
        font-size: 1rem;
        font-weight: 400;
        opacity: 0.85;
        text-transform: capitalize;
        margin-top: 0.25rem;
      }

      .weather-details {
        display: flex;
        gap: 1.5rem;
        margin-top: 1rem;
        padding-top: 1rem;
        border-top: 1px solid rgba(255, 255, 255, 0.2);
        font-size: 0.875rem;
        opacity: 0.85;
      }

      .weather-detail {
        display: flex;
        align-items: center;
        gap: 0.375rem;
      }

      .weather-detail ha-icon {
        --mdc-icon-size: 18px;
        opacity: 0.8;
      }

      .forecast {
        display: flex;
        gap: 0.75rem;
        margin-top: 1rem;
        padding-top: 1rem;
        border-top: 1px solid rgba(255, 255, 255, 0.2);
        overflow-x: auto;
        scrollbar-width: none;
      }

      .forecast::-webkit-scrollbar { display: none; }

      .forecast-day {
        text-align: center;
        min-width: 56px;
        flex-shrink: 0;
      }

      .forecast-day-name {
        font-size: 0.75rem;
        opacity: 0.7;
        font-weight: 500;
        text-transform: uppercase;
        letter-spacing: 0.04em;
      }

      .forecast-icon {
        margin: 0.375rem 0;
        display: flex;
        justify-content: center;
      }

      .forecast-temps {
        font-size: 0.8125rem;
      }

      .forecast-high {
        font-weight: 600;
      }

      .forecast-low {
        opacity: 0.6;
        font-weight: 400;
      }

      .no-weather {
        text-align: center;
        padding: 1rem;
        color: var(--pv-text-secondary);
      }

      .no-weather ha-icon {
        --mdc-icon-size: 48px;
        opacity: 0.3;
      }

      .no-weather p {
        margin-top: 0.5rem;
        font-size: 0.875rem;
      }
    `],e([ve({attribute:!1})],ut.prototype,"hass",void 0),e([ge()],ut.prototype,"_config",void 0),ut=e([de("planavista-weather-card")],ut);let mt=class extends le{constructor(){super(...arguments),this._pv=new je(this)}setConfig(e){this._config={entity:"sensor.planavista_config",layout:"horizontal",show_names:!0,show_add_button:!0,...e}}updated(e){if(super.updated(e),e.has("hass")||e.has("_config")){const e=ze(this.hass,this._config?.entity);Ne(this,Re(this._config?.theme,e?.display?.theme))}}_getCalendars(){if(!this.hass)return[];const e=ze(this.hass,this._config?.entity);return e?.calendars||[]}_isHidden(e){return this._pv.state.hiddenCalendars.has(e)}_toggleCalendar(e){this._pv.state.toggleCalendar(e)}_openCreateDialog(){this._pv.state.openCreateDialog()}_setView(e){this._pv.state.setView(e)}render(){if(!this._config||!this.hass)return W;const e=this._getCalendars(),t=this._config.layout||"horizontal",i=!1!==this._config.show_names,a=!1!==this._config.show_add_button,r=this._pv.state.currentView;return R`
      <ha-card>
        <div class="toggles-container ${"vertical"===t?"vertical":""}">
          ${e.map(e=>this._renderToggle(e,i))}
          ${a&&e.length>0?R`<div class="divider"></div>`:W}
          ${a?R`
            <button class="new-event-btn" @click=${this._openCreateDialog}>
              <ha-icon icon="mdi:plus"></ha-icon>
              New Event
            </button>
          `:W}
        </div>

        <div class="view-switcher">
          ${["day","week","month"].map(e=>R`
            <button
              class="view-btn ${r===e?"active":""}"
              @click=${()=>this._setView(e)}
            >${e}</button>
          `)}
        </div>
      </ha-card>
    `}_renderToggle(e,t){const i=this._isHidden(e.entity_id),a=e.person_entity?Me(this.hass,e.person_entity):null,r=t?e.person_entity?Te(this.hass,e.person_entity):e.display_name:"",n=r?r[0].toUpperCase():"?";return R`
      <button
        class="toggle-btn ${i?"inactive":"active"}"
        style="${i?"":`background: ${e.color}; --cal-color: ${e.color};`}"
        @click=${()=>this._toggleCalendar(e.entity_id)}
      >
        ${a?R`<img class="avatar" src="${a}" alt="${r}" />`:t?R`<span class="avatar-placeholder">${n}</span>`:R`<span class="color-dot" style="background: ${e.color}"></span>`}
        ${t?R`<span>${r}</span>`:W}
      </button>
    `}getCardSize(){return 2}static getStubConfig(){return{entity:"sensor.planavista_config",show_names:!0,show_add_button:!0}}};mt.styles=[me,ye,o`
      :host { display: block; }

      ha-card {
        padding: 1rem 1.25rem;
      }

      .toggles-container {
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem;
      }

      .toggles-container.vertical {
        flex-direction: column;
      }

      .toggle-btn {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.5rem 0.875rem;
        border: 2px solid transparent;
        border-radius: 9999px;
        cursor: pointer;
        transition: all var(--pv-transition, 200ms ease);
        min-height: 48px;
        font-family: inherit;
        font-size: 0.8125rem;
        font-weight: 500;
        -webkit-tap-highlight-color: transparent;
        user-select: none;
        background: transparent;
      }

      .toggle-btn.active {
        color: white;
        box-shadow: 0 2px 8px color-mix(in srgb, var(--cal-color) 30%, transparent);
      }

      .toggle-btn.inactive {
        background: var(--pv-event-hover, rgba(0, 0, 0, 0.03));
        color: var(--pv-text-muted, #9CA3AF);
        border-color: var(--pv-border-subtle);
      }

      .toggle-btn:hover {
        transform: translateY(-1px);
      }

      .toggle-btn:active {
        transform: translateY(0) scale(0.98);
      }

      .avatar {
        width: 28px;
        height: 28px;
        border-radius: 50%;
        object-fit: cover;
        flex-shrink: 0;
      }

      .avatar-placeholder {
        width: 28px;
        height: 28px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 0.75rem;
        font-weight: 600;
        flex-shrink: 0;
      }

      .toggle-btn.active .avatar-placeholder {
        background: rgba(255, 255, 255, 0.25);
        color: white;
      }

      .toggle-btn.inactive .avatar-placeholder {
        background: var(--pv-border);
        color: var(--pv-text-muted);
      }

      .color-dot {
        width: 10px;
        height: 10px;
        border-radius: 50%;
        flex-shrink: 0;
      }

      .divider {
        width: 1px;
        height: 32px;
        background: var(--pv-border);
        margin: 0 0.25rem;
        flex-shrink: 0;
      }

      .new-event-btn {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.5rem 1rem;
        border: none;
        border-radius: 9999px;
        background: var(--pv-accent);
        color: var(--pv-accent-text);
        font-family: inherit;
        font-size: 0.8125rem;
        font-weight: 600;
        cursor: pointer;
        transition: all var(--pv-transition, 200ms ease);
        min-height: 48px;
        -webkit-tap-highlight-color: transparent;
        box-shadow: 0 2px 8px color-mix(in srgb, var(--pv-accent) 25%, transparent);
      }

      .new-event-btn:hover {
        transform: translateY(-1px);
        box-shadow: 0 4px 12px color-mix(in srgb, var(--pv-accent) 35%, transparent);
      }

      .new-event-btn:active {
        transform: translateY(0) scale(0.98);
      }

      .new-event-btn ha-icon {
        --mdc-icon-size: 18px;
      }

      .view-switcher {
        display: flex;
        gap: 2px;
        background: var(--pv-border-subtle);
        border-radius: var(--pv-radius-sm, 8px);
        padding: 3px;
        margin-top: 0.75rem;
      }

      .view-btn {
        flex: 1;
        padding: 0.375rem 0.75rem;
        border: none;
        border-radius: 6px;
        background: transparent;
        color: var(--pv-text-secondary);
        font-family: inherit;
        font-size: 0.75rem;
        font-weight: 500;
        cursor: pointer;
        transition: all var(--pv-transition, 200ms ease);
        text-transform: capitalize;
        min-height: 36px;
      }

      .view-btn.active {
        background: var(--pv-card-bg);
        color: var(--pv-text);
        box-shadow: var(--pv-shadow);
      }

      .view-btn:hover:not(.active) {
        color: var(--pv-text);
      }
    `],e([ve({attribute:!1})],mt.prototype,"hass",void 0),e([ge()],mt.prototype,"_config",void 0),mt=e([de("planavista-toggles-card")],mt),window.customCards=window.customCards||[],window.customCards.push({type:"planavista-calendar-card",name:"PlanaVista (Unified)",description:"All-in-one calendar with clock, weather, toggles, and views",preview:!0},{type:"planavista-grid-card",name:"PlanaVista Grid",description:"Calendar grid with day, week, and month views",preview:!0},{type:"planavista-agenda-card",name:"PlanaVista Agenda",description:"Upcoming events list",preview:!0},{type:"planavista-clock-card",name:"PlanaVista Clock",description:"Time and date display",preview:!0},{type:"planavista-weather-card",name:"PlanaVista Weather",description:"Weather conditions and forecast",preview:!0},{type:"planavista-toggles-card",name:"PlanaVista Toggles",description:"Calendar visibility toggles",preview:!0}),console.info("%c PLANAVISTA %c v1.0.0 ","color: white; background: #6366F1; font-weight: bold; border-radius: 4px 0 0 4px; padding: 2px 6px;","color: #6366F1; background: #EEF2FF; font-weight: bold; border-radius: 0 4px 4px 0; padding: 2px 6px;");
