window.EPS_LOCAL_DATA = {
  categories: [
    {
      title: "Public Square",
      description: "Main rooms for slower multilingual discussion.",
      forums: [
        {
          id: "governance",
          name: "Governance & Institutions",
          desc: "Public decisions, accountability, laws, institutions, and trust.",
          lang: "NL → EN",
          prompt: "Evidence prompt"
        },
        {
          id: "technology-ai",
          name: "Technology & AI",
          desc: "AI claims, digital tools, platform power, privacy, and safeguards.",
          lang: "DE → FR",
          prompt: "Boundary note"
        },
        {
          id: "local-questions",
          name: "Local Questions",
          desc: "Local issues explained across languages without turning them into a feed.",
          lang: "PL → ES",
          prompt: "Context prompt"
        }
      ]
    },
    {
      title: "Context Rooms",
      description: "Rooms for sources, translation meaning, and repair.",
      forums: [
        {
          id: "ask-sources",
          name: "Ask for Sources",
          desc: "Bring a strong claim and ask others to help find evidence, context, or missing caveats.",
          lang: "IT → EN",
          prompt: "Strong claim"
        },
        {
          id: "translation-meaning",
          name: "Translation & Meaning",
          desc: "Check whether tone, idiom, or political language survived translation.",
          lang: "NL → PT",
          prompt: "Translation caveat"
        },
        {
          id: "repair-clarify",
          name: "Repair & Clarify",
          desc: "Rewrite tense replies into calmer, clearer, more reviewable language.",
          lang: "FR → NL",
          prompt: "Repair option"
        }
      ]
    }
  ],
  threadsByForum: {
    governance: [
      {
        id: "appeal-ai",
        title: "Should public AI systems always show an appeal route?",
        author: "Mira",
        originalLanguage: "Spanish original",
        shownLanguage: "Shown in English",
        updated: "12 min ago",
        views: 312,
        prompt: "Human review reminder",
        posts: [
          {
            author: "Mira",
            country: "Spain",
            photo: null,
            role: "member",
            original: "¿Debe todo sistema público de IA mostrar una ruta clara para apelar una decisión?",
            translated: "Should every public AI system show a clear route to appeal a decision?",
            language: "ES → EN",
            prompt: "Clarify: what appeal route exists, who reviews it, and what evidence is visible?",
            receipt: "spc-demo-appeal-ai-001"
          },
          {
            author: "Elian",
            country: "Belgium",
            photo: null,
            role: "evidence reviewer",
            original: "A source note would help: what kind of public AI decision are we discussing?",
            translated: "A source note would help: what kind of public AI decision are we discussing?",
            language: "EN",
            prompt: "Clarify: scope needed before stronger claims.",
            receipt: "spc-demo-appeal-ai-002"
          }
        ]
      },
      {
        id: "local-budget",
        title: "How should local budget claims be sourced?",
        author: "Koen",
        originalLanguage: "Dutch original",
        shownLanguage: "Shown in English",
        updated: "48 min ago",
        views: 164,
        prompt: "Evidence prompt",
        posts: [
          {
            author: "Koen",
            country: "Netherlands",
            photo: null,
            role: "member",
            original: "De gemeente verspilt geld, maar ik weet niet waar ik de cijfers moet checken.",
            translated: "The municipality wastes money, but I do not know where to check the figures.",
            language: "NL → EN",
            prompt: "Clarify: strong integrity claim; ask for budget source before conclusion.",
            receipt: "spc-demo-budget-001"
          }
        ]
      }
    ],
    "technology-ai": [
      {
        id: "chatbot-pressure",
        title: "Can a chatbot pressure users without meaning to?",
        author: "Jonas",
        originalLanguage: "German original",
        shownLanguage: "Shown in English",
        updated: "31 min ago",
        views: 289,
        prompt: "Pressure prompt",
        posts: [
          {
            author: "Jonas",
            country: "Germany",
            photo: null,
            role: "member",
            original: "Wenn ein Bot sagt, dass ich sofort entscheiden muss, ist das Druck oder nur schlechter Text?",
            translated: "If a bot says I must decide immediately, is that pressure or just bad wording?",
            language: "DE → EN",
            prompt: "Clarify: urgency language may reduce freedom to pause; context still needed.",
            receipt: "spc-demo-chatbot-001"
          }
        ]
      }
    ],
    "local-questions": [
      {
        id: "transport-small-towns",
        title: "Public transport changes in small towns",
        author: "Ewa",
        originalLanguage: "Polish original",
        shownLanguage: "Shown in English",
        updated: "1 hr ago",
        views: 132,
        prompt: "Context prompt",
        posts: [
          {
            author: "Ewa",
            country: "Poland",
            photo: null,
            role: "member",
            original: "Czy ktoś może wyjaśnić, dlaczego zmieniono rozkład jazdy autobusów?",
            translated: "Can someone explain why the bus schedule was changed?",
            language: "PL → EN",
            prompt: "Clarify: local context and official source needed.",
            receipt: "spc-demo-transport-001"
          }
        ]
      }
    ],
    "ask-sources": [
      {
        id: "corruption-claim",
        title: "Is this corruption claim supported anywhere?",
        author: "Luca",
        originalLanguage: "Italian original",
        shownLanguage: "Shown in English",
        updated: "22 min ago",
        views: 481,
        prompt: "Strong claim",
        posts: [
          {
            author: "Luca",
            country: "Italy",
            photo: null,
            role: "member",
            original: "Ho visto un post che accusa un funzionario di corruzione, ma senza fonte.",
            translated: "I saw a post accusing an official of corruption, but without a source.",
            language: "IT → EN",
            prompt: "Clarify: do not treat allegation as established without evidence; ask for source and scope.",
            receipt: "spc-demo-corruption-001"
          },
          {
            author: "Nora",
            country: "Ireland",
            photo: null,
            role: "moderator",
            original: "Please discuss the claim structure without naming a private person unless there is a public source.",
            translated: "Please discuss the claim structure without naming a private person unless there is a public source.",
            language: "EN",
            prompt: "Moderator note: privacy/hard-boundary guard.",
            receipt: "mod-demo-corruption-002"
          }
        ]
      }
    ],
    "translation-meaning": [
      {
        id: "dutch-tone",
        title: "Does this Dutch phrase sound harsher in English?",
        author: "Anika",
        originalLanguage: "Dutch original",
        shownLanguage: "Shown in English",
        updated: "1 hr ago",
        views: 205,
        prompt: "Translation caveat",
        posts: [
          {
            author: "Anika",
            country: "Netherlands",
            photo: null,
            role: "member",
            original: "Doe normaal klinkt in het Engels soms harder dan bedoeld.",
            translated: "Act normal can sound harsher in English than intended.",
            language: "NL → EN",
            prompt: "Clarify: tone may shift in translation; view original before judging intent.",
            receipt: "spc-demo-translation-001"
          }
        ]
      }
    ],
    "repair-clarify": [
      {
        id: "disagree-calmly",
        title: "How can I disagree without escalating?",
        author: "Marie",
        originalLanguage: "French original",
        shownLanguage: "Shown in English",
        updated: "2 hr ago",
        views: 188,
        prompt: "Repair option",
        posts: [
          {
            author: "Marie",
            country: "France",
            photo: null,
            role: "member",
            original: "Je veux répondre fermement, mais sans aggraver la discussion.",
            translated: "I want to answer firmly, but without making the discussion worse.",
            language: "FR → EN",
            prompt: "Clarify: repair option requested; preserve boundary without insult.",
            receipt: "spc-demo-repair-001"
          }
        ]
      }
    ]
  }
};
