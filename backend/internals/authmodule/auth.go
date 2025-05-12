package authmodule

type Auth[T any] interface {
	GetToken(payload T) (string, error)
	Validate(tokenStr string) (T, error)
}
