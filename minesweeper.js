$(document).ready(function()
{
    $('#game').hide();
    $('#maybe').hide();
    $('#btn_start').on('click', init);
    $('#game').on('contextmenu', function() { return false; });
    $('#game').on('contextmenu',rightButton);
    $('#game').on('click',leftButton);
});


function init()
{
    var rows=$('#rows').val();
    var cols=$('#cols').val();
    var mines=$('#mines').val();
    if(!(1<=rows<=20 && 1<=cols<=20 && 0<=mines<=(rows*mines))){
        $('#game').hide();
        $('#error').show();
        $('#error').html('Krivi unos!');
    }
    else
    {
        localStorage.setItem("rows",rows);
        localStorage.setItem("cols",cols);
        localStorage.setItem("mines",mines);

        $.ajax(
        {
            url: 'https://rp2.studenti.math.hr/~zbujanov/dz4/id.php',
            data:
            {
                nRows: rows,
                nCols: cols,
                nMines: mines
            },
            success: function(data)
            {
                if(data.hasOwnProperty('error'))
                {
                    $('#error').html(data.error);
                    $('#game').hide();
                    $('#error').show();
                }
                else if(data.hasOwnProperty('id'))
                {
                    localStorage.setItem("id",data.id);
                    $('#error').val('');
                    $('#error').hide();
                    newBoard();
                }
                console.log(localStorage.getItem("id"));
            },
            error: function()
            {
                console.log("Greska u Ajaxu!");
            }
        });
        $('h3').hide();
        $('#maybe').show();
        $('#maybe').html(mines);
    }
}

function newBoard()
{
    sessionStorage.clear();
    var rows=localStorage.getItem("rows");
    var cols=localStorage.getItem("cols");
    $('#game').show();
    var ctx = $( "#game" ).get(0).getContext( "2d" );
    ctx.canvas.width=cols*30;
    ctx.canvas.height=rows*30;
    for( var x = 0; x < cols; ++x )
        for( var y = 0; y < rows; ++y )
        {
            ctx.fillStyle = "rgb(89, 89, 89)";
            ctx.fillRect(x*30,y*30,30,30);
            var key=x+"_"+y;
            sessionStorage.setItem(key,"x");
        }
    grid();
}

function rightButton(event)
{
    var cnv=$('#game').get(0);
    var ctx=cnv.getContext('2d');

    var rect = cnv.getBoundingClientRect();
    var x=event.clientX-rect.left,
        y=event.clientY-rect.top;
        
    // odredi koje polje je kliknuto
    var col=Math.floor(x/30),
        row=Math.floor(y/30);

    fillTile(col,row,"?");
}

function leftButton(event)
{
    var cnv=$('#game').get(0);

    var rect = cnv.getBoundingClientRect();
    var x=event.clientX-rect.left,
        y=event.clientY-rect.top;
        
    // odredi koje polje je kliknuto
    var _col=Math.floor(x/30),
        _row=Math.floor(y/30);

    // ako smo kliknuli na polje s ? ništa se ne dogodi
    var key=_col+"_"+_row;
    var p=sessionStorage.getItem(key);
    if(p==="?")
        return;
    
    var rows=localStorage.getItem("rows");
    var cols=localStorage.getItem("cols");
        
    if(x>(cols*30))
        _col=cols;
    if(y>(rows*30))
        _row=rows;

    if(event.button===0)
    {
        var _id=localStorage.getItem("id");
        $.ajax(
            {
                url: 'https://rp2.studenti.math.hr/~zbujanov/dz4/cell.php',
                data:
                {
                    id: _id,
                    row: _row,
                    col: _col
                },
                success: function(data)
                {
                    if(data.hasOwnProperty('error'))
                    {
                        $('#error').html(data.error);
                        $('#error').show();
                    }
                    else 
                    {
                        $('#error').val('');
                        $('#error').hide();
                        var boom=data.boom;
                        var cells=data.cells;
                        allTile(boom, cells);
                    }
                    console.log(localStorage.getItem("id"));
                },
                error: function()
                {
                    console.log("Greska u Ajaxu!");
                }
            })
    }
}

// prelazi po svim dobivenim poljima
function allTile(boom,cells)
{
    if(boom===true)
    {
        endGame();
    } 
    else
    {
        for(var i=0;i<cells.length;i++)
        {
            var cell=cells[i];      
            fillTile(cell['col'],cell['row'],cell['mines']);
        }
    } 
}

// popunjava određeno polje sa znakom i drugom bojom ako treba
function fillTile(col,row,symbol)
{
    var cnv=$('#game').get(0);
    var ctx=cnv.getContext('2d');
    var m_x=(col*30)+10,
        m_y=(row*30)+20;
    ctx.font = "bold 20px Arial";
    
    if(symbol!==0)
    {
        var key=col+"_"+row
        var p=sessionStorage.getItem(key);   
        if(p==="x") // bilo koji symbol se unosi
        {
            if(symbol!=="?")
            {
                ctx.fillStyle = "rgb(179, 179, 179)";
                ctx.fillRect(col*30,row*30,30,30);
            }
            else
            {
                var how_much=$('#maybe').html();
                how_much--;
                $('#maybe').html(how_much);
            }

            if(symbol===1)
                ctx.fillStyle = "blue";
            else if(symbol===2)
                ctx.fillStyle = "red";
            else if(symbol===3)
                ctx.fillStyle = "green";
            else
                ctx.fillStyle = "black";
            
            ctx.fillText(symbol,m_x,m_y);
            sessionStorage.setItem(key,symbol);
        } 
        else if(p!=="x" && p!=="?" && symbol!=="?") // ako smo kliknuli na polje gdje već ima broj ili 0 -> upiše isti broj
        {
            if(symbol===1)
                ctx.fillStyle = "blue";
            else if(symbol===2)
            ctx.fillStyle = "red";
            else if(symbol===3)
                ctx.fillStyle = "green";
            else
                ctx.fillStyle = "black";

            ctx.fillText(p,m_x,m_y);
        } 
        else if(p==="?" && symbol==="?") // ako smo kliknuli desnim klikom na polje gdje je već ? -> makne ga
        {
            ctx.fillStyle = "rgb(89, 89, 89)";
            ctx.fillRect(col*30,row*30,30,30);
            sessionStorage.setItem(key,"x");
            
            var how_much=$('#maybe').html();
            console.log(how_much);

            how_much++;
            $('#maybe').html(how_much);


        }
        else if(symbol===0)
        {
            ctx.fillStyle = "rgb(179, 179, 179)";
            ctx.fillRect(col*30,row*30,30,30);
        }
         
    }

    if(symbol===0)
    {
        ctx.fillStyle = "rgb(179, 179, 179)";
        ctx.fillRect(col*30,row*30,30,30);
        var key=col+"_"+row;
        sessionStorage.setItem(key,symbol);
    }    
    grid(); 
    if(isFinish()===true)
        victory();
}

function isFinish()
{
    var rows=localStorage.getItem("rows");
    var cols=localStorage.getItem("cols");
    var mines=localStorage.getItem("mines");
    var cnt=0;
    for( var x = 0; x < cols; ++x )
        for( var y = 0; y < rows; ++y )
        {
            var key=x+"_"+y;
            var symbol=sessionStorage.getItem(key);
            if(symbol!=="?" && symbol!=="x")
                cnt++;
        }

    console.log((rows*cols)-mines);
    if(cnt===((rows*cols)-mines))
        return true;
    return false;
}

function endGame()
{
    var new_game=confirm('Izgubili ste! Pokušajte ponovo klikom na OK!');
    if(new_game==true)
        init();
    else
    {
        $('#game').hide();
        $('#maybe').hide();
        $('h3').show();
    }
}

function victory()
{   
    var new_game=confirm('Pobjedili ste! Započnite novu igru klikom na OK!');
    if(new_game==true)
        init();
    else
    {
        $('#game').hide();
        $('#maybe').hide();
        $('h3').show();
    }
}

function grid()
{
    var rows=localStorage.getItem("rows");
    var cols=localStorage.getItem("cols");
    var ctx = $( "#game" ).get(0).getContext( "2d" );
    for( var x = 0; x < cols; ++x )
        for( var y = 0; y < rows; ++y )
            ctx.strokeRect(x*30,y*30,30,30);
}


