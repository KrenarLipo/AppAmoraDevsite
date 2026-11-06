-- CreateEnum
CREATE TYPE "PostStatus" AS ENUM ('DRAFT', 'PUBLISHED');

-- CreateTable
CREATE TABLE "BlogPost" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "status" "PostStatus" NOT NULL DEFAULT 'DRAFT',
    "publishedAt" DATE NOT NULL,
    "tag" TEXT NOT NULL DEFAULT '',
    "cover" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BlogPost_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BlogPostTranslation" (
    "id" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "locale" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "body" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BlogPostTranslation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "BlogPost_slug_key" ON "BlogPost"("slug");

-- CreateIndex
CREATE INDEX "BlogPost_status_publishedAt_idx" ON "BlogPost"("status", "publishedAt");

-- CreateIndex
CREATE UNIQUE INDEX "BlogPostTranslation_postId_locale_key" ON "BlogPostTranslation"("postId", "locale");

-- AddForeignKey
ALTER TABLE "BlogPostTranslation" ADD CONSTRAINT "BlogPostTranslation_postId_fkey" FOREIGN KEY ("postId") REFERENCES "BlogPost"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Move the markdown posts from apps/web/content/blog into the database.
INSERT INTO "BlogPost" ("id", "slug", "status", "publishedAt", "tag", "updatedAt") VALUES ('seed_tasks_for_an_ai_agent', 'tasks-for-an-ai-agent', 'PUBLISHED', '2026-10-20', 'AI Agents', CURRENT_TIMESTAMP) ON CONFLICT ("slug") DO NOTHING;
INSERT INTO "BlogPostTranslation" ("id", "postId", "locale", "title", "description", "body", "updatedAt") SELECT 'seed_tasks_for_an_ai_agent_en', p."id", 'en', 'Tasks an AI agent can take off your plate', 'AI agents are not only chatbots. Here are practical jobs they handle well for small businesses today — and how to start without risk.', $md$When people hear "AI agent", they often picture a chatbot that answers questions badly. Modern agents are more useful than that: they can read your information, take actions in your tools and hand over to you when a decision is needed.

Here are jobs they already do well for small businesses.

## 1. Answering the same questions, every day

Opening hours, prices, parking, delivery areas, "do you have this in size M?". An agent trained on your own content answers instantly, in your customer's language, at 11pm on a Sunday.

## 2. Turning visitors into leads

Instead of a static contact form, an agent can ask the right follow-up questions — budget, timing, what exactly they need — and send you a short summary with the contact details. You call back the people who are ready.

## 3. Taking bookings

Connected to your calendar, an agent can offer free slots, confirm appointments and send reminders, so fewer people forget to show up.

## 4. Sorting your inbox

Agents can read incoming email, label it (quote request, complaint, invoice, spam) and draft replies for you to approve.

## 5. Keeping data in sync

New order in the shop? Add the customer to the newsletter, create the invoice draft, update the stock sheet. These small, boring steps are exactly what agents are good at.

## How to start safely

- **Start with one task.** Pick the most repetitive job, not the most impressive one.
- **Keep a human in the loop.** Let the agent draft and suggest before it acts on its own.
- **Use your own content.** An agent is only as good as the information you give it.
- **Measure.** Count the questions answered and the hours saved after a month.

*Curious which tasks in your business an agent could handle? [Book a free call](/en/contact).*
$md$, CURRENT_TIMESTAMP FROM "BlogPost" p WHERE p."slug" = 'tasks-for-an-ai-agent' ON CONFLICT ("postId", "locale") DO NOTHING;
INSERT INTO "BlogPost" ("id", "slug", "status", "publishedAt", "tag", "updatedAt") VALUES ('seed_vibe_coding_weekend_web_app', 'vibe-coding-weekend-web-app', 'PUBLISHED', '2026-10-27', 'Vibe Coding', CURRENT_TIMESTAMP) ON CONFLICT ("slug") DO NOTHING;
INSERT INTO "BlogPostTranslation" ("id", "postId", "locale", "title", "description", "body", "updatedAt") SELECT 'seed_vibe_coding_weekend_web_app_en', p."id", 'en', 'From idea to web app in a weekend', 'Vibe coding lets small teams build real software with AI. What it is, what it is good for, and where you still need an experienced developer.', $md$"Vibe coding" started as a joke and became a real way of building software. The idea is simple: instead of writing every line of code by hand, you describe what you want, an AI model writes most of the code, and you steer — testing, correcting and refining until it works.

For small businesses, this changes the maths of custom software. Tools that used to cost months of development can now be prototyped in days.

## What vibe coding is great for

- **Testing an idea.** A clickable prototype you can show to customers before investing more.
- **Replacing spreadsheets.** That booking sheet everyone edits and nobody trusts can become a small, proper app.
- **Campaign pages.** A landing page for a launch, an event or a seasonal offer — live in time.
- **Connecting tools.** Moving data between your shop, your email list and your accounting software automatically.

## Where you still need experience

AI writes code fast, but it does not know your business, and it does not take responsibility for what it ships. The parts that still need a human who knows what they are doing:

1. **Security.** Logins, payments and personal data need careful review.
2. **Architecture.** Fast code that cannot grow becomes expensive later.
3. **Maintenance.** Someone has to understand the code six months from now.

That is how we work at AppAmora: AI does the heavy lifting, experienced developers make the decisions and review everything before it goes live. You get the speed without the mess.

## A typical weekend build

- **Friday:** we agree on the one problem the app must solve, and sketch the screens.
- **Saturday:** AI-assisted build of the first working version.
- **Sunday:** testing with real data, fixes, and a first deploy you can use on Monday.

Not every project fits in a weekend — but most first versions fit in a week.

*Have an idea you would like to test? [Tell us about it](/en/contact).*
$md$, CURRENT_TIMESTAMP FROM "BlogPost" p WHERE p."slug" = 'vibe-coding-weekend-web-app' ON CONFLICT ("postId", "locale") DO NOTHING;
INSERT INTO "BlogPost" ("id", "slug", "status", "publishedAt", "tag", "updatedAt") VALUES ('seed_what_is_ai_seo', 'what-is-ai-seo', 'PUBLISHED', '2026-11-03', 'AI SEO', CURRENT_TIMESTAMP) ON CONFLICT ("slug") DO NOTHING;
INSERT INTO "BlogPostTranslation" ("id", "postId", "locale", "title", "description", "body", "updatedAt") SELECT 'seed_what_is_ai_seo_en', p."id", 'en', 'What AI SEO means for local businesses', 'People now ask ChatGPT, Gemini and Perplexity where to eat, who to hire and what to buy. Here is how to make sure they recommend you.', $md$For twenty years, being found online meant one thing: ranking on Google. That is still important — but a growing share of people now skip the list of links and ask an AI assistant directly. *"Find me a good accountant in Tirana who speaks Italian."* *"Which gym near me has evening classes?"*

The assistant answers with a few names. If yours is not one of them, that customer never sees you.

## How AI assistants decide who to recommend

AI assistants build their answers from what they can read and trust on the web. In practice that means:

- **Your own website** — clear pages that say what you do, where, for whom and at what price.
- **Structured data** — small pieces of code that tell machines "this is a business, this is its address, these are its opening hours".
- **What others say about you** — reviews, directories, articles and social profiles.
- **Consistency** — the same name, address and phone number everywhere.

## Five things you can do this month

1. **Write one clear page per service.** Not "Our services", but "Bookkeeping for restaurants in Durrës". Specific pages get quoted; vague ones get skipped.
2. **Answer real questions on your site.** Add a short FAQ with the questions customers actually ask you on the phone.
3. **Claim and complete your Google Business Profile.** Photos, hours, services, and replies to reviews.
4. **Publish in every language you sell in.** If half your customers speak Italian, an English-only site is invisible to them — and to the AI they ask.
5. **Add structured data.** Most website builders can do this for you; AppAmora sites include it by default.

## Where AI SEO is different from classic SEO

Classic SEO focuses on keywords and links. AI SEO adds a layer on top: your content has to be *easy to quote*. Short, factual sentences, clear headings and up-to-date information make it far more likely that an assistant will use your words in its answer.

The good news: none of this requires a big budget. It requires clarity — and that is something every small business can win on.

*Want us to check how visible your business is in AI answers? [Get in touch](/en/contact) for an AI SEO audit.*
$md$, CURRENT_TIMESTAMP FROM "BlogPost" p WHERE p."slug" = 'what-is-ai-seo' ON CONFLICT ("postId", "locale") DO NOTHING;

-- Blog covers used to live in the "images" setting, keyed by slug.
UPDATE "BlogPost" p SET "cover" = s."value"->'blogCovers'->p."slug"
FROM "SiteSetting" s
WHERE s."key" = 'images' AND jsonb_typeof(s."value"->'blogCovers'->p."slug") = 'object';

UPDATE "SiteSetting" SET "value" = "value" - 'blogCovers' WHERE "key" = 'images';
