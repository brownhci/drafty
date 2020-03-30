package com.ajobs.domain;

public class CellKey<R,C> {
	private R row;
    private C col;

    public static <U1,U2> CellKey<U1,U2> create(U1 row, U2 col) {
        return new CellKey<U1,U2>(row,col);
    }

    public CellKey( ) {}

    public CellKey( R row, C col ) {
        this.row = row;
        this.col = col;
    }

    public R getrow( ) {
        return row;
    }

    public void setrow( R row ) {
        this.row = row;
    }

    public C getcol( ) {
        return col;
    }

    public void setcol( C col ) {
        this.col = col;
    }

    @Override
    public String toString( ) {
        return "CellKey [row=" + row + ", col=" + col + "]";
    }

    @Override
    public int hashCode( ) {
        final int prime = 31;
        int result = 1;
        result = prime * result + ((row == null)?0:row.hashCode());
        result = prime * result + ((col == null)?0:col.hashCode());
        return result;
    }

    @Override
    public boolean equals( Object obj ) {
        if ( this == obj )
            return true;
        if ( obj == null )
            return false;
        if ( getClass() != obj.getClass() )
            return false;
        CellKey<?, ?> other = (CellKey<?, ?>) obj;
        if ( row == null ) {
            if ( other.row != null )
                return false;
        }
        else if ( !row.equals(other.row) )
            return false;
        if ( col == null ) {
            if ( other.col != null )
                return false;
        }
        else if ( !col.equals(other.col) )
            return false;
        return true;
    }
}
