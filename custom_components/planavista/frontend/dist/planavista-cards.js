function t(t,e,i,s){var a,r=arguments.length,n=r<3?e:null===s?s=Object.getOwnPropertyDescriptor(e,i):s;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)n=Reflect.decorate(t,e,i,s);else for(var o=t.length-1;o>=0;o--)(a=t[o])&&(n=(r<3?a(n):r>3?a(e,i,n):a(e,i))||n);return r>3&&n&&Object.defineProperty(e,i,n),n}"function"==typeof SuppressedError&&SuppressedError;const e=globalThis,i=e.ShadowRoot&&(void 0===e.ShadyCSS||e.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,s=Symbol(),a=new WeakMap;let r=class{constructor(t,e,i){if(this._$cssResult$=!0,i!==s)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=t,this.t=e}get styleSheet(){let t=this.o;const e=this.t;if(i&&void 0===t){const i=void 0!==e&&1===e.length;i&&(t=a.get(e)),void 0===t&&((this.o=t=new CSSStyleSheet).replaceSync(this.cssText),i&&a.set(e,t))}return t}toString(){return this.cssText}};const n=(t,...e)=>{const i=1===t.length?t[0]:e.reduce((e,i,s)=>e+(t=>{if(!0===t._$cssResult$)return t.cssText;if("number"==typeof t)return t;throw Error("Value passed to 'css' function must be a 'css' function result: "+t+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(i)+t[s+1],t[0]);return new r(i,t,s)},o=i?t=>t:t=>t instanceof CSSStyleSheet?(t=>{let e="";for(const i of t.cssRules)e+=i.cssText;return(t=>new r("string"==typeof t?t:t+"",void 0,s))(e)})(t):t,{is:l,defineProperty:d,getOwnPropertyDescriptor:c,getOwnPropertyNames:p,getOwnPropertySymbols:h,getPrototypeOf:u}=Object,v=globalThis,m=v.trustedTypes,g=m?m.emptyScript:"",y=v.reactiveElementPolyfillSupport,f=(t,e)=>t,_={toAttribute(t,e){switch(e){case Boolean:t=t?g:null;break;case Object:case Array:t=null==t?t:JSON.stringify(t)}return t},fromAttribute(t,e){let i=t;switch(e){case Boolean:i=null!==t;break;case Number:i=null===t?null:Number(t);break;case Object:case Array:try{i=JSON.parse(t)}catch(t){i=null}}return i}},b=(t,e)=>!l(t,e),x={attribute:!0,type:String,converter:_,reflect:!1,useDefault:!1,hasChanged:b};Symbol.metadata??=Symbol("metadata"),v.litPropertyMetadata??=new WeakMap;let w=class extends HTMLElement{static addInitializer(t){this._$Ei(),(this.l??=[]).push(t)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(t,e=x){if(e.state&&(e.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(t)&&((e=Object.create(e)).wrapped=!0),this.elementProperties.set(t,e),!e.noAccessor){const i=Symbol(),s=this.getPropertyDescriptor(t,i,e);void 0!==s&&d(this.prototype,t,s)}}static getPropertyDescriptor(t,e,i){const{get:s,set:a}=c(this.prototype,t)??{get(){return this[e]},set(t){this[e]=t}};return{get:s,set(e){const r=s?.call(this);a?.call(this,e),this.requestUpdate(t,r,i)},configurable:!0,enumerable:!0}}static getPropertyOptions(t){return this.elementProperties.get(t)??x}static _$Ei(){if(this.hasOwnProperty(f("elementProperties")))return;const t=u(this);t.finalize(),void 0!==t.l&&(this.l=[...t.l]),this.elementProperties=new Map(t.elementProperties)}static finalize(){if(this.hasOwnProperty(f("finalized")))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(f("properties"))){const t=this.properties,e=[...p(t),...h(t)];for(const i of e)this.createProperty(i,t[i])}const t=this[Symbol.metadata];if(null!==t){const e=litPropertyMetadata.get(t);if(void 0!==e)for(const[t,i]of e)this.elementProperties.set(t,i)}this._$Eh=new Map;for(const[t,e]of this.elementProperties){const i=this._$Eu(t,e);void 0!==i&&this._$Eh.set(i,t)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(t){const e=[];if(Array.isArray(t)){const i=new Set(t.flat(1/0).reverse());for(const t of i)e.unshift(o(t))}else void 0!==t&&e.push(o(t));return e}static _$Eu(t,e){const i=e.attribute;return!1===i?void 0:"string"==typeof i?i:"string"==typeof t?t.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){this._$ES=new Promise(t=>this.enableUpdating=t),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach(t=>t(this))}addController(t){(this._$EO??=new Set).add(t),void 0!==this.renderRoot&&this.isConnected&&t.hostConnected?.()}removeController(t){this._$EO?.delete(t)}_$E_(){const t=new Map,e=this.constructor.elementProperties;for(const i of e.keys())this.hasOwnProperty(i)&&(t.set(i,this[i]),delete this[i]);t.size>0&&(this._$Ep=t)}createRenderRoot(){const t=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return((t,s)=>{if(i)t.adoptedStyleSheets=s.map(t=>t instanceof CSSStyleSheet?t:t.styleSheet);else for(const i of s){const s=document.createElement("style"),a=e.litNonce;void 0!==a&&s.setAttribute("nonce",a),s.textContent=i.cssText,t.appendChild(s)}})(t,this.constructor.elementStyles),t}connectedCallback(){this.renderRoot??=this.createRenderRoot(),this.enableUpdating(!0),this._$EO?.forEach(t=>t.hostConnected?.())}enableUpdating(t){}disconnectedCallback(){this._$EO?.forEach(t=>t.hostDisconnected?.())}attributeChangedCallback(t,e,i){this._$AK(t,i)}_$ET(t,e){const i=this.constructor.elementProperties.get(t),s=this.constructor._$Eu(t,i);if(void 0!==s&&!0===i.reflect){const a=(void 0!==i.converter?.toAttribute?i.converter:_).toAttribute(e,i.type);this._$Em=t,null==a?this.removeAttribute(s):this.setAttribute(s,a),this._$Em=null}}_$AK(t,e){const i=this.constructor,s=i._$Eh.get(t);if(void 0!==s&&this._$Em!==s){const t=i.getPropertyOptions(s),a="function"==typeof t.converter?{fromAttribute:t.converter}:void 0!==t.converter?.fromAttribute?t.converter:_;this._$Em=s;const r=a.fromAttribute(e,t.type);this[s]=r??this._$Ej?.get(s)??r,this._$Em=null}}requestUpdate(t,e,i,s=!1,a){if(void 0!==t){const r=this.constructor;if(!1===s&&(a=this[t]),i??=r.getPropertyOptions(t),!((i.hasChanged??b)(a,e)||i.useDefault&&i.reflect&&a===this._$Ej?.get(t)&&!this.hasAttribute(r._$Eu(t,i))))return;this.C(t,e,i)}!1===this.isUpdatePending&&(this._$ES=this._$EP())}C(t,e,{useDefault:i,reflect:s,wrapped:a},r){i&&!(this._$Ej??=new Map).has(t)&&(this._$Ej.set(t,r??e??this[t]),!0!==a||void 0!==r)||(this._$AL.has(t)||(this.hasUpdated||i||(e=void 0),this._$AL.set(t,e)),!0===s&&this._$Em!==t&&(this._$Eq??=new Set).add(t))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(t){Promise.reject(t)}const t=this.scheduleUpdate();return null!=t&&await t,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??=this.createRenderRoot(),this._$Ep){for(const[t,e]of this._$Ep)this[t]=e;this._$Ep=void 0}const t=this.constructor.elementProperties;if(t.size>0)for(const[e,i]of t){const{wrapped:t}=i,s=this[e];!0!==t||this._$AL.has(e)||void 0===s||this.C(e,void 0,i,s)}}let t=!1;const e=this._$AL;try{t=this.shouldUpdate(e),t?(this.willUpdate(e),this._$EO?.forEach(t=>t.hostUpdate?.()),this.update(e)):this._$EM()}catch(e){throw t=!1,this._$EM(),e}t&&this._$AE(e)}willUpdate(t){}_$AE(t){this._$EO?.forEach(t=>t.hostUpdated?.()),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(t)),this.updated(t)}_$EM(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(t){return!0}update(t){this._$Eq&&=this._$Eq.forEach(t=>this._$ET(t,this[t])),this._$EM()}updated(t){}firstUpdated(t){}};w.elementStyles=[],w.shadowRootOptions={mode:"open"},w[f("elementProperties")]=new Map,w[f("finalized")]=new Map,y?.({ReactiveElement:w}),(v.reactiveElementVersions??=[]).push("2.1.2");const k=globalThis,$=t=>t,E=k.trustedTypes,F=E?E.createPolicy("lit-html",{createHTML:t=>t}):void 0,C="$lit$",D=`lit$${Math.random().toFixed(9).slice(2)}$`,S="?"+D,A=`<${S}>`,z=document,M=()=>z.createComment(""),P=t=>null===t||"object"!=typeof t&&"function"!=typeof t,T=Array.isArray,B="[ \t\n\f\r]",O=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,I=/-->/g,L=/>/g,R=RegExp(`>|${B}(?:([^\\s"'>=/]+)(${B}*=${B}*(?:[^ \t\n\f\r"'\`<>=]|("|')|))|$)`,"g"),H=/'/g,N=/"/g,j=/^(?:script|style|textarea|title)$/i,U=t=>(e,...i)=>({_$litType$:t,strings:e,values:i}),V=U(1),q=U(2),Y=Symbol.for("lit-noChange"),W=Symbol.for("lit-nothing"),K=new WeakMap,G=z.createTreeWalker(z,129);function X(t,e){if(!T(t)||!t.hasOwnProperty("raw"))throw Error("invalid template strings array");return void 0!==F?F.createHTML(e):e}const Q=(t,e)=>{const i=t.length-1,s=[];let a,r=2===e?"<svg>":3===e?"<math>":"",n=O;for(let e=0;e<i;e++){const i=t[e];let o,l,d=-1,c=0;for(;c<i.length&&(n.lastIndex=c,l=n.exec(i),null!==l);)c=n.lastIndex,n===O?"!--"===l[1]?n=I:void 0!==l[1]?n=L:void 0!==l[2]?(j.test(l[2])&&(a=RegExp("</"+l[2],"g")),n=R):void 0!==l[3]&&(n=R):n===R?">"===l[0]?(n=a??O,d=-1):void 0===l[1]?d=-2:(d=n.lastIndex-l[2].length,o=l[1],n=void 0===l[3]?R:'"'===l[3]?N:H):n===N||n===H?n=R:n===I||n===L?n=O:(n=R,a=void 0);const p=n===R&&t[e+1].startsWith("/>")?" ":"";r+=n===O?i+A:d>=0?(s.push(o),i.slice(0,d)+C+i.slice(d)+D+p):i+D+(-2===d?e:p)}return[X(t,r+(t[i]||"<?>")+(2===e?"</svg>":3===e?"</math>":"")),s]};class Z{constructor({strings:t,_$litType$:e},i){let s;this.parts=[];let a=0,r=0;const n=t.length-1,o=this.parts,[l,d]=Q(t,e);if(this.el=Z.createElement(l,i),G.currentNode=this.el.content,2===e||3===e){const t=this.el.content.firstChild;t.replaceWith(...t.childNodes)}for(;null!==(s=G.nextNode())&&o.length<n;){if(1===s.nodeType){if(s.hasAttributes())for(const t of s.getAttributeNames())if(t.endsWith(C)){const e=d[r++],i=s.getAttribute(t).split(D),n=/([.?@])?(.*)/.exec(e);o.push({type:1,index:a,name:n[2],strings:i,ctor:"."===n[1]?st:"?"===n[1]?at:"@"===n[1]?rt:it}),s.removeAttribute(t)}else t.startsWith(D)&&(o.push({type:6,index:a}),s.removeAttribute(t));if(j.test(s.tagName)){const t=s.textContent.split(D),e=t.length-1;if(e>0){s.textContent=E?E.emptyScript:"";for(let i=0;i<e;i++)s.append(t[i],M()),G.nextNode(),o.push({type:2,index:++a});s.append(t[e],M())}}}else if(8===s.nodeType)if(s.data===S)o.push({type:2,index:a});else{let t=-1;for(;-1!==(t=s.data.indexOf(D,t+1));)o.push({type:7,index:a}),t+=D.length-1}a++}}static createElement(t,e){const i=z.createElement("template");return i.innerHTML=t,i}}function J(t,e,i=t,s){if(e===Y)return e;let a=void 0!==s?i._$Co?.[s]:i._$Cl;const r=P(e)?void 0:e._$litDirective$;return a?.constructor!==r&&(a?._$AO?.(!1),void 0===r?a=void 0:(a=new r(t),a._$AT(t,i,s)),void 0!==s?(i._$Co??=[])[s]=a:i._$Cl=a),void 0!==a&&(e=J(t,a._$AS(t,e.values),a,s)),e}class tt{constructor(t,e){this._$AV=[],this._$AN=void 0,this._$AD=t,this._$AM=e}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(t){const{el:{content:e},parts:i}=this._$AD,s=(t?.creationScope??z).importNode(e,!0);G.currentNode=s;let a=G.nextNode(),r=0,n=0,o=i[0];for(;void 0!==o;){if(r===o.index){let e;2===o.type?e=new et(a,a.nextSibling,this,t):1===o.type?e=new o.ctor(a,o.name,o.strings,this,t):6===o.type&&(e=new nt(a,this,t)),this._$AV.push(e),o=i[++n]}r!==o?.index&&(a=G.nextNode(),r++)}return G.currentNode=z,s}p(t){let e=0;for(const i of this._$AV)void 0!==i&&(void 0!==i.strings?(i._$AI(t,i,e),e+=i.strings.length-2):i._$AI(t[e])),e++}}class et{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(t,e,i,s){this.type=2,this._$AH=W,this._$AN=void 0,this._$AA=t,this._$AB=e,this._$AM=i,this.options=s,this._$Cv=s?.isConnected??!0}get parentNode(){let t=this._$AA.parentNode;const e=this._$AM;return void 0!==e&&11===t?.nodeType&&(t=e.parentNode),t}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(t,e=this){t=J(this,t,e),P(t)?t===W||null==t||""===t?(this._$AH!==W&&this._$AR(),this._$AH=W):t!==this._$AH&&t!==Y&&this._(t):void 0!==t._$litType$?this.$(t):void 0!==t.nodeType?this.T(t):(t=>T(t)||"function"==typeof t?.[Symbol.iterator])(t)?this.k(t):this._(t)}O(t){return this._$AA.parentNode.insertBefore(t,this._$AB)}T(t){this._$AH!==t&&(this._$AR(),this._$AH=this.O(t))}_(t){this._$AH!==W&&P(this._$AH)?this._$AA.nextSibling.data=t:this.T(z.createTextNode(t)),this._$AH=t}$(t){const{values:e,_$litType$:i}=t,s="number"==typeof i?this._$AC(t):(void 0===i.el&&(i.el=Z.createElement(X(i.h,i.h[0]),this.options)),i);if(this._$AH?._$AD===s)this._$AH.p(e);else{const t=new tt(s,this),i=t.u(this.options);t.p(e),this.T(i),this._$AH=t}}_$AC(t){let e=K.get(t.strings);return void 0===e&&K.set(t.strings,e=new Z(t)),e}k(t){T(this._$AH)||(this._$AH=[],this._$AR());const e=this._$AH;let i,s=0;for(const a of t)s===e.length?e.push(i=new et(this.O(M()),this.O(M()),this,this.options)):i=e[s],i._$AI(a),s++;s<e.length&&(this._$AR(i&&i._$AB.nextSibling,s),e.length=s)}_$AR(t=this._$AA.nextSibling,e){for(this._$AP?.(!1,!0,e);t!==this._$AB;){const e=$(t).nextSibling;$(t).remove(),t=e}}setConnected(t){void 0===this._$AM&&(this._$Cv=t,this._$AP?.(t))}}class it{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(t,e,i,s,a){this.type=1,this._$AH=W,this._$AN=void 0,this.element=t,this.name=e,this._$AM=s,this.options=a,i.length>2||""!==i[0]||""!==i[1]?(this._$AH=Array(i.length-1).fill(new String),this.strings=i):this._$AH=W}_$AI(t,e=this,i,s){const a=this.strings;let r=!1;if(void 0===a)t=J(this,t,e,0),r=!P(t)||t!==this._$AH&&t!==Y,r&&(this._$AH=t);else{const s=t;let n,o;for(t=a[0],n=0;n<a.length-1;n++)o=J(this,s[i+n],e,n),o===Y&&(o=this._$AH[n]),r||=!P(o)||o!==this._$AH[n],o===W?t=W:t!==W&&(t+=(o??"")+a[n+1]),this._$AH[n]=o}r&&!s&&this.j(t)}j(t){t===W?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,t??"")}}class st extends it{constructor(){super(...arguments),this.type=3}j(t){this.element[this.name]=t===W?void 0:t}}class at extends it{constructor(){super(...arguments),this.type=4}j(t){this.element.toggleAttribute(this.name,!!t&&t!==W)}}class rt extends it{constructor(t,e,i,s,a){super(t,e,i,s,a),this.type=5}_$AI(t,e=this){if((t=J(this,t,e,0)??W)===Y)return;const i=this._$AH,s=t===W&&i!==W||t.capture!==i.capture||t.once!==i.once||t.passive!==i.passive,a=t!==W&&(i===W||s);s&&this.element.removeEventListener(this.name,this,i),a&&this.element.addEventListener(this.name,this,t),this._$AH=t}handleEvent(t){"function"==typeof this._$AH?this._$AH.call(this.options?.host??this.element,t):this._$AH.handleEvent(t)}}class nt{constructor(t,e,i){this.element=t,this.type=6,this._$AN=void 0,this._$AM=e,this.options=i}get _$AU(){return this._$AM._$AU}_$AI(t){J(this,t)}}const ot=k.litHtmlPolyfillSupport;ot?.(Z,et),(k.litHtmlVersions??=[]).push("3.3.2");const lt=globalThis;let dt=class extends w{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){const t=super.createRenderRoot();return this.renderOptions.renderBefore??=t.firstChild,t}update(t){const e=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(t),this._$Do=((t,e,i)=>{const s=i?.renderBefore??e;let a=s._$litPart$;if(void 0===a){const t=i?.renderBefore??null;s._$litPart$=a=new et(e.insertBefore(M(),t),t,void 0,i??{})}return a._$AI(t),a})(e,this.renderRoot,this.renderOptions)}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(!0)}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(!1)}render(){return Y}};dt._$litElement$=!0,dt.finalized=!0,lt.litElementHydrateSupport?.({LitElement:dt});const ct=lt.litElementPolyfillSupport;ct?.({LitElement:dt}),(lt.litElementVersions??=[]).push("4.2.2");const pt={attribute:!0,type:String,converter:_,reflect:!1,hasChanged:b},ht=(t=pt,e,i)=>{const{kind:s,metadata:a}=i;let r=globalThis.litPropertyMetadata.get(a);if(void 0===r&&globalThis.litPropertyMetadata.set(a,r=new Map),"setter"===s&&((t=Object.create(t)).wrapped=!0),r.set(i.name,t),"accessor"===s){const{name:s}=i;return{set(i){const a=e.get.call(this);e.set.call(this,i),this.requestUpdate(s,a,t,!0,i)},init(e){return void 0!==e&&this.C(s,void 0,t,e),e}}}if("setter"===s){const{name:s}=i;return function(i){const a=this[s];e.call(this,i),this.requestUpdate(s,a,t,!0,i)}}throw Error("Unsupported decorator location: "+s)};function ut(t){return(e,i)=>"object"==typeof i?ht(t,e,i):((t,e,i)=>{const s=e.hasOwnProperty(i);return e.constructor.createProperty(i,t),s?Object.getOwnPropertyDescriptor(e,i):void 0})(t,e,i)}function vt(t){return ut({...t,state:!0,attribute:!1})}function mt(t,e){return(e,i,s)=>((t,e,i)=>(i.configurable=!0,i.enumerable=!0,Reflect.decorate&&"object"!=typeof e&&Object.defineProperty(t,e,i),i))(e,i,{get(){return(e=>e.renderRoot?.querySelector(t)??null)(this)}})}function gt(t,e){return yt(()=>ft(t,e))}function yt(t){return"undefined"==typeof document||null===document.querySelector("home-assistant")||customElements.get("home-assistant")?t():(customElements.whenDefined("home-assistant").then(t),!1)}function ft(t,e){return!customElements.get(t)&&(customElements.define(t,e),!0)}const _t=/^\d{4}-\d{2}-\d{2}$/;function bt(t){return _t.test(t)}function xt(t){if(bt(t)){const[e,i,s]=t.split("-").map(Number);return new Date(e,i-1,s)}return new Date(t)}function wt(t,e="12h"){const i=xt(t);return"24h"===e?i.toLocaleTimeString("en-US",{hour:"2-digit",minute:"2-digit",hour12:!1}):i.toLocaleTimeString("en-US",{hour:"numeric",minute:"2-digit",hour12:!0})}function kt(t,e="medium"){switch(e){case"long":return t.toLocaleDateString("en-US",{weekday:"long",year:"numeric",month:"long",day:"numeric"});case"medium":return t.toLocaleDateString("en-US",{weekday:"short",month:"short",day:"numeric"});case"short":return t.toLocaleDateString("en-US",{month:"numeric",day:"numeric"});case"weekday":return t.toLocaleDateString("en-US",{weekday:"long"})}}function $t(t){const e=new Date;return t.getFullYear()===e.getFullYear()&&t.getMonth()===e.getMonth()&&t.getDate()===e.getDate()}function Et(t,e="sunday"){const i=new Date(t),s=i.getDay(),a="monday"===e?0===s?-6:1-s:-s;return i.setDate(i.getDate()+a),i.setHours(0,0,0,0),i}function Ft(t){return`${t.getFullYear()}-${String(t.getMonth()+1).padStart(2,"0")}-${String(t.getDate()).padStart(2,"0")}`}function Ct(t,e){const i=Date.UTC(t.getFullYear(),t.getMonth(),t.getDate()),s=Date.UTC(e.getFullYear(),e.getMonth(),e.getDate());return Math.round((s-i)/864e5)}function Dt(t,e){const i=new Map(e.map(t=>[t.entity_id,t])),s=new Map;for(const e of t){const t=`${e.summary}|${e.start}|${e.end}`;if(s.has(t)){const a=s.get(t),r=i.get(e.calendar_entity_id);r&&a.shared_calendars.push({entity_id:r.entity_id,color:r.color,color_light:r.color_light,person_entity:r.person_entity,display_name:r.display_name})}else{const a=i.get(e.calendar_entity_id);s.set(t,{...e,shared_calendars:a?[{entity_id:a.entity_id,color:a.color,color_light:a.color_light,person_entity:a.person_entity,display_name:a.display_name}]:[]})}}return Array.from(s.values())}function St(t){return xt(t.end)<new Date}function At(t){if(bt(t.start))return!0;const e=xt(t.start),i=xt(t.end);return 0===e.getHours()&&0===e.getMinutes()&&0===i.getHours()&&0===i.getMinutes()&&Ft(e)!==Ft(i)}function zt(t,e){return new Date(Math.max(xt(t.end).getTime()-1,e.getTime()))}function Mt(t,e){const i=At(t);return i!==At(e)?i?-1:1:xt(t.start).getTime()-xt(e.start).getTime()}function Pt(t){const e=new Map;for(const i of t){const t=xt(i.start),s=Ft(zt(i,t)),a=new Date(t.getFullYear(),t.getMonth(),t.getDate());for(let t=0;t<1e3;t++){const t=Ft(a);if(e.has(t)||e.set(t,[]),e.get(t).push(i),t===s)break;a.setDate(a.getDate()+1)}}for(const[,t]of e)t.sort(Mt);return e}function Tt(t,e,i){return t.filter(t=>{const s=xt(t.start),a=xt(t.end);return s<i&&a>e})}function Bt(t,e){return t.filter(t=>!e.has(t.calendar_entity_id))}const Ot="#FFFFFF",It="#1A1B1E";function Lt(t){const e=/^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(t.trim());if(!e)return null;const i=3===e[1].length?e[1].split("").map(t=>t+t).join(""):e[1];return[0,2,4].map(t=>parseInt(i.slice(t,t+2),16))}function Rt(t,e,i){const s=t=>Math.round(Math.min(255,Math.max(0,t))).toString(16).padStart(2,"0");return`#${s(t)}${s(e)}${s(i)}`.toUpperCase()}function Ht(t){const e=t/255;return e<=.04045?e/12.92:((e+.055)/1.055)**2.4}function Nt(t){const e=Lt(t);if(!e)return 0;const[i,s,a]=e.map(Ht);return.2126*i+.7152*s+.0722*a}function jt(t,e){const i=Nt(t),s=Nt(e);return(Math.max(i,s)+.05)/(Math.min(i,s)+.05)}function Ut(t){return jt(t,Ot)>=jt(t,It)?Ot:It}function Vt(t){const[e,i,s]=(Lt(t)??[0,0,0]).map(Ht),a=Math.cbrt(.4122214708*e+.5363325363*i+.0514459929*s),r=Math.cbrt(.2119034982*e+.6806995451*i+.1073969566*s),n=Math.cbrt(.0883024619*e+.2817188376*i+.6299787005*s),o=.2104542553*a+.793617785*r-.0040720468*n,l=1.9779984951*a-2.428592205*r+.4505937099*n,d=.0259040371*a+.7827717662*r-.808675766*n,c=Math.hypot(l,d);return{l:o,c:c,h:c<1e-6?0:(180*Math.atan2(d,l)/Math.PI+360)%360}}function qt({l:t,c:e,h:i}){const s=e*Math.cos(i*Math.PI/180),a=e*Math.sin(i*Math.PI/180),r=(t+.3963377774*s+.2158037573*a)**3,n=(t-.1055613458*s-.0638541728*a)**3,o=(t-.0894841775*s-1.291485548*a)**3;return[4.0767416621*r-3.3077115913*n+.2309699292*o,-1.2684380046*r+2.6097574011*n-.3413193965*o,-.0041960863*r-.7034186147*n+1.707614701*o]}function Yt(t){return t.every(t=>t>=-1e-4&&t<=1.0001)}function Wt(t){const e=Math.min(1,Math.max(0,t.l));let i=Math.max(0,t.c);if(!Yt(qt({l:e,c:i,h:t.h}))){let s=0,a=i;for(let i=0;i<24;i++){const i=(s+a)/2;Yt(qt({l:e,c:i,h:t.h}))?s=i:a=i}i=s}const[s,a,r]=qt({l:e,c:i,h:t.h}).map(t=>function(t){return 255*(t<=.0031308?12.92*t:1.055*t**(1/2.4)-.055)}(Math.min(1,Math.max(0,t))));return Rt(s,a,r)}function Kt(t){const{l:e,c:i,h:s}=Vt(t);return Wt({l:Math.min(.9,Math.max(e+.07,.69)),c:i,h:s})}function Gt(t){const{c:e,h:i}=Vt(t);return Wt({l:.255,c:Math.min(e,.037),h:i})}function Xt(t,e){const i=Vt(t);return Wt({...i,l:i.l+e})}function Qt(t,e,i,s){const a=Lt(t);if(!a)return null;if(jt(t,e)>=i)return Rt(...a);const r=Vt(t),n=s?"lighter"===s?1:0:Vt(e).l<.5?1:0,o=t=>Wt({...r,l:r.l+(n-r.l)*t});if(jt(o(1),e)<i)return null;let l=0,d=1;for(let t=0;t<24;t++){const t=(l+d)/2;jt(o(t),e)>=i?d=t:l=t}return o(d)}async function Zt(t,e){const i={summary:e.summary};e.start_date_time&&(i.start_date_time=e.start_date_time),e.end_date_time&&(i.end_date_time=e.end_date_time),e.start_date&&(i.start_date=e.start_date),e.end_date&&(i.end_date=e.end_date),e.description&&(i.description=e.description),e.location&&(i.location=e.location),await t.callService("calendar","create_event",i,{entity_id:e.entity_id})}async function Jt(t,e){const i={entity_id:e.entity_id,summary:e.summary};e.start_date_time&&(i.start_date_time=e.start_date_time),e.end_date_time&&(i.end_date_time=e.end_date_time),e.start_date&&(i.start_date=e.start_date),e.end_date&&(i.end_date=e.end_date),e.description&&(i.description=e.description),e.location&&(i.location=e.location),e.attendee_entity_ids?.length&&(i.attendee_entity_ids=e.attendee_entity_ids),await t.callService("planavista","create_event_with_attendees",i)}async function te(t,e){const i={entity_id:e.entity_id,uid:e.uid};e.recurrence_id&&(i.recurrence_id=e.recurrence_id),await t.callService("planavista","delete_event",i)}async function ee(t,e="sensor.planavista_config"){await t.callService("homeassistant","update_entity",{entity_id:e})}async function ie(t,e,i){try{const s=await t.callWS({type:"planavista/get_event_organizer",entity_id:e,uid:i});return s?.organizer_entity_id??null}catch{return null}}function se(t,e){if(!e)return null;const i=t.states[e];return i?.attributes?.entity_picture||null}function ae(t,e){if(!e)return"";const i=t.states[e];return i?.attributes?.friendly_name||e.replace("person.","")}const re=n`
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
`,ne=n`
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
`,oe=n`
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
`,le=n`
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
`,de=n`
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
`,ce=n`
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
`,pe=n`
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
`,he=n`
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
`;n`
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
`;class ue extends dt{constructor(){super(...arguments),this.calendars=[],this.timeFormat="12h",this.compact=!1,this.showStripes=!0,this.tick=0}render(){const t=this.event;if(!t)return W;const e=t.shared_calendars||[],i=e.length>1,s=function(t,e){if(t.organizer){const e=t.shared_calendars.find(e=>e.display_name?.toLowerCase()===t.organizer?.toLowerCase()||e.entity_id===t.organizer);if(e)return e}for(const i of e){const e=t.shared_calendars.find(t=>t.entity_id===i.entity_id);if(e)return e}return t.shared_calendars[0]}(t,this.calendars),a=s?.color||t.calendar_color||"var(--pv-accent)";let r;r=this.showStripes&&i?`background: ${function(t){const e=t.length;if(e<=1)return"";const i=2===e?60:Math.min(50,Math.round(100/e*1.5)),s=(100-i)/(e-1),a=[];let r=0;return t.forEach((t,e)=>{const n=t.color_light||t.color,o=0===e?i:s;a.push(`${n} ${r}%`),r+=o,a.push(`${n} ${r}%`)}),`linear-gradient(135deg, ${a.join(", ")})`}(e)}`:this.showStripes?`background: ${e[0]?.color_light||t.calendar_color_light||t.calendar_color}`:"background: var(--pv-card-bg, #FFFFFF)";const n=this.showStripes?e[0]?.color_light||t.calendar_color_light||t.calendar_color:"#FFFFFF",o=this.showStripes?Ut(n):"var(--pv-text)",l=St(t)?" past":"",d=(this.compact?"chip chip--compact":"chip")+l,c=At(t);return V`
      <div
        class="${d}"
        style="${r}; --chip-border-color: ${a}; --chip-text: ${o}"
        @click=${this._onClick}
      >
        <div class="chip-body">
          <div class="${"chip-title chip-title--nowrap"}">${t.summary}</div>
          ${this.compact?W:V`
            <div class="chip-time">
              ${c?"All day":`${wt(t.start,this.timeFormat)} – ${wt(t.end,this.timeFormat)}`}
            </div>
          `}
        </div>
        ${!this.compact&&e.length>0?this._renderAvatars(e):W}
      </div>
    `}_renderAvatars(t){const e=t.slice(0,4),i=t.length-4;return V`
      <div class="chip-avatars">
        ${e.map(t=>{const e=t.person_entity?se(this.hass,t.person_entity):null,i=t.person_entity?ae(this.hass,t.person_entity):t.display_name||"?";return e?V`<img class="chip-avatar" src="${e}" alt="${i}" />`:V`<div class="chip-initial" style="background: ${t.color}; color: ${Ut(t.color)}">${i[0]?.toUpperCase()||"?"}</div>`})}
        ${i>0?V`<div class="chip-overflow">+${i}</div>`:W}
      </div>
    `}_onClick(){this.dispatchEvent(new CustomEvent("event-click",{detail:{event:this.event},bubbles:!0,composed:!0}))}}function ve(t){let e,i=null;return(...s)=>(i&&i.length===s.length&&s.every((t,e)=>t===i[e])||(e=t(...s),i=s),e)}ue.styles=[re,n`
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
    `],t([ut({attribute:!1})],ue.prototype,"hass",void 0),t([ut({attribute:!1})],ue.prototype,"event",void 0),t([ut({attribute:!1})],ue.prototype,"calendars",void 0),t([ut({attribute:!1})],ue.prototype,"timeFormat",void 0),t([ut({type:Boolean})],ue.prototype,"compact",void 0),t([ut({type:Boolean})],ue.prototype,"showStripes",void 0),t([ut({type:Number})],ue.prototype,"tick",void 0),gt("pv-event-chip",ue);const me=/^\d{2}:\d{2}$/;function ge(t){return String(t).padStart(2,"0")}function ye(t){return`${ge(t.getHours())}:${ge(t.getMinutes())}`}function fe(t){const e=-t.getTimezoneOffset(),i=e>=0?"+":"-",s=Math.abs(e);return`${Ft(t)}T${ge(t.getHours())}:${ge(t.getMinutes())}:${ge(t.getSeconds())}${i}${ge(Math.floor(s/60))}:${ge(s%60)}`}function _e(t,e){const[i,s,a]=t.split("-").map(Number);return Ft(new Date(i,s-1,a+e))}function be(t,e){const[i,s,a]=t.split("-").map(Number),[r,n]=e.split(":").map(Number);return new Date(i,s-1,a,r,n,0,0)}function xe(t){return t.allDay?{start_date:t.date,end_date:_e(t.date,Math.max(1,Math.round(t.spanDays)))}:{start_date_time:fe(be(t.date,t.startTime)),end_date_time:fe(be(_e(t.date,t.endDayOffset),t.endTime))}}function we(t,e=t.calendar_entity_id){if(!t.uid)throw new Error("This event has no unique ID, so it can only be changed in its calendar app.");const i={entity_id:e,uid:t.uid};return t.recurrence_id&&(i.recurrence_id=t.recurrence_id),i}function ke(t,e=t.calendar_entity_id){const i=bt(t.start)?{entity_id:e,summary:t.summary,start_date:t.start,end_date:t.end}:{entity_id:e,summary:t.summary,start_date_time:t.start,end_date_time:t.end};return t.description&&(i.description=t.description),t.location&&(i.location=t.location),i}function $e(t,e,i){return{deleteData:we(t,e),createData:{...i,entity_id:e},restoreData:ke(t,e)}}class Ee extends Error{constructor(t,e){super(t),this.restored=e,this.name="EditRestoreError"}}function Fe(t){return t instanceof Error?t.message:String(t&&"object"==typeof t&&"message"in t?t.message:t)}async function Ce(t){await t.remove();try{await t.create()}catch(e){const i=Fe(e);try{await t.restore()}catch(t){throw new Ee(`Your changes couldn't be saved (${i}), and the original event couldn't be put back (${Fe(t)}). Please re-create it in your calendar app.`,!1)}throw new Ee(`Your changes couldn't be saved (${i}). The original event was restored.`,!0)}}class De{constructor(){this.hiddenCalendars=new Set,this.currentView="day",this.currentDate=new Date,this.selectedEvent=null,this.dialogOpen=null,this.createPrefill=null,this.isLoading=!1,this._hosts=new Set,this._autoAdvanceTimer=null,this._todayKey=Ft(new Date),this._onVisibilityChange=()=>{"visible"===document.visibilityState&&this.checkRollover()}}subscribe(t){this._hosts.add(t)}unsubscribe(t){this._hosts.delete(t)}_notify(){for(const t of this._hosts)t.requestUpdate()}toggleCalendar(t){const e=new Set(this.hiddenCalendars);e.has(t)?e.delete(t):e.add(t),this.hiddenCalendars=e,this._notify()}setView(t){this.currentView!==t&&(this.currentView=t,this._notify())}navigateDate(t){this.currentDate="today"===t?new Date:function(t,e,i){const s=new Date(t),a="next"===i?1:-1;switch(e){case"day":s.setDate(s.getDate()+a);break;case"week":case"agenda":s.setDate(s.getDate()+7*a);break;case"month":s.setMonth(s.getMonth()+a)}return s}(this.currentDate,this.currentView,t),this._notify()}setDate(t){this.currentDate=new Date(t),this._notify()}selectEvent(t){this.selectedEvent=t,this._notify()}openCreateDialog(t){this.dialogOpen="create",this.createPrefill=t||null,this._notify()}openEditDialog(t,e){this.dialogOpen="edit",this.selectedEvent=t;const i={...t};e?.removeGuests&&(i._removeGuestsHint=!0),this.createPrefill=i,this._notify()}closeDialog(){this.dialogOpen=null,this.createPrefill=null,this._notify()}async doCreateEvent(t,e){this.isLoading=!0,this._notify();try{await Zt(t,e),await ee(t),this.closeDialog()}catch(t){throw console.error("PlanaVista: Failed to create event",t),t}finally{this.isLoading=!1,this._notify()}}async doDeleteEvent(t,e){this.isLoading=!0,this._notify();try{await te(t,e),await ee(t),this.selectedEvent=null,this.closeDialog()}catch(t){throw console.error("PlanaVista: Failed to delete event",t),t}finally{this.isLoading=!1,this._notify()}}async doEditEvent(t,e,i,s){this.isLoading=!0,this._notify();try{await Ce({remove:()=>te(t,e),create:()=>Zt(t,i),restore:()=>Zt(t,s)}),await ee(t),this.selectedEvent=null,this.closeDialog()}catch(e){throw console.error("PlanaVista: Failed to edit event",e),await ee(t).catch(()=>{}),e}finally{this.isLoading=!1,this._notify()}}checkRollover(t=new Date){const e=function(t,e,i){return Ft(i)===e?null:Ft(t)===e?new Date(i):null}(this.currentDate,this._todayKey,t);this._todayKey=Ft(t),e&&(this.currentDate=e,this._notify())}get autoAdvancing(){return null!==this._autoAdvanceTimer}startAutoAdvance(){this._autoAdvanceTimer||(this.checkRollover(),this._autoAdvanceTimer=setInterval(()=>this.checkRollover(),6e4),"undefined"!=typeof document&&document.addEventListener("visibilitychange",this._onVisibilityChange))}stopAutoAdvance(){this._autoAdvanceTimer&&(clearInterval(this._autoAdvanceTimer),this._autoAdvanceTimer=null),"undefined"!=typeof document&&document.removeEventListener("visibilitychange",this._onVisibilityChange)}}class Se{constructor(t){this.host=t,this.store=new De,t.addController(this)}hostConnected(){this.store.subscribe(this.host),this.store.startAutoAdvance()}hostDisconnected(){this.store.unsubscribe(this.host),this.store.stopAutoAdvance()}}class Ae{constructor(t,e){this.host=t,this.getStore=e,t.addController(this)}hostConnected(){this._sync()}hostUpdate(){this._sync()}hostDisconnected(){this._store?.unsubscribe(this.host),this._store=void 0}_sync(){const t=this.getStore();t!==this._store&&(this._store?.unsubscribe(this.host),t?.subscribe(this.host),this._store=t)}}function ze(t,e){const i=(t?.calendars||[]).filter(t=>!1!==t.visible),s=e?.calendars;return Array.isArray(s)&&s.length>0?i.filter(t=>s.includes(t.entity_id)):i}const Me="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, system-ui, sans-serif",Pe="ui-rounded, 'SF Pro Rounded', 'PlanaVista Rounded', "+Me,Te={sharp:{radius:"4px",radiusLg:"6px",radiusSm:"2px"},rounded:{radius:"12px",radiusLg:"16px",radiusSm:"8px"},pill:{radius:"20px",radiusLg:"24px",radiusSm:"14px"}},Be={none:{shadow:"none",shadowLg:"none",shadowXl:"none"},subtle:{shadow:"0 1px 3px rgba(0, 0, 0, 0.08), 0 1px 2px rgba(0, 0, 0, 0.04)",shadowLg:"0 10px 25px rgba(0, 0, 0, 0.08), 0 4px 10px rgba(0, 0, 0, 0.04)",shadowXl:"0 20px 40px rgba(0, 0, 0, 0.12)"},bold:{shadow:"0 2px 8px rgba(0, 0, 0, 0.15), 0 1px 3px rgba(0, 0, 0, 0.1)",shadowLg:"0 12px 32px rgba(0, 0, 0, 0.18), 0 6px 14px rgba(0, 0, 0, 0.1)",shadowXl:"0 24px 48px rgba(0, 0, 0, 0.24)"}},Oe={gradient_purple:{light:"linear-gradient(135deg, #667eea 0%, #764ba2 100%)",dark:"linear-gradient(135deg, #3730A3 0%, #581C87 100%)"},gradient_teal:{light:"linear-gradient(135deg, #0D9488 0%, #2563EB 100%)",dark:"linear-gradient(135deg, #115E59 0%, #1E3A8A 100%)"},gradient_sunset:{light:"linear-gradient(135deg, #F59E0B 0%, #EF4444 100%)",dark:"linear-gradient(135deg, #92400E 0%, #991B1B 100%)"},solid_accent:{light:"",dark:""},solid_dark:{light:"#1A1B1E",dark:"#0B0C0D"}},Ie={"color-scheme":"light","--pv-bg":"#F8F8F6","--pv-card-bg":"#FFFFFF","--pv-card-bg-elevated":"#FFFFFF","--pv-text":"#1A1B1E","--pv-text-secondary":"#5F6670","--pv-text-muted":"#8E949C","--pv-border":"#E7E7E3","--pv-border-subtle":"#F1F1EE","--pv-track":"#ECECE8","--pv-chip":"#F1F1EE","--pv-seg":"#ECECE8","--pv-seg-on":"#FFFFFF","--pv-accent":"#5B5BD6","--pv-accent-text":"#FFFFFF","--pv-accent-ink":"#5B5BD6","--pv-accent-tint":"#EEEEFC","--pv-accent-tint-ink":"#3B3BB0","--pv-warn-bg":"#FDF1DC","--pv-warn-ink":"#8A5A00","--pv-bad-bg":"#FBE4E4","--pv-bad-ink":"#A12828","--pv-star":"#8A6A00","--pv-danger":"#C62828","--pv-today-bg":"rgba(91, 91, 214, 0.06)","--pv-now-color":"#E5484D","--pv-event-hover":"rgba(0, 0, 0, 0.03)","--pv-shadow":Be.subtle.shadow,"--pv-shadow-lg":Be.subtle.shadowLg,"--pv-shadow-xl":Be.subtle.shadowXl,"--pv-radius":"12px","--pv-radius-lg":"16px","--pv-radius-sm":"8px","--pv-transition":"200ms cubic-bezier(0.4, 0, 0.2, 1)","--pv-font-family":Me,"--pv-font-heading":Pe,"--pv-header-gradient":"#FFFFFF","--pv-header-text":"#1A1B1E","--pv-header-muted":"#5F6670","--pv-backdrop":"rgba(0, 0, 0, 0.3)"},Le={...Ie,"color-scheme":"dark","--pv-bg":"#111214","--pv-card-bg":"#1B1C1F","--pv-card-bg-elevated":"#25272B","--pv-text":"#E9E9E6","--pv-text-secondary":"#A3A7AE","--pv-text-muted":"#6F747C","--pv-border":"#2B2D31","--pv-border-subtle":"#232528","--pv-track":"#2C2E32","--pv-chip":"#25272B","--pv-seg":"#25272B","--pv-seg-on":"#3A3C42","--pv-accent":"#6262DE","--pv-accent-text":"#FFFFFF","--pv-accent-ink":"#8E8EF2","--pv-accent-tint":"#25254A","--pv-accent-tint-ink":"#C5C5FF","--pv-warn-bg":"#382A0F","--pv-warn-ink":"#F0C066","--pv-bad-bg":"#3B1C1F","--pv-bad-ink":"#F3A5A5","--pv-star":"#EFC75E","--pv-danger":"#B93838","--pv-today-bg":"rgba(142, 142, 242, 0.08)","--pv-now-color":"#FE6062","--pv-event-hover":"rgba(255, 255, 255, 0.04)","--pv-shadow":"none","--pv-shadow-lg":"none","--pv-shadow-xl":"none","--pv-header-gradient":"#1B1C1F","--pv-header-text":"#E9E9E6","--pv-header-muted":"#A3A7AE","--pv-backdrop":"rgba(0, 0, 0, 0.6)"},Re={planavista:{light:Ie,dark:Le},minimal:{light:{...Ie,"--pv-bg":"#FFFFFF","--pv-border":"#ECEEF1","--pv-border-subtle":"#F5F6F8","--pv-track":"#F1F2F4","--pv-chip":"#F3F4F6","--pv-seg":"#F1F2F4","--pv-accent":"#111827","--pv-accent-ink":"#111827","--pv-accent-tint":"#F3F4F6","--pv-accent-tint-ink":"#111827","--pv-today-bg":"rgba(17, 24, 39, 0.03)","--pv-shadow":"0 0 0 1px rgba(0, 0, 0, 0.05)","--pv-shadow-lg":"0 4px 12px rgba(0, 0, 0, 0.05)","--pv-shadow-xl":"0 8px 24px rgba(0, 0, 0, 0.08)","--pv-radius":"8px","--pv-radius-lg":"12px","--pv-radius-sm":"6px","--pv-transition":"150ms ease"},dark:{...Le,"--pv-bg":"#000000","--pv-card-bg":"#0E0E10","--pv-card-bg-elevated":"#18181B","--pv-text":"#EDEDED","--pv-text-secondary":"#A1A1AA","--pv-text-muted":"#71717A","--pv-border":"#1F2023","--pv-border-subtle":"#161618","--pv-track":"#1F2023","--pv-chip":"#18181B","--pv-seg":"#18181B","--pv-seg-on":"#2A2A2E","--pv-accent":"#EDEDED","--pv-accent-text":"#111214","--pv-accent-ink":"#EDEDED","--pv-accent-tint":"#1F1F23","--pv-accent-tint-ink":"#EDEDED","--pv-today-bg":"rgba(237, 237, 237, 0.05)","--pv-radius":"8px","--pv-radius-lg":"12px","--pv-radius-sm":"6px","--pv-transition":"150ms ease","--pv-header-gradient":"#0E0E10","--pv-header-text":"#EDEDED","--pv-header-muted":"#A1A1AA"}},vibrant:{light:{...Ie,"--pv-bg":"#FAF8FF","--pv-border":"#ECE6FB","--pv-border-subtle":"#F4F0FD","--pv-accent":"#7C3AED","--pv-accent-ink":"#7C3AED","--pv-accent-tint":"#F1EAFE","--pv-accent-tint-ink":"#5B21B6","--pv-today-bg":"rgba(124, 58, 237, 0.06)","--pv-now-color":"#F43F5E","--pv-shadow":"0 1px 3px rgba(124, 58, 237, 0.1), 0 1px 2px rgba(0, 0, 0, 0.04)","--pv-shadow-lg":"0 10px 25px rgba(124, 58, 237, 0.15), 0 4px 10px rgba(0, 0, 0, 0.04)","--pv-shadow-xl":"0 20px 40px rgba(124, 58, 237, 0.2)","--pv-radius":"14px","--pv-radius-lg":"20px","--pv-radius-sm":"10px","--pv-transition":"250ms cubic-bezier(0.34, 1.56, 0.64, 1)","--pv-header-gradient":"linear-gradient(135deg, #7C3AED 0%, #EC4899 100%)","--pv-header-text":"#FFFFFF","--pv-header-muted":"rgba(255, 255, 255, 0.85)","--pv-backdrop":"rgba(124, 58, 237, 0.2)"},dark:{...Le,"--pv-bg":"#150E22","--pv-card-bg":"#20172F","--pv-card-bg-elevated":"#2A1F3D","--pv-border":"#2E2442","--pv-border-subtle":"#251B36","--pv-track":"#2E2442","--pv-chip":"#2A1F3D","--pv-seg":"#2A1F3D","--pv-seg-on":"#3A2D52","--pv-accent":"#7C4DEB","--pv-accent-ink":"#B79BFA","--pv-accent-tint":"#2E2050","--pv-accent-tint-ink":"#D9C9FF","--pv-today-bg":"rgba(183, 155, 250, 0.08)","--pv-radius":"14px","--pv-radius-lg":"20px","--pv-radius-sm":"10px","--pv-transition":"250ms cubic-bezier(0.34, 1.56, 0.64, 1)","--pv-header-gradient":"linear-gradient(135deg, #4C1D95 0%, #831843 100%)","--pv-header-text":"#FFFFFF","--pv-header-muted":"rgba(255, 255, 255, 0.85)"}}};function He(t,e){const[i,s,a]=Lt(t)??[0,0,0];return`rgba(${i}, ${s}, ${a}, ${e})`}function Ne(t){const{c:e,h:i}=Vt(t);return Wt({l:.955,c:Math.min(e,.02),h:i})}function je(t,e){const{c:i,h:s}=Vt(t);return Wt("light"===e?{l:.43,c:i,h:s}:{l:.84,c:Math.min(i,.09),h:s})}function Ue(t,e,i,s,a){const r=Qt(i,t,4.5,a)??e;return{"--pv-text-secondary":r,"--pv-text-muted":Qt(s,t,3,a)??r}}function Ve(t,e,i){if("plain"===t)return{"--pv-header-gradient":e["--pv-card-bg"],"--pv-header-text":e["--pv-text"],"--pv-header-muted":e["--pv-text-secondary"]};const s=Oe[t],a="solid_accent"===t?e["--pv-accent"]:s?s[i]:t,r=s&&"solid_accent"!==t?"#FFFFFF":Ut(a);return{"--pv-header-gradient":a,"--pv-header-text":r,"--pv-header-muted":"#FFFFFF"===r?"rgba(255, 255, 255, 0.85)":"rgba(26, 27, 30, 0.7)"}}function qe(t,e){const i={...(Re[t.pair]??Re.planavista)[e]},s="light"===e?t.light:t.dark,a=t.light,r=s.background??("dark"===e&&a.background?function(t){const{c:e,h:i}=Vt(t);return Wt({l:.19,c:Math.min(e,.02),h:i})}(a.background):void 0);r&&Lt(r)&&Object.assign(i,function(t){if(Vt(t).l>=.6){const e=Vt(t).l>=.9?"#FFFFFF":Xt(t,.04);return{"color-scheme":"light","--pv-bg":t,"--pv-card-bg":e,"--pv-card-bg-elevated":e,"--pv-text":"#1A1B1E",...Ue(e,"#1A1B1E","#5F6670","#8E949C","darker"),"--pv-border":Xt(t,-.07),"--pv-border-subtle":Xt(t,-.035),"--pv-track":Xt(t,-.06),"--pv-chip":Xt(t,-.04),"--pv-seg":Xt(t,-.06),"--pv-seg-on":e,"--pv-event-hover":"rgba(0, 0, 0, 0.03)","--pv-backdrop":"rgba(0, 0, 0, 0.3)"}}const e=Xt(t,.045);return{"color-scheme":"dark","--pv-bg":t,"--pv-card-bg":e,"--pv-card-bg-elevated":Xt(t,.075),"--pv-text":"#E9E9E6",...Ue(e,"#E9E9E6","#A3A7AE","#6F747C","lighter"),"--pv-border":Xt(t,.115),"--pv-border-subtle":Xt(t,.07),"--pv-track":Xt(t,.12),"--pv-chip":Xt(t,.075),"--pv-seg":Xt(t,.075),"--pv-seg-on":Xt(t,.16),"--pv-event-hover":"rgba(255, 255, 255, 0.04)","--pv-backdrop":"rgba(0, 0, 0, 0.6)"}}(r));const n=s.accent??("dark"===e&&a.accent?Kt(a.accent):void 0);n&&Lt(n)&&Object.assign(i,function(t,e,i){return{"--pv-accent":t,"--pv-accent-text":Ut(t),"--pv-accent-ink":Qt(t,e,4.5)??Ut(e),"--pv-accent-tint":"light"===i?Ne(t):Gt(t),"--pv-accent-tint-ink":je(t,i),"--pv-today-bg":He(t,"light"===i?.06:.1)}}(n,i["--pv-card-bg"],e));const o=s.header??("dark"===e&&a.header?a.header.startsWith("#")?function(t){const{l:e,c:i,h:s}=Vt(t);return Wt({l:Math.min(e,.4),c:.8*i,h:s})}(a.header):a.header:void 0);o?Object.assign(i,Ve(o,i,e)):r&&i["--pv-header-gradient"]===Re[t.pair]?.[e]["--pv-card-bg"]&&Object.assign(i,Ve("plain",i,e));const l=s.now_color??("dark"===e&&a.now_color?Kt(a.now_color):void 0);l&&Lt(l)&&(i["--pv-now-color"]=l);const d=Te[t.shape.corner_style??""];d&&(i["--pv-radius"]=d.radius,i["--pv-radius-lg"]=d.radiusLg,i["--pv-radius-sm"]=d.radiusSm);const c=Be[t.shape.shadow_depth??""];c&&(i["--pv-shadow"]=c.shadow,i["--pv-shadow-lg"]=c.shadowLg,i["--pv-shadow-xl"]=c.shadowXl);const p=t.shape.avatar_border;return"white"===p||"light"===p?i["--pv-avatar-border"]="#FFFFFF":p&&Lt(p)&&(i["--pv-avatar-border"]=p),i}function Ye(t,e,i){return"light"!==i&&Lt(t)?{color:Kt(t),colorLight:Gt(t)}:{color:t,colorLight:e||t}}const We=new WeakMap;function Ke(t,e){if(!t||"light"===e)return t;const i=new Map,s=(t,s)=>{const a=`${t}|${s??""}`;let r=i.get(a);return r||(r=Ye(t,s,e),i.set(a,r)),r};return{...t,calendars:(t.calendars||[]).map(t=>{const{color:e,colorLight:i}=s(t.color,t.color_light);return{...t,color:e,color_light:i}}),events:(t.events||[]).map(t=>{const{color:e,colorLight:i}=s(t.calendar_color,t.calendar_color_light);return{...t,calendar_color:e,calendar_color_light:i}})}}const Ge={number:28,row:21,more:14};class Xe extends dt{constructor(){super(...arguments),this.events=[],this.calendars=[],this.currentDate=new Date,this.hiddenCalendars=new Set,this.timeFormat="12h",this.hideColumnHeaders=!1,this.avatarBorderMode="primary",this.sharedEventMap=new Map,this.tick=0,this.layout="landscape",this._hourPx=80,this._measured=null}connectedCallback(){super.connectedCallback(),this.hasUpdated&&this._watchHours()}disconnectedCallback(){super.disconnectedCallback(),this._hoursObserver?.disconnect(),this._measured=null}firstUpdated(){this._watchHours(),this._fitHours(),this._scrollToNow()}updated(t){super.updated(t),t.has("currentDate")&&this._scrollToNow(),this._watchHours(),t.has("layout")&&this._fitHours()}_watchHours(){const t=this.shadowRoot?.querySelector(".time-grid-wrapper")??null;t!==this._measured&&(this._hoursObserver?.disconnect(),this._measured=t,t&&"undefined"!=typeof ResizeObserver&&(this._hoursObserver??=new ResizeObserver(()=>this._fitHours()),this._hoursObserver.observe(t)))}_fitHours(){const t=this._measured;if(!t)return;const e=(i=this.layout,s=t.clientHeight,"portrait"===i&&s>0?Math.max(48,Math.min(80,Math.floor(s/14))):80);var i,s;if(e===this._hourPx)return;const a=(r=t.scrollTop,o=e,(n=this._hourPx)>0?Math.round(r*o/n):r);var r,n,o;this._hourPx=e,this.updateComplete.then(()=>{t.scrollTop=a})}_scrollToNow(){requestAnimationFrame(()=>{const t=this.shadowRoot?.querySelector(".time-grid-wrapper");if(!t)return;this._scrollContainer=t;const e=new Date,i=60*(e.getHours()-0)+e.getMinutes();if(i>0&&i<1440){const e=i/1440*t.scrollHeight-t.clientHeight/3;t.scrollTo({top:Math.max(0,e),behavior:"smooth"})}})}render(){const t=Bt(this.events,this.hiddenCalendars),e=new Date(this.currentDate);e.setHours(0,0,0,0);const i=new Date(this.currentDate);i.setHours(23,59,59,999);const s=Tt(t,e,i),a=s.filter(t=>At(t)),r=s.filter(t=>!At(t)),n=this.calendars.filter(t=>!1!==t.visible&&!this.hiddenCalendars.has(t.entity_id)),o=function(t,e){const i=new Map,s=new Map(e.map(t=>[t.entity_id,t]));for(const t of e)if(!1!==t.visible){const e=t.person_entity||t.entity_id;i.has(e)||i.set(e,[])}for(const e of t){const t=s.get(e.calendar_entity_id),a=t?.person_entity||e.calendar_entity_id;i.has(a)||i.set(a,[]),i.get(a).push(e)}return i}(r,n),l=Array.from(o.keys()),d=new Date,c=d.toDateString()===this.currentDate.toDateString(),p=60*(d.getHours()-0)+d.getMinutes(),h=c?p/1440*100:-1;return 0===n.length?V`
        <div class="empty-state">
          <ha-icon icon="mdi:calendar-blank"></ha-icon>
          <p>No calendars visible</p>
        </div>
      `:V`
      <div class="day-container" style="--pv-hour-px: ${this._hourPx}px">
        ${a.length>0?V`
          <div class="all-day-section">
            <div class="all-day-gutter">All Day</div>
            <div class="all-day-events">
              ${a.map(t=>V`
                <div
                  class="all-day-chip${St(t)?" past":""}"
                  style="background: ${t.calendar_color}; color: ${Ut(t.calendar_color)}"
                  @click=${()=>this._onEventClick(t)}
                >${t.summary}</div>
              `)}
            </div>
          </div>
        `:W}

        ${this.hideColumnHeaders?W:V`
          <div class="column-headers">
            <div class="header-gutter"></div>
            ${l.map(t=>{const e=n.find(e=>(e.person_entity||e.entity_id)===t),i=e?.person_entity?se(this.hass,e.person_entity):null,s=e?.person_entity?ae(this.hass,e.person_entity):e?.display_name||t,a=e?.color||"#6366F1",r=e?.color_light||a,o="light"===this.avatarBorderMode?r:"primary"===this.avatarBorderMode?a:this.avatarBorderMode;return V`
                <div class="person-header">
                  ${i?V`<img class="person-avatar" src="${i}" alt="${s}"
                        style="${o?`--pv-avatar-border: ${o}`:""}" />`:V`<div class="person-initial" style="background: ${a}; color: ${Ut(a)}">${s[0]?.toUpperCase()||"?"}</div>`}
                  <span class="person-name">${s}</span>
                </div>
              `})}
          </div>
        `}

        ${c?W:V`
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
              `:W}
              ${l.map(t=>this._renderColumn(t,o.get(t)||[]))}
            </div>
          </div>
          ${this._renderNextDayFooter()}
        </div>
      </div>
    `}_renderTimeLabels(){const t=[];for(let e=0;e<=24;e++){const i=(e-0)/24*100;let s;if("24h"===this.timeFormat)s=`${String(e%24).padStart(2,"0")}:00`;else{const t=e%24;s=`${t%12||12} ${t>=12?"PM":"AM"}`}t.push(V`
        <div class="time-label" style="top: ${i}%">${s}</div>
      `)}return t}_renderHourLines(){const t=[],e=1/24*100;for(let i=0;i<24;i++){const s=(i-0)/24*100;i%2==1&&t.push(V`
          <div class="hour-band-odd" style="top: ${s}%; height: ${e}%"></div>
        `)}return t}_renderNextDayFooter(){const t=new Date(this.currentDate);t.setDate(t.getDate()+1);const e=t.toLocaleDateString("en-US",{weekday:"long",month:"long",day:"numeric"});return V`
      <div class="next-day-footer" @click=${this._goToNextDay}>
        ${e}
        <ha-icon icon="mdi:arrow-down"></ha-icon>
      </div>
    `}_goToToday(){this.dispatchEvent(new CustomEvent("day-click",{detail:{date:new Date},bubbles:!0,composed:!0}))}_goToNextDay(){const t=new Date(this.currentDate);t.setDate(t.getDate()+1),this.dispatchEvent(new CustomEvent("day-click",{detail:{date:t},bubbles:!0,composed:!0}))}_renderColumn(t,e){const i=function(t){const e=t.filter(t=>!At(t)).sort((t,e)=>xt(t.start).getTime()-xt(e.start).getTime());if(0===e.length)return[];const i=e.map(t=>({event:t,start:xt(t.start).getTime(),end:xt(t.end).getTime(),column:0,cluster:0}));let s=0,a=0;for(let t=0;t<i.length;t++){let e=!1;for(let s=a;s<t;s++)if(i[t].start<i[s].end){e=!0;break}if(!e&&t>a){const e=t;let r=0;for(let t=a;t<e;t++)r=Math.max(r,i[t].column+1);for(let t=a;t<e;t++)i[t].cluster=s;s++,a=t}const r=new Set;for(let e=a;e<t;e++)i[t].start<i[e].end&&r.add(i[e].column);let n=0;for(;r.has(n);)n++;i[t].column=n}i.forEach((t,e)=>{e>=a&&(t.cluster=s)});const r=new Map;for(const t of i){const e=r.get(t.cluster)||0;r.set(t.cluster,Math.max(e,t.column+1))}return i.map(t=>({...t.event,column:t.column,totalColumns:r.get(t.cluster)||1}))}(e);return V`
      <div class="person-column">
        ${i.map(t=>{const e=function(t,e=0,i=24,s){const a=xt(t.start),r=xt(t.end),n=60*(i-e),o=s??a,l=new Date(o.getFullYear(),o.getMonth(),o.getDate(),e),d=new Date(o.getFullYear(),o.getMonth(),o.getDate(),i),c=t=>t<=l?0:t>=d?n:60*(t.getHours()-e)+t.getMinutes(),p=c(a),h=c(r),u=Math.max(h-p,15);return{top:p/n*100,height:u/n*100}}(t,0,24,this.currentDate),i=t.totalColumns>1?`calc(${100/t.totalColumns}% - 6px)`:"calc(100% - 6px)",s=t.totalColumns>1?`calc(${t.column/t.totalColumns*100}% + 3px)`:"3px",a=t.uid?this.sharedEventMap.get(t.uid):void 0,r=a&&a.length>1;return V`
            <div
              class="positioned-event${St(t)?" past":""}"
              style="
                top: ${e.top}%;
                height: ${e.height}%;
                width: ${i};
                left: ${s};
                --event-color: ${t.calendar_color};
                --event-color-light: ${t.calendar_color_light||""};
                --event-text: ${Ut(t.calendar_color_light||t.calendar_color)};
              "
              @click=${()=>this._onEventClick(t)}
            >
              <div class="event-title">${t.summary}</div>
              <div class="event-time">${wt(t.start,this.timeFormat)}</div>
              ${r?V`
                <div class="event-participants">
                  ${a.map(t=>{const e=t.person_entity?se(this.hass,t.person_entity):null,i=t.person_entity?ae(this.hass,t.person_entity):t.calendar_name;return e?V`<img class="event-participant-avatar"
                          src="${e}" alt="${i}"
                          style="--participant-color: ${t.calendar_color}" />`:V`<div class="event-participant-initial"
                          style="background: ${t.calendar_color}; --participant-color: ${t.calendar_color}; color: ${Ut(t.calendar_color)}"
                        >${i[0]?.toUpperCase()||"?"}</div>`})}
                </div>
              `:W}
            </div>
          `})}
      </div>
    `}_onEventClick(t){this.dispatchEvent(new CustomEvent("event-click",{detail:{event:t},bubbles:!0,composed:!0}))}}function Qe(t,e=48){return(Ze[t]||Ze.cloudy)(e)}Xe.styles=[re,le,pe,he,n`
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
    `],t([ut({attribute:!1})],Xe.prototype,"hass",void 0),t([ut({type:Array})],Xe.prototype,"events",void 0),t([ut({type:Array})],Xe.prototype,"calendars",void 0),t([ut({type:Object})],Xe.prototype,"currentDate",void 0),t([ut({type:Object})],Xe.prototype,"hiddenCalendars",void 0),t([ut({attribute:!1})],Xe.prototype,"timeFormat",void 0),t([ut({type:Boolean})],Xe.prototype,"hideColumnHeaders",void 0),t([ut({attribute:!1})],Xe.prototype,"avatarBorderMode",void 0),t([ut({attribute:!1})],Xe.prototype,"sharedEventMap",void 0),t([ut({type:Number})],Xe.prototype,"tick",void 0),t([ut({type:String,reflect:!0})],Xe.prototype,"layout",void 0),t([vt()],Xe.prototype,"_hourPx",void 0),gt("pv-view-day",Xe);const Ze={sunny:t=>V`
    <svg width="${t}" height="${t}" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
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
    </svg>`,"clear-night":t=>V`
    <svg width="${t}" height="${t}" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M38 14C30 14 23 20 21 28C20 31 20 35 21 38C23 44 28 49 35 50C38 51 41 51 44 50C36 52 27 48 23 40C19 32 21 22 28 16C31 14 34 13 38 14Z" fill="#94A3B8" />
      <circle cx="44" cy="16" r="1.5" fill="#94A3B8" opacity="0.6" />
      <circle cx="50" cy="24" r="1" fill="#94A3B8" opacity="0.4" />
      <circle cx="46" cy="32" r="1.2" fill="#94A3B8" opacity="0.5" />
    </svg>`,cloudy:t=>V`
    <svg width="${t}" height="${t}" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M48 40H18C13.6 40 10 36.4 10 32C10 27.6 13.6 24 18 24C18.2 24 18.5 24 18.7 24C20.2 18.6 25.2 15 31 15C37.9 15 43.5 19.9 44.2 26.5C44.8 26.3 45.4 26.2 46 26.2C49.3 26.2 52 28.9 52 32.2C52 32.2 52 32.2 52 32.3" fill="#CBD5E1" />
      <path d="M48 40H18C13.6 40 10 36.4 10 32C10 27.6 13.6 24 18 24C18.2 24 18.5 24 18.7 24C20.2 18.6 25.2 15 31 15C37.9 15 43.5 19.9 44.2 26.5C44.8 26.3 45.4 26.2 46 26.2C49.3 26.2 52 28.9 52 32.2V40C52 40 50 40 48 40Z" fill="#94A3B8" />
    </svg>`,partlycloudy:t=>V`
    <svg width="${t}" height="${t}" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
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
    </svg>`,rainy:t=>V`
    <svg width="${t}" height="${t}" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M48 34H18C13.6 34 10 30.4 10 26C10 21.6 13.6 18 18 18C18.2 18 18.5 18 18.7 18C20.2 12.6 25.2 9 31 9C37.9 9 43.5 13.9 44.2 20.5C44.8 20.3 45.4 20.2 46 20.2C49.3 20.2 52 22.9 52 26.2V34H48Z" fill="#94A3B8" />
      <g stroke="#60A5FA" stroke-width="2.5" stroke-linecap="round">
        <line x1="22" y1="40" x2="20" y2="48" class="pv-rain-drop" />
        <line x1="32" y1="40" x2="30" y2="48" class="pv-rain-drop" style="animation-delay: 0.3s" />
        <line x1="42" y1="40" x2="40" y2="48" class="pv-rain-drop" style="animation-delay: 0.6s" />
        <line x1="27" y1="48" x2="25" y2="56" class="pv-rain-drop" style="animation-delay: 0.15s" />
        <line x1="37" y1="48" x2="35" y2="56" class="pv-rain-drop" style="animation-delay: 0.45s" />
      </g>
    </svg>`,pouring:t=>V`
    <svg width="${t}" height="${t}" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
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
    </svg>`,snowy:t=>V`
    <svg width="${t}" height="${t}" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M48 32H18C13.6 32 10 28.4 10 24C10 19.6 13.6 16 18 16C18.2 16 18.5 16 18.7 16C20.2 10.6 25.2 7 31 7C37.9 7 43.5 11.9 44.2 18.5C44.8 18.3 45.4 18.2 46 18.2C49.3 18.2 52 20.9 52 24.2V32H48Z" fill="#94A3B8" />
      <circle cx="20" cy="42" r="2.5" fill="#BFDBFE" class="pv-snow-flake" />
      <circle cx="32" cy="40" r="2.5" fill="#BFDBFE" class="pv-snow-flake" style="animation-delay: 0.3s" />
      <circle cx="44" cy="43" r="2.5" fill="#BFDBFE" class="pv-snow-flake" style="animation-delay: 0.6s" />
      <circle cx="25" cy="52" r="2" fill="#BFDBFE" class="pv-snow-flake" style="animation-delay: 0.15s" />
      <circle cx="38" cy="51" r="2" fill="#BFDBFE" class="pv-snow-flake" style="animation-delay: 0.45s" />
    </svg>`,"snowy-rainy":t=>V`
    <svg width="${t}" height="${t}" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M48 32H18C13.6 32 10 28.4 10 24C10 19.6 13.6 16 18 16C18.2 16 18.5 16 18.7 16C20.2 10.6 25.2 7 31 7C37.9 7 43.5 11.9 44.2 18.5C44.8 18.3 45.4 18.2 46 18.2C49.3 18.2 52 20.9 52 24.2V32H48Z" fill="#94A3B8" />
      <g stroke="#60A5FA" stroke-width="2" stroke-linecap="round">
        <line x1="22" y1="38" x2="20" y2="46" class="pv-rain-drop" />
        <line x1="42" y1="38" x2="40" y2="46" class="pv-rain-drop" style="animation-delay: 0.3s" />
      </g>
      <circle cx="32" cy="42" r="2.5" fill="#BFDBFE" class="pv-snow-flake" style="animation-delay: 0.15s" />
      <circle cx="27" cy="52" r="2" fill="#BFDBFE" class="pv-snow-flake" style="animation-delay: 0.45s" />
      <circle cx="37" cy="50" r="2" fill="#BFDBFE" class="pv-snow-flake" style="animation-delay: 0.6s" />
    </svg>`,fog:t=>V`
    <svg width="${t}" height="${t}" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <g stroke="#94A3B8" stroke-width="3" stroke-linecap="round">
        <line x1="12" y1="24" x2="52" y2="24" opacity="0.4" />
        <line x1="16" y1="32" x2="48" y2="32" opacity="0.6" />
        <line x1="12" y1="40" x2="52" y2="40" opacity="0.8" />
        <line x1="18" y1="48" x2="46" y2="48" opacity="0.5" />
      </g>
    </svg>`,hail:t=>V`
    <svg width="${t}" height="${t}" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M48 30H18C13.6 30 10 26.4 10 22C10 17.6 13.6 14 18 14C18.2 14 18.5 14 18.7 14C20.2 8.6 25.2 5 31 5C37.9 5 43.5 9.9 44.2 16.5C44.8 16.3 45.4 16.2 46 16.2C49.3 16.2 52 18.9 52 22.2V30H48Z" fill="#94A3B8" />
      <circle cx="20" cy="40" r="3" fill="#93C5FD" stroke="#60A5FA" stroke-width="1" />
      <circle cx="32" cy="44" r="3" fill="#93C5FD" stroke="#60A5FA" stroke-width="1" />
      <circle cx="44" cy="38" r="3" fill="#93C5FD" stroke="#60A5FA" stroke-width="1" />
      <circle cx="26" cy="52" r="2.5" fill="#93C5FD" stroke="#60A5FA" stroke-width="1" />
      <circle cx="38" cy="54" r="2.5" fill="#93C5FD" stroke="#60A5FA" stroke-width="1" />
    </svg>`,lightning:t=>V`
    <svg width="${t}" height="${t}" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M48 30H18C13.6 30 10 26.4 10 22C10 17.6 13.6 14 18 14C18.2 14 18.5 14 18.7 14C20.2 8.6 25.2 5 31 5C37.9 5 43.5 9.9 44.2 16.5C44.8 16.3 45.4 16.2 46 16.2C49.3 16.2 52 18.9 52 22.2V30H48Z" fill="#64748B" />
      <path d="M34 30L28 42H34L30 56L42 40H36L40 30H34Z" fill="#FBBF24" stroke="#F59E0B" stroke-width="0.5" />
    </svg>`,"lightning-rainy":t=>V`
    <svg width="${t}" height="${t}" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M48 28H18C13.6 28 10 24.4 10 20C10 15.6 13.6 12 18 12C18.2 12 18.5 12 18.7 12C20.2 6.6 25.2 3 31 3C37.9 3 43.5 7.9 44.2 14.5C44.8 14.3 45.4 14.2 46 14.2C49.3 14.2 52 16.9 52 20.2V28H48Z" fill="#64748B" />
      <path d="M34 28L28 40H34L30 52L42 38H36L40 28H34Z" fill="#FBBF24" />
      <g stroke="#60A5FA" stroke-width="2" stroke-linecap="round">
        <line x1="18" y1="36" x2="16" y2="44" class="pv-rain-drop" style="animation-delay: 0.2s" />
        <line x1="48" y1="34" x2="46" y2="42" class="pv-rain-drop" style="animation-delay: 0.5s" />
        <line x1="22" y1="48" x2="20" y2="56" class="pv-rain-drop" style="animation-delay: 0.1s" />
        <line x1="44" y1="46" x2="42" y2="54" class="pv-rain-drop" style="animation-delay: 0.4s" />
      </g>
    </svg>`,windy:t=>V`
    <svg width="${t}" height="${t}" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <g stroke="#94A3B8" stroke-width="3" stroke-linecap="round">
        <path d="M10 24 Q30 24 38 20 Q46 16 48 20 Q50 24 46 24" fill="none" />
        <path d="M8 34 Q28 34 40 30 Q48 28 50 32 Q52 36 48 36" fill="none" />
        <path d="M14 44 Q30 44 36 40 Q42 36 44 40 Q46 44 42 44" fill="none" />
      </g>
    </svg>`,"windy-variant":t=>V`
    <svg width="${t}" height="${t}" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M48 28H22C17.6 28 14 24.4 14 20C14 15.6 17.6 12 22 12C22.2 12 22.5 12 22.7 12C24.2 7 28.8 4 34 4C40.3 4 45.5 8.5 46.2 14.5C46.8 14.3 47.4 14.2 48 14.2C51 14.2 53.5 16.7 53.5 19.7V28H48Z" fill="#CBD5E1" />
      <g stroke="#94A3B8" stroke-width="2.5" stroke-linecap="round">
        <path d="M8 36 Q28 36 36 33 Q44 30 46 34 Q48 38 44 38" fill="none" />
        <path d="M12 46 Q28 46 34 43 Q40 40 42 44 Q44 48 40 48" fill="none" />
      </g>
    </svg>`,exceptional:t=>V`
    <svg width="${t}" height="${t}" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="32" cy="32" r="20" stroke="#F59E0B" stroke-width="3" fill="none" />
      <line x1="32" y1="18" x2="32" y2="34" stroke="#F59E0B" stroke-width="3" stroke-linecap="round" />
      <circle cx="32" cy="42" r="2" fill="#F59E0B" />
    </svg>`};function Je(t){try{const e=t();e&&"function"==typeof e.catch&&e.catch(()=>{})}catch{}}function ti(t){return Math.min(3e4,1e3*2**t)}class ei{constructor(t){this._onForecast=t,this._entityId="",this._unsub=null,this._generation=0,this._attempt=0,this._hadForecast=!1,this._onReady=()=>{this._connection&&this._entityId&&(this._generation++,this._unsub=null,this._cancelRetry(),this._subscribe())}}update(t,e,i){if(this._legacy=i,!e||!t){const t=""!==this._entityId;return this.stop(),void(t&&this._onForecast([]))}e===this._entityId&&t===this._connection||(this.stop(),this._entityId=e,this._connection=t,t.addEventListener?.("ready",this._onReady),this._subscribe())}stop(){if(this._generation++,this._cancelRetry(),this._connection?.removeEventListener?.("ready",this._onReady),this._connection=void 0,this._entityId="",this._hadForecast=!1,this._unsub){const t=this._unsub;this._unsub=null,Je(t)}}_subscribe(){const t=this._connection;if(!t)return;const e=this._generation;t.subscribeMessage(t=>{e===this._generation&&(this._hadForecast=!0,this._onForecast(t?.forecast||[]))},{type:"weather/subscribe_forecast",forecast_type:"daily",entity_id:this._entityId},{resubscribe:!1}).then(t=>{e===this._generation?(this._unsub=t,this._attempt=0):Je(t)}).catch(()=>{if(e!==this._generation)return;const t=this._attempt>=6;!t&&this._hadForecast||this._onForecast(this._legacy||[]),t||(this._retry=setTimeout(()=>{this._retry=void 0,e===this._generation&&this._subscribe()},ti(this._attempt++)))})}_cancelRetry(){void 0!==this._retry&&clearTimeout(this._retry),this._retry=void 0,this._attempt=0}}function ii(t){const e=new Map;for(const i of t)i.datetime&&e.set(Ft(xt(i.datetime)),{condition:i.condition||"",tempHigh:i.temperature??0,tempLow:i.templow??i.temperature??0});return e}const si=["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];class ai extends dt{constructor(){super(...arguments),this.events=[],this.calendars=[],this.currentDate=new Date,this.hiddenCalendars=new Set,this.timeFormat="12h",this.firstDay="sunday",this.forecast=[],this.showStripes=!0,this.tick=0,this.layout="landscape"}_getWeekDays(){const t=Et(this.currentDate,this.firstDay);return Array.from({length:7},(e,i)=>{const s=new Date(t);return s.setDate(s.getDate()+i),s})}_getWeekLabel(t){const e=t[0],i=t[6],s={month:"long",day:"numeric"};return e.getMonth()===i.getMonth()?`${e.toLocaleDateString("en-US",{month:"long"})} ${e.getDate()} – ${i.getDate()}`:`${e.toLocaleDateString("en-US",s)} – ${i.toLocaleDateString("en-US",s)}`}render(){const t=Bt(this.events,this.hiddenCalendars),e=this._getWeekDays(),i=new Date(e[0]);i.setHours(0,0,0,0);const s=new Date(e[6]);s.setHours(23,59,59,999);const a=Dt(Tt(t,i,s),this.calendars),r=ii(this.forecast);return V`
      <div class="week-container">
        <div class="week-label">${this._getWeekLabel(e)}</div>
        <div class="day-grid">
          ${e.map(t=>this._renderDayCard(t,a,r))}
        </div>
      </div>
    `}_renderDayCard(t,e,i){const s=$t(t),a=Ft(t),r=new Date(t);r.setHours(0,0,0,0);const n=new Date(t);n.setHours(23,59,59,999);const o=Tt(e,r,n).sort(Mt),l=i.get(a),d=`${si[t.getDay()]} ${t.getDate()}`,c=o.length;return V`
      <div class="day-card ${s?"day-card--today":""}">
        <div class="day-card-header">
          <div class="day-card-header-left">
            <div class="day-name">${d}</div>
            <div class="day-meta">
              <span>${c} event${1!==c?"s":""}</span>
              <button class="add-event-link" @click=${()=>this._addEvent(t)}>+ Add</button>
            </div>
          </div>
          ${l?V`
            <div class="day-weather">
              ${Qe(l.condition)}
              <span class="day-weather-temp">${Math.round(l.tempHigh)}°/${Math.round(l.tempLow)}°</span>
            </div>
          `:W}
        </div>
        ${o.length>0?V`
          <div class="day-card-events">
            ${o.map(t=>V`
              <pv-event-chip
                .hass=${this.hass}
                .event=${t}
                .calendars=${this.calendars}
                .timeFormat=${this.timeFormat}
                .showStripes=${this.showStripes}
                .tick=${this.tick}
                @event-click=${t=>this._onEventClick(t.detail.event)}
              ></pv-event-chip>
            `)}
          </div>
        `:V`
          <div class="day-card-empty">No events</div>
        `}
      </div>
    `}_addEvent(t){this.dispatchEvent(new CustomEvent("create-event",{detail:{date:t},bubbles:!0,composed:!0}))}_onEventClick(t){this.dispatchEvent(new CustomEvent("event-click",{detail:{event:t},bubbles:!0,composed:!0}))}}ai.styles=[re,he,n`
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
    `],t([ut({attribute:!1})],ai.prototype,"hass",void 0),t([ut({type:Array})],ai.prototype,"events",void 0),t([ut({type:Array})],ai.prototype,"calendars",void 0),t([ut({type:Object})],ai.prototype,"currentDate",void 0),t([ut({type:Object})],ai.prototype,"hiddenCalendars",void 0),t([ut({attribute:!1})],ai.prototype,"timeFormat",void 0),t([ut({attribute:!1})],ai.prototype,"firstDay",void 0),t([ut({attribute:!1})],ai.prototype,"forecast",void 0),t([ut({type:Boolean})],ai.prototype,"showStripes",void 0),t([ut({type:Number})],ai.prototype,"tick",void 0),t([ut({type:String,reflect:!0})],ai.prototype,"layout",void 0),gt("pv-view-week",ai);const ri=["Sun","Mon","Tue","Wed","Thu","Fri","Sat"],ni=["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];class oi extends dt{constructor(){super(...arguments),this.events=[],this.calendars=[],this.currentDate=new Date,this.hiddenCalendars=new Set,this.firstDay="sunday",this.timeFormat="12h",this.showStripes=!0,this.tick=0,this.layout="landscape",this._fit={cell:0,normal:Ge,today:Ge}}connectedCallback(){super.connectedCallback(),this.hasUpdated&&this._observeGrid()}disconnectedCallback(){super.disconnectedCallback(),this._gridObserver?.disconnect()}firstUpdated(){this._observeGrid()}updated(){this._measure()}_observeGrid(){const t=this.shadowRoot?.querySelector(".month-grid");t&&"undefined"!=typeof ResizeObserver&&(this._gridObserver??=new ResizeObserver(()=>this._measure()),this._gridObserver.disconnect(),this._gridObserver.observe(t))}_measure(){const t=this.shadowRoot?.querySelector(".month-grid");if(!t||0===t.clientHeight)return;const e=t.querySelector(".day-events"),i=e&&parseFloat(getComputedStyle(e).rowGap)||0,s=t.querySelector("pv-event-chip"),a=t.querySelector(".more-events"),r=s?Math.ceil(s.getBoundingClientRect().height+i):Ge.row,n=a?Math.ceil(a.getBoundingClientRect().height+i):Ge.more,o=t=>{const e=t?.querySelector(".day-events");if(!t||!e)return Ge.number;const i=parseFloat(getComputedStyle(t).borderBottomWidth)||0;return Math.ceil(e.getBoundingClientRect().top-t.getBoundingClientRect().top+i)},l={number:o(t.querySelector(".day-cell:not(.today)")),row:r,more:n},d=t.querySelector(".day-cell.today"),c={cell:Math.floor(t.clientHeight/6),normal:l,today:d?{...l,number:o(d)}:l};JSON.stringify(c)!==JSON.stringify(this._fit)&&(this._fit=c)}render(){const t=Dt(Bt(this.events,this.hiddenCalendars),this.calendars),e=function(t,e="sunday"){const i=Et(new Date(t.getFullYear(),t.getMonth(),1),e),s=[];for(let t=0;t<42;t++){const e=new Date(i);e.setDate(i.getDate()+t),s.push(e)}return s}(this.currentDate,this.firstDay),i=Pt(t),s=this.currentDate.getMonth(),a="monday"===this.firstDay?ni:ri,r=this.currentDate.toLocaleDateString("en-US",{month:"long",year:"numeric"});return V`
      <div class="month-container">
        <div class="month-name">${r}</div>
        <div class="weekday-header">
          ${a.map(t=>V`<div class="weekday-name">${t}</div>`)}
        </div>
        <div class="month-grid">
          ${e.map(t=>this._renderDayCell(t,s,i))}
        </div>
      </div>
    `}_renderDayCell(t,e,i){const s=Ft(t),a=i.get(s)||[],r=t.getMonth()!==e,n=$t(t),{shown:o,more:l}=function(t,e,i=Ge){if(!(e>0)){const e=Math.min(t,3);return{shown:e,more:t-e}}const s=e-i.number;if(t<=Math.floor(s/i.row))return{shown:t,more:0};const a=Math.min(t,Math.max(1,Math.floor((s-i.more)/i.row)));return{shown:a,more:t-a}}(a.length,this._fit.cell,n?this._fit.today:this._fit.normal),d=a.slice(0,o);return V`
      <div
        class="day-cell ${r?"other-month":""} ${n?"today":""}"
        @click=${()=>this._onDayClick(t)}
      >
        <div class="day-number">${t.getDate()}</div>
        <div class="day-events">
          ${d.map(t=>V`
            <pv-event-chip
              .hass=${this.hass}
              .event=${t}
              .calendars=${this.calendars}
              .timeFormat=${this.timeFormat}
              .compact=${!0}
              .showStripes=${this.showStripes}
              .tick=${this.tick}
              @event-click=${t=>{t.stopPropagation(),this._onEventClick(t.detail.event)}}
              @click=${t=>t.stopPropagation()}
            ></pv-event-chip>
          `)}
          ${l>0?V`
            <div class="more-events" @click=${e=>{e.stopPropagation(),this._onDayClick(t)}}>
              +${l} more
            </div>
          `:W}
        </div>
      </div>
    `}_onDayClick(t){this.dispatchEvent(new CustomEvent("day-click",{detail:{date:t},bubbles:!0,composed:!0}))}_onEventClick(t){this.dispatchEvent(new CustomEvent("event-click",{detail:{event:t},bubbles:!0,composed:!0}))}}oi.styles=[re,n`
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
    `],t([ut({attribute:!1})],oi.prototype,"hass",void 0),t([ut({type:Array})],oi.prototype,"events",void 0),t([ut({type:Array})],oi.prototype,"calendars",void 0),t([ut({type:Object})],oi.prototype,"currentDate",void 0),t([ut({type:Object})],oi.prototype,"hiddenCalendars",void 0),t([ut({attribute:!1})],oi.prototype,"firstDay",void 0),t([ut({attribute:!1})],oi.prototype,"timeFormat",void 0),t([ut({type:Boolean})],oi.prototype,"showStripes",void 0),t([ut({type:Number})],oi.prototype,"tick",void 0),t([ut({type:String,reflect:!0})],oi.prototype,"layout",void 0),t([vt()],oi.prototype,"_fit",void 0),gt("pv-view-month",oi);const li=["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];class di extends dt{constructor(){super(...arguments),this.events=[],this.calendars=[],this.currentDate=new Date,this.hiddenCalendars=new Set,this.timeFormat="12h",this.forecast=[],this.showStripes=!0,this.tick=0,this.layout="landscape",this._daysLoaded=14}render(){const t=new Date;t.setHours(0,0,0,0);const e=[];for(let i=0;i<this._daysLoaded;i++){const s=new Date(t);s.setDate(s.getDate()+i),e.push(s)}const i=Pt(Dt(Bt(this.events,this.hiddenCalendars),this.calendars)),s=ii(this.forecast);return V`
      <div class="agenda-container">
        ${e.map(t=>this._renderDayCard(t,i,s))}
        <div class="load-more" @click=${this._loadMore}>
          Load more days
        </div>
      </div>
    `}_renderDayCard(t,e,i){const s=Ft(t),a=e.get(s)||[],r=$t(t),n=i.get(s),o=function(t){if($t(t))return"Today";if(function(t){const e=new Date;return e.setDate(e.getDate()+1),t.getFullYear()===e.getFullYear()&&t.getMonth()===e.getMonth()&&t.getDate()===e.getDate()}(t))return"Tomorrow";const e=new Date,i=Math.floor((t.getTime()-e.getTime())/864e5);return i<7&&i>=0?t.toLocaleDateString("en-US",{weekday:"long"}):kt(t,"medium")}(t),l=kt(t,"long"),d=[...a].sort(Mt);return V`
      <div class="day-card ${r?"day-card--today":""}">
        <div class="day-card-header">
          <div class="day-card-header-left">
            <span class="day-name ${r?"day-name--today":""}">
              ${li[t.getDay()]} ${t.getDate()}
            </span>
            ${o?V`<span class="day-relative">${o}</span>`:V`<span class="day-relative">${l}</span>`}
          </div>
          ${n?V`
            <div class="day-weather">
              ${Qe(n.condition,20)}
              <span class="day-weather-temps">${Math.round(n.tempHigh)}°/${Math.round(n.tempLow)}°</span>
            </div>
          `:W}
        </div>
        <div class="day-subheader">
          <span>${d.length} event${1!==d.length?"s":""}</span>
          <button class="add-event-link" @click=${()=>this._addEvent(t)}>+ Add event</button>
        </div>
        <div class="day-events">
          ${d.length>0?d.map(t=>V`
                <pv-event-chip
                  .hass=${this.hass}
                  .event=${t}
                  .calendars=${this.calendars}
                  .timeFormat=${this.timeFormat}
                  .showStripes=${this.showStripes}
                  .tick=${this.tick}
                  @event-click=${t=>this._onEventClick(t.detail.event)}
                ></pv-event-chip>
              `):V`<div class="empty-day">No events</div>`}
        </div>
      </div>
    `}_loadMore(){this._daysLoaded+=14}_addEvent(t){this.dispatchEvent(new CustomEvent("create-event",{detail:{date:t},bubbles:!0,composed:!0}))}_onEventClick(t){this.dispatchEvent(new CustomEvent("event-click",{detail:{event:t},bubbles:!0,composed:!0}))}}di.styles=[re,he,n`
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
    `],t([ut({attribute:!1})],di.prototype,"hass",void 0),t([ut({type:Array})],di.prototype,"events",void 0),t([ut({type:Array})],di.prototype,"calendars",void 0),t([ut({type:Object})],di.prototype,"currentDate",void 0),t([ut({type:Object})],di.prototype,"hiddenCalendars",void 0),t([ut({attribute:!1})],di.prototype,"timeFormat",void 0),t([ut({attribute:!1})],di.prototype,"forecast",void 0),t([ut({type:Boolean})],di.prototype,"showStripes",void 0),t([ut({type:Number})],di.prototype,"tick",void 0),t([ut({type:String,reflect:!0})],di.prototype,"layout",void 0),t([vt()],di.prototype,"_daysLoaded",void 0),gt("pv-view-agenda",di);class ci extends dt{constructor(){super(...arguments),this.event=null,this.timeFormat="12h",this._confirmDelete=!1,this._deleteMode=null,this._deleting=!1,this._deleteError="",this._organizerEntityId=null,this._storeSubscription=new Ae(this,()=>this.store),this._lastOrganizerUid=""}updated(t){if(super.updated(t),t.has("event")&&this.event){const t=this.event.shared_calendars,e=this.event.uid||"";t&&t.length>1&&e&&e!==this._lastOrganizerUid?(this._lastOrganizerUid=e,this._organizerEntityId=null,this._fetchOrganizer(this.event.calendar_entity_id,e)):(!t||t.length<=1)&&(this._organizerEntityId=null,this._lastOrganizerUid="")}}async _fetchOrganizer(t,e){this._organizerEntityId=await ie(this.hass,t,e)}render(){if(!this.event)return W;const t=this.event,e=At(t),i=xt(t.start),s=t.shared_calendars,a=s&&s.length>1;return V`
      <div class="pv-overlay" @click=${this._close}>
        <div class="pv-popup" @click=${t=>t.stopPropagation()} style="position: relative;">
          <button class="pv-btn-icon close-btn" @click=${this._close}>
            <ha-icon icon="mdi:close"></ha-icon>
          </button>

          <div class="popup-header">
            <h3 class="popup-title">${t.summary}</h3>
            ${a?V`
              <div class="participants-row">
                ${s.map(t=>V`
                  <span class="participant-chip" style="background: ${t.calendar_color}; color: ${Ut(t.calendar_color)}">
                    ${t.calendar_name}
                    ${t.entity_id===this._organizerEntityId?V`<span class="organizer-tag">organizer</span>`:W}
                  </span>
                `)}
              </div>
            `:V`
              <div class="popup-calendar">
                <span class="calendar-indicator" style="background: ${t.calendar_color}"></span>
                ${t.calendar_name}
              </div>
            `}
          </div>

          <div class="popup-body">
            <div class="detail-row">
              <ha-icon icon="mdi:clock-outline"></ha-icon>
              <div class="detail-text">
                <div>${kt(i,"long")}</div>
                ${e?V`
                  <div style="color: var(--pv-text-secondary); font-size: 0.875rem">All Day</div>
                `:V`
                  <div style="color: var(--pv-text-secondary); font-size: 0.875rem">
                    ${wt(t.start,this.timeFormat)} – ${wt(t.end,this.timeFormat)}
                  </div>
                `}
              </div>
            </div>

            ${t.location?V`
              <div class="detail-row">
                <ha-icon icon="mdi:map-marker-outline"></ha-icon>
                <div class="detail-text">${t.location}</div>
              </div>
            `:W}

            ${t.description?V`
              <div class="detail-row">
                <ha-icon icon="mdi:text"></ha-icon>
                <div class="detail-text" style="white-space: pre-wrap;">${t.description}</div>
              </div>
            `:W}
          </div>

          ${this._confirmDelete?V`
            <div class="delete-confirm">
              ${this._deleteError?V`
                <div style="color: #EF4444; font-size: 0.8125rem; margin-bottom: 0.75rem;">${this._deleteError}</div>
              `:W}

              ${a&&!this._deleteMode?V`
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
                  ${"all"===this._deleteMode&&a?`Delete "${t.summary}" from all ${s.length} calendars?`:"remove-me"===this._deleteMode&&a?`Remove "${t.summary}" from ${t.calendar_name}'s calendar only?`:`Delete "${t.summary}"?`}
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
    `}_close(){this._confirmDelete=!1,this._deleteMode=null,this._deleting=!1,this._deleteError="",this.store.selectEvent(null)}_edit(){this.event&&this.store.openEditDialog(this.event)}_openRemoveGuests(){this.event&&(this._confirmDelete=!1,this._deleteMode=null,this.store.openEditDialog(this.event,{removeGuests:!0}))}async _delete(){if(!this.event?.uid)return void(this._deleteError="Cannot delete this event: it has no unique ID. Delete it from your calendar app directly.");const t=this.event.shared_calendars,e=t&&t.length>1;this._deleting=!0,this._deleteError="";try{if(e&&"all"===this._deleteMode){for(const e of t)try{await te(this.hass,{entity_id:e.entity_id,uid:this.event.uid,recurrence_id:this.event.recurrence_id})}catch(t){console.warn(`[PlanaVista] Failed to delete from ${e.entity_id}:`,t)}await ee(this.hass),this.store.selectEvent(null)}else if(e&&"remove-me"===this._deleteMode){const t=this.event.calendar_entity_id;await te(this.hass,{entity_id:t,uid:this.event.uid,recurrence_id:this.event.recurrence_id}),await ee(this.hass),this.store.selectEvent(null)}else{const t={entity_id:this.event.calendar_entity_id,uid:this.event.uid,recurrence_id:this.event.recurrence_id};await this.store.doDeleteEvent(this.hass,t)}}catch(t){console.error("PlanaVista: Delete failed",t),this._deleteError="Failed to delete event. Please try again.",this._deleting=!1}}}function pi(t){const e=[t.housenumber,t.street].filter(Boolean).join(" "),i=[];for(const s of[t.name,e,t.city,t.state,t.postcode,t.country]){const t=(s||"").trim();t&&!i.some(e=>e.toLowerCase()===t.toLowerCase())&&i.push(t)}return i.join(", ")}ci.styles=[re,oe,de,he,n`
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
    `],t([ut({attribute:!1})],ci.prototype,"hass",void 0),t([ut({type:Object})],ci.prototype,"event",void 0),t([ut({attribute:!1})],ci.prototype,"timeFormat",void 0),t([vt()],ci.prototype,"_confirmDelete",void 0),t([vt()],ci.prototype,"_deleteMode",void 0),t([vt()],ci.prototype,"_deleting",void 0),t([vt()],ci.prototype,"_deleteError",void 0),t([vt()],ci.prototype,"_organizerEntityId",void 0),t([ut({attribute:!1})],ci.prototype,"store",void 0),gt("pv-event-popup",ci);class hi{constructor(t){this._opts=t,this._timer=null,this._abort=null,this._seq=0,this._fetch=t.fetchFn??((t,e)=>fetch(t,e))}input(t,e){this.cancel();const i=t.trim();if(!e||i.length<3)return this._opts.onResults([]),void this._opts.onLoading(!1);this._opts.onLoading(!0);const s=this._seq;this._timer=setTimeout(()=>{this._timer=null,this._run(i,s)},350)}cancel(){this._seq++,this._timer&&(clearTimeout(this._timer),this._timer=null),this._abort&&(this._abort.abort(),this._abort=null)}async _run(t,e){const i=new AbortController;this._abort=i;try{const a=await this._fetch((s=t,`https://photon.komoot.io/api/?q=${encodeURIComponent(s)}&limit=5&lang=en`),{signal:i.signal,credentials:"omit",referrerPolicy:"no-referrer"});if(!a.ok)throw new Error(`Photon HTTP ${a.status}`);const r=await a.json();e===this._seq&&this._opts.onResults(function(t){const e=t?.features;if(!Array.isArray(e))return[];const i=[];for(const t of e){const e=pi(t?.properties||{});if(e&&!i.includes(e)&&i.push(e),5===i.length)break}return i}(r))}catch{e===this._seq&&this._opts.onResults([])}finally{e===this._seq&&(this._abort=null,this._opts.onLoading(!1))}var s}}const ui=["Su","Mo","Tu","We","Th","Fr","Sa"];class vi extends dt{constructor(){super(...arguments),this.calendars=[],this.open=!1,this.mode="create",this.prefill=null,this.timeFormat="12h",this.locationAutocomplete=!1,this._title="",this._selectedCalendars=new Set,this._originalCalendars=new Set,this._organizerEntityId="",this._date="",this._startTime="",this._endTime="",this._allDay=!1,this._spanDays=1,this._endDayOffset=0,this._description="",this._location="",this._showMore=!1,this._saving=!1,this._error="",this._removeGuestsHint=!1,this._datePickerOpen=!1,this._pickerMonth=0,this._pickerYear=0,this._activeTimePicker=null,this._locationSuggestions=[],this._locationLoading=!1,this._locationFocused=!1,this._locationSearch=new hi({onResults:t=>{this._locationSuggestions=t},onLoading:t=>{this._locationLoading=t}}),this._storeSubscription=new Ae(this,()=>this.store)}disconnectedCallback(){super.disconnectedCallback(),this._locationSearch.cancel()}updated(t){super.updated(t),t.has("locationAutocomplete")&&!this.locationAutocomplete&&this._resetLocationSearch(),t.has("open")&&this.open&&(this._initForm(),this._datePickerOpen=!1,requestAnimationFrame(()=>{this._titleInput?.focus()}))}_initForm(){if(this._error="",this._saving=!1,this._showMore=!1,this._resetLocationSearch(),this._locationFocused=!1,this._removeGuestsHint=!!this.prefill?._removeGuestsHint,this.prefill){this._title=this.prefill.summary||"",this._description=this.prefill.description||"",this._location=this.prefill.location||"";const t=this.prefill.shared_calendars;t&&t.length>0?this._selectedCalendars=new Set(t.map(t=>t.entity_id)):this.prefill.calendar_entity_id?this._selectedCalendars=new Set([this.prefill.calendar_entity_id]):this._selectedCalendars=new Set([this.calendars[0]?.entity_id].filter(Boolean)),this._originalCalendars=new Set(this._selectedCalendars),t&&t.length>1&&this.prefill.uid?(this._organizerEntityId="",this._fetchOrganizer(this.prefill.calendar_entity_id||"",this.prefill.uid)):this._organizerEntityId=this.prefill.calendar_entity_id||"",this.prefill.start?this._applyDates(function(t,e){const i=xt(t);if(bt(t)){const t=e?xt(e):i;return{date:Ft(i),allDay:!0,startTime:"09:00",endTime:"10:00",spanDays:Math.max(1,Ct(i,t)),endDayOffset:0}}const s=e?xt(e):new Date(i.getTime()+36e5);return{date:Ft(i),allDay:!1,startTime:ye(i),endTime:ye(s),spanDays:1,endDayOffset:Math.max(0,Ct(i,s))}}(this.prefill.start,this.prefill.end)):this._setDefaults(),(this._description||this._location)&&(this._showMore=!0)}else this._setDefaults()}async _fetchOrganizer(t,e){const i=await ie(this.hass,t,e);i&&(this._organizerEntityId=i)}_setDefaults(){this._title="",this._selectedCalendars=new Set,this._originalCalendars=new Set,this._organizerEntityId="",this._applyDates(function(t){const e=new Date(t);e.setMinutes(15*Math.ceil(e.getMinutes()/15),0,0);const i=new Date(e.getTime()+36e5);return{date:Ft(e),allDay:!1,startTime:ye(e),endTime:ye(i),spanDays:1,endDayOffset:Ct(e,i)}}(new Date)),this._description="",this._location=""}get _formDates(){return{date:this._date,allDay:this._allDay,startTime:this._startTime,endTime:this._endTime,spanDays:this._spanDays,endDayOffset:this._endDayOffset}}_applyDates(t){this._date=t.date,this._allDay=t.allDay,this._startTime=t.startTime,this._endTime=t.endTime,this._spanDays=t.spanDays,this._endDayOffset=t.endDayOffset;const[e,i]=t.date.split("-").map(Number);this._pickerYear=e,this._pickerMonth=i-1}_toDateStr(t){return`${t.getFullYear()}-${String(t.getMonth()+1).padStart(2,"0")}-${String(t.getDate()).padStart(2,"0")}`}_renderEndsHint(){const t=this._formDates;if(!(t.allDay?t.spanDays>1:t.endDayOffset>0))return W;const[e,i,s]=function(t){return t.allDay?_e(t.date,Math.max(1,t.spanDays)-1):_e(t.date,t.endDayOffset)}(t).split("-").map(Number),a=new Date(e,i-1,s).toLocaleDateString("en-US",{weekday:"short",month:"short",day:"numeric"});return V`<div class="ends-hint">${t.allDay?`Through ${a} (${t.spanDays} days)`:`Ends ${a}`}</div>`}_formatDateDisplay(){if(!this._date)return"Select a date";const[t,e,i]=this._date.split("-").map(Number);return new Date(t,e-1,i).toLocaleDateString("en-US",{weekday:"short",month:"long",day:"numeric",year:"numeric"})}render(){if(!this.open)return W;const t=this.calendars.filter(t=>!1!==t.visible),e="edit"===this.mode,i=e?"Edit Event":"New Event";return V`
      <div class="pv-overlay" @click=${this._onOverlayClick}>
        <div class="pv-dialog" @click=${t=>t.stopPropagation()}>
          <div class="pv-dialog-header">
            <span class="pv-heading-2">${i}</span>
            <button class="pv-btn-icon" @click=${this._close}>
              <ha-icon icon="mdi:close"></ha-icon>
            </button>
          </div>

          <div class="pv-dialog-body">
            <div class="form-grid">
              ${this._error?V`<div class="error-msg">${this._error}</div>`:W}

              <div class="form-field">
                <input
                  id="title-input"
                  class="pv-input"
                  type="text"
                  placeholder="Event title"
                  .value=${this._title}
                  @input=${t=>this._title=t.target.value}
                />
              </div>

              <div class="form-field">
                <label class="pv-label">${e?"Participants":"Calendars"}</label>
                ${this._removeGuestsHint?V`
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
                `:W}
                <div class="calendar-select">
                  ${t.map(t=>{const i=this._selectedCalendars.has(t.entity_id),s=t.entity_id===this._organizerEntityId,a=e&&s;return V`
                      <div class="cal-option-wrap">
                        ${s&&i?V`<span class="organizer-badge">Organizer</span>`:W}
                        <button
                          class="cal-option ${i?"selected":""} ${a?"locked":""}"
                          style="${i?`background: ${t.color}; --cal-bg: ${t.color}; color: ${Ut(t.color)}`:`--cal-bg: ${t.color}`}"
                          @click=${()=>this._toggleCalendar(t.entity_id)}
                        >
                          <span class="cal-dot" style="background: ${t.color}"></span>
                          ${t.display_name}
                          ${a?V`<ha-icon class="lock-icon" icon="mdi:lock-outline"></ha-icon>`:W}
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
                  @keydown=${t=>{"Enter"!==t.key&&" "!==t.key||(t.preventDefault(),this._allDay=!this._allDay)}}
                ></div>
              </div>

              ${this._allDay?W:V`
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
                    @input=${t=>this._description=t.target.value}
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
              ${this._saving?"Saving...":e?"Save Changes":"Create Event"}
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
    `}_renderDatePickerDropdown(){if(!this._datePickerOpen)return W;const t=this._dateDisplay;if(!t)return W;const e=t.getBoundingClientRect(),i=window.innerHeight-e.bottom-8<330&&e.top>330?e.top-330-4:e.bottom+4;return V`
      <div
        class="date-picker-dropdown"
        style="top: ${i}px; left: ${e.left}px;"
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
          ${ui.map(t=>V`<span class="picker-weekday">${t}</span>`)}
        </div>
        <div class="picker-days">
          ${this._getPickerDays().map(t=>{const e=t.getMonth()!==this._pickerMonth,i=this._toDateStr(t)===this._toDateStr(new Date),s=this._toDateStr(t)===this._date;return V`
              <button
                class="picker-day ${e?"other-month":""} ${i?"today":""} ${s?"selected":""}"
                @click=${()=>this._selectPickerDay(t)}
              >${t.getDate()}</button>
            `})}
        </div>
      </div>
    `}_toggleDatePicker(){if(this._activeTimePicker=null,this._datePickerOpen=!this._datePickerOpen,this._datePickerOpen&&this._date){const[t,e]=this._date.split("-").map(Number);this._pickerYear=t,this._pickerMonth=e-1}}_pickerPrevMonth(){this._pickerMonth--,this._pickerMonth<0&&(this._pickerMonth=11,this._pickerYear--)}_pickerNextMonth(){this._pickerMonth++,this._pickerMonth>11&&(this._pickerMonth=0,this._pickerYear++)}_getPickerDays(){const t=new Date(this._pickerYear,this._pickerMonth,1),e=t.getDay(),i=new Date(t);i.setDate(i.getDate()-e);const s=[];for(let t=0;t<42;t++){const e=new Date(i);e.setDate(e.getDate()+t),s.push(e)}return s}_selectPickerDay(t){this._date=this._toDateStr(t),this._datePickerOpen=!1}_formatTimeForDisplay(t){if(!t)return"Select time";const[e,i]=t.split(":").map(Number);if("24h"===this.timeFormat)return`${String(e).padStart(2,"0")}:${String(i).padStart(2,"0")}`;const s=e>=12?"PM":"AM";return`${e%12||12}:${String(i).padStart(2,"0")} ${s}`}_getTimeSlots(){const t=[];for(let e=0;e<24;e++)for(let i=0;i<60;i+=15)t.push(`${String(e).padStart(2,"0")}:${String(i).padStart(2,"0")}`);return t}_openTimePicker(t){this._datePickerOpen=!1,this._activeTimePicker=this._activeTimePicker===t?null:t,this._activeTimePicker&&this.updateComplete.then(()=>{const t=this.renderRoot.querySelector(".time-picker-dropdown"),e=t?.querySelector(".time-slot.selected");e&&t&&(t.scrollTop=e.offsetTop-t.clientHeight/2+e.clientHeight/2)})}_selectTime(t){if("start"===this._activeTimePicker){const e=function(t,e){const i={...t,startTime:e};if(0===t.endDayOffset&&t.endTime<=e){const[t,s]=e.split(":").map(Number);i.endTime=`${ge((t+1)%24)}:${ge(s)}`,i.endDayOffset=t+1>=24?1:0}else 1===i.endDayOffset&&i.endTime>e&&(i.endDayOffset=0);return i}(this._formDates,t);this._startTime=e.startTime,this._endTime=e.endTime,this._endDayOffset=e.endDayOffset}else{const e=function(t,e){const i={...t,endTime:e};return 1===t.endDayOffset&&e>t.startTime&&(i.endDayOffset=0),i}(this._formDates,t);this._endTime=e.endTime,this._endDayOffset=e.endDayOffset}this._activeTimePicker=null}_renderTimePickerDropdown(){if(!this._activeTimePicker)return W;const t="start"===this._activeTimePicker?this._startTimeEl:this._endTimeEl;if(!t)return W;const e=t.getBoundingClientRect(),i="start"===this._activeTimePicker?this._startTime:this._endTime,s=this._getTimeSlots(),a=window.innerHeight-e.bottom-8<280&&e.top>280?e.top-280-4:e.bottom+4;return V`
      <div
        class="time-picker-dropdown"
        style="top: ${a}px; left: ${e.left}px; width: ${e.width}px;"
      >
        ${s.map(t=>V`
          <div
            class="time-slot ${t===i?"selected":""}"
            @click=${()=>this._selectTime(t)}
          >${this._formatTimeForDisplay(t)}</div>
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
    `}_renderLocationDropdown(){if(!this.locationAutocomplete||!this._locationFocused||!this._locationSuggestions.length&&!this._locationLoading)return W;const t=this._locationInput;if(!t)return W;const e=t.getBoundingClientRect();return V`
      <div
        class="location-suggestions-fixed"
        style="top: ${e.bottom}px; left: ${e.left}px; width: ${e.width}px;"
      >
        ${this._locationLoading?V`
          <div class="location-loading">Searching...</div>
        `:W}
        ${this._locationSuggestions.map(t=>V`
          <div class="location-suggestion" @mousedown=${()=>this._selectLocation(t)}>
            <ha-icon icon="mdi:map-marker"></ha-icon>
            <span>${t}</span>
          </div>
        `)}
        ${this._locationSuggestions.length>0?V`
          <div class="location-powered">Suggestions by Photon &middot; &copy; OpenStreetMap contributors</div>
        `:W}
      </div>
    `}_onLocationInput(t){const e=t.target.value;this._location=e,this._locationSearch.input(e,this.locationAutocomplete)}_selectLocation(t){this._resetLocationSearch(),this._location=t,this._locationFocused=!1}_toggleCalendar(t){if("edit"===this.mode&&t===this._organizerEntityId)return;const e=new Set(this._selectedCalendars);e.has(t)?(e.delete(t),t===this._organizerEntityId&&(this._organizerEntityId=e.size>0?[...e][0]:"")):(e.add(t),this._organizerEntityId||(this._organizerEntityId=t)),this._selectedCalendars=e,this._removeGuestsHint=!1}_onOverlayClick(){this._close()}_close(){this._datePickerOpen=!1,this._activeTimePicker=null,this._resetLocationSearch(),this.store.closeDialog()}async _editFallback(t,e,i){const s=this.prefill?.uid,a=this.prefill?.recurrence_id,r=this.prefill?.calendar_entity_id,n=[...e].filter(t=>!i.has(t)),o=[...i].filter(t=>!e.has(t)),l=[...e].filter(t=>i.has(t));if(r&&l.includes(r)&&s){const e=$e(this.prefill,r,t);await this.store.doEditEvent(this.hass,e.deleteData,e.createData,e.restoreData)}else r&&o.includes(r)&&s&&await te(this.hass,{entity_id:r,uid:s,recurrence_id:a});for(const e of l)if(e!==r){if(s)try{await te(this.hass,{entity_id:e,uid:s,recurrence_id:a})}catch{}await Zt(this.hass,{...t,entity_id:e})}for(const e of n)await Zt(this.hass,{...t,entity_id:e});for(const t of o)if(t!==r&&s)try{await te(this.hass,{entity_id:t,uid:s,recurrence_id:a})}catch{}await ee(this.hass),this.store.selectedEvent=null,this.store.closeDialog()}async _save(){if(!this._title.trim())return void(this._error="Please enter an event title");if(0===this._selectedCalendars.size)return void(this._error="Please select at least one calendar");const t=function(t){if(!bt(t.date))return"Please pick a date";if(t.allDay)return null;if(!me.test(t.startTime)||!me.test(t.endTime))return"Please pick a start and end time";const e=be(t.date,t.startTime);return be(_e(t.date,t.endDayOffset),t.endTime)>e?null:"End time must be after start time"}(this._formDates);if(t)this._error=t;else{this._error="",this._saving=!0;try{const t=function(t,e){const i={summary:e.summary.trim(),...xe(t)},s=e.description?.trim(),a=e.location?.trim();return s&&(i.description=s),a&&(i.location=a),i}(this._formDates,{summary:this._title,description:this._description,location:this._location}),e=this._selectedCalendars,i=this._originalCalendars;if("edit"===this.mode){const s=this.prefill?.uid,a=i.size>1,r=this._organizerEntityId||this.prefill?.calendar_entity_id||"";if(a&&s&&r){const a=[...e];try{await async function(t,e){const i={type:"planavista/update_event",entity_id:e.entity_id,uid:e.uid};return void 0!==e.summary&&(i.summary=e.summary),void 0!==e.description&&(i.description=e.description),void 0!==e.location&&(i.location=e.location),e.start_date_time&&(i.start_date_time=e.start_date_time),e.end_date_time&&(i.end_date_time=e.end_date_time),e.start_date&&(i.start_date=e.start_date),e.end_date&&(i.end_date=e.end_date),e.attendee_entity_ids&&(i.attendee_entity_ids=e.attendee_entity_ids),t.callWS(i)}(this.hass,{entity_id:r,uid:s,summary:t.summary,description:t.description||"",location:t.location||"",start_date_time:t.start_date_time,end_date_time:t.end_date_time,start_date:t.start_date,end_date:t.end_date,attendee_entity_ids:a})}catch(s){console.warn("[PlanaVista] update_event WS failed, falling back to delete+recreate:",s),await this._editFallback(t,e,i)}const n=[...e,...i],o=this.hass;this.store.selectedEvent=null,this.store.closeDialog(),setTimeout(async()=>{try{const t=[...new Set(n)];for(const e of t)await o.callService("homeassistant","update_entity",{entity_id:e});await ee(o)}catch{}},3e3)}else if(e.size>1&&s){const i=this.prefill,s=i.calendar_entity_id,a=r||[...e][0],n=[...e].filter(t=>t!==a);try{await Ce({remove:()=>te(this.hass,we(i,s)),create:()=>Jt(this.hass,{...t,entity_id:a,attendee_entity_ids:n}),restore:()=>Zt(this.hass,ke(i,s))})}catch(t){throw await ee(this.hass).catch(()=>{}),t}const o=[...e],l=this.hass;this.store.selectedEvent=null,this.store.closeDialog(),setTimeout(async()=>{try{for(const t of o)await l.callService("homeassistant","update_entity",{entity_id:t});await ee(l)}catch{}},3e3)}else{const e=this.prefill?.calendar_entity_id||"",i=$e(this.prefill,e,t);await this.store.doEditEvent(this.hass,i.deleteData,i.createData,i.restoreData)}}else{const i=[...e];if(i.length>1){const s=this._organizerEntityId||i[0],a=i.filter(t=>t!==s);await Jt(this.hass,{...t,entity_id:s,attendee_entity_ids:a}),this.store.closeDialog();const r=[...e],n=this.hass;setTimeout(async()=>{try{for(const t of r)await n.callService("homeassistant","update_entity",{entity_id:t});await ee(n)}catch{}},3e3)}else{const e={...t,entity_id:i[0]};await this.store.doCreateEvent(this.hass,e)}}}catch(t){this._error=t instanceof Ee?t.message:`Failed to save event: ${t?.message||"Unknown error"}`,this._saving=!1}}}}vi.styles=[re,oe,ce,de,he,n`
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
    `],t([ut({attribute:!1})],vi.prototype,"hass",void 0),t([ut({type:Array})],vi.prototype,"calendars",void 0),t([ut({type:Boolean})],vi.prototype,"open",void 0),t([ut({type:String})],vi.prototype,"mode",void 0),t([ut({type:Object})],vi.prototype,"prefill",void 0),t([ut({attribute:!1})],vi.prototype,"timeFormat",void 0),t([ut({attribute:!1})],vi.prototype,"locationAutocomplete",void 0),t([vt()],vi.prototype,"_title",void 0),t([vt()],vi.prototype,"_selectedCalendars",void 0),t([vt()],vi.prototype,"_originalCalendars",void 0),t([vt()],vi.prototype,"_organizerEntityId",void 0),t([vt()],vi.prototype,"_date",void 0),t([vt()],vi.prototype,"_startTime",void 0),t([vt()],vi.prototype,"_endTime",void 0),t([vt()],vi.prototype,"_allDay",void 0),t([vt()],vi.prototype,"_spanDays",void 0),t([vt()],vi.prototype,"_endDayOffset",void 0),t([vt()],vi.prototype,"_description",void 0),t([vt()],vi.prototype,"_location",void 0),t([vt()],vi.prototype,"_showMore",void 0),t([vt()],vi.prototype,"_saving",void 0),t([vt()],vi.prototype,"_error",void 0),t([vt()],vi.prototype,"_removeGuestsHint",void 0),t([vt()],vi.prototype,"_datePickerOpen",void 0),t([vt()],vi.prototype,"_pickerMonth",void 0),t([vt()],vi.prototype,"_pickerYear",void 0),t([vt()],vi.prototype,"_activeTimePicker",void 0),t([vt()],vi.prototype,"_locationSuggestions",void 0),t([vt()],vi.prototype,"_locationLoading",void 0),t([vt()],vi.prototype,"_locationFocused",void 0),t([ut({attribute:!1})],vi.prototype,"store",void 0),t([mt("#title-input")],vi.prototype,"_titleInput",void 0),t([mt(".location-input")],vi.prototype,"_locationInput",void 0),t([mt(".date-display")],vi.prototype,"_dateDisplay",void 0),t([mt(".start-time-display")],vi.prototype,"_startTimeEl",void 0),t([mt(".end-time-display")],vi.prototype,"_endTimeEl",void 0),gt("pv-event-create-dialog",vi);class mi extends dt{constructor(){super(...arguments),this.data=null,this.mode="light",this.shape={},this.forecast=[],this.layout="landscape",this._tick=Math.floor(Date.now()/6e4),this._filterOpen=!1,this._refreshing=!1,this._pv=new Se(this),this._overlayOpen=!1,this._tickTimer=null,this._touchStart=null,this._filterCloseHandler=t=>this._onFilterClickOutside(t),this._derive=ve((t,e,i,s)=>function(t,e,i){const s=ze(t,e),a=t?.events||[],r=new Map;for(const t of a){const e=t.uid;if(!e)continue;r.has(e)||r.set(e,[]);const i=r.get(e),a=t.calendar_entity_id;if(!i.some(t=>t.entity_id===a)){const e=s.find(t=>t.entity_id===a);i.push({entity_id:a,calendar_name:t.calendar_name||e?.display_name||"",calendar_color:t.calendar_color||e?.color||"",person_entity:e?.person_entity||""})}}return{calendars:s,visibleEvents:Bt(a,i),sharedEventMap:r}}(Ke(t,s),e,i))}connectedCallback(){super.connectedCallback(),this._tick=Math.floor(Date.now()/6e4),this._scheduleTick()}disconnectedCallback(){super.disconnectedCallback(),this._tickTimer&&(clearTimeout(this._tickTimer),this._tickTimer=null),document.removeEventListener("click",this._filterCloseHandler),this._overlayOpen&&(this._overlayOpen=!1,this._fireOverlay(!1))}updated(t){super.updated(t);const e=this._pv.store,i=!(!e.selectedEvent&&!e.dialogOpen);i!==this._overlayOpen&&(this._overlayOpen=i,this._fireOverlay(i))}_fireOverlay(t){this.dispatchEvent(new CustomEvent("pv-overlay-change",{detail:{open:t},bubbles:!0,composed:!0}))}_scheduleTick(){this._tickTimer&&clearTimeout(this._tickTimer),this._tickTimer=setTimeout(()=>{this._tick=Math.floor(Date.now()/6e4),this._scheduleTick()},6e4-Date.now()%6e4+50)}willUpdate(t){t.has("view")&&this.view&&this._pv.store.setView(this.view)}_derived(){return this._derive(this.data,this.cardConfig,this._pv.store.hiddenCalendars,this.mode)}render(){if(!this.hass||!this.display)return W;const{calendars:t,visibleEvents:e}=this._derived(),i=this._pv.store,s=this.display;return V`
      ${this._renderToolbar(t)}
      <div class="pvc-body"
        @touchstart=${this._onTouchStart}
        @touchend=${this._onTouchEnd}
        @touchcancel=${this._onTouchCancel}
        @event-click=${this._onEventClick}
        @day-click=${this._onDayClick}
        @create-event=${this._onCreateEvent}
      >
        ${this._renderView(i.currentView,e,t,s)}
      </div>

      ${i.selectedEvent?V`
        <pv-event-popup
          .store=${i}
          .hass=${this.hass}
          .event=${i.selectedEvent}
          .timeFormat=${s?.time_format||"12h"}
        ></pv-event-popup>
      `:W}

      ${i.dialogOpen?V`
        <pv-event-create-dialog
          .store=${i}
          .hass=${this.hass}
          .calendars=${t}
          .open=${!0}
          .mode=${i.dialogOpen}
          .prefill=${i.createPrefill}
          .timeFormat=${s?.time_format||"12h"}
          .locationAutocomplete=${!0===s.location_autocomplete}
        ></pv-event-create-dialog>
      `:W}
    `}_renderToolbar(t){const e=t.filter(t=>this._pv.store.hiddenCalendars.has(t.entity_id)).length;return V`
      <div class="pvc-toolbar">
        <div class="pvc-filter-wrap">
          <button
            class="pvc-filter-btn ${e>0?"has-hidden":""}"
            @click=${this._toggleFilterDropdown}
          >
            <ha-icon icon="mdi:filter-variant" style="--mdc-icon-size: 20px"></ha-icon>
            Calendars
            ${e>0?V`<span class="pvc-filter-badge">${t.length-e}/${t.length}</span>`:W}
          </button>

          ${this._filterOpen?V`
            <div class="pvc-filter-panel">
              ${t.map(t=>{const e=!this._pv.store.hiddenCalendars.has(t.entity_id),i=t.person_entity?se(this.hass,t.person_entity):null,s=t.display_name||(t.person_entity?ae(this.hass,t.person_entity):t.entity_id),a=(s||"?")[0].toUpperCase();return V`
                  <div
                    class="pvc-filter-item ${e?"active":""}"
                    style="--item-color: ${t.color}; --item-ink: ${Ut(t.color)}"
                    @click=${()=>this._pv.store.toggleCalendar(t.entity_id)}
                  >
                    <div class="pvc-filter-check">
                      ${e?V`<span class="pvc-filter-check-icon">✓</span>`:W}
                    </div>
                    <div
                      class="pvc-filter-avatar"
                      style="${i?`background-image: url(${i}); background-color: ${t.color}`:`background: ${t.color}`}"
                    >${i?"":a}</div>
                    <span class="pvc-filter-name">${s}</span>
                  </div>
                `})}
            </div>
          `:W}
        </div>

        <!-- Mobile inline calendar chips (shown on xs/sm via CSS) -->
        <div class="pvc-cal-strip">
          ${t.map(t=>{const e=!this._pv.store.hiddenCalendars.has(t.entity_id),i=t.person_entity?se(this.hass,t.person_entity):null,s=t.display_name||(t.person_entity?ae(this.hass,t.person_entity):t.entity_id),a=(s||"?")[0].toUpperCase();return V`
              <button
                class="pvc-cal-chip ${e?"active":""}"
                style="--chip-color: ${t.color}; --chip-ink: ${Ut(t.color)}"
                @click=${()=>this._pv.store.toggleCalendar(t.entity_id)}
              >
                <div
                  class="pvc-cal-chip-avatar"
                  style="${i?`background-image: url(${i}); background-color: ${t.color}`:`background: ${t.color}`}"
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
    `}_toggleFilterDropdown(t){t.stopPropagation(),this._filterOpen=!this._filterOpen,this._filterOpen?requestAnimationFrame(()=>{document.addEventListener("click",this._filterCloseHandler)}):document.removeEventListener("click",this._filterCloseHandler)}_onFilterClickOutside(t){const e=t.composedPath(),i=this.shadowRoot?.querySelector(".pvc-filter-panel"),s=this.shadowRoot?.querySelector(".pvc-filter-btn");i&&!e.includes(i)&&s&&!e.includes(s)&&(this._filterOpen=!1,document.removeEventListener("click",this._filterCloseHandler))}_renderView(t,e,i,s){const a=s?.time_format||"12h",r=s?.first_day||"sunday",n=this._pv.store.currentDate,o=this._pv.store.hiddenCalendars,l=this.shape.avatar_border||"primary",d="stripes"===(this.shape.event_style||"stripes");switch(t){case"day":{const{sharedEventMap:t}=this._derived(),s=this._tick;return V`<pv-view-day
          layout=${this.layout}
          .hass=${this.hass}
          .events=${e}
          .calendars=${i}
          .currentDate=${n}
          .hiddenCalendars=${o}
          .timeFormat=${a}
          .hideColumnHeaders=${!1}
          .avatarBorderMode=${l}
          .sharedEventMap=${t}
          .tick=${s}
        ></pv-view-day>`}case"week":{const t=this._tick;return V`<pv-view-week
          layout=${this.layout}
          .hass=${this.hass}
          .events=${e}
          .calendars=${i}
          .currentDate=${n}
          .hiddenCalendars=${o}
          .timeFormat=${a}
          .firstDay=${r}
          .forecast=${this.forecast}
          .showStripes=${d}
          .tick=${t}
        ></pv-view-week>`}case"month":{const t=this._tick;return V`<pv-view-month
          layout=${this.layout}
          .hass=${this.hass}
          .events=${e}
          .calendars=${i}
          .currentDate=${n}
          .hiddenCalendars=${o}
          .firstDay=${r}
          .timeFormat=${a}
          .showStripes=${d}
          .tick=${t}
        ></pv-view-month>`}case"agenda":{const t=this._tick;return V`<pv-view-agenda
          layout=${this.layout}
          .hass=${this.hass}
          .events=${e}
          .calendars=${i}
          .currentDate=${n}
          .hiddenCalendars=${o}
          .timeFormat=${a}
          .forecast=${this.forecast}
          .showStripes=${d}
          .tick=${t}
        ></pv-view-agenda>`}default:return W}}_onEventClick(t){const e=t.detail.event;if(e.uid){const t=(Ke(this.data,this.mode)?.events||[]).filter(t=>t.uid===e.uid&&""!==t.uid),i=new Set,s=t.filter(t=>!i.has(t.calendar_entity_id)&&(i.add(t.calendar_entity_id),!0));if(s.length>1){const t={...e,shared_calendars:s.map(t=>({entity_id:t.calendar_entity_id,calendar_name:t.calendar_name,calendar_color:t.calendar_color}))};return void this._pv.store.selectEvent(t)}}this._pv.store.selectEvent(e)}_onCreateEvent(t){const e=t.detail?.date,i={};if(e){const t=e.getFullYear(),s=String(e.getMonth()+1).padStart(2,"0"),a=String(e.getDate()).padStart(2,"0");i.start=`${t}-${s}-${a}T09:00:00`,i.end=`${t}-${s}-${a}T10:00:00`}this._pv.store.openCreateDialog(i)}_onDayClick(t){this._pv.store.setDate(t.detail.date),this.dispatchEvent(new CustomEvent("pv-view-change",{detail:{view:"day"},bubbles:!0,composed:!0}))}_onTouchStart(t){this._touchStart=1===t.touches.length?{x:t.touches[0].clientX,y:t.touches[0].clientY}:null}_onTouchEnd(t){const e=this._touchStart;if(this._touchStart=null,!e||t.touches.length>0||1!==t.changedTouches.length)return;const i=t.changedTouches[0],s=(a=i.clientX-e.x,r=i.clientY-e.y,Math.abs(a)<=50||Math.abs(a)<=2*Math.abs(r)?null:a>0?"prev":"next");var a,r;s&&this._pv.store.navigateDate(s)}_onTouchCancel(){this._touchStart=null}async _refreshCalendars(){if(!this._refreshing){this._refreshing=!0;try{for(const t of this.data?.calendars||[])t.entity_id&&await this.hass.callService("homeassistant","update_entity",{entity_id:t.entity_id});await this.hass.callService("homeassistant","update_entity",{entity_id:this.cardConfig?.entity||"sensor.planavista_config"})}catch{}setTimeout(()=>{this._refreshing=!1},800)}}}mi.styles=[re,oe,ne,he,n`
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
    `],t([ut({attribute:!1})],mi.prototype,"hass",void 0),t([ut({attribute:!1})],mi.prototype,"cardConfig",void 0),t([ut({attribute:!1})],mi.prototype,"data",void 0),t([ut({attribute:!1})],mi.prototype,"display",void 0),t([ut({attribute:!1})],mi.prototype,"mode",void 0),t([ut({attribute:!1})],mi.prototype,"shape",void 0),t([ut({attribute:!1})],mi.prototype,"forecast",void 0),t([ut({attribute:!1})],mi.prototype,"view",void 0),t([ut({type:String,reflect:!0})],mi.prototype,"layout",void 0),t([vt()],mi.prototype,"_tick",void 0),t([vt()],mi.prototype,"_filterOpen",void 0),t([vt()],mi.prototype,"_refreshing",void 0),gt("pv-calendar-module",mi);const gi=n`
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
`;class yi{constructor(t){this._onView=t,this._unsub=null,this._generation=0,this._attempt=0,this._hadView=!1,this._onReady=()=>{this._connection&&(this._generation++,this._unsub=null,this._cancelRetry(),this._subscribe())}}update(t){t!==this._connection&&(this.stop(),this._connection=t,t&&(t.addEventListener("ready",this._onReady),this._subscribe()))}stop(){if(this._generation++,this._cancelRetry(),this._connection?.removeEventListener("ready",this._onReady),this._connection=void 0,this._hadView=!1,this._unsub){const t=this._unsub;this._unsub=null,Je(t)}}_subscribe(){const t=this._connection;if(!t)return;const e=this._generation;t.subscribeMessage(t=>{e===this._generation&&(this._hadView=!0,this._onView(t))},{type:"planavista/household/subscribe"},{resubscribe:!1}).then(t=>{e===this._generation?(this._unsub=t,this._attempt=0):Je(t)}).catch(()=>{e===this._generation&&(this._hadView||this._onView(null),this._retry=setTimeout(()=>{this._retry=void 0,e===this._generation&&this._subscribe()},ti(this._attempt++)))})}_cancelRetry(){void 0!==this._retry&&clearTimeout(this._retry),this._retry=void 0,this._attempt=0}}class fi{constructor(t,e,i){this._ws=t,this._session=e,this._onSessionEnded=i}_call(t,e,i=!0){const s={type:t,...e},a=i?this._session():null;return a?(s.session=a,this._ws.callWS(s).catch(t=>{throw"parent_mode_required"===_i(t)&&this._onSessionEnded?.(a),t})):this._ws.callWS(s)}saveMember(t,e){const i={member:t};return e&&Object.assign(i,{member_id:e.id,rev:e.rev}),this._call("planavista/household/member/save",i)}deleteMember(t){return this._call("planavista/household/member/delete",{member_id:t})}reorder(t){return this._call("planavista/household/member/reorder",{order:t})}setSharedScreen(t){return this._call("planavista/household/shared_screen",{shared:t})}saveSecurity(t){return this._call("planavista/household/settings/save",t)}saveSetup(t){return this._call("planavista/household/setup/save",t)}saveConfig(t){return this._call("planavista/config/save",t)}unlock(t,e){return this._call("planavista/pin/unlock",{member_id:t,pin:e},!1)}setPin(t,e){return this._call("planavista/pin/set",{member_id:t,pin:e})}clearPin(t){return this._call("planavista/pin/clear",{member_id:t})}clearPause(t){return this._call("planavista/pin/clear_lockout",{member_id:t})}lock(t){return this._call("planavista/pin/lock",{session:t},!1)}touch(t){return this._call("planavista/pin/touch",{session:t},!1)}}function _i(t){return t&&"object"==typeof t&&"string"==typeof t.code?t.code:"unknown"}const bi="pv-push-page",xi="pv-pop-page",wi="pv-page-error";function ki(t){switch(t){case"parent_mode_required":return"Parent mode ended. Enter a parent's PIN to keep changing settings.";case"not_allowed":return"Only a parent can change this.";case"unavailable":return"Update PlanaVista to change people and PINs.";default:return"Couldn't save. Check the connection and try again."}}class $i extends dt{constructor(){super(...arguments),this.household=null,this.layout="landscape",this.mode="settings",this._loaded=!1}willUpdate(){!this._loaded&&this.data?.display&&(this._draft={...this.data.display},this._loaded=!0)}_apply(t){this._draft={...this._draft,...t},this.api.saveConfig({display:t}).catch(t=>this._error(t))}_error(t){this.dispatchEvent(new CustomEvent(wi,{detail:{message:ki(_i(t))},bubbles:!0,composed:!0}))}get _weatherEntities(){return this.hass?Object.keys(this.hass.states).filter(t=>t.startsWith("weather.")).sort():[]}_entityLabel(t){return this.hass?.states[t]?.attributes?.friendly_name||t}_toggleLocationAutocomplete(){this._apply({location_autocomplete:!this._draft.location_autocomplete})}_renderPreferences(){return V`
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
            @change=${t=>{this._apply({weather_entity:t.target.value})}}
          >
            <option value="">(None)</option>
            ${this._weatherEntities.map(t=>V`
              <option value="${t}" ?selected=${this._draft.weather_entity===t}>${this._entityLabel(t)}</option>
            `)}
          </select>
        </div>

        <!-- Default View -->
        <div class="field-group">
          <label class="pv-label">Default View</label>
          <div class="view-grid" role="group" aria-label="Default calendar view">
            ${[{key:"day",label:"Day",icon:"M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V9h14v11zm-7-7c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"},{key:"week",label:"Week",icon:"M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zM7 12h2v6H7zm4 0h2v6h-2zm4 0h2v6h-2z"},{key:"month",label:"Month",icon:"M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zM9 14H7v-2h2v2zm4 0h-2v-2h2v2zm4 0h-2v-2h2v2zm-8 4H7v-2h2v2zm4 0h-2v-2h2v2zm4 0h-2v-2h2v2z"},{key:"agenda",label:"Agenda",icon:"M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zM7 7v2h14V7H7z"}].map(t=>V`
              <button
                class="view-card ${this._draft.default_view===t.key?"view-card--active":""}"
                type="button"
                aria-pressed="${this._draft.default_view===t.key}"
                @click=${()=>{this._apply({default_view:t.key})}}
              >
                <svg class="view-icon" viewBox="0 0 24 24" width="24" height="24">
                  <path d="${t.icon}" />
                </svg>
                <span class="view-label">${t.label}</span>
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
              @keydown=${t=>{"Enter"!==t.key&&" "!==t.key||(t.preventDefault(),this._toggleLocationAutocomplete())}}
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
    `}render(){return this._loaded?this._renderPreferences():W}}$i.styles=[re,oe,ce,he,gi,n`
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
    `],t([ut({attribute:!1})],$i.prototype,"hass",void 0),t([ut({attribute:!1})],$i.prototype,"data",void 0),t([ut({attribute:!1})],$i.prototype,"household",void 0),t([ut({attribute:!1})],$i.prototype,"api",void 0),t([ut({attribute:!1})],$i.prototype,"layout",void 0),t([ut({type:String})],$i.prototype,"mode",void 0),t([vt()],$i.prototype,"_draft",void 0),gt("pv-calendar-options-page",$i);const Ei={young_child:"Young child",older_child:"Older child",teen:"Teen",adult:"Adult"},Fi=[{id:"young_child",label:"Young child",hint:"About 4 to 8"},{id:"older_child",label:"Older child",hint:"About 9 to 12"},{id:"teen",label:"Teen",hint:""},{id:"adult",label:"Adult",hint:""}],Ci=[{id:"parent",label:"Parent"},{id:"adult",label:"Adult"},{id:"teen",label:"Teen"},{id:"older_child",label:"Older child"},{id:"young_child",label:"Young child"}];function Di(t){return t.parent?"parent":t.age_group}function Si(t){return"parent"===t?{age_group:"adult",parent:!0}:{age_group:t,parent:!1}}function Ai(t){return[...t].sort((t,e)=>t.order-e.order||t.id.localeCompare(e.id))}function zi(t){const e=[...t.trim()][0];return e?e.toLocaleUpperCase():"?"}function Mi(t){return Ai(t).filter(t=>t.parent&&t.has_pin)}function Pi(t,e){return e.filter(e=>e.member_id===t)}function Ti(t,e){const i=new Map;for(const s of t)s.id!==e&&i.set(s.color.toUpperCase(),s);return i}class Bi extends dt{constructor(){super(...arguments),this.value="",this.valueLight="",this._isCustom=!1}updated(t){if(super.updated(t),t.has("value")&&this.value){const t=Bi.PRESETS.some(t=>t.color.toLowerCase()===this.value.toLowerCase());this._isCustom=!t}}_selectPreset(t){this._isCustom=!1,this._emit(t.color,t.light)}_openCustomPicker(){this._colorInput?.click()}_onCustomColorChange(t){const e=t.target.value,i=function(t){let e=t.replace("#","");if(3===e.length&&(e=e.split("").map(t=>t+t).join("")),6!==e.length)return t;const i=parseInt(e.substring(0,2),16),s=parseInt(e.substring(2,4),16),a=parseInt(e.substring(4,6),16);if(isNaN(i)||isNaN(s)||isNaN(a))return t;const r=Math.round(i+.65*(255-i)),n=Math.round(s+.65*(255-s)),o=Math.round(a+.65*(255-a)),l=t=>t.toString(16).padStart(2,"0");return`#${l(r)}${l(n)}${l(o)}`}(e);this._isCustom=!0,this._emit(e,i)}_emit(t,e){this.value=t,this.valueLight=e,this.dispatchEvent(new CustomEvent("color-change",{detail:{color:t,colorLight:e},bubbles:!0,composed:!0}))}_isSelected(t){return this.value.toLowerCase()===t.toLowerCase()}render(){const t=Bi.PRESETS,e=this._isCustom?this.value:"",i=this._isCustom&&!!this.value;return V`
      <div class="swatch-grid" role="group" aria-label="Color presets">
        ${t.map(t=>{const e=this._isSelected(t.color);return V`
            <button
              class="swatch-btn"
              type="button"
              title="${t.name}"
              aria-label="${t.name}${e?" (selected)":""}"
              aria-pressed="${e}"
              style="--swatch-color: ${t.color}"
              @click=${()=>this._selectPreset(t)}
            >
              <div
                class="swatch-circle"
                style="background-color: ${t.color}"
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
          style="--swatch-color: ${e||"var(--pv-accent, #6366F1)"}"
          @click=${this._openCustomPicker}
        >
          <div
            class="custom-circle ${e?"has-color":""}"
            style="${e?`background-color: ${e}`:""}"
          >
            ${e?"":V`<span aria-hidden="true">+</span>`}
          </div>
        </button>

        <!-- Hidden native color input -->
        <input
          id="custom-color-input"
          type="color"
          .value=${e||"#4A90D9"}
          tabindex="-1"
          aria-hidden="true"
          @change=${this._onCustomColorChange}
          @input=${this._onCustomColorChange}
        />
      </div>
    `}}Bi.PRESETS=[{name:"Ink Black",color:"#001219",light:"#A6ACAF"},{name:"Dark Teal",color:"#005F73",light:"#A6C7CE"},{name:"Dark Cyan",color:"#0A9396",light:"#A9D9DA"},{name:"Pearl Aqua",color:"#94D2BD",light:"#DAEFE8"},{name:"Wheat",color:"#E9D8A6",light:"#F7F1E0"},{name:"Golden Orange",color:"#EE9B00",light:"#F9DCA6"},{name:"Burnt Caramel",color:"#CA6702",light:"#ECCAA6"},{name:"Rusty Spice",color:"#BB3E03",light:"#E7BBA7"},{name:"Oxidized Iron",color:"#AE2012",light:"#E3B1AC"},{name:"Brown Red",color:"#9B2226",light:"#DCB2B3"},{name:"Strawberry Red",color:"#F94144",light:"#FDBDBE"},{name:"Pumpkin Spice",color:"#F3722C",light:"#FBCEB5"},{name:"Carrot Orange",color:"#F8961E",light:"#FDDAB0"},{name:"Atomic Tangerine",color:"#F9844A",light:"#FDD4C0"},{name:"Tuscan Sun",color:"#F9C74F",light:"#FDEBC1"},{name:"Willow Green",color:"#90BE6D",light:"#D8E8CC"},{name:"Seaweed",color:"#43AA8B",light:"#BDE1D6"},{name:"Ocean Cyan",color:"#4D908E",light:"#C1D8D7"},{name:"Blue Slate",color:"#577590",light:"#C4CFD8"},{name:"Cerulean",color:"#277DA1",light:"#B3D2DE"}],Bi.styles=[re,n`
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
    `],t([ut({type:String})],Bi.prototype,"value",void 0),t([ut({type:String})],Bi.prototype,"valueLight",void 0),t([vt()],Bi.prototype,"_isCustom",void 0),t([mt("#custom-color-input")],Bi.prototype,"_colorInput",void 0),gt("pv-color-swatch-picker",Bi);const Oi=new Set(["state","attributes"]);class Ii extends dt{constructor(){super(...arguments),this.household=null,this.layout="landscape",this.mode="settings",this._rows=[],this._dragIdx=null,this._dragOverIdx=null,this._built=!1}willUpdate(){if(!this._built&&this.hass&&this.data){const t=Object.keys(this.hass.states).filter(t=>t.startsWith("calendar."));this._rows=function(t,e,i,s){const a=[],r=new Set;for(const e of t){const t=s[a.length%s.length];r.add(e.entity_id),a.push({saved:Object.fromEntries(Object.entries(e).filter(([t])=>!Oi.has(t))),entity_id:e.entity_id,display_name:e.display_name||e.entity_id,color:e.color||t.color,color_light:e.color_light||t.light,person_entity:e.person_entity||"",member_id:e.member_id??null,include:!0})}for(const t of e.filter(t=>!r.has(t)).sort()){const e=s[a.length%s.length];a.push({saved:null,entity_id:t,display_name:i(t)||t,color:e.color,color_light:e.light,person_entity:"",member_id:null,include:!1})}return a}(this.data.calendars,t,t=>this.hass.states[t]?.attributes?.friendly_name,Bi.PRESETS),this._built=!0}}_save(){var t;this.api.saveConfig({calendars:(t=this._rows,t.filter(t=>t.include).map(t=>({icon:"mdi:calendar",visible:!0,...t.saved??{},entity_id:t.entity_id,display_name:t.display_name,color:t.color,color_light:t.color_light,person_entity:t.person_entity,member_id:t.member_id})))}).catch(t=>this._error(t))}_error(t){this.dispatchEvent(new CustomEvent(wi,{detail:{message:ki(_i(t))},bubbles:!0,composed:!0}))}get _personEntities(){return this.hass?Object.keys(this.hass.states).filter(t=>t.startsWith("person.")).sort():[]}_personLabel(t){return this._entityLabel(t)}_entityLabel(t){return this.hass?.states[t]?.attributes?.friendly_name||t}_updateCalendar(t,e,i=!0){const s=[...this._rows];s[t]={...s[t],...e},this._rows=s,i&&this._save()}_onCalendarColorChange(t,e){e.stopPropagation(),this._updateCalendar(t,{color:e.detail.color,color_light:e.detail.colorLight})}_renderCalendars(){return 0===this._rows.length?V`
        <div class="page-content">
          <p class="page-subtitle">No calendar entities found in Home Assistant.</p>
          <p class="empty-hint">Add calendar integrations (Google Calendar, CalDAV, etc.) and re-run setup.</p>
        </div>
      `:V`
      <div class="page-content">
        <div class="calendar-list">
          ${this._rows.map((t,e)=>this._renderCalendarRow(t,e))}
        </div>
      </div>
    `}_onDragStart(t,e){this._dragIdx=t,e.dataTransfer&&(e.dataTransfer.effectAllowed="move",e.dataTransfer.setData("text/plain",String(t)))}_onDragOver(t,e){e.preventDefault(),e.dataTransfer&&(e.dataTransfer.dropEffect="move"),this._dragOverIdx=t}_onDragLeave(){this._dragOverIdx=null}_onDrop(t,e){if(e.preventDefault(),null!==this._dragIdx&&this._dragIdx!==t){const e=[...this._rows],[i]=e.splice(this._dragIdx,1);e.splice(t,0,i),this._rows=e,this._save()}this._dragIdx=null,this._dragOverIdx=null}_onDragEnd(){this._dragIdx=null,this._dragOverIdx=null}_renderCalendarRow(t,e){const i=this._dragIdx===e,s=this._dragOverIdx===e&&this._dragIdx!==e;return V`
      <div class="cal-row ${i?"cal-row--dragging":""} ${s?"cal-row--dragover":""}"
        draggable="true"
        @dragstart=${t=>this._onDragStart(e,t)}
        @dragover=${t=>this._onDragOver(e,t)}
        @dragleave=${this._onDragLeave}
        @drop=${t=>this._onDrop(e,t)}
        @dragend=${this._onDragEnd}
      >
        <!-- Always-visible header: checkbox + calendar name -->
        <div class="cal-header">
          <div class="cal-drag-handle" aria-label="Drag to reorder">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
              <path d="M11 18c0 1.1-.9 2-2 2s-2-.9-2-2 .9-2 2-2 2 .9 2 2zm-2-8c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0-6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm6 4c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
            </svg>
          </div>
          <label class="cal-checkbox-wrap" title="${t.include?"Exclude this calendar":"Include this calendar"}">
            <input
              type="checkbox"
              class="cal-checkbox"
              .checked=${t.include}
              @change=${t=>this._updateCalendar(e,{include:t.target.checked})}
            />
            <span class="cal-checkbox-visual" aria-hidden="true">
              ${t.include?V`
                <svg viewBox="0 0 24 24" width="14" height="14">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" fill="currentColor"/>
                </svg>
              `:""}
            </span>
          </label>
          <div class="cal-header-info">
            <span class="cal-friendly-name">${t.display_name||t.entity_id}</span>
            <span class="cal-entity-id">${t.entity_id}</span>
          </div>
        </div>

        <!-- Expandable details: only shown when included -->
        ${t.include?V`
          <div class="cal-details">
            <!-- Display name input -->
            <div class="cal-field">
              <label class="pv-label" for="cal-name-${e}">Display Name</label>
              <input
                id="cal-name-${e}"
                type="text"
                class="pv-input cal-name-input"
                .value=${t.display_name}
                placeholder="Calendar name"
                @input=${t=>this._updateCalendar(e,{display_name:t.target.value},!1)}
                @change=${()=>this._save()}
              />
            </div>

            <!-- Color picker -->
            <div class="cal-field">
              <label class="pv-label">Color</label>
              <pv-color-swatch-picker
                .value=${t.color}
                .valueLight=${t.color_light}
                @color-change=${t=>this._onCalendarColorChange(e,t)}
              ></pv-color-swatch-picker>
            </div>

            <!-- Person entity link -->
            <div class="cal-field">
              <label class="pv-label" for="cal-person-${e}">Link to Person</label>
              <select
                id="cal-person-${e}"
                class="pv-input pv-select cal-person-select"
                .value=${t.person_entity}
                @change=${t=>this._updateCalendar(e,{person_entity:t.target.value})}
              >
                <option value="">(None)</option>
                ${this._personEntities.map(e=>V`
                  <option value="${e}" ?selected=${t.person_entity===e}>${this._personLabel(e)}</option>
                `)}
              </select>
            </div>

            ${this._renderBelongsTo(t,e)}
          </div>
        `:""}
      </div>
    `}_renderBelongsTo(t,e){if(!this.household?.available)return W;const i=Ai(this.household.members),s=function(t,e){if(t.person_entity){const i=e.find(e=>e.person===t.person_entity);if(i)return{memberId:i.id,viaPerson:!0}}const i=e.some(e=>e.id===t.member_id)?t.member_id:null;return{memberId:i,viaPerson:!1}}(t,i);return V`
      <div class="cal-field">
        <label class="pv-label" for="cal-owner-${e}">Belongs to</label>
        <select
          id="cal-owner-${e}"
          class="pv-input pv-select cal-person-select"
          .value=${s.memberId??""}
          ?disabled=${s.viaPerson}
          @change=${t=>this._updateCalendar(e,{member_id:t.target.value||null})}
        >
          <option value="">Nobody</option>
          ${i.map(t=>V`
            <option value="${t.id}" ?selected=${s.memberId===t.id}>${t.name}</option>
          `)}
        </select>
        ${s.viaPerson?V`
          <p class="cal-owner-hint">Through ${this._personLabel(t.person_entity)}'s Home Assistant person.</p>
        `:W}
      </div>
    `}render(){return this._built?this._renderCalendars():W}}function Li(t,e){const i=t.initialView?.(e);return t.views.some(t=>t.id===i)?i:t.views[0]?.id??""}function Ri(t,e){return t.order-e.order||t.id.localeCompare(e.id)}Ii.styles=[re,oe,ce,he,gi,n`
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
    `],t([ut({attribute:!1})],Ii.prototype,"hass",void 0),t([ut({attribute:!1})],Ii.prototype,"data",void 0),t([ut({attribute:!1})],Ii.prototype,"household",void 0),t([ut({attribute:!1})],Ii.prototype,"api",void 0),t([ut({attribute:!1})],Ii.prototype,"layout",void 0),t([ut({type:String})],Ii.prototype,"mode",void 0),t([vt()],Ii.prototype,"_rows",void 0),t([vt()],Ii.prototype,"_dragIdx",void 0),t([vt()],Ii.prototype,"_dragOverIdx",void 0),gt("pv-calendar-calendars-page",Ii);const Hi=new class{constructor(){this._modules=new Map}register(t){this._modules.set(t.id,t)}get(t){return this._modules.get(t)}list(){return[...this._modules.values()].sort(Ri)}};class Ni{constructor(){this._pages=new Map}register(t){this._pages.set(t.id,t)}pages(t){return[...this._pages.values()].filter(e=>!e.applies||e.applies(t)).sort((t,e)=>t.order-e.order||t.id.localeCompare(e.id))}}const ji=[{id:"people",label:null,order:100},{id:"chores",label:"Chores",order:200},{id:"calendar",label:"Calendar",order:300},{id:"appearance",label:null,order:400},{id:"security",label:null,order:500},{id:"data",label:null,order:600},{id:"about",label:null,order:900}],Ui=new Ni,Vi=new Ni,qi={id:"calendar",label:"Calendar",icon:"mdi:calendar-month",tag:"pv-calendar-module",order:10,views:[{id:"day",label:"Day"},{id:"week",label:"Week"},{id:"month",label:"Month"},{id:"agenda",label:"Agenda"}],initialView:({config:t,data:e})=>function(t,e){return t?.view||t?.default_view||e?.display?.default_view||void 0}(t,e),watchedEntities:({config:t,data:e})=>ze(e,t).map(t=>t.person_entity).filter(t=>!!t)},Yi={day:"Day",week:"Week",month:"Month",agenda:"Agenda"},Wi=[{id:"calendars",label:"Calendars",group:"calendar",order:300,tag:"pv-calendar-calendars-page",summary:({data:t})=>{const e=t.calendars?.length??0;return 0===e?"None yet":`${e} ${1===e?"calendar":"calendars"}`}},{id:"calendar-options",label:"Calendar options",group:"calendar",order:310,tag:"pv-calendar-options-page",summary:({data:t})=>`${Yi[t.display?.default_view??"week"]??"Week"} · ${"24h"===t.display?.time_format?"24-hour":"12-hour"}`}],Ki=[{id:"calendars",label:"Calendars",order:200,tag:"pv-calendar-calendars-page",heading:"Calendars",lead:"Choose the calendars to show, and who each one belongs to."}];!function(t=Hi){t.register(qi)}(),function(t=Ui,e=Vi){for(const e of Wi)t.register(e);for(const t of Ki)e.register(t)}();const Gi=Symbol.for(""),Xi=t=>{if(t?.r===Gi)return t?._$litStatic$},Qi=t=>({_$litStatic$:t,r:Gi}),Zi=new Map,Ji=(t=>(e,...i)=>{const s=i.length;let a,r;const n=[],o=[];let l,d=0,c=!1;for(;d<s;){for(l=e[d];d<s&&void 0!==(r=i[d],a=Xi(r));)l+=a+e[++d],c=!0;d!==s&&o.push(r),n.push(l),d++}if(d===s&&n.push(e[s]),c){const t=n.join("$$lit$$");void 0===(e=Zi.get(t))&&(n.raw=n,Zi.set(t,e=n)),i=o}return t(e,...i)})(V);function ts(t,e){if(t===e)return!0;if(!t||!e||"object"!=typeof t||"object"!=typeof e)return!1;const i=Object.keys(t),s=Object.keys(e);return i.length===s.length&&i.every(i=>ts(t[i],e[i]))}class es{constructor(t=()=>{}){this._changed=t,this._pending={},this._unsent={},this._send=null,this._onError=null,this._tap=null,this._listeners=new Set}subscribe(t){return this._listeners.add(t),()=>{this._listeners.delete(t)}}_notify(){this._changed();for(const t of this._listeners)t()}current(t){return{...t,...this._pending}}reconcile(t){for(const e of Object.keys(this._pending))!(e in this._unsent)&&ts(t[e],this._pending[e])&&delete this._pending[e]}set(t,e,i,s){Object.assign(this._pending,t),Object.assign(this._unsent,t),this._send=e,this._onError=i,s&&(this._tap={...s,at:Date.now()}),clearTimeout(this._timer),this._timer=setTimeout(()=>this.flush(),400),this._notify()}takeTap(t=Date.now()){const e=this._tap;return this._tap=null,e&&t-e.at<=3e3?{x:e.x,y:e.y}:null}flush(){clearTimeout(this._timer),this._timer=void 0;const t=this._unsent,e=this._send;if(!e||0===Object.keys(t).length)return;this._unsent={};const i=this._onError,s=()=>{for(const e of Object.keys(t))!(e in this._unsent)&&ts(this._pending[e],t[e])&&delete this._pending[e];this._notify()};e(t).then(()=>setTimeout(s,5e3),t=>{s(),i?.(t)})}}function is(t){const e=t?.["sun.sun"];if(!e)return null;const i=t=>{const i=e.attributes?.[t];return"string"==typeof i?i:void 0};return{state:e.state,next_rising:i("next_rising"),next_setting:i("next_setting")}}function ss(t){const e="automatic"===t.appearance;return{entities:e&&"sun"===t.appearance_switch?["sun.sun"]:[],haDarkMode:e&&"home_assistant"===t.appearance_switch}}const as=["light","dark","automatic"],rs=["sun","schedule","home_assistant"],ns=["planavista","minimal","vibrant"],os=["device","full","reduced"],ls={light:"Light",dark:"Dark",automatic:"Automatic"},ds={planavista:"PlanaVista",minimal:"Minimal",vibrant:"Vibrant"},cs={sun:"At sunset and sunrise",schedule:"On a schedule",home_assistant:"Match Home Assistant"},ps={device:"Follow the device",full:"Full",reduced:"Reduced"},hs=/^([01]\d|2[0-3]):([0-5]\d)$/,us={planavista:["planavista","light"],light:["planavista","light"],dark:["planavista","dark"],minimal:["minimal","light"],modern:["vibrant","light"],vibrant:["vibrant","light"]};function vs(t,e,i){return e.includes(t)?t:i}function ms(t,e){return"string"==typeof t&&hs.test(t)?t:e}function gs(t){return t&&"object"==typeof t&&!Array.isArray(t)?{...t}:null}function ys(t){const e={};for(const i of["corner_style","shadow_depth","event_style","avatar_border"])t[i]&&(e[i]=t[i]);return"light"===e.avatar_border&&(e.avatar_border="white"),e}function fs(t){const e=t??{},i="string"==typeof e.theme&&e.theme?e.theme:"planavista",[s,a]=us[i]??us.planavista,r=gs(e.theme_overrides)??{},n=function(t){const e={};for(const i of["accent","background","now_color"])t[i]&&(e[i]=t[i]);const i=t.header_style;return"custom"===i?t.header_custom&&(e.header=t.header_custom):i&&(e.header=i),e}(r),o=gs(e.colors_light),l=gs(e.colors_dark),d=gs(e.shape);return{appearance:vs(e.appearance,as,a),appearance_switch:vs(e.appearance_switch,rs,"sun"),light_from:ms(e.light_from,"07:00"),dark_from:ms(e.dark_from,"21:00"),theme_pair:vs(e.theme_pair,ns,s),colors_light:o??("dark"===i?{}:n),colors_dark:l??("dark"===i?n:{}),shape:d??ys(r),motion:vs(e.motion,os,"device")}}function _s(t){return{pair:t.theme_pair,light:t.colors_light,dark:t.colors_dark,shape:t.shape}}function bs(t){const e=hs.exec(t);return e?60*Number(e[1])+Number(e[2]):0}function xs(t,e){const i=new Date(t);return i.setHours(Math.floor(e/60),e%60,0,0),i.getTime()<=t.getTime()&&(i.setDate(i.getDate()+1),i.setHours(Math.floor(e/60),e%60,0,0)),i}function ws(t,e){const i=bs(t.light_from),s=bs(t.dark_from);if(i===s)return{mode:"light",next:null};const a=60*e.getHours()+e.getMinutes(),r=i<s?a>=i&&a<s:a>=i||a<s;return{mode:r?"light":"dark",next:xs(e,r?s:i)}}function ks(t,e){const i=t?new Date(t):null;return i&&!Number.isNaN(i.getTime())&&i.getTime()>e.getTime()?i:null}function $s(t){const e=t?new Date(t).getTime():Number.NaN;return Number.isNaN(e)?null:e}function Es(t,e){const i="above_horizon"===t.state,s=e.getTime(),a=$s(i?t.next_setting:t.next_rising),r=$s(i?t.next_rising:t.next_setting),[n,o]=i?["light","dark"]:["dark","light"];return null===a||a>s?{mode:n,next:null===a?null:new Date(a)}:null===r||r>s?{mode:o,next:null===r?null:new Date(r)}:{mode:n,next:null}}function Fs(t,e){const i=String(t.getMinutes()).padStart(2,"0");return"24h"===e?`${String(t.getHours()).padStart(2,"0")}:${i}`:`${t.getHours()%12||12}:${i} ${t.getHours()>=12?"PM":"AM"}`}function Cs(t,e,i=50){const s=Math.min(.999,Math.max(.05,e)),a=2*Math.PI/t,r=a*Math.sqrt(1-s*s),n=Math.log(1e3)/(s*a),o=[];for(let t=0;t<i;t++){const e=n*t/i,l=1-Math.exp(-s*a*e)*(Math.cos(r*e)+s*a/r*Math.sin(r*e));o.push(l.toFixed(4))}return o.push("1"),{easing:`linear(${o.join(", ")})`,duration:Math.round(1e3*n)}}const Ds=Cs(.5,.86),Ss=Cs(.45,.55);function As(t,e=function(){return"undefined"!=typeof CSS&&"function"==typeof CSS.supports&&CSS.supports("animation-timing-function","linear(0, 1)")}()){return e?t:{easing:"cubic-bezier(0.2, 0.8, 0.2, 1)",duration:t.duration}}Cs(.6,.9);const zs="planavista-page-styles",Ms="planavista-transition-styles";function Ps(t,e=document){let i=e.getElementById(Ms);t?(i||(i=e.createElement("style"),i.id=Ms,e.head.appendChild(i)),i.textContent=t):i?.remove()}let Ts=null,Bs=!1;const Os="root";function Is(t=document){return"function"==typeof t.startViewTransition}const Ls=["pointerdown","keydown","wheel"],Rs={capture:!0,passive:!0};class Hs{constructor(t,e,i,s){this._host=t,this._edits=e,this._source=i,this._settled=s,this.mode="light",this.motion="full",this.settings=fs(void 0),this.look=_s(this.settings),this.sunMissing=!1,this._shown=null,this._lastInteraction=0,this._quietUntil=Number.POSITIVE_INFINITY,this._changing=!1,this._wakeUntil=0,this._onInteraction=()=>{this._lastInteraction=Date.now()},this._onVisibility=()=>{"visible"===document.visibilityState&&(this._wakeUntil=Date.now()+15e3,this._host.requestUpdate())},this._onReducedChange=()=>{this._host.requestUpdate()},t.addController(this)}hostConnected(){for(const t of Ls)document.addEventListener(t,this._onInteraction,Rs);document.addEventListener("visibilitychange",this._onVisibility),this._reduced="function"==typeof matchMedia?matchMedia("(prefers-reduced-motion: reduce)"):void 0,this._reduced?.addEventListener("change",this._onReducedChange)}hostDisconnected(){for(const t of Ls)document.removeEventListener(t,this._onInteraction,Rs);document.removeEventListener("visibilitychange",this._onVisibility),this._reduced?.removeEventListener("change",this._onReducedChange),clearTimeout(this._timer),this._shown=null}hostUpdate(){const t=this._source();t.display&&(this._display=t.display);const e=fs(this._display);this._edits.reconcile(e);const i=function(t,e){switch(e){case"light":case"dark":return{...t,theme_pair:"planavista",appearance:e};case"planavista":case"minimal":return{...t,theme_pair:e};case"vibrant":case"modern":return{...t,theme_pair:"vibrant"};default:return t}}(this._edits.current(e),t.cardTheme),s=function(t,e){if("automatic"!==t.appearance)return{mode:t.appearance,next:null,sunMissing:!1};if("home_assistant"===t.appearance_switch)return{mode:e.haDark?"dark":"light",next:null,sunMissing:!1};if("sun"===t.appearance_switch){const i=e.sun;return!i||"above_horizon"!==i.state&&"below_horizon"!==i.state?{...ws(t,e.now),sunMissing:!0}:{...Es(i,e.now),sunMissing:!1}}return{...ws(t,e.now),sunMissing:!1}}(i,{now:new Date,sun:t.sun,haDark:t.haDark});var a,r;this.settings=i,this.look=_s(i),this.sunMissing=s.sunMissing,this.motion=(a=i.motion,r=!!this._reduced?.matches,"full"===a||"reduced"===a?a:r?"reduced":"full"),this._show(s.mode,t.overlayOpen),this._display||(this._shown=null),this._schedule(s.next)}_show(t,e){if(this._quietUntil=Number.POSITIVE_INFINITY,this._changing)return;if(null===this._shown||t===this._shown)return void this._paint(t);const i=this._edits.takeTap(),s="hidden"===document.visibilityState,a=!i&&Date.now()<this._wakeUntil;if(!(i||s||a||function(t,e,i){return!i&&t-e>=1e4}(Date.now(),this._lastInteraction,e)))return this._quietUntil=e?Number.POSITIVE_INFINITY:this._lastInteraction+1e4,void this._paint(this._shown);const r=a?"none":function(t){return null===t.from||t.from===t.to||t.hidden||!t.supported?"none":t.reducedMotion?"fade":t.byHand?"reveal":"dark"===t.to?"dusk":"dawn"}({from:this._shown,to:t,byHand:null!==i,hidden:s,reducedMotion:"reduced"===this.motion,supported:Is()});this._changing=!0,function(t,e,i,s){return"none"===t||Bs||!Is()?i():new Promise((a,r)=>{const n={element:e,apply:()=>i().then(a,r),point:s};Ts&&Ts.kind===t?Ts.changes.push(n):Ts?n.apply():(Ts={kind:t,changes:[n]},setTimeout(()=>{!async function(){const t=Ts;if(Ts=null,!t)return;Bs=!0;const e=document.documentElement;Ps(function(t,e){if(0===t.length||"none"===e)return"";const i=e=>t.map(t=>`html[data-pv-vt]::view-transition-${e}(${t})`).join(","),s=["html[data-pv-vt]::view-transition-old(root),html[data-pv-vt]::view-transition-new(root){animation:none}",`${i("group")}{animation:none}`,`${i("old")},${i("new")}{animation:none;mix-blend-mode:normal}`];if("dusk"===e||"dawn"===e){const t=`linear-gradient(to ${"dusk"===e?"bottom":"top"},transparent 0%,transparent 47.6%,#000 52.4%,#000 100%)`,a="dusk"===e?"0% 100%":"0% 0%";s.push(`${i("old")}{z-index:2;-webkit-mask-image:${t};mask-image:${t};-webkit-mask-size:100% 210%;mask-size:100% 210%;-webkit-mask-repeat:no-repeat;mask-repeat:no-repeat;-webkit-mask-position:${a};mask-position:${a}}`)}return"reveal"===e&&s.push(`${i("new")}{z-index:2}`),s.join("\n")}([Os],t.kind)),e.dataset.pvVt=t.kind;let i=[];const s=()=>Promise.all(t.changes.map(t=>t.apply())).then(()=>{});try{const e=document.startViewTransition.bind(document);let a;try{a=e(s)}catch{return void await s()}try{await a.ready,i=function(t,e){const i=document.documentElement,s=`::view-transition-old(${Os})`,a=`::view-transition-new(${Os})`;if("dusk"===t||"dawn"===t){const[e,a]="dusk"===t?["0% 100%","0% 0%"]:["0% 0%","0% 100%"];return[i.animate({maskPosition:[e,a],webkitMaskPosition:[e,a]},{duration:2e3,easing:"cubic-bezier(.45,0,.25,1)",fill:"both",pseudoElement:s})]}if("reveal"===t){const t=e.find(t=>t.point)??e[0],s=t.element.getBoundingClientRect(),r=function(t,e,i){return{x:t.x,y:t.y,radius:Math.hypot(Math.max(t.x,e-t.x),Math.max(t.y,i-t.y))}}(t.point??{x:s.left+s.width/2,y:s.top+s.height/2},window.innerWidth,window.innerHeight),n=As(Ds);return[i.animate({clipPath:[`circle(0px at ${r.x}px ${r.y}px)`,`circle(${r.radius}px at ${r.x}px ${r.y}px)`]},{duration:n.duration,easing:n.easing,fill:"both",pseudoElement:a})]}return[i.animate({opacity:[1,0]},{duration:250,easing:"ease",fill:"both",pseudoElement:s}),i.animate({opacity:[0,1]},{duration:250,easing:"ease",fill:"both",pseudoElement:a})]}(t.kind,t.changes)}catch{}await a.finished.catch(()=>{})}finally{for(const t of i)t.cancel();delete e.dataset.pvVt,Ps(""),Bs=!1}}()},0))})}(r,this._host,async()=>{this._paint(t),this._host.requestUpdate(),await this._settled()},i??void 0).finally(()=>{this._changing=!1,this._host.requestUpdate()})}_paint(t){this.mode=t,this._shown=t,function(t,e){const i=JSON.stringify(e),s=We.get(t);if(s?.key!==i){for(const i of s?.names??[])i in e||t.style.removeProperty(i);for(const[i,s]of Object.entries(e))t.style.setProperty(i,s);We.set(t,{key:i,names:Object.keys(e)})}}(this._host,{...qe(this.look,t),"--pv-motion":this.motion}),this._host.setAttribute("appearance",t),this._host.setAttribute("motion",this.motion)}_schedule(t){clearTimeout(this._timer);const e=Date.now();this._timer=setTimeout(()=>this._host.requestUpdate(),function(t,e,i){const s=[t+6e4,e?e.getTime()+1e3:Number.NaN,i+50];return Math.min(...s.filter(e=>e>t))}(e,t,this._quietUntil)-e)}}var Ns="1.2.0";function js(t,e,i){return`${t} ${1===t?e:i}`}const Us=[{id:"people",label:"People",group:"people",order:100,tag:"pv-settings-people",applies:({household:t})=>null!==t,summary:({household:t})=>{const e=t?.members.length??0;return 0===e?"No one yet":js(e,"person","people")}},{id:"appearance",label:"Appearance",group:"appearance",order:400,tag:"pv-settings-appearance",summary:({data:t})=>{return e=fs(t.display),`${ls[e.appearance]} · ${ds[e.theme_pair]}`;var e}},{id:"pins",label:"PINs and parent mode",group:"security",order:500,tag:"pv-settings-pins",applies:({household:t})=>null!==t,summary:({household:t})=>{const e=t?.members.filter(t=>t.has_pin).length??0,i=t?.account.shared?"Shared screen":"Not a shared screen";return e>0?`${i} · ${js(e,"PIN","PINs")}`:i}},{id:"about",label:"About PlanaVista",group:"about",order:900,tag:"pv-settings-about",summary:()=>`Version ${Ns}`}],Vs=[{id:"welcome",label:"Welcome",order:0,tag:"pv-setup-welcome",heading:"Welcome to PlanaVista",lead:"About 5 minutes. Everything can change later in Settings.",primary:"Set up"},{id:"people",label:"Who lives here?",order:100,tag:"pv-setup-people",heading:"Who lives here?",lead:"Choose everyone in your home and what they are. People without Home Assistant can be added too."},{id:"look",label:"Look",order:900,tag:"pv-setup-look",heading:"Pick a look",lead:"You can change it any time in Settings."},{id:"done",label:"Done",order:1e3,tag:"pv-setup-done",heading:"You're all set",primary:"Open the calendar"}];class qs{constructor(t){this._host=t,this.view=null,this.ready=!1,this._subscription=new yi(t=>{this.view=t,this.ready=!0,this._host.requestUpdate()}),t.addController(this)}hostConnected(){this._follow()}hostUpdate(){this._follow()}hostDisconnected(){this._subscription.stop(),this.view=null,this.ready=!1}_follow(){this._subscription.update(this._host.hass?.connection)}}class Ys{constructor(t,e){this._host=t,this._entity=e,this.forecast=[],this._subscription=new ei(t=>{this.forecast=t,this._host.requestUpdate()}),t.addController(this)}hostConnected(){this._follow()}hostUpdate(){this._follow()}hostDisconnected(){this._subscription.stop(),this.forecast=[]}_follow(){const t=this._entity(),e=this._host.hass;this._subscription.update(e?.connection,t,e?.states?.[t]?.attributes?.forecast)}}class Ws{constructor(){this.layout=null,this._box=null,this._beforeKeyboard=null,this._textFocused=!1}focus(t){this._textFocused=t,t&&!this._beforeKeyboard&&(this._beforeKeyboard=this._box)}blur(){this._textFocused=!1}measure(t){const e=this._beforeKeyboard;return this.layout=function(t,e,i,s){if(e&&i&&s&&t.width===i.width&&t.height<i.height)return e;if(t.width<600)return"phone";const a=t.height>0?t.width/t.height:Number.POSITIVE_INFINITY;return a>=.95&&a<=1.05?"portrait"===e||"landscape"===e?e:"landscape":a>1?"landscape":"portrait"}(t,this.layout,e,this._textFocused),e&&(t.width!==e.width||!this._textFocused&&t.height>=e.height)&&(this._beforeKeyboard=null),this._box=t,this.layout}}const Ks=new Set(["INPUT","TEXTAREA","SELECT"]);class Gs{constructor(t){this._host=t,this.layout="landscape",this._tracker=new Ws,this._onFocusIn=t=>{const e=t.composedPath()[0];this._tracker.focus(!!e&&Ks.has(e.tagName))},this._onFocusOut=()=>{this._tracker.blur()},t.addController(this)}hostConnected(){this._host.addEventListener("focusin",this._onFocusIn),this._host.addEventListener("focusout",this._onFocusOut),this._observer=new ResizeObserver(t=>{const e=t[t.length-1]?.contentRect;e&&this._measure({width:e.width,height:e.height})}),this._observer.observe(this._host);const t=this._host.getBoundingClientRect();this._measure({width:t.width,height:t.height})}hostDisconnected(){this._observer?.disconnect(),this._observer=void 0,this._host.removeEventListener("focusin",this._onFocusIn),this._host.removeEventListener("focusout",this._onFocusOut)}_measure(t){if(0===t.width&&0===t.height)return;const e=this._tracker.measure(t);e===this.layout&&this._host.getAttribute("layout")===e||(this.layout=e,this._host.setAttribute("layout",e),this._host.requestUpdate())}}class Xs{constructor(t){this._onDrop=t,this._handle=()=>{this._onDrop()}}follow(t){t!==this._connection&&(this.stop(),this._connection=t,t?.addEventListener("disconnected",this._handle),t?.addEventListener("ready",this._handle))}stop(){this._connection?.removeEventListener("disconnected",this._handle),this._connection?.removeEventListener("ready",this._handle),this._connection=void 0}}const Qs=12e4;class Zs{constructor(t,e){this._host=t,this._api=e,this.session=null,this._connection=new Xs(()=>this._forget()),this._check=()=>{var t,e;this.session&&(t=this.session,e=Date.now(),0===function(t,e){return Math.max(0,t.lastTouch+Qs-e)}(t,e))&&this.lock()},this._onActivity=()=>{if(!this.session)return;const{session:t,touch:e}=function(t,e){return e-t.lastTouch<3e4?{session:t,touch:!1}:{session:{...t,lastTouch:e},touch:!0}}(this.session,Date.now());if(!e)return;this.session=t;const i=t.token;this._api().touch(i).catch(()=>{this.session?.token===i&&this._forget()}),this._host.requestUpdate()},this._onVisibility=()=>{"hidden"===document.visibilityState&&this.lock()},t.addController(this)}get token(){return this.session?.token??null}get endsAt(){return this.session?this.session.lastTouch+Qs:null}hostConnected(){this._host.addEventListener("pointerdown",this._onActivity,!0),this._host.addEventListener("keydown",this._onActivity,!0),document.addEventListener("visibilitychange",this._onVisibility),this._followConnection()}hostUpdate(){this._followConnection()}hostDisconnected(){this._host.removeEventListener("pointerdown",this._onActivity,!0),this._host.removeEventListener("keydown",this._onActivity,!0),document.removeEventListener("visibilitychange",this._onVisibility),this._connection.stop(),this.lock()}ended(t){this.session?.token===t&&this._forget()}_followConnection(){this._connection.follow(this._host.hass?.connection)}unlocked(t){t.ok&&t.session&&t.member_id&&(this._forget(),this.session=function(t,e){return{token:t.session,memberId:t.member_id,parent:t.parent,lastTouch:e}}({session:t.session,member_id:t.member_id,parent:!!t.parent},Date.now()),this._timer=window.setInterval(this._check,1e3),this._host.requestUpdate())}lock(){const t=this.token;this._forget(),t&&this._api().lock(t).catch(()=>{})}_forget(){window.clearInterval(this._timer),this._timer=void 0,this.session&&(this.session=null,this._host.requestUpdate())}}class Js extends dt{constructor(){super(...arguments),this._config={}}setConfig(t){this._config=t}render(){return V`
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
    `}}Js.styles=n`
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
  `,t([ut({attribute:!1})],Js.prototype,"hass",void 0),gt("planavista-calendar-card-editor",Js);class ta extends dt{constructor(){super(...arguments),this.layout="landscape",this.timeFormat="12h",this.weather=null,this.weatherEntity="",this.today=null,this._minute=Math.floor(Date.now()/6e4),this._timer=null}connectedCallback(){super.connectedCallback(),this._minute=Math.floor(Date.now()/6e4),this._timer=setInterval(()=>{const t=Math.floor(Date.now()/6e4);t!==this._minute&&(this._minute=t)},1e3)}disconnectedCallback(){super.disconnectedCallback(),this._timer&&clearInterval(this._timer),this._timer=null}render(){const t=new Date,{time:e,ampm:i,date:s}=function(t,e){const i=String(t.getMinutes()).padStart(2,"0"),s=t.toLocaleDateString("en-US",{weekday:"long",month:"long",day:"numeric"});return"24h"===e?{time:`${t.getHours()}:${i}`,ampm:"",date:s}:{time:`${t.getHours()%12||12}:${i}`,ampm:t.getHours()>=12?"PM":"AM",date:s}}(t,this.timeFormat),a=V`<span class="time">${e}${i?V`<span class="ampm muted">${i}</span>`:W}</span>`;if("portrait"===this.layout)return V`
        <div class="row">
          <div class="clock">${a}<div class="date">${s}</div></div>
          ${this._weather(40,"highlow")}
        </div>
      `;if("phone"===this.layout){const e=t.toLocaleDateString("en-US",{weekday:"short",month:"short",day:"numeric"});return V`
        <div class="row">
          <div class="clock">${a}<span class="date muted">${e}</span></div>
          ${this._weather(24,"none")}
        </div>
      `}return V`
      <div class="row">
        ${this._weather(32,"condition")}
        <div class="date">${s}</div>
        ${a}
      </div>
    `}_weather(t,e){const i=this.weather;if(!i)return V`<span></span>`;const s=Math.round(Number(i.attributes?.temperature??0)),a=this.today;return V`
      <button class="weather" type="button" aria-label="Weather details" @click=${this._details}>
        ${Qe(i.state||"cloudy",t)}
        <span class="weather-text">
          <span class="temp">${s}°</span>
          ${"condition"===e?V`<span class="condition muted">${(i.state||"").replace(/-/g," ")}</span>`:W}
          ${"highlow"===e&&a?V`<span class="highlow muted">High ${a.high}°${null!==a.low?` · Low ${a.low}°`:""}</span>`:W}
        </span>
      </button>
    `}_details(){this.weatherEntity&&this.dispatchEvent(new CustomEvent("hass-more-info",{detail:{entityId:this.weatherEntity},bubbles:!0,composed:!0}))}}ta.styles=n`
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
  `,t([ut({type:String,reflect:!0})],ta.prototype,"layout",void 0),t([ut({attribute:!1})],ta.prototype,"timeFormat",void 0),t([ut({attribute:!1})],ta.prototype,"weather",void 0),t([ut({attribute:!1})],ta.prototype,"weatherEntity",void 0),t([ut({attribute:!1})],ta.prototype,"today",void 0),t([vt()],ta.prototype,"_minute",void 0),gt("pv-glance-header",ta);class ea extends dt{constructor(){super(...arguments),this.layout="landscape",this.modules=[],this.activeModule="",this.views=[],this.activeView="",this.canOpenSettings=!1}render(){return V`
      <nav aria-label="PlanaVista">
        ${this.modules.length>1?V`
          <div class="seg" role="group" aria-label="Modules">
            <div class="seg-inner">
              ${this.modules.map(t=>V`
                <button type="button" class="seg-btn ${t.id===this.activeModule?"on":""}"
                  aria-pressed=${t.id===this.activeModule?"true":"false"}
                  @click=${()=>this._fire("pv-module-select",{id:t.id})}>
                  <span>${t.label}</span>
                </button>
              `)}
            </div>
          </div>
        `:W}
        <div class="views" role="group" aria-label="Views">
          ${this.views.map(t=>V`
            <button type="button" class="view ${t.id===this.activeView?"on":""}"
              aria-pressed=${t.id===this.activeView?"true":"false"}
              @click=${()=>this._fire("pv-view-select",{id:t.id})}>
              <span>${t.label}</span>
            </button>
          `)}
        </div>
        ${this.canOpenSettings?V`
          <button type="button" class="gear" aria-label="Settings" title="Settings"
            @click=${this._openSettings}>
            <span><ha-icon icon="mdi:cog"></ha-icon></span>
          </button>
        `:W}
      </nav>
    `}_openSettings(t){t.currentTarget.dispatchEvent(new CustomEvent("pv-open-settings",{bubbles:!0,composed:!0}))}_fire(t,e){this.dispatchEvent(new CustomEvent(t,{detail:e,bubbles:!0,composed:!0}))}}ea.styles=n`
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
  `,t([ut({type:String,reflect:!0})],ea.prototype,"layout",void 0),t([ut({attribute:!1})],ea.prototype,"modules",void 0),t([ut({attribute:!1})],ea.prototype,"activeModule",void 0),t([ut({attribute:!1})],ea.prototype,"views",void 0),t([ut({attribute:!1})],ea.prototype,"activeView",void 0),t([ut({type:Boolean})],ea.prototype,"canOpenSettings",void 0),gt("pv-nav-bar",ea);class ia extends dt{constructor(){super(...arguments),this.size=40}render(){const t=this.member;if(!t)return W;const e=function(t,e){const i=t.picture;if(i&&"string"==typeof i.emoji&&i.emoji)return{kind:"emoji",text:i.emoji};if(i&&!0===i.person&&t.person){const i=e(t.person);if(i)return{kind:"photo",url:i}}return{kind:"initial",text:zi(t.name)}}(t,t=>this.hass?.states?.[t]?.attributes?.entity_picture??null),i=Math.round(this.size*("emoji"===e.kind?.55:.42)),s=`width:${this.size}px;height:${this.size}px;font-size:${i}px;background:${t.color};color:${Ut(t.color)}`;return V`
      <div class="avatar" role="img" aria-label=${t.name} style=${s}>
        ${"photo"===e.kind?V`<img src=${e.url} alt="" />`:e.text}
      </div>
    `}}ia.styles=n`
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
  `,t([ut({attribute:!1})],ia.prototype,"member",void 0),t([ut({attribute:!1})],ia.prototype,"hass",void 0),t([ut({type:Number})],ia.prototype,"size",void 0),gt("pv-member-avatar",ia);class sa extends dt{constructor(){super(...arguments),this.endsAt=0,this.color="currentColor",this.size=28,this._now=Date.now()}connectedCallback(){super.connectedCallback(),this._timer=window.setInterval(()=>{this._now=Date.now()},1e3)}disconnectedCallback(){super.disconnectedCallback(),window.clearInterval(this._timer)}render(){const t=Math.max(0,this.endsAt-this._now),e=Math.min(1,t/Qs),i=this.size/2,s=(this.size-3)/2,a=2*Math.PI*s,r=10*Math.ceil(Math.ceil(t/1e3)/10),n=`Parent mode ends in ${Math.floor(r/60)} min ${r%60} s`;return V`
      <svg width=${this.size} height=${this.size} viewBox="0 0 ${this.size} ${this.size}" role="img" aria-label=${n}>
        ${q`
          <circle class="track" cx=${i} cy=${i} r=${s} fill="none"
            stroke=${this.color} stroke-width=${3}></circle>
          <circle cx=${i} cy=${i} r=${s} fill="none" stroke=${this.color}
            stroke-width=${3} stroke-linecap="round"
            stroke-dasharray=${a} stroke-dashoffset=${a*(1-e)}></circle>
        `}
      </svg>
    `}}sa.styles=n`
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
  `,t([ut({type:Number})],sa.prototype,"endsAt",void 0),t([ut({type:String})],sa.prototype,"color",void 0),t([ut({type:Number})],sa.prototype,"size",void 0),t([vt()],sa.prototype,"_now",void 0),gt("pv-session-ring",sa);class aa extends dt{constructor(){super(...arguments),this.endsAt=0}render(){const t=this.member;return t?V`
      <div class="strip" style="--strip-color: ${t.color}">
        <pv-member-avatar .member=${t} .hass=${this.hass} size="28"></pv-member-avatar>
        <span class="who">${t.name} <span class="mode">· parent mode</span></span>
        <pv-session-ring .endsAt=${this.endsAt} color=${t.color}></pv-session-ring>
        <button class="pv-btn pv-btn-ghost lock" type="button" @click=${this._lock}>Lock</button>
      </div>
    `:W}_lock(){this.dispatchEvent(new CustomEvent("pv-lock",{bubbles:!0,composed:!0}))}}aa.styles=[oe,n`
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
    `],t([ut({attribute:!1})],aa.prototype,"member",void 0),t([ut({attribute:!1})],aa.prototype,"hass",void 0),t([ut({type:Number})],aa.prototype,"endsAt",void 0),gt("pv-parent-strip",aa);const ra=n`
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
`;function na(t,e){if("Tab"!==e.key)return;const i=[...t.querySelectorAll('button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])')],s=function(t,e,i){return 0===e?-1:t<0?i?e-1:0:i?(t-1+e)%e:(t+1)%e}(i.indexOf(t.activeElement),i.length,e.shiftKey);s>=0&&(e.preventDefault(),i[s].focus())}const oa=["1","2","3","4","5","6","7","8","9","0"];function la(t,e=Math.random){const i=[...oa];if(!t)return i;for(let t=i.length-1;t>0;t--){const s=Math.floor(e()*(t+1));[i[t],i[s]]=[i[s],i[t]]}return i}function da(t){return{digits:"",length:t??6}}function ca(t){return t.digits.length===t.length}function pa(t){return t.digits.length>=4}function ha(t){return Math.max(0,t)}function ua(t){const e=getComputedStyle(t).getPropertyValue("--pv-motion").trim();return"reduced"===e||"full"===e?e:"function"==typeof matchMedia&&matchMedia("(prefers-reduced-motion: reduce)").matches?"reduced":"full"}class va{constructor(t){this._host=t}get _rises(){return"landscape"!==this._host.layout}open(t,e){if(e.animate({opacity:[0,1]},{duration:200,easing:"ease-out"}),"reduced"===ua(this._host))return void t.animate({opacity:[0,1]},{duration:150,easing:"ease-out"});const i=As(Ds);t.animate(this._rises?{transform:["translateY(105%)","translateY(0)"]}:{transform:["scale(0.96)","scale(1)"],opacity:[0,1]},{duration:i.duration,easing:i.easing})}async close(t,e){const i="reduced"===ua(this._host),s=getComputedStyle(t).transform,a=s&&"none"!==s?s:"translateY(0)",r=i?t.animate({opacity:[1,0]},{duration:150,easing:"ease-in",fill:"forwards"}):t.animate(this._rises?{transform:[a,"translateY(105%)"]}:{transform:["scale(1)","scale(0.96)"],opacity:[1,0]},{duration:this._rises?240:160,easing:"cubic-bezier(.4,0,1,1)",fill:"forwards"});e.animate({opacity:[1,0]},{duration:i?150:200,easing:"ease-in",fill:"forwards"}),await r.finished.catch(()=>{})}attachDrag(t,e,i){let s=null,a=0;const r=e=>{if(this._rises){s={y:e.clientY,t:performance.now()},a=0;try{t.setPointerCapture(e.pointerId)}catch{}}},n=t=>{s&&(a=ha(t.clientY-s.y),e.style.transform=`translateY(${a}px)`)},o=()=>{if(!s)return;const t=function(t,e){const i=ha(t);return i>90||i/Math.max(1,e)>.6?"close":"settle"}(a,performance.now()-s.t);if(s=null,"close"===t)return void i();const r="reduced"===ua(this._host)?{duration:120,easing:"ease-out"}:As(Ss);e.style.transform="",e.animate({transform:[`translateY(${a}px)`,"translateY(0)"]},{duration:r.duration,easing:r.easing})};return t.addEventListener("pointerdown",r),t.addEventListener("pointermove",n),t.addEventListener("pointerup",o),t.addEventListener("pointercancel",o),()=>{t.removeEventListener("pointerdown",r),t.removeEventListener("pointermove",n),t.removeEventListener("pointerup",o),t.removeEventListener("pointercancel",o)}}}class ma extends dt{constructor(){super(...arguments),this.layout="landscape",this.mode="unlock",this.members=[],this.heading="",this.shuffle=!1,this._step="pick",this._entry=da(null),this._first="",this._message="",this._pausedUntil=0,this._now=Date.now(),this._busy=!1,this._shake=!1,this._digits=la(!1),this._started=!1,this._sheetMotion=new va(this),this._detachDrag=null,this._closing=!1,this._cancel=()=>{this._leave("pv-sheet-close",{})},this._onKey=t=>{"Escape"===t.key?(t.preventDefault(),this._cancel()):/^[0-9]$/.test(t.key)&&"pick"!==this._step?(t.preventDefault(),this._press(t.key)):"Backspace"===t.key&&"pick"!==this._step?(t.preventDefault(),this._delete()):"Enter"===t.key&&"choose"===this._step?(t.preventDefault(),this._next()):na(this.shadowRoot,t)}}connectedCallback(){super.connectedCallback(),this.addEventListener("keydown",this._onKey),this.toggleAttribute("reduced","reduced"===ua(this))}disconnectedCallback(){super.disconnectedCallback(),this.removeEventListener("keydown",this._onKey),window.clearInterval(this._ticker),this._detachDrag?.(),this._detachDrag=null}willUpdate(t){this._started||(this._started=!0,this._digits=la(this.shuffle),"choose"===this.mode?(this._step="choose",this._entry=da(null)):1===this.members.length&&this._enterFor(this.members[0]))}firstUpdated(){this.renderRoot.querySelector(".person, .key")?.focus();const{panel:t,backdrop:e,zone:i}=this._parts();this._sheetMotion.open(t,e),this._detachDrag=this._sheetMotion.attachDrag(i,t,this._cancel)}_parts(){const t=this.renderRoot;return{panel:t.querySelector(".panel"),backdrop:t.querySelector(".backdrop"),zone:t.querySelector(".grab-zone")}}async _leave(t,e){if(this._closing)return;this._closing=!0;const{panel:i,backdrop:s}=this._parts();await this._sheetMotion.close(i,s),this._fire(t,e),requestAnimationFrame(()=>{if(this.isConnected){for(const t of[i,s])t.getAnimations().forEach(t=>t.cancel());i.style.transform="",this._closing=!1}})}render(){return V`
      <div class="backdrop" @click=${this._cancel}></div>
      <div class="panel" role="dialog" aria-modal="true" aria-labelledby="pin-heading">
        <div class="grab-zone" aria-hidden="true"><div class="grab"></div></div>
        ${"pick"===this._step?this._renderPicker():this._renderPad()}
      </div>
    `}_renderPicker(){return V`
      <h2 class="heading" id="pin-heading">${this.heading}</h2>
      <div class="people">
        ${this.members.map(t=>V`
          <button class="person" type="button" @click=${()=>this._enterFor(t)}>
            <pv-member-avatar .member=${t} .hass=${this.hass} size="64"></pv-member-avatar>
            <span>${t.name}</span>
          </button>
        `)}
      </div>
      <div class="actions">
        <button class="pv-btn pv-btn-secondary" type="button" @click=${this._cancel}>Cancel</button>
      </div>
    `}_renderPad(){const t=this._paused(),e="enter"===this._step?`${this._who?.name??""}, enter your PIN`:"choose"===this._step?`Choose a PIN for ${this.target?.name??""}`:"Enter it again",i=t?`Too many tries. Try again in ${function(t){const e=Math.max(0,Math.ceil(t/1e3));return`${Math.floor(e/60)}:${String(e%60).padStart(2,"0")}`}(this._pausedUntil-this._now)}.`:this._message;return V`
      ${"enter"===this._step&&this.members.length>1?V`<button class="back" type="button" @click=${this._backToPicker}>‹ Someone else</button>`:W}
      <h2 class="heading" id="pin-heading">${e}</h2>
      ${"choose"===this._step?V`<p class="hint">4 to 6 digits.</p>`:W}
      <div class="boxes ${this._shake?"shake":""}" aria-hidden="true">
        ${Array.from({length:this._entry.length},(t,e)=>V`
          <span class="box ${e<this._entry.digits.length?"filled":""}"></span>
        `)}
      </div>
      <p class="sr" aria-live="polite">${this._entry.digits.length} of ${this._entry.length} digits entered</p>
      <p class="message" role="alert">${i}</p>
      <div class="keypad">
        ${this._digits.slice(0,9).map(e=>this._renderKey(e,t))}
        <button class="key text" type="button" @click=${this._cancel}>Cancel</button>
        ${this._renderKey(this._digits[9],t)}
        <button class="key text" type="button" aria-label="Delete last digit" ?disabled=${t} @click=${this._delete}>⌫</button>
      </div>
      ${"choose"===this._step?V`
          <button class="pv-btn pv-btn-primary next" type="button"
            ?disabled=${!pa(this._entry)||this._busy}
            @click=${this._next}>Next</button>
        `:W}
    `}_renderKey(t,e){return V`
      <button class="key" type="button" ?disabled=${e||this._busy} @click=${()=>this._press(t)}>${t}</button>
    `}_enterFor(t){this._who=t,this._step="enter",this._message="",this._entry=da(t.pin_length);const e=t.locked_until?Date.parse(t.locked_until):0;e>Date.now()&&this._pause(e)}_backToPicker(){this._step="pick",this._who=void 0,this._message=""}_paused(){return this._pausedUntil>this._now}_pause(t){this._pausedUntil=t,this._now=Date.now(),window.clearInterval(this._ticker),this._ticker=window.setInterval(()=>{this._now=Date.now(),this._paused()||window.clearInterval(this._ticker)},1e3)}_press(t){this._busy||this._paused()||(this._message="",this._entry=function(t,e){return!/^[0-9]$/.test(e)||t.digits.length>=t.length?t:{...t,digits:t.digits+e}}(this._entry,t),"enter"===this._step&&ca(this._entry)?this._check():("choose"===this._step&&6===this._entry.digits.length||"confirm"===this._step&&ca(this._entry))&&this._next())}_delete(){var t;this._entry=(t=this._entry,{...t,digits:t.digits.slice(0,-1)})}_next(){if("choose"===this._step){if(!pa(this._entry))return;return this._first=this._entry.digits,this._entry=da(this._first.length),void(this._step="confirm")}"confirm"===this._step&&ca(this._entry)&&(this._entry.digits===this._first?this._save(this._first):this._restartChoosing("Those didn't match. Try again."))}_restartChoosing(t){this._message=t,this._first="",this._entry=da(null),this._step="choose",this._shakeBoxes()}async _check(){const t=this._who;if(t){this._busy=!0;try{const e=await this.api.unlock(t.id,this._entry.digits);if(e.ok)return void this._leave("pv-unlocked",{result:e});if(this._entry=da(t.pin_length),"paused"===e.reason)this._pause(Date.now()+1e3*(e.retry_after??30));else if("wrong_pin"===e.reason){const i=e.tries_left??0;this._message=`That's not ${t.name}'s PIN. ${1===i?"1 more try":`${i} more tries`} before a short pause.`}else this._message=`${t.name} has no PIN yet.`;this._shakeBoxes()}catch{this._entry=da(t.pin_length),this._message="Couldn't check the PIN. Check the connection and try again."}finally{this._busy=!1}}}async _save(t){const e=this.target;if(e){this._busy=!0;try{await this.api.setPin(e.id,t),this._leave("pv-pin-set",{memberId:e.id})}catch(t){this._restartChoosing(ki(_i(t)))}finally{this._busy=!1}}}_shakeBoxes(){this._shake=!0,window.setTimeout(()=>{this._shake=!1},320)}_fire(t,e){this.dispatchEvent(new CustomEvent(t,{detail:e,bubbles:!0,composed:!0}))}}ma.styles=[oe,ra,n`
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
    `],t([ut({attribute:!1})],ma.prototype,"hass",void 0),t([ut({attribute:!1})],ma.prototype,"api",void 0),t([ut({type:String,reflect:!0})],ma.prototype,"layout",void 0),t([ut({type:String})],ma.prototype,"mode",void 0),t([ut({attribute:!1})],ma.prototype,"members",void 0),t([ut({type:String})],ma.prototype,"heading",void 0),t([ut({attribute:!1})],ma.prototype,"target",void 0),t([ut({type:Boolean})],ma.prototype,"shuffle",void 0),t([vt()],ma.prototype,"_step",void 0),t([vt()],ma.prototype,"_who",void 0),t([vt()],ma.prototype,"_entry",void 0),t([vt()],ma.prototype,"_first",void 0),t([vt()],ma.prototype,"_message",void 0),t([vt()],ma.prototype,"_pausedUntil",void 0),t([vt()],ma.prototype,"_now",void 0),t([vt()],ma.prototype,"_busy",void 0),t([vt()],ma.prototype,"_shake",void 0),gt("pv-pin-sheet",ma);class ga extends dt{constructor(){super(...arguments),this.heading="",this.body="",this.actions=[],this.layout="landscape",this._sheetMotion=new va(this),this._detachDrag=null,this._closing=!1}firstUpdated(){this.renderRoot.querySelector(".actions button")?.focus();const{panel:t,backdrop:e,zone:i}=this._parts();this._sheetMotion.open(t,e),this._detachDrag=this._sheetMotion.attachDrag(i,t,()=>this._choose("cancel"))}disconnectedCallback(){super.disconnectedCallback(),this._detachDrag?.(),this._detachDrag=null}_parts(){const t=this.renderRoot;return{panel:t.querySelector(".panel"),backdrop:t.querySelector(".backdrop"),zone:t.querySelector(".grab-zone")}}render(){return V`
      <div class="backdrop" @click=${()=>this._choose("cancel")}></div>
      <div class="panel" role="dialog" aria-modal="true" aria-labelledby="notice-heading" @keydown=${this._onKey}>
        <div class="grab-zone" aria-hidden="true"><div class="grab"></div></div>
        <h2 class="heading" id="notice-heading">${this.heading}</h2>
        ${this.body?V`<p class="body">${this.body}</p>`:W}
        <div class="actions">
          ${this.actions.map(t=>V`
            <button
              type="button"
              class="pv-btn ${"secondary"===t.kind?"pv-btn-secondary":"pv-btn-primary"} ${"destructive"===t.kind?"destructive":""}"
              @click=${()=>this._choose(t.id)}
            >${t.label}</button>
          `)}
        </div>
      </div>
    `}_onKey(t){if("Escape"===t.key)return t.preventDefault(),void this._choose("cancel");na(this.shadowRoot,t)}_choose(t){this._leave(()=>{this.dispatchEvent(new CustomEvent("pv-sheet-action",{detail:{id:t},bubbles:!0,composed:!0}))})}async _leave(t){if(this._closing)return;this._closing=!0;const{panel:e,backdrop:i}=this._parts();await this._sheetMotion.close(e,i),t(),requestAnimationFrame(()=>{if(this.isConnected){for(const t of[e,i])t.getAnimations().forEach(t=>t.cancel());e.style.transform="",this._closing=!1}})}}ga.styles=[oe,ra,n`
      .destructive {
        background: var(--pv-danger, #DC2626);
        border-color: transparent;
        color: #FFFFFF;
      }
    `],t([ut({type:String})],ga.prototype,"heading",void 0),t([ut({type:String})],ga.prototype,"body",void 0),t([ut({attribute:!1})],ga.prototype,"actions",void 0),t([ut({type:String,reflect:!0})],ga.prototype,"layout",void 0),gt("pv-notice-sheet",ga);let ya=class{constructor(t){}get _$AU(){return this._$AM._$AU}_$AT(t,e,i){this._$Ct=t,this._$AM=e,this._$Ci=i}_$AS(t,e){return this.update(t,e)}update(t,e){return this.render(...e)}};const fa={},_a=(t=>(...e)=>({_$litDirective$:t,values:e}))(class extends ya{constructor(){super(...arguments),this.key=W}render(t,e){return this.key=t,e}update(t,[e,i]){return e!==this.key&&(((t,e=fa)=>{t._$AH=e})(t),this.key=e),i}});function ba(t,e,i){const s=[...t];if(e<0||e>=s.length||i<0||i>=s.length||e===i)return s;const[a]=s.splice(e,1);return s.splice(i,0,a),s}class xa extends dt{constructor(){super(...arguments),this.household=null,this.layout="landscape",this.mode="settings",this._order=null,this._dragging=null,this._dragMove=t=>{if(!this._dragging||!this._order)return;const e=[...this.renderRoot.querySelectorAll("li")].map(t=>{const e=t.getBoundingClientRect();return{top:e.top,height:e.height}}),i=function(t,e){if(0===e.length)return-1;const i=e.findIndex(e=>t<e.top+e.height/2);return i>=0?i:e.length-1}(t.clientY,e),s=this._order.indexOf(this._dragging);i>=0&&i!==s&&(this._order=ba(this._order,s,i))},this._dragEnd=()=>{if(!this._dragging||!this._order)return;const t=this._order;this._dragging=null,this._saveOrder(t)}}_members(){const t=Ai(this.household?.members??[]);if(!this._order)return t;const e=new Map(t.map(t=>[t.id,t]));return this._order.map(t=>e.get(t)).filter(t=>!!t)}render(){const t=this._members(),e=!!this.household?.available;return V`
      <div class="head">
        <p class="lead">This is the order people appear in. Drag ≡ to change it.</p>
        ${e?V`<button class="pv-btn pv-btn-secondary add" type="button" @click=${this._add}>+ Add someone</button>`:W}
      </div>
      ${0===t.length?V`<p class="empty">No one here yet.</p>`:W}
      <ul>
        ${t.map((t,i)=>V`
          <li class=${this._dragging===t.id?"dragging":""}>
            ${e?V`
              <button class="handle" type="button" aria-label="Move ${t.name}"
                @pointerdown=${e=>this._dragStart(e,t.id)}
                @pointermove=${this._dragMove}
                @pointerup=${this._dragEnd}
                @pointercancel=${this._dragEnd}
                @keydown=${t=>this._keyMove(t,i)}>≡</button>
            `:W}
            <button class="open" type="button" @click=${()=>this._open(t)}>
              <pv-member-avatar .member=${t} .hass=${this.hass} size="40"></pv-member-avatar>
              <span class="text">
                <span class="name">${t.name}</span>
                <span class="summary">${function(t,e){const i=[t.parent?"Parent":Ei[t.age_group]];t.has_pin&&i.push("PIN on");const s=Pi(t.id,e);return 0===s.length?i.push("no calendar"):1===s.length?i.push(`${t.name}'s calendar`):i.push(`${s.length} calendars`),i.join(" · ")}(t,this.data?.calendars??[])}</span>
              </span>
              <span class="chevron" aria-hidden="true">›</span>
            </button>
          </li>
        `)}
      </ul>
      ${e&&t.length>0?V`<button class="pv-btn pv-btn-secondary add" type="button" @click=${this._add}>+ Add someone</button>`:W}
    `}_push(t){this.dispatchEvent(new CustomEvent(bi,{detail:t,bubbles:!0,composed:!0}))}_open(t){this._push({tag:"pv-settings-person",title:t.name,back:"People",props:{memberId:t.id}})}_add(){this._push({tag:"pv-settings-person",title:"New person",back:"People",props:{memberId:null}})}_dragStart(t,e){t.currentTarget.setPointerCapture(t.pointerId),this._order=this._members().map(t=>t.id),this._dragging=e}_keyMove(t,e){if("ArrowUp"!==t.key&&"ArrowDown"!==t.key)return;t.preventDefault();const i=this._members().map(t=>t.id),s="ArrowUp"===t.key?e-1:e+1;s<0||s>=i.length||(this._order=ba(i,e,s),this._saveOrder(this._order).then(()=>{this.renderRoot.querySelectorAll(".handle")[s]?.focus()}))}async _saveOrder(t){const e=Ai(this.household?.members??[]).map(t=>t.id);if(t.join()!==e.join())try{await this.api.reorder(t)}catch(t){this.dispatchEvent(new CustomEvent(wi,{detail:{message:ki(_i(t))},bubbles:!0,composed:!0}))}this._order=null}}xa.styles=[re,oe,n`
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
    `],t([ut({attribute:!1})],xa.prototype,"hass",void 0),t([ut({attribute:!1})],xa.prototype,"data",void 0),t([ut({attribute:!1})],xa.prototype,"household",void 0),t([ut({attribute:!1})],xa.prototype,"api",void 0),t([ut({type:String})],xa.prototype,"layout",void 0),t([ut({type:String})],xa.prototype,"mode",void 0),t([vt()],xa.prototype,"_order",void 0),t([vt()],xa.prototype,"_dragging",void 0),gt("pv-settings-people",xa);const wa=["name","color","picture","age_group","parent","person"];function ka(t,e){return JSON.stringify(t)===JSON.stringify(e)}function $a(t,e,i){if(t)return{name:t.name,color:t.color,picture:t.picture,age_group:t.age_group,parent:t.parent,person:t.person};const s=Ti(e),a=i.find(t=>!s.has(t.toUpperCase()))??i[0];return{name:"",color:a,picture:{initial:!0},age_group:"adult",parent:!1,person:null}}function Ea(t,e,i){const s=$a(t,e,i);return{draft:s,start:s,rev:t?t.rev:null}}function Fa(t,e){return!ka(t,e)}class Ca extends dt{constructor(){super(...arguments),this.layout="landscape",this.shuffle=!1,this.sharedScreens=!1,this._choosing=!1,this._confirmingRemove=!1,this._message="",this._busy=!1}_paused(){return(this.member.locked_until?Date.parse(this.member.locked_until):0)>Date.now()}_status(){return this._paused()?{text:"Paused after too many tries",needs:!1}:this.member.has_pin?{text:"PIN set",needs:!1}:this.member.parent&&this.sharedScreens?{text:"Needs a PIN on a shared screen",needs:!0}:{text:"No PIN",needs:!1}}render(){const t=this._status();return V`
      <div class="row">
        <span class="status ${t.needs?"needs":""}">${t.text}</span>
        <span class="buttons">
          <button class="pv-btn pv-btn-secondary" type="button" ?disabled=${this._busy}
            @click=${()=>{this._message="",this._choosing=!0}}>
            ${this.member.has_pin?"Change PIN":"Set PIN"}
          </button>
          ${this.member.has_pin?V`
            <button class="pv-btn pv-btn-secondary" type="button" ?disabled=${this._busy}
              @click=${()=>{this._message="",this._confirmingRemove=!0}}>Remove PIN</button>
          `:W}
          ${this._paused()?V`
            <button class="pv-btn pv-btn-secondary" type="button" ?disabled=${this._busy} @click=${this._clearPause}>Clear pause</button>
          `:W}
        </span>
      </div>
      ${this._message?V`<p class="message" role="alert">${this._message}</p>`:W}
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
      `:W}
      ${this._confirmingRemove?V`
        <pv-notice-sheet
          .layout=${this.layout}
          heading=${`Remove ${this.member.name}'s PIN?`}
          body=${this.member.parent?`On a shared screen, ${this.member.name} will need a new PIN to start parent mode.`:"You can set a new one any time."}
          .actions=${[{id:"cancel",label:"Cancel",kind:"secondary"},{id:"remove",label:"Remove PIN",kind:"destructive"}]}
          @pv-sheet-action=${this._onRemoveChoice}
        ></pv-notice-sheet>
      `:W}
    `}async _onRemoveChoice(t){t.stopPropagation(),this._confirmingRemove=!1,"remove"===t.detail.id&&await this._remove()}_closeSheet(t){t.stopPropagation(),this._choosing=!1}async _remove(){await this._run(()=>this.api.clearPin(this.member.id))}async _clearPause(){await this._run(()=>this.api.clearPause(this.member.id))}async _run(t){this._busy=!0,this._message="";try{await t()}catch(t){this._message=t?.message||ki(_i(t))}finally{this._busy=!1}}}Ca.styles=[oe,n`
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
    `],t([ut({attribute:!1})],Ca.prototype,"hass",void 0),t([ut({attribute:!1})],Ca.prototype,"api",void 0),t([ut({type:String})],Ca.prototype,"layout",void 0),t([ut({attribute:!1})],Ca.prototype,"member",void 0),t([ut({type:Boolean})],Ca.prototype,"shuffle",void 0),t([ut({type:Boolean})],Ca.prototype,"sharedScreens",void 0),t([vt()],Ca.prototype,"_choosing",void 0),t([vt()],Ca.prototype,"_confirmingRemove",void 0),t([vt()],Ca.prototype,"_message",void 0),t([vt()],Ca.prototype,"_busy",void 0),gt("pv-pin-actions",Ca);const Da=Bi.PRESETS.map(t=>t.color);class Sa extends dt{constructor(){super(...arguments),this.household=null,this.layout="landscape",this.mode="settings",this.pageProps={},this.drafts=new Map,this._rev=null,this._problem="",this._saving=!1,this._notice=null,this._loaded=!1}get _memberId(){return this.pageProps.memberId??null}get _member(){return this.household?.members.find(t=>t.id===this._memberId)??null}get _draftKey(){return this._memberId??"new"}willUpdate(){if(!this._loaded&&this.household){const t=this.drafts.get(this._draftKey);this._use(t??Ea(this._member,this.household.members,Da)),this._loaded=!0}}_use(t){this._draft=t.draft,this._start=t.start,this._rev=t.rev}get _record(){return{draft:this._draft,start:this._start,rev:this._rev}}confirmLeave(){return this._loaded&&Fa(this._draft,this._start)?(this._notice="discard",new Promise(t=>{this._leave=t})):Promise.resolve(!0)}render(){if(!this._loaded||!this.household)return W;const t=this._member,e=null===this._memberId;if(!e&&!t)return V`<p class="gone">This person was removed on another screen.</p>`;const i=this._draft,s=Fa(i,this._start);return V`
      <div class="top">
        <pv-member-avatar
          .member=${{name:i.name||"?",color:i.color,picture:i.picture,person:i.person}}
          .hass=${this.hass}
          size="64"
        ></pv-member-avatar>
        <div class="actions">
          <button class="pv-btn pv-btn-secondary" type="button" @click=${this._cancel}>Cancel</button>
          <button class="pv-btn pv-btn-primary" type="button"
            ?disabled=${this._saving||!e&&!s}
            @click=${this._save}>${e?"Add":"Save"}</button>
        </div>
      </div>
      ${this._problem?V`<p class="problem" role="alert">${this._problem}</p>`:W}
      ${this._renderName()}
      ${this._renderColor()}
      ${this._renderPicture()}
      ${this._renderAgeGroup()}
      ${this._renderParent()}
      ${this._renderPin(t)}
      ${this._renderHomeAssistant()}
      ${t?V`
        <button class="pv-btn remove" type="button" @click=${()=>{this._notice="remove"}}>Remove ${t.name}</button>
      `:W}
      ${this._renderNotice(t)}
    `}_renderName(){return V`
      <label class="field">
        <span class="label">Name</span>
        <input
          class="pv-input"
          type="text"
          maxlength="40"
          autocomplete="off"
          .value=${this._draft.name}
          @input=${t=>this._change({name:t.target.value})}
        />
      </label>
    `}_renderColor(){const t=Ti(this.household.members,this._memberId??void 0);return V`
      <fieldset class="field">
        <legend>Color</legend>
        <div class="swatches">
          ${Bi.PRESETS.map(e=>{const i=t.get(e.color.toUpperCase()),s=this._draft.color.toUpperCase()===e.color.toUpperCase();return V`
              <button
                class="swatch"
                type="button"
                style="background:${e.color}"
                aria-pressed=${s?"true":"false"}
                aria-label=${i?`${e.name}, used by ${i.name}`:e.name}
                ?disabled=${!!i}
                @click=${()=>this._change({color:e.color})}
              >${i?zi(i.name):""}</button>
            `})}
        </div>
      </fieldset>
    `}_personPicture(){const t=this._draft.person;return t?this.hass?.states?.[t]?.attributes?.entity_picture??null:null}_renderPicture(){const t=this._draft.picture,e="string"==typeof t.emoji?"emoji":t.person?"photo":"initial",i=this._personPicture(),s=!!this._draft.person,a=t=>this._change({picture:t});return V`
      <fieldset class="field">
        <legend>Picture</legend>
        <div class="segmented" role="group" aria-label="Picture">
          <button type="button" aria-pressed=${"initial"===e?"true":"false"}
            @click=${()=>a({initial:!0})}>Initial</button>
          <button type="button" aria-pressed=${"emoji"===e?"true":"false"}
            @click=${()=>a({emoji:"string"==typeof t.emoji?t.emoji:"🙂"})}>Emoji</button>
          <button type="button" aria-pressed=${"photo"===e?"true":"false"} ?disabled=${!s}
            @click=${()=>a({person:!0})}>Photo</button>
        </div>
        ${"emoji"===e?V`
          <input class="pv-input emoji" type="text" maxlength="16" placeholder="Type or paste an emoji"
            aria-label="Emoji"
            .value=${String(t.emoji??"")}
            @input=${t=>a({emoji:t.target.value})} />
        `:W}
        ${s?"photo"!==e||i?W:V`<p class="hint">Their Home Assistant person has no photo yet, so their initial shows.</p>`:V`<p class="hint">Link a Home Assistant person to use their photo.</p>`}
      </fieldset>
    `}_renderAgeGroup(){return V`
      <fieldset class="field">
        <legend>Age group</legend>
        <div class="radios">
          ${Fi.map(t=>V`
            <label class="radio">
              <input type="radio" name="age-group" .checked=${this._draft.age_group===t.id}
                @change=${()=>this._change({age_group:t.id})} />
              <span>${t.label}</span>
              ${t.hint?V`<span class="age-hint">${t.hint}</span>`:W}
            </label>
          `)}
        </div>
      </fieldset>
    `}_renderParent(){const t=this._draft.parent,e=()=>this._change({parent:!t});return V`
      <div class="field">
        <div class="toggle-row">
          <span class="label" id="parent-label">Parent</span>
          <div
            class="pv-toggle ${t?"active":""}"
            role="switch"
            tabindex="0"
            aria-checked=${t?"true":"false"}
            aria-labelledby="parent-label"
            @click=${e}
            @keydown=${t=>{"Enter"!==t.key&&" "!==t.key||(t.preventDefault(),e())}}
          ></div>
        </div>
        <p class="hint">Parents open Settings. On a shared screen they need a PIN.</p>
      </div>
    `}_renderPin(t){return V`
      <div class="field">
        <span class="label">PIN</span>
        ${t?V`
          <pv-pin-actions
            .hass=${this.hass}
            .api=${this.api}
            .layout=${this.layout}
            .member=${t}
            .shuffle=${!!this.household?.security.shuffle_keypad}
            .sharedScreens=${(this.household?.security.shared_screens??0)>0}
          ></pv-pin-actions>
        `:V`
          <p class="hint">You can set a PIN after adding ${this._draft.name.trim()||"them"}.</p>
        `}
      </div>
    `}_renderHomeAssistant(){const t=this.household.members,e=new Set(t.filter(t=>t.id!==this._memberId&&t.person).map(t=>t.person)),i=Object.keys(this.hass?.states??{}).filter(t=>t.startsWith("person.")&&!e.has(t)).sort(),s=this._memberId?Pi(this._memberId,this.data?.calendars??[]):[];return V`
      <fieldset class="field">
        <legend>Home Assistant</legend>
        <label class="field">
          <span class="label">Person</span>
          <select class="pv-input pv-select" .value=${this._draft.person??""}
            @change=${t=>this._linkPerson(t.target.value)}>
            <option value="" ?selected=${!this._draft.person}>None</option>
            ${i.map(t=>V`
              <option value=${t} ?selected=${this._draft.person===t}>${this.hass.states[t]?.attributes?.friendly_name??t}</option>
            `)}
          </select>
        </label>
        <span class="label">Calendars</span>
        ${s.length?V`<ul class="calendars">${s.map(t=>V`<li>${t.display_name}</li>`)}</ul>`:V`<p class="hint">No calendars yet. Choose who each calendar belongs to in Calendars.</p>`}
      </fieldset>
    `}_renderNotice(t){return this._notice?"discard"===this._notice?V`
        <pv-notice-sheet .layout=${this.layout} heading="Discard changes?"
          .actions=${[{id:"keep",label:"Keep editing",kind:"secondary"},{id:"discard",label:"Discard",kind:"destructive"}]}
          @pv-sheet-action=${this._onDiscardChoice}></pv-notice-sheet>
      `:"remove"===this._notice&&t?V`
        <pv-notice-sheet .layout=${this.layout} heading="Remove ${t.name}?"
          body="Their calendars stay, and won't belong to anyone."
          .actions=${[{id:"cancel",label:"Cancel",kind:"secondary"},{id:"remove",label:"Remove",kind:"destructive"}]}
          @pv-sheet-action=${this._onRemoveChoice}></pv-notice-sheet>
      `:V`
      <pv-notice-sheet .layout=${this.layout} heading="This changed on another screen."
        .actions=${[{id:"keep",label:"Keep editing",kind:"secondary"},{id:"load",label:"Load the new version",kind:"primary"}]}
        @pv-sheet-action=${this._onChangedChoice}></pv-notice-sheet>
    `:W}_change(t){this._draft={...this._draft,...t},this._problem="",this.drafts.set(this._draftKey,this._record)}_linkPerson(t){const e=this._draft.picture;this._change({person:t||null,picture:!t&&e.person?{initial:!0}:this._draft.picture})}_pop(){this.dispatchEvent(new CustomEvent(xi,{bubbles:!0,composed:!0}))}_cancel(){Fa(this._draft,this._start)?this._notice="discard":this._pop()}async _save(){const t=function(t,e,i){const s=t.name.trim();if(!s)return"Add a name.";const a=e.filter(t=>t.id!==i);if(a.some(t=>t.name.toLocaleLowerCase()===s.toLocaleLowerCase()))return"Someone already has that name.";const r=a.find(e=>e.color.toUpperCase()===t.color.toUpperCase());return r?`${r.name} already has that color.`:null}(this._draft,this.household?.members??[],this._memberId);if(t)return void(this._problem=t);const e=this._member;if(null===this._rev||e){this._saving=!0;try{const t=e&&null!==this._rev?{id:e.id,rev:this._rev}:void 0;await this.api.saveMember(function(t){const e={};for(const i of wa)null!==t.rev&&ka(t.draft[i],t.start[i])||(e[i]=t.draft[i]);return"string"==typeof e.name&&(e.name=e.name.trim()),e}(this._record),t),this.drafts.delete(this._draftKey),this._start=this._draft,this._pop()}catch(t){const e=_i(t);"changed"===e?this._notice="changed":this._problem=t?.message||ki(e)}finally{this._saving=!1}}else this._problem="That person was removed on another screen."}_onDiscardChoice(t){t.stopPropagation(),this._notice=null;const e="discard"===t.detail.id;if(e&&(this.drafts.delete(this._draftKey),this._draft=this._start),this._leave){const t=this._leave;this._leave=void 0,t(e)}else e&&this._pop()}async _onRemoveChoice(t){t.stopPropagation(),this._notice=null;const e=this._member;if("remove"===t.detail.id&&e)try{await this.api.deleteMember(e.id),this.drafts.delete(this._draftKey),this._start=this._draft,this._pop()}catch(t){this._problem=t?.message||ki(_i(t))}}_onChangedChoice(t){t.stopPropagation(),this._notice=null;const e=this._member;this.household&&e&&("load"===t.detail.id?(this._use(Ea(e,this.household.members,Da)),this.drafts.delete(this._draftKey)):(this._use(function(t,e,i){const s=$a(e,i,Da),a={...s};for(const e of wa)ka(t.draft[e],t.start[e])||(a[e]=t.draft[e]);return{draft:a,start:s,rev:e.rev}}(this._record,e,this.household.members)),this.drafts.set(this._draftKey,this._record)))}}Sa.styles=[re,oe,ce,n`
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
    `],t([ut({attribute:!1})],Sa.prototype,"hass",void 0),t([ut({attribute:!1})],Sa.prototype,"data",void 0),t([ut({attribute:!1})],Sa.prototype,"household",void 0),t([ut({attribute:!1})],Sa.prototype,"api",void 0),t([ut({type:String})],Sa.prototype,"layout",void 0),t([ut({type:String})],Sa.prototype,"mode",void 0),t([ut({attribute:!1})],Sa.prototype,"pageProps",void 0),t([ut({attribute:!1})],Sa.prototype,"drafts",void 0),t([vt()],Sa.prototype,"_draft",void 0),t([vt()],Sa.prototype,"_start",void 0),t([vt()],Sa.prototype,"_problem",void 0),t([vt()],Sa.prototype,"_saving",void 0),t([vt()],Sa.prototype,"_notice",void 0),gt("pv-settings-person",Sa);class Aa extends dt{constructor(){super(...arguments),this.household=null,this.layout="landscape",this.mode="settings",this._message="",this._busy=!1,this._toggleShared=()=>{this.household&&this._run(()=>this.api.setSharedScreen(!this.household.account.shared))},this._toggleShuffle=()=>{this.household&&this._run(()=>this.api.saveSecurity({shuffle_keypad:!this.household.security.shuffle_keypad}))}}render(){const t=this.household;if(!t)return W;const e=t.account,i=t.security.shared_screens>0;return V`
      <section>
        <h2>This screen</h2>
        ${this._switch("Shared family screen","shared-label",e.shared,this._toggleShared)}
        <p class="hint">Yes, the whole family uses it. Settings asks for a parent's PIN.</p>
        ${this._message?V`<p class="message" role="alert">${this._message}</p>`:W}
        ${e.is_admin?V`
          <p class="note">
            This screen is signed in with an admin account. A non-admin account is safer for a
            shared screen, because anyone here can reach Home Assistant's own settings.
            <a href="https://www.home-assistant.io/docs/authentication/" target="_blank" rel="noopener noreferrer">How to set one up</a>
          </p>
        `:W}
      </section>

      <section>
        <h2>PINs</h2>
        ${Ai(t.members).map(e=>V`
          <div class="person">
            <pv-member-avatar .member=${e} .hass=${this.hass} size="32"></pv-member-avatar>
            <span class="name">${e.name}</span>
            <pv-pin-actions
              .hass=${this.hass}
              .api=${this.api}
              .layout=${this.layout}
              .member=${e}
              .shuffle=${t.security.shuffle_keypad}
              .sharedScreens=${i}
            ></pv-pin-actions>
          </div>
        `)}
      </section>

      <section>
        ${this._switch("Shuffle the keypad","shuffle-label",t.security.shuffle_keypad,this._toggleShuffle)}
        <p class="hint">The numbers move each time, so smudges and glances don't give a PIN away.</p>
      </section>

      <p class="rule">
        After 5 wrong tries, a PIN pauses for 30 seconds, and each pause after that is twice as
        long, up to 15 minutes. A parent can clear a pause here. Forgot every parent's PIN? Sign in
        to Home Assistant with a parent's or an admin's own account and set new ones here.
      </p>
    `}_switch(t,e,i,s){return V`
      <div class="toggle-row">
        <span class="label" id=${e}>${t}</span>
        <div
          class="pv-toggle ${i?"active":""}"
          role="switch"
          tabindex="0"
          aria-checked=${i?"true":"false"}
          aria-labelledby=${e}
          aria-disabled=${this._busy?"true":"false"}
          @click=${s}
          @keydown=${t=>{"Enter"!==t.key&&" "!==t.key||(t.preventDefault(),s())}}
        ></div>
      </div>
    `}async _run(t){if(!this._busy){this._busy=!0,this._message="";try{await t()}catch(t){this._message=t?.message||ki(_i(t))}finally{this._busy=!1}}}}Aa.styles=[re,oe,ce,n`
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
    `],t([ut({attribute:!1})],Aa.prototype,"hass",void 0),t([ut({attribute:!1})],Aa.prototype,"data",void 0),t([ut({attribute:!1})],Aa.prototype,"household",void 0),t([ut({attribute:!1})],Aa.prototype,"api",void 0),t([ut({type:String})],Aa.prototype,"layout",void 0),t([ut({type:String})],Aa.prototype,"mode",void 0),t([vt()],Aa.prototype,"_message",void 0),t([vt()],Aa.prototype,"_busy",void 0),gt("pv-settings-pins",Aa);class za extends dt{render(){return V`
      <p class="name">PlanaVista</p>
      <p class="version">Version ${Ns}</p>
      <ul>
        <li><a href="https://github.com/tavenhall1/planavista" target="_blank" rel="noopener noreferrer">Project on GitHub</a></li>
        <li><a href="https://github.com/tavenhall1/planavista/issues" target="_blank" rel="noopener noreferrer">Report a problem</a></li>
      </ul>
    `}}za.styles=[re,n`
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
    `],gt("pv-settings-about",za);class Ma{constructor(t){this._host=t,this._watched=null,this._unsubscribe=null,this._fallback=new es(()=>t.requestUpdate()),t.addController(this)}get edits(){return this._host.drafts?.get("appearance")??this._fallback}hostConnected(){this._watch()}hostUpdate(){this._watch()}hostDisconnected(){this._unsubscribe?.(),this._unsubscribe=null,this._watched=null,this.edits.flush()}current(){return this.edits.current(fs(this._host.data?.display))}set(t,e){this.edits.set(t,t=>this._host.api.saveConfig({display:t}),t=>this._error(t),function(t){if(!t)return;const e=t;if("number"==typeof e.clientX&&e.detail>0)return{x:e.clientX,y:e.clientY};const i=t.currentTarget;if(!i?.getBoundingClientRect)return;const s=i.getBoundingClientRect();return{x:s.left+s.width/2,y:s.top+s.height/2}}(e))}_watch(){const t=this.edits;t!==this._watched&&(this._unsubscribe?.(),this._watched=t,this._unsubscribe=t.subscribe(()=>this._host.requestUpdate()))}_error(t){this._host.dispatchEvent(new CustomEvent(wi,{detail:{message:ki(_i(t))},bubbles:!0,composed:!0}))}}const Pa={background:{min:4.5,message:t=>`Text is hard to read on the ${t} background.`,ratio:t=>jt(t["--pv-text"],t["--pv-card-bg"]),fix:(t,e)=>Qt(t["--pv-bg"],t["--pv-text"],e)},accent:{min:3,message:t=>`The ${t} accent is hard to see on this background.`,ratio:t=>jt(t["--pv-accent"],t["--pv-card-bg"]),fix:(t,e)=>Qt(t["--pv-accent"],t["--pv-card-bg"],e)},header:{min:4.5,message:t=>`Text on the ${t} header is hard to read.`,ratio:t=>Lt(t["--pv-header-gradient"])?jt(t["--pv-header-text"],t["--pv-header-gradient"]):null,fix:(t,e)=>Qt(t["--pv-header-gradient"],t["--pv-header-text"],e)},now_color:{min:3,message:t=>`The ${t} now line is hard to see on this background.`,ratio:t=>jt(t["--pv-now-color"],t["--pv-card-bg"]),fix:(t,e)=>Qt(t["--pv-now-color"],t["--pv-card-bg"],e)}},Ta=Object.keys(Pa);function Ba(t,e){const i=t.ratio(e);return null!==i&&i<t.min}function Oa(t,e,i,s){return{...t,[e]:{...t[e],[i]:s}}}function Ia(t,e){const i="light"===e?t.light:t.dark;return Ta.filter(s=>void 0!==i[s]||"dark"===e&&void 0!==t.light[s])}const La=[{key:"accent",label:"Accent",token:"--pv-accent"},{key:"background",label:"Background",token:"--pv-bg"},{key:"header",label:"Header",token:"--pv-header-gradient"},{key:"now_color",label:"Now line",token:"--pv-now-color"}],Ra=[{key:"plain",label:"Plain"},{key:"gradient_purple",label:"Purple"},{key:"gradient_teal",label:"Teal"},{key:"gradient_sunset",label:"Sunset"},{key:"solid_accent",label:"Accent"},{key:"solid_dark",label:"Dark"}],Ha={light:"Light",dark:"Dark"},Na=[{key:"corner_style",label:"Corners",options:[["sharp","Sharp"],["rounded","Rounded"],["pill","Pill"]]},{key:"shadow_depth",label:"Shadows",options:[["none","None"],["subtle","Subtle"],["bold","Bold"]]},{key:"event_style",label:"Events",options:[["stripes","Stripes"],["solid","Solid"]]}];class ja extends dt{constructor(){super(...arguments),this.household=null,this.layout="landscape",this.mode="settings",this.drafts=new Map,this._open=null,this._confirmReset=!1,this._page=new Ma(this),this._onResetChoice=t=>{t.stopPropagation(),this._confirmReset=!1,"reset"===t.detail.id&&(this._open=null,this._page.set({colors_light:{},colors_dark:{}}))}}render(){if(!this.data)return W;const t=this._page.current(),e=_s(t),i=function(t){const e=[];for(const i of["light","dark"]){const s=qe(t,i);for(const a of Ia(t,i)){const r=Pa[a];if(Ba(r,s))for(const n of[0,.5,1,1.5,2,3]){const o=r.fix(s,r.min+n);if(o&&!Ba(r,qe(Oa(t,i,a,o),i))){e.push({mode:i,key:a,message:r.message(i),fix:o});break}}}}return e}(e),s=ds[t.theme_pair],a=Object.keys(t.colors_light).length+Object.keys(t.colors_dark).length>0;return V`
      <section>
        <h2 class="section-heading">Colors</h2>
        <div class="issues" aria-live="polite">${i.map(t=>V`
          <p class="issue">
            <span>⚠ ${t.message}</span>
            <button class="pv-btn pv-btn-secondary" type="button"
              @click=${e=>this._setColor(t.mode,t.key,t.fix,e)}>Fix it</button>
          </p>
        `)}</div>
        ${this._renderColors(e)}
        <p class="help">Dark colors follow your light ones until you change them. Matched means PlanaVista picks a dark color that goes with your light one; choose Matched again to go back.</p>
      </section>
      <section>
        <h2 class="section-heading">Shape, for both versions</h2>
        ${this._renderShape(t.shape)}
      </section>
      <section>
        <button class="pv-btn pv-btn-secondary reset" type="button" ?disabled=${!a}
          @click=${()=>{this._confirmReset=!0}}>Reset ${s} to its original colors</button>
      </section>
      ${this._confirmReset?V`
        <pv-notice-sheet
          .layout=${this.layout}
          heading=${`Reset ${s} to its original colors?`}
          body="Your light and dark colors go back to the theme's own. Corners, shadows, and the other shape settings stay."
          .actions=${[{id:"cancel",label:"Cancel",kind:"secondary"},{id:"reset",label:"Reset",kind:"destructive"}]}
          @pv-sheet-action=${this._onResetChoice}
        ></pv-notice-sheet>
      `:W}
    `}_renderColors(t){const e={light:qe(t,"light"),dark:qe(t,"dark")};return V`
      <table>
        <thead>
          <tr><td></td><th scope="col">Light</th><th scope="col">Dark</th></tr>
        </thead>
        <tbody>
          ${La.map(i=>V`
            <tr>
              <th scope="row">${i.label}</th>
              ${["light","dark"].map(s=>{const a=this._open?.key===i.key&&this._open.mode===s,r=this._caption(t,s,i.key);return V`
                  <td>
                    <button class="cell" type="button" aria-expanded=${a?"true":"false"}
                      aria-label=${`${i.label}, ${Ha[s]}: ${r}`}
                      @click=${()=>{this._open=a?null:{key:i.key,mode:s}}}>
                      <span class="swatch" style="background: ${e[s][i.token]}"></span>
                      <span class="caption">${r}</span>
                    </button>
                  </td>
                `})}
            </tr>
            ${this._open?.key===i.key?V`
              <tr>
                <td colspan="3">${this._renderEditor(t,this._open.mode,i.key)}</td>
              </tr>
            `:W}
          `)}
        </tbody>
      </table>
    `}_caption(t,e,i){const s=t[e][i];if(void 0===s)return"dark"===e&&void 0!==t.light[i]?"Matched":"Original";if("header"===i){const t=Ra.find(t=>t.key===s);if(t)return t.label}return s.toUpperCase()}_renderEditor(t,e,i){const s=t[e][i],a="light"===e?"Original":"Matched",r=s&&s.startsWith("#")?s:"";return V`
      <div class="editor" aria-label=${`${La.find(t=>t.key===i)?.label} for ${Ha[e]}`} role="group">
        <div class="pill-group">
          <button class="pill-btn ${void 0===s?"pill-btn--active":""}" type="button"
            aria-pressed=${void 0===s?"true":"false"}
            @click=${t=>this._setColor(e,i,void 0,t)}>${a}</button>
          ${"header"===i?Ra.map(t=>V`
            <button class="pill-btn ${s===t.key?"pill-btn--active":""}" type="button"
              aria-pressed=${s===t.key?"true":"false"}
              @click=${s=>this._setColor(e,i,t.key,s)}>${t.label}</button>
          `):W}
        </div>
        <pv-color-swatch-picker
          .value=${r}
          @color-change=${t=>{t.stopPropagation(),this._setColor(e,i,t.detail.color,t)}}
        ></pv-color-swatch-picker>
      </div>
    `}_renderShape(t){const e=t.avatar_border??"primary",i="primary"!==e&&"white"!==e&&"light"!==e;return V`
      <div class="shape">
        ${Na.map(e=>{const i=t[e.key]??("event_style"===e.key?"stripes":void 0);return V`
            <div role="group" aria-label=${e.label}>
              <span class="shape-label">${e.label}</span>
              <div class="pill-group">
                ${e.options.map(([t,s])=>V`
                  <button class="pill-btn ${i===t?"pill-btn--active":""}" type="button"
                    aria-pressed=${i===t?"true":"false"}
                    @click=${i=>this._setShape({[e.key]:t},i)}>${s}</button>
                `)}
              </div>
            </div>
          `})}
        <div role="group" aria-label="Avatar border">
          <span class="shape-label">Avatar border</span>
          <div class="pill-group">
            <button class="pill-btn ${"primary"===e?"pill-btn--active":""}" type="button"
              aria-pressed=${"primary"===e?"true":"false"}
              @click=${t=>this._setShape({avatar_border:"primary"},t)}>Their color</button>
            <button class="pill-btn ${"white"===e||"light"===e?"pill-btn--active":""}" type="button"
              aria-pressed=${"white"===e||"light"===e?"true":"false"}
              @click=${t=>this._setShape({avatar_border:"white"},t)}>White</button>
            <button class="pill-btn ${i?"pill-btn--active":""}" type="button"
              aria-pressed=${i?"true":"false"}
              @click=${t=>this._setShape({avatar_border:i?e:"#4D8FD9"},t)}>Custom</button>
          </div>
          ${i?V`
            <label class="border-custom">
              <input type="color" .value=${e}
                @input=${t=>this._setShape({avatar_border:t.target.value},t)}>
              <span>${e.toUpperCase()}</span>
            </label>
          `:W}
        </div>
      </div>
    `}_setColor(t,e,i,s){const a=this._page.current(),r={..."light"===t?a.colors_light:a.colors_dark};void 0===i?delete r[e]:r[e]=i,this._page.set("light"===t?{colors_light:r}:{colors_dark:r},s)}_setShape(t,e){this._page.set({shape:{...this._page.current().shape,...t}},e)}}ja.styles=[oe,ce,gi,n`
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
    `],t([ut({attribute:!1})],ja.prototype,"hass",void 0),t([ut({attribute:!1})],ja.prototype,"data",void 0),t([ut({attribute:!1})],ja.prototype,"household",void 0),t([ut({attribute:!1})],ja.prototype,"api",void 0),t([ut({type:String,reflect:!0})],ja.prototype,"layout",void 0),t([ut({type:String})],ja.prototype,"mode",void 0),t([ut({attribute:!1})],ja.prototype,"drafts",void 0),t([vt()],ja.prototype,"_open",void 0),t([vt()],ja.prototype,"_confirmReset",void 0),gt("pv-settings-customize",ja);const Ua=["#4D8FD9","#F3722C","#43AA8B"],Va={sun:"",schedule:"",home_assistant:"Each screen follows its own Home Assistant theme setting. Handy for phones."};function qa(t,e){const i=[`--p-page: ${t["--pv-bg"]}`,`--p-card: ${t["--pv-card-bg"]}`,`--p-header: ${t["--pv-header-gradient"]}`,`--p-accent: ${t["--pv-accent"]}`,`--p-line: ${t["--pv-border"]}`].join("; ");return V`
    <span class="pic" style=${i}>
      <span class="pic-header"></span>
      <span class="pic-bar"><span class="pic-tab"></span></span>
      <span class="pic-cols">
        ${Ua.map(t=>V`<span class="pic-col" style="--p-person: ${Ye(t,void 0,e).color}"></span>`)}
      </span>
    </span>
  `}class Ya extends dt{constructor(){super(...arguments),this.household=null,this.layout="landscape",this.mode="settings",this.drafts=new Map,this._page=new Ma(this)}render(){if(!this.data)return W;const t=this._page.current(),e=_s(t);return V`
      <section>
        ${this._renderModes(e,t.appearance)}
      </section>
      ${"automatic"===t.appearance?V`
        <section>
          ${this._heading("When to switch","switch-heading")}
          ${this._renderSwitch(t.appearance_switch,t.light_from,t.dark_from)}
        </section>
      `:W}
      <section>
        ${this._heading("Theme","theme-heading")}
        ${this._renderThemes(e)}
        <p class="help">Every theme has a light and a dark version. Automatic moves between them.</p>
      </section>
      ${"settings"===this.mode?V`
        <section>
          <button class="link-row" type="button" @click=${()=>this._customize(t.theme_pair)}>
            <span class="row-text">
              <span class="row-title">Customize ${ds[t.theme_pair]}</span>
              <span class="row-help">Light and dark colors, corners, shadows</span>
            </span>
            <span class="chevron" aria-hidden="true">›</span>
          </button>
        </section>
        <section>
          ${this._heading("Motion","motion-heading")}
          ${this._renderMotion(t.motion)}
          <p class="help">Reduced swaps movement for quick fades. Follow the device uses this screen's own setting.</p>
        </section>
      `:W}
    `}_heading(t,e){return V`<h2 class="section-heading" id=${e}>${t}</h2>`}_renderModes(t,e){const i=qe(t,"light"),s=qe(t,"dark");return V`
      <div class="modes" role="radiogroup" aria-label="Appearance"
        @keydown=${t=>this._arrows(t,as,e,e=>this._page.set({appearance:e},t))}>
        ${as.map(t=>V`
          <button class="mode-option" type="button" role="radio" data-value=${t}
            aria-checked=${t===e?"true":"false"}
            tabindex=${t===e?"0":"-1"}
            @click=${e=>this._page.set({appearance:t},e)}>
            <span class="frame">
              ${"automatic"===t?V`<span class="pic-pair split">${qa(i,"light")}<span class="pic-over">${qa(s,"dark")}</span></span>`:qa("dark"===t?s:i,"dark"===t?"dark":"light")}
              <span class="badge" aria-hidden="true">✓</span>
            </span>
            <span class="option-label">${ls[t]}</span>
          </button>
        `)}
      </div>
    `}_renderSwitch(t,e,i){const s=is(this.hass?.states),a="24h"===this.data.display?.time_format?"24h":"12h",r=s?function(t,e,i){if(!t)return null;const s=ks(t.next_rising,e),a=ks(t.next_setting,e);if(!s||!a)return null;if("below_horizon"===t.state)return`Light at ${Fs(s,i)}, dark again at ${Fs(a,i)}.`;const r=function(t,e){return t.getFullYear()===e.getFullYear()&&t.getMonth()===e.getMonth()&&t.getDate()===e.getDate()}(a,e)?" tonight":"";return`Dark at ${Fs(a,i)}${r}, light again at ${Fs(s,i)}.`}(s,new Date,a)??"Uses your home's location in Home Assistant.":"Home Assistant's Sun integration isn't set up, so the schedule's times are used until it is.",n={...Va,sun:r};return V`
      <div class="rows" role="radiogroup" aria-labelledby="switch-heading"
        @keydown=${e=>this._arrows(e,rs,t,t=>this._page.set({appearance_switch:t},e))}>
        ${rs.map(s=>V`
          <button class="row" type="button" role="radio" data-value=${s}
            aria-checked=${s===t?"true":"false"}
            tabindex=${s===t?"0":"-1"}
            @click=${t=>this._page.set({appearance_switch:s},t)}>
            <span class="dot" aria-hidden="true"></span>
            <span class="row-text">
              <span class="row-title">${cs[s]}</span>
              ${n[s]?V`<span class="row-help">${n[s]}</span>`:W}
            </span>
          </button>
          ${"schedule"===s&&"schedule"===t?V`
            <div class="times">
              <label>Light from
                <input class="pv-input" type="time" .value=${e}
                  @change=${t=>this._time("light_from",t)}>
              </label>
              <label>Dark from
                <input class="pv-input" type="time" .value=${i}
                  @change=${t=>this._time("dark_from",t)}>
              </label>
            </div>
          `:W}
        `)}
      </div>
    `}_renderThemes(t){return V`
      <div class="themes" role="radiogroup" aria-labelledby="theme-heading"
        @keydown=${e=>this._arrows(e,ns,t.pair,t=>this._page.set({theme_pair:t},e))}>
        ${ns.map(e=>{const i={...t,pair:e};return V`
            <button class="theme" type="button" role="radio" data-value=${e}
              aria-checked=${e===t.pair?"true":"false"}
              tabindex=${e===t.pair?"0":"-1"}
              @click=${t=>this._page.set({theme_pair:e},t)}>
              <span class="pic-pair halves">
                ${qa(qe(i,"light"),"light")}
                <span class="pic-over">${qa(qe(i,"dark"),"dark")}</span>
              </span>
              <span class="option-label">${ds[e]}</span>
              <span class="badge" aria-hidden="true">✓</span>
            </button>
          `})}
      </div>
    `}_renderMotion(t){return V`
      <div class="seg" role="radiogroup" aria-labelledby="motion-heading"
        @keydown=${e=>this._arrows(e,os,t,t=>this._page.set({motion:t},e))}>
        ${os.map(e=>V`
          <button class="seg-btn" type="button" role="radio" data-value=${e}
            aria-checked=${e===t?"true":"false"}
            tabindex=${e===t?"0":"-1"}
            @click=${t=>this._page.set({motion:e},t)}>${ps[e]}</button>
        `)}
      </div>
    `}_arrows(t,e,i,s){if("radio"!==t.target.getAttribute?.("role"))return;const a="ArrowRight"===t.key||"ArrowDown"===t.key?1:"ArrowLeft"===t.key||"ArrowUp"===t.key?-1:0;if(!a)return;t.preventDefault();const r=Math.max(0,e.indexOf(i)),n=e[(r+a+e.length)%e.length];s(n);const o=t.currentTarget;this.updateComplete.then(()=>o.querySelector(`[data-value='${n}']`)?.focus())}_time(t,e){const i=e.target.value.slice(0,5);/^([01]\d|2[0-3]):[0-5]\d$/.test(i)&&this._page.set("light_from"===t?{light_from:i}:{dark_from:i},e)}_customize(t){const e={tag:"pv-settings-customize",title:`Customize ${ds[t]}`,back:"Appearance"};this.dispatchEvent(new CustomEvent(bi,{detail:e,bubbles:!0,composed:!0}))}}Ya.styles=[oe,ce,gi,n`
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
    `],t([ut({attribute:!1})],Ya.prototype,"hass",void 0),t([ut({attribute:!1})],Ya.prototype,"data",void 0),t([ut({attribute:!1})],Ya.prototype,"household",void 0),t([ut({attribute:!1})],Ya.prototype,"api",void 0),t([ut({type:String,reflect:!0})],Ya.prototype,"layout",void 0),t([ut({type:String})],Ya.prototype,"mode",void 0),t([ut({attribute:!1})],Ya.prototype,"drafts",void 0),gt("pv-appearance-editor",Ya);class Wa extends dt{constructor(){super(...arguments),this.household=null,this.layout="landscape",this.mode="settings",this.drafts=new Map}render(){return V`
      <pv-appearance-editor
        .hass=${this.hass}
        .data=${this.data}
        .household=${this.household}
        .api=${this.api}
        .layout=${this.layout}
        .drafts=${this.drafts}
        mode="settings"
      ></pv-appearance-editor>
    `}}Wa.styles=n`
    :host {
      display: block;
    }
  `,t([ut({attribute:!1})],Wa.prototype,"hass",void 0),t([ut({attribute:!1})],Wa.prototype,"data",void 0),t([ut({attribute:!1})],Wa.prototype,"household",void 0),t([ut({attribute:!1})],Wa.prototype,"api",void 0),t([ut({type:String})],Wa.prototype,"layout",void 0),t([ut({type:String})],Wa.prototype,"mode",void 0),t([ut({attribute:!1})],Wa.prototype,"drafts",void 0),gt("pv-settings-appearance",Wa);class Ka extends dt{constructor(){super(...arguments),this.household=null,this.layout="landscape",this.session=null,this.sessionEndsAt=0,this.parent=null,this.drafts=new Map,this._selected=null,this._stack=[],this._toast="",this._back=async()=>{await this._mayLeave()&&(this._stack.length>0?this._stack=this._stack.slice(0,-1):this._selected=null)},this._done=async()=>{await this._mayLeave()&&this.dispatchEvent(new CustomEvent("pv-settings-close",{bubbles:!0,composed:!0}))},this._onPush=t=>{t.stopPropagation(),this._stack=[...this._stack,t.detail]},this._onPop=t=>{t.stopPropagation(),this._stack=this._stack.slice(0,-1)},this._onError=t=>{t.stopPropagation(),this._toast=t.detail.message,window.clearTimeout(this._toastTimer),this._toastTimer=window.setTimeout(()=>{this._toast=""},4e3)}}connectedCallback(){super.connectedCallback(),this.addEventListener(bi,this._onPush),this.addEventListener(xi,this._onPop),this.addEventListener(wi,this._onError)}disconnectedCallback(){super.disconnectedCallback(),this.removeEventListener(bi,this._onPush),this.removeEventListener(xi,this._onPop),this.removeEventListener(wi,this._onError),window.clearTimeout(this._toastTimer)}_context(){return{household:this.household,data:this.data}}get _split(){return"landscape"===this.layout}_current(t){return t.find(t=>t.id===this._selected)??(this._split?t[0]:void 0)}render(){const t=Ui.pages(this._context()),e=this._current(t),i=this._stack[this._stack.length-1],s=!this._split&&e;return V`
      ${this.session?.parent&&this.parent?V`
        <pv-parent-strip .member=${this.parent} .hass=${this.hass} .endsAt=${this.sessionEndsAt}></pv-parent-strip>
      `:W}
      <div class="bar">
        ${s?V`<button class="back" type="button" @click=${this._back}>‹ ${i?i.back:"Settings"}</button>`:V`<h1 class="title">Settings</h1>`}
        <button class="pv-btn pv-btn-primary done" type="button" @click=${this._done}>Done</button>
      </div>
      <div class="body">
        ${this._split||!e?this._renderList(t,e):W}
        ${e?this._renderPage(e,i):W}
      </div>
      ${this._toast?V`<div class="toast" role="status">${this._toast}</div>`:W}
    `}_renderList(t,e){const i=this._context();return V`
      <nav class="list" aria-label="Settings">
        ${function(t,e=ji){const i=new Set(e.map(t=>t.id)),s=[...new Set(t.map(t=>t.group).filter(t=>!i.has(t)))].map(t=>({id:t,label:null,order:1e3}));return[...e,...s].sort((t,e)=>t.order-e.order).map(e=>({group:e,pages:t.filter(t=>t.group===e.id)})).filter(t=>t.pages.length>0)}(t).map(({group:t,pages:s})=>V`
          <section class="group">
            ${t.label?V`<h2 class="group-label">${t.label}</h2>`:W}
            ${s.map(t=>{const s=this._split&&e?.id===t.id;return V`
                <button class="row ${s?"row--active":""}" type="button"
                  aria-current=${s?"page":"false"}
                  @click=${()=>this._select(t.id)}>
                  <span class="row-text">
                    <span class="row-label">${t.label}</span>
                    ${t.summary?V`<span class="row-value">${t.summary(i)}</span>`:W}
                  </span>
                  <span class="chevron" aria-hidden="true">›</span>
                </button>
              `})}
          </section>
        `)}
      </nav>
    `}_renderPage(t,e){const i=Qi(e?e.tag:t.tag),s=e?e.title:t.label,a=[t.id,...this._stack.map(t=>`${t.tag}:${JSON.stringify(t.props??{})}`)].join("/");return V`
      <section class="page" aria-label=${s}>
        ${this._split&&e?V`<button class="back" type="button" @click=${this._back}>‹ ${e.back}</button>`:W}
        <h1 class="page-heading">${s}</h1>
        ${this.household&&!this.household.available?V`<p class="banner">People and PINs can't be changed until PlanaVista is updated.</p>`:W}
        ${_a(a,Ji`
          <${i}
            class="page-el"
            .hass=${this.hass}
            .data=${this.data}
            .household=${this.household}
            .api=${this.api}
            .layout=${this.layout}
            mode="settings"
            .pageProps=${e?.props??{}}
            .drafts=${this.drafts}
          ></${i}>
        `)}
      </section>
    `}async _mayLeave(){const t=this.renderRoot.querySelector(".page-el");return!t?.confirmLeave||t.confirmLeave()}async _select(t){t===this._selected&&0===this._stack.length||await this._mayLeave()&&(this._stack=[],this._selected=t)}}Ka.styles=[re,oe,n`
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
    `],t([ut({attribute:!1})],Ka.prototype,"hass",void 0),t([ut({attribute:!1})],Ka.prototype,"data",void 0),t([ut({attribute:!1})],Ka.prototype,"household",void 0),t([ut({attribute:!1})],Ka.prototype,"api",void 0),t([ut({type:String,reflect:!0})],Ka.prototype,"layout",void 0),t([ut({attribute:!1})],Ka.prototype,"session",void 0),t([ut({type:Number})],Ka.prototype,"sessionEndsAt",void 0),t([ut({attribute:!1})],Ka.prototype,"parent",void 0),t([ut({attribute:!1})],Ka.prototype,"drafts",void 0),t([vt()],Ka.prototype,"_selected",void 0),t([vt()],Ka.prototype,"_stack",void 0),t([vt()],Ka.prototype,"_toast",void 0),gt("pv-settings",Ka);const Ga=["#F94144","#277DA1","#43AA8B","#F9C74F"];class Xa extends dt{render(){const t=2*Math.PI*30;return V`
      <div class="rings" aria-hidden="true">
        ${Ga.map(e=>V`
          <svg width=${72} height=${72} viewBox="0 0 ${72} ${72}">
            ${q`
              <circle cx="36" cy="36" r=${30} fill="none" stroke=${e} stroke-width="8" opacity="0.2"></circle>
              <circle cx="36" cy="36" r=${30} fill="none" stroke=${e} stroke-width="8"
                stroke-linecap="round" stroke-dasharray=${t} stroke-dashoffset=${.25*t}></circle>
            `}
          </svg>
        `)}
      </div>
    `}}Xa.styles=n`
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
  `,gt("pv-setup-welcome",Xa);class Qa extends dt{constructor(){super(...arguments),this.household=null,this.layout="landscape",this.mode="setup",this._rows=[],this._name="",this._message="",this._built=!1,this._added=0,this._add=()=>{var t,e;this._name.trim()&&(this._rows=[...this._rows,(t=this._name,e=this._added++,{key:`new:${e}`,name:t.trim(),person:null,memberId:null,role:"adult",checked:!0})],this._name="")}}willUpdate(){if(!this._built&&this.hass&&this.household){const t=Object.values(this.hass.states).filter(t=>t.entity_id.startsWith("person.")).map(t=>({entity_id:t.entity_id,name:t.attributes.friendly_name??t.entity_id,user_id:t.attributes.user_id??null})).sort((t,e)=>t.name.localeCompare(e.name));this._rows=function(t,e,i){const s=t.map(t=>({key:t.id,name:t.name,person:t.person,memberId:t.id,role:Di(t),checked:!0}));for(const a of e){if(t.some(t=>t.person===a.entity_id))continue;const e=!!i&&a.user_id===i;s.push({key:a.entity_id,name:a.name,person:a.entity_id,memberId:null,role:e?"parent":"adult",checked:!0})}return s}(this.household.members,t,this.hass.user?.id??null),this._built=!0}}async commit(){const t=this.household?.members??[],e=function(t,e){const i={add:[],update:[],remove:[]};for(const s of t){const t=s.memberId?e.find(t=>t.id===s.memberId):void 0;t?s.checked?s.role!==Di(t)&&i.update.push({id:t.id,changes:Si(s.role)}):i.remove.push(t.id):s.checked&&s.name.trim()&&i.add.push({name:s.name.trim(),...Si(s.role),...s.person?{person:s.person}:{}})}return i}(this._rows,t);this._message="";try{for(const t of e.remove)await this.api.deleteMember(t);for(const{id:i,changes:s}of e.update){const e=t.find(t=>t.id===i);await this.api.saveMember(s,e?{id:i,rev:e.rev}:void 0)}for(const t of e.add)await this.api.saveMember(t);return!0}catch(t){return this._message=t?.message||ki(_i(t)),!1}finally{this._built=!1,this.requestUpdate()}}render(){return V`
      <ul>
        ${this._rows.map((t,e)=>V`
          <li>
            <label class="check">
              <input type="checkbox" .checked=${t.checked} aria-label="${t.name} lives here"
                @change=${t=>this._update(e,{checked:t.target.checked})} />
            </label>
            <pv-member-avatar
              .member=${{name:t.name,color:this.household?.members.find(e=>e.id===t.memberId)?.color??"#9CA3AF",picture:t.person?{person:!0}:{initial:!0},person:t.person}}
              .hass=${this.hass}
              size="40"
            ></pv-member-avatar>
            <span class="name">${t.name}</span>
            <select class="pv-input pv-select role" aria-label="What ${t.name} is"
              ?disabled=${!t.checked}
              @change=${t=>this._update(e,{role:t.target.value})}>
              ${Ci.map(e=>V`<option value=${e.id} ?selected=${t.role===e.id}>${e.label}</option>`)}
            </select>
          </li>
        `)}
      </ul>
      <div class="add">
        <input class="pv-input" type="text" maxlength="40" placeholder="Someone without Home Assistant"
          aria-label="Name of someone to add"
          .value=${this._name}
          @input=${t=>{this._name=t.target.value}}
          @keydown=${t=>{"Enter"===t.key&&this._add()}} />
        <button class="pv-btn pv-btn-secondary" type="button" ?disabled=${!this._name.trim()} @click=${this._add}>Add someone</button>
      </div>
      ${this._message?V`<p class="message" role="alert">${this._message}</p>`:W}
    `}_update(t,e){this._rows=this._rows.map((i,s)=>s===t?{...i,...e}:i)}}Qa.styles=[re,oe,ce,n`
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
    `],t([ut({attribute:!1})],Qa.prototype,"hass",void 0),t([ut({attribute:!1})],Qa.prototype,"data",void 0),t([ut({attribute:!1})],Qa.prototype,"household",void 0),t([ut({attribute:!1})],Qa.prototype,"api",void 0),t([ut({type:String})],Qa.prototype,"layout",void 0),t([ut({type:String})],Qa.prototype,"mode",void 0),t([vt()],Qa.prototype,"_rows",void 0),t([vt()],Qa.prototype,"_name",void 0),t([vt()],Qa.prototype,"_message",void 0),gt("pv-setup-people",Qa);class Za extends dt{constructor(){super(...arguments),this.household=null,this.layout="landscape",this.mode="setup",this.drafts=new Map}render(){return V`
      <pv-appearance-editor
        .hass=${this.hass}
        .data=${this.data}
        .household=${this.household}
        .api=${this.api}
        .layout=${this.layout}
        .drafts=${this.drafts}
        mode="setup"
      ></pv-appearance-editor>
    `}}function Ja(t,e,i){const s={};return"12"===e?.time_format&&(s.time_format="12h"),"24"===e?.time_format&&(s.time_format="24h"),"monday"!==e?.first_weekday&&"sunday"!==e?.first_weekday||(s.first_day=e.first_weekday),!t.weather_entity&&i.length>0&&(s.weather_entity=[...i].sort()[0]),s}Za.styles=n`
    :host {
      display: block;
    }
  `,t([ut({attribute:!1})],Za.prototype,"hass",void 0),t([ut({attribute:!1})],Za.prototype,"data",void 0),t([ut({attribute:!1})],Za.prototype,"household",void 0),t([ut({attribute:!1})],Za.prototype,"api",void 0),t([ut({type:String})],Za.prototype,"layout",void 0),t([ut({type:String})],Za.prototype,"mode",void 0),t([ut({attribute:!1})],Za.prototype,"drafts",void 0),gt("pv-setup-look",Za);class tr extends dt{constructor(){super(...arguments),this.household=null,this.layout="landscape",this.mode="setup",this._message=""}async commit(){this._message="";try{const t=Object.keys(this.hass.states).filter(t=>t.startsWith("weather.")),e=this.hass.locale;return await this.api.saveConfig({display:Ja(this.data.display,e,t),onboarding_complete:!0}),await this.api.saveSetup({completed:!0,step:null}),!0}catch(t){return this._message=ki(_i(t)),!1}}render(){return V`
      <ul>
        <li>Tap the gear to change anything later.</li>
        <li>On a shared screen, Settings asks for a parent's PIN.</li>
      </ul>
      ${this._message?V`<p class="message" role="alert">${this._message}</p>`:W}
    `}}tr.styles=[re,n`
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
    `],t([ut({attribute:!1})],tr.prototype,"hass",void 0),t([ut({attribute:!1})],tr.prototype,"data",void 0),t([ut({attribute:!1})],tr.prototype,"household",void 0),t([ut({attribute:!1})],tr.prototype,"api",void 0),t([ut({type:String})],tr.prototype,"layout",void 0),t([ut({type:String})],tr.prototype,"mode",void 0),t([vt()],tr.prototype,"_message",void 0),gt("pv-setup-done",tr);class er extends dt{constructor(){super(...arguments),this.household=null,this.layout="landscape",this.drafts=new Map,this._index=0,this._busy=!1,this._toast="",this._started=!1,this._next=async()=>{if(this._busy)return;const t=this.renderRoot.querySelector(".step-el");this._busy=!0;try{if(t?.commit&&!await t.commit())return;const e=this._steps();if(this._index>=e.length-1)return void this.dispatchEvent(new CustomEvent("onboarding-complete",{bubbles:!0,composed:!0}));this._index+=1,this._remember(e[this._index].id)}finally{this._busy=!1}},this._back=()=>{0===this._index||this._busy||(this._index-=1,this._remember(this._steps()[this._index].id))}}disconnectedCallback(){super.disconnectedCallback(),window.clearTimeout(this._toastTimer)}willUpdate(){!this._started&&this.data&&(this._index=function(t,e){const i=e?t.findIndex(t=>t.id===e):-1;return i>=0?i:0}(this._steps(),this.household?.setup.step??null),this._started=!0)}_steps(){return Vi.pages({household:this.household,data:this.data})}render(){const t=this._steps();if(0===t.length)return W;const e=Math.min(this._index,t.length-1),i=t[e],s=e===t.length-1,a=Qi(i.tag);return V`
      <div class="top">
        <button class="back ${0===e?"hidden":""}" type="button"
          ?disabled=${0===e||this._busy}
          aria-hidden=${0===e?"true":"false"}
          @click=${this._back}>‹ Back</button>
        <div class="progress-dots" role="img" aria-label="Step ${e+1} of ${t.length}">
          ${t.map((t,i)=>V`<div class="dot ${i===e?"dot--active":""}"></div>`)}
        </div>
        <span></span>
      </div>
      <div class="content">
        <div class="column">
          <h1 class="heading">${i.heading}</h1>
          ${i.lead?V`<p class="lead">${i.lead}</p>`:W}
          ${_a(i.id,Ji`
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
      ${this._toast?V`<div class="toast" role="status">${this._toast}</div>`:W}
    `}_remember(t){this.api.saveSetup({step:t}).catch(t=>{this._toast=ki(_i(t)),window.clearTimeout(this._toastTimer),this._toastTimer=window.setTimeout(()=>{this._toast=""},4e3)})}}er.styles=[re,oe,n`
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
    `],t([ut({attribute:!1})],er.prototype,"hass",void 0),t([ut({attribute:!1})],er.prototype,"data",void 0),t([ut({attribute:!1})],er.prototype,"household",void 0),t([ut({attribute:!1})],er.prototype,"api",void 0),t([ut({type:String,reflect:!0})],er.prototype,"layout",void 0),t([ut({attribute:!1})],er.prototype,"drafts",void 0),t([vt()],er.prototype,"_index",void 0),t([vt()],er.prototype,"_busy",void 0),t([vt()],er.prototype,"_toast",void 0),gt("pv-setup",er);const ir="sensor.planavista_config";class sr extends dt{constructor(){super(),this._wizardOpen=!1,this._onboardingDone=!1,this._settingsOpen=!1,this._sheet=null,this._sheetOpener=null,this._drafts=new Map,this._settingsVia=null,this._views={},this._moduleId=null,this._household=new qs(this),this._session=new Zs(this,()=>this._api),this._layout=new Gs(this),this._forecast=new Ys(this,()=>this._display().weather_entity),this._appearanceEdits=new es(()=>this.requestUpdate()),this._moduleOverlay=!1,this._appearance=new Hs(this,this._appearanceEdits,()=>({display:this.hass?.states?.[this._entityId()]?.attributes?.display,cardTheme:this._config?.theme,sun:is(this.hass?.states),haDark:!!this.hass?.themes?.darkMode,overlayOpen:!!this._sheet||this._settingsOpen||this._wizardOpen||this._moduleOverlay}),async()=>{await this.updateComplete,await(this.renderRoot.querySelector(".pv-module")?.updateComplete)}),this._api=new fi({callWS:t=>this.hass.callWS(t)},()=>this._session.token,t=>this._session.ended(t)),this._dataFor=ve((t,e)=>this.hass?function(t,e="sensor.planavista_config"){const i=t.states[e];if(!i)return null;const s=i.attributes,a=s.events||[];return{calendars:s.calendars||[],events:a,display:s.display||{time_format:"12h",weather_entity:"",first_day:"sunday",default_view:"day",theme:"light"},onboarding_complete:s.onboarding_complete,version:s.version}}(this.hass,e):null),this._displayFor=ve((t,e)=>function(t,e){const i=e?.display;return{time_format:t?.time_format||i?.time_format||"12h",weather_entity:t?.weather_entity||i?.weather_entity||"",first_day:t?.first_day||i?.first_day||"sunday",default_view:t?.default_view||t?.view||i?.default_view||"week",theme:t?.theme||i?.theme||"light",theme_overrides:i?.theme_overrides,location_autocomplete:!0===i?.location_autocomplete}}(t,e)),this._modulesFor=ve(t=>function(t,e){let i=t;if(Array.isArray(e.modules)){const s=[];for(const i of e.modules){const e="string"==typeof i?t.find(t=>t.id===i):void 0;e&&!s.includes(e)&&s.push(e)}s.length>0&&(i=s)}const s="string"==typeof e.module?i.find(t=>t.id===e.module):void 0;return{shown:i,initial:s??i[0]}}(Hi.list(),t??{})),this._drafts.set("appearance",this._appearanceEdits)}shouldUpdate(t){if(1===t.size&&t.has("hass")){const e=t.get("hass"),i=t=>!!t?.themes?.darkMode;return!(!ss(this._appearance.settings).haDarkMode||i(e)===i(this.hass))||function(t,e,i){return t&&e?i.some(i=>t.states[i]!==e.states[i]):t!==e}(e,this.hass,this._watchedEntityIds())}return!0}_entityId(){return this._config?.entity||ir}_data(){const t=this._entityId();return this._dataFor(this.hass?.states?.[t],t)}_display(){return this._displayFor(this._config,this._data())}_modules(){return this._modulesFor(this._config)}_watchedEntityIds(){const t=this._data(),e=[this._entityId(),...ss(this._appearance.settings).entities],i=this._display().weather_entity;i&&e.push(i);for(const i of this._modules().shown)e.push(...i.watchedEntities({config:this._config,data:t}));return e}setConfig(t){this._config={entity:ir,...t},this._views={},this._moduleId=null}_activeModule(){const t=this._modules();return t.shown.find(t=>t.id===this._moduleId)??t.initial}willUpdate(t){super.willUpdate(t);const e=this._activeModule(),i=this._data();e&&i&&!(e.id in this._views)&&(this._views={...this._views,[e.id]:Li(e,{config:this._config,data:i})})}_setView(t){const e=this._activeModule();e&&this._views[e.id]!==t&&(this._views={...this._views,[e.id]:t})}connectedCallback(){super.connectedCallback(),function(t=document,e=import.meta.url){if(t.getElementById(zs))return;const i=t.createElement("style");i.id=zs,i.textContent=`@font-face{font-family:'PlanaVista Rounded';src:url('${function(t){const e=new URL(t),i=new URL("fonts/nunito-latin-wght.woff2",e);return i.search=e.search,i.href}(e)}') format('woff2');font-weight:200 1000;font-style:normal;font-display:swap}`,t.head.appendChild(i)}()}updated(t){super.updated(t),this._guardSettings()}_onOnboardingComplete(){this._wizardOpen=!1,this._onboardingDone=!0}_access(){const t=!!this.hass?.user?.is_admin;return this._household.ready?function(t,e){return t&&t.available?t.account.parent_level?"open":"shared"===t.account.kind||"other"===t.account.kind?Mi(t.members).length>0?"pin":"no_pin":"none":e?"open":"none"}(this._household.view,t):t?"open":"none"}_openSettings(t){this._sheetOpener=t?.composedPath?.()[0]??null;const e=this._access();"open"===e||this._session.session?.parent?(this._settingsVia="open"===e?"access":"session",this._settingsOpen=!0):"pin"===e?this._sheet={kind:"pin",purpose:"settings",heading:"Who's opening Settings?"}:"no_pin"===e&&(this._sheet={kind:"no_pin"})}_beginSetup(t){this._sheetOpener=t?.composedPath?.()[0]??null,"open"===this._access()||this._session.session?.parent?this._wizardOpen=!0:"pin"===this._access()&&(this._sheet={kind:"pin",purpose:"setup",heading:"Who's setting up PlanaVista?"})}_renderSetupCard(){const t=this._access(),e=V`
      <div class="pvc-setup-icon" aria-hidden="true">
        <svg viewBox="0 0 24 24" width="48" height="48" fill="currentColor">
          <path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V9h14v11zM9 14H7v-2h2v2zm4 0h-2v-2h2v2zm4 0h-2v-2h2v2zm-8 4H7v-2h2v2zm4 0h-2v-2h2v2zm4 0h-2v-2h2v2z"/>
        </svg>
      </div>
    `;return"open"!==t&&"pin"!==t?V`
        <div class="pvc-setup-pending">
          ${e}
          <p class="pvc-setup-title">PlanaVista isn't set up yet</p>
          <p class="pvc-setup-hint">An admin can set it up from their own Home Assistant login.</p>
        </div>
      `:V`
      <div class="pvc-setup-pending"
        role="button"
        tabindex="0"
        aria-label="Begin PlanaVista setup"
        @click=${this._beginSetup}
        @keydown=${t=>{"Enter"!==t.key&&" "!==t.key||(t.preventDefault(),this._beginSetup(t))}}
      >
        ${e}
        <p class="pvc-setup-title">PlanaVista</p>
        <p class="pvc-setup-hint">Tap to begin setup</p>
      </div>
    `}_onUnlocked(t){const e=this._sheet;this._session.unlocked(t.detail.result),this._closeSheet(),"pin"!==e?.kind||"settings"!==e.purpose&&"continue"!==e.purpose||(this._settingsVia="session",this._settingsOpen=!0),"pin"===e?.kind&&"setup"===e.purpose&&(this._wizardOpen=!0)}_onSheetCancel(){const t=this._sheet;this._closeSheet(),"pin"===t?.kind&&"continue"===t.purpose&&this._onSettingsClose()}_guardSettings(){if(!this._settingsOpen||this._session.session?.parent||this._sheet)return;const t=this._access();"open"!==t&&("access"!==this._settingsVia||"pin"!==t?this._onSettingsClose():this._sheet={kind:"pin",purpose:"continue",heading:"Enter a parent's PIN to keep changing settings"})}_closeSheet(){this._sheet=null;const t=this._sheetOpener;this._sheetOpener=null,t?.focus?.()}_renderSheet(){const t=this._sheet;if(!t)return W;const e=this._layout.layout;if("no_pin"===t.kind)return V`
        <pv-notice-sheet
          .layout=${e}
          heading="Settings needs a parent's PIN"
          body="On a shared screen, a parent opens Settings with their PIN, and no parent has one yet. Sign in to Home Assistant with a parent's or an admin's own account, then set one in Settings, PINs and parent mode."
          .actions=${[{id:"ok",label:"OK",kind:"primary"}]}
          @pv-sheet-action=${this._closeSheet}
        ></pv-notice-sheet>
      `;const i=this._household.view;return V`
      <pv-pin-sheet
        .hass=${this.hass}
        .api=${this._api}
        .layout=${e}
        mode="unlock"
        .members=${i?Mi(i.members):[]}
        .heading=${t.heading}
        .shuffle=${!!i?.security.shuffle_keypad}
        @pv-unlocked=${this._onUnlocked}
        @pv-sheet-close=${this._onSheetCancel}
      ></pv-pin-sheet>
    `}_renderParentStrip(){const t=this._session.session;if(!t?.parent)return W;const e=this._household.view?.members.find(e=>e.id===t.memberId);return e?V`
      <pv-parent-strip
        .member=${e}
        .hass=${this.hass}
        .endsAt=${this._session.endsAt??0}
        @pv-lock=${()=>this._session.lock()}
      ></pv-parent-strip>
    `:W}_onSettingsClose(){this._settingsOpen=!1,this._settingsVia=null}_onSettingsLock(){this._session.lock(),"open"!==this._access()&&this._onSettingsClose()}_getWeatherEntity(){const t=this._display().weather_entity;return t?this.hass?.states?.[t]:null}render(){if(!this._config||!this.hass)return W;const t=this._data();if(!t)return V`
        <ha-card>
          <div class="pvc-empty">
            <p>PlanaVista entity not found</p>
            <p style="font-size: 0.8rem;">Check that the PlanaVista integration is configured.</p>
          </div>
        </ha-card>
      `;if(!1===t.onboarding_complete&&!this._onboardingDone)return V`
        <ha-card>
          ${this._wizardOpen?V`
            <pv-setup
              .hass=${this.hass}
              .data=${t}
              .household=${this._household.view}
              .api=${this._api}
              .layout=${this._layout.layout}
              .drafts=${this._drafts}
              @onboarding-complete=${this._onOnboardingComplete}
            ></pv-setup>
          `:this._renderSetupCard()}
          ${this._renderSheet()}
        </ha-card>
      `;const e=this._display(),i=this._activeModule();return V`
      <ha-card>
        ${this._renderParentStrip()}
        ${this._config.hide_header?W:this._renderHeader(e)}
        ${i?this._renderModule(i,t,e):W}
        ${i?this._renderBar(i):W}
        ${this._settingsOpen?V`
          <div class="pvc-settings-overlay">
            <pv-settings
              .hass=${this.hass}
              .data=${t}
              .household=${this._household.view}
              .api=${this._api}
              .layout=${this._layout.layout}
              .session=${this._session.session}
              .sessionEndsAt=${this._session.endsAt??0}
              .parent=${this._household.view?.members.find(t=>t.id===this._session.session?.memberId)??null}
              .drafts=${this._drafts}
              @pv-settings-close=${this._onSettingsClose}
              @pv-lock=${this._onSettingsLock}
            ></pv-settings>
          </div>
        `:W}
        ${this._renderSheet()}
      </ha-card>
    `}_renderModule(t,e,i){const s=Qi(t.tag);return Ji`
      <${s}
        class="pv-module"
        layout=${this._layout.layout}
        .hass=${this.hass}
        .cardConfig=${this._config}
        .data=${e}
        .display=${i}
        .view=${this._views[t.id]}
        .mode=${this._appearance.mode}
        .shape=${this._appearance.look.shape}
        .forecast=${this._forecast.forecast}
        @pv-view-change=${t=>this._setView(t.detail.view)}
        @pv-overlay-change=${t=>{this._moduleOverlay=t.detail.open}}
      ></${s}>
    `}_renderHeader(t){const e=this._config?.hide_weather?null:this._getWeatherEntity();return V`
      <pv-glance-header
        layout=${this._layout.layout}
        .timeFormat=${t.time_format||"12h"}
        .weather=${e??null}
        .weatherEntity=${t.weather_entity}
        .today=${function(t){const e=Ft(new Date),i=t.find(t=>t.datetime&&Ft(xt(t.datetime))===e);return i&&"number"==typeof i.temperature?{high:Math.round(i.temperature),low:"number"==typeof i.templow?Math.round(i.templow):null}:null}(this._forecast.forecast)}
      ></pv-glance-header>
    `}_renderBar(t){return V`
      <pv-nav-bar
        layout=${this._layout.layout}
        .modules=${this._modules().shown.map(t=>({id:t.id,label:t.label,icon:t.icon}))}
        .activeModule=${t.id}
        .views=${t.views}
        .activeView=${this._views[t.id]??""}
        .canOpenSettings=${"none"!==this._access()}
        @pv-module-select=${t=>{this._moduleId=t.detail.id}}
        @pv-view-select=${t=>this._setView(t.detail.id)}
        @pv-open-settings=${this._openSettings}
      ></pv-nav-bar>
    `}static getConfigElement(){return document.createElement("planavista-calendar-card-editor")}static getStubConfig(){return{entity:ir}}getCardSize(){return 10}}var ar;sr.styles=[re,oe,ne,he,n`
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

    `],t([ut({attribute:!1})],sr.prototype,"hass",void 0),t([vt()],sr.prototype,"_config",void 0),t([vt()],sr.prototype,"_wizardOpen",void 0),t([vt()],sr.prototype,"_onboardingDone",void 0),t([vt()],sr.prototype,"_settingsOpen",void 0),t([vt()],sr.prototype,"_sheet",void 0),t([vt()],sr.prototype,"_views",void 0),t([vt()],sr.prototype,"_moduleId",void 0),t([vt()],sr.prototype,"_moduleOverlay",void 0),function(t=Ui,e=Vi){for(const e of Us)t.register(e);for(const t of Vs)e.register(t)}(),gt("planavista-calendar-card",sr),ar=sr,yt(()=>ft("planavista-card",class extends(customElements.get("planavista-calendar-card")??ar){}));const rr=["planavista-calendar-card","planavista-card"];var nr;window.customCards=window.customCards||[],(nr=window.customCards).some(t=>rr.includes(t.type))||nr.push({type:"planavista-calendar-card",name:"PlanaVista",description:"All-in-one calendar with clock, weather, toggles, and views",preview:!0}),console.info(`%c PLANAVISTA %c v${Ns} `,"color: white; background: #6366F1; font-weight: bold; border-radius: 4px 0 0 4px; padding: 2px 6px;","color: #6366F1; background: #EEF2FF; font-weight: bold; border-radius: 0 4px 4px 0; padding: 2px 6px;");
