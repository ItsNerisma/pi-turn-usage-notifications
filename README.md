# @nerisma/pi-turn-usage-notifications

Affiche une **notification après chaque tour** dans [pi](https://pi.dev), avec
les métriques d'usage de la réponse de l'assistant :

```
> T1 · 0.186$ · OUT 7.79K · HIT 1.41M · MISS 79.60K
```

| Segment | Signification |
|---------|---------------|
| `T1`    | Numéro du tour |
| `0.186$`| Coût total du tour |
| `OUT`   | Tokens générés (output) |
| `HIT`   | Tokens lus depuis le cache (cache read) |
| `MISS`  | Tokens d'entrée non cachés (input) |

Les couleurs suivent le thème actif (`accent` / `muted` / `dim`).

## Installation

```bash
pi install npm:@nerisma/pi-turn-usage-notifications
```

Ou via `settings.json` :

```json
{
  "packages": ["npm:@nerisma/pi-turn-usage-notifications"]
}
```

## Fonctionnement

Branché sur l'événement `turn_end`, l'extension lit `event.message.usage` et
émet une ligne via `ctx.ui.notify(...)`. Les segments vides (coût nul, pas de
cache…) sont omis automatiquement.

## Compatibilité

- pi `>= 0.78`

## Licence

MIT © Nerisma
