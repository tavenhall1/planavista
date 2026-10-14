# Goal surprise (milestone 10, release 0.10.0)

## 1. Why

A member can pick a reward to save for (their goal, spec 8.15). When their stars reach its price, PlanaVista only changes the words to "Enough stars!". For a small child that is the biggest moment the board has, and it passes unseen: stars usually land while the child is away, from a parent's Looks good on their own phone, the 3 AM day-end approval, or bonus stars. A celebration at that moment plays to an empty kitchen.

So the celebration waits for the child: a wrapped surprise sits on their screen until they open it.

## 2. Decisions (agreed with the owner, 2026-10-13)

- **D1. A waiting surprise.** Reaching a goal wraps a surprise. It waits on the child's screen until they open it, for days if it has to. Celebrating at the check-off that would reach the goal was rejected: it celebrates stars a parent might still send back (spec 11.5: celebrations are earned).
- **D2. From any source.** A parent's approval, the day-end approval, bonus stars, a lowered price, or picking a goal already in reach all wrap it.
- **D3. Kept in Home Assistant.** Every screen shows the same surprise, and it opens once. If the stars drop back under the price or the goal changes, it is set aside quietly and comes back as it was (opened or not, with no second note to the parents) when the goal is in reach again; switching between goals keeps each goal's surprise the same way. Only spending stars clears the slate: once the goal is out of reach after a reward is given, reaching it again wraps a new surprise. A deleted reward's surprise goes for good (round 3).
- **D4. Where it waits.** First in the child's column on the Board, then the top of their My day, and their goal card in Rewards.
- **D5. Excited while it waits.** About every 4 seconds it wiggles and hops, with a few sparkles around the bow, then rests. It pauses while the page is hidden.
- **D6. Opened by a hold, on the child's screen.** The same hold as a chore tile (spec 11.5), to build anticipation and stop accidental taps. It opens on a shared screen or the child's own login. On anyone else's login (a parent's phone) it shows "Waiting for Dana to open it" and can't be held. A household with no shared screens lets any login open it, or nobody could.
- **D7. The hold is part of the reveal.** As the hold fills, the present shakes harder and starts to rise; a finished hold flows straight into the full-screen opening without a cut. Letting go early settles it back.
- **D8. A full-screen reveal.** The present grows to the middle, shakes, the lid pops, confetti in the child's color and gold stars burst across the screen, and the reward's picture rises out with "Dana, you did it!" and the reward's name. Then the reward's button (Ask for it, or Get it when it needs no approval) and Later. A tap skips to the end.
- **D9. Afterwards.** The goal card shows "Enough stars!", its button, and Watch it again (a sibling may have opened it first).
- **D10. Gentler settings.** Reduced motion: a soft glow and a fade to the reward's picture, no confetti or flight. Sound only when the household turned it on. A richer haptic where the device allows.
- **D11. Parents hear about it.** When a surprise is wrapped, parents with phones get a notification ("Dana reached a goal: 🍦 Ice cream trip"), and the member's chores event entity reports `goal_reached` for automations.

## 3. Behavior

### 3.1 Wrapping

After every change to chores data (any action, the day's boundary, a reward edit, a member sync after a goal change), the engine settles each member's surprise:

- The member's goal is a reward that exists, is for them (`who` empty or naming them), and their balance is at least its cost: if they have no surprise for that reward, one is wrapped (`wrapped` stamped, `opened` null) and a `goal_reached` event is fired once.
- Otherwise their surprise, opened or not, is removed. So spending the stars and saving again for the same reward wraps a new one.
- A surprise for the current goal stays as it is (a price raised while the balance still covers it keeps it).

### 3.2 Where it waits

- **Board, picture-tile column** (young children): a tile the size of their chore tiles, first in the grid: a present drawn in the child's color with a gold bow, "A surprise for Dana!", and "Hold me" under it.
- **Board, list column** (everyone else): a row at the top of the column with the present in the hold circle, "A surprise for Casey!" and "Hold to open".
- **My day:** the same tile at the top.
- **Rewards:** the goal card shows the present and opens the same way.
- An opened surprise leaves the Board and My day; the goal card keeps "Enough stars!" and Watch it again.

### 3.3 The excited wait

Every 4 seconds (offset per member so two presents don't move in step): a wiggle of about 7 degrees each way and a 6 px hop on the bouncy spring, about 700 ms, with three sparkles twinkling around the bow. Only transform and opacity animate. It stops while the page is hidden (an open sheet's backdrop covers it anyway), and starts again after. Reduced motion: a slow glow (opacity) instead.

### 3.4 Who opens it

- The card offers the hold when this login is a shared screen (kind shared or other), or is the surprise's member's own login, or the household has no shared screens. Otherwise: "Waiting for Dana to open it", not holdable.
- The backend checks the same rule on `planavista/chores/surprise/open` and refuses with `not_their_screen` ("Only Dana's own screen or a shared screen opens this."). Opening an already opened surprise answers `opened` again (two screens finishing a hold at once both play it). No surprise: `no_surprise`.
- No PIN: it's the child's own moment, and opening changes nothing but the stamp.

### 3.5 The hold and the reveal

- **The hold** (550 ms, the hold gesture's rules: 12 px move cancels, pointer capture, Space or Enter): the ring around the present fills while the present's shake grows from nothing to about 6 degrees at a quickening pace and it rises up to 10 px and grows to 1.08. Release early: it springs back to rest.
- **The reveal** (about 4 seconds), on a full-screen layer above everything, Home Assistant's own bars included:
  1. 0 ms: the screen dims; the present flies from where it was to the middle and grows to about 40 percent of the screen's shorter side (gentle spring, 500 ms), still shaking.
  2. 500 ms: two big shakes.
  3. 1000 ms: the lid pops up and spins away (bouncy); confetti in the child's color and gold stars burst from the box across the screen (about 80 pieces, 1.8 s, falling with a little drift).
  4. 1200 ms: the reward's picture rises out of the box and grows (bouncy, 600 ms).
  5. 1600 ms: "Dana, you did it!" and the reward's name fade up.
  6. 2200 ms: the buttons appear: the reward's own button (Ask for it, or Get it when the reward needs no approval; it asks for a PIN where 9.5 says so) and Later.
- A tap anywhere before the end jumps to the end. The finger that finished the hold is not a tap: the layer only counts a press that began on it (`backdropTap`'s rule, from 1.5.4).
- The card asks the backend to open it when the hold finishes and plays at once; a refusal ends the reveal with the reason in a toast.

### 3.6 Afterwards

- Later closes the reveal. The reward's button works as the Rewards card's does today (a request waiting for approval, or given at once).
- Watch it again on the goal card replays the reveal from the card (no backend change), on any login.

### 3.7 Reduced motion, sound, haptics

- Reduced motion (the device or PlanaVista's Motion setting): the hold still fills the ring (it is the feedback) with no shake; the reveal fades the present to the reward's picture with a soft glow, then the words and buttons; no flight, lid, or confetti.
- Sound: the chores chime, only when the household turned sound on.
- Haptics: the richer pattern a closing ring uses, where `navigator.vibrate` exists.

### 3.8 Parents' notification and the event

- `goal_reached` joins the member's chores event entity's types, with `reward`, `reward_name`, `stars`.
- The notifier sends each parent with a linked phone one notification per wrap: title "Dana reached a goal", message "🍦 Ice cream trip. There's a surprise waiting on Dana's screen." No action buttons.

## 4. Data and interfaces

- **Rewards store** (`planavista.chores_rewards`): a new top-level `surprises: {member_id: {reward, cost, wrapped, opened}}`, normalized on load (bad entries dropped), kept as is by the normalizer otherwise. A step back to 1.6.x must keep the field on save (spec 7.8); the prototype checks the 1.6.2 normalizer does.
- **Engine:** `settle_surprises(now) -> Outcome` (pure rule of 3.1), called by the runtime before it applies an outcome and after a member sync; `open_surprise(now, *, member, by) -> Outcome`.
- **Feed:** each board member entry gains `surprise: {reward, opened}` or null; the card finds the reward's name and icon in the feed's rewards.
- **WebSocket:** `planavista/chores/surprise/open` `{member}` returns `{result: "opened"}`; refusals `no_surprise`, `not_their_screen`, through `send_refusal` and noted in the refusals log.
- **Diagnostics:** the count of surprises waiting and opened.
- **Event entity:** `goal_reached` in `EVENT_TYPES`.

## 5. Card structure

- `modules/chores/surprise-derive.ts` (pure, vitest): `surpriseOf(entry, rewards)`, `mayOpenSurprise(view, memberId)`, the words, `holdPose(fill)` (shake, rise, scale for a hold's fill), the reveal's timeline constants.
- `modules/chores/pv-surprise-present.ts`: the present (SVG box, lid, bow in the member's color), its idle wiggle, the hold and its pose; fires `pv-surprise-open` with its rectangle.
- `shell/pv-surprise-reveal.ts`: the full-screen layer, rendered by the card outside `ha-card` (whose `container-type` would otherwise contain a fixed layer), with the card's theme tokens. It plays the timeline, skips on a tap, and fires the reward's button or Later.
- The Board column, My day, and Rewards render the present where 3.2 says.

## 6. Edge cases

- Two children's goals reached at once: two presents, each opened on its own.
- A goal changed to a reward already in reach wraps at once.
- The present on two screens: once one opens it, the other's present goes on the next feed.
- A parent's phone sees "Waiting for Dana to open it"; Watch it again works there after it is opened.
- Chores turned off: no presents. Away members: their present waits.
- The page reloaded mid-reveal: the surprise is already opened; Watch it again replays it.

## 7. Testing

- **Backend** (`tests/test_surprise.py`): wrapping from approval, day-end approval, bonus stars, a lowered price, a goal set already in reach; set aside and back as it was after an uncheck, a price raised and lowered, stars taken and given back, or a goal changed and back; each goal wrapped once when switching; a new surprise only after spending; removal when a reward is deleted; one event per wrap; open on a shared screen, the child's own login, refused on a parent's own login, allowed when there are no shared screens; opening twice; the notification text and recipients; the store normalizer and a 1.6.2 round trip; diagnostics.
- **Card** (vitest): placement, who may open, words, `holdPose`, the timeline order, the skip guard, every place renders the present (source checks like `backdrop-tap.test.ts`), the reveal rendered outside `ha-card`.
- **Dev Home Assistant, like a real device:** Kitchen at iPad portrait and landscape and an iPhone with the insets and Safari's toolbar gap, light and dark, reduced motion; the hold with Safari's click sent to the element under the finger after the reveal opens (it must not skip or press a button); a parent's own login; two screens at once; the reveal over Home Assistant's own bars when kiosk mode is off.
- Then the adversarial review loop.

## 8. Not in this milestone

- Surprises for anything but goals (a streak, a family goal).
- Choosing the present's look or the reveal's music.
