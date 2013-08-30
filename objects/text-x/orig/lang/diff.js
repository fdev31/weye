/**
 * Generic language patterns
 *
 * @author Craig Campbell
 * @version 1.0.10
 */
Rainbow.extend('diff', [
        {
            name: 'comment',
            pattern: /(diff|\+{3}|-{3}) .*/g
        },
        {
            name: 'comment',
            pattern: /\\ No newline at end of file/g
        },
        {
            name: 'added',
            pattern:RegExp('^[+].*', 'gm')
        },
        {
            name: 'removed',
            pattern: RegExp('^[-].*', 'gm')
        },
    ], true);
