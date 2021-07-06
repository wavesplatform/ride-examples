**Rudechain** - Proof-of-Work блокчейн в виде dApp. Валюта - **Rude**.
Любая транзакция - это скрипт на специальном языке *RUDE*. Типов транзакций нет - поведение определяется скриптом.

**RUDE** - простой интерпретируемый язык. Сейчас поддерживает две операции:
1. `SEND recipient amount` - отправка _руды_ на другой аккаунт Rudechain-а.
2. `SWAP [IN/OUT] amount` - ввод _руды_ с Waves-аккаунта в его Rude-аккаунт и, наоборот, вывод _руды_ в соответствующий ассет блокчейна Waves.

В дальнейшем можно добавить в интерпретатор поддержку и других операций.

Клиент доступен по ссылке: http://rudechain.mak.im/ (или можно локально запустить из Docker образа) \
Для авторизации и регистрации **переключите Waves Keeper в режим Testnet!**

Кратко о том, как это работает:
1. для работы с Rudechain нужно выполнить регистрацию (стоит 5 Waves, чтобы не случилось спама учеток).
2. любая операция с блокчейном - через отправку InvokeScript транзакции.
3. чтобы смайнить новый блок, нужно перебрать `nonce` (тип Long) так, чтобы получившийся хеш нового блока начинался с нескольких (**difficulty**) нулевых байт.
4. каждый блок ссылается на высоту блокчейна Waves. На одной высоте можно смайнить только один блок.
5. каждая транзакция представляет из себя **RUDE** скрипт, исполняемый майнером. В зависимости от сложности скрипта транзакции взимается газ.
6. при отправке транзакции пользователь указывает, сколько газа готов заплатить. При попадании в блок списывается только фактически потраченный газ.
7. после отправки транзакция валидируется и кладется в **UTX**. При валидации проверяется баланс и корректность скрипта. Средства для транзакции резервируются до её попадания в блок.
8. текущий майнер может обрабатывать **UTX**, отправляя InvokeScript на каждую неподтвержденную транзакцию. При обработке скрипт прогоняется через интерпретатор **RUDE**, а результат исполнения фиксируется как разультат InvokeScript-а.
9. если смайнен новый блок, то майнер нового блока получает награду - _руду_. Старый блок фиксируется, а его автор получает половину газа, затраченного на транзакции в нем.
10. если блоки майнятся часто - **difficulty** растет, реже - **difficulty** падает.

Roadmap по дальнейшим улучшениям:   

Майнер
* сейчас есть баг, что неправильно считаются нулевые байты. В ближайшее время поправлю
* автоматизировать поведение майнера. Сейчас майнер не работает нонстоп, а разово выполняет попытку смайнить блок или обработать одну транзакцию из UTX (если аккаунт - майнер текущего блока)

Клиент
* выводить подробную информацию о выбранном блоке, в т.ч. список его транзакций
* выводить информацию о выбранном аккаунте

Язык RUDE
* поддержка последовательности команд в одном скрипте
* расширить набор команд
* возможно, сделать язык стековым

Блокчейн
* наверно стоит пересмотреть саму идею, сделать еще чуть серьезнее. Например, сейчас у транзакций нет id - они просто пакуются в блок
* выровнять расчет сложности
* возможно, заменить пазл (что-нибудь интереснее, чем считать первые нулевые байты)