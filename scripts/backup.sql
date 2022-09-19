USE dcms

SELECT
    (select
        table_name
    from
        `information_schema
`.`tables` 
    where 
        table_name = 'dcms'
    ).table_name
FROM
    dcms
INTO OUTFILE
    'C:\\ProgramData\\MySQL\\MySQL Server 8.0\\Uploads\\';