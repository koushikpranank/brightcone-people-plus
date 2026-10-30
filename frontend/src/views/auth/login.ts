// Verbatim login templates from the supplied HTML, with typed state.
export function renderAuth(LVIEW: "signin" | "forgot", LMSG: [string,string] | null): void {
      const c = document.getElementById('lcard'); if (!c) return; const msg = LMSG ? `<div class="${LMSG[0]}" role="alert">${LMSG[1]}</div>` : '';
      if (LVIEW === 'forgot') { c.innerHTML = `<h1>Reset your password</h1><p class="sub">Enter your work email and we’ll send you a reset link.</p>${msg}<form onsubmit="forgot(event)" novalidate><label class="field">Work email<input class="input" id="fe" type="email" autocomplete="username" placeholder="name@brightcone.ai" required></label><button class="btn primary block" type="submit">Send reset link</button></form><div class="or">or</div><button class="btn block" onclick="LVIEW='signin';LMSG=null;renderLogin()">Back to sign in</button>`; setTimeout(() => document.getElementById('fe')?.focus(), 30); return }
      c.innerHTML = `<h1>Sign in</h1><p class="sub">Use your Brightcone work email. You’ll see the pages for your role.</p>${msg}
 <form onsubmit="doLogin(event)" novalidate>
  <label class="field">Work email<input class="input" id="le" type="email" autocomplete="username" placeholder="name@brightcone.ai" required></label>
  <label class="field">Password<div class="pw"><input class="input" id="lpw" type="password" autocomplete="current-password" placeholder="Your password" required><button type="button" onclick="const i=document.getElementById('lpw');i.type=i.type==='password'?'text':'password';this.textContent=i.type==='password'?'Show':'Hide'">Show</button></div></label>
  <div class="lrow"><label><input type="checkbox" id="lrem" checked> Keep me signed in</label><button type="button" class="link" onclick="LVIEW='forgot';LMSG=null;renderLogin()">Forgot password?</button></div>
  <button class="btn primary block" type="submit">Sign in</button>
 </form>
 <div class="or">or</div>
 <button class="btn block" onclick="LMSG=['lerr','Microsoft single sign-on isn’t connected in this prototype. Use your email and password.'];renderLogin()"><svg width="16" height="16" viewBox="0 0 23 23" aria-hidden="true"><path fill="#F25022" d="M1 1h10v10H1z"/><path fill="#7FBA00" d="M12 1h10v10H12z"/><path fill="#00A4EF" d="M1 12h10v10H1z"/><path fill="#FFB900" d="M12 12h10v10H12z"/></svg>Continue with Microsoft</button>
 <div class="demo"><p>Demo accounts. Click one to fill it in.</p>
  <button type="button" onclick="fillDemo('ananya.rao@brightcone.ai','Admin@123')"><b>HR Admin</b><span>ananya.rao@brightcone.ai, Admin@123</span></button>
  <button type="button" onclick="fillDemo('rahul.varma@brightcone.ai','Welcome@123')"><b>Employee</b><span>rahul.varma@brightcone.ai, Welcome@123</span></button>
  <p style="margin:8px 0 0">Any employee can sign in as firstname.lastname@brightcone.ai with Welcome@123.</p></div>`;
      setTimeout(() => document.getElementById('le')?.focus(), 30);
    }